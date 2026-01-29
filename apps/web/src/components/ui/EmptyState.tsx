import { type ReactNode, type ElementType } from 'react';
import { Inbox, Users, Calendar, CreditCard, Search, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ElementType;
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: 'default' | 'search' | 'patients' | 'sessions' | 'payments' | 'documents';
  className?: string;
}

const variantIcons = {
  default: Inbox,
  search: Search,
  patients: Users,
  sessions: Calendar,
  payments: CreditCard,
  documents: FileText,
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
  className,
}: EmptyStateProps) {
  const Icon = icon || variantIcons[variant];

  return (
    <div className={cn('empty-state', className)}>
      <div className="empty-state-icon">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="heading-4 text-heal-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-heal-500 max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}

// Pre-built empty states for common scenarios
export function NoResults({ search }: { search?: string }) {
  return (
    <EmptyState
      variant="search"
      title="Sin resultados"
      description={
        search
          ? `No encontramos resultados para "${search}". Intenta con otros términos.`
          : 'No hay datos que coincidan con los filtros aplicados.'
      }
    />
  );
}

export function NoPacientes({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      variant="patients"
      title="Sin pacientes"
      description="Aún no hay pacientes registrados. Comienza agregando el primero."
      action={
        onAdd && (
          <button onClick={onAdd} className="btn-primary">
            Agregar Paciente
          </button>
        )
      }
    />
  );
}

export function NoSesiones({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      variant="sessions"
      title="Sin sesiones"
      description="No hay sesiones programadas. Agenda una nueva sesión para comenzar."
      action={
        onAdd && (
          <button onClick={onAdd} className="btn-primary">
            Agendar Sesión
          </button>
        )
      }
    />
  );
}

export function NoPagos() {
  return (
    <EmptyState
      variant="payments"
      title="Sin pagos"
      description="No hay pagos registrados en este período."
    />
  );
}

export function NoDeuda() {
  return (
    <EmptyState
      variant="payments"
      title="Sin deuda pendiente"
      description="Este paciente no tiene sesiones pendientes de pago."
    />
  );
}
