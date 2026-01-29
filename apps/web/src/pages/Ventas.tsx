import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Plus,
  Search,
  Receipt,
  XCircle,
  Calendar,
  CreditCard,
  Banknote,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useVentas,
  useVentasResumen,
  useAnularVenta,
  MetodoPago,
} from '@/api/hooks';

const metodoPagoLabels: Record<MetodoPago, { label: string; icon: typeof CreditCard }> = {
  EFECTIVO: { label: 'Efectivo', icon: Banknote },
  REDCOMPRA_DEBITO: { label: 'Redcompra Débito', icon: CreditCard },
  REDCOMPRA_CREDITO: { label: 'Redcompra Crédito', icon: CreditCard },
  TRANSFERENCIA: { label: 'Transferencia', icon: Building2 },
};

export function Ventas() {
  const [search, setSearch] = useState('');
  const [filtroMetodo, setFiltroMetodo] = useState<MetodoPago | ''>('');
  const [page, setPage] = useState(1);

  const { data: ventasData, isLoading } = useVentas({
    search: search || undefined,
    metodoPago: filtroMetodo || undefined,
    page,
    limit: 20,
  });
  const { data: resumen } = useVentasResumen();
  const anularVenta = useAnularVenta();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Ventas</h1>
          <p className="text-gray-500 mt-1">Registro de ventas de productos</p>
        </div>
        <Link
          to="/ventas/nueva"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-heal-600 text-white rounded-xl font-medium hover:bg-heal-700 transition-colors shadow-soft"
        >
          <Plus className="w-5 h-5" />
          Nueva Venta
        </Link>
      </div>

      {/* Resumen Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-heal-100 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-heal-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Ventas</p>
              <p className="text-xl font-bold text-gray-900">{resumen?.totalVentas || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Monto Total</p>
              <p className="text-xl font-bold text-gray-900">{formatPrice(resumen?.montoTotal || 0)}</p>
            </div>
          </div>
        </div>
        {resumen?.porMetodo && Object.entries(resumen.porMetodo).slice(0, 2).map(([metodo, datos]) => (
          <div key={metodo} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                {(() => {
                  const Icon = metodoPagoLabels[metodo as MetodoPago]?.icon || CreditCard;
                  return <Icon className="w-5 h-5 text-gray-600" />;
                })()}
              </div>
              <div>
                <p className="text-sm text-gray-500">{metodoPagoLabels[metodo as MetodoPago]?.label || metodo}</p>
                <p className="text-xl font-bold text-gray-900">{formatPrice(datos.monto)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar ventas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-heal-500/20 focus:border-heal-500"
          />
        </div>
        <select
          value={filtroMetodo}
          onChange={(e) => setFiltroMetodo(e.target.value as MetodoPago | '')}
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-heal-500/20 focus:border-heal-500 bg-white"
        >
          <option value="">Todos los métodos</option>
          <option value="EFECTIVO">Efectivo</option>
          <option value="REDCOMPRA_DEBITO">Redcompra Débito</option>
          <option value="REDCOMPRA_CREDITO">Redcompra Crédito</option>
          <option value="TRANSFERENCIA">Transferencia</option>
        </select>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  # Venta
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Método
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-8" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20 ml-auto" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16 mx-auto" /></td>
                    <td className="px-6 py-4"></td>
                  </tr>
                ))
              ) : ventasData?.data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p>No hay ventas registradas</p>
                    <Link to="/ventas/nueva" className="text-heal-600 hover:text-heal-700 font-medium mt-2 inline-block">
                      Registrar primera venta
                    </Link>
                  </td>
                </tr>
              ) : (
                ventasData?.data.map((venta) => {
                  const MetodoIcon = metodoPagoLabels[venta.metodoPago]?.icon || CreditCard;
                  return (
                    <tr key={venta.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-medium text-gray-900">
                          #{venta.numeroVenta?.toString().padStart(5, '0')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {formatDate(venta.fechaVenta)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {venta.paciente ? (
                          <div>
                            <p className="font-medium text-gray-900">
                              {venta.paciente.firstName} {venta.paciente.lastName}
                            </p>
                            {venta.paciente.rut && (
                              <p className="text-xs text-gray-500">{venta.paciente.rut}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Sin cliente</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{venta.items.length} items</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MetodoIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {metodoPagoLabels[venta.metodoPago]?.label || venta.metodoPago}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-gray-900">
                          {formatPrice(Number(venta.total))}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                            venta.estado === 'COMPLETADA'
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          )}
                        >
                          {venta.estado === 'COMPLETADA' ? 'Completada' : 'Anulada'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {venta.estado === 'COMPLETADA' && (
                          <button
                            onClick={() => {
                              if (confirm('¿Estás seguro de anular esta venta? Se restaurará el stock de los productos.')) {
                                anularVenta.mutate(venta.id);
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Anular venta"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {ventasData && ventasData.meta.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Mostrando {((page - 1) * 20) + 1} - {Math.min(page * 20, ventasData.meta.total)} de {ventasData.meta.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(p => Math.min(ventasData.meta.totalPages, p + 1))}
                disabled={page === ventasData.meta.totalPages}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
