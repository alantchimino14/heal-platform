import { useParams, Link } from 'react-router-dom';
import {
  CreditCard,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Shield,
  Edit,
  MoreHorizontal,
  ChevronRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { usePaciente, usePacienteBalance, useSesiones } from '@/api/hooks';
import { formatMoney, formatRut, formatDateTime, cn } from '@/lib/utils';
import {
  PageHeader,
  Breadcrumb,
  Avatar,
  Badge,
  EstadoBadge,
  SkeletonCard,
  NoSesiones,
} from '@/components/ui';

export function PacienteDetalle() {
  const { id } = useParams<{ id: string }>();
  const { data: paciente, isLoading } = usePaciente(id!);
  const { data: balance } = usePacienteBalance(id!);
  const { data: sesiones } = useSesiones({ pacienteId: id, limit: 10 });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl">
        <div className="h-8 w-48 skeleton rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="text-center py-12">
        <p className="text-heal-500">Paciente no encontrado</p>
        <Link to="/pacientes" className="btn-primary mt-4">
          Volver a Pacientes
        </Link>
      </div>
    );
  }

  const balanceNeto = (balance?.totalDeuda || 0) - (balance?.saldoAFavor || 0);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <PageHeader
        title=""
        breadcrumb={
          <Breadcrumb
            items={[
              { label: 'Pacientes', href: '/pacientes' },
              { label: `${paciente.firstName} ${paciente.lastName}` },
            ]}
          />
        }
      />

      {/* Profile Header */}
      <div className="card p-6 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar
              firstName={paciente.firstName}
              lastName={paciente.lastName}
              size="xl"
            />
            <div>
              <h1 className="heading-2">
                {paciente.firstName} {paciente.lastName}
              </h1>
              <p className="text-heal-500">{formatRut(paciente.rut)}</p>
              <div className="flex items-center gap-2 mt-2">
                {paciente.isActive ? (
                  <Badge variant="success" dot>Activo</Badge>
                ) : (
                  <Badge variant="gray" dot>Inactivo</Badge>
                )}
                {paciente.prevision && (
                  <Badge variant="info">{paciente.prevision}</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="btn-ghost btn-icon">
              <Edit className="w-5 h-5" />
            </button>
            <button className="btn-ghost btn-icon">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in-up stagger-1">
        <div
          className={cn(
            'card p-5',
            balanceNeto > 0 ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-emerald-500'
          )}
        >
          <p className="text-sm text-heal-500">Balance Neto</p>
          <p
            className={cn(
              'text-2xl font-bold font-display mt-1',
              balanceNeto > 0 ? 'text-red-600' : 'text-emerald-600'
            )}
          >
            {balanceNeto > 0 ? '-' : '+'}{formatMoney(Math.abs(balanceNeto))}
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs">
            {balanceNeto > 0 ? (
              <>
                <TrendingDown className="w-3 h-3 text-red-500" />
                <span className="text-red-600">Deuda pendiente</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-600">Saldo a favor</span>
              </>
            )}
          </div>
        </div>

        <div className="card p-5">
          <p className="text-sm text-heal-500">Total Sesiones</p>
          <p className="text-2xl font-bold font-display text-heal-900 mt-1">
            {paciente._count?.sesiones || 0}
          </p>
          <p className="text-xs text-heal-400 mt-2">
            {balance?.sesionesConDeuda?.length || 0} pendientes de pago
          </p>
        </div>

        <div className="card p-5">
          <p className="text-sm text-heal-500">Total Pagos</p>
          <p className="text-2xl font-bold font-display text-heal-900 mt-1">
            {paciente._count?.pagos || 0}
          </p>
          <p className="text-xs text-heal-400 mt-2">
            {paciente._count?.planesTerapeuticos || 0} planes activos
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 animate-fade-in-up stagger-2">
        <Link to={`/pagos/nuevo?pacienteId=${id}`} className="btn-primary">
          <CreditCard className="h-4 w-4" />
          Registrar Pago
        </Link>
        <Link to={`/sesiones/nueva?pacienteId=${id}`} className="btn-secondary">
          <Calendar className="h-4 w-4" />
          Agendar Sesión
        </Link>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="space-y-6 animate-fade-in-up stagger-3">
          <div className="card p-5">
            <h3 className="heading-4 mb-4">Información de Contacto</h3>
            <div className="space-y-3">
              <ContactItem icon={Mail} label="Email" value={paciente.email} />
              <ContactItem icon={Phone} label="Teléfono" value={paciente.phone} />
              <ContactItem icon={MapPin} label="Dirección" value={paciente.direccion} />
              <ContactItem icon={Shield} label="Previsión" value={paciente.prevision} />
            </div>
          </div>

          {/* Balance Detail */}
          <div className="card p-5">
            <h3 className="heading-4 mb-4">Detalle Balance</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-heal-500">Deuda Total</span>
                <span className="font-semibold text-red-600">
                  {formatMoney(balance?.totalDeuda || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-heal-500">Saldo a Favor</span>
                <span className="font-semibold text-emerald-600">
                  {formatMoney(balance?.saldoAFavor || 0)}
                </span>
              </div>
              <div className="pt-3 border-t border-heal-100 flex justify-between items-center">
                <span className="text-sm font-medium text-heal-700">Neto</span>
                <span
                  className={cn(
                    'font-bold text-lg',
                    balanceNeto > 0 ? 'text-red-600' : 'text-emerald-600'
                  )}
                >
                  {formatMoney(Math.abs(balanceNeto))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sesiones pendientes de pago */}
          {balance?.sesionesConDeuda?.length > 0 && (
            <div className="card animate-fade-in-up stagger-4">
              <div className="p-5 border-b border-heal-100 flex items-center justify-between">
                <div>
                  <h3 className="heading-4">Sesiones Pendientes de Pago</h3>
                  <p className="text-sm text-heal-500 mt-0.5">
                    {balance.sesionesConDeuda.length} sesiones con saldo pendiente
                  </p>
                </div>
                <Link
                  to={`/pagos/nuevo?pacienteId=${id}`}
                  className="text-sm text-heal-600 hover:text-heal-700 font-medium"
                >
                  Pagar todas
                </Link>
              </div>
              <div className="divide-y divide-heal-50">
                {balance.sesionesConDeuda.map((sesion: any) => (
                  <div
                    key={sesion.id}
                    className="flex items-center justify-between p-4 hover:bg-heal-50/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-heal-900">
                        {formatDateTime(sesion.fechaHora)}
                      </p>
                      <p className="text-sm text-heal-500">
                        {sesion.profesional} • {sesion.servicio || 'Sesión'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">
                        {formatMoney(sesion.pendiente)}
                      </p>
                      <p className="text-xs text-heal-500">
                        de {formatMoney(sesion.precioFinal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Últimas sesiones */}
          <div className="card animate-fade-in-up stagger-5">
            <div className="p-5 border-b border-heal-100 flex items-center justify-between">
              <div>
                <h3 className="heading-4">Últimas Sesiones</h3>
                <p className="text-sm text-heal-500 mt-0.5">
                  Historial de atenciones
                </p>
              </div>
              <Link
                to={`/sesiones?pacienteId=${id}`}
                className="text-sm text-heal-600 hover:text-heal-700 font-medium flex items-center gap-1"
              >
                Ver todas
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-heal-50">
              {sesiones?.data?.length === 0 ? (
                <NoSesiones onAdd={() => window.location.href = `/sesiones/nueva?pacienteId=${id}`} />
              ) : (
                sesiones?.data?.map((sesion: any) => (
                  <div
                    key={sesion.id}
                    className="flex items-center justify-between p-4 hover:bg-heal-50/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-heal-900">
                        {formatDateTime(sesion.fechaHora)}
                      </p>
                      <p className="text-sm text-heal-500">
                        {sesion.profesional.firstName} {sesion.profesional.lastName} •{' '}
                        {sesion.servicio?.nombre || 'Sesión'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <EstadoBadge estado={sesion.estadoPago} tipo="pago" />
                      <EstadoBadge estado={sesion.estadoBoleta} tipo="boleta" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-heal-100 flex items-center justify-center">
        <Icon className="w-4 h-4 text-heal-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-heal-400">{label}</p>
        <p className="text-sm text-heal-900 truncate">{value || '-'}</p>
      </div>
    </div>
  );
}
