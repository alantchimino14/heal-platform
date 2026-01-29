import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  TrendingUp,
  Target,
  Calendar,
  DollarSign,
  Award,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  useProfesionalMetricas,
  useProfesionalMetas,
  useProfesionalIngresos,
} from '@/api/hooks';
import { cn } from '@/lib/utils';

export function PortalMetricas() {
  const { profesionalId } = useParams();
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const desde = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
  const hasta = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');

  const { data: metricas, isLoading: loadingMetricas } = useProfesionalMetricas(
    profesionalId || '',
    { desde, hasta }
  );

  const { data: metas } = useProfesionalMetas(profesionalId || '', { limit: 6 });

  const { data: ingresos } = useProfesionalIngresos(profesionalId || '', {
    desde: format(subMonths(selectedMonth, 2), 'yyyy-MM-dd'),
    hasta,
    agrupacion: 'semana',
  });

  const prevMonth = () => setSelectedMonth(subMonths(selectedMonth, 1));
  const nextMonth = () => {
    const next = new Date(selectedMonth);
    next.setMonth(next.getMonth() + 1);
    if (next <= new Date()) {
      setSelectedMonth(next);
    }
  };

  const chartData = ingresos?.map((item) => ({
    periodo: format(new Date(item.periodo), 'd MMM', { locale: es }),
    sesiones: item.sesiones,
    ingresos: item.generado,
  })) || [];

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Month Selector */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="p-2 rounded-xl hover:bg-heal-50 text-heal-600 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-heal-900">
          {format(selectedMonth, 'MMMM yyyy', { locale: es })}
        </h1>
        <button
          onClick={nextMonth}
          disabled={selectedMonth >= new Date()}
          className={cn(
            'p-2 rounded-xl transition-colors',
            selectedMonth >= new Date()
              ? 'text-heal-200 cursor-not-allowed'
              : 'hover:bg-heal-50 text-heal-600'
          )}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Stats Cards */}
      {loadingMetricas ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-heal-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : metricas && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={Calendar}
            label="Sesiones"
            value={metricas.sesionesRealizadas}
            color="heal"
          />
          <StatCard
            icon={Target}
            label="Meta"
            value={metricas.metaActual ? `${metricas.metaActual.cumplimiento.toFixed(0)}%` : 'N/A'}
            color={metricas.metaActual?.metaCumplida ? 'emerald' : 'amber'}
          />
          <StatCard
            icon={DollarSign}
            label="Generado"
            value={`$${(metricas.ingresosTotales / 1000).toFixed(0)}k`}
            color="blue"
          />
          <StatCard
            icon={TrendingUp}
            label="Cobrado"
            value={`$${(metricas.ingresosCobrados / 1000).toFixed(0)}k`}
            color="emerald"
          />
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-heal-100 p-4">
          <h3 className="font-semibold text-heal-900 mb-4">Sesiones por semana</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSesiones" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5f7da1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#5f7da1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="periodo"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis hide />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload?.[0]) {
                      return (
                        <div className="bg-white rounded-lg shadow-lg border border-heal-100 p-2">
                          <p className="text-sm font-medium text-heal-900">
                            {payload[0].payload.periodo}
                          </p>
                          <p className="text-sm text-heal-600">
                            {payload[0].value} sesiones
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sesiones"
                  stroke="#5f7da1"
                  strokeWidth={2}
                  fill="url(#colorSesiones)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Historial de Metas */}
      {metas && metas.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-heal-100 overflow-hidden">
          <div className="p-4 border-b border-heal-50">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-heal-600" />
              <h3 className="font-semibold text-heal-900">Historial de metas</h3>
            </div>
          </div>

          <div className="divide-y divide-heal-50">
            {metas.map((meta) => (
              <div key={meta.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-heal-900">
                    {format(new Date(meta.anio, meta.mes - 1), 'MMMM yyyy', { locale: es })}
                  </p>
                  <p className="text-sm text-heal-500">
                    {meta.sesionesRealizadas} / {meta.sesionesObjetivo} sesiones
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-2 bg-heal-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        meta.metaCumplida ? 'bg-emerald-500' : 'bg-amber-500'
                      )}
                      style={{ width: `${Math.min(meta.cumplimiento, 100)}%` }}
                    />
                  </div>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      meta.metaCumplida ? 'text-emerald-600' : 'text-amber-600'
                    )}
                  >
                    {meta.cumplimiento.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  color: 'heal' | 'emerald' | 'amber' | 'blue';
}) {
  const colors = {
    heal: 'bg-heal-50 text-heal-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-heal-100 p-4">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', colors[color])}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-heal-900">{value}</p>
      <p className="text-sm text-heal-500">{label}</p>
    </div>
  );
}
