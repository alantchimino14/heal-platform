import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Target,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Wallet,
  Sun,
  Moon,
  Sunrise,
} from 'lucide-react';
import { useProfesionalResumen } from '@/api/hooks';
import { cn } from '@/lib/utils';

export function PortalHome() {
  const { profesionalId } = useParams();
  const { data: resumen, isLoading } = useProfesionalResumen(profesionalId || '');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Buenos días', icon: Sunrise };
    if (hour < 19) return { text: 'Buenas tardes', icon: Sun };
    return { text: 'Buenas noches', icon: Moon };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!resumen) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="w-20 h-20 rounded-full bg-heal-100 flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-10 h-10 text-heal-400" />
        </div>
        <p className="text-heal-500">No se encontró información del profesional</p>
      </div>
    );
  }

  const { profesional, mesActual, hoy, proximasSesiones, ultimaLiquidacion, contrato } = resumen;

  const metaProgress = mesActual.meta
    ? Math.min((mesActual.sesionesRealizadas / mesActual.meta.objetivo) * 100, 100)
    : 0;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Greeting Header */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-2 text-heal-500 mb-1">
          <GreetingIcon className="w-5 h-5" />
          <span className="text-sm font-medium">{greeting.text}</span>
        </div>
        <h1 className="text-2xl font-bold text-heal-900">
          {profesional.nombre.split(' ')[0]}
        </h1>
        {profesional.especialidad && (
          <p className="text-heal-500 text-sm">{profesional.especialidad}</p>
        )}
      </div>

      {/* Meta Card - Hero */}
      {mesActual.meta ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-heal-600 via-heal-700 to-heal-800 p-6 text-white shadow-soft-lg animate-fade-in-up stagger-1" style={{ animationFillMode: 'backwards' }}>
          {/* Decorative elements */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full" />

          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-white/80" />
                <span className="text-sm text-white/80">Meta de {format(new Date(), 'MMMM', { locale: es })}</span>
              </div>
              {mesActual.meta.cumplida && (
                <div className="flex items-center gap-1 bg-yellow-400/20 text-yellow-300 px-3 py-1 rounded-full text-xs font-semibold">
                  <Sparkles className="w-3 h-3" />
                  ¡Cumplida!
                </div>
              )}
            </div>

            <div className="flex items-end gap-2 mb-4">
              <span className="text-5xl font-bold">{mesActual.sesionesRealizadas}</span>
              <span className="text-2xl text-white/60 mb-1">/ {mesActual.meta.objetivo}</span>
            </div>

            {/* Progress bar */}
            <div className="h-3 bg-white/20 rounded-full overflow-hidden mb-3">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-1000 ease-out',
                  mesActual.meta.cumplida
                    ? 'bg-gradient-to-r from-yellow-300 to-yellow-400'
                    : 'bg-white'
                )}
                style={{ width: `${metaProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-white/80">{mesActual.meta.cumplimiento.toFixed(0)}% completado</span>
              {mesActual.meta.bonoDisponible && (
                <span className="text-yellow-300">Bono disponible</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-gradient-to-br from-heal-100 to-heal-50 p-6 border border-heal-200 animate-fade-in-up stagger-1" style={{ animationFillMode: 'backwards' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-heal-200 flex items-center justify-center">
              <Target className="w-6 h-6 text-heal-500" />
            </div>
            <div>
              <h3 className="font-semibold text-heal-900">Sin meta este mes</h3>
              <p className="text-sm text-heal-500">Contacta a tu administrador</p>
            </div>
          </div>
          <div className="text-center py-4">
            <span className="text-4xl font-bold text-heal-700">{mesActual.sesionesRealizadas}</span>
            <span className="text-heal-500 ml-2">sesiones realizadas</span>
          </div>
        </div>
      )}

      {/* Today's Sessions */}
      <div className="animate-fade-in-up stagger-2" style={{ animationFillMode: 'backwards' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-heal-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-heal-600" />
            Hoy
          </h2>
          <span className="text-sm text-heal-500">
            {format(new Date(), "EEEE d", { locale: es })}
          </span>
        </div>

        {hoy.total > 0 ? (
          <div className="space-y-3">
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl p-4 border border-heal-100 shadow-soft text-center">
                <p className="text-2xl font-bold text-heal-900">{hoy.total}</p>
                <p className="text-xs text-heal-500">Total</p>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 text-center">
                <p className="text-2xl font-bold text-emerald-600">{hoy.realizadas}</p>
                <p className="text-xs text-emerald-600">Hechas</p>
              </div>
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 text-center">
                <p className="text-2xl font-bold text-amber-600">{hoy.pendientes}</p>
                <p className="text-xs text-amber-600">Pendientes</p>
              </div>
            </div>

            {/* Sessions list */}
            {hoy.sesiones.length > 0 && (
              <div className="bg-white rounded-2xl border border-heal-100 shadow-soft overflow-hidden">
                {hoy.sesiones.slice(0, 3).map((sesion, index) => (
                  <div
                    key={sesion.id}
                    className={cn(
                      'flex items-center gap-3 p-4',
                      index < Math.min(hoy.sesiones.length, 3) - 1 && 'border-b border-heal-50'
                    )}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      sesion.estadoAtencion === 'REALIZADA' ? 'bg-emerald-100' : 'bg-amber-100'
                    )}>
                      {sesion.estadoAtencion === 'REALIZADA' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-amber-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-heal-900 truncate">
                        {sesion.paciente.firstName} {sesion.paciente.lastName}
                      </p>
                      <p className="text-sm text-heal-500">
                        {format(new Date(sesion.fechaHora), 'HH:mm')} • {sesion.servicio?.nombre || 'Sesión'}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-heal-300" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-heal-100 p-8 text-center shadow-soft">
            <div className="w-14 h-14 rounded-full bg-heal-50 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-7 h-7 text-heal-400" />
            </div>
            <p className="text-heal-600 font-medium">Sin sesiones hoy</p>
            <p className="text-heal-400 text-sm mt-1">Disfruta tu día libre</p>
          </div>
        )}
      </div>

      {/* Próximas Sesiones */}
      {proximasSesiones.length > 0 && (
        <div className="bg-white rounded-2xl shadow-soft border border-heal-100 overflow-hidden animate-fade-in-up stagger-3" style={{ animationFillMode: 'backwards' }}>
          <div className="flex items-center justify-between p-4 border-b border-heal-50">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-heal-600" />
              <span className="font-semibold text-heal-900">Próximas sesiones</span>
            </div>
            <span className="text-xs text-heal-400 bg-heal-50 px-2 py-1 rounded-full">
              {proximasSesiones.length} agendadas
            </span>
          </div>

          <div className="divide-y divide-heal-50">
            {proximasSesiones.slice(0, 4).map((sesion) => (
              <div key={sesion.id} className="flex items-center gap-3 p-4 hover:bg-heal-50/50 transition-colors">
                <div className="text-center min-w-[50px] bg-heal-50 rounded-xl py-2 px-3">
                  <p className="text-xs text-heal-500 uppercase">
                    {format(new Date(sesion.fechaHora), 'EEE', { locale: es })}
                  </p>
                  <p className="text-lg font-bold text-heal-900">
                    {format(new Date(sesion.fechaHora), 'd')}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-heal-900 truncate">
                    {sesion.paciente.firstName} {sesion.paciente.lastName}
                  </p>
                  <p className="text-sm text-heal-500">
                    {format(new Date(sesion.fechaHora), 'HH:mm')} • {sesion.servicio?.nombre || 'Sesión'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-heal-300" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 animate-fade-in-up stagger-4" style={{ animationFillMode: 'backwards' }}>
        {/* Contract info */}
        {contrato && (
          <div className="bg-gradient-to-br from-sage-50 to-sage-100/50 rounded-2xl p-4 border border-sage-200">
            <p className="text-xs text-sage-600 font-medium mb-1">Contrato</p>
            <p className="font-semibold text-sage-800">{contrato.tipo}</p>
            {contrato.tarifaPorSesion && (
              <p className="text-sm text-sage-600 mt-1">
                ${contrato.tarifaPorSesion.toLocaleString('es-CL')}/sesión
              </p>
            )}
          </div>
        )}

        {/* Last liquidation */}
        <div className="bg-white rounded-2xl border border-heal-100 p-4 shadow-soft">
          <div className="flex items-center gap-2 text-heal-500 mb-2">
            <Wallet className="w-4 h-4" />
            <span className="text-xs font-medium">Última liquidación</span>
          </div>
          {ultimaLiquidacion ? (
            <>
              <p className="text-xl font-bold text-heal-900">
                ${(ultimaLiquidacion.totalLiquido / 1000).toFixed(0)}k
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-heal-500 capitalize">
                  {format(new Date(ultimaLiquidacion.anio, ultimaLiquidacion.mes - 1), 'MMM', { locale: es })}
                </span>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  ultimaLiquidacion.estado === 'PAGADA' ? 'bg-emerald-100 text-emerald-700' :
                  ultimaLiquidacion.estado === 'APROBADA' ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-700'
                )}>
                  {ultimaLiquidacion.estado}
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm text-heal-400">Sin liquidaciones</p>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <div className="space-y-2 animate-pulse">
        <div className="h-4 w-24 bg-heal-100 rounded" />
        <div className="h-8 w-40 bg-heal-200 rounded" />
        <div className="h-4 w-32 bg-heal-100 rounded" />
      </div>
      <div className="h-44 bg-heal-200 rounded-3xl animate-pulse" />
      <div className="h-56 bg-heal-100 rounded-2xl animate-pulse" />
      <div className="h-40 bg-heal-100 rounded-2xl animate-pulse" />
    </div>
  );
}
