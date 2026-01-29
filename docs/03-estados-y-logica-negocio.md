# Estados y Lógica de Negocio - Heal Platform

## 1. State Machines

### 1.1 Estado de Sesión (Compuesto)

Una sesión tiene **4 dimensiones de estado independientes**:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        SESIÓN - ESTADOS COMPUESTOS                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐        │
│  │   ESTADO AGENDA    │  │  ESTADO ATENCIÓN   │  │   ESTADO PAGO      │        │
│  │   (desde Medilink) │  │  (desde Medilink)  │  │   (Heal Platform)  │        │
│  └─────────┬──────────┘  └─────────┬──────────┘  └─────────┬──────────┘        │
│            │                       │                       │                    │
│            ▼                       ▼                       ▼                    │
│  ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐            │
│  │    AGENDADA      │   │    PENDIENTE     │   │    NO_PAGADA     │            │
│  └────────┬─────────┘   └────────┬─────────┘   └────────┬─────────┘            │
│           │                      │                      │                       │
│           ▼                      ▼                      ▼                       │
│  ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐            │
│  │   CONFIRMADA     │   │    EN_CURSO      │   │   PAGO_PARCIAL   │            │
│  └────────┬─────────┘   └────────┬─────────┘   └────────┬─────────┘            │
│           │                      │                      │                       │
│           ▼                      ▼                      ▼                       │
│  ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐            │
│  │   CANCELADA      │   │    REALIZADA     │   │     PAGADA       │            │
│  └──────────────────┘   └────────┬─────────┘   └────────┬─────────┘            │
│           │                      │                      │                       │
│           ▼                      ▼                      ▼                       │
│  ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐            │
│  │    NO_SHOW       │   │    CANCELADA     │   │   REEMBOLSADA    │            │
│  └──────────────────┘   └──────────────────┘   └──────────────────┘            │
│                                                                                  │
│  ┌────────────────────┐                                                         │
│  │  ESTADO BOLETA     │                                                         │
│  │  (desde Medilink)  │                                                         │
│  └─────────┬──────────┘                                                         │
│            │                                                                     │
│            ▼                                                                     │
│  ┌──────────────────┐                                                           │
│  │   NO_EMITIDA     │                                                           │
│  └────────┬─────────┘                                                           │
│           │                                                                      │
│           ▼                                                                      │
│  ┌──────────────────┐                                                           │
│  │     EMITIDA      │                                                           │
│  └────────┬─────────┘                                                           │
│           │                                                                      │
│           ▼                                                                      │
│  ┌──────────────────┐                                                           │
│  │     ANULADA      │                                                           │
│  └──────────────────┘                                                           │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Transiciones de Estado - Agenda

```typescript
// Estado de Agenda (sincronizado desde Medilink)
const agendaTransitions = {
  AGENDADA: ['CONFIRMADA', 'CANCELADA', 'NO_SHOW'],
  CONFIRMADA: ['CANCELADA', 'NO_SHOW'],
  CANCELADA: [], // Estado final
  NO_SHOW: []    // Estado final
};

// Triggers
// - AGENDADA -> CONFIRMADA: Paciente confirma (manual o automático)
// - AGENDADA -> CANCELADA: Se cancela la cita
// - AGENDADA -> NO_SHOW: Paciente no llega a la cita
// - CONFIRMADA -> CANCELADA: Se cancela después de confirmar
// - CONFIRMADA -> NO_SHOW: Paciente no llega
```

### 1.3 Transiciones de Estado - Atención

```typescript
// Estado de Atención (sincronizado desde Medilink)
const atencionTransitions = {
  PENDIENTE: ['EN_CURSO', 'REALIZADA', 'CANCELADA'],
  EN_CURSO: ['REALIZADA', 'CANCELADA'],
  REALIZADA: [], // Estado final
  CANCELADA: []  // Estado final
};

// Triggers
// - PENDIENTE -> EN_CURSO: Profesional inicia atención
// - PENDIENTE -> REALIZADA: Atención registrada directamente como completada
// - PENDIENTE -> CANCELADA: Se cancela la atención
// - EN_CURSO -> REALIZADA: Profesional finaliza atención
// - EN_CURSO -> CANCELADA: Se interrumpe la atención
```

### 1.4 Transiciones de Estado - Pago

