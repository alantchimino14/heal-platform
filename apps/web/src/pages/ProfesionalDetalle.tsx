import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft,
  User,
  FileText,
  Target,
  Wallet,
  Edit3,
  Plus,
  Check,
  X,
  Calendar,
  TrendingUp,
  DollarSign,
  Award,
  Clock,
  AlertCircle,
  ChevronRight,
  Briefcase,
  Phone,
  Mail,
  CreditCard,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useProfesional,
  useProfesionalMetricas,
  useProfesionalContratos,
  useProfesionalMetas,
  useProfesionalLiquidaciones,
  useCreateContrato,
  useCreateMeta,
  useGenerarLiquidacion,
  useAprobarLiquidacion,
  usePagarLiquidacion,
  useUpdateProfesional,
} from '@/api/hooks';

type TabType = 'info' | 'contrato' | 'metas' | 'liquidaciones';

const tabs: { id: TabType; label: string; icon: typeof User }[] = [
  { id: 'info', label: 'Información', icon: User },
  { id: 'contrato', label: 'Contrato', icon: Briefcase },
  { id: 'metas', label: 'Metas', icon: Target },
  { id: 'liquidaciones', label: 'Liquidaciones', icon: Wallet },
];

export function ProfesionalDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('info');

  const { data: profesional, isLoading } = useProfesional(id || '');
  const { data: metricas } = useProfesionalMetricas(id || '');

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!profesional) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <User className="w-16 h-16 text-heal-300 mb-4" />
        <p className="text-heal-500">Profesional no encontrado</p>
      </div>
    );
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header con gradiente */}
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${profesional.color || '#5f7da1'} 0%, ${profesional.color ? adjustColor(profesional.color, -30) : '#3d556f'} 100%)`
        }}
      >
        {/* Patrón decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative p-6 md:p-8">
          {/* Back button */}
          <button
            onClick={() => navigate('/profesionales')}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Profesionales</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            {/* Profesional info */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl md:text-4xl font-bold text-white shadow-lg">
                {profesional.firstName[0]}{profesional.lastName[0]}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {profesional.firstName} {profesional.lastName}
                </h1>
                <p className="text-white/80 mt-1">{profesional.especialidad || 'Sin especialidad'}</p>
                {profesional.rut && (
                  <p className="text-white/60 text-sm mt-1">{profesional.rut}</p>
                )}
              </div>
            </div>

            {/* Quick stats */}
            {metricas && (
              <div className="flex gap-4">
                <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 text-center min-w-[100px]">
                  <p className="text-2xl font-bold text-white">{metricas.sesionesRealizadas}</p>
                  <p className="text-xs text-white/70">Sesiones</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 text-center min-w-[100px]">
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(metricas.ingresosCobrados).replace('CLP', '').trim()}
                  </p>
                  <p className="text-xs text-white/70">Cobrado</p>
                </div>
                {metricas.metaActual && (
                  <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 text-center min-w-[100px]">
                    <p className="text-2xl font-bold text-white">{metricas.metaActual.cumplimiento.toFixed(0)}%</p>
                    <p className="text-xs text-white/70">Meta</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Portal link */}
          <button
            onClick={() => navigate(`/portal/${id}`)}
            className="absolute top-6 right-6 flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur px-4 py-2 rounded-xl text-white text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Ver Portal
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-heal-600 text-white shadow-soft'
                : 'bg-white text-heal-600 hover:bg-heal-50 border border-heal-100'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {activeTab === 'info' && <TabInfo profesional={profesional} metricas={metricas} />}
        {activeTab === 'contrato' && <TabContrato profesionalId={id!} />}
        {activeTab === 'metas' && <TabMetas profesionalId={id!} />}
        {activeTab === 'liquidaciones' && <TabLiquidaciones profesionalId={id!} />}
      </div>
    </div>
  );
}

// ============================================================================
// TAB INFO
// ============================================================================
function TabInfo({ profesional, metricas }: { profesional: any; metricas: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const updateProfesional = useUpdateProfesional();

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await updateProfesional.mutateAsync({
      id: profesional.id,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      rut: formData.get('rut') as string || undefined,
      email: formData.get('email') as string || undefined,
      phone: formData.get('phone') as string || undefined,
      especialidad: formData.get('especialidad') as string || undefined,
    });
    setIsEditing(false);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Contact Card */}
      <div className="lg:col-span-1">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-heal-900">Datos de Contacto</h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                isEditing ? 'bg-heal-100 text-heal-700' : 'hover:bg-heal-50 text-heal-500'
              )}
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Nombre</label>
                  <input name="firstName" defaultValue={profesional.firstName} className="input" required />
                </div>
                <div>
                  <label className="label">Apellido</label>
                  <input name="lastName" defaultValue={profesional.lastName} className="input" required />
                </div>
              </div>
              <div>
                <label className="label">RUT</label>
                <input name="rut" defaultValue={profesional.rut || ''} className="input" placeholder="12345678-9" />
              </div>
              <div>
                <label className="label">Email</label>
                <input name="email" type="email" defaultValue={profesional.email || ''} className="input" />
              </div>
              <div>
                <label className="label">Teléfono</label>
                <input name="phone" defaultValue={profesional.phone || ''} className="input" placeholder="+56 9 1234 5678" />
              </div>
              <div>
                <label className="label">Especialidad</label>
                <input name="especialidad" defaultValue={profesional.especialidad || ''} className="input" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={updateProfesional.isPending} className="btn-primary flex-1">
                  <Check className="w-4 h-4" />
                  Guardar
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-heal-50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-heal-100 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-heal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-heal-500">Email</p>
                  <p className="font-medium text-heal-900 truncate">{profesional.email || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-heal-50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-heal-100 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-heal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-heal-500">Teléfono</p>
                  <p className="font-medium text-heal-900">{profesional.phone || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-heal-50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-heal-100 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-heal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-heal-500">RUT</p>
                  <p className="font-medium text-heal-900">{profesional.rut || '—'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="lg:col-span-2">
        <div className="card p-6">
          <h3 className="font-semibold text-heal-900 mb-6">Resumen de Actividad</h3>

          {metricas ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-heal-50 to-heal-100/50 rounded-2xl p-4">
                <div className="w-10 h-10 rounded-xl bg-heal-600 flex items-center justify-center mb-3">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-heal-900">{metricas.totalSesiones}</p>
                <p className="text-sm text-heal-500">Sesiones totales</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center mb-3">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-emerald-700">{formatCurrency(metricas.ingresosTotales)}</p>
                <p className="text-sm text-emerald-600">Generado</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-blue-700">{formatCurrency(metricas.ingresosCobrados)}</p>
                <p className="text-sm text-blue-600">Cobrado</p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl p-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-amber-700">{formatCurrency(metricas.ingresosPendientes)}</p>
                <p className="text-sm text-amber-600">Pendiente</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-heal-500">
              Sin datos de actividad
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TAB CONTRATO
// ============================================================================
function TabContrato({ profesionalId }: { profesionalId: string }) {
  const { data: contratos, isLoading } = useProfesionalContratos(profesionalId);
  const [showForm, setShowForm] = useState(false);
  const createContrato = useCreateContrato();

  const contratoActivo = contratos?.find(c => c.isActive);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await createContrato.mutateAsync({
      profesionalId,
      tipo: formData.get('tipo') as string,
      fechaInicio: formData.get('fechaInicio') as string,
      fechaFin: formData.get('fechaFin') as string || undefined,
      horasSemanales: formData.get('horasSemanales') ? Number(formData.get('horasSemanales')) : undefined,
      tarifaPorSesion: formData.get('tarifaPorSesion') ? Number(formData.get('tarifaPorSesion')) : undefined,
      salarioBase: formData.get('salarioBase') ? Number(formData.get('salarioBase')) : undefined,
      porcentajeComision: formData.get('porcentajeComision') ? Number(formData.get('porcentajeComision')) : undefined,
      bonoMetaCumplida: formData.get('bonoMetaCumplida') ? Number(formData.get('bonoMetaCumplida')) : undefined,
      notas: formData.get('notas') as string || undefined,
    });
    setShowForm(false);
  };

  const formatCurrency = (value: number | null) =>
    value ? new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value) : '—';

  const tipoLabels: Record<string, { label: string; color: string }> = {
    HONORARIOS: { label: 'Honorarios', color: 'bg-purple-100 text-purple-700' },
    PART_TIME: { label: 'Part-Time', color: 'bg-blue-100 text-blue-700' },
    FULL_TIME: { label: 'Full-Time', color: 'bg-emerald-100 text-emerald-700' },
    PRACTICANTE: { label: 'Práctica', color: 'bg-amber-100 text-amber-700' },
  };

  if (isLoading) {
    return <div className="skeleton h-64 rounded-2xl" />;
  }

  return (
    <div className="space-y-6">
      {/* Contrato activo */}
      {contratoActivo ? (
        <div className="card overflow-hidden">
          <div className="bg-gradient-to-r from-heal-600 to-heal-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className={cn('px-3 py-1 rounded-full text-sm font-medium', tipoLabels[contratoActivo.tipo]?.color || 'bg-gray-100 text-gray-700')}>
                    {tipoLabels[contratoActivo.tipo]?.label || contratoActivo.tipo}
                  </span>
                  <span className="badge bg-white/20 text-white">Activo</span>
                </div>
                <p className="text-white/80 text-sm mt-2">
                  Desde {format(new Date(contratoActivo.fechaInicio), "d 'de' MMMM, yyyy", { locale: es })}
                </p>
              </div>
              <Briefcase className="w-12 h-12 text-white/30" />
            </div>
          </div>

          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {contratoActivo.tarifaPorSesion && (
              <div>
                <p className="text-sm text-heal-500">Tarifa por sesión</p>
                <p className="text-xl font-bold text-heal-900">{formatCurrency(Number(contratoActivo.tarifaPorSesion))}</p>
              </div>
            )}
            {contratoActivo.salarioBase && (
              <div>
                <p className="text-sm text-heal-500">Salario base</p>
                <p className="text-xl font-bold text-heal-900">{formatCurrency(Number(contratoActivo.salarioBase))}</p>
              </div>
            )}
            {contratoActivo.porcentajeComision && (
              <div>
                <p className="text-sm text-heal-500">Comisión</p>
                <p className="text-xl font-bold text-heal-900">{contratoActivo.porcentajeComision}%</p>
              </div>
            )}
            {contratoActivo.bonoMetaCumplida && (
              <div>
                <p className="text-sm text-heal-500">Bono por meta</p>
                <p className="text-xl font-bold text-emerald-600">{formatCurrency(Number(contratoActivo.bonoMetaCumplida))}</p>
              </div>
            )}
            {contratoActivo.horasSemanales && (
              <div>
                <p className="text-sm text-heal-500">Horas semanales</p>
                <p className="text-xl font-bold text-heal-900">{contratoActivo.horasSemanales}h</p>
              </div>
            )}
          </div>

          {contratoActivo.notas && (
            <div className="px-6 pb-6">
              <p className="text-sm text-heal-500 bg-heal-50 p-3 rounded-xl">{contratoActivo.notas}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-heal-100 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-heal-400" />
          </div>
          <h3 className="font-semibold text-heal-900 mb-2">Sin contrato activo</h3>
          <p className="text-heal-500 text-sm mb-4">Este profesional no tiene un contrato vigente</p>
        </div>
      )}

      {/* Botón nuevo contrato */}
      <button
        onClick={() => setShowForm(true)}
        className="btn-primary"
      >
        <Plus className="w-4 h-4" />
        {contratoActivo ? 'Nuevo Contrato' : 'Crear Contrato'}
      </button>

      {/* Historial */}
      {contratos && contratos.length > 1 && (
        <div className="card p-6">
          <h3 className="font-semibold text-heal-900 mb-4">Historial de Contratos</h3>
          <div className="space-y-3">
            {contratos.filter(c => !c.isActive).map((contrato) => (
              <div key={contrato.id} className="flex items-center justify-between p-4 bg-heal-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className={cn('px-2 py-1 rounded-full text-xs font-medium', tipoLabels[contrato.tipo]?.color)}>
                    {tipoLabels[contrato.tipo]?.label}
                  </span>
                  <span className="text-sm text-heal-600">
                    {format(new Date(contrato.fechaInicio), 'MMM yyyy', { locale: es })}
                    {contrato.fechaFin && ` - ${format(new Date(contrato.fechaFin), 'MMM yyyy', { locale: es })}`}
                  </span>
                </div>
                <span className="badge-gray">Finalizado</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-heal-900">Nuevo Contrato</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-heal-100 rounded-lg">
                <X className="w-5 h-5 text-heal-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Tipo de Contrato *</label>
                <select name="tipo" required className="input">
                  <option value="">Seleccionar...</option>
                  <option value="HONORARIOS">Honorarios</option>
                  <option value="PART_TIME">Part-Time</option>
                  <option value="FULL_TIME">Full-Time</option>
                  <option value="PRACTICANTE">Práctica Profesional</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Fecha Inicio *</label>
                  <input name="fechaInicio" type="date" required className="input" />
                </div>
                <div>
                  <label className="label">Fecha Fin</label>
                  <input name="fechaFin" type="date" className="input" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Tarifa por Sesión</label>
                  <input name="tarifaPorSesion" type="number" className="input" placeholder="25000" />
                </div>
                <div>
                  <label className="label">Salario Base</label>
                  <input name="salarioBase" type="number" className="input" placeholder="800000" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">% Comisión</label>
                  <input name="porcentajeComision" type="number" step="0.1" className="input" placeholder="10" />
                </div>
                <div>
                  <label className="label">Bono por Meta</label>
                  <input name="bonoMetaCumplida" type="number" className="input" placeholder="50000" />
                </div>
              </div>

              <div>
                <label className="label">Horas Semanales</label>
                <input name="horasSemanales" type="number" className="input" placeholder="40" />
              </div>

              <div>
                <label className="label">Notas</label>
                <textarea name="notas" rows={2} className="input" placeholder="Observaciones del contrato..." />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button type="submit" disabled={createContrato.isPending} className="btn-primary flex-1">
                  Crear Contrato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TAB METAS
// ============================================================================
function TabMetas({ profesionalId }: { profesionalId: string }) {
  const { data: metas, isLoading } = useProfesionalMetas(profesionalId, { limit: 12 });
  const [showForm, setShowForm] = useState(false);
  const createMeta = useCreateMeta();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const metaActual = metas?.find(m => m.mes === currentMonth && m.anio === currentYear);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await createMeta.mutateAsync({
      profesionalId,
      mes: Number(formData.get('mes')),
      anio: Number(formData.get('anio')),
      sesionesObjetivo: Number(formData.get('sesionesObjetivo')),
      bonoMonto: formData.get('bonoMonto') ? Number(formData.get('bonoMonto')) : undefined,
      notas: formData.get('notas') as string || undefined,
    });
    setShowForm(false);
  };

  const formatCurrency = (value: number | null) =>
    value ? new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value) : null;

  if (isLoading) {
    return <div className="skeleton h-64 rounded-2xl" />;
  }

  return (
    <div className="space-y-6">
      {/* Meta actual */}
      {metaActual ? (
        <div className="card overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -right-10 -top-10 w-40 h-40 border-8 border-white rounded-full" />
              <div className="absolute -left-10 -bottom-10 w-32 h-32 border-8 border-white rounded-full" />
            </div>

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/80 text-sm">Meta de {format(new Date(currentYear, currentMonth - 1), 'MMMM yyyy', { locale: es })}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-3xl font-bold">{metaActual.sesionesRealizadas}</span>
                    <span className="text-white/60">/</span>
                    <span className="text-xl text-white/80">{metaActual.sesionesObjetivo} sesiones</span>
                  </div>
                </div>
                {metaActual.metaCumplida && (
                  <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-semibold">¡Cumplida!</span>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="h-4 bg-white/20 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-1000',
                    metaActual.metaCumplida ? 'bg-yellow-300' : 'bg-white'
                  )}
                  style={{ width: `${Math.min(Number(metaActual.cumplimiento), 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-3">
                <span className="text-2xl font-bold">{Number(metaActual.cumplimiento).toFixed(0)}%</span>
                {metaActual.bonoMonto && (
                  <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                    Bono: {formatCurrency(Number(metaActual.bonoMonto))}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="font-semibold text-heal-900 mb-2">Sin meta para este mes</h3>
          <p className="text-heal-500 text-sm mb-4">Define una meta de sesiones para {format(now, 'MMMM yyyy', { locale: es })}</p>
        </div>
      )}

      <button onClick={() => setShowForm(true)} className="btn-primary">
        <Plus className="w-4 h-4" />
        Nueva Meta
      </button>

      {/* Historial */}
      {metas && metas.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold text-heal-900 mb-4">Historial de Metas</h3>
          <div className="space-y-3">
            {metas.map((meta) => (
              <div key={meta.id} className="flex items-center justify-between p-4 bg-heal-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    meta.metaCumplida ? 'bg-emerald-100' : 'bg-amber-100'
                  )}>
                    {meta.metaCumplida ? (
                      <Award className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <Target className="w-6 h-6 text-amber-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-heal-900 capitalize">
                      {format(new Date(meta.anio, meta.mes - 1), 'MMMM yyyy', { locale: es })}
                    </p>
                    <p className="text-sm text-heal-500">
                      {meta.sesionesRealizadas} / {meta.sesionesObjetivo} sesiones
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-heal-200 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', meta.metaCumplida ? 'bg-emerald-500' : 'bg-amber-500')}
                        style={{ width: `${Math.min(Number(meta.cumplimiento), 100)}%` }}
                      />
                    </div>
                    <span className={cn('text-sm font-medium', meta.metaCumplida ? 'text-emerald-600' : 'text-amber-600')}>
                      {Number(meta.cumplimiento).toFixed(0)}%
                    </span>
                  </div>
                  {meta.bonoOtorgado && (
                    <span className="text-xs text-emerald-600 mt-1 block">Bono otorgado</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-heal-900">Nueva Meta Mensual</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-heal-100 rounded-lg">
                <X className="w-5 h-5 text-heal-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Mes *</label>
                  <select name="mes" required defaultValue={currentMonth} className="input">
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {format(new Date(2024, i), 'MMMM', { locale: es })}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Año *</label>
                  <select name="anio" required defaultValue={currentYear} className="input">
                    {[currentYear - 1, currentYear, currentYear + 1].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Objetivo de Sesiones *</label>
                <input name="sesionesObjetivo" type="number" required className="input" placeholder="80" />
              </div>

              <div>
                <label className="label">Bono por Cumplimiento</label>
                <input name="bonoMonto" type="number" className="input" placeholder="50000" />
              </div>

              <div>
                <label className="label">Notas</label>
                <textarea name="notas" rows={2} className="input" placeholder="Observaciones..." />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button type="submit" disabled={createMeta.isPending} className="btn-primary flex-1">
                  Crear Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TAB LIQUIDACIONES
// ============================================================================
function TabLiquidaciones({ profesionalId }: { profesionalId: string }) {
  const { data: liquidaciones, isLoading } = useProfesionalLiquidaciones(profesionalId, { limit: 12 });
  const [showGenerarForm, setShowGenerarForm] = useState(false);
  const [selectedLiquidacion, setSelectedLiquidacion] = useState<string | null>(null);

  const generarLiquidacion = useGenerarLiquidacion();
  const aprobarLiquidacion = useAprobarLiquidacion();
  const pagarLiquidacion = usePagarLiquidacion();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const handleGenerar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await generarLiquidacion.mutateAsync({
      profesionalId,
      mes: Number(formData.get('mes')),
      anio: Number(formData.get('anio')),
    });
    setShowGenerarForm(false);
  };

  const handleAprobar = async (liquidacionId: string) => {
    await aprobarLiquidacion.mutateAsync({ liquidacionId });
  };

  const handlePagar = async (liquidacionId: string) => {
    await pagarLiquidacion.mutateAsync({
      liquidacionId,
      metodoPago: 'TRANSFERENCIA',
    });
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);

  const estadoConfig: Record<string, { label: string; color: string; icon: typeof Check }> = {
    BORRADOR: { label: 'Borrador', color: 'bg-gray-100 text-gray-700', icon: FileText },
    PENDIENTE: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700', icon: Clock },
    APROBADA: { label: 'Aprobada', color: 'bg-blue-100 text-blue-700', icon: Check },
    PAGADA: { label: 'Pagada', color: 'bg-emerald-100 text-emerald-700', icon: Check },
    RECHAZADA: { label: 'Rechazada', color: 'bg-red-100 text-red-700', icon: X },
  };

  if (isLoading) {
    return <div className="skeleton h-64 rounded-2xl" />;
  }

  return (
    <div className="space-y-6">
      <button onClick={() => setShowGenerarForm(true)} className="btn-primary">
        <Plus className="w-4 h-4" />
        Generar Liquidación
      </button>

      {/* Lista de liquidaciones */}
      {liquidaciones && liquidaciones.length > 0 ? (
        <div className="space-y-4">
          {liquidaciones.map((liq) => {
            const config = estadoConfig[liq.estado] || estadoConfig.BORRADOR;
            const Icon = config.icon;

            return (
              <div key={liq.id} className="card overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', config.color.split(' ')[0])}>
                        <Icon className={cn('w-6 h-6', config.color.split(' ')[1])} />
                      </div>
                      <div>
                        <p className="font-semibold text-heal-900 capitalize">
                          {format(new Date(liq.anio, liq.mes - 1), 'MMMM yyyy', { locale: es })}
                        </p>
                        <p className="text-sm text-heal-500">
                          {liq.sesionesRealizadas} sesiones • N° {liq.numero}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-heal-900">
                        {formatCurrency(Number(liq.totalLiquido))}
                      </p>
                      <span className={cn('badge', config.color)}>{config.label}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-heal-100">
                    <button
                      onClick={() => setSelectedLiquidacion(liq.id)}
                      className="btn-ghost text-sm"
                    >
                      Ver Detalle
                    </button>
                    {liq.estado === 'PENDIENTE' && (
                      <button
                        onClick={() => handleAprobar(liq.id)}
                        disabled={aprobarLiquidacion.isPending}
                        className="btn-primary text-sm"
                      >
                        Aprobar
                      </button>
                    )}
                    {liq.estado === 'APROBADA' && (
                      <button
                        onClick={() => handlePagar(liq.id)}
                        disabled={pagarLiquidacion.isPending}
                        className="btn-sage text-sm"
                      >
                        Marcar Pagada
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-heal-100 flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-heal-400" />
          </div>
          <h3 className="font-semibold text-heal-900 mb-2">Sin liquidaciones</h3>
          <p className="text-heal-500 text-sm">Genera la primera liquidación para este profesional</p>
        </div>
      )}

      {/* Modal Generar */}
      {showGenerarForm && (
        <div className="modal-overlay" onClick={() => setShowGenerarForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-heal-900">Generar Liquidación</h2>
              <button onClick={() => setShowGenerarForm(false)} className="p-2 hover:bg-heal-100 rounded-lg">
                <X className="w-5 h-5 text-heal-500" />
              </button>
            </div>

            <form onSubmit={handleGenerar} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Mes</label>
                  <select name="mes" required defaultValue={currentMonth > 1 ? currentMonth - 1 : 12} className="input">
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {format(new Date(2024, i), 'MMMM', { locale: es })}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Año</label>
                  <select name="anio" required defaultValue={currentMonth > 1 ? currentYear : currentYear - 1} className="input">
                    {[currentYear - 1, currentYear].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                <AlertCircle className="w-5 h-5 inline mr-2" />
                La liquidación se generará automáticamente basándose en las sesiones realizadas y el contrato vigente.
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowGenerarForm(false)} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button type="submit" disabled={generarLiquidacion.isPending} className="btn-primary flex-1">
                  Generar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================
function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-48 bg-heal-200 rounded-3xl" />
      <div className="flex gap-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-12 w-32 bg-heal-100 rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-heal-100 rounded-2xl" />
    </div>
  );
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}
