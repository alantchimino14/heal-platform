# Dashboards y Métricas - Heal Platform

## 1. Dashboard Administrativo

### 1.1 Vista General

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         DASHBOARD ADMINISTRATIVO                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  [Filtros: Fecha Desde ___ | Fecha Hasta ___ | Profesional ___ | Aplicar]      │
│                                                                                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │ Ventas Mes      │ │ Cobranzas       │ │ Deuda Pendiente │ │ Saldos a Favor  ││
│  │ $4.500.000      │ │ $4.200.000      │ │ $850.000        │ │ $120.000        ││
│  │ ↑ 7.14%         │ │ 93.3% del total │ │ 12 pacientes    │ │ 5 pacientes     ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘│
│                                                                                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │ Sesiones Mes    │ │ Pacientes       │ │ Tasa Adherencia │ │ Tasa No-Show    ││
│  │ 150 realizadas  │ │ 75 activos      │ │ 92.5%           │ │ 3.2%            ││
│  │ 45 agendadas    │ │ 12 nuevos       │ │ ↑ 2.1%          │ │ ↓ 0.8%          ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘│
│                                                                                  │
│  ┌────────────────────────────────────┐ ┌────────────────────────────────────┐  │
│  │     INGRESOS VS COBRANZAS          │ │      SESIONES POR ESTADO           │  │
│  │                                    │ │                                    │  │
│  │  $5M ┤                             │ │    ██████████████ Realizadas: 150 │  │
│  │      │    ╭────╮                   │ │    ██████████████ Pagadas: 140    │  │
│  │  $4M ┤   ╱      ╲  ╭──             │ │    █████ Pend. Pago: 10           │  │
│  │      │  ╱        ╲╱                │ │    ██████████████ Con Boleta: 135 │  │
│  │  $3M ┤╱                            │ │                                    │  │
│  │      └──────────────────           │ │                                    │  │
│  │       Ene Feb Mar Abr May          │ │                                    │  │
│  │       ── Ingresos  -- Cobrado      │ │                                    │  │
│  └────────────────────────────────────┘ └────────────────────────────────────┘  │
│                                                                                  │
│  ┌────────────────────────────────────┐ ┌────────────────────────────────────┐  │
│  │   DISTRIBUCIÓN MÉTODO DE PAGO      │ │      TOP PACIENTES CON DEUDA       │  │
│  │                                    │ │                                    │  │
│  │         ╭─────────╮                │ │  1. Juan Pérez      $120.000       │  │
│  │        ╱ Transfer ╲                │ │  2. Ana López       $90.000        │  │
│  │       │   55.6%    │               │ │  3. Pedro Soto      $75.000        │  │
│  │        ╲  Débito  ╱                │ │  4. María Díaz      $60.000        │  │
│  │         ╲ 26.7%  ╱                 │ │  5. Carlos Muñoz    $45.000        │  │
│  │          ╲_____╱                   │ │                                    │  │
│  │       Efectivo 11% | Crédito 7%   │ │  [Ver todos →]                     │  │
│  └────────────────────────────────────┘ └────────────────────────────────────┘  │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                              ALERTAS                                        ││
│  │  ⚠️ 5 pacientes con deuda mayor a $100.000                                  ││
│  │  🔴 3 sesiones realizadas hace +5 días sin boleta                           ││
│  │  ℹ️ Última sincronización con Medilink: hace 5 minutos                      ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 KPIs Administrativos

