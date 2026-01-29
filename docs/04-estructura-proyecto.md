# Estructura del Proyecto - Heal Platform

## 1. Estructura de Repositorios

```
heal-platform/                    # Monorepo
├── apps/
│   ├── api/                      # Backend NestJS
│   ├── web-admin/               # Frontend Admin (React)
│   ├── web-professional/        # Frontend Profesional (React)
│   └── web-patient/             # Frontend Paciente (React) - Fase 2
├── packages/
│   ├── database/                # Prisma schema y migrations
│   ├── shared/                  # Tipos, utils, constantes compartidas
│   ├── ui/                      # Componentes UI compartidos
│   └── api-client/              # Cliente API tipado
├── docker/
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   └── Dockerfile.*
├── scripts/
│   ├── seed.ts
│   └── migrate.ts
├── docs/
├── .github/
│   └── workflows/
├── turbo.json                   # Turborepo config
├── package.json
└── README.md
```

## 2. Backend (NestJS) - Estructura Detallada

```
apps/api/
├── src/
│   ├── main.ts                         # Bootstrap
│   ├── app.module.ts                   # Root module
│   │
│   ├── config/                         # Configuración
│   │   ├── config.module.ts
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   ├── jwt.config.ts
│   │   ├── medilink.config.ts
│   │   └── env.validation.ts
│   │
│   ├── common/                         # Código compartido
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── roles.decorator.ts
│   │   │   ├── tenant.decorator.ts
│   │   │   └── api-paginated.decorator.ts
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts
│   │   │   └── prisma-exception.filter.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── tenant.guard.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   ├── transform.interceptor.ts
│   │   │   └── tenant.interceptor.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   ├── dto/
│   │   │   ├── pagination.dto.ts
│   │   │   └── response.dto.ts
│   │   └── utils/
│   │       ├── date.utils.ts
│   │       ├── money.utils.ts
│   │       └── rut.utils.ts
│   │
│   ├── modules/
│   │   │
│   │   ├── auth/                       # Autenticación
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── refresh.strategy.ts
│   │   │   ├── dto/
│   │   │   │   ├── login.dto.ts
│   │   │   │   ├── register.dto.ts
│   │   │   │   └── refresh-token.dto.ts
│   │   │   └── guards/
│   │   │       └── local-auth.guard.ts
│   │   │
│   │   ├── users/                      # Usuarios
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-user.dto.ts
│   │   │   │   └── update-user.dto.ts
│   │   │   └── entities/
│   │   │       └── user.entity.ts
│   │   │
│   │   ├── tenants/                    # Multi-tenancy
│   │   │   ├── tenants.module.ts
│   │   │   ├── tenants.controller.ts
│   │   │   ├── tenants.service.ts
│   │   │   └── dto/
│   │   │       └── create-tenant.dto.ts
│   │   │
│   │   ├── pacientes/                  # Pacientes
│   │   │   ├── pacientes.module.ts
│   │   │   ├── pacientes.controller.ts
│   │   │   ├── pacientes.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-paciente.dto.ts
│   │   │   │   ├── update-paciente.dto.ts
│   │   │   │   └── paciente-filters.dto.ts
│   │   │   └── pacientes.repository.ts
│   │   │
│   │   ├── profesionales/              # Profesionales
│   │   │   ├── profesionales.module.ts
│   │   │   ├── profesionales.controller.ts
│   │   │   ├── profesionales.service.ts
│   │   │   └── dto/
│   │   │       └── ...
│   │   │
│   │   ├── sesiones/                   # Sesiones
│   │   │   ├── sesiones.module.ts
│   │   │   ├── sesiones.controller.ts
│   │   │   ├── sesiones.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-sesion.dto.ts
│   │   │   │   ├── update-sesion.dto.ts
│   │   │   │   └── sesion-filters.dto.ts
│   │   │   ├── state-machine/
│   │   │   │   ├── sesion-agenda.state.ts
│   │   │   │   ├── sesion-atencion.state.ts
│   │   │   │   ├── sesion-pago.state.ts
│   │   │   │   └── sesion-boleta.state.ts
│   │   │   └── sesiones.repository.ts
│   │   │
│   │   ├── pagos/                      # Pagos
│   │   │   ├── pagos.module.ts
│   │   │   ├── pagos.controller.ts
│   │   │   ├── pagos.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-pago.dto.ts
│   │   │   │   ├── allocate-pago.dto.ts
│   │   │   │   └── pago-filters.dto.ts
│   │   │   ├── strategies/
│   │   │   │   ├── allocation.strategy.ts
│   │   │   │   └── chronological.strategy.ts
│   │   │   └── pagos.repository.ts
│   │   │
│   │   ├── boletas/                    # Boletas
│   │   │   ├── boletas.module.ts
│   │   │   ├── boletas.controller.ts
│   │   │   ├── boletas.service.ts
│   │   │   └── dto/
│   │   │       └── ...
│   │   │
│   │   ├── planes/                     # Planes Terapéuticos
│   │   │   ├── planes.module.ts
│   │   │   ├── planes.controller.ts
│   │   │   ├── planes.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-plan.dto.ts
│   │   │   │   ├── update-plan.dto.ts
│   │   │   │   └── plan-metrics.dto.ts
│   │   │   ├── state-machine/
│   │   │   │   └── plan.state.ts
│   │   │   └── planes.repository.ts
│   │   │
│   │   ├── clinico/                    # Módulo Clínico
│   │   │   ├── clinico.module.ts
│   │   │   ├── logs/
│   │   │   │   ├── logs.controller.ts
│   │   │   │   ├── logs.service.ts
│   │   │   │   └── dto/
│   │   │   │       └── create-log.dto.ts
│   │   │   └── evaluaciones/
│   │   │       ├── evaluaciones.controller.ts
│   │   │       ├── evaluaciones.service.ts
│   │   │       └── dto/
│   │   │           └── create-evaluacion.dto.ts
│   │   │
│   │   ├── dashboard/                  # Dashboards
│   │   │   ├── dashboard.module.ts
│   │   │   ├── dashboard.controller.ts
│   │   │   ├── dashboard.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── admin-dashboard.dto.ts
│   │   │   │   └── professional-dashboard.dto.ts
│   │   │   └── aggregations/
│   │   │       ├── financial.aggregation.ts
│   │   │       ├── clinical.aggregation.ts
│   │   │       └── operational.aggregation.ts
│   │   │
│   │   ├── reconciliation/             # Conciliación
│   │   │   ├── reconciliation.module.ts
│   │   │   ├── reconciliation.service.ts
│   │   │   └── dto/
│   │   │       └── reconciliation-result.dto.ts
│   │   │
│   │   ├── notifications/              # Notificaciones
│   │   │   ├── notifications.module.ts
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.service.ts
│   │   │   └── channels/
│   │   │       ├── email.channel.ts
│   │   │       └── in-app.channel.ts
│   │   │
│   │   └── sync/                       # Sincronización Medilink
│   │       ├── sync.module.ts
│   │       ├── sync.service.ts
│   │       ├── medilink/
│   │       │   ├── medilink.client.ts
│   │       │   ├── medilink.types.ts
│   │       │   └── transformers/
│   │       │       ├── paciente.transformer.ts
│   │       │       ├── sesion.transformer.ts
│   │       │       └── boleta.transformer.ts
│   │       └── workers/
│   │           ├── sync.worker.ts
│   │           └── reconciliation.worker.ts
│   │
│   ├── jobs/                           # Background Jobs
│   │   ├── jobs.module.ts
│   │   ├── processors/
│   │   │   ├── sync.processor.ts
│   │   │   ├── report.processor.ts
│   │   │   └── notification.processor.ts
│   │   └── queues/
│   │       └── queue.constants.ts
│   │
│   ├── database/                       # Database
│   │   ├── database.module.ts
│   │   ├── prisma.service.ts
│   │   └── prisma-client.extension.ts
│   │
│   └── health/                         # Health checks
│       ├── health.module.ts
│       └── health.controller.ts
│
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── prisma/                             # Symlink a packages/database/prisma
├── nest-cli.json
├── tsconfig.json
├── tsconfig.build.json
└── package.json
```

