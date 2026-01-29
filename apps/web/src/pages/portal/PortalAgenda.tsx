import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  User,
} from 'lucide-react';
import { useProfesionalSesiones } from '@/api/hooks';
import { cn } from '@/lib/utils';

export function PortalAgenda() {
  const { profesionalId } = useParams();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const desde = format(weekStart, 'yyyy-MM-dd');
  const hasta = format(addDays(weekStart, 6), 'yyyy-MM-dd');

  const { data: sesionesData, isLoading } = useProfesionalSesiones(
    profesionalId || '',
    { desde, hasta, limit: 100 }
  );

  const sesiones = sesionesData?.data || [];
  const sesionesDia = sesiones.filter((s: { fechaHora: string }) =>
    isSameDay(parseISO(s.fechaHora), selectedDate)
  );

  const prevWeek = () => setCurrentDate(addDays(currentDate, -7));
  const nextWeek = () => setCurrentDate(addDays(currentDate, 7));

  const getSesionesCount = (date: Date) =>
    sesiones.filter((s: { fechaHora: string }) => isSameDay(parseISO(s.fechaHora), date)).length;

  return (
    <div className="max-w-lg mx-auto">
      {/* Week Navigation */}
      <div className="sticky top-14 bg-white/95 backdrop-blur-sm z-40 border-b border-heal-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={prevWeek}
            className="p-2 rounded-xl hover:bg-heal-50 text-heal-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-heal-900">
            {format(weekStart, 'MMMM yyyy', { locale: es })}
          </span>
          <button
            onClick={nextWeek}
            className="p-2 rounded-xl hover:bg-heal-50 text-heal-600 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Week Days */}
        <div className="flex justify-around px-2 pb-3">
          {weekDays.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const count = getSesionesCount(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  'flex flex-col items-center p-2 rounded-xl transition-all min-w-[44px]',
                  isSelected
                    ? 'bg-heal-600 text-white shadow-lg scale-105'
                    : 'hover:bg-heal-50'
                )}
              >
                <span
                  className={cn(
                    'text-xs uppercase mb-1',
                    isSelected ? 'text-heal-100' : 'text-heal-400'
                  )}
                >
                  {format(day, 'EEE', { locale: es })}
                </span>
                <span
                  className={cn(
                    'text-lg font-bold',
                    isSelected ? 'text-white' : isToday ? 'text-heal-600' : 'text-heal-900'
                  )}
                >
                  {format(day, 'd')}
                </span>
                {count > 0 && (
                  <span
                    className={cn(
                      'text-xs mt-1 px-2 py-0.5 rounded-full',
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-heal-100 text-heal-600'
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sessions List */}
      <div className="px-4 py-6 space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-heal-900">
            {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
          </h2>
          <span className="text-sm text-heal-500">
            {sesionesDia.length} sesiones
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-heal-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : sesionesDia.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-heal-50 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-heal-300" />
            </div>
            <p className="text-heal-500">No hay sesiones este día</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sesionesDia
              .sort((a: { fechaHora: string }, b: { fechaHora: string }) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime())
              .map((sesion: any) => (
                <SessionCard key={sesion.id} sesion={sesion} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SessionCard({ sesion }: { sesion: any }) {
  const getStatusConfig = () => {
    switch (sesion.estadoAtencion) {
      case 'REALIZADA':
        return {
          icon: CheckCircle2,
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          iconColor: 'text-emerald-500',
          label: 'Realizada',
          labelBg: 'bg-emerald-100 text-emerald-700',
        };
      case 'CANCELADA':
        return {
          icon: XCircle,
          bg: 'bg-red-50',
          border: 'border-red-200',
          iconColor: 'text-red-500',
          label: 'Cancelada',
          labelBg: 'bg-red-100 text-red-700',
        };
      default:
        return {
          icon: Clock,
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          iconColor: 'text-amber-500',
          label: 'Pendiente',
          labelBg: 'bg-amber-100 text-amber-700',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 transition-all',
        config.bg,
        config.border
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-sm'
          )}
        >
          <Icon className={cn('w-6 h-6', config.iconColor)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-heal-900">
                {sesion.paciente.firstName} {sesion.paciente.lastName}
              </p>
              <p className="text-sm text-heal-600">
                {sesion.servicio?.nombre || 'Sesión general'}
              </p>
            </div>
            <span className={cn('text-xs font-medium px-2 py-1 rounded-full', config.labelBg)}>
              {config.label}
            </span>
          </div>

          <div className="flex items-center gap-4 mt-3 text-sm text-heal-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{format(new Date(sesion.fechaHora), 'HH:mm')}</span>
            </div>
            {sesion.paciente.rut && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{sesion.paciente.rut}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
