import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Filter,
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
  Banknote,
  Building2,
  CreditCard,
} from 'lucide-react';
import { usePagos } from '@/api/hooks';
import { formatMoney, formatDateTime, cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import {
  PageHeader,
  Avatar,
  Badge,
  SkeletonTable,
  NoResults,
  NoPagos,
} from '@/components/ui';

const METODOS_PAGO = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'TARJETA_DEBITO', label: 'Tarjeta Débito' },
  { value: 'TARJETA_CREDITO', label: 'Tarjeta Crédito' },
];

export function Pagos() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedPago, setExpandedPago] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    metodoPago: '',
    desde: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    hasta: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });

  const { data, isLoading } = usePagos({
    search: search || undefined,
    metodoPago: filters.metodoPago || undefined,
    desde: filters.desde || undefined,
    hasta: filters.hasta || undefined,
    page,
    limit: 20,
  });

  // Calculate totals
  const totales = data?.data?.reduce(
    (acc: any, pago: any) => ({
      total: acc.total + Number(pago.monto),
      efectivo: acc.efectivo + (pago.metodoPago === 'EFECTIVO' ? Number(pago.monto) : 0),
      transferencia:
        acc.transferencia + (pago.metodoPago === 'TRANSFERENCIA' ? Number(pago.monto) : 0),
      tarjeta: acc.tarjeta + (pago.metodoPago.includes('TARJETA') ? Number(pago.monto) : 0),
    }),
    { total: 0, efectivo: 0, transferencia: 0, tarjeta: 0 }
  );

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <PageHeader
        title="Pagos"
        description="Registro y seguimiento de pagos"
        action={
          <Link to="/pagos/nuevo" className="btn-primary">
            <Plus className="h-4 w-4" />
            Registrar Pago
          </Link>
        }
      />

      {/* Summary Cards */}
      {totales && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
          <SummaryCard
            label="Total Período"
            value={formatMoney(totales.total)}
            icon={CreditCard}
            color="heal"
          />
          <SummaryCard
            label="Efectivo"
            value={formatMoney(totales.efectivo)}
            icon={Banknote}
            color="emerald"
          />
          <SummaryCard
            label="Transferencia"
            value={formatMoney(totales.transferencia)}
            icon={Building2}
            color="blue"
          />
          <SummaryCard
            label="Tarjeta"
            value={formatMoney(totales.tarjeta)}
            icon={CreditCard}
            color="purple"
          />
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
                'btn-secondary',
                showFilters && 'bg-heal-100 border-heal-300'
              )}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              Filtros
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="pt-4 mt-4 border-t border-heal-100 animate-fade-in-down">
            <div className="max-w-xs">
              <label className="block text-xs font-medium text-heal-500 mb-1.5">
                Método de Pago
              </label>
              <select
                className="input text-sm"
                value={filters.metodoPago}
                onChange={(e) => setFilters({ ...filters, metodoPago: e.target.value })}
              >
                <option value="">Todos</option>
                {METODOS_PAGO.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="animate-fade-in-up stagger-2">
        {isLoading ? (
          <SkeletonTable rows={5} cols={5} />
        ) : data?.data?.length === 0 ? (
          <div className="card">
            {search ? <NoResults search={search} /> : <NoPagos />}
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th>Fecha</th>
                  <th>Paciente</th>
                  <th>Método</th>
                  <th className="text-right">Monto</th>
                  <th>Descripción</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((pago: any, index: number) => (
                  <>
                    <tr
                      key={pago.id}
                      className="table-row"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td>
                        <span className="text-sm font-medium text-heal-900">
                          {formatDateTime(pago.fecha)}
                        </span>
                      </td>
                      <td>
                        <Link
                          to={`/pacientes/${pago.paciente.id}`}
                          className="flex items-center gap-2 group"
                        >
                          <Avatar
                            firstName={pago.paciente.firstName}
                            lastName={pago.paciente.lastName}
                            size="sm"
                          />
                          <span className="text-sm font-medium text-heal-600 group-hover:text-heal-700">
                            {pago.paciente.firstName} {pago.paciente.lastName}
                          </span>
                        </Link>
                      </td>
                      <td>
                        <MetodoPagoBadge metodo={pago.metodoPago} />
                      </td>
                      <td className="text-right">
                        <span className="text-sm font-semibold text-emerald-600">
                          {formatMoney(pago.monto)}
                        </span>
                      </td>
                      <td className="text-sm text-heal-500 max-w-[200px] truncate">
                        {pago.descripcion || '-'}
                      </td>
                      <td>
                        {pago.asignaciones?.length > 0 && (
                          <button
                            onClick={() =>
                              setExpandedPago(expandedPago === pago.id ? null : pago.id)
                            }
                            className="p-1 hover:bg-heal-100 rounded-lg transition-colors"
                          >
                            {expandedPago === pago.id ? (
                              <ChevronUp className="h-5 w-5 text-heal-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-heal-400" />
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandedPago === pago.id && pago.asignaciones?.length > 0 && (
                      <tr key={`${pago.id}-detail`}>
                        <td colSpan={6} className="bg-heal-50/50 px-6 py-4">
                          <div className="text-sm">
                            <p className="font-medium text-heal-700 mb-3">
                              Asignado a sesiones:
                            </p>
                            <div className="space-y-2">
                              {pago.asignaciones.map((asig: any) => (
                                <div
                                  key={asig.id}
                                  className="flex items-center justify-between py-2 px-3 bg-white rounded-lg"
                                >
                                  <span className="text-heal-600">
                                    {formatDateTime(asig.sesion.fechaHora)} -{' '}
                                    {asig.sesion.profesional?.firstName}{' '}
                                    {asig.sesion.profesional?.lastName}
                                  </span>
                                  <span className="font-medium text-heal-900">
                                    {formatMoney(asig.monto)}
                                  </span>
                                </div>
                              ))}
                            </div>
                            {Number(pago.saldoAFavor) > 0 && (
                              <div className="mt-3 pt-3 border-t border-heal-200 flex justify-between items-center">
                                <span className="text-emerald-600 font-medium">
                                  Saldo a favor:
                                </span>
                                <span className="font-bold text-emerald-600">
                                  {formatMoney(pago.saldoAFavor)}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {data?.meta && (
              <div className="flex items-center justify-between border-t border-heal-100 px-4 py-3">
                <p className="text-sm text-heal-500">
                  Mostrando <span className="font-medium">{data.data.length}</span> de{' '}
                  <span className="font-medium">{data.meta.total}</span> pagos
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

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: 'heal' | 'emerald' | 'blue' | 'purple';
}) {
  const colorClasses = {
    heal: 'bg-heal-100 text-heal-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  const valueColors = {
    heal: 'text-heal-900',
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
  };

  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', colorClasses[color])}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm text-heal-500">{label}</p>
        <p className={cn('text-xl font-bold font-display', valueColors[color])}>{value}</p>
      </div>
    </div>
  );
}

function MetodoPagoBadge({ metodo }: { metodo: string }) {
  const config: Record<string, { variant: 'success' | 'info' | 'gray'; label: string }> = {
    EFECTIVO: { variant: 'success', label: 'Efectivo' },
    TRANSFERENCIA: { variant: 'info', label: 'Transferencia' },
    TARJETA_DEBITO: { variant: 'gray', label: 'Débito' },
    TARJETA_CREDITO: { variant: 'gray', label: 'Crédito' },
  };

  const c = config[metodo] || { variant: 'gray' as const, label: metodo };

  return <Badge variant={c.variant}>{c.label}</Badge>;
}
