import { Outlet, NavLink, useParams } from 'react-router-dom';
import { Home, Calendar, BarChart3, Wallet, ArrowLeft, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProfesional } from '@/api/hooks';

const navItems = [
  { to: '', icon: Home, label: 'Inicio', end: true },
  { to: 'agenda', icon: Calendar, label: 'Agenda' },
  { to: 'metricas', icon: BarChart3, label: 'Progreso' },
  { to: 'liquidaciones', icon: Wallet, label: 'Pagos' },
];

export function PortalLayout() {
  const { profesionalId } = useParams();
  const { data: profesional } = useProfesional(profesionalId || '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-heal-50 via-white to-heal-50/50 flex flex-col">
      {/* Header Mobile - Glassmorphism */}
      <header className="sticky top-0 z-50 safe-area-pt">
        <div className="bg-white/70 backdrop-blur-xl border-b border-heal-100/50">
          <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
            <NavLink
              to="/profesionales"
              className="flex items-center gap-2 text-heal-500 hover:text-heal-700 transition-colors active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </NavLink>

            <div className="flex items-center gap-2">
              {profesional && (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-soft"
                  style={{ backgroundColor: profesional.color || '#5f7da1' }}
                >
                  {profesional.firstName[0]}{profesional.lastName[0]}
                </div>
              )}
            </div>

            <button className="relative p-2 text-heal-500 hover:text-heal-700 transition-colors">
              <Bell className="w-5 h-5" />
              {/* Notification dot */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation - Floating pill style */}
      <nav className="fixed bottom-4 left-4 right-4 z-50 safe-area-pb">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-soft-lg border border-heal-100/50 max-w-lg mx-auto">
          <div className="flex justify-around items-center h-16 px-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={`/portal/${profesionalId}/${item.to}`}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 min-w-[64px]',
                    isActive
                      ? 'text-white bg-heal-600 shadow-soft scale-105'
                      : 'text-heal-400 hover:text-heal-600 hover:bg-heal-50 active:scale-95'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={cn('w-5 h-5 transition-transform', isActive && 'scale-110')} />
                    <span className={cn('text-xs font-medium', isActive ? 'text-white' : 'text-inherit')}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
