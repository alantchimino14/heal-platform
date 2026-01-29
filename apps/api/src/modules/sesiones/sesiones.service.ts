import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CreateSesionDto,
  UpdateSesionDto,
  SesionFiltersDto,
  CalendarQueryDto,
} from './dto/sesion.dto';
import { PaginatedResponseDto } from '@/common/dto/pagination.dto';
import { Prisma } from 'database';

@Injectable()
export class SesionesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: SesionFiltersDto) {
    const where: Prisma.SesionWhereInput = {};

    if (filters.pacienteId) where.pacienteId = filters.pacienteId;
    if (filters.profesionalId) where.profesionalId = filters.profesionalId;
    if (filters.planTerapeuticoId) where.planTerapeuticoId = filters.planTerapeuticoId;
    if (filters.estadoAgenda) where.estadoAgenda = filters.estadoAgenda;
    if (filters.estadoAtencion) where.estadoAtencion = filters.estadoAtencion;
    if (filters.estadoPago) where.estadoPago = filters.estadoPago;
    if (filters.estadoBoleta) where.estadoBoleta = filters.estadoBoleta;

    if (filters.fechaDesde || filters.fechaHasta) {
      where.fechaHora = {};
      if (filters.fechaDesde) where.fechaHora.gte = new Date(filters.fechaDesde);
      if (filters.fechaHasta) where.fechaHora.lte = new Date(filters.fechaHasta);
    }

    const [data, total] = await Promise.all([
      this.prisma.sesion.findMany({
        where,
        skip: filters.skip,
        take: filters.take,
        orderBy: filters.sortBy
          ? { [filters.sortBy]: filters.sortOrder }
          : { fechaHora: 'desc' },
        include: {
          paciente: {
            select: { id: true, firstName: true, lastName: true, rut: true },
          },
          profesional: {
            select: { id: true, firstName: true, lastName: true },
          },
          servicio: {
            select: { id: true, nombre: true },
          },
          planTerapeutico: {
            select: { id: true, nombre: true },
          },
        },
      }),
      this.prisma.sesion.count({ where }),
    ]);