```typescript
// Estado de Pago (gestionado en Heal Platform)
const pagoTransitions = {
  NO_PAGADA: ['PAGO_PARCIAL', 'PAGADA'],
  PAGO_PARCIAL: ['PAGADA', 'NO_PAGADA', 'REEMBOLSADA'],
  PAGADA: ['PAGO_PARCIAL', 'REEMBOLSADA'],
  REEMBOLSADA: ['NO_PAGADA'] // En caso de re-cobro
};

// Triggers
// - NO_PAGADA -> PAGO_PARCIAL: Se registra pago que no cubre el total
// - NO_PAGADA -> PAGADA: Se registra pago completo
// - PAGO_PARCIAL -> PAGADA: Se completa el pago
// - PAGO_PARCIAL -> NO_PAGADA: Se reversa el pago parcial
// - PAGADA -> PAGO_PARCIAL: Se hace reembolso parcial
// - PAGADA -> REEMBOLSADA: Se reembolsa todo
// - REEMBOLSADA -> NO_PAGADA: Se prepara para re-cobro
```

### 1.5 Transiciones de Estado - Boleta

```typescript
// Estado de Boleta (sincronizado desde Medilink)
const boletaTransitions = {
  NO_EMITIDA: ['EMITIDA'],
  EMITIDA: ['ANULADA'],
  ANULADA: ['EMITIDA'] // Nueva boleta
};

// Triggers
// - NO_EMITIDA -> EMITIDA: Se emite boleta en Medilink (sesión realizada)
// - EMITIDA -> ANULADA: Se anula boleta en Medilink
// - ANULADA -> EMITIDA: Se emite nueva boleta
```

### 1.6 State Machine - Plan Terapéutico

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      PLAN TERAPÉUTICO - STATE MACHINE                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│                         ┌────────────────┐                                      │
│                         │   BORRADOR     │                                      │
│                         │  (en creación) │                                      │
│                         └───────┬────────┘                                      │
│                                 │                                                │
│                                 │ activar()                                      │
│                                 ▼                                                │
│                         ┌────────────────┐                                      │
│               ┌────────►│    ACTIVO      │◄────────┐                            │
│               │         │  (en progreso) │         │                            │
│               │         └───────┬────────┘         │                            │
│               │                 │                   │                            │
│               │    pausar()     │     completar()  │  reactivar()               │
│               │         ┌───────┼───────┐          │                            │
│               │         │       │       │          │                            │
│               │         ▼       │       ▼          │                            │
│               │  ┌────────────┐ │ ┌────────────┐   │                            │
│               │  │  PAUSADO   │ │ │ COMPLETADO │   │                            │
│               │  │ (temporal) │ │ │  (éxito)   │   │                            │
│               │  └─────┬──────┘ │ └────────────┘   │                            │
│               │        │        │                   │                            │
│               │        │        │                   │                            │
│               └────────┘        │                   │                            │
│                    reanudar()   │                   │                            │
│                                 │                   │                            │
│                        abandonar() / cancelar()    │                            │
│                                 │                   │                            │
│                                 ▼                   │                            │
│                         ┌────────────────┐          │                            │
│                         │  ABANDONADO /  │──────────┘                            │
│                         │   CANCELADO    │  reactivar() (raro)                  │
│                         └────────────────┘                                      │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

```typescript
const planTransitions = {
  BORRADOR: ['ACTIVO', 'CANCELADO'],
  ACTIVO: ['PAUSADO', 'COMPLETADO', 'ABANDONADO', 'CANCELADO'],
  PAUSADO: ['ACTIVO', 'ABANDONADO', 'CANCELADO'],
  COMPLETADO: ['ACTIVO'], // Reactivar si es necesario continuar
  ABANDONADO: ['ACTIVO'], // Reactivar si paciente vuelve
  CANCELADO: []           // Estado final
};
```

### 1.7 State Machine - Pago (Entidad)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          PAGO - STATE MACHINE                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│                         ┌────────────────┐                                      │
│                         │   PENDIENTE    │ (Ej: cheque a fecha)                 │
│                         └───────┬────────┘                                      │
│                                 │                                                │
│               confirmar()       │        rechazar()                              │
│         ┌───────────────────────┼───────────────────────┐                       │
│         │                       │                       │                       │
│         ▼                       │                       ▼                       │
│  ┌────────────────┐             │              ┌────────────────┐               │
│  │  CONFIRMADO    │◄────────────┘              │   RECHAZADO    │               │
│  │   (activo)     │                            │  (sin fondos)  │               │
│  └───────┬────────┘                            └────────────────┘               │
│          │                                                                       │
│          │ reembolsar() / anular()                                              │
│          │                                                                       │
│          ▼                                                                       │
│  ┌────────────────┐      ┌────────────────┐                                     │
│  │  REEMBOLSADO   │      │    ANULADO     │                                     │
│  │ (devuelto)     │      │  (cancelado)   │                                     │
│  └────────────────┘      └────────────────┘                                     │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Lógica de Negocio