## 3. Frontend (React) - Estructura Detallada

```
apps/web-admin/
├── src/
│   ├── main.tsx                        # Entry point
│   ├── App.tsx                         # Root component
│   │
│   ├── config/
│   │   ├── api.config.ts
│   │   ├── routes.config.ts
│   │   └── env.ts
│   │
│   ├── api/                            # API Layer
│   │   ├── client.ts                   # Axios instance
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── usePacientes.ts
│   │   │   ├── useSesiones.ts
│   │   │   ├── usePagos.ts
│   │   │   ├── usePlanes.ts
│   │   │   └── useDashboard.ts
│   │   └── services/
│   │       ├── auth.service.ts
│   │       ├── pacientes.service.ts
│   │       └── ...
│   │
│   ├── store/                          # State Management
│   │   ├── index.ts
│   │   ├── auth.store.ts
│   │   ├── ui.store.ts
│   │   └── filters.store.ts
│   │
│   ├── routes/                         # Route definitions
│   │   ├── index.tsx
│   │   ├── private.routes.tsx
│   │   └── public.routes.tsx
│   │
│   ├── layouts/                        # Layout components
│   │   ├── MainLayout.tsx
│   │   ├── AuthLayout.tsx
│   │   └── components/
│   │       ├── Sidebar.tsx
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   │
│   ├── pages/                          # Page components
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   └── ForgotPassword.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   └── components/
│   │   │       ├── RevenueChart.tsx
│   │   │       ├── SessionsChart.tsx
│   │   │       ├── DebtSummary.tsx
│   │   │       └── KPICards.tsx
│   │   │
│   │   ├── pacientes/
│   │   │   ├── PacientesList.tsx
│   │   │   ├── PacienteDetail.tsx
│   │   │   ├── PacienteBalance.tsx
│   │   │   └── components/
│   │   │       ├── PacienteForm.tsx
│   │   │       ├── PacienteCard.tsx
│   │   │       └── BalanceTable.tsx
│   │   │
│   │   ├── sesiones/
│   │   │   ├── SesionesList.tsx
│   │   │   ├── SesionDetail.tsx
│   │   │   ├── SesionesCalendar.tsx
│   │   │   └── components/
│   │   │       ├── SesionCard.tsx
│   │   │       ├── SesionStatusBadge.tsx
│   │   │       └── CalendarView.tsx
│   │   │
│   │   ├── pagos/
│   │   │   ├── PagosList.tsx
│   │   │   ├── PagoDetail.tsx
│   │   │   ├── NuevoPago.tsx
│   │   │   └── components/
│   │   │       ├── PagoForm.tsx
│   │   │       ├── SessionSelector.tsx
│   │   │       └── PaymentMethodSelect.tsx
│   │   │
│   │   ├── planes/
│   │   │   ├── PlanesList.tsx
│   │   │   ├── PlanDetail.tsx
│   │   │   ├── NuevoPlan.tsx
│   │   │   └── components/
│   │   │       ├── PlanForm.tsx
│   │   │       ├── PlanProgress.tsx
│   │   │       ├── ObjectivesList.tsx
│   │   │       └── SessionTimeline.tsx
│   │   │
│   │   ├── clinico/
│   │   │   ├── LogsClinicos.tsx
│   │   │   ├── Evaluaciones.tsx
│   │   │   └── components/
│   │   │       ├── LogForm.tsx
│   │   │       └── EvolucionChart.tsx
│   │   │
│   │   ├── reportes/
│   │   │   ├── ReportesFinancieros.tsx
│   │   │   ├── ReportesClinicos.tsx
│   │   │   └── components/
│   │   │       └── ReportGenerator.tsx
│   │   │
│   │   ├── configuracion/
│   │   │   ├── ConfigGeneral.tsx
│   │   │   ├── ConfigMedilink.tsx
│   │   │   ├── ConfigUsuarios.tsx
│   │   │   └── ConfigServicios.tsx
│   │   │
│   │   └── sync/
│   │       ├── SyncStatus.tsx
│   │       └── SyncLogs.tsx
│   │
│   ├── components/                     # Shared components
│   │   ├── ui/                         # Base UI (or use packages/ui)
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Tabs.tsx
│   │   │   └── ...
│   │   │
│   │   ├── forms/
│   │   │   ├── FormField.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   ├── MoneyInput.tsx
│   │   │   └── RutInput.tsx
│   │   │
│   │   ├── data/
│   │   │   ├── DataTable.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── Filters.tsx
│   │   │   └── EmptyState.tsx
│   │   │
│   │   ├── charts/
│   │   │   ├── BarChart.tsx
│   │   │   ├── LineChart.tsx
│   │   │   ├── PieChart.tsx
│   │   │   └── AreaChart.tsx
│   │   │
│   │   └── feedback/
│   │       ├── Loading.tsx
│   │       ├── Error.tsx
│   │       ├── Toast.tsx
│   │       └── Confirmation.tsx
│   │
│   ├── hooks/                          # Custom hooks
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── usePagination.ts
│   │   ├── useFilters.ts
│   │   └── usePermissions.ts
│   │
│   ├── utils/                          # Utilities
│   │   ├── format.ts
│   │   ├── date.ts
│   │   ├── money.ts
│   │   ├── rut.ts
│   │   └── validators.ts
│   │
│   ├── types/                          # TypeScript types
│   │   ├── api.types.ts
│   │   ├── models.types.ts
│   │   └── ui.types.ts
│   │
│   └── styles/
│       ├── globals.css
│       └── tailwind.css
│
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## 4. Shared Packages

### packages/database

```
packages/database/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── index.ts
│   └── client.ts
├── package.json
└── tsconfig.json
```

### packages/shared

```
packages/shared/
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── models.ts
│   │   ├── enums.ts
│   │   └── api.ts
│   ├── constants/
│   │   ├── states.ts
│   │   └── roles.ts
│   ├── utils/
│   │   ├── date.ts
│   │   ├── money.ts
│   │   └── validators.ts
│   └── schemas/
│       ├── paciente.schema.ts
│       ├── sesion.schema.ts
│       └── pago.schema.ts
├── package.json
└── tsconfig.json
```

### packages/ui

```
packages/ui/
├── src/
│   ├── index.ts
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.styles.ts
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── ...
│   └── styles/
│       └── base.css
├── package.json
└── tsconfig.json
```

### packages/api-client

```
packages/api-client/
├── src/
│   ├── index.ts
│   ├── client.ts
│   ├── endpoints/
│   │   ├── auth.ts
│   │   ├── pacientes.ts
│   │   ├── sesiones.ts
│   │   └── ...
│   └── types/
│       └── responses.ts
├── package.json
└── tsconfig.json
```

## 5. Docker Configuration

```
docker/
├── docker-compose.yml              # Production
├── docker-compose.dev.yml          # Development
├── docker-compose.test.yml         # Testing
├── Dockerfile.api
├── Dockerfile.web
├── nginx/
│   └── nginx.conf
└── scripts/
    ├── init-db.sh
    └── wait-for-it.sh
