import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  X,
  ChevronRight,
  Sparkles,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useProfesionales,
  useCreateProfesional,
} from '@/api/hooks';

export function Profesionales() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const { data: profesionales, isLoading } = useProfesionales({ search: search || undefined });
  const createProfesional = useCreateProfesional();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      rut: formData.get('rut') as string || undefined,
      email: formData.get('email') as string || undefined,
      phone: formData.get('phone') as string || undefined,
      especialidad: formData.get('especialidad') as string || undefined,
      color: formData.get('color') as string || undefined,
    };

    const created = await createProfesional.mutateAsync(data);
    setShowModal(false);
    navigate(`/profesionales/${created.id}`);
  };

  const colorOptions = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Equipo Profesional</h1>
          <p className="text-gray-500 mt-1">Gestiona kinesiólogos, contratos y metas</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <Plus className="w-5 h-5" />
          Nuevo Profesional
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar profesionales..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Grid de profesionales */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-heal-200" />
                <div className="flex-1">
                  <div className="h-5 bg-heal-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-heal-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : profesionales?.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-heal-100 to-heal-200 flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-heal-400" />
          </div>
          <h3 className="text-lg font-semibold text-heal-900 mb-2">Sin profesionales</h3>
          <p className="text-heal-500 mb-6">Agrega tu primer profesional para comenzar</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Sparkles className="w-4 h-4" />
            Crear Profesional
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profesionales?.map((profesional, index) => (
            <button
              key={profesional.id}
              onClick={() => navigate(`/profesionales/${profesional.id}`)}
              className={cn(
                "card-hover p-5 text-left group animate-fade-in-up",
                `stagger-${Math.min(index + 1, 8)}`
              )}
              style={{ animationFillMode: 'backwards' }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-soft transition-transform group-hover:scale-110"
                  style={{ backgroundColor: profesional.color || '#5f7da1' }}
                >
                  {profesional.firstName[0]}{profesional.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-heal-900 truncate group-hover:text-heal-700 transition-colors">
                    {profesional.firstName} {profesional.lastName}
                  </p>
                  <p className="text-sm text-heal-500 truncate">
                    {profesional.especialidad || 'Sin especialidad'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-heal-300 group-hover:text-heal-500 group-hover:translate-x-1 transition-all" />
              </div>

              {/* Stats mini */}
              {profesional._count && (
                <div className="flex gap-4 mt-4 pt-4 border-t border-heal-100">
                  <div className="flex items-center gap-2 text-sm text-heal-500">
                    <Calendar className="w-4 h-4" />
                    <span>{profesional._count.sesiones} sesiones</span>
                  </div>
                  {profesional._count.planesTerapeuticos > 0 && (
                    <div className="flex items-center gap-2 text-sm text-heal-500">
                      <TrendingUp className="w-4 h-4" />
                      <span>{profesional._count.planesTerapeuticos} planes</span>
                    </div>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-heal-900">Nuevo Profesional</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-heal-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-heal-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Nombre *</label>
                  <input
                    name="firstName"
                    required
                    className="input"
                    placeholder="Carlos"
                  />
                </div>
                <div>
                  <label className="label">Apellido *</label>
                  <input
                    name="lastName"
                    required
                    className="input"
                    placeholder="González"
                  />
                </div>
              </div>

              <div>
                <label className="label">RUT</label>
                <input
                  name="rut"
                  placeholder="12345678-9"
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Email</label>
                  <input
                    name="email"
                    type="email"
                    className="input"
                    placeholder="carlos@heal.cl"
                  />
                </div>
                <div>
                  <label className="label">Teléfono</label>
                  <input
                    name="phone"
                    placeholder="+56 9 1234 5678"
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="label">Especialidad</label>
                <input
                  name="especialidad"
                  placeholder="Ej: Traumatología, Deportiva"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Color identificador</label>
                <div className="flex gap-2 flex-wrap mt-2">
                  {colorOptions.map((color) => (
                    <label key={color} className="cursor-pointer">
                      <input
                        type="radio"
                        name="color"
                        value={color}
                        defaultChecked={color === '#3b82f6'}
                        className="sr-only peer"
                      />
                      <div
                        className="w-9 h-9 rounded-xl peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-heal-500 transition-all hover:scale-110"
                        style={{ backgroundColor: color }}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createProfesional.isPending}
                  className="btn-primary flex-1"
                >
                  {createProfesional.isPending ? 'Creando...' : 'Crear Profesional'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
