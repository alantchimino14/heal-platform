import { Bell, RefreshCw, Search, Command } from 'lucide-react';
import { useResumenRapido } from '@/api/hooks';
import { formatMoney } from '@/lib/utils';
import { Avatar } from '@/components/ui';
import { cn } from '@/lib/utils';

export function Header() {
  const { data: resumen, isLoading, refetch, isFetching } = useResumenRapido();

  return (
    <header className="flex h-20 items-center justify-between border-b border-heal-100 bg-white/80 backdrop-blur-sm px-8">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <button
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border border-heal-200
                     text-heal-400 text-sm bg-heal-50/50 hover:bg-heal-100/50 hover:border-heal-300
                     transition-all duration-200 group"
        >
          <Search className="w-4 h-4" />
          <span className="flex-1 text-left">Buscar pacientes, sesiones...</span>
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-heal-200 text-heal-500 text-xs font-medium">
            <Command className="w-3 h-3" />K
          </kbd>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="flex items-center gap-6 mx-8">
        {isLoading ? (
          <div className="flex gap-6">
            <div className="h-4 w-24 skeleton rounded" />
            <div className="h-4 w-24 skeleton rounded" />
            <div className="h-4 w-24 skeleton rounded" />
          </div>
        ) : resumen ? (
          <>
            <QuickStat label="Sesiones hoy" value={resumen.sesionesHoy} />
            <QuickStat
              label="Deuda total"
              value={formatMoney(resumen.deudaTotal)}
              color="error"
            />
            <QuickStat
              label="Pagos hoy"
              value={formatMoney(resumen.pagosHoy?.monto || 0)}
              color="success"
            />
          </>
        ) : null}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className={cn(
            'btn-ghost btn-icon',
            isFetching && 'animate-spin'
          )}
          title="Actualizar datos"
        >
          <RefreshCw className="h-5 w-5" />
        </button>

        <button className="btn-ghost btn-icon relative" title="Notificaciones">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div className="w-px h-8 bg-heal-200 mx-2" />

        <button className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-heal-50 transition-colors">
          <Avatar firstName="Admin" lastName="Heal" size="sm" />
          <div className="text-left hidden lg:block">
            <p className="text-sm font-medium text-heal-900">Admin</p>
            <p className="text-xs text-heal-500">Administrador</p>
          </div>
        </button>
      </div>
    </header>
  );
}

function QuickStat({
  label,
  value,
  color = 'default',
}: {
  label: string;
  value: string | number;
  color?: 'default' | 'success' | 'error';
}) {
  const valueColors = {
    default: 'text-heal-900',
    success: 'text-emerald-600',
    error: 'text-red-600',
  };

  return (
    <div className="text-sm">
      <span className="text-heal-500">{label}</span>
      <p className={cn('font-semibold', valueColors[color])}>{value}</p>
    </div>
  );
}
