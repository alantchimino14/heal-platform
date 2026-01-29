import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from 'database';

interface TransaccionExcel {
  fecha: string;
  hora?: string;
  numeroOperacion?: string;
  codigoAutorizacion?: string;
  tipoTarjeta?: string;
  ultimosDigitos?: string;
  monto: number;
  cuotas?: number;
}

@Injectable()
export class ConciliacionService {
  constructor(private prisma: PrismaService) {}

  // ============================================================================
  // IMPORTACIONES
  // ============================================================================

  async getImportaciones(params?: { limit?: number; offset?: number }) {
    const limit = params?.limit || 20;
    const offset = params?.offset || 0;

    const [data, total] = await Promise.all([
      this.prisma.importacionTransbank.findMany({
        skip: offset,
        take: limit,
        orderBy: { fechaImportacion: 'desc' },
        include: {
          _count: {
            select: { transacciones: true },
          },
        },
      }),
      this.prisma.importacionTransbank.count(),
    ]);

    return {
      data,
      meta: { total, limit, offset },
    };
  }

  async getImportacion(id: string) {
    const importacion = await this.prisma.importacionTransbank.findUnique({
      where: { id },
      include: {
        transacciones: {
          orderBy: { fechaTransaccion: 'desc' },
        },
      },
    });

    if (!importacion) {
      throw new NotFoundException(`Importación con ID ${id} no encontrada`);
    }

    return importacion;
  }

  async crearImportacion(
    nombreArchivo: string,
    transacciones: TransaccionExcel[],
  ) {
    // Calcular fechas y totales
    const fechas = transacciones.map((t) => new Date(t.fecha));
    const fechaDesde = new Date(Math.min(...fechas.map((d) => d.getTime())));
    const fechaHasta = new Date(Math.max(...fechas.map((d) => d.getTime())));
    const totalMonto = transacciones.reduce((sum, t) => sum + t.monto, 0);

    // Crear importación con transacciones
    const importacion = await this.prisma.importacionTransbank.create({
      data: {
        nombreArchivo,
        fechaDesde,
        fechaHasta,
        totalTransacciones: transacciones.length,
        totalMonto,
        transaccionesPendientes: transacciones.length,
        estado: 'PROCESANDO',
        transacciones: {
          createMany: {
            data: transacciones.map((t) => ({
              fechaTransaccion: new Date(t.fecha),
              numeroOperacion: t.numeroOperacion,
              codigoAutorizacion: t.codigoAutorizacion,
              tipoTarjeta: t.tipoTarjeta,
              ultimosDigitos: t.ultimosDigitos,
              monto: t.monto,
              cuotas: t.cuotas,
              estadoConciliacion: 'PENDIENTE',
            })),
          },
        },
      },
      include: {
        transacciones: true,
      },
    });

    // Intentar conciliación automática
    await this.conciliarAutomatico(importacion.id);

    // Actualizar estado
    return this.actualizarEstadoImportacion(importacion.id);
  }

  async actualizarEstadoImportacion(importacionId: string) {
    const stats = await this.prisma.transaccionTransbank.groupBy({
      by: ['estadoConciliacion'],
      where: { importacionId },
      _count: true,
    });

    const pendientes =
      stats.find((s) => s.estadoConciliacion === 'PENDIENTE')?._count || 0;
    const conciliadas =
      stats.find((s) => s.estadoConciliacion === 'CONCILIADA')?._count || 0;

    const total = stats.reduce((sum, s) => sum + s._count, 0);

    return this.prisma.importacionTransbank.update({
      where: { id: importacionId },
      data: {
        transaccionesConciliadas: conciliadas,
        transaccionesPendientes: pendientes,
        estado: pendientes === 0 ? 'COMPLETADA' : 'PROCESANDO',
      },
      include: {
        transacciones: {
          orderBy: { fechaTransaccion: 'desc' },
        },
      },
    });
  }

  // ============================================================================
  // CONCILIACIÓN
  // ============================================================================

