import {
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  Users,
  Calendar,
  CreditCard,
  Package,
  ShoppingCart,
  UserCog,
  ExternalLink,
  AlertTriangle,
  Lightbulb,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HelpSection {
  icon: typeof HelpCircle;
  title: string;
  description: string;
  enHeal: string[];
  enMedilink: string[];
  tips?: string[];
}

const sections: HelpSection[] = [
  {
    icon: Users,
    title: 'Pacientes',
    description: 'Gestión de fichas de pacientes',
    enHeal: [
      'Crear nuevos pacientes',
      'Editar datos de contacto',
      'Ver historial de sesiones y pagos',
      'Ver balance (deuda o saldo a favor)',
    ],
    enMedilink: [
      'Los pacientes se sincronizan automáticamente',
      'Ficha clínica detallada',
      'Documentos y consentimientos',
    ],
    tips: [
      'Al crear un paciente aquí, se creará también en Medilink',
      'El RUT es importante para la sincronización',
    ],
  },
  {
    icon: Calendar,
    title: 'Sesiones / Agenda',
    description: 'Citas y atenciones de kinesiología',
    enHeal: [
      'Agendar nuevas sesiones',
      'Ver calendario de citas',
      'Cambiar estado de agenda (confirmar, cancelar)',
      'Ver estado de pago de cada sesión',
    ],
    enMedilink: [
      'Marcar sesión como REALIZADA (atención)',
      'Emitir boletas',
      'Registro clínico de la atención',
    ],
    tips: [
      'Una sesión tiene 4 estados independientes: Agenda, Atención, Pago y Boleta',
      'Solo Medilink puede marcar una sesión como "Realizada"',
      'Los pagos se registran aquí en Heal sin restricción de fecha',
    ],
  },
  {
    icon: CreditCard,
    title: 'Pagos de Sesiones',
    description: 'Cobros por atenciones de kinesiología',
    enHeal: [
      'Registrar pagos (sin restricción de fecha)',
      'Pagos parciales o completos',
      'Pagos anticipados (genera saldo a favor)',
      'Un pago puede cubrir múltiples sesiones',
      'Ver historial de pagos por paciente',
    ],
    enMedilink: [
      'Ver pagos sincronizados (solo lectura)',
      'Emitir boletas por los pagos',
    ],
    tips: [
      'Heal resuelve el problema de Medilink que no permite pagos fuera de fecha',
      'Los métodos disponibles: Efectivo, Redcompra Débito, Redcompra Crédito, Transferencia',
    ],
  },
  {
    icon: Package,
    title: 'Productos',
    description: 'Inventario de productos físicos',
    enHeal: [
      'Crear y editar productos',
      'Controlar stock',
      'Ajustar inventario (+/-)',
      'Alertas de stock bajo',
      'Categorizar productos',
    ],
    enMedilink: [
      'No aplica - Los productos solo existen en Heal',
    ],
    tips: [
      'Define un stock mínimo para recibir alertas',
      'El stock se descuenta automáticamente al vender',
    ],
  },
  {
    icon: ShoppingCart,
    title: 'Ventas de Productos',
    description: 'Venta de productos físicos (no sesiones)',
    enHeal: [
      'Registrar ventas de productos',
      'Asociar venta a un paciente (opcional)',
      'Múltiples productos por venta',
      'Anular ventas (restaura stock)',
      'Resumen de ventas por método de pago',
    ],
    enMedilink: [
      'No aplica - Las ventas de productos solo existen en Heal',
    ],
    tips: [
      'Las ventas son independientes de las sesiones',
      'Puedes vender sin asociar a un cliente',
    ],
  },
  {
    icon: UserCog,
    title: 'Profesionales',
    description: 'Kinesiólogos y equipo',
    enHeal: [
      'Crear y editar profesionales',
      'Ver métricas: sesiones, ingresos',
      'Asignar color para calendario',
      'Configurar precios personalizados por servicio',
    ],
    enMedilink: [
      'Los profesionales se sincronizan',
      'Asignación a atenciones',
    ],
    tips: [
      'Cada profesional puede tener precios diferentes para el mismo servicio',
      'Las métricas muestran ingresos generados vs cobrados',
    ],
  },
];

const workflowSteps = [
  {
    step: 1,
    title: 'Crear Paciente',
    where: 'Heal',
    description: 'Se sincroniza automáticamente a Medilink',
  },
  {
    step: 2,
    title: 'Agendar Sesión',
    where: 'Heal',
    description: 'Selecciona paciente, profesional, servicio y fecha',
  },
  {
    step: 3,
    title: 'Realizar Atención',
    where: 'Medilink',
    description: 'Marcar como "Realizada" en Medilink',
  },
  {
    step: 4,
    title: 'Registrar Pago',
    where: 'Heal',
    description: 'Sin restricción de fecha ni monto',
  },
  {
    step: 5,
    title: 'Emitir Boleta',
    where: 'Medilink',
    description: 'Generar boleta electrónica',
  },
];

export function Ayuda() {
  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-heal-100 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-heal-600" />
        </div>
        <h1 className="text-3xl font-display font-bold text-gray-900">Centro de Ayuda</h1>
        <p className="text-gray-500 mt-2 max-w-xl mx-auto">
          Guía rápida para entender qué se hace en Heal y qué se hace en Medilink
        </p>
      </div>

      {/* Quick Summary */}
      <div className="bg-gradient-to-br from-heal-600 to-heal-700 rounded-2xl p-6 text-white">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Resumen Rápido
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-300" />
              En HEAL puedes:
            </h3>
            <ul className="space-y-1 text-sm text-white/90">
              <li>• Crear y editar pacientes</li>
              <li>• Agendar sesiones</li>
              <li>• Registrar pagos (sin restricción de fecha)</li>
              <li>• Gestionar productos e inventario</li>
              <li>• Registrar ventas de productos</li>
              <li>• Ver métricas de profesionales</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-blue-300" />
              En MEDILINK debes:
            </h3>
            <ul className="space-y-1 text-sm text-white/90">
              <li>• Marcar sesiones como "Realizadas"</li>
              <li>• Emitir boletas electrónicas</li>
              <li>• Registrar notas clínicas detalladas</li>
              <li>• Gestionar documentos y consentimientos</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Workflow */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Flujo de Trabajo Típico</h2>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {workflowSteps.map((item, index) => (
            <div key={item.step} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold",
                    item.where === 'Heal' ? 'bg-heal-600' : 'bg-amber-500'
                  )}
                >
                  {item.step}
                </div>
                <div className="text-center mt-2 max-w-[120px]">
                  <p className="font-medium text-sm text-gray-900">{item.title}</p>
                  <p
                    className={cn(
                      "text-xs font-medium",
                      item.where === 'Heal' ? 'text-heal-600' : 'text-amber-600'
                    )}
                  >
                    {item.where}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                </div>
              </div>
              {index < workflowSteps.length - 1 && (
                <ArrowRight className="w-5 h-5 text-gray-300 mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sections Detail */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Detalle por Sección</h2>
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.title}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            >
              <div className="p-5 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-heal-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-heal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{section.title}</h3>
                    <p className="text-sm text-gray-500">{section.description}</p>
                  </div>
                </div>
              </div>
              <div className="p-5 grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Lo que haces en HEAL
                  </h4>
                  <ul className="space-y-2">
                    {section.enHeal.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-heal-500 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-amber-500" />
                    Lo que se hace en MEDILINK
                  </h4>
                  <ul className="space-y-2">
                    {section.enMedilink.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-amber-500 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {section.tips && section.tips.length > 0 && (
                <div className="px-5 pb-5">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Tips
                    </h4>
                    <ul className="space-y-1">
                      {section.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-blue-700">
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Important Notes */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-amber-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Importante Recordar
        </h2>
        <div className="space-y-3 text-sm text-amber-700">
          <p>
            <strong>Boletas:</strong> Solo se pueden emitir desde Medilink. Heal te muestra si una sesión tiene boleta pendiente o emitida.
          </p>
          <p>
            <strong>Pagos:</strong> Heal permite registrar pagos sin restricción de fecha (a diferencia de Medilink). Esto es útil para pagos atrasados o anticipados.
          </p>
          <p>
            <strong>Sesiones Realizadas:</strong> Para que una sesión pase a estado "Realizada", debe marcarse así en Medilink. Heal sincroniza este estado.
          </p>
          <p>
            <strong>Productos y Ventas:</strong> Son exclusivos de Heal. No se sincronizan con Medilink ya que son para control interno del centro.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-400 pb-8">
        <p>¿Tienes dudas? Contacta al administrador del sistema</p>
        <p className="mt-1">Heal Platform v1.0</p>
      </div>
    </div>
  );
}
