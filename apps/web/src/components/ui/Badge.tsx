import { cn } from '@/lib/utils';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'gray' | 'sage';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = 'gray',
  size = 'md',
  dot = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        `badge-${variant}`,
        size === 'sm' && 'px-2 py-0.5 text-[10px]',
        className
      )}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full', {
            'bg-emerald-500': variant === 'success',
            'bg-amber-500': variant === 'warning',
            'bg-red-500': variant === 'error',
            'bg-blue-500': variant === 'info',
            'bg-heal-500': variant === 'gray',
            'bg-sage-500': variant === 'sage',
          })}
        />
      )}
      {children}
    </span>
  );
}

// Specific badge components for session states
interface EstadoBadgeProps {
  estado: string;
  tipo: 'agenda' | 'atencion' | 'pago' | 'boleta';
}

const estadoConfig: Record<string, { variant: BadgeVariant; label: string }> = {
  // Agenda
  AGENDADA: { variant: 'info', label: 'Agendada' },
  CONFIRMADA: { variant: 'success', label: 'Confirmada' },
  CANCELADA: { variant: 'error', label: 'Cancelada' },
  NO_ASISTIO: { variant: 'error', label: 'No asistió' },
  // Atención
  PENDIENTE: { variant: 'gray', label: 'Pendiente' },
  EN_CURSO: { variant: 'warning', label: 'En curso' },
  REALIZADA: { variant: 'success', label: 'Realizada' },
  // Pago
  PAGADA: { variant: 'success', label: 'Pagada' },
  PAGO_PARCIAL: { variant: 'warning', label: 'Parcial' },
  NO_PAGADA: { variant: 'error', label: 'No pagada' },
  // Boleta
  EMITIDA: { variant: 'success', label: 'Emitida' },
  NO_EMITIDA: { variant: 'warning', label: 'Pendiente' },
};

export function EstadoBadge({ estado }: EstadoBadgeProps) {
  const config = estadoConfig[estado] || { variant: 'gray' as BadgeVariant, label: estado };

  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
}

// Método de pago badge
export function MetodoPagoBadge({ metodo }: { metodo: string }) {
  const labels: Record<string, string> = {
    EFECTIVO: 'Efectivo',
    TRANSFERENCIA: 'Transferencia',
    TARJETA_DEBITO: 'Débito',
    TARJETA_CREDITO: 'Crédito',
  };

  return <Badge variant="gray">{labels[metodo] || metodo}</Badge>;
}
