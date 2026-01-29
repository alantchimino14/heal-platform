# Arquitectura del Sistema - Heal Platform

## 1. Diagrama de Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              HEAL PLATFORM                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  Portal Admin   │  │Portal Profesional│  │ Portal Paciente │                  │
│  │   (React SPA)   │  │   (React SPA)    │  │  (React SPA)    │                  │
│  └────────┬────────┘  └────────┬─────────┘  └────────┬────────┘                  │
│           │                    │                      │                          │
│           └────────────────────┼──────────────────────┘                          │
│                                │                                                 │
│                                ▼                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                         API Gateway (Kong/Nginx)                         │    │
│  │                    Rate Limiting | Auth | Routing                        │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                │                                                 │
│           ┌────────────────────┼────────────────────┐                           │
│           │                    │                    │                           │
│           ▼                    ▼                    ▼                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   Auth Service  │  │   Core Service  │  │  Sync Service   │                  │
│  │    (NestJS)     │  │    (NestJS)     │  │   (NestJS)      │                  │
│  │                 │  │                 │  │                 │                  │
│  │ • JWT Auth      │  │ • Pacientes     │  │ • Medilink API  │                  │
│  │ • Roles/Perms   │  │ • Sesiones      │  │ • Polling       │                  │
│  │ • Sessions      │  │ • Pagos         │  │ • Reconciliación│                  │
│  │ • 2FA (futuro)  │  │ • Planes Terap. │  │ • Cache         │                  │
│  └────────┬────────┘  │ • Logs Clínicos │  └────────┬────────┘                  │
│           │           │ • Boletas       │           │                           │
│           │           │ • Dashboards    │           │                           │
│           │           └────────┬────────┘           │                           │
│           │                    │                    │                           │
│           └────────────────────┼────────────────────┘                           │
│                                │                                                 │
│                                ▼                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                         Message Queue (BullMQ/Redis)                     │    │
│  │                    Jobs | Events | Notifications                         │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│           │                    │                    │                           │
│           ▼                    ▼                    ▼                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  Sync Workers   │  │ Report Workers  │  │Notification Svc │                  │
│  │                 │  │                 │  │                 │                  │
│  │ • Medilink Sync │  │ • PDF Reports   │  │ • Email         │                  │
│  │ • Reconcile     │  │ • Excel Export  │  │ • SMS (futuro)  │                  │
│  │ • State Update  │  │ • Dashboard Agg │  │ • Push (futuro) │                  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                  │
│                                                                                  │
│                                ▼                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                           Data Layer                                     │    │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐          │    │
│  │  │   PostgreSQL    │  │     Redis       │  │   S3/MinIO      │          │    │
│  │  │                 │  │                 │  │                 │          │    │
│  │  │ • Core Data     │  │ • Cache         │  │ • Documentos    │          │    │
│  │  │ • Transactions  │  │ • Sessions      │  │ • Reportes      │          │    │
│  │  │ • Audit Logs    │  │ • Queue State   │  │ • Backups       │          │    │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘          │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           MEDILINK (Sistema Externo)                             │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                         Medilink REST API (GET only)                     │    │
│  │                                                                          │    │
│  │  • GET /pacientes     • GET /citas        • GET /atenciones             │    │
│  │  • GET /boletas       • GET /profesionales                               │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 2. Componentes del Sistema

### 2.1 Frontend Layer

| Componente | Tecnología | Propósito |
|------------|------------|-----------|
| Portal Admin | React + Vite + Tailwind | Gestión completa del sistema, reportes, configuración |
| Portal Profesional | React + Vite + Tailwind | Vista kinesiólogo: pacientes, planes, evolución |
| Portal Paciente | React + Vite + Tailwind | Vista paciente: sesiones, pagos, historial (Fase 2) |

### 2.2 Backend Services

| Servicio | Puerto | Responsabilidad |
|----------|--------|-----------------|
| API Gateway | 3000 | Routing, rate limiting, auth validation |
| Auth Service | 3001 | Autenticación, autorización, gestión de usuarios |
| Core Service | 3002 | Lógica de negocio principal |
| Sync Service | 3003 | Sincronización con Medilink |
| Notification Service | 3004 | Envío de notificaciones |

### 2.3 Workers

| Worker | Frecuencia | Responsabilidad |
|--------|------------|-----------------|
| MedilinkSyncWorker | Cada 5 min | Sincronizar datos desde Medilink |
| ReconciliationWorker | Cada 15 min | Reconciliar estados sesión/pago/boleta |
| ReportAggregationWorker | Cada hora | Pre-calcular métricas de dashboard |
| NotificationWorker | En tiempo real | Procesar cola de notificaciones |

### 2.4 Data Stores

| Store | Uso |
|-------|-----|
| PostgreSQL | Base de datos principal, transacciones ACID |
| Redis | Cache, colas de trabajo, sesiones de usuario |
| S3/MinIO | Almacenamiento de archivos, reportes, backups |

## 3. Flujo de Datos Principal

