import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { SesionesService } from '../sesiones/sesiones.service';
import { PacientesService } from '../pacientes/pacientes.service';
import {
  CreatePagoDto,
  AsignarPagoDto,
  ReembolsarPagoDto,
  PagoFiltersDto,
} from './dto/pago.dto';
import { PaginatedResponseDto } from '@/common/dto/pagination.dto';
import { Prisma } from 'database';

@Injectable()
export class PagosService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => SesionesService))
    private sesionesService: SesionesService,
    @Inject(forwardRef(() => PacientesService))
    private pacientesService: PacientesService,
  ) {}

  async findAll(filters: PagoFiltersDto) {
    const where: Prisma.PagoWhereInput = {};

    if (filters.pacienteId) where.pacienteId = filters.pacienteId;
    if (filters.metodoPago) where.metodoPago = filters.metodoPago;
    if (filters.estado) where.estado = filters.estado;
    if (filters.tipoPago) where.tipoPago = filters.tipoPago;

    if (filters.conSaldoDisponible) {
      where.saldoDisponible = { gt: 0 };
    }

    if (filters.fechaDesde || filters.fechaHasta) {
      where.fechaPago = {};
      if (filters.fechaDesde) where.fechaPago.gte = new Date(filters.fechaDesde);
      if (filters.fechaHasta) where.fechaPago.lte = new Date(filters.fechaHasta);
    }

    const [data, total] = await Promise.all([
      this.prisma.pago.findMany({
        where,
        skip: filters.skip,
        take: filters.take,
        orderBy: filters.sortBy
          ? { [filters.sortBy]: filters.sortOrder }
          : { fechaPago: 'desc' },
        include: {
          paciente: {
            select: { id: true, firstName: true, lastName: true, rut: true },
          },
          sesiones: {
            select: {
              sesionId: true,
              montoAplicado: true,
              sesion: {
                select: { fechaHora: true },
              },
            },
          },
        },
      }),
      this.prisma.pago.count({ where }),
    ]);

    return new PaginatedResponseDto(data, total, filters.page || 1, filters.limit || 20);
  }

  async findOne(id: string) {
    const pago = await this.prisma.pago.findUnique({
      where: { id },
      include: {
        paciente: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rut: true,
            email: true,
          },
        },
        sesiones: {
          select: {
            id: true,
            sesionId: true,
            montoAplicado: true,
            sesion: {
              select: {
                fechaHora: true,
                precioFinal: true,
                profesional: {
                  select: { firstName: true, lastName: true },
                },
                servicio: {
                  select: { nombre: true },
                },
              },
            },
          },
        },
      },
    });

    if (!pago) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }

    return pago;
  }

  async create(data: CreatePagoDto) {
    // Validar paciente
    const paciente = await this.prisma.paciente.findUnique({
      where: { id: data.pacienteId },
    });
    if (!paciente) {
      throw new BadRequestException('Paciente no encontrado');
    }

    // Validar sesiones si se especifican
    let totalAsignado = 0;
    if (data.sesiones && data.sesiones.length > 0) {
      for (const item of data.sesiones) {
        const sesion = await this.prisma.sesion.findUnique({
          where: { id: item.sesionId },
        });

        if (!sesion) {
          throw new BadRequestException(`Sesión ${item.sesionId} no encontrada`);
        }

        if (sesion.pacienteId !== data.pacienteId) {
          throw new BadRequestException(
            `Sesión ${item.sesionId} no pertenece al paciente`,
          );
        }

        // Validar que no se pague más del pendiente
        const pendiente = Number(sesion.precioFinal) - Number(sesion.montoPagado);
        if (item.monto > pendiente) {
          throw new BadRequestException(
            `El monto para sesión ${item.sesionId} excede el pendiente ($${pendiente})`,
          );
        }

        totalAsignado += item.monto;
      }

      if (totalAsignado > data.monto) {
        throw new BadRequestException(
          'El total asignado a sesiones excede el monto del pago',
        );
      }
    }

    // Determinar tipo de pago si no se especifica
    let tipoPago = data.tipoPago;
    if (!tipoPago) {
      if (!data.sesiones || data.sesiones.length === 0) {
        tipoPago = 'ANTICIPO';
      } else if (data.sesiones.length === 1) {
        tipoPago = 'SESION_INDIVIDUAL';
      } else {
        tipoPago = 'SESIONES_MULTIPLES';
      }
    }

    // Crear pago con transacción
    const pago = await this.prisma.$transaction(async (tx) => {
      // Crear el pago
      const nuevoPago = await tx.pago.create({
        data: {
          pacienteId: data.pacienteId,
          monto: data.monto,
          montoAplicado: totalAsignado,
          saldoDisponible: data.monto - totalAsignado,
          metodoPago: data.metodoPago,
          referencia: data.referencia,
          tipoPago,
          descripcion: data.descripcion,
          notas: data.notas,
          fechaPago: data.fechaPago ? new Date(data.fechaPago) : new Date(),
        },
      });

      // Crear asignaciones a sesiones
      if (data.sesiones && data.sesiones.length > 0) {
        await tx.pagoSesion.createMany({
          data: data.sesiones.map((s) => ({
            pagoId: nuevoPago.id,
            sesionId: s.sesionId,
            montoAplicado: s.monto,
          })),
        });
      }

      return nuevoPago;
    });

    // Actualizar estados de sesiones y saldo del paciente
    if (data.sesiones) {
      for (const s of data.sesiones) {
        await this.sesionesService.actualizarMontoPagado(s.sesionId);
      }
    }
    await this.pacientesService.actualizarSaldo(data.pacienteId);

    return this.findOne(pago.id);
  }

  // Asignar saldo disponible a sesiones
  async asignarASesiones(pagoId: string, data: AsignarPagoDto) {
    const pago = await this.findOne(pagoId);

    if (Number(pago.saldoDisponible) <= 0) {
      throw new BadRequestException('Este pago no tiene saldo disponible');
    }

    // Validar sesiones
    let totalAsignar = 0;
    for (const item of data.sesiones) {
      const sesion = await this.prisma.sesion.findUnique({
        where: { id: item.sesionId },
      });

      if (!sesion) {
        throw new BadRequestException(`Sesión ${item.sesionId} no encontrada`);
      }

      if (sesion.pacienteId !== pago.pacienteId) {
        throw new BadRequestException(
          `Sesión ${item.sesionId} no pertenece al paciente`,
        );
      }

      // Verificar si ya existe asignación
      const existente = await this.prisma.pagoSesion.findUnique({
        where: {
          pagoId_sesionId: { pagoId, sesionId: item.sesionId },
        },
      });

      if (existente) {
        throw new BadRequestException(
          `La sesión ${item.sesionId} ya tiene asignación de este pago`,
        );
      }

      totalAsignar += item.monto;
    }

    if (totalAsignar > Number(pago.saldoDisponible)) {
      throw new BadRequestException(
        `El total a asignar ($${totalAsignar}) excede el saldo disponible ($${pago.saldoDisponible})`,
      );
    }

    // Ejecutar asignación
    await this.prisma.$transaction(async (tx) => {
      // Crear asignaciones
      await tx.pagoSesion.createMany({
        data: data.sesiones.map((s) => ({
          pagoId,
          sesionId: s.sesionId,
          montoAplicado: s.monto,
        })),
      });

      // Actualizar pago
      await tx.pago.update({
        where: { id: pagoId },
        data: {
          montoAplicado: { increment: totalAsignar },
          saldoDisponible: { decrement: totalAsignar },
        },
      });
    });

    // Actualizar estados
    for (const s of data.sesiones) {
      await this.sesionesService.actualizarMontoPagado(s.sesionId);
    }
    await this.pacientesService.actualizarSaldo(pago.pacienteId);

    return this.findOne(pagoId);
  }

  // Reembolsar pago (parcial o total)
  async reembolsar(pagoId: string, data: ReembolsarPagoDto) {
    const pago = await this.findOne(pagoId);

    if (pago.estado !== 'CONFIRMADO') {
      throw new BadRequestException('Solo se pueden reembolsar pagos confirmados');
    }

    const montoDisponibleReembolso =
      Number(pago.monto) - Number(pago.montoAplicado) + Number(pago.saldoDisponible);

    if (data.monto > montoDisponibleReembolso) {
      throw new BadRequestException(
        `El monto a reembolsar excede el disponible ($${montoDisponibleReembolso})`,
      );
    }

    // Actualizar pago
    const esReembolsoTotal = data.monto >= Number(pago.monto);

    await this.prisma.pago.update({
      where: { id: pagoId },
      data: {
        estado: esReembolsoTotal ? 'REEMBOLSADO' : 'CONFIRMADO',
        saldoDisponible: { decrement: data.monto },
        notas: pago.notas
          ? `${pago.notas}\n[Reembolso: $${data.monto}${data.motivo ? ` - ${data.motivo}` : ''}]`
          : `[Reembolso: $${data.monto}${data.motivo ? ` - ${data.motivo}` : ''}]`,
      },
    });

    await this.pacientesService.actualizarSaldo(pago.pacienteId);

    return this.findOne(pagoId);
  }

  // Anular pago
  async anular(pagoId: string) {
    const pago = await this.findOne(pagoId);

    if (pago.estado !== 'CONFIRMADO' && pago.estado !== 'PENDIENTE') {
      throw new BadRequestException('Solo se pueden anular pagos confirmados o pendientes');
    }

    // Eliminar asignaciones a sesiones
    const sesionesAfectadas = pago.sesiones.map((s) => s.sesionId);

    await this.prisma.$transaction(async (tx) => {
      // Eliminar asignaciones
      await tx.pagoSesion.deleteMany({
        where: { pagoId },
      });

      // Anular pago
      await tx.pago.update({
        where: { id: pagoId },
        data: {
          estado: 'ANULADO',
          montoAplicado: 0,
          saldoDisponible: 0,
        },
      });
    });

    // Actualizar estados de sesiones
    for (const sesionId of sesionesAfectadas) {
      await this.sesionesService.actualizarMontoPagado(sesionId);
    }
    await this.pacientesService.actualizarSaldo(pago.pacienteId);

    return this.findOne(pagoId);
  }

  // Resumen de pagos por período
  async getResumen(fechaDesde: string, fechaHasta: string) {
    const where: Prisma.PagoWhereInput = {
      estado: 'CONFIRMADO',
      fechaPago: {
        gte: new Date(fechaDesde),
        lte: new Date(fechaHasta),
      },
    };

    const [total, porMetodo, porTipo] = await Promise.all([
      this.prisma.pago.aggregate({
        where,
        _sum: { monto: true },
        _count: true,
      }),
      this.prisma.pago.groupBy({
        by: ['metodoPago'],
        where,
        _sum: { monto: true },
        _count: true,
      }),
      this.prisma.pago.groupBy({
        by: ['tipoPago'],
        where,
        _sum: { monto: true },
        _count: true,
      }),
    ]);

    return {
      periodo: { desde: fechaDesde, hasta: fechaHasta },
      total: {
        monto: Number(total._sum.monto || 0),
        cantidad: total._count,
      },
      porMetodoPago: porMetodo.map((m) => ({
        metodo: m.metodoPago,
        monto: Number(m._sum.monto || 0),
        cantidad: m._count,
      })),
      porTipoPago: porTipo.map((t) => ({
        tipo: t.tipoPago,
        monto: Number(t._sum.monto || 0),
        cantidad: t._count,
      })),
    };
  }
}
