import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';

// Types
export interface Paciente {
  id: string;
  rut: string | null;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  prevision: string | null;
  saldoPendiente: number;
  saldoAFavor: number;
  isActive: boolean;
  _count?: {
    sesiones: number;
    pagos: number;
  };
}

export interface Sesion {
  id: string;
  fechaHora: string;
  duracionMinutos: number;
  precioFinal: number;
  montoPagado: number;
  estadoAgenda: string;
  estadoAtencion: string;
  estadoPago: string;
  estadoBoleta: string;
  paciente: {
    id: string;
    firstName: string;
    lastName: string;
    rut: string | null;
  };
  profesional: {
    id: string;
    firstName: string;
    lastName: string;
  };
  servicio?: {
    id: string;
    nombre: string;
  };
}

export interface Pago {
  id: string;
  numeroPago: number;
  monto: number;
  montoAplicado: number;
  saldoDisponible: number;
  metodoPago: string;
  estado: string;
  tipoPago: string;
  fechaPago: string;
  paciente: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface DashboardData {
  kpis: {
    ventasTotales: number;
    cobranzas: number;
    deudaPendiente: number;
    saldosAFavor: number;
    pacientesActivos: number;
    sesionesRealizadas: number;
    tasaAdherencia: number;
  };
  topDeudores: Array<{
    id: string;
    nombre: string;
    deuda: number;
  }>;
}

// Pacientes
export function usePacientes(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['pacientes', params],
    queryFn: async () => {
      const { data } = await api.get('/pacientes', { params });
      return data;
    },
  });
}

