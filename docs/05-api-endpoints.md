# API Endpoints - Heal Platform

## Base URL

```
Production:  https://api.heal.cl/v1
Staging:     https://api-staging.heal.cl/v1
Development: http://localhost:3002/v1
```

## Autenticación

Todos los endpoints (excepto auth) requieren:
- Header: `Authorization: Bearer <jwt_token>`
- Header: `X-Tenant-ID: <tenant_id>` (extraído del token si no se provee)

---

## 1. Auth Endpoints

### POST /auth/login
Login de usuario

**Request:**
```json
{
  "email": "admin@centro.cl",
  "password": "********"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600,
  "user": {
    "id": "clx123...",
    "email": "admin@centro.cl",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": "ADMIN",
    "tenantId": "clx456..."
  }
}
```

### POST /auth/refresh
Renovar token

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### POST /auth/logout
Cerrar sesión (invalida tokens)

### POST /auth/forgot-password
Solicitar reset de contraseña

### POST /auth/reset-password
Cambiar contraseña con token

### GET /auth/me
Obtener usuario actual

---

## 2. Pacientes Endpoints

### GET /pacientes
Listar pacientes con filtros y paginación

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| page | number | Página (default: 1) |
| limit | number | Items por página (default: 20) |
| search | string | Búsqueda por nombre, RUT, email |
| isActive | boolean | Filtrar por estado |
| hasDebt | boolean | Solo con deuda pendiente |
| profesionalId | string | Filtrar por profesional |
| sortBy | string | Campo de ordenamiento |
| sortOrder | asc/desc | Dirección |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "clx123...",
      "rut": "12345678-9",
      "firstName": "María",
      "lastName": "González",
      "email": "maria@email.com",
      "phone": "+56912345678",
      "prevision": "FONASA",
      "saldoPendiente": 45000,
      "saldoAFavor": 0,
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

### GET /pacientes/:id
Obtener detalle de paciente

**Response:** `200 OK`
```json
{
  "id": "clx123...",
  "rut": "12345678-9",
  "firstName": "María",
  "lastName": "González",
  "email": "maria@email.com",
  "phone": "+56912345678",
  "birthDate": "1985-03-20",
  "gender": "F",
  "address": "Av. Providencia 1234",
  "comuna": "Providencia",
  "ciudad": "Santiago",
  "prevision": "FONASA",
  "saldoPendiente": 45000,
  "saldoAFavor": 0,
  "isActive": true,
  "medilinkId": "ML-12345",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-20T15:30:00Z",
  "_count": {
    "sesiones": 24,
    "pagos": 8,
    "planesTerapeuticos": 2
  }
}
```

### GET /pacientes/:id/balance
Obtener balance financiero del paciente

**Response:** `200 OK`
```json
{
  "pacienteId": "clx123...",
  "totalDebt": 45000,
  "creditBalance": 0,
  "netBalance": 45000,
  "breakdown": [
    {
      "period": "2024-01",
      "sessions": 4,
      "charged": 120000,
      "paid": 120000,
      "pending": 0
    },
    {
      "period": "2024-02",
      "sessions": 3,
      "charged": 90000,
      "paid": 45000,
      "pending": 45000
    }
  ],
  "unpaidSessions": [
    {
      "id": "clx789...",
      "fechaHora": "2024-02-10T11:00:00Z",
      "precioFinal": 30000,
      "montoPagado": 0,
      "pendiente": 30000
    }
  ]
}
```

### GET /pacientes/:id/sesiones
Obtener sesiones del paciente

### GET /pacientes/:id/pagos
Obtener pagos del paciente

### GET /pacientes/:id/planes
Obtener planes terapéuticos del paciente

### POST /pacientes
Crear paciente (manual, sin Medilink)

### PUT /pacientes/:id
Actualizar paciente

### DELETE /pacientes/:id
Desactivar paciente (soft delete)

---

## 3. Sesiones Endpoints