| KPI | Descripción | Fórmula | Target |
|-----|-------------|---------|--------|
| **Ventas Totales** | Valor de sesiones realizadas en el período | SUM(sesiones.precioFinal) WHERE estadoAtencion = 'REALIZADA' | - |
| **Cobranzas** | Total efectivamente cobrado | SUM(pagos.monto) WHERE estado = 'CONFIRMADO' | 95% ventas |
| **Tasa de Cobranza** | % de ventas cobradas | Cobranzas / Ventas × 100 | > 90% |
| **Deuda Pendiente** | Monto por cobrar | SUM(sesiones.precioFinal - montoPagado) WHERE estadoPago != 'PAGADA' | < 10% ventas |
| **Saldos a Favor** | Pagos anticipados no utilizados | SUM(pagos.saldoDisponible) | - |
| **Sesiones Realizadas** | Sesiones completadas | COUNT(sesiones) WHERE estadoAtencion = 'REALIZADA' | - |
| **Pacientes Activos** | Pacientes con sesiones en el período | COUNT(DISTINCT pacientes) con sesiones en período | - |
| **Pacientes Nuevos** | Primeras atenciones | COUNT(pacientes) con primera sesión en período | - |
| **Tasa de Adherencia** | Asistencia a citas agendadas | Sesiones realizadas / (Realizadas + No-show) × 100 | > 90% |
| **Tasa No-Show** | Pacientes que no llegan | Sesiones no-show / Total agendadas × 100 | < 5% |
| **Ticket Promedio** | Valor promedio por sesión | AVG(sesiones.precioFinal) | - |
| **LTV Paciente** | Valor de vida del paciente | AVG(total pagado por paciente) | - |

### 1.3 Gráficos Administrativos

#### Ingresos por Período
```typescript
// Query para ingresos mensuales
const ingresosPorMes = await prisma.sesion.groupBy({
  by: ['fechaHora'],
  where: {
    tenantId,
    estadoAtencion: 'REALIZADA',
    fechaHora: { gte: fechaDesde, lte: fechaHasta }
  },
  _sum: { precioFinal: true, montoPagado: true }
});
```

#### Distribución por Método de Pago
```typescript
const distribucionMetodoPago = await prisma.pago.groupBy({
  by: ['metodoPago'],
  where: {
    tenantId,
    estado: 'CONFIRMADO',
    fechaPago: { gte: fechaDesde, lte: fechaHasta }
  },
  _sum: { monto: true },
  _count: true
});
```

#### Sesiones por Estado
```typescript
const sesionesPorEstado = await prisma.sesion.groupBy({
  by: ['estadoPago', 'estadoBoleta'],
  where: {
    tenantId,
    estadoAtencion: 'REALIZADA',
    fechaHora: { gte: fechaDesde, lte: fechaHasta }
  },
  _count: true
});
```

---

## 2. Dashboard Profesional