```

### docker-compose.yml (Ejemplo)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: heal
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: heal_platform
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  api:
    build:
      context: ..
      dockerfile: docker/Dockerfile.api
    environment:
      DATABASE_URL: postgresql://heal:${DB_PASSWORD}@postgres:5432/heal_platform
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "3002:3002"
    depends_on:
      - postgres
      - redis

  web-admin:
    build:
      context: ..
      dockerfile: docker/Dockerfile.web
      args:
        APP: web-admin
    ports:
      - "3000:80"
    depends_on:
      - api

  sync-worker:
    build:
      context: ..
      dockerfile: docker/Dockerfile.api
    command: ["node", "dist/jobs/sync.worker.js"]
    environment:
      DATABASE_URL: postgresql://heal:${DB_PASSWORD}@postgres:5432/heal_platform
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
  redis_data:
```

## 6. CI/CD Configuration

```
.github/
└── workflows/
    ├── ci.yml                      # Lint, test, build
    ├── deploy-staging.yml          # Deploy a staging
    ├── deploy-production.yml       # Deploy a producción
    └── db-migrate.yml              # Migraciones de DB
```

### ci.yml (Ejemplo)

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm test

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm build
```

## 7. Turborepo Configuration

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "lint": {
      "outputs": []
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "db:generate": {
      "cache": false
    },
    "db:migrate": {
      "cache": false
    }
  }
}
```