export function usePaciente(id: string) {
  return useQuery({
    queryKey: ['paciente', id],
    queryFn: async () => {
      const { data } = await api.get(`/pacientes/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function usePacienteBalance(id: string) {
  return useQuery({
    queryKey: ['paciente-balance', id],
    queryFn: async () => {
      const { data } = await api.get(`/pacientes/${id}/balance`);
      return data;
    },
    enabled: !!id,
  });
}

// Sesiones
export function useSesiones(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['sesiones', params],
    queryFn: async () => {
      const { data } = await api.get('/sesiones', { params });
      return data;
    },
  });
}

export function useSesion(id: string) {
  return useQuery({
    queryKey: ['sesion', id],
    queryFn: async () => {
      const { data } = await api.get(`/sesiones/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useUpdateSesion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string } & Record<string, unknown>) => {
      const { id, ...data } = payload;
      const response = await api.patch(`/sesiones/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sesiones'] });
      queryClient.invalidateQueries({ queryKey: ['paciente-balance'] });
    },
  });
}

// Pagos
export function usePagos(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['pagos', params],
    queryFn: async () => {
      const { data } = await api.get('/pagos', { params });
      return data;
    },
  });
}

export function useCreatePago() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await api.post('/pagos', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagos'] });
      queryClient.invalidateQueries({ queryKey: ['pacientes'] });
      queryClient.invalidateQueries({ queryKey: ['sesiones'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Dashboard
export function useDashboard(fechaDesde: string, fechaHasta: string) {
  return useQuery({
    queryKey: ['dashboard', fechaDesde, fechaHasta],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/admin', {
        params: { fechaDesde, fechaHasta },
      });
      return data as DashboardData;
    },
  });
}

export function useResumenRapido() {
  return useQuery({
    queryKey: ['resumen-rapido'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/resumen');
      return data;
    },
    refetchInterval: 60000, // Refresh every minute
  });
}

export interface MetricasEquipo {
  periodo: { mes: number; anio: number };
  resumen: {
    totalProfesionales: number;
    conMeta: number;
    cumplieronMeta: number;
    porcentajeCumplimiento: number;
    totalSesionesEquipo: number;
  };
  equipo: Array<{
    id: string;
    nombre: string;
    especialidad: string | null;
    color: string | null;
    tipoContrato: string | null;
    meta: {
      objetivo: number;
      realizadas: number;
      cumplimiento: number;
      cumplida: boolean;
    } | null;
    sesionesDelMes: number;
  }>;
  liquidacionesPendientes: Array<{
    id: string;
    profesional: string;
    mes: number;
    anio: number;
    estado: string;
    totalLiquido: number;
  }>;
}

export function useMetricasEquipo() {
  return useQuery({
    queryKey: ['metricas-equipo'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/equipo');
      return data as MetricasEquipo;
    },
    refetchInterval: 120000, // Refresh every 2 minutes
  });
}

// Profesionales
export interface Profesional {
  id: string;
  firstName: string;
  lastName: string;
  rut: string | null;
  email: string | null;
  phone: string | null;
  especialidad: string | null;
  color: string | null;
  isActive: boolean;
  _count?: {
    sesiones: number;
    planesTerapeuticos: number;
  };
  preciosPersonalizados?: Array<{
    id: string;
    precio: number;
    servicio: {
      id: string;
      nombre: string;
      precio: number;
    };
  }>;
}

export function useProfesionales(params?: { search?: string; isActive?: boolean }) {
  return useQuery({
    queryKey: ['profesionales', params],
    queryFn: async () => {
      const { data } = await api.get('/profesionales', { params });
      return data as Profesional[];
    },
  });
}

export function useProfesional(id: string) {
  return useQuery({
    queryKey: ['profesional', id],
    queryFn: async () => {
      const { data } = await api.get(`/profesionales/${id}`);
      return data as Profesional;
    },
    enabled: !!id,
  });
}

export function useProfesionalMetricas(id: string, params?: { desde?: string; hasta?: string }) {
  return useQuery({
    queryKey: ['profesional-metricas', id, params],
    queryFn: async () => {
      const { data } = await api.get(`/profesionales/${id}/metricas`, { params });
      return data as {
        totalSesiones: number;
        sesionesRealizadas: number;
        sesionesPendientes: number;
        ingresosTotales: number;
        ingresosCobrados: number;
        ingresosPendientes: number;
        sesionesPagadas: number;
        sesionesSinPago: number;
        metaActual: {
          sesionesObjetivo: number;
          sesionesRealizadas: number;
          cumplimiento: number;
          metaCumplida: boolean;
        } | null;
      };
    },
    enabled: !!id,
  });
}

export function useProfesionalSesiones(
  id: string,
  params?: { desde?: string; hasta?: string; estadoAtencion?: string; page?: number; limit?: number }
) {
  return useQuery({
    queryKey: ['profesional-sesiones', id, params],
    queryFn: async () => {
      const { data } = await api.get(`/profesionales/${id}/sesiones`, { params });
      return data;
    },
    enabled: !!id,
  });
}

export function useProfesionalIngresos(
  id: string,
  params: { desde: string; hasta: string; agrupacion?: 'dia' | 'semana' | 'mes' }
) {
  return useQuery({
    queryKey: ['profesional-ingresos', id, params],
    queryFn: async () => {
      const { data } = await api.get(`/profesionales/${id}/ingresos`, { params });
      return data as Array<{
        periodo: string;
        generado: number;
        cobrado: number;
        sesiones: number;
      }>;
    },
    enabled: !!id && !!params.desde && !!params.hasta,
  });
}

export function useCreateProfesional() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      firstName: string;
      lastName: string;
      rut?: string;
      email?: string;
      phone?: string;
      especialidad?: string;
      color?: string;
    }) => {
      const response = await api.post('/profesionales', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profesionales'] });
    },
  });
}

export function useUpdateProfesional() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Profesional>) => {
      const response = await api.put(`/profesionales/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profesionales'] });
      queryClient.invalidateQueries({ queryKey: ['profesional'] });
    },
  });
}

// Servicios
export interface Servicio {
  id: string;
  codigo: string | null;
  nombre: string;
  descripcion: string | null;
  categoria: 'KINESIOLOGIA' | 'ENTRENAMIENTO' | 'EVALUACION' | 'OTRO';
  precio: number;
  duracionMinutos: number;
  isActive: boolean;
  _count?: {
    sesiones: number;
  };
  preciosPorProfesional?: Array<{
    id: string;
    precio: number;
    profesional: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }>;
}

export function useServicios(params?: { categoria?: string; isActive?: boolean; search?: string }) {
  return useQuery({
    queryKey: ['servicios', params],
    queryFn: async () => {
      const { data } = await api.get('/servicios', { params });
      return data as Servicio[];
    },
  });
}

export function useServicio(id: string) {
  return useQuery({
    queryKey: ['servicio', id],
    queryFn: async () => {
      const { data } = await api.get(`/servicios/${id}`);
      return data as Servicio;
    },
    enabled: !!id,
  });
}

export function useServicioCategorias() {
  return useQuery({
    queryKey: ['servicio-categorias'],
    queryFn: async () => {
      const { data } = await api.get('/servicios/categorias');
      return data as string[];
    },
  });
}

export function useServicioPrecioProfesional(servicioId: string, profesionalId: string) {
  return useQuery({
    queryKey: ['servicio-precio', servicioId, profesionalId],
    queryFn: async () => {
      const { data } = await api.get(`/servicios/${servicioId}/precio/${profesionalId}`);
      return data as number;
    },
    enabled: !!servicioId && !!profesionalId,
  });
}

export function useCreateServicio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      nombre: string;
      codigo?: string;
      descripcion?: string;
      categoria?: string;
      precio: number;
      duracionMinutos?: number;
    }) => {
      const response = await api.post('/servicios', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicios'] });
    },
  });
}