### 2.1 Reglas de Pago

```typescript
// Reglas de negocio para pagos

interface PaymentRules {
  // R1: Un pago puede cubrir múltiples sesiones
  allowMultipleSessions: true;

  // R2: Un pago puede ser anticipado (sesiones futuras)
  allowAdvancePayment: true;

  // R3: Una sesión puede tener múltiples pagos (parciales)
  allowPartialPayments: true;

  // R4: Se permite saldo a favor del paciente
  allowCreditBalance: true;

  // R5: Los pagos se aplican a sesiones en orden cronológico (por defecto)
  defaultPaymentAllocation: 'CHRONOLOGICAL'; // o 'MANUAL'
}

// Algoritmo de asignación de pago a sesiones
function allocatePaymentToSessions(
  payment: Payment,
  sessions: Session[],
  strategy: 'CHRONOLOGICAL' | 'MANUAL' | 'OLDEST_FIRST'
): PaymentAllocation[] {
  // Si es manual, el usuario elige las sesiones
  if (strategy === 'MANUAL') {
    return manualAllocation(payment, sessions);
  }

  // Ordenar sesiones
  const sortedSessions = strategy === 'OLDEST_FIRST'
    ? sessions.sort((a, b) => a.fechaHora - b.fechaHora)
    : sessions.sort((a, b) => a.fechaHora - b.fechaHora);

  const allocations: PaymentAllocation[] = [];
  let remainingAmount = payment.monto;

  for (const session of sortedSessions) {
    if (remainingAmount <= 0) break;

    const sessionDebt = session.precioFinal - session.montoPagado;
    if (sessionDebt <= 0) continue;

    const amountToApply = Math.min(remainingAmount, sessionDebt);

    allocations.push({
      sessionId: session.id,
      amount: amountToApply
    });

    remainingAmount -= amountToApply;
  }

  // Si queda saldo, se guarda como crédito del paciente
  if (remainingAmount > 0) {
    payment.saldoDisponible = remainingAmount;
  }

  return allocations;
}
```

### 2.2 Cálculo de Saldo del Paciente

```typescript
interface PatientBalance {
  // Deuda total (sesiones no pagadas o parcialmente pagadas)
  totalDebt: number;

  // Saldo a favor (pagos anticipados no aplicados)
  creditBalance: number;

  // Saldo neto (positivo = debe, negativo = a favor)
  netBalance: number;

  // Desglose por período
  breakdown: {
    period: string;
    sessions: number;
    charged: number;
    paid: number;
    pending: number;
  }[];
}

function calculatePatientBalance(patientId: string): PatientBalance {
  // 1. Obtener todas las sesiones del paciente
  const sessions = await getSessionsByPatient(patientId);

  // 2. Calcular deuda de sesiones
  let totalCharged = 0;
  let totalPaid = 0;

  for (const session of sessions) {
    // Solo sesiones realizadas o agendadas cuentan
    if (['CANCELADA', 'NO_SHOW'].includes(session.estadoAgenda)) {
      continue;
    }

    totalCharged += session.precioFinal;
    totalPaid += session.montoPagado;
  }

  // 3. Obtener saldo de pagos anticipados
  const payments = await getPaymentsByPatient(patientId);
  const creditBalance = payments.reduce(
    (sum, p) => sum + p.saldoDisponible,
    0
  );

  // 4. Calcular saldo neto
  const totalDebt = totalCharged - totalPaid;
  const netBalance = totalDebt - creditBalance;

  return {
    totalDebt,
    creditBalance,
    netBalance,
    breakdown: calculateBreakdownByMonth(sessions)
  };
}
```

### 2.3 Lógica de Conciliación