### GET /sesiones
Listar sesiones

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| page, limit | number | Paginación |
| pacienteId | string | Filtrar por paciente |
| profesionalId | string | Filtrar por profesional |
| planId | string | Filtrar por plan |
| fechaDesde | date | Fecha inicio |
| fechaHasta | date | Fecha fin |
| estadoAgenda | enum | AGENDADA, CONFIRMADA, etc. |
| estadoAtencion | enum | PENDIENTE, REALIZADA, etc. |
| estadoPago | enum | NO_PAGADA, PAGADA, etc. |
| estadoBoleta | enum | NO_EMITIDA, EMITIDA, etc. |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "clx456...",
      "fechaHora": "2024-02-15T10:00:00Z",
      "duracionMinutos": 30,
      "precioBase": 30000,
      "descuento": 0,
      "precioFinal": 30000,
      "montoPagado": 30000,
      "estadoAgenda": "CONFIRMADA",
      "estadoAtencion": "REALIZADA",
      "estadoPago": "PAGADA",
      "estadoBoleta": "EMITIDA",
      "paciente": {
        "id": "clx123...",
        "firstName": "María",
        "lastName": "González"
      },
      "profesional": {
        "id": "clx789...",
        "firstName": "Carlos",
        "lastName": "Muñoz"
      },
      "servicio": {
        "id": "clx111...",
        "nombre": "Kinesiología Traumatológica"
      }
    }
  ],
  "meta": { ... }
}
```

### GET /sesiones/:id
Detalle de sesión

**Response:** `200 OK`
```json
{
  "id": "clx456...",
  "fechaHora": "2024-02-15T10:00:00Z",
  "duracionMinutos": 30,
  "precioBase": 30000,
  "descuento": 0,
  "precioFinal": 30000,
  "montoPagado": 30000,
  "estadoAgenda": "CONFIRMADA",
  "estadoAtencion": "REALIZADA",
  "estadoPago": "PAGADA",
  "estadoBoleta": "EMITIDA",
  "motivoConsulta": "Dolor lumbar",
  "diagnostico": "Lumbalgia mecánica",
  "observaciones": "Paciente presenta mejoría",
  "medilinkId": "ML-CITA-456",
  "medilinkAtencionId": "ML-ATEN-789",
  "paciente": { ... },
  "profesional": { ... },
  "servicio": { ... },
  "planTerapeutico": { ... },
  "boleta": {
    "id": "clx222...",
    "numero": "B-12345",
    "fecha": "2024-02-15",
    "montoTotal": 30000
  },
  "pagos": [
    {
      "pagoId": "clx333...",
      "montoAplicado": 30000,
      "fechaPago": "2024-02-10T09:00:00Z"
    }
  ],
  "logsClinicos": [ ... ]
}
```

### GET /sesiones/calendar
Obtener sesiones para vista calendario

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| start | date | Fecha inicio (requerido) |
| end | date | Fecha fin (requerido) |
| profesionalId | string | Filtrar por profesional |

**Response:** `200 OK`
```json
{
  "events": [
    {
      "id": "clx456...",
      "title": "María González - Kinesiología",
      "start": "2024-02-15T10:00:00Z",
      "end": "2024-02-15T10:30:00Z",
      "color": "#22c55e",
      "extendedProps": {
        "pacienteId": "clx123...",
        "profesionalId": "clx789...",
        "estadoAgenda": "CONFIRMADA",
        "estadoPago": "PAGADA"
      }
    }
  ]
}
```

### PUT /sesiones/:id/estado-pago
Actualizar estado de pago de sesión

**Request:**
```json
{
  "estadoPago": "PAGADA"
}
```

---

## 4. Pagos Endpoints

### GET /pagos
Listar pagos

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| page, limit | number | Paginación |
| pacienteId | string | Filtrar por paciente |
| fechaDesde | date | Desde fecha |
| fechaHasta | date | Hasta fecha |
| metodoPago | enum | EFECTIVO, DEBITO, etc. |
| estado | enum | PENDIENTE, CONFIRMADO, etc. |
| tipoPago | enum | SESION_INDIVIDUAL, PACK, etc. |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "clx333...",
      "numeroPago": 1234,
      "monto": 90000,
      "montoAplicado": 90000,
      "saldoDisponible": 0,
      "metodoPago": "TRANSFERENCIA",
      "estado": "CONFIRMADO",
      "tipoPago": "SESIONES_MULTIPLES",
      "referencia": "TRF-123456",
      "fechaPago": "2024-02-10T09:00:00Z",
      "paciente": {
        "id": "clx123...",
        "firstName": "María",
        "lastName": "González"
      },
      "sesiones": [
        {
          "sesionId": "clx456...",
          "fechaHora": "2024-02-15T10:00:00Z",
          "montoAplicado": 30000
        },
        {
          "sesionId": "clx457...",
          "fechaHora": "2024-02-17T10:00:00Z",
          "montoAplicado": 30000
        },
        {
          "sesionId": "clx458...",
          "fechaHora": "2024-02-19T10:00:00Z",
          "montoAplicado": 30000
        }
      ]
    }
  ],
  "meta": { ... }
}
```

