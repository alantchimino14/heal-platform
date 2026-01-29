import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getAdminDashboard(fechaDesde: string, fechaHasta: string) {
    const desde = new Date(fechaDesde);
    const hasta = new Date(fechaHasta);

    // KPIs principales
    const [
      ventasSesiones,
      cobranzas,
      deudaPendiente,
      saldosAFavor,
      sesionesPorEstado,
      pacientesActivos,
      pacientesNuevos,
    ] = await Promise.all([
      // Ventas (sesiones realizadas)
      this.prisma.sesion.aggregate({
        where: {
          estadoAtencion: 'REALIZADA',
          fechaHora: { gte: desde, lte: hasta },
        },
        _sum: { precioFinal: true },
        _count: true,
      }),

      // Cobranzas (pagos confirmados)
      this.prisma.pago.aggregate({
        where: {
          estado: 'CONFIRMADO',
          fechaPago: { gte: desde, lte: hasta },
        },
        _sum: { monto: true },
        _count: true,
      }),

      // Deuda pendiente (total)
      this.prisma.paciente.aggregate({
        where: { saldoPendiente: { gt: 0 } },
        _sum: { saldoPendiente: true },
        _count: true,
      }),

      // Saldos a favor (total)
      this.prisma.paciente.aggregate({
        where: { saldoAFavor: { gt: 0 } },
        _sum: { saldoAFavor: true },
        _count: true,
      }),

      // Sesiones por estado de pago
      this.prisma.sesion.groupBy({
        by: ['estadoPago'],
        where: {
          estadoAtencion: 'REALIZADA',
          fechaHora: { gte: desde, lte: hasta },
        },
        _count: true,
      }),

      // Pacientes activos (con sesiones en el período)
      this.prisma.paciente.count({
        where: {
          sesiones: {
            some: {
              fechaHora: { gte: desde, lte: hasta },
            },
          },
        },
      }),

      // Pacientes nuevos (creados en el período)
      this.prisma.paciente.count({
        where: {
          createdAt: { gte: desde, lte: hasta },
        },
      }),
    ]);

    // Distribución por método de pago
    const distribucionMetodoPago = await this.prisma.pago.groupBy({
      by: ['metodoPago'],
      where: {
        estado: 'CONFIRMADO',
        fechaPago: { gte: desde, lte: hasta },
      },
      _sum: { monto: true },
      _count: true,
    });

    // Top pacientes con deuda
    const topDeudores = await this.prisma.paciente.findMany({
      where: { saldoPendiente: { gt: 0 } },
      orderBy: { saldoPendiente: 'desc' },
      take: 10,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        rut: true,
        saldoPendiente: true,
      },
    });

    // Adherencia (sesiones realizadas vs no-show)
    const adherencia = await this.prisma.sesion.groupBy({
      by: ['estadoAgenda'],
      where: {
        fechaHora: { gte: desde, lte: hasta },
        estadoAgenda: { in: ['CONFIRMADA', 'NO_SHOW'] },
      },
      _count: true,
    });

    const realizadas = adherencia.find((a) => a.estadoAgenda === 'CONFIRMADA')?._count || 0;
    const noShow = adherencia.find((a) => a.estadoAgenda === 'NO_SHOW')?._count || 0;
    const tasaAdherencia =
      realizadas + noShow > 0 ? (realizadas / (realizadas + noShow)) * 100 : 100;

    return {
      periodo: { desde: fechaDesde, hasta: fechaHasta },
      kpis: {
        ventasTotales: Number(ventasSesiones._sum.precioFinal || 0),
        sesionesRealizadas: ventasSesiones._count,
        cobranzas: Number(cobranzas._sum.monto || 0),
        cantidadPagos: cobranzas._count,
        tasaCobranza:
          Number(ventasSesiones._sum.precioFinal || 0) > 0
            ? (Number(cobranzas._sum.monto || 0) /
                Number(ventasSesiones._sum.precioFinal || 1)) *
              100
            : 0,
        deudaPendiente: Number(deudaPendiente._sum.saldoPendiente || 0),
        pacientesConDeuda: deudaPendiente._count,
        saldosAFavor: Number(saldosAFavor._sum.saldoAFavor || 0),
        pacientesConSaldo: saldosAFavor._count,
        pacientesActivos,
        pacientesNuevos,
        tasaAdherencia: Math.round(tasaAdherencia * 10) / 10,
        tasaNoShow:
          realizadas + noShow > 0
            ? Math.round((noShow / (realizadas + noShow)) * 1000) / 10
            : 0,
      },
      sesionesPorEstadoPago: sesionesPorEstado.map((s) => ({
        estado: s.estadoPago,
        cantidad: s._count,
      })),
      distribucionMetodoPago: distribucionMetodoPago.map((d) => ({
        metodo: d.metodoPago,
        monto: Number(d._sum.monto || 0),
        cantidad: d._count,
      })),
      topDeudores: topDeudores.map((p) => ({
        id: p.id,
        nombre: `${p.firstName} ${p.lastName}`,
        rut: p.rut,
        deuda: Number(p.saldoPendiente),
      })),
    };
  }

  // Métricas del equipo (profesionales)
  async getMetricasEquipo() {
    const now = new Date();
    const mes = now.getMonth() + 1;
    const anio = now.getFullYear();

    // Obtener todos los profesionales activos con sus metas del mes
    const profesionales = await this.prisma.profesional.findMany({
      where: { isActive: true },
      include: {
        metasMensuales: {
          where: { mes, anio },
        },
        contratos: {
          where: { isActive: true },
          take: 1,
          orderBy: { fechaInicio: 'desc' },
        },
        _count: {
          select: { sesiones: true },
        },
      },
    });

    // Contar sesiones realizadas este mes por profesional
    const inicioMes = new Date(anio, mes - 1, 1);
    const finMes = new Date(anio, mes, 0, 23, 59, 59, 999);

    const sesionesDelMes = await this.prisma.sesion.groupBy({
      by: ['profesionalId'],
      where: {
        estadoAtencion: 'REALIZADA',
        fechaHora: { gte: inicioMes, lte: finMes },
      },
      _count: true,
    });

    const sesionesMap = new Map(
      sesionesDelMes.map((s) => [s.profesionalId, s._count]),
    );

    // Liquidaciones pendientes
    const liquidacionesPendientes = await this.prisma.liquidacion.findMany({
      where: {
        estado: { in: ['BORRADOR', 'PENDIENTE', 'APROBADA'] },
      },
      include: {
        profesional: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: [{ anio: 'desc' }, { mes: 'desc' }],
    });

    // Calcular métricas
    const equipoConMetas = profesionales.map((p) => {
      const meta = p.metasMensuales[0];
      const sesionesRealizadas = sesionesMap.get(p.id) || 0;
      const contrato = p.contratos[0];

      return {
        id: p.id,
        nombre: `${p.firstName} ${p.lastName}`,
        especialidad: p.especialidad,
        color: p.color,
        tipoContrato: contrato?.tipo || null,
        meta: meta
          ? {
              objetivo: meta.sesionesObjetivo,
              realizadas: sesionesRealizadas,
              cumplimiento: meta.sesionesObjetivo > 0
                ? Math.min((sesionesRealizadas / meta.sesionesObjetivo) * 100, 100)
                : 0,
              cumplida: sesionesRealizadas >= meta.sesionesObjetivo,
            }
          : null,
        sesionesDelMes: sesionesRealizadas,
      };
    });

    // Resumen general
    const conMeta = equipoConMetas.filter((p) => p.meta !== null);
    const cumplieron = conMeta.filter((p) => p.meta?.cumplida);
    const totalSesiones = equipoConMetas.reduce((sum, p) => sum + p.sesionesDelMes, 0);

    return {
      periodo: { mes, anio },
      resumen: {
        totalProfesionales: profesionales.length,
        conMeta: conMeta.length,
        cumplieronMeta: cumplieron.length,
        porcentajeCumplimiento: conMeta.length > 0
          ? (cumplieron.length / conMeta.length) * 100
          : 0,
        totalSesionesEquipo: totalSesiones,
      },
      equipo: equipoConMetas,
      liquidacionesPendientes: liquidacionesPendientes.map((l) => ({
        id: l.id,
        profesional: `${l.profesional.firstName} ${l.profesional.lastName}`,
        mes: l.mes,
        anio: l.anio,
        estado: l.estado,
        totalLiquido: Number(l.totalLiquido),
      })),
    };
  }

  // Resumen rápido para header/home
  async getResumenRapido() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const [sesionesHoy, sesionesProximas, deudaTotal, pagosHoy] = await Promise.all([
      this.prisma.sesion.count({
        where: {
          fechaHora: { gte: hoy, lt: manana },
          estadoAtencion: { in: ['PENDIENTE', 'EN_CURSO', 'REALIZADA'] },
        },
      }),
      this.prisma.sesion.count({
        where: {
          fechaHora: { gte: hoy },
          estadoAgenda: { in: ['AGENDADA', 'CONFIRMADA'] },
        },
      }),
      this.prisma.paciente.aggregate({
        where: { saldoPendiente: { gt: 0 } },
        _sum: { saldoPendiente: true },
      }),
      this.prisma.pago.aggregate({
        where: {
          estado: 'CONFIRMADO',
          fechaPago: { gte: hoy, lt: manana },
        },
        _sum: { monto: true },
        _count: true,
      }),
    ]);

    return {
      sesionesHoy,
      sesionesProximas,
      deudaTotal: Number(deudaTotal._sum.saldoPendiente || 0),
      pagosHoy: {
        monto: Number(pagosHoy._sum.monto || 0),
        cantidad: pagosHoy._count,
      },
    };
  }
}
