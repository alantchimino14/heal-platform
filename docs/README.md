# Heal Platform - Documentación Técnica

## Plataforma SaaS para Centros de Kinesiología

Heal es una plataforma que funciona como capa superior a Medilink, resolviendo la cobranza, el tracking financiero real y la gestión clínica para centros de kinesiología.

---

## Documentos

| # | Documento | Descripción |
|---|-----------|-------------|
| 01 | [Arquitectura](./01-arquitectura.md) | Diagrama de arquitectura, componentes, flujos de datos, seguridad |
| 02 | [Database Schema](./02-database-schema.prisma) | Esquema completo de base de datos en Prisma |
| 03 | [Estados y Lógica](./03-estados-y-logica-negocio.md) | State machines, reglas de negocio, validaciones |
| 04 | [Estructura del Proyecto](./04-estructura-proyecto.md) | Organización de carpetas, monorepo, Docker |
| 05 | [API Endpoints](./05-api-endpoints.md) | Especificación completa de endpoints REST |
| 06 | [Dashboards y Métricas](./06-dashboards-metricas.md) | KPIs, gráficos, agregaciones, reportes |
| 07 | [Sync Medilink](./07-sync-medilink.md) | Integración, polling, transformers, reconciliación |
| 08 | [Roadmap](./08-roadmap-implementacion.md) | Plan de implementación por fases |

---

## Resumen del Sistema

### Problema que Resuelve

- Medilink no permite cobrar sesiones futuras (limitaciones de fecha/facturación)
- Los pacientes pueden pagar sesiones por adelantado
- Las boletas se emiten solo cuando la sesión ocurre
- No hay tracking financiero real en Medilink

### Solución

```
┌─────────────────────────────────────────────────────────────┐
│                      HEAL PLATFORM                           │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Pagos      │  │   Clínico    │  │  Dashboards  │       │
│  │  (nuestro)   │  │  (nuestro)   │  │  (nuestro)   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                           │                                  │
│                           ▼                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               SYNC SERVICE (polling)                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       MEDILINK                               │
│        (Agenda, Pacientes, Boletas - solo lectura)          │
└─────────────────────────────────────────────────────────────┘
```

### Estados de una Sesión

| Dimensión | Estados | Fuente |
|-----------|---------|--------|
| Agenda | AGENDADA → CONFIRMADA → CANCELADA / NO_SHOW | Medilink |
| Atención | PENDIENTE → EN_CURSO → REALIZADA | Medilink |
| Pago | NO_PAGADA → PAGO_PARCIAL → PAGADA | **Heal** |
| Boleta | NO_EMITIDA → EMITIDA → ANULADA | Medilink |

### Modelo de Pagos

- Un pago puede cubrir múltiples sesiones
- Se permite pago anticipado
- Se permite pago parcial
- Saldo automático por paciente

---

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Backend | NestJS + TypeScript |
| Database | PostgreSQL + Prisma |
| Cache/Queue | Redis + BullMQ |
| Frontend | React + Vite + Tailwind |
| Auth | JWT + Refresh Tokens |
| Infra | Docker + Kubernetes |

---

## Módulos Principales

### 1. Core
- Pacientes
- Sesiones
- Pagos
- Boletas

### 2. Clínico
- Planes Terapéuticos
- Logs Clínicos
- Evaluaciones

### 3. Inteligencia
- Dashboard Admin
- Dashboard Profesional
- Reportes
- Alertas

### 4. Integración
- Sync Medilink
- Reconciliación

---

## Quick Start (Desarrollo)

```bash
# 1. Clonar y setup
git clone <repo>
cd heal-platform
pnpm install

# 2. Levantar servicios
docker-compose -f docker/docker-compose.dev.yml up -d

# 3. Migraciones
pnpm db:migrate

# 4. Seed
pnpm db:seed

# 5. Desarrollo
pnpm dev
```

---

## Roadmap Resumido

| Fase | Contenido | Duración |
|------|-----------|----------|
| **0** | Setup, Auth, DB | 2 sem |
| **1** | MVP: Pagos, Sesiones | 4 sem |
| **2** | Integración Medilink | 3 sem |
| **3** | Módulo Clínico | 3 sem |
| **4** | Dashboards | 2 sem |
| **5** | Portal Profesional | 2 sem |
| **6** | Portal Paciente | 3 sem |

**MVP (Fases 0-4): ~14 semanas**

---

## Próximos Pasos

1. Revisar y validar arquitectura propuesta
2. Comenzar con Fase 0: Setup del monorepo
3. Implementar autenticación y usuarios
4. Desarrollar MVP de pagos y sesiones

---

## Contacto

Documentación generada para el proyecto Heal Platform.