### GET /pagos/:id
Detalle de pago

### POST /pagos
Registrar nuevo pago

**Request:**
```json
{
  "pacienteId": "clx123...",
  "monto": 90000,
  "metodoPago": "TRANSFERENCIA",
  "referencia": "TRF-123456",
  "tipoPago": "SESIONES_MULTIPLES",
  "descripcion": "Pago de 3 sesiones de febrero",
  "fechaPago": "2024-02-10T09:00:00Z",
  "sessionIds": ["clx456...", "clx457...", "clx458..."],
  "allocationStrategy": "MANUAL"
}
```

**Response:** `201 Created`
```json
{
  "id": "clx333...",
  "numeroPago": 1234,
  "monto": 90000,
  "montoAplicado": 90000,
  "saldoDisponible": 0,
  "allocations": [
    { "sessionId": "clx456...", "amount": 30000 },
    { "sessionId": "clx457...", "amount": 30000 },
    { "sessionId": "clx458...", "amount": 30000 }
  ],
  "message": "Pago registrado exitosamente"
}
```

### POST /pagos/anticipado
Registrar pago anticipado (sin sesiones específicas)

**Request:**
```json
{
  "pacienteId": "clx123...",
  "monto": 150000,
  "metodoPago": "CREDITO",
  "referencia": "VISA-7890",
  "tipoPago": "ANTICIPO",
  "descripcion": "Anticipo para tratamiento"
}
```

### POST /pagos/:id/allocate
Asignar pago anticipado a sesiones

**Request:**
```json
{
  "allocations": [
    { "sessionId": "clx459...", "amount": 30000 },
    { "sessionId": "clx460...", "amount": 30000 }
  ]
}
```

### POST /pagos/:id/refund
Registrar reembolso

**Request:**
```json
{
  "amount": 30000,
  "reason": "Sesión cancelada por el centro",
  "refundMethod": "TRANSFERENCIA"
}
```

### DELETE /pagos/:id
Anular pago

---

## 5. Planes Terapéuticos Endpoints

### GET /planes
Listar planes terapéuticos

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| pacienteId | string | Filtrar por paciente |
| profesionalId | string | Filtrar por profesional |
| estado | enum | ACTIVO, COMPLETADO, etc. |

### GET /planes/:id
Detalle de plan con métricas

**Response:** `200 OK`
```json
{
  "id": "clx555...",
  "nombre": "Rehabilitación Lumbar",
  "descripcion": "Plan de 12 sesiones para dolor lumbar crónico",
  "diagnostico": "Lumbalgia mecánica crónica",
  "objetivoGeneral": "Recuperar funcionalidad y disminuir dolor",
  "objetivosEspecificos": [
    "Reducir EVA de 7 a 3",
    "Mejorar flexibilidad lumbar",
    "Fortalecer core"
  ],
  "sesionesObjetivo": 12,
  "frecuenciaSemanal": 2,
  "fechaInicio": "2024-01-15",
  "fechaFinEstimada": "2024-03-15",
  "estado": "ACTIVO",
  "paciente": { ... },
  "profesional": { ... },
  "metrics": {
    "sessionsCompleted": 8,
    "sessionsTarget": 12,
    "progressPercentage": 66.67,
    "scheduledSessions": 10,
    "attendedSessions": 8,
    "noShowSessions": 0,
    "adherenceRate": 100,
    "daysElapsed": 45,
    "daysRemaining": 15,
    "estimatedCompletionDate": "2024-03-01",
    "objectivesTotal": 3,
    "objectivesAchieved": 1
  },
  "sesiones": [ ... ],
  "logsClinicos": [ ... ],
  "evaluaciones": [ ... ]
}
```