export function useUpdateServicio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Servicio>) => {
      const response = await api.put(`/servicios/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicios'] });
      queryClient.invalidateQueries({ queryKey: ['servicio'] });
    },
  });
}

export function useSetServicioPrecioProfesional() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ servicioId, profesionalId, precio }: {
      servicioId: string;
      profesionalId: string;
      precio: number;
    }) => {
      const response = await api.post(`/servicios/${servicioId}/precios-profesional`, {
        profesionalId,
        precio,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicios'] });
      queryClient.invalidateQueries({ queryKey: ['servicio'] });
      queryClient.invalidateQueries({ queryKey: ['profesionales'] });
      queryClient.invalidateQueries({ queryKey: ['servicio-precio'] });
    },
  });
}

export function useRemoveServicioPrecioProfesional() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ servicioId, profesionalId }: { servicioId: string; profesionalId: string }) => {
      const response = await api.delete(`/servicios/${servicioId}/precios-profesional/${profesionalId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicios'] });
      queryClient.invalidateQueries({ queryKey: ['servicio'] });
      queryClient.invalidateQueries({ queryKey: ['profesionales'] });
      queryClient.invalidateQueries({ queryKey: ['servicio-precio'] });
    },
  });
}

// Productos
export interface Producto {
  id: string;
  codigo: string | null;
  nombre: string;
  descripcion: string | null;
  categoria: string | null;
  precio: number;
  costo: number | null;
  stock: number;
  stockMinimo: number;
  isActive: boolean;
  _count?: {
    ventaItems: number;
  };
}

export function useProductos(params?: { search?: string; categoria?: string; isActive?: boolean }) {
  return useQuery({
    queryKey: ['productos', params],
    queryFn: async () => {
      const { data } = await api.get('/productos', { params });
      return data as Producto[];
    },
  });
}

export function useProducto(id: string) {
  return useQuery({
    queryKey: ['producto', id],
    queryFn: async () => {
      const { data } = await api.get(`/productos/${id}`);
      return data as Producto;
    },
    enabled: !!id,
  });
}

export function useProductoCategorias() {
  return useQuery({
    queryKey: ['producto-categorias'],
    queryFn: async () => {
      const { data } = await api.get('/productos/categorias');
      return data as string[];
    },
  });
}

export function useProductosStockBajo() {
  return useQuery({
    queryKey: ['productos-stock-bajo'],
    queryFn: async () => {
      const { data } = await api.get('/productos/stock-bajo');
      return data as Producto[];
    },
  });
}

