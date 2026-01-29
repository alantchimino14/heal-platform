# Sincronización con Medilink - Heal Platform

## 1. Arquitectura de Sincronización

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      ARQUITECTURA DE SINCRONIZACIÓN                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────┐                                                                │
│  │   MEDILINK  │                                                                │
│  │   REST API  │                                                                │
│  │  (Solo GET) │                                                                │
│  └──────┬──────┘                                                                │
│         │                                                                        │
│         │ HTTPS                                                                  │
│         ▼                                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                        SYNC SERVICE                                      │    │
│  │                                                                          │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │    │
│  │  │  Medilink   │  │   Data      │  │   Change    │  │   State     │    │    │
│  │  │   Client    │→│ Transformer │→│  Detector   │→│  Updater    │    │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │    │
│  │         │                                                  │             │    │
│  │         ▼                                                  ▼             │    │
│  │  ┌─────────────┐                                   ┌─────────────┐      │    │
│  │  │   Cache     │                                   │   Events    │      │    │
│  │  │   (Redis)   │                                   │   Emitter   │      │    │
│  │  └─────────────┘                                   └─────────────┘      │    │
│  │                                                                          │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
│         │                                                    │                  │
│         ▼                                                    ▼                  │
│  ┌─────────────┐                                     ┌─────────────┐            │
│  │  PostgreSQL │                                     │   BullMQ    │            │
│  │   (Data)    │                                     │  (Events)   │            │
│  └─────────────┘                                     └─────────────┘            │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 2. Estrategia de Sincronización

### 2.1 Polling Schedule

```typescript
// config/sync.config.ts

export const SYNC_CONFIG = {
  // Intervalos de sincronización por entidad
  intervals: {
    pacientes: 30 * 60 * 1000,    // 30 minutos
    sesiones: 5 * 60 * 1000,      // 5 minutos (más frecuente)
    atenciones: 5 * 60 * 1000,    // 5 minutos
    boletas: 15 * 60 * 1000,      // 15 minutos
    profesionales: 60 * 60 * 1000 // 1 hora
  },

  // Configuración de retry
  retry: {
    maxAttempts: 3,
    backoffMs: 5000,
    backoffMultiplier: 2
  },

  // Rate limiting
  rateLimit: {
    maxRequestsPerMinute: 60,
    maxConcurrent: 5
  },

  // Batch size
  batchSize: 100
};
```

### 2.2 Flujo de Sincronización

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        FLUJO DE SINCRONIZACIÓN                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  1. TRIGGER                                                                      │
│     ├── Cron Job (scheduled)                                                    │
│     ├── Manual (API call)                                                       │
│     └── Event (webhook - futuro)                                                │
│                                                                                  │
│  2. FETCH DATA                                                                   │
│     ├── Check last sync timestamp                                               │
│     ├── Build query params (desde última sync)                                  │
│     ├── Call Medilink API                                                       │
│     └── Handle pagination                                                        │
│                                                                                  │
│  3. TRANSFORM                                                                    │
│     ├── Map Medilink fields → Heal fields                                       │
│     ├── Normalize data types                                                    │
│     ├── Validate required fields                                                │
│     └── Handle null/missing values                                              │
│                                                                                  │
│  4. DETECT CHANGES                                                               │
│     ├── Compare with local data                                                 │
│     ├── Identify: NEW | UPDATED | UNCHANGED                                     │
│     └── Build change set                                                         │
│                                                                                  │
│  5. APPLY CHANGES                                                                │
│     ├── Create new records                                                      │
│     ├── Update existing records                                                 │
│     ├── Update syncedAt timestamp                                               │
│     └── Update session states                                                   │
│                                                                                  │
│  6. POST-SYNC                                                                    │
│     ├── Emit events (SESSION_REALIZED, BOLETA_EMITTED, etc.)                   │
│     ├── Run reconciliation                                                      │
│     ├── Update metrics cache                                                    │
│     └── Log sync results                                                        │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 3. Medilink Client