### POST /planes
Crear plan terapéutico

**Request:**
```json
{
  "pacienteId": "clx123...",
  "profesionalId": "clx789...",
  "nombre": "Rehabilitación Lumbar",
  "descripcion": "Plan de 12 sesiones para dolor lumbar crónico",
  "diagnostico": "Lumbalgia mecánica crónica",
  "objetivoGeneral": "Recuperar funcionalidad y disminuir dolor",
  "objetivosEspecificos": [
    "Reducir EVA de 7 a 3",
    "Mejorar flexibilidad lumbar",
    "Fortalecer core"
  ],
  "sesionesObjetivo": 12,
  "frecuenciaSemanal": 2,
  "fechaInicio": "2024-01-15"
}
```

### PUT /planes/:id
Actualizar plan

### PUT /planes/:id/estado
Cambiar estado del plan

**Request:**
```json
{
  "estado": "COMPLETADO",
  "motivo": "Objetivos alcanzados"
}
```

### POST /planes/:id/objetivos/:index/lograr
Marcar objetivo como logrado

---

## 6. Logs Clínicos Endpoints

### GET /planes/:planId/logs
Listar logs clínicos de un plan

### GET /sesiones/:sesionId/logs
Listar logs clínicos de una sesión

### POST /logs
Crear log clínico

**Request:**
```json
{
  "sesionId": "clx456...",
  "planTerapeuticoId": "clx555...",
  "tipo": "NOTA_SESION",
  "titulo": "Sesión 8 - Progreso notable",
  "contenido": "Paciente reporta EVA 4/10 vs 7/10 inicial...",
  "datosEstructurados": {
    "eva": 4,
    "rom_flexion": 45,
    "rom_extension": 20
  },
  "visiblePaciente": true
}
```

### PUT /logs/:id
Actualizar log clínico

---

## 7. Evaluaciones Endpoints

### POST /planes/:planId/evaluaciones
Crear evaluación

**Request:**
```json
{
  "tipo": "EVA",
  "nombre": "Escala Visual Analógica - Semana 4",
  "puntaje": 4,
  "puntajeMaximo": 10,
  "interpretacion": "Dolor moderado, mejoría respecto a inicial (7/10)",
  "respuestas": {
    "dolor_reposo": 3,
    "dolor_movimiento": 5,
    "dolor_nocturno": 2
  }
}
```

### GET /planes/:planId/evaluaciones
Listar evaluaciones del plan (evolución)

---

## 8. Dashboard Endpoints

### GET /dashboard/admin
Dashboard administrativo

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| fechaDesde | date | Período desde |
| fechaHasta | date | Período hasta |

**Response:** `200 OK`
```json
{
  "kpis": {
    "ventasTotales": 4500000,
    "ventasMesAnterior": 4200000,
    "variacionVentas": 7.14,
    "cobranzasMes": 4200000,
    "deudaPendiente": 850000,
    "saldosAFavor": 120000,
    "sesionesRealizadas": 150,
    "sesionesAgendadas": 45,
    "pacientesActivos": 75,
    "pacientesNuevos": 12,
    "tasaAdherencia": 92.5,
    "tasaNoShow": 3.2
  },
  "charts": {
    "ingresosPorMes": [
      { "mes": "2024-01", "ingresos": 4200000, "cobrado": 4000000 },
      { "mes": "2024-02", "ingresos": 4500000, "cobrado": 4200000 }
    ],
    "sesionesPorEstado": {
      "realizadas": 150,
      "pagadas": 140,
      "pendientesPago": 10,
      "conBoleta": 135
    },
    "distribucionMetodoPago": [
      { "metodo": "TRANSFERENCIA", "monto": 2500000, "porcentaje": 55.6 },
      { "metodo": "DEBITO", "monto": 1200000, "porcentaje": 26.7 },
      { "metodo": "EFECTIVO", "monto": 500000, "porcentaje": 11.1 },
      { "metodo": "CREDITO", "monto": 300000, "porcentaje": 6.6 }
    ],
    "topPacientesDeuda": [
      { "paciente": "Juan Pérez", "deuda": 120000 },
      { "paciente": "Ana López", "deuda": 90000 }
    ]
  },
  "alertas": [
    {
      "tipo": "DEUDA_ALTA",
      "mensaje": "5 pacientes con deuda > $100.000",
      "severidad": "WARNING"
    },
    {
      "tipo": "SESIONES_SIN_BOLETA",
      "mensaje": "3 sesiones realizadas hace +5 días sin boleta",
      "severidad": "ERROR"
    }
  ]
}
```

