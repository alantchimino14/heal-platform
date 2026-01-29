import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft,
  Search,
  Calendar,
  User,
  Stethoscope,
  DollarSign,
  Save,
  Loader2,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { usePacientes, useProfesionales, useServicios } from '@/api/hooks';
import { PageHeader, Breadcrumb, Avatar, useToast } from '@/components/ui';
import { cn, formatMoney, formatRut } from '@/lib/utils';
import { format, addDays } from 'date-fns';

interface SesionForm {
  pacienteId: string;
  profesionalId: string;
  servicioId?: string;
  fecha: string;
  hora: string;
  duracionMinutos: number;
  precioFinal: number;
  notas?: string;
}

const DURACIONES = [
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1.5 horas' },
  { value: 120, label: '2 horas' },
];

const HORAS_DISPONIBLES = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
];

export function NuevaSesion() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pacienteIdFromUrl = searchParams.get('pacienteId');
  const queryClient = useQueryClient();
  const toast = useToast();

  const [searchPaciente, setSearchPaciente] = useState('');
  const [selectedPaciente, setSelectedPaciente] = useState<any>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SesionForm>({
    defaultValues: {
      pacienteId: pacienteIdFromUrl || '',
      fecha: format(new Date(), 'yyyy-MM-dd'),
      hora: '09:00',
      duracionMinutos: 60,
      precioFinal: 0,
    },
  });

  const { data: pacientesData } = usePacientes({
    search: searchPaciente || undefined,
    limit: 10,
  });
  const { data: profesionales } = useProfesionales();
  const { data: servicios } = useServicios();

  const selectedServicioId = watch('servicioId');
  const selectedServicio = servicios?.find((s: any) => s.id === selectedServicioId);

  // Update price when service changes
  useEffect(() => {
    if (selectedServicio?.precio) {
      setValue('precioFinal', selectedServicio.precio);
    }
  }, [selectedServicio, setValue]);

  // Load paciente from URL
  useEffect(() => {
    if (pacienteIdFromUrl && pacientesData?.data) {
      const paciente = pacientesData.data.find((p: any) => p.id === pacienteIdFromUrl);
      if (paciente) {
        setSelectedPaciente(paciente);
      }
    }
  }, [pacienteIdFromUrl, pacientesData]);

  const createSesion = useMutation({
    mutationFn: async (data: SesionForm) => {
      const fechaHora = `${data.fecha}T${data.hora}:00`;
      const response = await api.post('/sesiones', {
        ...data,
        fechaHora,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sesiones'] });
      toast.success('Sesión agendada exitosamente');
      navigate('/sesiones');
    },
    onError: () => {
      toast.error('Error al agendar la sesión');
    },
  });

  const onSubmit = (data: SesionForm) => {
    if (!selectedPaciente) {
      toast.error('Debes seleccionar un paciente');
      return;
    }
    createSesion.mutate({
      ...data,
      pacienteId: selectedPaciente.id,
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Nueva Sesión"
        description="Agenda una nueva sesión de atención"
        breadcrumb={
          <Breadcrumb
            items={[
              { label: 'Sesiones', href: '/sesiones' },
              { label: 'Nueva Sesión' },
            ]}
          />
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        {/* Selección de Paciente */}
        <div className="card p-6 animate-fade-in-up">
          <div className="flex items-center gap-3 pb-4 border-b border-heal-100 mb-6">
            <div className="w-10 h-10 rounded-xl bg-heal-100 flex items-center justify-center">
              <User className="w-5 h-5 text-heal-600" />
            </div>
            <div>
              <h3 className="heading-4">Paciente</h3>
              <p className="text-sm text-heal-500">Selecciona el paciente para la sesión</p>
            </div>
          </div>

          {!selectedPaciente ? (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-heal-400" />
                <input
                  type="text"
                  placeholder="Buscar paciente por nombre o RUT..."
                  className="input pl-10"
                  value={searchPaciente}
                  onChange={(e) => setSearchPaciente(e.target.value)}
                  autoFocus
                />
              </div>

              {searchPaciente && pacientesData?.data?.length > 0 && (
                <div className="border border-heal-200 rounded-xl divide-y divide-heal-100 overflow-hidden">
                  {pacientesData.data.map((p: any) => (
                    <button
                      key={p.id}
                      type="button"
                      className="w-full px-4 py-3 text-left hover:bg-heal-50 flex items-center gap-3 transition-colors"
                      onClick={() => {
                        setSelectedPaciente(p);
                        setSearchPaciente('');
                      }}
                    >
                      <Avatar firstName={p.firstName} lastName={p.lastName} />
                      <div className="flex-1">
                        <p className="font-medium text-heal-900">
                          {p.firstName} {p.lastName}
                        </p>
                        <p className="text-sm text-heal-500">{formatRut(p.rut)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchPaciente && pacientesData?.data?.length === 0 && (
                <p className="text-sm text-heal-500 text-center py-4">
                  No se encontraron pacientes
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-heal-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Avatar
                  firstName={selectedPaciente.firstName}
                  lastName={selectedPaciente.lastName}
                  size="lg"
                />
                <div>
                  <p className="font-medium text-heal-900">
                    {selectedPaciente.firstName} {selectedPaciente.lastName}
                  </p>
                  <p className="text-sm text-heal-500">{formatRut(selectedPaciente.rut)}</p>
                </div>
              </div>
              <button
                type="button"
                className="text-sm text-heal-600 hover:text-heal-700 font-medium"
                onClick={() => setSelectedPaciente(null)}
              >
                Cambiar
              </button>
            </div>
          )}
        </div>

        {/* Profesional y Servicio */}
        {selectedPaciente && (
          <div className="card p-6 animate-fade-in-up">
            <div className="flex items-center gap-3 pb-4 border-b border-heal-100 mb-6">
              <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-sage-600" />
              </div>
              <div>
                <h3 className="heading-4">Profesional y Servicio</h3>
                <p className="text-sm text-heal-500">Selecciona quién atenderá y el tipo de sesión</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">
                  Profesional <span className="text-red-500">*</span>
                </label>
                <select
                  className={cn('input', errors.profesionalId && 'border-red-300')}
                  {...register('profesionalId', { required: 'Selecciona un profesional' })}
                >
                  <option value="">Seleccionar profesional...</option>
                  {profesionales?.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} - {p.especialidad || 'Kinesiólogo'}
                    </option>
                  ))}
                </select>
                {errors.profesionalId && (
                  <p className="text-xs text-red-500 mt-1">{errors.profesionalId.message}</p>
                )}
              </div>

              <div>
                <label className="label">Servicio</label>
                <select className="input" {...register('servicioId')}>
                  <option value="">Seleccionar servicio...</option>
                  {servicios?.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} - {formatMoney(s.precio)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Fecha y Hora */}
        {selectedPaciente && (
          <div className="card p-6 animate-fade-in-up">
            <div className="flex items-center gap-3 pb-4 border-b border-heal-100 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="heading-4">Fecha y Hora</h3>
                <p className="text-sm text-heal-500">Elige cuándo será la sesión</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="label">
                  Fecha <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="input"
                  min={format(new Date(), 'yyyy-MM-dd')}
                  {...register('fecha', { required: 'La fecha es requerida' })}
                />
              </div>

              <div>
                <label className="label">
                  Hora <span className="text-red-500">*</span>
                </label>
                <select
                  className="input"
                  {...register('hora', { required: 'La hora es requerida' })}
                >
                  {HORAS_DISPONIBLES.map((hora) => (
                    <option key={hora} value={hora}>
                      {hora} hrs
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Duración</label>
                <select className="input" {...register('duracionMinutos')}>
                  {DURACIONES.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick date buttons */}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="btn-sm btn-secondary"
                onClick={() => setValue('fecha', format(new Date(), 'yyyy-MM-dd'))}
              >
                Hoy
              </button>
              <button
                type="button"
                className="btn-sm btn-secondary"
                onClick={() => setValue('fecha', format(addDays(new Date(), 1), 'yyyy-MM-dd'))}
              >
                Mañana
              </button>
              <button
                type="button"
                className="btn-sm btn-secondary"
                onClick={() => setValue('fecha', format(addDays(new Date(), 7), 'yyyy-MM-dd'))}
              >
                En 1 semana
              </button>
            </div>
          </div>
        )}

        {/* Precio */}
        {selectedPaciente && (
          <div className="card p-6 animate-fade-in-up">
            <div className="flex items-center gap-3 pb-4 border-b border-heal-100 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="heading-4">Precio</h3>
                <p className="text-sm text-heal-500">Define el valor de la sesión</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Precio Final</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-heal-500 font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    className="input pl-8 text-lg font-semibold"
                    placeholder="0"
                    {...register('precioFinal', { valueAsNumber: true })}
                  />
                </div>
                {selectedServicio && (
                  <p className="text-sm text-heal-500 mt-1">
                    Precio base del servicio: {formatMoney(selectedServicio.precio)}
                  </p>
                )}
              </div>

              <div>
                <label className="label">Notas (opcional)</label>
                <textarea
                  className="input min-h-[80px] resize-none"
                  placeholder="Observaciones adicionales..."
                  {...register('notas')}
                />
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {selectedPaciente && (
          <div className="flex items-center justify-between pt-4">
            <Link to="/sesiones" className="btn-secondary">
              <ArrowLeft className="w-4 h-4" />
              Cancelar
            </Link>
            <button
              type="submit"
              className="btn-primary"
              disabled={createSesion.isPending}
            >
              {createSesion.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Agendando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Agendar Sesión
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
