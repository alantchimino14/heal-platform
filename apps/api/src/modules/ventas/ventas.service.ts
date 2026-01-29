import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, MetodoPago, EstadoVenta } from 'database';

interface VentaItemInput {
  productoId: string;
  cantidad: number;
  precioUnit?: number;
  descuento?: number;
}

interface CreateVentaInput {
  pacienteId?: string;
  items: VentaItemInput[];
  descuento?: number;
  metodoPago: MetodoPago;
  referencia?: string;
  descripcion?: string;
  notas?: string;
}

@Injectable()
export class VentasService {
  constructor(private prisma: PrismaService) {}

  async findAll(params?: {
    search?: string;
    pacienteId?: string;
    metodoPago?: MetodoPago;
    estado?: EstadoVenta;
    desde?: string;
    hasta?: string;
    page?: number;
    limit?: number;
  }) {
    const where: Prisma.VentaWhereInput = {};
    const page = params?.page || 1;
    const limit = params?.limit || 20;

    if (params?.pacienteId) {
      where.pacienteId = params.pacienteId;
    }

    if (params?.metodoPago) {
      where.metodoPago = params.metodoPago;
    }

    if (params?.estado) {
      where.estado = params.estado;
    }

    if (params?.desde || params?.hasta) {
      where.fechaVenta = {};
      if (params?.desde) {
        where.fechaVenta.gte = new Date(params.desde);
      }
      if (params?.hasta) {
        const hasta = new Date(params.hasta);
        hasta.setHours(23, 59, 59, 999);
        where.fechaVenta.lte = hasta;
      }
    }

    if (params?.search) {
      where.OR = [
        { descripcion: { contains: params.search, mode: 'insensitive' } },
        { paciente: { firstName: { contains: params.search, mode: 'insensitive' } } },
        { paciente: { lastName: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.venta.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { fechaVenta: 'desc' },
        include: {
          paciente: {
            select: { id: true, firstName: true, lastName: true, rut: true },
          },
          items: {
            include: {
              producto: {
                select: { id: true, nombre: true, codigo: true },
              },
            },
          },
        },
      }),
      this.prisma.venta.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const venta = await this.prisma.venta.findUnique({
      where: { id },
      include: {
        paciente: {
          select: { id: true, firstName: true, lastName: true, rut: true, email: true, phone: true },
        },
        items: {
          include: {
            producto: true,
          },
        },
      },
    });

    if (!venta) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }

    return venta;
  }

  async create(data: CreateVentaInput) {
    // Validar que hay items
    if (!data.items || data.items.length === 0) {
      throw new BadRequestException('La venta debe tener al menos un item');
    }

    // Obtener productos y validar stock
    const productosIds = data.items.map(item => item.productoId);
    const productos = await this.prisma.producto.findMany({
      where: { id: { in: productosIds } },
    });

    const productosMap = new Map(productos.map(p => [p.id, p]));

    // Validar productos y stock
    for (const item of data.items) {
      const producto = productosMap.get(item.productoId);
      if (!producto) {
        throw new BadRequestException(`Producto ${item.productoId} no encontrado`);
      }
      if (!producto.isActive) {
        throw new BadRequestException(`Producto ${producto.nombre} no está activo`);
      }
      if (producto.stock < item.cantidad) {
        throw new BadRequestException(
          `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`,
        );
      }
    }

    // Calcular totales
    let subtotal = 0;
    const itemsData = data.items.map(item => {
      const producto = productosMap.get(item.productoId)!;
      const precioUnit = item.precioUnit ?? Number(producto.precio);
      const descuento = item.descuento ?? 0;
      const total = (precioUnit * item.cantidad) - descuento;
      subtotal += total;

      return {
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnit,
        descuento,
        total,
      };
    });

    const descuentoGeneral = data.descuento ?? 0;
    const total = subtotal - descuentoGeneral;

    // Crear venta y actualizar stock en transacción
    return this.prisma.$transaction(async (tx) => {
      // Obtener próximo número de venta
      const lastVenta = await tx.venta.findFirst({
        orderBy: { numeroVenta: 'desc' },
        select: { numeroVenta: true },
      });
      const numeroVenta = (lastVenta?.numeroVenta ?? 0) + 1;

      // Crear la venta
      const venta = await tx.venta.create({
        data: {
          numeroVenta,
          pacienteId: data.pacienteId || null,
          subtotal,
          descuento: descuentoGeneral,
          total,
          metodoPago: data.metodoPago,
          referencia: data.referencia,
          descripcion: data.descripcion,
          notas: data.notas,
          estado: 'COMPLETADA',
          items: {
            create: itemsData,
          },
        },
        include: {
          paciente: {
            select: { id: true, firstName: true, lastName: true },
          },
          items: {
            include: {
              producto: {
                select: { id: true, nombre: true, codigo: true },
              },
            },
          },
        },
      });

      // Actualizar stock de productos
      for (const item of data.items) {
        await tx.producto.update({
          where: { id: item.productoId },
          data: { stock: { decrement: item.cantidad } },
        });
      }

      return venta;
    });
  }

  async anular(id: string) {
    const venta = await this.findOne(id);

    if (venta.estado === 'ANULADA') {
      throw new BadRequestException('La venta ya está anulada');
    }

    // Anular y restaurar stock en transacción
    return this.prisma.$transaction(async (tx) => {
      // Restaurar stock
      for (const item of venta.items) {
        await tx.producto.update({
          where: { id: item.productoId },
          data: { stock: { increment: item.cantidad } },
        });
      }

      // Anular venta
      return tx.venta.update({
        where: { id },
        data: { estado: 'ANULADA' },
        include: {
          paciente: {
            select: { id: true, firstName: true, lastName: true },
          },
          items: {
            include: {
              producto: {
                select: { id: true, nombre: true, codigo: true },
              },
            },
          },
        },
      });
    });
  }

  async getResumen(params?: { desde?: string; hasta?: string }) {
    const where: Prisma.VentaWhereInput = {
      estado: 'COMPLETADA',
    };

    if (params?.desde || params?.hasta) {
      where.fechaVenta = {};
      if (params?.desde) {
        where.fechaVenta.gte = new Date(params.desde);
      }
      if (params?.hasta) {
        const hasta = new Date(params.hasta);
        hasta.setHours(23, 59, 59, 999);
        where.fechaVenta.lte = hasta;
      }
    }

    const ventas = await this.prisma.venta.findMany({
      where,
      select: {
        total: true,
        metodoPago: true,
      },
    });

    const resumen = {
      totalVentas: ventas.length,
      montoTotal: ventas.reduce((sum, v) => sum + Number(v.total), 0),
      porMetodo: {} as Record<string, { cantidad: number; monto: number }>,
    };

    for (const venta of ventas) {
      if (!resumen.porMetodo[venta.metodoPago]) {
        resumen.porMetodo[venta.metodoPago] = { cantidad: 0, monto: 0 };
      }
      resumen.porMetodo[venta.metodoPago].cantidad++;
      resumen.porMetodo[venta.metodoPago].monto += Number(venta.total);
    }

    return resumen;
  }
}