### GET /dashboard/profesional
Dashboard del profesional

**Response:** `200 OK`
```json
{
  "profesionalId": "clx789...",
  "kpis": {
    "pacientesActivos": 25,
    "sesionesHoy": 6,
    "sesionesSemana": 28,
    "sesionesMes": 95,
    "planesActivos": 18,
    "planesCompletados": 5,
    "tasaAdherencia": 94.2,
    "promedioSesionesCliente": 8.5
  },
  "agendaHoy": [
    {
      "id": "clx456...",
      "hora": "09:00",
      "paciente": "María González",
      "servicio": "Kinesiología Traumatológica",
      "estadoPago": "PAGADA"
    }
  ],
  "pacientesConAlerta": [
    {
      "pacienteId": "clx123...",
      "nombre": "Pedro Soto",
      "alerta": "No asiste hace 2 semanas",
      "ultimaSesion": "2024-02-01"
    }
  ],
  "planesProximosVencer": [
    {
      "planId": "clx555...",
      "paciente": "Ana López",
      "sesionesRestantes": 2,
      "fechaFinEstimada": "2024-02-28"
    }
  ]
}
```

---

## 9. Sync Endpoints

### GET /sync/status
Estado de sincronización con Medilink

**Response:** `200 OK`
```json
{
  "medilinkEnabled": true,
  "lastSync": "2024-02-15T10:05:00Z",
  "nextScheduledSync": "2024-02-15T10:10:00Z",
  "status": "IDLE",
  "lastSyncResults": {
    "pacientes": { "created": 2, "updated": 5, "errors": 0 },
    "sesiones": { "created": 15, "updated": 8, "errors": 0 },
    "boletas": { "created": 10, "updated": 0, "errors": 0 }
  }
}
```

### POST /sync/trigger
Disparar sincronización manual

**Request:**
```json
{
  "entities": ["pacientes", "sesiones", "boletas"],
  "fullSync": false
}
```

### GET /sync/logs
Historial de sincronizaciones

---

## 10. Reconciliation Endpoints

### GET /reconciliation/patient/:pacienteId
Reconciliar datos de un paciente

**Response:** `200 OK`
```json
{
  "pacienteId": "clx123...",
  "status": "DISCREPANCY",
  "issues": [
    {
      "type": "SESSION_WITHOUT_PAYMENT",
      "severity": "WARNING",
      "details": "Sesión del 2024-02-10 realizada sin pago",
      "sessionId": "clx456..."
    },
    {
      "type": "BOLETA_MISMATCH",
      "severity": "ERROR",
      "details": "Sesión del 2024-02-05 sin boleta (10 días)",
      "sessionId": "clx455..."
    }
  ],
  "summary": {
    "totalSessions": 24,
    "sessionsWithIssues": 2,
    "totalDebt": 60000
  }
}
```

### POST /reconciliation/run
Ejecutar reconciliación general

---

## 11. Notifications Endpoints

### GET /notifications
Listar notificaciones del usuario

### PUT /notifications/:id/read
Marcar como leída

### PUT /notifications/read-all
Marcar todas como leídas

---

## 12. Configuration Endpoints

### GET /config/tenant
Obtener configuración del tenant

### PUT /config/tenant
Actualizar configuración

### GET /config/medilink
Obtener configuración de Medilink

### PUT /config/medilink
Actualizar configuración de Medilink

### POST /config/medilink/test
Probar conexión con Medilink

---

## Response Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 204 | No Content - Successful, no body |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Business rule violation |
| 422 | Unprocessable Entity - Validation error |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |

## Error Response Format

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    {
      "field": "monto",
      "message": "El monto debe ser mayor a 0"
    }
  ],
  "timestamp": "2024-02-15T10:00:00Z",
  "path": "/v1/pagos"
}
```
