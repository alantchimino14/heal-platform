import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from 'database';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  async findAll(params?: {
    search?: string;
    categoria?: string;
    isActive?: boolean;
  }) {
    const where: Prisma.ProductoWhereInput = {};

    if (params?.search) {
      where.OR = [
        { nombre: { contains: params.search, mode: 'insensitive' } },
        { codigo: { contains: params.search, mode: 'insensitive' } },
        { descripcion: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params?.categoria) {
      where.categoria = params.categoria;
    }

    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    return this.prisma.producto.findMany({
      where,
      orderBy: { nombre: 'asc' },
      include: {
        _count: {
          select: { ventaItems: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const producto = await this.prisma.producto.findUnique({
      where: { id },
      include: {
        ventaItems: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            venta: {
              select: {
                id: true,
                numeroVenta: true,
                fechaVenta: true,
                paciente: {
                  select: { id: true, firstName: true, lastName: true },
                },
              },
            },
          },
        },
        _count: {
          select: { ventaItems: true },
        },
      },
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return producto;
  }

  async create(data: {
    codigo?: string;
    nombre: string;
    descripcion?: string;
    categoria?: string;
    precio: number;
    costo?: number;
    stock?: number;
    stockMinimo?: number;
  }) {
    if (data.codigo) {
      const existing = await this.prisma.producto.findUnique({
        where: { codigo: data.codigo },
      });
      if (existing) {
        throw new BadRequestException(`Ya existe un producto con código ${data.codigo}`);
      }
    }

    return this.prisma.producto.create({ data });
  }

  async update(
    id: string,
    data: {
      codigo?: string;
      nombre?: string;
      descripcion?: string;
      categoria?: string;
      precio?: number;
      costo?: number;
      stock?: number;
      stockMinimo?: number;
      isActive?: boolean;
    },
  ) {
    await this.findOne(id);

    if (data.codigo) {
      const existing = await this.prisma.producto.findFirst({
        where: { codigo: data.codigo, NOT: { id } },
      });
      if (existing) {
        throw new BadRequestException(`Ya existe un producto con código ${data.codigo}`);
      }
    }

    return this.prisma.producto.update({ where: { id }, data });
  }

  async adjustStock(id: string, cantidad: number, motivo?: string) {
    const producto = await this.findOne(id);
    const nuevoStock = producto.stock + cantidad;

    if (nuevoStock < 0) {
      throw new BadRequestException('El stock no puede ser negativo');
    }

    return this.prisma.producto.update({
      where: { id },
      data: { stock: nuevoStock },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.producto.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getCategorias() {
    const productos = await this.prisma.producto.findMany({
      where: { isActive: true },
      select: { categoria: true },
      distinct: ['categoria'],
    });
    return productos.map(p => p.categoria).filter(Boolean);
  }

  async getStockBajo() {
    return this.prisma.$queryRaw`
      SELECT * FROM productos
      WHERE stock <= "stockMinimo"
      AND "isActive" = true
      ORDER BY stock ASC
    `;
  }
}