    return new PaginatedResponseDto(data, total, filters.page || 1, filters.limit || 20);
  }

  async findOne(id: string) {
    const sesion = await this.prisma.sesion.findUnique({
      where: { id },
      include: {
        paciente: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rut: true,
            email: true,
            phone: true,
          },
        },
        profesional: {
          select: { id: true, firstName: true, lastName: true, especialidad: true },
        },
        servicio: {
          select: { id: true, nombre: true, precio: true },
        },
        planTerapeutico: {
          select: { id: true, nombre: true, estado: true },
        },
        boleta: {
          select: { id: true, numero: true, fecha: true, montoTotal: true },
        },
        pagos: {
          select: {
            id: true,
            montoAplicado: true,
            createdAt: true,
            pago: {
              select: {
                id: true,
                numeroPago: true,
                fechaPago: true,
                metodoPago: true,
              },
            },
          },
        },
        logsClinicos: {
          select: {
            id: true,
            tipo: true,
            titulo: true,
            contenido: true,
            fecha: true,
          },
          orderBy: { fecha: 'desc' },
          take: 5,
        },
      },
    });

    if (!sesion) {
      throw new NotFoundException(`Sesión con ID ${id} no encontrada`);
    }

    return sesion;
  }

  async create(data: CreateSesionDto) {
    // Validar que existan paciente y profesional
    const [paciente, profesional] = await Promise.all([
      this.prisma.paciente.findUnique({ where: { id: data.pacienteId } }),
      this.prisma.profesional.findUnique({ where: { id: data.profesionalId } }),
    ]);

    if (!paciente) throw new BadRequestException('Paciente no encontrado');
    if (!profesional) throw new BadRequestException('Profesional no encontrado');

    const precioFinal = data.precioBase - (data.descuento || 0);

    return this.prisma.sesion.create({
      data: {
        pacienteId: data.pacienteId,
        profesionalId: data.profesionalId,
        servicioId: data.servicioId,
        planTerapeuticoId: data.planTerapeuticoId,
        fechaHora: new Date(data.fechaHora),
        duracionMinutos: data.duracionMinutos || 30,
        precioBase: data.precioBase,
        descuento: data.descuento || 0,
        precioFinal,
        motivoConsulta: data.motivoConsulta,
        observaciones: data.observaciones,
      },
      include: {
        paciente: { select: { id: true, firstName: true, lastName: true } },
        profesional: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async update(id: string, data: UpdateSesionDto) {
    await this.findOne(id);

    const updateData: Prisma.SesionUpdateInput = {};

    if (data.pacienteId) updateData.paciente = { connect: { id: data.pacienteId } };
    if (data.profesionalId) updateData.profesional = { connect: { id: data.profesionalId } };
    if (data.servicioId) updateData.servicio = { connect: { id: data.servicioId } };
    if (data.planTerapeuticoId) {
      updateData.planTerapeutico = { connect: { id: data.planTerapeuticoId } };
    }
    if (data.fechaHora) updateData.fechaHora = new Date(data.fechaHora);
    if (data.duracionMinutos) updateData.duracionMinutos = data.duracionMinutos;
    if (data.motivoConsulta !== undefined) updateData.motivoConsulta = data.motivoConsulta;
    if (data.observaciones !== undefined) updateData.observaciones = data.observaciones;
    if (data.diagnostico !== undefined) updateData.diagnostico = data.diagnostico;

    // Actualizar estados (sin restricción, libre)
    if (data.estadoAgenda) updateData.estadoAgenda = data.estadoAgenda;
    if (data.estadoAtencion) updateData.estadoAtencion = data.estadoAtencion;
    if (data.estadoPago) updateData.estadoPago = data.estadoPago;
    if (data.estadoBoleta) updateData.estadoBoleta = data.estadoBoleta;

    // Recalcular precio si cambia
    if (data.precioBase !== undefined || data.descuento !== undefined) {
      const sesion = await this.prisma.sesion.findUnique({ where: { id } });
      const precioBase = data.precioBase ?? Number(sesion!.precioBase);
      const descuento = data.descuento ?? Number(sesion!.descuento);
      updateData.precioBase = precioBase;
      updateData.descuento = descuento;
      updateData.precioFinal = precioBase - descuento;
    }

    return this.prisma.sesion.update({
      where: { id },
      data: updateData,
      include: {
        paciente: { select: { id: true, firstName: true, lastName: true } },
        profesional: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Verificar si tiene pagos asociados
    const pagosCount = await this.prisma.pagoSesion.count({
      where: { sesionId: id },
    });

    if (pagosCount > 0) {
      throw new BadRequestException(
        'No se puede eliminar una sesión con pagos asociados',
      );
    }

    return this.prisma.sesion.delete({ where: { id } });
  }

  // Para vista de calendario
  async getCalendar(query: CalendarQueryDto) {
    const where: Prisma.SesionWhereInput = {
      fechaHora: {
        gte: new Date(query.start),
        lte: new Date(query.end),
      },
    };

    if (query.profesionalId) {
      where.profesionalId = query.profesionalId;
    }

    const sesiones = await this.prisma.sesion.findMany({
      where,
      include: {
        paciente: { select: { firstName: true, lastName: true } },
        profesional: { select: { firstName: true, lastName: true, color: true } },
        servicio: { select: { nombre: true } },
      },
      orderBy: { fechaHora: 'asc' },
    });

    // Formatear para calendario (FullCalendar compatible)
    return sesiones.map((s) => ({
      id: s.id,
      title: `${s.paciente.firstName} ${s.paciente.lastName}`,
      start: s.fechaHora,
      end: new Date(s.fechaHora.getTime() + s.duracionMinutos * 60000),
      color: this.getColorByEstado(s.estadoPago, s.profesional.color),
      extendedProps: {
        pacienteId: s.pacienteId,
        profesionalId: s.profesionalId,
        profesional: `${s.profesional.firstName} ${s.profesional.lastName}`,
        servicio: s.servicio?.nombre,
        estadoAgenda: s.estadoAgenda,
        estadoAtencion: s.estadoAtencion,
        estadoPago: s.estadoPago,
        precioFinal: s.precioFinal,
      },
    }));
  }

  private getColorByEstado(estadoPago: string, defaultColor?: string | null): string {
    const colors: Record<string, string> = {
      PAGADA: '#22c55e', // green
      PAGO_PARCIAL: '#eab308', // yellow
      NO_PAGADA: '#ef4444', // red
      REEMBOLSADA: '#6b7280', // gray
    };
    return colors[estadoPago] || defaultColor || '#3b82f6';
  }

  // Actualizar monto pagado de una sesión
  async actualizarMontoPagado(sesionId: string) {
    const totalPagado = await this.prisma.pagoSesion.aggregate({
      where: { sesionId },
      _sum: { montoAplicado: true },
    });

    const sesion = await this.prisma.sesion.findUnique({
      where: { id: sesionId },
      select: { precioFinal: true },
    });

    const montoPagado = Number(totalPagado._sum.montoAplicado || 0);
    const precioFinal = Number(sesion?.precioFinal || 0);

    let estadoPago: 'NO_PAGADA' | 'PAGO_PARCIAL' | 'PAGADA' = 'NO_PAGADA';
    if (montoPagado >= precioFinal) {
      estadoPago = 'PAGADA';
    } else if (montoPagado > 0) {
      estadoPago = 'PAGO_PARCIAL';
    }

    await this.prisma.sesion.update({
      where: { id: sesionId },
      data: { montoPagado, estadoPago },
    });
  }
}