### 2.1 Vista General

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         DASHBOARD PROFESIONAL                                    │
│                         Dr. Carlos Muñoz - Kinesiólogo                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │ Pacientes       │ │ Sesiones Hoy    │ │ Sesiones Mes    │ │ Planes Activos  ││
│  │ Activos: 25     │ │ 6 agendadas     │ │ 95 realizadas   │ │ 18 en curso     ││
│  │ Total: 45       │ │ 4 completadas   │ │ 28 esta semana  │ │ 5 completados   ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘│
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                           AGENDA DE HOY                                      ││
│  │                                                                              ││
│  │  09:00  ✅ María González   | Kinesiología Traumat. | PAGADA     [Ver]      ││
│  │  09:30  ✅ Pedro Soto       | Kinesiología Deportiva| PAGADA     [Ver]      ││
│  │  10:00  ✅ Ana López        | Rehabilitación        | PENDIENTE  [Ver]      ││
│  │  10:30  ✅ Juan Pérez       | Kinesiología Traumat. | PAGADA     [Ver]      ││
│  │  11:00  ⏳ Carlos Díaz      | Kinesiología Deportiva| PAGADA     [Ver]      ││
│  │  11:30  ○  Laura Muñoz      | Rehabilitación        | PENDIENTE  [Ver]      ││
│  │                                                                              ││
│  │  ✅ Completada  ⏳ En curso  ○ Pendiente                                     ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  ┌────────────────────────────────────┐ ┌────────────────────────────────────┐  │
│  │     PROGRESO PLANES ACTIVOS        │ │    PACIENTES CON ALERTA            │  │
│  │                                    │ │                                    │  │
│  │  María G.  ████████████░░ 80%     │ │  ⚠️ Pedro Soto                     │  │
│  │  Pedro S.  █████████░░░░░ 60%     │ │     No asiste hace 2 semanas       │  │
│  │  Ana L.    ████░░░░░░░░░░ 33%     │ │                                    │  │
│  │  Juan P.   ██████████████ 100%    │ │  ⚠️ Laura Muñoz                    │  │
│  │  Carlos D. ██████░░░░░░░░ 45%     │ │     Plan próximo a vencer (2 ses.) │  │
│  │                                    │ │                                    │  │
│  │  [Ver todos planes →]             │ │  [Ver todos →]                     │  │
│  └────────────────────────────────────┘ └────────────────────────────────────┘  │
│                                                                                  │
│  ┌────────────────────────────────────┐ ┌────────────────────────────────────┐  │
│  │     ADHERENCIA ÚLTIMOS 3 MESES     │ │     MIS ESTADÍSTICAS               │  │
│  │                                    │ │                                    │  │
│  │  100%┤     ╭──────╮               │ │  Promedio sesiones/paciente: 8.5   │  │
│  │      │    ╱        ╲              │ │  Tasa adherencia: 94.2%            │  │
│  │   90%┤   ╱          ╲─            │ │  Planes completados (3m): 5        │  │
│  │      │  ╱                         │ │  Tasa éxito planes: 85%            │  │
│  │   80%┤─╱                          │ │                                    │  │
│  │      └──────────────────          │ │                                    │  │
│  │       Ene   Feb   Mar   Abr       │ │                                    │  │
│  └────────────────────────────────────┘ └────────────────────────────────────┘  │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 KPIs Profesionales

| KPI | Descripción | Fórmula |
|-----|-------------|---------|
| **Pacientes Activos** | Pacientes con plan activo o sesión reciente | COUNT(DISTINCT pacientes) con actividad en 30 días |
| **Sesiones Realizadas** | Sesiones completadas por el profesional | COUNT(sesiones) WHERE profesionalId = X |
| **Planes Activos** | Planes terapéuticos en curso | COUNT(planes) WHERE estado = 'ACTIVO' |
| **Planes Completados** | Planes finalizados exitosamente | COUNT(planes) WHERE estado = 'COMPLETADO' |
| **Tasa de Adherencia** | Asistencia a citas del profesional | Realizadas / (Realizadas + No-show) × 100 |
| **Promedio Sesiones/Cliente** | Retención del paciente | AVG(sesiones por paciente) |
| **Tasa Éxito Planes** | Planes completados vs totales | Completados / (Completados + Abandonados) × 100 |
| **Carga de Trabajo** | Utilización del tiempo | Horas agendadas / Horas disponibles × 100 |

---

## 3. Dashboard de Paciente (Fase 2)

