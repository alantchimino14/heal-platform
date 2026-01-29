import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  Settings,
  ChevronRight,
  Activity,
  Package,
  ShoppingCart,
  UserCog,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Resumen y métricas',
  },
  {
    name: 'Pacientes',
    href: '/pacientes',
    icon: Users,
    description: 'Gestión de pacientes',
  },
  {
    name: 'Sesiones',
    href: '/sesiones',
    icon: Calendar,
    description: 'Agenda y atenciones',
  },
  {
    name: 'Pagos',
    href: '/pagos',
    icon: CreditCard,
    description: 'Registro de pagos',
  },
  {
    name: 'Productos',
    href: '/productos',
    icon: Package,
    description: 'Inventario',
  },
  {
    name: 'Ventas',
    href: '/ventas',
    icon: ShoppingCart,
    description: 'Ventas de productos',
  },
  {
    name: 'Profesionales',
    href: '/profesionales',
    icon: UserCog,
    description: 'Kinesiólogos',
  },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="flex w-72 flex-col bg-gradient-to-b from-heal-800 to-heal-900">
      {/* Logo */}
      <div className="flex h-20 items-center px-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-display text-xl font-bold text-white tracking-wide">
              HEAL
            </span>
            <p className="text-xs text-heal-400">Centro Kinesiología</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="px-4 py-2 text-xs font-semibold text-heal-500 uppercase tracking-wider">
          Principal
        </p>
        {navigation.map((item, index) => {
          const isActive =
            location.pathname === item.href ||
            (item.href !== '/dashboard' && location.pathname.startsWith(item.href));

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium',
                'transition-all duration-200 ease-out',
                'animate-fade-in-up',
                isActive
                  ? 'bg-white/15 text-white shadow-inner-soft'
                  : 'text-heal-300 hover:text-white hover:bg-white/10'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                  isActive ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'
                )}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <span className="block">{item.name}</span>
                <span
                  className={cn(
                    'text-xs transition-colors',
                    isActive ? 'text-heal-300' : 'text-heal-500 group-hover:text-heal-400'
                  )}
                >
                  {item.description}
                </span>
              </div>
              <ChevronRight
                className={cn(
                  'w-4 h-4 transition-all',
                  isActive
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0'
                )}
              />
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 space-y-1">
        <NavLink
          to="/ayuda"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium',
              'transition-all duration-200',
              isActive
                ? 'bg-white/15 text-white'
                : 'text-heal-400 hover:bg-white/10 hover:text-white'
            )
          }
        >
          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
            <HelpCircle className="h-5 w-5" />
          </div>
          <span>Ayuda</span>
        </NavLink>

        <NavLink
          to="/configuracion"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium',
              'transition-all duration-200',
              isActive
                ? 'bg-white/15 text-white'
                : 'text-heal-400 hover:bg-white/10 hover:text-white'
            )
          }
        >
          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
            <Settings className="h-5 w-5" />
          </div>
          <span>Configuración</span>
        </NavLink>

        {/* Version info */}
        <div className="mt-3 px-4 py-3 rounded-xl bg-white/5">
          <p className="text-xs text-heal-500">
            Heal Platform v1.0
          </p>
          <p className="text-xs text-heal-600 mt-0.5">
            Conectado a Medilink
          </p>
        </div>
      </div>
    </aside>
  );
}