  async conciliarAutomatico(importacionId: string) {
    const transacciones = await this.prisma.transaccionTransbank.findMany({
      where: {
        importacionId,
        estadoConciliacion: 'PENDIENTE',
      },
    });

    for (const transaccion of transacciones) {
      // Buscar pago coincidente por monto y fecha (mismo día, +/- 1 día)
      const fechaInicio = new Date(transaccion.fechaTransaccion);
      fechaInicio.setDate(fechaInicio.getDate() - 1);
      fechaInicio.setHours(0, 0, 0, 0);

      const fechaFin = new Date(transaccion.fechaTransaccion);
      fechaFin.setDate(fechaFin.getDate() + 1);
      fechaFin.setHours(23, 59, 59, 999);

      // Buscar en pagos
      const pago = await this.prisma.pago.findFirst({
        where: {
          monto: transaccion.monto,
          metodoPago: { in: ['REDCOMPRA_DEBITO', 'REDCOMPRA_CREDITO'] },
          fechaPago: {
            gte: fechaInicio,
            lte: fechaFin,
          },
        },
      });

      if (pago) {
        await this.prisma.transaccionTransbank.update({
          where: { id: transaccion.id },
          data: {
            estadoConciliacion: 'CONCILIADA',
            pagoIdConciliado: pago.id,
            fechaConciliacion: new Date(),
          },
        });
        continue;
      }

      // Buscar en ventas
      const venta = await this.prisma.venta.findFirst({
        where: {
          total: transaccion.monto,
          metodoPago: { in: ['REDCOMPRA_DEBITO', 'REDCOMPRA_CREDITO'] },
          fechaVenta: {
            gte: fechaInicio,
            lte: fechaFin,
          },
        },
      });

      if (venta) {
        await this.prisma.transaccionTransbank.update({
          where: { id: transaccion.id },
          data: {
            estadoConciliacion: 'CONCILIADA',
            ventaIdConciliada: venta.id,
            fechaConciliacion: new Date(),
          },
        });
      }
    }
  }

  async conciliarManual(
    transaccionId: string,
    data: {
      pagoId?: string;
      ventaId?: string;
      ignorar?: boolean;
      notas?: string;
    },
  ) {
    const transaccion = await this.prisma.transaccionTransbank.findUnique({
      where: { id: transaccionId },
    });

    if (!transaccion) {
      throw new NotFoundException('Transacción no encontrada');
    }

    if (data.ignorar) {
      return this.prisma.transaccionTransbank.update({
        where: { id: transaccionId },
        data: {
          estadoConciliacion: 'IGNORADA',
          notasConciliacion: data.notas,
          fechaConciliacion: new Date(),
        },
      });
    }

    if (data.pagoId) {
      const pago = await this.prisma.pago.findUnique({
        where: { id: data.pagoId },
      });
      if (!pago) {
        throw new BadRequestException('Pago no encontrado');
      }

      const diferencia = Number(transaccion.monto) - Number(pago.monto);

      return this.prisma.transaccionTransbank.update({
        where: { id: transaccionId },
        data: {
          estadoConciliacion: diferencia === 0 ? 'CONCILIADA' : 'DIFERENCIA',
          pagoIdConciliado: data.pagoId,
          diferenciaMonto: diferencia,
          notasConciliacion: data.notas,
          fechaConciliacion: new Date(),
        },
      });
    }

    if (data.ventaId) {
      const venta = await this.prisma.venta.findUnique({
        where: { id: data.ventaId },
      });
      if (!venta) {
        throw new BadRequestException('Venta no encontrada');
      }

      const diferencia = Number(transaccion.monto) - Number(venta.total);

      return this.prisma.transaccionTransbank.update({
        where: { id: transaccionId },
        data: {
          estadoConciliacion: diferencia === 0 ? 'CONCILIADA' : 'DIFERENCIA',
          ventaIdConciliada: data.ventaId,
          diferenciaMonto: diferencia,
          notasConciliacion: data.notas,
          fechaConciliacion: new Date(),
        },
      });
    }

    throw new BadRequestException('Debe especificar pagoId, ventaId o ignorar');
  }