### 3.1 Vista General

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           MI PORTAL - PACIENTE                                   │
│                           María González                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │ Mi Saldo        │ │ Próxima Sesión  │ │ Mi Plan         │ │ Sesiones        ││
│  │ $0 (al día)     │ │ Mañana 10:00    │ │ 80% completado  │ │ 8 de 10         ││
│  │ ✓ Sin deuda     │ │ Dr. Muñoz       │ │ 2 restantes     │ │ realizadas      ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘│
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                        MI EVOLUCIÓN                                          ││
│  │                                                                              ││
│  │  Dolor (EVA)                                                                 ││
│  │  10 ┤                                                                        ││
│  │     │ ●                                                                      ││
│  │   7 ┤  ╲                                                                     ││
│  │     │   ╲●                                                                   ││
│  │   5 ┤    ╲                                                                   ││
│  │     │     ●──●                                                               ││
│  │   3 ┤          ╲●                                                            ││
│  │     │                                                                        ││
│  │   0 ┴────────────────                                                        ││
│  │     Sem1 Sem2 Sem3 Sem4 Sem5                                                 ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  ┌────────────────────────────────────┐ ┌────────────────────────────────────┐  │
│  │       MIS PRÓXIMAS SESIONES        │ │       MIS PAGOS RECIENTES          │  │
│  │                                    │ │                                    │  │
│  │  📅 Mar 20 Feb 10:00 - Dr. Muñoz  │ │  ✓ $90.000 - 15 Feb - Transfer.   │  │
│  │  📅 Jue 22 Feb 10:00 - Dr. Muñoz  │ │  ✓ $30.000 - 10 Feb - Débito      │  │
│  │                                    │ │  ✓ $60.000 - 01 Feb - Transfer.   │  │
│  │  [Ver calendario completo →]      │ │                                    │  │
│  │                                    │ │  [Ver historial →]                │  │
│  └────────────────────────────────────┘ └────────────────────────────────────┘  │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                        MIS BOLETAS                                           ││
│  │                                                                              ││
│  │  📄 B-12350 | 15 Feb 2024 | $30.000 | [Descargar PDF]                       ││
│  │  📄 B-12340 | 10 Feb 2024 | $30.000 | [Descargar PDF]                       ││
│  │  📄 B-12330 | 05 Feb 2024 | $30.000 | [Descargar PDF]                       ││
│  │                                                                              ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Métricas y Agregaciones

### 4.1 Queries de Agregación