```typescript
// Reconciliación: Pago vs Sesión vs Boleta

interface ReconciliationResult {
  status: 'OK' | 'DISCREPANCY' | 'PENDING';
  issues: ReconciliationIssue[];
}

interface ReconciliationIssue {
  type: 'PAYMENT_WITHOUT_SESSION' |
        'SESSION_WITHOUT_PAYMENT' |
        'BOLETA_MISMATCH' |
        'AMOUNT_MISMATCH';
  severity: 'INFO' | 'WARNING' | 'ERROR';
  details: string;
  sessionId?: string;
  paymentId?: string;
  boletaId?: string;
}

async function reconcilePatient(patientId: string): Promise<ReconciliationResult> {
  const issues: ReconciliationIssue[] = [];

  // 1. Obtener datos
  const sessions = await getSessionsByPatient(patientId);
  const payments = await getPaymentsByPatient(patientId);
  const boletas = await getBoletasByPatient(patientId);

  // 2. Verificar sesiones realizadas sin pago
  for (const session of sessions) {
    if (session.estadoAtencion === 'REALIZADA' &&
        session.estadoPago === 'NO_PAGADA') {
      issues.push({
        type: 'SESSION_WITHOUT_PAYMENT',
        severity: 'WARNING',
        details: `Sesión ${session.id} realizada sin pago`,
        sessionId: session.id
      });
    }
  }

  // 3. Verificar boletas vs pagos
  for (const boleta of boletas) {
    const relatedSessions = sessions.filter(s => s.boletaId === boleta.id);
    const totalBoleta = boleta.montoTotal;
    const totalPagado = relatedSessions.reduce(
      (sum, s) => sum + s.montoPagado,
      0
    );

    // La boleta puede emitirse antes del pago (es normal)
    // Pero si hay pago y no hay boleta, es un problema potencial
  }

  // 4. Verificar sesiones realizadas sin boleta (después de X días)
  const today = new Date();
  for (const session of sessions) {
    if (session.estadoAtencion === 'REALIZADA' &&
        session.estadoBoleta === 'NO_EMITIDA') {

      const daysSinceSession = daysDiff(session.fechaHora, today);

      if (daysSinceSession > 5) { // 5 días para emitir boleta
        issues.push({
          type: 'BOLETA_MISMATCH',
          severity: 'ERROR',
          details: `Sesión ${session.id} realizada hace ${daysSinceSession} días sin boleta`,
          sessionId: session.id
        });
      }
    }
  }

  return {
    status: issues.length === 0 ? 'OK' :
            issues.some(i => i.severity === 'ERROR') ? 'DISCREPANCY' : 'PENDING',
    issues
  };
}
```

### 2.4 Reglas de Plan Terapéutico

```typescript
// Métricas automáticas del plan terapéutico

interface PlanMetrics {
  // Progreso
  sessionsCompleted: number;
  sessionsTarget: number;
  progressPercentage: number;

  // Adherencia
  scheduledSessions: number;
  attendedSessions: number;
  noShowSessions: number;
  adherenceRate: number;

  // Tiempo
  daysElapsed: number;
  daysRemaining: number;
  estimatedCompletionDate: Date;

  // Objetivos
  objectivesTotal: number;
  objectivesAchieved: number;
}

function calculatePlanMetrics(plan: TherapeuticPlan): PlanMetrics {
  const sessions = plan.sesiones;

  const sessionsCompleted = sessions.filter(
    s => s.estadoAtencion === 'REALIZADA'
  ).length;

  const noShowSessions = sessions.filter(
    s => s.estadoAgenda === 'NO_SHOW'
  ).length;

  const scheduledSessions = sessions.filter(
    s => !['CANCELADA'].includes(s.estadoAgenda)
  ).length;

  const adherenceRate = scheduledSessions > 0
    ? (sessionsCompleted / (sessionsCompleted + noShowSessions)) * 100
    : 100;

  const progressPercentage = plan.sesionesObjetivo > 0
    ? (sessionsCompleted / plan.sesionesObjetivo) * 100
    : 0;

  // Estimar fecha de finalización
  const sessionsPerWeek = plan.frecuenciaSemanal || 2;
  const remainingSessions = plan.sesionesObjetivo - sessionsCompleted;
  const weeksRemaining = remainingSessions / sessionsPerWeek;
  const daysRemaining = Math.ceil(weeksRemaining * 7);

  return {
    sessionsCompleted,
    sessionsTarget: plan.sesionesObjetivo,
    progressPercentage: Math.min(progressPercentage, 100),
    scheduledSessions,
    attendedSessions: sessionsCompleted,
    noShowSessions,
    adherenceRate,
    daysElapsed: daysDiff(plan.fechaInicio, new Date()),
    daysRemaining,
    estimatedCompletionDate: addDays(new Date(), daysRemaining),
    objectivesTotal: plan.objetivosEspecificos.length,
    objectivesAchieved: countAchievedObjectives(plan)
  };
}

// Auto-actualización de estado del plan
async function autoUpdatePlanStatus(planId: string): Promise<void> {
  const plan = await getPlan(planId);
  const metrics = calculatePlanMetrics(plan);

  // Completar automáticamente si se alcanzó el objetivo
  if (metrics.progressPercentage >= 100 && plan.estado === 'ACTIVO') {
    await updatePlanStatus(planId, 'COMPLETADO');
    await createClinicalLog(planId, {
      tipo: 'OBJETIVO_LOGRADO',
      contenido: 'Plan terapéutico completado automáticamente'
    });
  }

  // Marcar como abandonado si no hay actividad en X días
  if (plan.estado === 'ACTIVO') {
    const lastSession = getLastSession(plan);
    if (lastSession && daysDiff(lastSession.fechaHora, new Date()) > 30) {
      // Notificar al profesional, no cambiar estado automáticamente
      await createNotification({
        userId: plan.profesional.userId,
        type: 'PLAN_INACTIVO',
        title: 'Plan sin actividad',
        message: `El plan de ${plan.paciente.nombre} no tiene sesiones en 30 días`
      });
    }
  }
}
```

