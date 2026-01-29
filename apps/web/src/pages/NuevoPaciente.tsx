import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { User, Phone, Mail, Shield, Save, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { PageHeader, Breadcrumb, useToast } from '@/components/ui';
import { cn } from '@/lib/utils';

interface PacienteForm {
  firstName: string;
  lastName: string;
  rut: string;
  email?: string;
  phone?: string;
  prevision?: string;
  fechaNacimiento?: string;
  direccion?: string;
  comunaResidencia?: string;
  contactoEmergencia?: string;
  telefonoEmergencia?: string;
}

const PREVISIONES = [
  'FONASA A',
  'FONASA B',
  'FONASA C',
  'FONASA D',
  'ISAPRE',
  'PARTICULAR',
  'OTRA',
];

export function NuevoPaciente() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PacienteForm>();

  const createPaciente = useMutation({
    mutationFn: async (data: PacienteForm) => {
      const response = await api.post('/pacientes', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] });
      toast.success('Paciente creado exitosamente');
      navigate(`/pacientes/${data.id}`);
    },
    onError: () => {
      toast.error('Error al crear el paciente');
    },
  });

  const onSubmit = (data: PacienteForm) => {
    createPaciente.mutate(data);
  };

  const firstName = watch('firstName');
  const lastName = watch('lastName');

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Nuevo Paciente"
        description="Registra un nuevo paciente en el sistema"
        breadcrumb={
          <Breadcrumb
            items={[
              { label: 'Pacientes', href: '/pacientes' },
              { label: 'Nuevo Paciente' },
            ]}
          />
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        {/* Preview Card */}
        <div className="card p-6 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-heal-500 to-heal-600 flex items-center justify-center text-white text-xl font-bold">
              {firstName?.[0]?.toUpperCase() || '?'}
              {lastName?.[0]?.toUpperCase() || ''}
            </div>
            <div>
              <h3 className="heading-3">
                {firstName || 'Nombre'} {lastName || 'Apellido'}
              </h3>
              <p className="text-heal-500">Nuevo paciente</p>
            </div>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-2 px-2">
          <StepIndicator step={1} current={step} label="Datos Personales" />
          <div className="flex-1 h-px bg-heal-200" />
          <StepIndicator step={2} current={step} label="Contacto" />
          <div className="flex-1 h-px bg-heal-200" />
          <StepIndicator step={3} current={step} label="Previsión" />
        </div>

        {/* Step 1: Datos Personales */}
        {step === 1 && (
          <div className="card p-6 space-y-6 animate-fade-in-up">
            <div className="flex items-center gap-3 pb-4 border-b border-heal-100">
              <div className="w-10 h-10 rounded-xl bg-heal-100 flex items-center justify-center">
                <User className="w-5 h-5 text-heal-600" />
              </div>
              <div>
                <h3 className="heading-4">Datos Personales</h3>
                <p className="text-sm text-heal-500">Información básica del paciente</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={cn('input', errors.firstName && 'border-red-300 focus:border-red-500 focus:ring-red-500/20')}
                  placeholder="Ej: María"
                  {...register('firstName', { required: 'El nombre es requerido' })}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="label">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={cn('input', errors.lastName && 'border-red-300 focus:border-red-500 focus:ring-red-500/20')}
                  placeholder="Ej: González"
                  {...register('lastName', { required: 'El apellido es requerido' })}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>
                )}
              </div>

              <div>
                <label className="label">
                  RUT <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={cn('input', errors.rut && 'border-red-300 focus:border-red-500 focus:ring-red-500/20')}
                  placeholder="Ej: 12.345.678-9"
                  {...register('rut', { required: 'El RUT es requerido' })}
                />
                {errors.rut && (
                  <p className="text-xs text-red-500 mt-1">{errors.rut.message}</p>
                )}
              </div>

              <div>
                <label className="label">Fecha de Nacimiento</label>
                <input
                  type="date"
                  className="input"
                  {...register('fechaNacimiento')}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                className="btn-primary"
                onClick={() => setStep(2)}
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Contacto */}
        {step === 2 && (
          <div className="card p-6 space-y-6 animate-fade-in-up">
            <div className="flex items-center gap-3 pb-4 border-b border-heal-100">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="heading-4">Información de Contacto</h3>
                <p className="text-sm text-heal-500">Datos para comunicarse con el paciente</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-heal-400" />
                  <input
                    type="email"
                    className="input pl-10"
                    placeholder="paciente@email.com"
                    {...register('email')}
                  />
                </div>
              </div>

              <div>
                <label className="label">Teléfono</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-heal-400" />
                  <input
                    type="tel"
                    className="input pl-10"
                    placeholder="+56 9 1234 5678"
                    {...register('phone')}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="label">Dirección</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Calle, número, depto..."
                  {...register('direccion')}
                />
              </div>

              <div>
                <label className="label">Comuna de Residencia</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ej: Providencia"
                  {...register('comunaResidencia')}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-heal-100">
              <h4 className="font-medium text-heal-700 mb-4">Contacto de Emergencia</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Nombre del Contacto</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Nombre del familiar o contacto"
                    {...register('contactoEmergencia')}
                  />
                </div>
                <div>
                  <label className="label">Teléfono de Emergencia</label>
                  <input
                    type="tel"
                    className="input"
                    placeholder="+56 9 1234 5678"
                    {...register('telefonoEmergencia')}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setStep(1)}
              >
                Atrás
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setStep(3)}
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Previsión */}
        {step === 3 && (
          <div className="card p-6 space-y-6 animate-fade-in-up">
            <div className="flex items-center gap-3 pb-4 border-b border-heal-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="heading-4">Previsión de Salud</h3>
                <p className="text-sm text-heal-500">Sistema de salud del paciente</p>
              </div>
            </div>

            <div>
              <label className="label">Selecciona la previsión</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {PREVISIONES.map((prev) => (
                  <label
                    key={prev}
                    className={cn(
                      'flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all',
                      'hover:border-heal-300 hover:bg-heal-50/50',
                      watch('prevision') === prev
                        ? 'border-heal-500 bg-heal-50 text-heal-700'
                        : 'border-heal-200 text-heal-600'
                    )}
                  >
                    <input
                      type="radio"
                      value={prev}
                      className="sr-only"
                      {...register('prevision')}
                    />
                    <span className="font-medium text-sm">{prev}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setStep(2)}
              >
                Atrás
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={createPaciente.isPending}
              >
                {createPaciente.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar Paciente
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Cancel link */}
        <div className="text-center">
          <Link to="/pacientes" className="text-sm text-heal-500 hover:text-heal-700">
            Cancelar y volver a pacientes
          </Link>
        </div>
      </form>
    </div>
  );
}

function StepIndicator({
  step,
  current,
  label,
}: {
  step: number;
  current: number;
  label: string;
}) {
  const isActive = current >= step;
  const isCurrent = current === step;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
          isActive
            ? 'bg-heal-600 text-white'
            : 'bg-heal-100 text-heal-400',
          isCurrent && 'ring-4 ring-heal-200'
        )}
      >
        {step}
      </div>
      <span
        className={cn(
          'text-xs font-medium hidden sm:block',
          isActive ? 'text-heal-700' : 'text-heal-400'
        )}
      >
        {label}
      </span>
    </div>
  );
}