### 3.1 API Client

```typescript
// modules/sync/medilink/medilink.client.ts

import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { RateLimiter } from 'limiter';

@Injectable()
export class MedilinkClient {
  private client: AxiosInstance;
  private rateLimiter: RateLimiter;

  constructor(private config: ConfigService) {
    this.rateLimiter = new RateLimiter({
      tokensPerInterval: 60,
      interval: 'minute'
    });
  }

  // Inicializar cliente para un tenant específico
  initForTenant(tenant: Tenant): void {
    this.client = axios.create({
      baseURL: tenant.medilinkApiUrl,
      headers: {
        'Authorization': `Bearer ${this.decrypt(tenant.medilinkApiKey)}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // Interceptor para logging
    this.client.interceptors.response.use(
      response => response,
      error => {
        this.logError(error);
        throw new HttpException(
          `Medilink API Error: ${error.message}`,
          error.response?.status || 500
        );
      }
    );
  }

  // GET Pacientes
  async getPacientes(params?: MedilinkQueryParams): Promise<MedilinkPaciente[]> {
    await this.rateLimiter.removeTokens(1);
    const response = await this.client.get('/pacientes', { params });
    return response.data;
  }

  // GET Citas/Sesiones
  async getCitas(params?: MedilinkQueryParams): Promise<MedilinkCita[]> {
    await this.rateLimiter.removeTokens(1);
    const response = await this.client.get('/citas', { params });
    return response.data;
  }

  // GET Atenciones (sesiones realizadas)
  async getAtenciones(params?: MedilinkQueryParams): Promise<MedilinkAtencion[]> {
    await this.rateLimiter.removeTokens(1);
    const response = await this.client.get('/atenciones', { params });
    return response.data;
  }

  // GET Boletas
  async getBoletas(params?: MedilinkQueryParams): Promise<MedilinkBoleta[]> {
    await this.rateLimiter.removeTokens(1);
    const response = await this.client.get('/boletas', { params });
    return response.data;
  }

  // GET Profesionales
  async getProfesionales(): Promise<MedilinkProfesional[]> {
    await this.rateLimiter.removeTokens(1);
    const response = await this.client.get('/profesionales');
    return response.data;
  }

  // Paginación automática
  async getAllPaginated<T>(
    endpoint: string,
    params: MedilinkQueryParams = {}
  ): Promise<T[]> {
    const allItems: T[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      await this.rateLimiter.removeTokens(1);
      const response = await this.client.get(endpoint, {
        params: { ...params, page, limit: SYNC_CONFIG.batchSize }
      });

      allItems.push(...response.data.items);

      hasMore = response.data.items.length === SYNC_CONFIG.batchSize;
      page++;
    }

    return allItems;
  }
}
```

### 3.2 Tipos de Medilink

```typescript
// modules/sync/medilink/medilink.types.ts

// Respuesta de Medilink para Paciente
export interface MedilinkPaciente {
  id: string;
  rut: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  email?: string;
  telefono?: string;
  fechaNacimiento?: string;
  sexo?: 'M' | 'F';
  direccion?: string;
  comuna?: string;
  ciudad?: string;
  prevision?: string;
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion: string;
}

// Respuesta de Medilink para Cita
export interface MedilinkCita {
  id: string;
  pacienteId: string;
  profesionalId: string;
  servicioId?: string;
  fechaHora: string;
  duracion: number; // minutos
  estado: 'AGENDADA' | 'CONFIRMADA' | 'CANCELADA' | 'NO_SHOW';
  motivoConsulta?: string;
  observaciones?: string;
  precio: number;
  descuento?: number;
  fechaCreacion: string;
  fechaModificacion: string;
}

// Respuesta de Medilink para Atención (sesión realizada)
export interface MedilinkAtencion {
  id: string;
  citaId: string;
  pacienteId: string;
  profesionalId: string;
  fechaHora: string;
  diagnostico?: string;
  indicaciones?: string;
  observaciones?: string;
  fechaCreacion: string;
}