export function useCreateProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      codigo?: string;
      nombre: string;
      descripcion?: string;
      categoria?: string;
      precio: number;
      costo?: number;
      stock?: number;
      stockMinimo?: number;
    }) => {
      const response = await api.post('/productos', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}

export function useUpdateProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Producto>) => {
      const response = await api.put(`/productos/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      queryClient.invalidateQueries({ queryKey: ['producto'] });
    },
  });
}

export function useAdjustProductoStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, cantidad, motivo }: { id: string; cantidad: number; motivo?: string }) => {
      const response = await api.put(`/productos/${id}/stock`, { cantidad, motivo });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      queryClient.invalidateQueries({ queryKey: ['producto'] });
      queryClient.invalidateQueries({ queryKey: ['productos-stock-bajo'] });
    },
  });
}

export function useDeleteProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/productos/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}

// Ventas
export type MetodoPago = 'EFECTIVO' | 'REDCOMPRA_DEBITO' | 'REDCOMPRA_CREDITO' | 'TRANSFERENCIA';
export type EstadoVenta = 'COMPLETADA' | 'ANULADA';

export interface VentaItem {
  id: string;
  cantidad: number;
  precioUnit: number;
  descuento: number;
  total: number;
  producto: {
    id: string;
    nombre: string;
    codigo: string | null;
  };
}

export interface Venta {
  id: string;
  numeroVenta: number;
  fechaVenta: string;
  subtotal: number;
  descuento: number;
  total: number;
  metodoPago: MetodoPago;
  estado: EstadoVenta;
  referencia: string | null;
  descripcion: string | null;
  notas: string | null;
  paciente?: {
    id: string;
    firstName: string;
    lastName: string;
    rut: string | null;
  } | null;
  items: VentaItem[];
}

export function useVentas(params?: {
  search?: string;
  pacienteId?: string;
  metodoPago?: MetodoPago;
  estado?: EstadoVenta;
  desde?: string;
  hasta?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['ventas', params],
    queryFn: async () => {
      const { data } = await api.get('/ventas', { params });
      return data as {
        data: Venta[];
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      };
    },
  });
}

export function useVenta(id: string) {
  return useQuery({
    queryKey: ['venta', id],
    queryFn: async () => {
      const { data } = await api.get(`/ventas/${id}`);
      return data as Venta;
    },
    enabled: !!id,
  });
}

export function useVentasResumen(params?: { desde?: string; hasta?: string }) {
  return useQuery({
    queryKey: ['ventas-resumen', params],
    queryFn: async () => {
      const { data } = await api.get('/ventas/resumen', { params });
      return data as {
        totalVentas: number;
        montoTotal: number;
        porMetodo: Record<MetodoPago, { cantidad: number; monto: number }>;
      };
    },
  });
}

export function useCreateVenta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      pacienteId?: string;
      items: Array<{
        productoId: string;
        cantidad: number;
        precioUnit?: number;
        descuento?: number;
      }>;
      descuento?: number;
      metodoPago: MetodoPago;
      referencia?: string;
      descripcion?: string;
      notas?: string;
    }) => {
      const response = await api.post('/ventas', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      queryClient.invalidateQueries({ queryKey: ['ventas-resumen'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      queryClient.invalidateQueries({ queryKey: ['productos-stock-bajo'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useAnularVenta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.put(`/ventas/${id}/anular`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      queryClient.invalidateQueries({ queryKey: ['venta'] });
      queryClient.invalidateQueries({ queryKey: ['ventas-resumen'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      queryClient.invalidateQueries({ queryKey: ['productos-stock-bajo'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ============================================================================
// PORTAL DEL PROFESIONAL
// ============================================================================

export interface ResumenProfesional {
  profesional: {
    id: string;
    nombre: string;
    especialidad: string | null;
  };
  mesActual: {
    mes: number;
    anio: number;
    sesionesRealizadas: number;
    meta: {
      objetivo: number;
      cumplimiento: number;
      cumplida: boolean;
      bonoDisponible: boolean;
    } | null;
  };
  hoy: {
    total: number;
    realizadas: number;
    pendientes: number;
    sesiones: Array<{
      id: string;
      fechaHora: string;
      estadoAtencion: string;
      paciente: { firstName: string; lastName: string };
      servicio: { nombre: string } | null;
    }>;
  };
  proximasSesiones: Array<{
    id: string;
    fechaHora: string;
    paciente: { firstName: string; lastName: string };
    servicio: { nombre: string } | null;
  }>;
  contrato: {
    tipo: string;
    fechaInicio: string;
    tarifaPorSesion: number | null;
  } | null;
  ultimaLiquidacion: {
    mes: number;
    anio: number;
    estado: string;
    totalLiquido: number;
  } | null;
}

export function useProfesionalResumen(id: string) {
  return useQuery({
    queryKey: ['profesional-resumen', id],
    queryFn: async () => {
      const { data } = await api.get(`/profesionales/${id}/resumen`);
      return data as ResumenProfesional;
    },
    enabled: !!id,
    refetchInterval: 60000, // Actualizar cada minuto
  });
}

// Contratos
export interface Contrato {
  id: string;
  tipo: 'HONORARIOS' | 'PART_TIME' | 'FULL_TIME' | 'PRACTICANTE';
  fechaInicio: string;
  fechaFin: string | null;
  horasSemanales: number | null;
  tarifaPorSesion: number | null;
  salarioBase: number | null;
  porcentajeComision: number | null;
  bonoMetaCumplida: number | null;
  notas: string | null;
  isActive: boolean;
}

export function useProfesionalContratos(id: string) {
  return useQuery({
    queryKey: ['profesional-contratos', id],
    queryFn: async () => {
      const { data } = await api.get(`/profesionales/${id}/contratos`);
      return data as Contrato[];
    },
    enabled: !!id,
  });
}

export function useProfesionalContratoActivo(id: string) {
  return useQuery({
    queryKey: ['profesional-contrato-activo', id],
    queryFn: async () => {
      const { data } = await api.get(`/profesionales/${id}/contrato-activo`);
      return data as Contrato | null;
    },
    enabled: !!id,
  });
}

export function useCreateContrato() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ profesionalId, ...data }: {
      profesionalId: string;
      tipo: string;
      fechaInicio: string;
      fechaFin?: string;
      horasSemanales?: number;
      tarifaPorSesion?: number;
      salarioBase?: number;
      porcentajeComision?: number;
      bonoMetaCumplida?: number;
      notas?: string;
    }) => {
      const response = await api.post(`/profesionales/${profesionalId}/contratos`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profesional-contratos'] });
      queryClient.invalidateQueries({ queryKey: ['profesional-contrato-activo'] });
      queryClient.invalidateQueries({ queryKey: ['profesionales'] });
    },
  });
}

// Metas
export interface MetaMensual {
  id: string;
  mes: number;
  anio: number;
  sesionesObjetivo: number;
  sesionesRealizadas: number;
  cumplimiento: number;
  metaCumplida: boolean;
  bonoMonto: number | null;
  bonoOtorgado: boolean;
  notas: string | null;
}

export function useProfesionalMetas(id: string, params?: { anio?: number; limit?: number }) {
  return useQuery({
    queryKey: ['profesional-metas', id, params],
    queryFn: async () => {
      const { data } = await api.get(`/profesionales/${id}/metas`, { params });
      return data as MetaMensual[];
    },
    enabled: !!id,
  });
}

export function useProfesionalMetaActual(id: string) {
  return useQuery({
    queryKey: ['profesional-meta-actual', id],
    queryFn: async () => {
      const { data } = await api.get(`/profesionales/${id}/meta-actual`);
      return data as MetaMensual | null;
    },
    enabled: !!id,
  });
}

export function useCreateMeta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ profesionalId, ...data }: {
      profesionalId: string;
      mes: number;
      anio: number;
      sesionesObjetivo: number;
      bonoMonto?: number;
      notas?: string;
    }) => {
      const response = await api.post(`/profesionales/${profesionalId}/metas`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profesional-metas'] });
      queryClient.invalidateQueries({ queryKey: ['profesional-meta-actual'] });
      queryClient.invalidateQueries({ queryKey: ['profesional-resumen'] });
    },
  });
}

export function useUpdateMeta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ metaId, ...data }: {
      metaId: string;
      sesionesObjetivo?: number;
      bonoMonto?: number;
      bonoOtorgado?: boolean;
      notas?: string;
    }) => {
      const response = await api.put(`/profesionales/metas/${metaId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profesional-metas'] });
      queryClient.invalidateQueries({ queryKey: ['profesional-meta-actual'] });
      queryClient.invalidateQueries({ queryKey: ['profesional-resumen'] });
    },
  });
}