  // ============================================================================
  // REPORTES
  // ============================================================================

  async getResumenConciliacion(params: { desde: string; hasta: string }) {
    const desde = new Date(params.desde);
    const hasta = new Date(params.hasta);
    hasta.setHours(23, 59, 59, 999);

    // Total Transbank
    const transacciones = await this.prisma.transaccionTransbank.findMany({
      where: {
        fechaTransaccion: { gte: desde, lte: hasta },
      },
    });

    const totalTransbank = transacciones.reduce(
      (sum, t) => sum + Number(t.monto),
      0,
    );
    const conciliadas = transacciones.filter(
      (t) => t.estadoConciliacion === 'CONCILIADA',
    );
    const pendientes = transacciones.filter(
      (t) => t.estadoConciliacion === 'PENDIENTE',
    );
    const conDiferencia = transacciones.filter(
      (t) => t.estadoConciliacion === 'DIFERENCIA',
    );

    // Total Heal (pagos + ventas con tarjeta)
    const [pagos, ventas] = await Promise.all([
      this.prisma.pago.findMany({
        where: {
          metodoPago: { in: ['REDCOMPRA_DEBITO', 'REDCOMPRA_CREDITO'] },
          fechaPago: { gte: desde, lte: hasta },
        },
      }),
      this.prisma.venta.findMany({
        where: {
          metodoPago: { in: ['REDCOMPRA_DEBITO', 'REDCOMPRA_CREDITO'] },
          fechaVenta: { gte: desde, lte: hasta },
          estado: 'COMPLETADA',
        },
      }),
    ]);

    const totalPagos = pagos.reduce((sum, p) => sum + Number(p.monto), 0);
    const totalVentas = ventas.reduce((sum, v) => sum + Number(v.total), 0);
    const totalHeal = totalPagos + totalVentas;

    return {
      periodo: { desde: params.desde, hasta: params.hasta },
      transbank: {
        total: totalTransbank,
        transacciones: transacciones.length,
        conciliadas: {
          total: conciliadas.reduce((sum, t) => sum + Number(t.monto), 0),
          cantidad: conciliadas.length,
        },
        pendientes: {
          total: pendientes.reduce((sum, t) => sum + Number(t.monto), 0),
          cantidad: pendientes.length,
        },
        conDiferencia: {
          total: conDiferencia.reduce((sum, t) => sum + Number(t.monto), 0),
          cantidad: conDiferencia.length,
        },
      },
      heal: {
        total: totalHeal,
        pagos: { total: totalPagos, cantidad: pagos.length },
        ventas: { total: totalVentas, cantidad: ventas.length },
      },
      diferencia: totalTransbank - totalHeal,
      porcentajeConciliado:
        transacciones.length > 0
          ? (conciliadas.length / transacciones.length) * 100
          : 0,
    };
  }

  async getTransaccionesPendientes(params?: { limit?: number }) {
    return this.prisma.transaccionTransbank.findMany({
      where: {
        estadoConciliacion: 'PENDIENTE',
      },
      orderBy: { fechaTransaccion: 'desc' },
      take: params?.limit || 50,
      include: {
        importacion: {
          select: { nombreArchivo: true },
        },
      },
    });
  }

  async getPagosParaConciliar(params: { fecha: string; monto?: number }) {
    const fecha = new Date(params.fecha);
    const fechaInicio = new Date(fecha);
    fechaInicio.setDate(fechaInicio.getDate() - 3);
    const fechaFin = new Date(fecha);
    fechaFin.setDate(fechaFin.getDate() + 3);

    const where: Prisma.PagoWhereInput = {
      metodoPago: { in: ['REDCOMPRA_DEBITO', 'REDCOMPRA_CREDITO'] },
      fechaPago: { gte: fechaInicio, lte: fechaFin },
    };

    if (params.monto) {
      where.monto = params.monto;
    }

    return this.prisma.pago.findMany({
      where,
      include: {
        paciente: { select: { firstName: true, lastName: true } },
      },
      orderBy: { fechaPago: 'desc' },
    });
  }
}
