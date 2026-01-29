import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Plus, Filter, Calendar, AlertTriangle, X } from 'lucide-react';
import { useSesiones, useProfesionales, useUpdateSesion } from '@/api/hooks';
import { formatMoney, formatDateTime, cn } from '@/lib/utils';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import {
  PageHeader,
  Avatar,
  SkeletonTable,
  NoResults,
  NoSesiones,
  useToast,
} from '@/components/ui';

const ESTADOS_AGENDA = ['AGENDADA', 'CONFIRMADA', 'CANCELADA', 'NO_ASISTIO'];
const ESTADOS_ATENCION = ['PENDIENTE', 'EN_CURSO', 'REALIZADA'];
const ESTADOS_PAGO = ['NO_PAGADA', 'PAGO_PARCIAL', 'PAGADA'];
const ESTADOS_BOLETA = ['NO_EMITIDA', 'EMITIDA'];

export function Sesiones() {
  const [searchParams] = useSearchParams();
  const pacienteIdFromUrl = searchParams.get('pacienteId');
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    profesionalId: '',
    estadoAgenda: '',
    estadoPago: '',
    estadoBoleta: '',
    desde: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    hasta: format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
  });

  const { data: profesionales } = useProfesionales();
  const { data, isLoading, refetch } = useSesiones({
    search: search || undefined,
    pacienteId: pacienteIdFromUrl || undefined,
    profesionalId: filters.profesionalId || undefined,
    estadoAgenda: filters.estadoAgenda || undefined,
    estadoPago: filters.estadoPago || undefined,
    estadoBoleta: filters.estadoBoleta || undefined,
    desde: filters.desde || undefined,
    hasta: filters.hasta || undefined,
    page,
    limit: 20,
  });

  const updateSesion = useUpdateSesion();

  const handleEstadoChange = async (
    sesionId: string,
    campo: 'estadoAgenda' | 'estadoAtencion' | 'estadoPago' | 'estadoBoleta',
    valor: string
  ) => {
    try {
      await updateSesion.mutateAsync({ id: sesionId, [campo]: valor });
      toast.success('Estado actualizado');
      refetch();
    } catch {
      toast.error('Error al actualizar el estado');
    }
  };

  // Sesiones con boleta pendiente
  const sesionesPendientesBoleta = data?.data?.filter(
    (s: any) => s.estadoAtencion === 'REALIZADA' && s.estadoBoleta === 'NO_EMITIDA'
  );

  const activeFiltersCount = [
    filters.profesionalId,
    filters.estadoAgenda,
    filters.estadoPago,
    filters.estadoBoleta,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <PageHeader
        title="Sesiones"
        description="Gestión de sesiones y atenciones"
        action={
          <Link to="/sesiones/nueva" className="btn-primary">
            <Plus className="h-4 w-4" />
            Nueva Sesión
          </Link>
        }
      />

      {/* Alerta de boletas pendientes */}
      {sesionesPendientesBoleta && sesionesPendientesBoleta.length > 0 && (
        <div className="alert-warning animate-fade-in-up">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">
              {sesionesPendientesBoleta.length} sesión(es) realizada(s) sin boleta
            </p>
            <p className="text-sm opacity-80 mt-0.5">
              Recuerda emitir las boletas en Medilink para estas atenciones completadas.
            </p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="card p-4 animate-fade-in-up stagger-1">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-heal-400" />
            <input
              type="text"
              placeholder="Buscar por paciente..."
              className="input pl-10"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-heal-100 rounded-lg"
              >
                <X className="h-4 w-4 text-heal-400" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-heal-50 rounded-xl">
              <Calendar className="h-4 w-4 text-heal-500" />
              <input
                type="date"
                className="bg-transparent border-none text-sm text-heal-700 focus:outline-none"
                value={filters.desde}
                onChange={(e) => setFilters({ ...filters, desde: e.target.value })}
              />
              <span className="text-heal-400">a</span>
              <input
                type="date"
                className="bg-transparent border-none text-sm text-heal-700 focus:outline-none"
                value={filters.hasta}
                onChange={(e) => setFilters({ ...filters, hasta: e.target.value })}
              />
            </div>

            <button
              className={cn(
                'btn-secondary relative',
                showFilters && 'bg-heal-100 border-heal-300'
              )}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-heal-600 text-white text-xs flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 mt-4 border-t border-heal-100 animate-fade-in-down">
            <FilterSelect
              label="Profesional"
              value={filters.profesionalId}
              onChange={(v) => setFilters({ ...filters, profesionalId: v })}
              options={[
                { value: '', label: 'Todos' },
                ...(profesionales?.map((p: any) => ({
                  value: p.id,
                  label: `${p.firstName} ${p.lastName}`,
                })) || []),
              ]}
            />
            <FilterSelect
              label="Estado Agenda"
              value={filters.estadoAgenda}
              onChange={(v) => setFilters({ ...filters, estadoAgenda: v })}
              options={[
                { value: '', label: 'Todos' },
                ...ESTADOS_AGENDA.map((e) => ({ value: e, label: e.replace('_', ' ') })),
              ]}
            />
            <FilterSelect
              label="Estado Pago"
              value={filters.estadoPago}
              onChange={(v) => setFilters({ ...filters, estadoPago: v })}
              options={[
                { value: '', label: 'Todos' },
                ...ESTADOS_PAGO.map((e) => ({ value: e, label: e.replace('_', ' ') })),
              ]}
            />
            <FilterSelect
              label="Estado Boleta"
              value={filters.estadoBoleta}
              onChange={(v) => setFilters({ ...filters, estadoBoleta: v })}
              options={[
                { value: '', label: 'Todos' },
                ...ESTADOS_BOLETA.map((e) => ({ value: e, label: e.replace('_', ' ') })),
              ]}
            />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="animate-fade-in-up stagger-2">
        {isLoading ? (
          <SkeletonTable rows={5} cols={7} />
        ) : data?.data?.length === 0 ? (
          <div className="card">
            {search ? (
              <NoResults search={search} />
            ) : (
              <NoSesiones onAdd={() => window.location.href = '/sesiones/nueva'} />
            )}
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="table-header">
                  <tr>
                    <th>Fecha/Hora</th>
                    <th>Paciente</th>
                    <th>Profesional</th>
                    <th>Agenda</th>
                    <th>Atención</th>
                    <th>Pago</th>
                    <th>Boleta</th>
                    <th className="text-right">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data?.map((sesion: any, index: number) => (
                    <tr
                      key={sesion.id}
                      className="table-row"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-heal-400" />
                          <span className="text-sm font-medium text-heal-900">
                            {formatDateTime(sesion.fechaHora)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <Link
                          to={`/pacientes/${sesion.paciente.id}`}
                          className="flex items-center gap-2 group"
                        >
                          <Avatar
                            firstName={sesion.paciente.firstName}
                            lastName={sesion.paciente.lastName}
                            size="sm"
                          />
                          <span className="text-sm font-medium text-heal-600 group-hover:text-heal-700">
                            {sesion.paciente.firstName} {sesion.paciente.lastName}
                          </span>
                        </Link>
                      </td>
                      <td className="text-sm text-heal-600">
                        {sesion.profesional.firstName} {sesion.profesional.lastName}
                      </td>
                      <td>
                        <EstadoSelect
                          value={sesion.estadoAgenda}
                          options={ESTADOS_AGENDA}
                          onChange={(v) => handleEstadoChange(sesion.id, 'estadoAgenda', v)}
                          tipo="agenda"
                        />
                      </td>
                      <td>
                        <EstadoSelect
                          value={sesion.estadoAtencion}
                          options={ESTADOS_ATENCION}
                          onChange={(v) => handleEstadoChange(sesion.id, 'estadoAtencion', v)}
                          tipo="atencion"
                        />
                      </td>
                      <td>
                        <EstadoSelect
                          value={sesion.estadoPago}
                          options={ESTADOS_PAGO}
                          onChange={(v) => handleEstadoChange(sesion.id, 'estadoPago', v)}
                          tipo="pago"
                        />
                      </td>
                      <td>
                        <EstadoBoleta
                          estado={sesion.estadoBoleta}
                          estadoAtencion={sesion.estadoAtencion}
                          onChange={(v) => handleEstadoChange(sesion.id, 'estadoBoleta', v)}
                        />
                      </td>
                      <td className="text-right">
                        <span className="text-sm font-medium text-heal-900">
                          {formatMoney(sesion.precioFinal)}
                        </span>
                        {sesion.montoPagado > 0 && sesion.montoPagado < sesion.precioFinal && (
                          <p className="text-xs text-heal-500">
                            Pagado: {formatMoney(sesion.montoPagado)}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data?.meta && (
              <div className="flex items-center justify-between border-t border-heal-100 px-4 py-3">
                <p className="text-sm text-heal-500">
                  Mostrando <span className="font-medium">{data.data.length}</span> de{' '}
                  <span className="font-medium">{data.meta.total}</span> sesiones
                </p>
                <div className="flex gap-2">
                  <button
                    className="btn-secondary btn-sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Anterior
                  </button>
                  <div className="flex items-center px-3 text-sm text-heal-600">
                    Página {page} de {data.meta.totalPages}
                  </div>
                  <button
                    className="btn-secondary btn-sm"
                    disabled={page >= data.meta.totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-heal-500 mb-1.5">{label}</label>
      <select className="input text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function EstadoSelect({
  value,
  options,
  onChange,
  tipo,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  tipo: 'agenda' | 'atencion' | 'pago';
}) {
  const getStyles = () => {
    switch (tipo) {
      case 'agenda':
        if (value === 'CONFIRMADA') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (value === 'CANCELADA' || value === 'NO_ASISTIO')
          return 'bg-red-50 text-red-700 border-red-200';
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'atencion':
        if (value === 'REALIZADA') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (value === 'EN_CURSO') return 'bg-amber-50 text-amber-700 border-amber-200';
        return 'bg-heal-50 text-heal-700 border-heal-200';
      case 'pago':
        if (value === 'PAGADA') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (value === 'PAGO_PARCIAL') return 'bg-amber-50 text-amber-700 border-amber-200';
        return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  return (
    <select
      className={cn(
        'text-xs font-medium rounded-full px-2.5 py-1 border cursor-pointer transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-1',
        getStyles()
      )}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o.replace(/_/g, ' ')}
        </option>
      ))}
    </select>
  );
}

function EstadoBoleta({
  estado,
  estadoAtencion,
  onChange,
}: {
  estado: string;
  estadoAtencion: string;
  onChange: (v: string) => void;
}) {
  const needsAttention = estadoAtencion === 'REALIZADA' && estado === 'NO_EMITIDA';

  return (
    <div className="flex items-center gap-1">
      <select
        className={cn(
          'text-xs font-medium rounded-full px-2.5 py-1 border cursor-pointer transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-1',
          estado === 'EMITIDA'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : needsAttention
            ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse-soft'
            : 'bg-heal-50 text-heal-700 border-heal-200'
        )}
        value={estado}
        onChange={(e) => onChange(e.target.value)}
      >
        {ESTADOS_BOLETA.map((o) => (
          <option key={o} value={o}>
            {o.replace(/_/g, ' ')}
          </option>
        ))}
      </select>
      {needsAttention && (
        <span title="Emitir boleta en Medilink">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        </span>
      )}
    </div>
  );
}