// Respuesta de Medilink para Boleta
export interface MedilinkBoleta {
  id: string;
  pacienteId: string;
  atencionIds: string[]; // Puede cubrir múltiples atenciones
  tipo: 'BOLETA' | 'FACTURA';
  numero: string;
  fecha: string;
  montoNeto: number;
  iva: number;
  montoTotal: number;
  estado: 'EMITIDA' | 'ANULADA';
  pdfUrl?: string;
  fechaCreacion: string;
}

// Query params para filtrar
export interface MedilinkQueryParams {
  page?: number;
  limit?: number;
  desde?: string; // ISO date
  hasta?: string; // ISO date
  modificadoDesde?: string; // Para sync incremental
}
```

## 4. Data Transformers

### 4.1 Transformer Base

```typescript
// modules/sync/medilink/transformers/base.transformer.ts

export abstract class BaseTransformer<TSource, TTarget> {
  abstract transform(source: TSource): TTarget;

  transformMany(sources: TSource[]): TTarget[] {
    return sources.map(s => this.transform(s));
  }

  protected parseDate(dateStr: string | null): Date | null {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  }

  protected normalizeRut(rut: string | null): string | null {
    if (!rut) return null;
    // Normalizar formato: 12.345.678-9 → 12345678-9
    return rut.replace(/\./g, '').toUpperCase();
  }

  protected normalizePhone(phone: string | null): string | null {
    if (!phone) return null;
    // Normalizar a formato +56XXXXXXXXX
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 9) return `+56${cleaned}`;
    if (cleaned.length === 11 && cleaned.startsWith('56')) return `+${cleaned}`;
    return phone;
  }
}
```

### 4.2 Paciente Transformer

```typescript
// modules/sync/medilink/transformers/paciente.transformer.ts

@Injectable()
export class PacienteTransformer extends BaseTransformer<MedilinkPaciente, PacienteInput> {

  transform(source: MedilinkPaciente): PacienteInput {
    return {
      medilinkId: source.id,
      rut: this.normalizeRut(source.rut),
      firstName: source.nombres.trim(),
      lastName: `${source.apellidoPaterno} ${source.apellidoMaterno || ''}`.trim(),
      email: source.email?.toLowerCase() || null,
      phone: this.normalizePhone(source.telefono),
      birthDate: this.parseDate(source.fechaNacimiento),
      gender: source.sexo || null,
      address: source.direccion || null,
      comuna: source.comuna || null,
      ciudad: source.ciudad || null,
      prevision: source.prevision || null,
      isActive: source.activo
    };
  }
}
```

### 4.3 Sesión Transformer

```typescript
// modules/sync/medilink/transformers/sesion.transformer.ts

@Injectable()
export class SesionTransformer extends BaseTransformer<MedilinkCita, SesionInput> {

  transform(source: MedilinkCita): SesionInput {
    return {
      medilinkId: source.id,
      pacienteMedilinkId: source.pacienteId,
      profesionalMedilinkId: source.profesionalId,
      servicioMedilinkId: source.servicioId || null,
      fechaHora: new Date(source.fechaHora),
      duracionMinutos: source.duracion,
      precioBase: source.precio,
      descuento: source.descuento || 0,
      precioFinal: source.precio - (source.descuento || 0),
      estadoAgenda: this.mapEstadoAgenda(source.estado),
      motivoConsulta: source.motivoConsulta || null,
      observaciones: source.observaciones || null
    };
  }

  private mapEstadoAgenda(estado: string): EstadoAgenda {
    const mapping: Record<string, EstadoAgenda> = {
      'AGENDADA': EstadoAgenda.AGENDADA,
      'CONFIRMADA': EstadoAgenda.CONFIRMADA,
      'CANCELADA': EstadoAgenda.CANCELADA,
      'NO_SHOW': EstadoAgenda.NO_SHOW
    };
    return mapping[estado] || EstadoAgenda.AGENDADA;
  }