```
┌─────────────────────────────────────────────────────────────────┐
│                     FLUJO DE SINCRONIZACIÓN                      │
└─────────────────────────────────────────────────────────────────┘

    MEDILINK                    HEAL PLATFORM
    ────────                    ─────────────
         │
         │ 1. Polling cada 5 min
         │◄───────────────────── Sync Service
         │
         │ 2. GET /pacientes
         │────────────────────►
         │◄──────────────────── Response
         │
         │ 3. GET /citas
         │────────────────────►
         │◄──────────────────── Response
         │
         │ 4. GET /atenciones
         │────────────────────►
         │◄──────────────────── Response
         │
         │ 5. GET /boletas
         │────────────────────►
         │◄──────────────────── Response
         │
         │                      6. Normalizar datos
         │                      ─────────────────►
         │
         │                      7. Detectar cambios
         │                      ─────────────────►
         │
         │                      8. Actualizar DB local
         │                      ─────────────────►
         │
         │                      9. Reconciliar estados
         │                      ─────────────────►
         │
         │                      10. Emit eventos
         │                      ─────────────────►


┌─────────────────────────────────────────────────────────────────┐
│                      FLUJO DE PAGO                               │
└─────────────────────────────────────────────────────────────────┘

    USUARIO                     HEAL PLATFORM                 DB
    ───────                     ─────────────                 ──
         │
         │ 1. Registrar pago
         │─────────────────────►
         │                      │
         │                      │ 2. Validar sesiones
         │                      │──────────────────────────────►
         │                      │◄──────────────────────────────
         │                      │
         │                      │ 3. Crear pago
         │                      │──────────────────────────────►
         │                      │◄──────────────────────────────
         │                      │
         │                      │ 4. Asociar sesiones
         │                      │──────────────────────────────►
         │                      │◄──────────────────────────────
         │                      │
         │                      │ 5. Actualizar saldo paciente
         │                      │──────────────────────────────►
         │                      │◄──────────────────────────────
         │                      │
         │ 6. Confirmación      │
         │◄─────────────────────
         │
         │                      │ 7. Emit: PAYMENT_CREATED
         │                      │─────────────────► Queue
```

## 4. Estrategia de Deployment

### 4.1 Docker Compose (Desarrollo)

```yaml
# docker-compose.yml (esquema)
services:
  - postgres
  - redis
  - api-gateway
  - auth-service
  - core-service
  - sync-service
  - workers
  - frontend
```

### 4.2 Kubernetes (Producción)

```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                        │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Ingress     │  │ Services    │  │ Deployments │         │
│  │ Controller  │  │ (ClusterIP) │  │ (Pods)      │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ ConfigMaps  │  │ Secrets     │  │ PVCs        │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                              │
│  External: RDS PostgreSQL | ElastiCache Redis | S3         │
└─────────────────────────────────────────────────────────────┘
```

## 5. Seguridad

### 5.1 Capas de Seguridad

```
┌─────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: Network                                            │
│  ├── WAF (Web Application Firewall)                         │
│  ├── DDoS Protection                                        │
│  └── VPC / Private Subnets                                  │
│                                                              │
│  Layer 2: Transport                                          │
│  ├── TLS 1.3 everywhere                                     │
│  ├── Certificate Management                                  │
│  └── HSTS Headers                                           │
│                                                              │
│  Layer 3: Application                                        │
│  ├── JWT Authentication                                      │
│  ├── Role-Based Access Control (RBAC)                       │
│  ├── Rate Limiting per user/endpoint                        │
│  ├── Input Validation (Zod schemas)                         │
│  └── SQL Injection Prevention (Prisma ORM)                  │
│                                                              │
│  Layer 4: Data                                               │
│  ├── Encryption at Rest (AES-256)                           │
│  ├── Field-level encryption (datos sensibles)               │
│  ├── Audit Logging                                          │
│  └── Data Masking (PII en logs)                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Modelo de Roles

```
┌─────────────────────────────────────────────────────────────┐
│                    ROLE HIERARCHY                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  SUPER_ADMIN (Heal Platform)                                │
│  └── Acceso total, configuración global                     │
│                                                              │
│  ADMIN (Centro de Kinesiología)                             │
│  ├── Gestión de usuarios del centro                         │
│  ├── Configuración del centro                               │
│  ├── Reportes financieros                                   │
│  ├── Gestión de pagos                                       │
│  └── Vista de todos los pacientes/profesionales             │
│                                                              │
│  PROFESIONAL (Kinesiólogo)                                  │
│  ├── Ver pacientes asignados                                │
│  ├── Gestionar planes terapéuticos                          │
│  ├── Registrar evolución clínica                            │
│  ├── Ver sus propias métricas                               │
│  └── NO puede ver datos financieros (opcional)              │
│                                                              │
│  RECEPCIONISTA                                               │
│  ├── Ver agenda                                             │
│  ├── Registrar pagos                                        │
│  ├── Ver saldos de pacientes                                │
│  └── NO puede ver datos clínicos                            │
│                                                              │
│  PACIENTE (Fase 2)                                          │
│  ├── Ver sus propias sesiones                               │
│  ├── Ver sus pagos y saldo                                  │
│  ├── Ver su evolución clínica (parcial)                     │
│  └── Descargar boletas                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 6. Consideraciones de Escalabilidad

### 6.1 Horizontal Scaling

- **Stateless Services**: Todos los servicios son stateless, escalables horizontalmente
- **Load Balancing**: Round-robin con health checks
- **Database**: Read replicas para reportes/dashboards
- **Cache**: Redis Cluster para alta disponibilidad

### 6.2 Performance Targets

| Métrica | Target |
|---------|--------|
| API Response Time (p95) | < 200ms |
| Dashboard Load Time | < 2s |
| Sync Latency | < 5 min |
| Uptime | 99.9% |

### 6.3 Multi-tenancy

```
┌─────────────────────────────────────────────────────────────┐
│                    MULTI-TENANT MODEL                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Approach: Schema-per-tenant (PostgreSQL)                   │
│                                                              │
│  heal_platform (database)                                   │
│  ├── public (schema) - Configuración global                 │
│  ├── tenant_centro_1 (schema) - Centro Kinesiología 1      │
│  ├── tenant_centro_2 (schema) - Centro Kinesiología 2      │
│  └── tenant_centro_n (schema) - Centro Kinesiología N      │
│                                                              │
│  Alternativa: Row-level security con tenant_id             │
│  (Más simple para fase inicial)                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```