```typescript
// services/dashboard/aggregations.ts

export class DashboardAggregations {

  // KPIs Financieros
  async getFinancialKPIs(tenantId: string, dateRange: DateRange) {
    const [ventas, cobranzas, deuda, saldosAFavor] = await Promise.all([
      // Ventas totales
      this.prisma.sesion.aggregate({
        where: {
          tenantId,
          estadoAtencion: 'REALIZADA',
          fechaHora: { gte: dateRange.from, lte: dateRange.to }
        },
        _sum: { precioFinal: true }
      }),

      // Cobranzas
      this.prisma.pago.aggregate({
        where: {
          tenantId,
          estado: 'CONFIRMADO',
          fechaPago: { gte: dateRange.from, lte: dateRange.to }
        },
        _sum: { monto: true }
      }),

      // Deuda pendiente
      this.prisma.sesion.aggregate({
        where: {
          tenantId,
          estadoAtencion: 'REALIZADA',
          estadoPago: { in: ['NO_PAGADA', 'PAGO_PARCIAL'] }
        },
        _sum: { precioFinal: true, montoPagado: true }
      }),

      // Saldos a favor
      this.prisma.pago.aggregate({
        where: {
          tenantId,
          estado: 'CONFIRMADO',
          saldoDisponible: { gt: 0 }
        },
        _sum: { saldoDisponible: true }
      })
    ]);

    return {
      ventasTotales: ventas._sum.precioFinal || 0,
      cobranzas: cobranzas._sum.monto || 0,
      tasaCobranza: ventas._sum.precioFinal
        ? (cobranzas._sum.monto / ventas._sum.precioFinal) * 100
        : 0,
      deudaPendiente: (deuda._sum.precioFinal || 0) - (deuda._sum.montoPagado || 0),
      saldosAFavor: saldosAFavor._sum.saldoDisponible || 0
    };
  }

  // KPIs Operacionales
  async getOperationalKPIs(tenantId: string, dateRange: DateRange) {
    const [sesiones, pacientes, adherencia] = await Promise.all([
      // Sesiones por estado
      this.prisma.sesion.groupBy({
        by: ['estadoAtencion', 'estadoAgenda'],
        where: {
          tenantId,
          fechaHora: { gte: dateRange.from, lte: dateRange.to }
        },
        _count: true
      }),

      // Pacientes activos y nuevos
      this.prisma.$queryRaw`
        SELECT
          COUNT(DISTINCT p.id) as activos,
          COUNT(DISTINCT CASE
            WHEN p."createdAt" >= ${dateRange.from} THEN p.id
          END) as nuevos
        FROM pacientes p
        INNER JOIN sesiones s ON s."pacienteId" = p.id
        WHERE p."tenantId" = ${tenantId}
        AND s."fechaHora" BETWEEN ${dateRange.from} AND ${dateRange.to}
      `,

      // Cálculo de adherencia
      this.calculateAdherence(tenantId, dateRange)
    ]);

    return {
      sesionesRealizadas: this.countByStatus(sesiones, 'estadoAtencion', 'REALIZADA'),
      sesionesAgendadas: this.countByStatus(sesiones, 'estadoAgenda', 'AGENDADA'),
      sesionesNoShow: this.countByStatus(sesiones, 'estadoAgenda', 'NO_SHOW'),
      pacientesActivos: pacientes[0].activos,
      pacientesNuevos: pacientes[0].nuevos,
      tasaAdherencia: adherencia.rate,
      tasaNoShow: adherencia.noShowRate
    };
  }

  // Serie temporal de ingresos
  async getRevenueTimeSeries(
    tenantId: string,
    dateRange: DateRange,
    groupBy: 'day' | 'week' | 'month' = 'month'
  ) {
    const dateFormat = {
      day: 'YYYY-MM-DD',
      week: 'YYYY-WW',
      month: 'YYYY-MM'
    }[groupBy];

    return this.prisma.$queryRaw`
      SELECT
        TO_CHAR(s."fechaHora", ${dateFormat}) as periodo,
        SUM(s."precioFinal") as ingresos,
        SUM(s."montoPagado") as cobrado,
        COUNT(*) as sesiones
      FROM sesiones s
      WHERE s."tenantId" = ${tenantId}
      AND s."estadoAtencion" = 'REALIZADA'
      AND s."fechaHora" BETWEEN ${dateRange.from} AND ${dateRange.to}
      GROUP BY TO_CHAR(s."fechaHora", ${dateFormat})
      ORDER BY periodo
    `;
  }

  // Top pacientes con deuda
  async getTopDebtors(tenantId: string, limit: number = 10) {
    return this.prisma.$queryRaw`
      SELECT
        p.id,
        p."firstName",
        p."lastName",
        p.rut,
        SUM(s."precioFinal" - s."montoPagado") as deuda
      FROM pacientes p
      INNER JOIN sesiones s ON s."pacienteId" = p.id
      WHERE p."tenantId" = ${tenantId}
      AND s."estadoAtencion" = 'REALIZADA'
      AND s."estadoPago" IN ('NO_PAGADA', 'PAGO_PARCIAL')
      GROUP BY p.id
      HAVING SUM(s."precioFinal" - s."montoPagado") > 0
      ORDER BY deuda DESC
      LIMIT ${limit}
    `;
  }

  // Alertas del sistema
  async getAlerts(tenantId: string): Promise<Alert[]> {
    const alerts: Alert[] = [];

    // Pacientes con deuda alta
    const highDebtPatients = await this.prisma.paciente.count({
      where: {
        tenantId,
        saldoPendiente: { gte: 100000 }
      }
    });
    if (highDebtPatients > 0) {
      alerts.push({
        type: 'DEUDA_ALTA',
        severity: 'WARNING',
        message: `${highDebtPatients} pacientes con deuda > $100.000`
      });
    }

    // Sesiones sin boleta (más de 5 días)
    const fiveDaysAgo = subDays(new Date(), 5);
    const sessionsWithoutBoleta = await this.prisma.sesion.count({
      where: {
        tenantId,
        estadoAtencion: 'REALIZADA',
        estadoBoleta: 'NO_EMITIDA',
        fechaHora: { lt: fiveDaysAgo }
      }
    });
    if (sessionsWithoutBoleta > 0) {
      alerts.push({
        type: 'SESIONES_SIN_BOLETA',
        severity: 'ERROR',
        message: `${sessionsWithoutBoleta} sesiones realizadas hace +5 días sin boleta`
      });
    }

    // Planes próximos a vencer
    const planesProximosVencer = await this.prisma.planTerapeutico.count({
      where: {
        tenantId,
        estado: 'ACTIVO',
        fechaFinEstimada: {
          gte: new Date(),
          lte: addDays(new Date(), 7)
        }
      }
    });
    if (planesProximosVencer > 0) {
      alerts.push({
        type: 'PLANES_POR_VENCER',
        severity: 'INFO',
        message: `${planesProximosVencer} planes vencen en los próximos 7 días`
      });
    }

    return alerts;
  }
}
```

