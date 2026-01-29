import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  AlertCircle,
  CreditCard,
  UserPlus,
  CalendarPlus,
  Eye,
  ArrowRight,
  FileText,
  Clock,
  Target,
  Award,
  ExternalLink,
} from 'lucide-react';
import { useDashboard, useMetricasEquipo } from '@/api/hooks';
import { formatMoney, cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { PageHeader, StatCard, SkeletonKPI, Avatar, Badge } from '@/components/ui';

export function Dashboard() {
  const [dateRange] = useState(() => {
    const now = new Date();
    return {
      desde: format(startOfMonth(now), 'yyyy-MM-dd'),
      hasta: format(endOfMonth(now), 'yyyy-MM-dd'),
    };
  });

  const { data, isLoading } = useDashboard(dateRange.desde, dateRange.hasta);
  const { data: equipoData, isLoading: loadingEquipo } = useMetricasEquipo();

  const kpis = data?.kpis;
  const currentMonth = format(new Date(), 'MMMM yyyy', { locale: es });

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <PageHeader
        title="Dashboard"
        description={`Resumen de ${currentMonth}`}
      />

      {/* Quick Actions */}
      <section className="animate-fade-in-up stagger-1">
        <h2 className="heading-4 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction
            icon={UserPlus}
            label="Nuevo Paciente"
            href="/pacientes/nuevo"
            color="heal"
          />
          <QuickAction
            icon={CalendarPlus}
            label="Agendar Sesión"
            href="/sesiones/nueva"
            color="sage"
          />
          <QuickAction
            icon={CreditCard}
            label="Registrar Pago"
            href="/pagos/nuevo"
            color="emerald"
          />
          <QuickAction
            icon={Eye}
            label="Ver Agenda"
            href="/sesiones"
            color="blue"
          />
        </div>
      </section>

      {/* KPIs */}
      <section className="animate-fade-in-up stagger-2">
        <h2 className="heading-4 mb-4">Métricas del Mes</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <SkeletonKPI key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Ventas del Mes"
                value={formatMoney(kpis?.ventasTotales || 0)}
                icon={DollarSign}
                color="blue"
              />
              <StatCard
                title="Cobranzas"
                value={formatMoney(kpis?.cobranzas || 0)}
                icon={TrendingUp}
                color="emerald"
              />
              <StatCard
                title="Deuda Pendiente"
                value={formatMoney(kpis?.deudaPendiente || 0)}
                icon={AlertCircle}
                color="red"
              />
              <StatCard
                title="Pacientes Activos"
                value={kpis?.pacientesActivos?.toString() || '0'}
                icon={Users}
                color="heal"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <StatCard
                title="Sesiones Realizadas"
                value={kpis?.sesionesRealizadas?.toString() || '0'}
                icon={Calendar}
                color="sage"
              />
              <StatCard
                title="Tasa de Adherencia"
                value={`${kpis?.tasaAdherencia?.toFixed(1) || 0}%`}
                icon={TrendingUp}
                color="emerald"
              />
              <StatCard
                title="Saldos a Favor"
                value={formatMoney(kpis?.saldosAFavor || 0)}
                icon={DollarSign}
                color="blue"
              />
            </div>
          </>
        )}
      </section>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Deudores */}
        <section className="animate-fade-in-up stagger-3">
          <div className="card">
            <div className="p-5 border-b border-heal-100 flex items-center justify-between">
              <div>
                <h3 className="heading-4">Pacientes con Mayor Deuda</h3>
                <p className="text-sm text-heal-500 mt-0.5">Top 5 cuentas pendientes</p>
              </div>
              <Link
                to="/pacientes?filter=deuda"
                className="text-sm text-heal-600 hover:text-heal-700 font-medium flex items-center gap-1"
              >
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-heal-50">
              {!data?.topDeudores || data.topDeudores.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="text-heal-600 font-medium">Sin deudas pendientes</p>
                  <p className="text-sm text-heal-500 mt-1">Todos los pacientes están al día</p>
                </div>
              ) : (
                data.topDeudores.slice(0, 5).map((paciente, index) => (
                  <Link
                    key={paciente.id}
                    to={`/pacientes/${paciente.id}`}
                    className="flex items-center justify-between p-4 hover:bg-heal-50/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                          index === 0 && 'bg-red-100 text-red-700',
                          index === 1 && 'bg-amber-100 text-amber-700',
                          index === 2 && 'bg-yellow-100 text-yellow-700',
                          index > 2 && 'bg-heal-100 text-heal-600'
                        )}
                      >
                        {index + 1}
                      </span>
                      <span className="font-medium text-heal-900 group-hover:text-heal-700">
                        {paciente.nombre}
                      </span>
                    </div>
                    <span className="font-semibold text-red-600">
                      {formatMoney(paciente.deuda)}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Alertas y Pendientes */}
        <section className="animate-fade-in-up stagger-4">
          <div className="card">
            <div className="p-5 border-b border-heal-100">
              <h3 className="heading-4">Alertas y Pendientes</h3>
              <p className="text-sm text-heal-500 mt-0.5">Requieren atención</p>
            </div>
            <div className="p-4 space-y-3">
              <AlertItem
                icon={FileText}
                title="Boletas pendientes"
                description="3 sesiones realizadas sin boleta emitida"
                href="/sesiones?estadoBoleta=NO_EMITIDA"
                variant="warning"
              />
              <AlertItem
                icon={Clock}
                title="Sesiones de hoy"
                description="5 sesiones programadas para hoy"
                href="/sesiones?fecha=hoy"
                variant="info"
              />
              <AlertItem
                icon={Users}
                title="Pacientes sin actividad"
                description="12 pacientes sin sesiones en 30 días"
                href="/pacientes?filter=inactivos"
                variant="default"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Métricas del Equipo */}
      <section className="animate-fade-in-up stagger-5">
        <div className="card">
          <div className="p-5 border-b border-heal-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-heal-500 to-heal-700 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="heading-4">Métricas del Equipo</h3>
                <p className="text-sm text-heal-500 mt-0.5">Cumplimiento de metas {currentMonth}</p>
              </div>
            </div>
            {equipoData?.resumen && (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-heal-900">
                  {equipoData.resumen.porcentajeCumplimiento.toFixed(0)}%
                </span>
                <span className="text-sm text-heal-500">del equipo</span>
              </div>
            )}
          </div>

          {loadingEquipo ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-heal-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : equipoData?.equipo && equipoData.equipo.length > 0 ? (
            <div className="divide-y divide-heal-50">
              {equipoData.equipo.map((profesional) => (
                <Link
                  key={profesional.id}
                  to={`/portal/${profesional.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-heal-50/50 transition-colors group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: profesional.color || '#5f7da1' }}
                  >
                    {profesional.nombre.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-heal-900 truncate">{profesional.nombre}</p>
                      {profesional.meta?.cumplida && (
                        <Award className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <p className="text-sm text-heal-500">
                      {profesional.sesionesDelMes} sesiones este mes
                      {profesional.meta && ` • Meta: ${profesional.meta.objetivo}`}
                    </p>
                  </div>
                  {profesional.meta && (
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-heal-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            profesional.meta.cumplida ? 'bg-emerald-500' : 'bg-amber-500'
                          )}
                          style={{ width: `${Math.min(profesional.meta.cumplimiento, 100)}%` }}
                        />
                      </div>
                      <span
                        className={cn(
                          'text-sm font-semibold w-12 text-right',
                          profesional.meta.cumplida ? 'text-emerald-600' : 'text-amber-600'
                        )}
                      >
                        {profesional.meta.cumplimiento.toFixed(0)}%
                      </span>
                    </div>
                  )}
                  <ExternalLink className="w-4 h-4 text-heal-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-heal-300 mx-auto mb-3" />
              <p className="text-heal-500">No hay profesionales activos</p>
            </div>
          )}

          {/* Liquidaciones Pendientes */}
          {equipoData?.liquidacionesPendientes && equipoData.liquidacionesPendientes.length > 0 && (
            <div className="border-t border-heal-100 p-4 bg-amber-50/50">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">
                  {equipoData.liquidacionesPendientes.length} liquidaciones pendientes
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {equipoData.liquidacionesPendientes.slice(0, 5).map((liq) => (
                  <span
                    key={liq.id}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm border border-amber-200"
                  >
                    <span className="text-heal-600">{liq.profesional}</span>
                    <span className="text-heal-400">•</span>
                    <span className="text-amber-600 font-medium">
                      {formatMoney(liq.totalLiquido)}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Actividad Reciente */}
      <section className="animate-fade-in-up stagger-6">
        <div className="card">
          <div className="p-5 border-b border-heal-100 flex items-center justify-between">
            <div>
              <h3 className="heading-4">Actividad Reciente</h3>
              <p className="text-sm text-heal-500 mt-0.5">Últimos movimientos</p>
            </div>
          </div>
          <div className="divide-y divide-heal-50">
            <ActivityItem
              avatar={{ firstName: 'María', lastName: 'González' }}
              action="Pago registrado"
              detail="$45.000 - Transferencia"
              time="Hace 5 min"
              badge={{ label: 'Pago', variant: 'success' }}
            />
            <ActivityItem
              avatar={{ firstName: 'Carlos', lastName: 'Pérez' }}
              action="Sesión completada"
              detail="Kinesiología - Dr. Rodríguez"
              time="Hace 15 min"
              badge={{ label: 'Sesión', variant: 'info' }}
            />
            <ActivityItem
              avatar={{ firstName: 'Ana', lastName: 'Martínez' }}
              action="Nueva cita agendada"
              detail="25 Enero, 10:00 hrs"
              time="Hace 1 hora"
              badge={{ label: 'Agenda', variant: 'sage' }}
            />
            <ActivityItem
              avatar={{ firstName: 'Pedro', lastName: 'Soto' }}
              action="Paciente registrado"
              detail="Nuevo paciente en el sistema"
              time="Hace 2 horas"
              badge={{ label: 'Nuevo', variant: 'gray' }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

// Quick Action Component
function QuickAction({
  icon: Icon,
  label,
  href,
  color,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
  color: 'heal' | 'sage' | 'emerald' | 'blue';
}) {
  const colorClasses = {
    heal: 'bg-heal-100 text-heal-600 group-hover:bg-heal-600 group-hover:text-white',
    sage: 'bg-sage-100 text-sage-600 group-hover:bg-sage-600 group-hover:text-white',
    emerald: 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
    blue: 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
  };

  return (
    <Link to={href} className="quick-action group">
      <div className={cn('quick-action-icon transition-colors duration-300', colorClasses[color])}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-sm font-medium text-heal-700 group-hover:text-heal-900">
        {label}
      </span>
    </Link>
  );
}

// Alert Item Component
function AlertItem({
  icon: Icon,
  title,
  description,
  href,
  variant = 'default',
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  variant?: 'default' | 'warning' | 'error' | 'info';
}) {
  const variantClasses = {
    default: 'bg-heal-50 border-heal-200 text-heal-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    error: 'bg-red-50 border-red-200 text-red-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  };

  const iconClasses = {
    default: 'text-heal-500',
    warning: 'text-amber-500',
    error: 'text-red-500',
    info: 'text-blue-500',
  };

  return (
    <Link
      to={href}
      className={cn(
        'flex items-start gap-3 p-3 rounded-xl border transition-all',
        'hover:shadow-soft hover:-translate-y-0.5',
        variantClasses[variant]
      )}
    >
      <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', iconClasses[variant])} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs opacity-80 mt-0.5">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 opacity-50" />
    </Link>
  );
}

// Activity Item Component
function ActivityItem({
  avatar,
  action,
  detail,
  time,
  badge,
}: {
  avatar: { firstName: string; lastName: string };
  action: string;
  detail: string;
  time: string;
  badge: { label: string; variant: 'success' | 'info' | 'sage' | 'gray' };
}) {
  return (
    <div className="flex items-center gap-4 p-4 hover:bg-heal-50/50 transition-colors">
      <Avatar firstName={avatar.firstName} lastName={avatar.lastName} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-heal-900 truncate">{action}</p>
          <Badge variant={badge.variant} size="sm">
            {badge.label}
          </Badge>
        </div>
        <p className="text-sm text-heal-500 truncate">{detail}</p>
      </div>
      <span className="text-xs text-heal-400 whitespace-nowrap">{time}</span>
    </div>
  );
}
