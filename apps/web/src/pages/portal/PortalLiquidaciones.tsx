import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  FileText,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  DollarSign,
  Calendar,
  X,
} from 'lucide-react';
import { useProfesionalLiquidaciones, useLiquidacion } from '@/api/hooks';
import { cn } from '@/lib/utils';

export function PortalLiquidaciones() {
  const { profesionalId } = useParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: liquidaciones, isLoading } = useProfesionalLiquidaciones(
    profesionalId || '',
    { limit: 12 }
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-heal-900 mb-6">Mis Liquidaciones</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-heal-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : !liquidaciones || liquidaciones.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-heal-50 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-heal-300" />
          </div>
          <p className="text-heal-500">No tienes liquidaciones aún</p>
        </div>
      ) : (
        <div className="space-y-3">
          {liquidaciones.map((liq) => (
            <LiquidacionCard
              key={liq.id}
              liquidacion={liq}
              onClick={() => setSelectedId(liq.id)}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedId && (
        <LiquidacionDetail
          liquidacionId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

function LiquidacionCard({
  liquidacion,
  onClick,
}: {
  liquidacion: any;
  onClick: () => void;
}) {
  const getStatusConfig = () => {
    switch (liquidacion.estado) {
      case 'PAGADA':
        return {
          icon: CheckCircle2,
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          iconColor: 'text-emerald-500',
          label: 'Pagada',
          labelBg: 'bg-emerald-100 text-emerald-700',
        };
      case 'APROBADA':
        return {
          icon: Clock,
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          iconColor: 'text-blue-500',
          label: 'Aprobada',
          labelBg: 'bg-blue-100 text-blue-700',
        };
      case 'RECHAZADA':
        return {
          icon: AlertCircle,
          bg: 'bg-red-50',
          border: 'border-red-200',
          iconColor: 'text-red-500',
          label: 'Rechazada',
          labelBg: 'bg-red-100 text-red-700',
        };
      default:
        return {
          icon: Clock,
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          iconColor: 'text-amber-500',
          label: liquidacion.estado === 'BORRADOR' ? 'Borrador' : 'Pendiente',
          labelBg: 'bg-amber-100 text-amber-700',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  const mesNombre = format(new Date(liquidacion.anio, liquidacion.mes - 1), 'MMMM yyyy', {
    locale: es,
  });

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full rounded-2xl border p-4 text-left transition-all hover:shadow-md',
        config.bg,
        config.border
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
          <Icon className={cn('w-6 h-6', config.iconColor)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-heal-900 capitalize">{mesNombre}</p>
            <span className={cn('text-xs font-medium px-2 py-1 rounded-full', config.labelBg)}>
              {config.label}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-lg font-bold text-heal-900">
              ${liquidacion.totalLiquido.toLocaleString('es-CL')}
            </span>
            <span className="text-sm text-heal-500">
              {liquidacion.sesionesRealizadas} sesiones
            </span>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-heal-300" />
      </div>
    </button>
  );
}

function LiquidacionDetail({
  liquidacionId,
  onClose,
}: {
  liquidacionId: string;
  onClose: () => void;
}) {
  const { data: liquidacion, isLoading } = useLiquidacion(liquidacionId);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
        <div className="bg-white w-full max-w-lg rounded-t-3xl p-6 animate-pulse">
          <div className="h-8 w-48 bg-heal-100 rounded mb-4" />
          <div className="h-64 bg-heal-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!liquidacion) return null;

  const mesNombre = format(new Date(liquidacion.anio, liquidacion.mes - 1), 'MMMM yyyy', {
    locale: es,
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div
        className="bg-white w-full max-w-lg rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-heal-100">
          <div>
            <h2 className="text-lg font-bold text-heal-900 capitalize">
              Liquidación {mesNombre}
            </h2>
            <p className="text-sm text-heal-500">N° {liquidacion.numero}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-heal-50 text-heal-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-heal-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-heal-500" />
                <span className="text-sm text-heal-500">Sesiones</span>
              </div>
              <p className="text-xl font-bold text-heal-900">
                {liquidacion.sesionesRealizadas}
              </p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-emerald-600">Total líquido</span>
              </div>
              <p className="text-xl font-bold text-emerald-700">
                ${liquidacion.totalLiquido.toLocaleString('es-CL')}
              </p>
            </div>
          </div>

          {/* Items */}
          {liquidacion.items && liquidacion.items.length > 0 && (
            <div className="bg-white rounded-xl border border-heal-100 overflow-hidden">
              <div className="p-3 bg-heal-50 border-b border-heal-100">
                <h3 className="font-semibold text-heal-900">Detalle</h3>
              </div>
              <div className="divide-y divide-heal-50">
                {liquidacion.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-heal-900 truncate">
                        {item.concepto}
                      </p>
                      {item.descripcion && (
                        <p className="text-xs text-heal-500 truncate">
                          {item.descripcion}
                        </p>
                      )}
                    </div>
                    <span
                      className={cn(
                        'font-semibold',
                        item.esDescuento ? 'text-red-600' : 'text-heal-900'
                      )}
                    >
                      {item.esDescuento ? '-' : ''}$
                      {item.monto.toLocaleString('es-CL')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="bg-heal-900 rounded-xl p-4 text-white space-y-2">
            <div className="flex justify-between">
              <span className="text-heal-200">Total bruto</span>
              <span className="font-medium">
                ${liquidacion.totalBruto.toLocaleString('es-CL')}
              </span>
            </div>
            {liquidacion.totalDescuentos > 0 && (
              <div className="flex justify-between">
                <span className="text-heal-200">Descuentos</span>
                <span className="font-medium text-red-300">
                  -${liquidacion.totalDescuentos.toLocaleString('es-CL')}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-heal-700">
              <span className="font-semibold">Total líquido</span>
              <span className="text-xl font-bold">
                ${liquidacion.totalLiquido.toLocaleString('es-CL')}
              </span>
            </div>
          </div>

          {/* Payment Info */}
          {liquidacion.estado === 'PAGADA' && liquidacion.fechaPago && (
            <div className="bg-emerald-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-medium text-emerald-700">Pagada</span>
              </div>
              <p className="text-sm text-emerald-600">
                {format(new Date(liquidacion.fechaPago), "d 'de' MMMM, yyyy", {
                  locale: es,
                })}
                {liquidacion.metodoPago && ` • ${liquidacion.metodoPago}`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