### 4.2 Caché de Métricas

```typescript
// services/dashboard/cache.ts

export class DashboardCache {
  private redis: Redis;
  private readonly TTL = {
    realtime: 60,      // 1 minuto
    hourly: 3600,      // 1 hora
    daily: 86400       // 24 horas
  };

  // Métricas que se actualizan frecuentemente
  async getRealtimeMetrics(tenantId: string) {
    const cacheKey = `dashboard:${tenantId}:realtime`;

    let metrics = await this.redis.get(cacheKey);
    if (metrics) return JSON.parse(metrics);

    metrics = await this.aggregations.getFinancialKPIs(tenantId, todayRange());
    await this.redis.setex(cacheKey, this.TTL.realtime, JSON.stringify(metrics));

    return metrics;
  }

  // Métricas pre-calculadas (worker job)
  async preCalculateMetrics(tenantId: string) {
    // Este job corre cada hora
    const [financial, operational, timeSeries] = await Promise.all([
      this.aggregations.getFinancialKPIs(tenantId, currentMonthRange()),
      this.aggregations.getOperationalKPIs(tenantId, currentMonthRange()),
      this.aggregations.getRevenueTimeSeries(tenantId, last6MonthsRange(), 'month')
    ]);

    await this.redis.setex(
      `dashboard:${tenantId}:monthly`,
      this.TTL.hourly,
      JSON.stringify({ financial, operational, timeSeries })
    );
  }
}
```

---

## 5. Reportes

### 5.1 Tipos de Reportes

| Reporte | Descripción | Formato | Frecuencia |
|---------|-------------|---------|------------|
| **Resumen Financiero Mensual** | Ingresos, cobranzas, deuda por período | PDF/Excel | Mensual |
| **Estado de Cuenta Paciente** | Sesiones, pagos, saldo de un paciente | PDF | On-demand |
| **Listado de Deudores** | Pacientes con saldo pendiente | Excel | Semanal |
| **Productividad Profesional** | Sesiones, adherencia por profesional | PDF/Excel | Mensual |
| **Evolución de Planes** | Progreso de planes terapéuticos | PDF | On-demand |
| **Conciliación** | Discrepancias sesión/pago/boleta | Excel | Semanal |

### 5.2 Generación de Reportes

```typescript
// services/reports/generator.ts

export class ReportGenerator {

  async generateFinancialReport(
    tenantId: string,
    dateRange: DateRange,
    format: 'pdf' | 'excel'
  ): Promise<Buffer> {
    // 1. Obtener datos
    const data = await this.getFinancialReportData(tenantId, dateRange);

    // 2. Generar documento
    if (format === 'pdf') {
      return this.generatePDF('financial-report', data);
    } else {
      return this.generateExcel('financial-report', data);
    }
  }

  private async getFinancialReportData(tenantId: string, dateRange: DateRange) {
    return {
      periodo: dateRange,
      resumen: await this.aggregations.getFinancialKPIs(tenantId, dateRange),
      ingresosPorDia: await this.aggregations.getRevenueTimeSeries(tenantId, dateRange, 'day'),
      distribucionPago: await this.aggregations.getPaymentMethodDistribution(tenantId, dateRange),
      topDeudores: await this.aggregations.getTopDebtors(tenantId, 20),
      sesionesDetalle: await this.getSesionesDetalle(tenantId, dateRange)
    };
  }
}
```
