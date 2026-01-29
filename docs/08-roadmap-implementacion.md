# Roadmap de Implementación - Heal Platform

## Resumen Ejecutivo

| Fase | Descripción | Duración Estimada |
|------|-------------|-------------------|
| **Fase 0** | Setup inicial y fundamentos | 2 semanas |
| **Fase 1** | MVP Core - Pagos y Sesiones | 4 semanas |
| **Fase 2** | Integración Medilink | 3 semanas |
| **Fase 3** | Módulo Clínico | 3 semanas |
| **Fase 4** | Dashboards y Reportes | 2 semanas |
| **Fase 5** | Portal Profesional | 2 semanas |
| **Fase 6** | Portal Paciente | 3 semanas |
| **Fase 7** | Producción y Mejoras | Ongoing |

**Total MVP (Fases 0-4):** ~14 semanas

---

## Fase 0: Setup Inicial y Fundamentos

### Objetivos
- Configurar monorepo y estructura del proyecto
- Implementar autenticación y autorización
- Setup de infraestructura de desarrollo

### Entregables

```
Semana 1:
├── Setup Monorepo (Turborepo)
│   ├── apps/api (NestJS scaffold)
│   ├── apps/web-admin (React + Vite scaffold)
│   ├── packages/database (Prisma)
│   ├── packages/shared
│   └── Docker Compose dev
│
├── Base de Datos
│   ├── Schema Prisma completo
│   ├── Migraciones iniciales
│   └── Seed data de prueba
│
└── CI/CD Básico
    ├── GitHub Actions (lint, test, build)
    └── Prettier + ESLint config

Semana 2:
├── Auth Module (NestJS)
│   ├── JWT Strategy
│   ├── Refresh tokens
│   ├── Role guards
│   └── Tenant middleware
│
├── User Management
│   ├── CRUD usuarios
│   ├── Roles y permisos
│   └── Tenant isolation
│
└── Frontend Base
    ├── Auth flow (login/logout)
    ├── Protected routes
    ├── Layout principal
    └── Componentes UI base
```

### Checklist Técnico

- [ ] Monorepo configurado con Turborepo
- [ ] NestJS API running con health check
- [ ] PostgreSQL + Redis en Docker
- [ ] Prisma schema completo y migrado
- [ ] JWT auth funcionando
- [ ] React app con login funcional
- [ ] CI pipeline corriendo
- [ ] Variables de entorno documentadas

---

## Fase 1: MVP Core - Pagos y Sesiones

### Objetivos
- Implementar gestión de pacientes (sin Medilink aún)
- Implementar sistema de pagos completo
- Implementar gestión de sesiones manual

### Entregables

```
Semana 3-4: Backend Core
├── Módulo Pacientes
│   ├── CRUD completo
│   ├── Búsqueda y filtros
│   ├── Cálculo de saldo
│   └── Tests unitarios
│
├── Módulo Sesiones
│   ├── CRUD sesiones
│   ├── State machine (agenda, pago)
│   ├── Filtros por fecha/estado
│   └── Tests unitarios
│
└── Módulo Pagos (CORE)
    ├── Registrar pago
    ├── Asignar a sesiones
    ├── Estrategias de asignación
    ├── Pagos anticipados
    ├── Pagos parciales
    ├── Cálculo automático de saldos
    └── Tests unitarios + e2e

Semana 5-6: Frontend Core
├── Listado de Pacientes
│   ├── Tabla con filtros
│   ├── Búsqueda
│   ├── Vista de detalle
│   └── Balance del paciente
│
├── Listado de Sesiones
│   ├── Tabla con filtros
│   ├── Vista calendario
│   ├── Estados visuales
│   └── Detalle de sesión
│
└── Módulo de Pagos
    ├── Formulario de nuevo pago
    ├── Selector de sesiones
    ├── Asignación manual/automática
    ├── Historial de pagos
    ├── Reembolsos
    └── Validaciones
```

### Criterios de Aceptación

1. **Pacientes**
   - Puedo crear, editar y buscar pacientes
   - Veo el saldo pendiente de cada paciente
   - Veo el historial de sesiones y pagos

2. **Sesiones**
   - Puedo crear sesiones manualmente
   - Veo el estado de pago de cada sesión
   - Puedo filtrar por fecha, paciente, estado

3. **Pagos**
   - Puedo registrar un pago y asignarlo a 1 o más sesiones
   - Puedo hacer pagos anticipados
   - El sistema calcula saldos automáticamente
   - Puedo ver el historial de pagos

---

## Fase 2: Integración Medilink

### Objetivos
- Implementar cliente API de Medilink
- Sincronización automática de datos
- Reconciliación de estados

### Entregables

