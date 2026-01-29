# Heal Platform

Plataforma de gestión para Heal Chile - Kinesiología. Funciona como capa superior a Medilink para resolver cobranza, tracking financiero y gestión clínica.

## Setup Rápido (con Supabase)

### 1. Crear BD en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto
2. Ve a **Settings > Database**
3. Copia el **Connection string (URI)** - "Transaction pooler"
4. Reemplaza `[YOUR-PASSWORD]` con tu password

### 2. Configurar

```bash
# Copiar variables de entorno
cp .env.example .env
cp packages/database/.env.example packages/database/.env

# Editar ambos .env y pegar tu DATABASE_URL de Supabase
```

### 3. Instalar y ejecutar

```bash
pnpm install       # Instalar dependencias
pnpm db:push       # Crear tablas en la BD
pnpm dev           # Levantar backend + frontend
```

### 4. Abrir

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api

## Stack

- **Frontend**: React + Vite + TailwindCSS + React Query
- **Backend**: NestJS + Prisma
- **Database**: PostgreSQL (Supabase)

## Estructura

```
heal-platform/
├── apps/
│   ├── api/          # Backend NestJS
│   └── web/          # Frontend React
├── packages/
│   └── database/     # Prisma schema
└── docs/             # Documentación técnica
```

## Comandos

```bash
pnpm dev              # Desarrollo (todo)
pnpm build            # Build producción
pnpm db:push          # Sincronizar schema con BD
pnpm db:studio        # Ver datos con Prisma Studio
pnpm db:seed          # Cargar datos de prueba
```

## API Endpoints

### Pacientes
- `GET /pacientes` - Listar con filtros
- `GET /pacientes/:id` - Detalle
- `GET /pacientes/:id/balance` - Balance financiero

### Sesiones
- `GET /sesiones` - Listar con filtros
- `PATCH /sesiones/:id` - Actualizar estados

### Pagos
- `GET /pagos` - Listar con filtros
- `POST /pagos` - Registrar pago (asigna automáticamente a sesiones)

### Dashboard
- `GET /dashboard/admin` - KPIs del mes
- `GET /dashboard/resumen` - Resumen rápido para header

## Estados de Sesión (independientes)

| Dimensión | Estados |
|-----------|---------|
| Agenda | AGENDADA, CONFIRMADA, CANCELADA, NO_ASISTIO |
| Atención | PENDIENTE, EN_CURSO, REALIZADA |
| Pago | NO_PAGADA, PAGO_PARCIAL, PAGADA |
| Boleta | NO_EMITIDA, EMITIDA |

## Pagos

- Un pago puede cubrir múltiples sesiones
- Pagos anticipados generan saldo a favor
- Pagos parciales actualizan `montoPagado` en la sesión
- Al registrar un pago, se asigna automáticamente a sesiones pendientes
