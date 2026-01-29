import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  breadcrumb?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  breadcrumb,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('animate-fade-in-up', className)}>
      {breadcrumb && <div className="mb-3">{breadcrumb}</div>}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="heading-1">{title}</h1>
          {description && <p className="text-muted mt-1">{description}</p>}
        </div>
        {action && <div className="flex items-center gap-3">{action}</div>}
      </div>
    </div>
  );
}

// Breadcrumb component
interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          {index > 0 && <span className="text-heal-300">/</span>}
          {item.href ? (
            <a href={item.href} className="text-heal-500 hover:text-heal-700 transition-colors">
              {item.label}
            </a>
          ) : (
            <span className="text-heal-700 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