// Liquidaciones
export interface LiquidacionItem {
  id: string;
  tipo: string;
  concepto: string;
  descripcion: string | null;
  cantidad: number | null;
  valorUnitario: number | null;
  monto: number;
  esDescuento: boolean;
}

export interface Liquidacion {
  id: string;
  numero: number;
  mes: number;
  anio: number;
  sesionesTotales: number;
  sesionesRealizadas: number;
  ingresosSesiones: number;
  ingresosComision: number;
  bonoMeta: number;
  otrosBonos: number;
  descuentos: number;
  anticipos: number;
  totalBruto: number;
  totalDescuentos: number;
  totalLiquido: number;
  estado: 'BORRADOR' | 'PENDIENTE' | 'APROBADA' | 'PAGADA' | 'RECHAZADA';
  fechaGeneracion: string;
  fechaAprobacion: string | null;
  fechaPago: string | null;
  metodoPago: string | null;
  referenciaPago: string | null;
  notas: string | null;
  profesional?: {
    id: string;
    firstName: string;
    lastName: string;
    rut: string | null;
  };
  items?: LiquidacionItem[];
}

export function useProfesionalLiquidaciones(id: string, params?: { anio?: number; limit?: number }) {
  return useQuery({
    queryKey: ['profesional-liquidaciones', id, params],
    queryFn: async () => {
      const { data } = await api.get(`/profesionales/${id}/liquidaciones`, { params });
      return data as Liquidacion[];
    },
    enabled: !!id,
  });
}

