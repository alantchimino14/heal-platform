import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, ChevronRight, X } from 'lucide-react';
import { usePacientes } from '@/api/hooks';
import { formatMoney, formatRut, cn } from '@/lib/utils';
import { PageHeader, Avatar, SkeletonTable, NoResults, NoPacientes, Badge } from '@/components/ui';

export function Pacientes() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'todos' | 'conDeuda' | 'aFavor'>('todos');

  const { data, isLoading } = usePacientes({
    search: search || undefined,
    page,
    limit: 20,
  });

  // Filter data locally based on balance
  const filteredData = data?.data?.filter((p: any) => {
    if (filter === 'conDeuda') return Number(p.saldoPendiente) > 0;
    if (filter === 'aFavor') return Number(p.saldoAFavor) > 0;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <PageHeader
        title="Pacientes"
        description="Gestión de pacientes del centro"
        action={
          <Link to="/pacientes/nuevo" className="btn-primary">
            <Plus className="h-4 w-4" />
            Nuevo Paciente
          </Link>
        }
      />

      {/* Search and Filters */}
      <div className="card p-4 animate-fade-in-up stagger-1">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-heal-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, RUT o email..."
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

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <FilterChip
              active={filter === 'todos'}
              onClick={() => setFilter('todos')}
            >
              Todos
            </FilterChip>
            <FilterChip
              active={filter === 'conDeuda'}
              onClick={() => setFilter('conDeuda')}
              variant="error"
            >
              Con Deuda
            </FilterChip>
            <FilterChip
              active={filter === 'aFavor'}
              onClick={() => setFilter('aFavor')}
              variant="success"
            >
              Saldo a Favor
            </FilterChip>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="animate-fade-in-up stagger-2">
        {isLoading ? (
          <SkeletonTable rows={5} cols={5} />
        ) : filteredData?.length === 0 ? (
          <div className="card">
            {search ? (
              <NoResults search={search} />
            ) : (
              <NoPacientes onAdd={() => window.location.href = '/pacientes/nuevo'} />
            )}
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th>Paciente</th>
                  <th>RUT</th>
                  <th>Contacto</th>
                  <th>Previsión</th>
                  <th className="text-right">Balance</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredData?.map((paciente: any, index: number) => (
                  <tr
                    key={paciente.id}
                    className="table-row group"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar
                          firstName={paciente.firstName}
                          lastName={paciente.lastName}
                        />
                        <div>
                          <p className="font-medium text-heal-900">
                            {paciente.firstName} {paciente.lastName}
                          </p>
                          <p className="text-sm text-heal-500">
                            {paciente.email || 'Sin email'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm text-heal-600">
                      {formatRut(paciente.rut)}
                    </td>
                    <td className="text-sm text-heal-600">
                      {paciente.phone || '-'}
                    </td>
                    <td>
                      {paciente.prevision ? (
                        <Badge variant="gray">{paciente.prevision}</Badge>
                      ) : (
                        <span className="text-sm text-heal-400">-</span>
                      )}
                    </td>
                    <td className="text-right">
                      <BalanceDisplay
                        deuda={Number(paciente.saldoPendiente)}
                        aFavor={Number(paciente.saldoAFavor)}
                      />
                    </td>
                    <td>
                      <Link
                        to={`/pacientes/${paciente.id}`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-heal-100 rounded-lg inline-flex"
                      >
                        <ChevronRight className="h-5 w-5 text-heal-500" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {data?.meta && (
              <div className="flex items-center justify-between border-t border-heal-100 px-4 py-3">
                <p className="text-sm text-heal-500">
                  Mostrando <span className="font-medium">{filteredData?.length}</span> de{' '}
                  <span className="font-medium">{data.meta.total}</span> pacientes
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

function FilterChip({
  children,
  active,
  onClick,
  variant = 'default',
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  variant?: 'default' | 'success' | 'error';
}) {
  const variants = {
    default: active ? 'bg-heal-600 text-white' : 'bg-heal-100 text-heal-600 hover:bg-heal-200',
    success: active ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    error: active ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
        variants[variant]
      )}
    >
      {children}
    </button>
  );
}

function BalanceDisplay({ deuda, aFavor }: { deuda: number; aFavor: number }) {
  if (deuda > 0) {
    return (
      <span className="font-semibold text-red-600">
        -{formatMoney(deuda)}
      </span>
    );
  }
  if (aFavor > 0) {
    return (
      <span className="font-semibold text-emerald-600">
        +{formatMoney(aFavor)}
      </span>
    );
  }
  return <span className="text-heal-400">$0</span>;
}