  // Enriquecer con datos de atención
  enrichWithAtencion(sesion: SesionInput, atencion: MedilinkAtencion): SesionInput {
    return {
      ...sesion,
      medilinkAtencionId: atencion.id,
      estadoAtencion: EstadoAtencion.REALIZADA,
      diagnostico: atencion.diagnostico || sesion.diagnostico,
      observaciones: atencion.observaciones || sesion.observaciones
    };
  }
}
```

## 5. Sync Service

### 5.1 Main Sync Service

```typescript
// modules/sync/sync.service.ts

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private medilink: MedilinkClient,
    private pacienteTransformer: PacienteTransformer,
    private sesionTransformer: SesionTransformer,
    private boletaTransformer: BoletaTransformer,
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private cache: CacheService
  ) {}

  // Sincronización completa de un tenant
  async syncTenant(tenantId: string, options: SyncOptions = {}): Promise<SyncResult> {
    const tenant = await this.getTenantWithConfig(tenantId);

    if (!tenant.medilinkEnabled) {
      return { status: 'SKIPPED', reason: 'Medilink not enabled' };
    }

    this.medilink.initForTenant(tenant);

    const results: SyncResult = {
      tenantId,
      startedAt: new Date(),
      entities: {}
    };

    try {
      // Sync en orden de dependencias
      if (options.entities?.includes('profesionales') ?? true) {
        results.entities.profesionales = await this.syncProfesionales(tenant);
      }

      if (options.entities?.includes('pacientes') ?? true) {
        results.entities.pacientes = await this.syncPacientes(tenant);
      }

      if (options.entities?.includes('sesiones') ?? true) {
        results.entities.sesiones = await this.syncSesiones(tenant);
      }

      if (options.entities?.includes('boletas') ?? true) {
        results.entities.boletas = await this.syncBoletas(tenant);
      }

      results.status = 'COMPLETED';
      results.completedAt = new Date();

      // Actualizar timestamp de última sync
      await this.updateLastSyncTimestamp(tenantId);

      // Ejecutar reconciliación post-sync
      await this.runPostSyncReconciliation(tenantId);

    } catch (error) {
      results.status = 'FAILED';
      results.error = error.message;
      this.logger.error(`Sync failed for tenant ${tenantId}`, error.stack);
    }

    // Log resultado
    await this.logSyncResult(results);

    return results;
  }

  // Sync de pacientes
  private async syncPacientes(tenant: Tenant): Promise<EntitySyncResult> {
    const lastSync = tenant.lastMedilinkSync;
    const params: MedilinkQueryParams = lastSync
      ? { modificadoDesde: lastSync.toISOString() }
      : {};

    const medilinkPacientes = await this.medilink.getAllPaginated<MedilinkPaciente>(
      '/pacientes',
      params
    );

    const result: EntitySyncResult = {
      processed: medilinkPacientes.length,
      created: 0,
      updated: 0,
      errors: []
    };

    for (const mlPaciente of medilinkPacientes) {
      try {
        const data = this.pacienteTransformer.transform(mlPaciente);

        const existing = await this.prisma.paciente.findUnique({
          where: {
            tenantId_medilinkId: {
              tenantId: tenant.id,
              medilinkId: mlPaciente.id
            }
          }
        });

        if (existing) {
          await this.prisma.paciente.update({
            where: { id: existing.id },
            data: { ...data, syncedAt: new Date() }
          });
          result.updated++;
        } else {
          await this.prisma.paciente.create({
            data: {
              ...data,
              tenantId: tenant.id,
              syncedAt: new Date()
            }
          });
          result.created++;

          // Emitir evento
          this.eventEmitter.emit('paciente.created', { tenantId: tenant.id, data });
        }
      } catch (error) {
        result.errors.push({
          medilinkId: mlPaciente.id,
          error: error.message
        });
      }
    }

    return result;
  }

  // Sync de sesiones (citas + atenciones)
  private async syncSesiones(tenant: Tenant): Promise<EntitySyncResult> {
    const lastSync = tenant.lastMedilinkSync;
    const params: MedilinkQueryParams = lastSync
      ? { modificadoDesde: lastSync.toISOString() }
      : {};

    // Obtener citas y atenciones en paralelo
    const [citas, atenciones] = await Promise.all([
      this.medilink.getAllPaginated<MedilinkCita>('/citas', params),
      this.medilink.getAllPaginated<MedilinkAtencion>('/atenciones', params)
    ]);

    // Crear mapa de atenciones por citaId
    const atencionesMap = new Map(
      atenciones.map(a => [a.citaId, a])
    );

    const result: EntitySyncResult = {
      processed: citas.length,
      created: 0,
      updated: 0,
      errors: []
    };

    for (const cita of citas) {
      try {
        let data = this.sesionTransformer.transform(cita);

        // Enriquecer con atención si existe
        const atencion = atencionesMap.get(cita.id);
        if (atencion) {
          data = this.sesionTransformer.enrichWithAtencion(data, atencion);
        }

        // Resolver IDs locales
        const paciente = await this.findPacienteByMedilinkId(tenant.id, data.pacienteMedilinkId);
        const profesional = await this.findProfesionalByMedilinkId(tenant.id, data.profesionalMedilinkId);

        if (!paciente || !profesional) {
          result.errors.push({
            medilinkId: cita.id,
            error: 'Paciente o profesional no encontrado'
          });
          continue;
        }

        const existing = await this.prisma.sesion.findUnique({
          where: {
            tenantId_medilinkId: {
              tenantId: tenant.id,
              medilinkId: cita.id
            }
          }
        });

        if (existing) {
          const wasRealized = existing.estadoAtencion !== 'REALIZADA' &&
                             data.estadoAtencion === 'REALIZADA';

          await this.prisma.sesion.update({
            where: { id: existing.id },
            data: {
              ...data,
              pacienteId: paciente.id,
              profesionalId: profesional.id,
              syncedAt: new Date()
            }
          });
          result.updated++;

          // Emitir evento si cambió a realizada
          if (wasRealized) {
            this.eventEmitter.emit('sesion.realized', {
              tenantId: tenant.id,
              sesionId: existing.id
            });
          }
        } else {
          const created = await this.prisma.sesion.create({
            data: {
              ...data,
              tenantId: tenant.id,
              pacienteId: paciente.id,
              profesionalId: profesional.id,
              syncedAt: new Date()
            }
          });
          result.created++;

          this.eventEmitter.emit('sesion.created', {
            tenantId: tenant.id,
            sesionId: created.id
          });
        }
      } catch (error) {
        result.errors.push({
          medilinkId: cita.id,
          error: error.message
        });
      }
    }

    return result;
  }

  // Sync de boletas
  private async syncBoletas(tenant: Tenant): Promise<EntitySyncResult> {
    const lastSync = tenant.lastMedilinkSync;
    const params: MedilinkQueryParams = lastSync
      ? { modificadoDesde: lastSync.toISOString() }
      : {};

    const boletas = await this.medilink.getAllPaginated<MedilinkBoleta>(
      '/boletas',
      params
    );

    const result: EntitySyncResult = {
      processed: boletas.length,
      created: 0,
      updated: 0,
      errors: []
    };

    for (const mlBoleta of boletas) {
      try {
        const data = this.boletaTransformer.transform(mlBoleta);

        // Resolver paciente
        const paciente = await this.findPacienteByMedilinkId(
          tenant.id,
          mlBoleta.pacienteId
        );

        if (!paciente) {
          result.errors.push({
            medilinkId: mlBoleta.id,
            error: 'Paciente no encontrado'
          });
          continue;
        }

        const existing = await this.prisma.boleta.findUnique({
          where: {
            tenantId_medilinkId: {
              tenantId: tenant.id,
              medilinkId: mlBoleta.id
            }
          }
        });

        if (existing) {
          await this.prisma.boleta.update({
            where: { id: existing.id },
            data: { ...data, syncedAt: new Date() }
          });
          result.updated++;
        } else {
          const created = await this.prisma.boleta.create({
            data: {
              ...data,
              tenantId: tenant.id,
              pacienteId: paciente.id,
              syncedAt: new Date()
            }
          });
          result.created++;

          // Asociar boleta a sesiones
          await this.associateBoletaToSesiones(
            tenant.id,
            created.id,
            mlBoleta.atencionIds
          );

          this.eventEmitter.emit('boleta.emitted', {
            tenantId: tenant.id,
            boletaId: created.id
          });
        }
      } catch (error) {
        result.errors.push({
          medilinkId: mlBoleta.id,
          error: error.message
        });
      }
    }

    return result;
  }

  // Asociar boleta a sesiones
  private async associateBoletaToSesiones(
    tenantId: string,
    boletaId: string,
    atencionIds: string[]
  ): Promise<void> {
    await this.prisma.sesion.updateMany({
      where: {
        tenantId,
        medilinkAtencionId: { in: atencionIds }
      },
      data: {
        boletaId,
        estadoBoleta: EstadoBoleta.EMITIDA
      }
    });
  }
}
```

## 6. Sync Workers

### 6.1 Scheduled Sync Worker

```typescript
// jobs/processors/sync.processor.ts