```
Semana 7: Medilink Client
├── MedilinkClient service
│   ├── GET /pacientes
│   ├── GET /citas
│   ├── GET /atenciones
│   ├── GET /boletas
│   ├── Rate limiting
│   └── Error handling
│
├── Data Transformers
│   ├── PacienteTransformer
│   ├── SesionTransformer
│   └── BoletaTransformer
│
└── Tests con mocks

Semana 8: Sync Service
├── Sync Service
│   ├── Full sync
│   ├── Incremental sync
│   ├── Change detection
│   └── Event emission
│
├── Sync Workers (BullMQ)
│   ├── Scheduled sync (cron)
│   ├── Manual sync trigger
│   └── Retry logic
│
└── Sync Logs
    ├── Tabla sync_logs
    └── Dashboard de estado

Semana 9: Reconciliación
├── Reconciliation Service
│   ├── Sesión vs Pago
│   ├── Sesión vs Boleta
│   ├── Alertas automáticas
│   └── Update de saldos
│
├── UI de Sync
│   ├── Estado de sincronización
│   ├── Trigger manual
│   ├── Logs de sync
│   └── Alertas de reconciliación
│
└── Configuración Medilink
    ├── Settings por tenant
    ├── Test de conexión
    └── Enable/disable sync
```

### Criterios de Aceptación

1. **Sincronización**
   - Datos de Medilink se importan automáticamente cada 5 min
   - Cambios en Medilink se reflejan en la plataforma
   - Los errores no detienen toda la sincronización

2. **Reconciliación**
   - El sistema detecta sesiones realizadas sin pago
   - El sistema detecta sesiones sin boleta
   - Los saldos se actualizan automáticamente

3. **Configuración**
   - Puedo configurar credenciales de Medilink
   - Puedo probar la conexión
   - Puedo ver el estado de la última sync

---

## Fase 3: Módulo Clínico

### Objetivos
- Implementar planes terapéuticos
- Implementar logs clínicos y evolución
- Implementar evaluaciones

### Entregables

```
Semana 10: Planes Terapéuticos
├── Backend
│   ├── CRUD planes
│   ├── State machine de plan
│   ├── Cálculo de métricas
│   ├── Auto-update de progreso
│   └── Objetivos y seguimiento
│
└── Frontend
    ├── Lista de planes
    ├── Crear/editar plan
    ├── Vista de progreso
    ├── Timeline de sesiones
    └── Marcar objetivos completados

Semana 11: Logs Clínicos
├── Backend
│   ├── CRUD logs clínicos
│   ├── Tipos de log
│   ├── Datos estructurados (JSON)
│   └── Visibilidad paciente
│
└── Frontend
    ├── Lista de logs por sesión
    ├── Lista de logs por plan
    ├── Editor de notas
    ├── Registro de escalas
    └── Historial de evolución

Semana 12: Evaluaciones
├── Backend
│   ├── CRUD evaluaciones
│   ├── Tipos (EVA, ROM, etc.)
│   └── Gráficos de evolución
│
└── Frontend
    ├── Registro de evaluación
    ├── Gráfico de evolución
    └── Comparativa inicial/actual
```

### Criterios de Aceptación

1. **Planes Terapéuticos**
   - Puedo crear un plan con objetivos
   - El progreso se calcula automáticamente
   - Puedo ver timeline de sesiones del plan
   - Los estados del plan son correctos

2. **Logs Clínicos**
   - Puedo registrar notas por sesión
   - Puedo ver la evolución del paciente
   - Puedo marcar notas visibles para el paciente

3. **Evaluaciones**
   - Puedo registrar evaluaciones (EVA, etc.)
   - Puedo ver gráficos de evolución

---

## Fase 4: Dashboards y Reportes

### Objetivos
- Implementar dashboard administrativo
- Implementar reportes exportables
- Implementar alertas

### Entregables

```
Semana 13: Dashboard Admin
├── Backend
│   ├── Aggregation queries
│   ├── Cache de métricas
│   └── Endpoint de dashboard
│
└── Frontend
    ├── KPI cards
    ├── Gráfico ingresos/cobranzas
    ├── Gráfico distribución pagos
    ├── Tabla top deudores
    ├── Alertas del sistema
    └── Filtros de período

Semana 14: Reportes
├── Backend
│   ├── Generador PDF
│   ├── Generador Excel
│   ├── Queue de reportes
│   └── Almacenamiento S3
│
└── Frontend
    ├── Selector de reportes
    ├── Filtros
    ├── Preview
    ├── Descarga PDF/Excel
    └── Historial de reportes
```

### Criterios de Aceptación

1. **Dashboard**
   - Veo KPIs de ventas, cobranzas, deuda
   - Veo gráficos de tendencia
   - Veo alertas importantes
   - Puedo filtrar por período

2. **Reportes**
   - Puedo generar reporte financiero mensual
   - Puedo exportar a PDF y Excel
   - Puedo ver estado de cuenta por paciente

---

## Fase 5: Portal Profesional

### Objetivos
- Vista específica para kinesiólogos
- Dashboard de productividad
- Gestión de pacientes asignados

### Entregables