export function useLiquidacion(id: string) {
  return useQuery({
    queryKey: ['liquidacion', id],
    queryFn: async () => {
      const { data } = await api.get(`/profesionales/liquidaciones/${id}`);
      return data as Liquidacion;
    },
    enabled: !!id,
  });
}

export function useGenerarLiquidacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ profesionalId, mes, anio }: {
      profesionalId: string;
      mes: number;
      anio: number;
    }) => {
      const response = await api.post(`/profesionales/${profesionalId}/liquidaciones/generar`, { mes, anio });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profesional-liquidaciones'] });
    },
  });
}

export function useAprobarLiquidacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ liquidacionId, notas }: { liquidacionId: string; notas?: string }) => {
      const response = await api.post(`/profesionales/liquidaciones/${liquidacionId}/aprobar`, { notas });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profesional-liquidaciones'] });
      queryClient.invalidateQueries({ queryKey: ['liquidacion'] });
    },
  });
}

export function usePagarLiquidacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ liquidacionId, metodoPago, referenciaPago, notas }: {
      liquidacionId: string;
      metodoPago: string;
      referenciaPago?: string;
      notas?: string;
    }) => {
      const response = await api.post(`/profesionales/liquidaciones/${liquidacionId}/pagar`, {
        metodoPago,
        referenciaPago,
        notas,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profesional-liquidaciones'] });
      queryClient.invalidateQueries({ queryKey: ['liquidacion'] });
      queryClient.invalidateQueries({ queryKey: ['profesional-metas'] });
    },
  });
}