@Processor('sync')
export class SyncProcessor {
  private readonly logger = new Logger(SyncProcessor.name);

  constructor(private syncService: SyncService) {}

  @Process('scheduled-sync')
  async handleScheduledSync(job: Job<{ tenantId: string }>) {
    this.logger.log(`Starting scheduled sync for tenant ${job.data.tenantId}`);

    try {
      const result = await this.syncService.syncTenant(job.data.tenantId);
      this.logger.log(`Sync completed: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`Sync failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('manual-sync')
  async handleManualSync(job: Job<{ tenantId: string; entities: string[] }>) {
    return this.syncService.syncTenant(job.data.tenantId, {
      entities: job.data.entities,
      fullSync: true
    });
  }
}

// jobs/schedulers/sync.scheduler.ts

@Injectable()
export class SyncScheduler {
  constructor(
    @InjectQueue('sync') private syncQueue: Queue,
    private prisma: PrismaService
  ) {}

  @Cron('*/5 * * * *') // Cada 5 minutos
  async scheduleSyncJobs() {
    const tenants = await this.prisma.tenant.findMany({
      where: { medilinkEnabled: true, isActive: true }
    });

    for (const tenant of tenants) {
      await this.syncQueue.add(
        'scheduled-sync',
        { tenantId: tenant.id },
        {
          jobId: `sync-${tenant.id}-${Date.now()}`,
          removeOnComplete: true,
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 }
        }
      );
    }
  }
}
```

## 7. Reconciliación

### 7.1 Post-Sync Reconciliation

```typescript
// modules/reconciliation/reconciliation.service.ts

@Injectable()
export class ReconciliationService {

  // Ejecutar después de cada sync
  async runPostSyncReconciliation(tenantId: string): Promise<ReconciliationResult> {
    const issues: ReconciliationIssue[] = [];

    // 1. Verificar sesiones realizadas sin pago (más de X días)
    const unpaidRealizedSessions = await this.findUnpaidRealizedSessions(
      tenantId,
      7 // días
    );
    for (const session of unpaidRealizedSessions) {
      issues.push({
        type: 'SESSION_WITHOUT_PAYMENT',
        severity: 'WARNING',
        sessionId: session.id,
        details: `Sesión realizada hace ${session.daysSince} días sin pago`
      });
    }

    // 2. Verificar sesiones sin boleta (más de 5 días)
    const sessionsWithoutBoleta = await this.findSessionsWithoutBoleta(
      tenantId,
      5 // días
    );
    for (const session of sessionsWithoutBoleta) {
      issues.push({
        type: 'SESSION_WITHOUT_BOLETA',
        severity: 'ERROR',
        sessionId: session.id,
        details: `Sesión realizada hace ${session.daysSince} días sin boleta`
      });
    }

    // 3. Verificar montos boleta vs precio sesión
    const amountMismatches = await this.findBoletaAmountMismatches(tenantId);
    for (const mismatch of amountMismatches) {
      issues.push({
        type: 'BOLETA_AMOUNT_MISMATCH',
        severity: 'WARNING',
        sessionId: mismatch.sessionId,
        boletaId: mismatch.boletaId,
        details: `Monto boleta ($${mismatch.boletaAmount}) ≠ precio sesión ($${mismatch.sessionAmount})`
      });
    }

    // 4. Actualizar saldos de pacientes
    await this.updatePatientBalances(tenantId);

    // Notificar si hay issues críticos
    const criticalIssues = issues.filter(i => i.severity === 'ERROR');
    if (criticalIssues.length > 0) {
      await this.notifyAdmins(tenantId, criticalIssues);
    }

    return {
      tenantId,
      timestamp: new Date(),
      issuesFound: issues.length,
      issues
    };
  }

  // Actualizar saldo de todos los pacientes
  private async updatePatientBalances(tenantId: string): Promise<void> {
    // Calcular saldo pendiente por paciente
    await this.prisma.$executeRaw`
      UPDATE pacientes p
      SET
        "saldoPendiente" = COALESCE((
          SELECT SUM(s."precioFinal" - s."montoPagado")
          FROM sesiones s
          WHERE s."pacienteId" = p.id
          AND s."estadoAtencion" = 'REALIZADA'
          AND s."estadoPago" IN ('NO_PAGADA', 'PAGO_PARCIAL')
        ), 0),
        "saldoAFavor" = COALESCE((
          SELECT SUM(pg."saldoDisponible")
          FROM pagos pg
          WHERE pg."pacienteId" = p.id
          AND pg.estado = 'CONFIRMADO'
          AND pg."saldoDisponible" > 0
        ), 0),
        "updatedAt" = NOW()
      WHERE p."tenantId" = ${tenantId}
    `;
  }
}
```

## 8. Handling de Errores y Retry

```typescript
// modules/sync/sync.error-handler.ts

@Injectable()
export class SyncErrorHandler {

  async handleSyncError(
    tenantId: string,
    entity: string,
    error: Error,
    attempt: number
  ): Promise<SyncErrorAction> {
    // Clasificar error
    const errorType = this.classifyError(error);

    switch (errorType) {
      case 'RATE_LIMITED':
        // Esperar y reintentar
        return {
          action: 'RETRY',
          delayMs: 60000 * attempt, // Backoff exponencial
          message: 'Rate limited by Medilink API'
        };

      case 'AUTH_ERROR':
        // Notificar admin, no reintentar
        await this.notifyAuthError(tenantId);
        return {
          action: 'STOP',
          message: 'Authentication error - check Medilink credentials'
        };

      case 'NOT_FOUND':
        // Loguear y continuar
        return {
          action: 'SKIP',
          message: 'Resource not found in Medilink'
        };

      case 'NETWORK_ERROR':
        if (attempt < SYNC_CONFIG.retry.maxAttempts) {
          return {
            action: 'RETRY',
            delayMs: SYNC_CONFIG.retry.backoffMs * Math.pow(2, attempt),
            message: 'Network error, retrying...'
          };
        }
        return { action: 'FAIL', message: 'Max retries exceeded' };

      default:
        return { action: 'FAIL', message: error.message };
    }
  }

  private classifyError(error: Error): string {
    if (error.message.includes('429') || error.message.includes('rate limit')) {
      return 'RATE_LIMITED';
    }
    if (error.message.includes('401') || error.message.includes('403')) {
      return 'AUTH_ERROR';
    }
    if (error.message.includes('404')) {
      return 'NOT_FOUND';
    }
    if (error.message.includes('ECONNREFUSED') || error.message.includes('timeout')) {
      return 'NETWORK_ERROR';
    }
    return 'UNKNOWN';
  }
}
```
