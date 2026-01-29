import { type ElementType } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'heal' | 'sage' | 'blue' | 'emerald' | 'amber' | 'red';
  className?: string;
}

const colorClasses = {
  heal: {
    icon: 'bg-heal-100 text-heal-600',
    trend: { up: 'text-emerald-600', down: 'text-red-600' },
  },
  sage: {
    icon: 'bg-sage-100 text-sage-600',
    trend: { up: 'text-emerald-600', down: 'text-red-600' },
  },
  blue: {
    icon: 'bg-blue-100 text-blue-600',
    trend: { up: 'text-emerald-600', down: 'text-red-600' },
  },
  emerald: {
    icon: 'bg-emerald-100 text-emerald-600',
    trend: { up: 'text-emerald-600', down: 'text-red-600' },
  },
  amber: {
    icon: 'bg-amber-100 text-amber-600',
    trend: { up: 'text-red-600', down: 'text-emerald-600' }, // Inverted for debt/negative KPIs
  },
  red: {
    icon: 'bg-red-100 text-red-600',
    trend: { up: 'text-red-600', down: 'text-emerald-600' },
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'heal',
  className,
}: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <div className={cn('stat-card', className)}>
      <div className={cn('stat-icon', colors.icon)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="stat-label truncate">{title}</p>
        <div className="flex items-baseline gap-2">
          <p className="stat-value truncate">{value}</p>
          {trend && (
            <span
              className={cn(
                'flex items-center text-xs font-medium',
                trend.isPositive ? colors.trend.up : colors.trend.down
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3 mr-0.5" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-0.5" />
              )}
              {Math.abs(trend.value)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Compact stat for header/summary
export function StatCompact({
  label,
  value,
  color = 'default',
}: {
  label: string;
  value: string | number;
  color?: 'default' | 'success' | 'warning' | 'error';
}) {
  const valueColors = {
    default: 'text-heal-900',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    error: 'text-red-600',
  };

  return (
    <div className="text-sm">
      <span className="text-heal-500">{label}: </span>
      <span className={cn('font-semibold', valueColors[color])}>{value}</span>
    </div>
  );
}