### 2.5 Validaciones de Negocio

```typescript
// Validaciones antes de acciones críticas

class BusinessValidations {
  // Validar antes de registrar pago
  async validatePayment(payment: CreatePaymentDTO): Promise<ValidationResult> {
    const errors: string[] = [];

    // V1: Monto debe ser positivo
    if (payment.monto <= 0) {
      errors.push('El monto debe ser mayor a 0');
    }

    // V2: Paciente debe existir y estar activo
    const patient = await this.getPatient(payment.pacienteId);
    if (!patient || !patient.isActive) {
      errors.push('Paciente no encontrado o inactivo');
    }

    // V3: Si se especifican sesiones, deben ser del mismo paciente
    if (payment.sessionIds?.length > 0) {
      const sessions = await this.getSessions(payment.sessionIds);
      const invalidSessions = sessions.filter(
        s => s.pacienteId !== payment.pacienteId
      );
      if (invalidSessions.length > 0) {
        errors.push('Algunas sesiones no pertenecen al paciente');
      }
    }

    // V4: No permitir pago duplicado en los últimos 5 minutos
    const recentPayments = await this.getRecentPayments(
      payment.pacienteId,
      5 // minutos
    );
    const duplicate = recentPayments.find(
      p => p.monto === payment.monto && p.metodoPago === payment.metodoPago
    );
    if (duplicate) {
      errors.push('Posible pago duplicado detectado');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Validar antes de crear plan terapéutico
  async validatePlan(plan: CreatePlanDTO): Promise<ValidationResult> {
    const errors: string[] = [];

    // V1: Paciente debe existir
    const patient = await this.getPatient(plan.pacienteId);
    if (!patient) {
      errors.push('Paciente no encontrado');
    }

    // V2: No puede tener otro plan activo para el mismo diagnóstico
    const existingPlans = await this.getActivePatientPlans(plan.pacienteId);
    const duplicate = existingPlans.find(
      p => p.diagnostico === plan.diagnostico && p.estado === 'ACTIVO'
    );
    if (duplicate) {
      errors.push('Ya existe un plan activo con el mismo diagnóstico');
    }

    // V3: Sesiones objetivo debe ser razonable
    if (plan.sesionesObjetivo < 1 || plan.sesionesObjetivo > 100) {
      errors.push('Número de sesiones objetivo debe estar entre 1 y 100');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Validar transición de estado de sesión
  async validateSessionTransition(
    sessionId: string,
    field: 'estadoPago' | 'estadoAgenda',
    newStatus: string
  ): Promise<ValidationResult> {
    const session = await this.getSession(sessionId);
    const currentStatus = session[field];

    const transitions = field === 'estadoPago'
      ? pagoTransitions
      : agendaTransitions;

    const allowedTransitions = transitions[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      return {
        valid: false,
        errors: [`Transición no permitida: ${currentStatus} -> ${newStatus}`]
      };
    }

    return { valid: true, errors: [] };
  }
}
```

