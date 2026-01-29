import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CategoriaServicio } from 'database';

@Injectable()
export class ServiciosService {
  constructor(private prisma: PrismaService) {}

  async findAll(params?: {
    categoria?: CategoriaServicio;
    isActive?: boolean;
    search?: string;
  }) {
    const where: any = {};

    if (params?.categoria) {
      where.categoria = params.categoria;
    }

    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    if (params?.search) {
      where.OR = [
        { nombre: { contains: params.search, mode: 'insensitive' } },
        { codigo: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.servicio.findMany({
      where,
      orderBy: [{ categoria: 'asc' }, { nombre: 'asc' }],
      include: {
        preciosPorProfesional: {
          where: { isActive: true },
          include: {
            profesional: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
        _count: {
          select: { sesiones: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const servicio = await this.prisma.servicio.findUnique({
      where: { id },
      include: {
        preciosPorProfesional: {
          where: { isActive: true },
          include: {
            profesional: {
              select: { id: true, firstName: true, lastName: true, especialidad: true },
            },
          },
        },
        _count: {
          select: { sesiones: true },
        },
      },
    });

    if (!servicio) {
      throw new NotFoundException(`Servicio con ID ${id} no encontrado`);
    }

    return servicio;
  }

  async create(data: {
    nombre: string;
    codigo?: string;
    descripcion?: string;
    categoria?: CategoriaServicio;
    precio: number;
    duracionMinutos?: number;
  }) {
    if (data.codigo) {
      const existing = await this.prisma.servicio.findUnique({
        where: { codigo: data.codigo },
      });
      if (existing) {
        throw new BadRequestException(`Ya existe un servicio con código ${data.codigo}`);
      }
    }

    return this.prisma.servicio.create({
      data: {
        ...data,
        categoria: data.categoria || 'KINESIOLOGIA',
      },
    });
  }

  async update(
    id: string,
    data: {
      nombre?: string;
      codigo?: string;
      descripcion?: string;
      categoria?: CategoriaServicio;
      precio?: number;
      duracionMinutos?: number;
      isActive?: boolean;
    },
  ) {
    await this.findOne(id);

    if (data.codigo) {
      const existing = await this.prisma.servicio.findFirst({
        where: { codigo: data.codigo, NOT: { id } },
      });
      if (existing) {
        throw new BadRequestException(`Ya existe un servicio con código ${data.codigo}`);
      }
    }

    return this.prisma.servicio.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.servicio.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Precios personalizados por profesional
  async setPrecioProfesional(
    servicioId: string,
    profesionalId: string,
    precio: number,
  ) {
    // Verificar que existen
    await this.findOne(servicioId);
    const profesional = await this.prisma.profesional.findUnique({
      where: { id: profesionalId },
    });
    if (!profesional) {
      throw new NotFoundException(`Profesional ${profesionalId} no encontrado`);
    }

    return this.prisma.precioServicioProfesional.upsert({
      where: {
        servicioId_profesionalId: { servicioId, profesionalId },
      },
      update: { precio, isActive: true },
      create: { servicioId, profesionalId, precio },
      include: {
        profesional: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async removePrecioProfesional(servicioId: string, profesionalId: string) {
    return this.prisma.precioServicioProfesional.update({
      where: {
        servicioId_profesionalId: { servicioId, profesionalId },
      },
      data: { isActive: false },
    });
  }

  async getPrecioParaProfesional(servicioId: string, profesionalId: string) {
    const servicio = await this.findOne(servicioId);

    // Buscar precio personalizado
    const precioPersonalizado = await this.prisma.precioServicioProfesional.findUnique({
      where: {
        servicioId_profesionalId: { servicioId, profesionalId },
      },
    });

    if (precioPersonalizado?.isActive) {
      return Number(precioPersonalizado.precio);
    }

    // Retornar precio base
    return Number(servicio.precio);
  }

  async getCategorias() {
    return Object.values(CategoriaServicio);
  }
}
