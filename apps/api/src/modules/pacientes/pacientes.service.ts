import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreatePacienteDto, UpdatePacienteDto, PacienteFiltersDto } from './dto/paciente.dto';
import { PaginatedResponseDto } from '@/common/dto/pagination.dto';
import { Paciente, Prisma } from 'database';

@Injectable()
export class PacientesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: PacienteFiltersDto) {
    const where: Prisma.PacienteWhereInput = {};

    // Búsqueda por nombre, RUT o email
    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { rut: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Filtro por estado activo
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    // Filtro por deuda
    if (filters.hasDebt) {
      where.saldoPendiente = { gt: 0 };
    }

    // Filtro por profesional (pacientes que tienen sesiones con ese profesional)
    if (filters.profesionalId) {
      where.sesiones = {
        some: { profesionalId: filters.profesionalId },
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.paciente.findMany({
        where,
        skip: filters.skip,
        take: filters.take,
        orderBy: filters.sortBy
          ? { [filters.sortBy]: filters.sortOrder }
          : { updatedAt: 'desc' },
        include: {
          _count: {
            select: {
              sesiones: true,
              pagos: true,
              planesTerapeuticos: true,
            },
          },
        },
      }),
      this.prisma.paciente.count({ where }),
    ]);

    return new PaginatedResponseDto(data, total, filters.page || 1, filters.limit || 20);
  }

  async findOne(id: string) {
    const paciente = await this.prisma.paciente.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            sesiones: true,
            pagos: true,
            planesTerapeuticos: true,
            boletas: true,
          },
        },
      },
    });

    if (!paciente) {
      throw new NotFoundException(`Paciente con ID ${id} no encontrado`);
    }

    return paciente;
  }

  async create(data: CreatePacienteDto) {
    return this.prisma.paciente.create({
      data: {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
      },
    });
  }

  async update(id: string, data: UpdatePacienteDto) {
    await this.findOne(id); // Verificar que existe

    return this.prisma.paciente.update({
      where: { id },
      data: {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Soft delete
    return this.prisma.paciente.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Balance financiero del paciente
  async getBalance(id: string) {
    const paciente = await this.findOne(id);

    // Sesiones con deuda
    const sesionesConDeuda = await this.prisma.sesion.findMany({
      where: {
        pacienteId: id,
        estadoAtencion: 'REALIZADA',
        estadoPago: { in: ['NO_PAGADA', 'PAGO_PARCIAL'] },
      },
      select: {
        id: true,
        fechaHora: true,
        precioFinal: true,
        montoPagado: true,
        profesional: {
          select: { firstName: true, lastName: true },
        },
        servicio: {
          select: { nombre: true },
        },
      },
      orderBy: { fechaHora: 'asc' },
    });

    // Pagos con saldo disponible
    const pagosConSaldo = await this.prisma.pago.findMany({
      where: {
        pacienteId: id,
        estado: 'CONFIRMADO',
        saldoDisponible: { gt: 0 },
      },
      select: {
        id: true,
        numeroPago: true,
        fechaPago: true,
        saldoDisponible: true,
      },
    });

    const totalDeuda = sesionesConDeuda.reduce(
      (sum, s) => sum + (Number(s.precioFinal) - Number(s.montoPagado)),
      0,
    );

    const saldoAFavor = pagosConSaldo.reduce(
      (sum, p) => sum + Number(p.saldoDisponible),
      0,
    );

    return {
      pacienteId: id,
      paciente: {
        nombre: `${paciente.firstName} ${paciente.lastName}`,
        rut: paciente.rut,
      },
      totalDeuda,
      saldoAFavor,
      saldoNeto: totalDeuda - saldoAFavor,
      sesionesConDeuda: sesionesConDeuda.map((s) => ({
        id: s.id,
        fechaHora: s.fechaHora,
        profesional: `${s.profesional.firstName} ${s.profesional.lastName}`,
        servicio: s.servicio?.nombre,
        precioFinal: Number(s.precioFinal),
        montoPagado: Number(s.montoPagado),
        pendiente: Number(s.precioFinal) - Number(s.montoPagado),
      })),
      pagosConSaldo: pagosConSaldo.map((p) => ({
        id: p.id,
        numeroPago: p.numeroPago,
        fechaPago: p.fechaPago,
        saldoDisponible: Number(p.saldoDisponible),
      })),
    };
  }

  // Actualizar saldo del paciente (llamado después de pagos)
  async actualizarSaldo(pacienteId: string) {
    // Calcular deuda total
    const deudaResult = await this.prisma.sesion.aggregate({
      where: {
        pacienteId,
        estadoAtencion: 'REALIZADA',
        estadoPago: { in: ['NO_PAGADA', 'PAGO_PARCIAL'] },
      },
      _sum: {
        precioFinal: true,
        montoPagado: true,
      },
    });

    const deudaTotal =
      Number(deudaResult._sum.precioFinal || 0) - Number(deudaResult._sum.montoPagado || 0);

    // Calcular saldo a favor
    const saldoResult = await this.prisma.pago.aggregate({
      where: {
        pacienteId,
        estado: 'CONFIRMADO',
        saldoDisponible: { gt: 0 },
      },
      _sum: {
        saldoDisponible: true,
      },
    });

    const saldoAFavor = Number(saldoResult._sum.saldoDisponible || 0);

    await this.prisma.paciente.update({
      where: { id: pacienteId },
      data: {
        saldoPendiente: deudaTotal,
        saldoAFavor: saldoAFavor,
      },
    });
  }
}
