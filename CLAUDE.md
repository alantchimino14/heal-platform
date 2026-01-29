# Heal Platform - Contexto del Proyecto

## Qué es
Plataforma de gestión para **Heal Chile** (centro de kinesiología). Funciona como:
1. **Interfaz operativa** sobre Medilink (más fácil y cómoda de usar)
2. **Herramienta de reportería** con datos de Medilink + Transbank
3. **Modelo operativo franquiciable** - el software es parte del paquete para replicar el modelo Heal

## Diferenciador Clave
Medilink gestiona lo clínico. **Heal gestiona el negocio**:
- Contratos de profesionales
- Metas de sesiones mensuales
- Liquidaciones con detalle
- Control de productividad
- Conciliación con Transbank

## Stack
- **Backend**: NestJS + Prisma + PostgreSQL
- **Frontend**: React + Vite + Tailwind
- **Database**: Supabase (PostgreSQL)
- **Sync**: Bidireccional con Medilink API (pendiente)

## Branding
- Color primario: `#5f7da1` (azul-gris)
- Color oscuro: `#3d556f`
- Estilo: Minimalista, profesional, mucho espacio blanco

## Arquitectura

```
HEAL PLATFORM
├── Portal Admin (web)
│   ├── Dashboard operativo
│   ├── Gestión de profesionales
│   ├── Contratos y metas
│   ├── Liquidaciones
│   ├── Reportería
│   └── Conciliación Transbank
│
├── Portal del Profesional (PWA/mobile)
│   ├── Mi mes (resumen)
│   ├── Mi agenda
│   ├── Mis métricas
│   └── Mis liquidaciones
│
└── Sync con Medilink (pendiente)
    ├── Pacientes → Bidireccional
    ├── Citas/Agenda → Bidireccional
    └── Atenciones/Boletas → Read only
```

## Modelo de Datos Nuevo (Enero 2026)

### Profesionales
- **ContratoProfesional**: Historial de contratos (HONORARIOS, PART_TIME, FULL_TIME, PRACTICANTE)
- **MetaMensual**: Objetivo de sesiones por mes, cumplimiento, bono
- **Liquidacion**: Documento mensual con detalle de pago
- **LiquidacionItem**: Items individuales (sesiones, bonos, descuentos)

### Conciliación Transbank
- **ImportacionTransbank**: Archivos Excel importados
- **TransaccionTransbank**: Transacciones parseadas, estado de conciliación

## API Endpoints Nuevos

### Profesionales (`/api/profesionales`)
```
GET  /:id/resumen             Dashboard del profesional
GET  /:id/contratos           Historial de contratos
GET  /:id/contrato-activo     Contrato vigente
POST /:id/contratos           Crear nuevo contrato

GET  /:id/metas               Historial de metas
GET  /:id/meta-actual         Meta del mes actual
POST /:id/metas               Crear meta mensual
PUT  /metas/:metaId           Actualizar meta

GET  /:id/liquidaciones       Historial de liquidaciones
GET  /liquidaciones/:id       Detalle de liquidación
POST /:id/liquidaciones/generar    Generar liquidación
POST /liquidaciones/:id/aprobar    Aprobar
POST /liquidaciones/:id/pagar      Marcar como pagada
```

### Conciliación (`/api/conciliacion`)
```
GET  /importaciones           Listar importaciones
POST /importaciones           Crear desde datos parseados
GET  /resumen                 Resumen de conciliación
GET  /pendientes              Transacciones sin conciliar
POST /transacciones/:id/conciliar  Conciliación manual
```

### Dashboard (`/api/dashboard`)
```
GET  /admin                   Dashboard administrativo
GET  /resumen                 Resumen rápido
GET  /equipo                  Métricas del equipo (metas, liquidaciones)
```

## Rutas Frontend

### Admin
```
/dashboard                    Panel principal + métricas equipo
/pacientes                    Gestión de pacientes
/sesiones                     Agenda
/pagos                        Pagos
/profesionales                Gestión de profesionales
```

### Portal del Profesional (PWA)
```
/portal/:profesionalId        Home (resumen del mes)
/portal/:profesionalId/agenda     Mi agenda semanal
/portal/:profesionalId/metricas   Mis métricas y progreso
/portal/:profesionalId/liquidaciones   Mis liquidaciones
```

## Comandos
```bash
pnpm dev          # Desarrollo (backend + frontend)
pnpm db:push      # Aplicar schema
pnpm db:seed      # Datos de prueba
pnpm db:studio    # Prisma Studio
```

## Estado Actual (Enero 2026)

### Implementado
- [x] Backend NestJS funcionando (localhost:3000)
- [x] Frontend React funcionando (localhost:5173)
- [x] Schema Prisma completo (profesionales, contratos, metas, liquidaciones, transbank)
- [x] Módulo de profesionales expandido (contratos, metas, liquidaciones)
- [x] Módulo de conciliación Transbank
- [x] Portal del Profesional (PWA mobile-first)
- [x] Dashboard Admin con métricas de equipo
- [x] PWA manifest configurado

### Pendiente
- [ ] Sync bidireccional con Medilink API
- [ ] Parser de Excel Transbank
- [ ] Autenticación de usuarios
- [ ] Notificaciones push (PWA)
- [ ] Tests automatizados

## Single Tenant
- NO es SaaS multi-tenant
- Es para UN solo centro (Heal Chile)
- El objetivo es franquiciar el modelo completo (software + operación)

## Notas de Desarrollo
- Fix aplicado: `engineType="binary"` en Prisma para Windows ARM64
- El Portal del Profesional usa diseño mobile-first con navegación inferior
- Transbank no tiene API pública para reportes, conciliación manual con Excel