```
Semana 15-16:
├── Backend
│   ├── Filtros por profesional
│   ├── Dashboard profesional
│   └── Permisos específicos
│
└── Frontend (web-professional)
    ├── Dashboard personal
    │   ├── Agenda del día
    │   ├── Pacientes activos
    │   ├── Planes en curso
    │   └── Métricas personales
    │
    ├── Mis Pacientes
    │   ├── Lista filtrada
    │   ├── Detalle con evolución
    │   └── Planes asignados
    │
    └── Gestión Clínica
        ├── Registro rápido de sesión
        ├── Notas de evolución
        └── Evaluaciones
```

---

## Fase 6: Portal Paciente

### Objetivos
- Portal de autoservicio para pacientes
- Vista de sesiones y pagos
- Historial clínico visible

### Entregables

```
Semana 17-19:
├── Backend
│   ├── Autenticación pacientes
│   ├── Permisos paciente
│   └── Endpoints específicos
│
└── Frontend (web-patient)
    ├── Mi Dashboard
    │   ├── Próximas sesiones
    │   ├── Mi saldo
    │   ├── Mi plan activo
    │   └── Mi evolución
    │
    ├── Mis Sesiones
    │   ├── Calendario
    │   ├── Historial
    │   └── Estado de pago
    │
    ├── Mis Pagos
    │   ├── Historial de pagos
    │   ├── Estado de cuenta
    │   └── Boletas (descarga)
    │
    └── Mi Evolución
        ├── Notas visibles
        ├── Gráficos de progreso
        └── Objetivos del plan
```

---

## Fase 7: Producción y Mejoras

### Objetivos
- Deploy a producción
- Monitoreo y observabilidad
- Mejoras continuas

### Entregables

```
Ongoing:
├── Infraestructura
│   ├── Deploy Kubernetes/ECS
│   ├── RDS PostgreSQL
│   ├── ElastiCache Redis
│   ├── S3 para archivos
│   └── CDN para frontend
│
├── Observabilidad
│   ├── Logging centralizado
│   ├── APM (Datadog/NewRelic)
│   ├── Alertas
│   └── Dashboards técnicos
│
├── Seguridad
│   ├── Penetration testing
│   ├── Audit de código
│   ├── Backup automático
│   └── Disaster recovery plan
│
└── Mejoras Futuras
    ├── App móvil (React Native)
    ├── Notificaciones push
    ├── Integración pagos online
    ├── Telemedicina
    └── Analytics avanzado
```

---

## Dependencias Técnicas

### Por Fase

| Fase | Depende de |
|------|------------|
| 0 | - |
| 1 | Fase 0 (Auth, DB) |
| 2 | Fase 1 (Sesiones, Pagos) |
| 3 | Fase 1 (Sesiones) |
| 4 | Fase 1-3 (Datos) |
| 5 | Fase 1, 3 |
| 6 | Fase 1, 3, 5 |

### Tecnologías Requeridas

```
Backend:
├── Node.js 20+
├── NestJS 10+
├── Prisma 5+
├── PostgreSQL 15+
├── Redis 7+
├── BullMQ
└── TypeScript 5+

Frontend:
├── React 18+
├── Vite 5+
├── TailwindCSS 3+
├── React Query (TanStack)
├── React Router 6+
├── Recharts
└── TypeScript 5+

DevOps:
├── Docker + Docker Compose
├── GitHub Actions
├── AWS/GCP (producción)
└── Turborepo
```

---

## Métricas de Éxito por Fase

### Fase 1 (MVP Core)
- [ ] 100% de operaciones CRUD funcionando
- [ ] Tiempo de respuesta API < 200ms
- [ ] 0 errores críticos en pagos

### Fase 2 (Medilink)
- [ ] Sync exitosa en < 5 minutos
- [ ] 99% de datos sincronizados correctamente
- [ ] Alertas de reconciliación funcionando

### Fase 3 (Clínico)
- [ ] Planes con métricas automáticas
- [ ] Logs clínicos con datos estructurados

### Fase 4 (Dashboards)
- [ ] Dashboard cargando en < 2 segundos
- [ ] Reportes generándose en < 30 segundos

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| API Medilink cambia | Media | Alto | Versionado de transformers, tests |
| Rate limiting Medilink | Alta | Medio | Cola con backoff, caché agresivo |
| Datos inconsistentes | Media | Alto | Reconciliación automática, alertas |
| Performance con volumen | Media | Alto | Índices, caché, paginación |
| Seguridad de datos clínicos | Baja | Crítico | Encryption, auditoría, RBAC |

---

## Siguiente Paso Recomendado

1. **Validar arquitectura** con stakeholders
2. **Setup del monorepo** (Fase 0, Semana 1)
3. **Implementar auth** (Fase 0, Semana 2)
4. **Sprint 1 del MVP** (Fase 1, Semana 3-4)

Comenzar con la estructura de proyecto permite iterar rápidamente y tener un sistema funcional temprano que se puede mostrar y validar.