---

## 3. Eventos del Sistema

```typescript
// Eventos emitidos por el sistema (Event-Driven Architecture)

enum SystemEvent {
  // Sesiones
  SESSION_CREATED = 'session.created',
  SESSION_UPDATED = 'session.updated',
  SESSION_REALIZED = 'session.realized',
  SESSION_CANCELLED = 'session.cancelled',
  SESSION_NO_SHOW = 'session.no_show',

  // Pagos
  PAYMENT_CREATED = 'payment.created',
  PAYMENT_CONFIRMED = 'payment.confirmed',
  PAYMENT_REJECTED = 'payment.rejected',
  PAYMENT_REFUNDED = 'payment.refunded',

  // Planes
  PLAN_CREATED = 'plan.created',
  PLAN_ACTIVATED = 'plan.activated',
  PLAN_COMPLETED = 'plan.completed',
  PLAN_ABANDONED = 'plan.abandoned',

  // Boletas
  BOLETA_EMITTED = 'boleta.emitted',
  BOLETA_ANNULLED = 'boleta.annulled',

  // Sync
  SYNC_STARTED = 'sync.started',
  SYNC_COMPLETED = 'sync.completed',
  SYNC_FAILED = 'sync.failed',

  // Reconciliación
  RECONCILIATION_ISSUE = 'reconciliation.issue',
}

// Handlers de eventos
const eventHandlers: Record<SystemEvent, EventHandler[]> = {
  [SystemEvent.SESSION_REALIZED]: [
    updatePlanMetrics,
    checkPaymentStatus,
    notifyProfessional,
  ],

  [SystemEvent.PAYMENT_CREATED]: [
    updateSessionPaymentStatus,
    updatePatientBalance,
    notifyAdmin,
  ],

  [SystemEvent.PLAN_COMPLETED]: [
    generateCompletionReport,
    notifyPatient,
    notifyProfessional,
  ],

  // ... más handlers
};
```

---

## 4. Flujo de Reconciliación Completo

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      FLUJO DE RECONCILIACIÓN                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   MEDILINK                     HEAL PLATFORM                                     │
│   ────────                     ─────────────                                     │
│                                                                                  │
│   ┌─────────┐                                                                   │
│   │ Sesión  │ ─────────────────────────────────────────────────┐                │
│   │ Agendada│                                                   │                │
│   └────┬────┘                                                   │                │
│        │                                                        ▼                │
│        │ sync                                           ┌──────────────┐        │
│        └──────────────────────────────────────────────►│   Sesión     │        │
│                                                         │  AGENDADA    │        │
│                                                         │  NO_PAGADA   │        │
│   ┌─────────┐                                          │  NO_EMITIDA  │        │
│   │ Pago    │                                          └──────┬───────┘        │
│   │Registrado│◄────── Pago anticipado ─────────────────────────┤                │
│   └─────────┘                                                  │                │
│                                                                ▼                │
│                                                         ┌──────────────┐        │
│                                                         │   Sesión     │        │
│                                                         │  AGENDADA    │        │
│   ┌─────────┐                                          │   PAGADA     │        │
│   │Atención │                                          │  NO_EMITIDA  │        │
│   │Realizada│ ─────────────────────────────────────────►└──────┬───────┘        │
│   └────┬────┘                                                  │                │
│        │ sync                                                  │                │
│        └──────────────────────────────────────────────────────►│                │
│                                                                ▼                │
│                                                         ┌──────────────┐        │
│                                                         │   Sesión     │        │
│   ┌─────────┐                                          │  REALIZADA   │        │
│   │ Boleta  │                                          │   PAGADA     │        │
│   │ Emitida │ ─────────────────────────────────────────►│  NO_EMITIDA  │        │
│   └────┬────┘                                          └──────┬───────┘        │
│        │ sync                                                  │                │
│        └──────────────────────────────────────────────────────►│                │
│                                                                ▼                │
│                                                         ┌──────────────┐        │
│                                                         │   Sesión     │        │
│                                                         │  REALIZADA   │        │
│                                                         │   PAGADA     │        │
│                                                         │   EMITIDA    │        │
│                                                         └──────────────┘        │
│                                                               ✓                 │
│                                                         RECONCILIADO            │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```
