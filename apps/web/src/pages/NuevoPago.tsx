import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Search, Check, Loader2, CreditCard, Banknote, Building2 } from 'lucide-react';
import { usePacientes, usePacienteBalance, useCreatePago } from '@/api/hooks';
import { formatMoney, formatDateTime, cn, formatRut } from '@/lib/utils';
import { Breadcrumb, Avatar, useToast } from '@/components/ui';

const METODOS_PAGO = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'TARJETA_DEBITO', label: 'Tarjeta Débito' },
  { value: 'TARJETA_CREDITO', label: 'Tarjeta Crédito' },
];

export function NuevoPago() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pacienteIdFromUrl = searchParams.get('pacienteId');

  // State
  const [searchPaciente, setSearchPaciente] = useState('');
  const [selectedPacienteId, setSelectedPacienteId] = useState<string | null>(
    pacienteIdFromUrl
  );
  const [selectedSesiones, setSelectedSesiones] = useState<string[]>([]);
  const [monto, setMonto] = useState('');
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [descripcion, setDescripcion] = useState('');

  // Queries
  const toast = useToast();

  const { data: pacientesData } = usePacientes({
    search: searchPaciente || undefined,
    limit: 10,
  });
  const { data: balance } = usePacienteBalance(selectedPacienteId || '');
  const createPago = useCreatePago();

  // Calculate totals
  const sesionesConDeuda = balance?.sesionesConDeuda || [];
  const saldoAFavor = Number(balance?.saldoAFavor || 0);

  const totalSeleccionado = useMemo(() => {
    return sesionesConDeuda
      .filter((s: any) => selectedSesiones.includes(s.id))
      .reduce((acc: number, s: any) => acc + Number(s.pendiente), 0);
  }, [sesionesConDeuda, selectedSesiones]);

  const montoNumerico = Number(monto) || 0;
  const montoConSaldo = montoNumerico + saldoAFavor;
  const diferencia = montoConSaldo - totalSeleccionado;

  // Auto-select all sessions when patient changes
  useEffect(() => {
    if (sesionesConDeuda.length > 0) {
      setSelectedSesiones(sesionesConDeuda.map((s: any) => s.id));
    }
  }, [selectedPacienteId, balance]);

  // Handlers
  const toggleSesion = (id: string) => {
    setSelectedSesiones((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedSesiones(sesionesConDeuda.map((s: any) => s.id));
  };

  const selectNone = () => {
    setSelectedSesiones([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPacienteId || montoNumerico <= 0) return;

    try {
      await createPago.mutateAsync({
        pacienteId: selectedPacienteId,
        monto: montoNumerico,
        metodoPago,
        descripcion: descripcion || undefined,
        sesionIds: selectedSesiones.length > 0 ? selectedSesiones : undefined,
      });

      toast.success('Pago registrado exitosamente');
      navigate(`/pacientes/${selectedPacienteId}`);
    } catch (error) {
      console.error('Error creating pago:', error);
      toast.error('Error al registrar el pago');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <Breadcrumb
          items={[
            { label: 'Pagos', href: '/pagos' },
            { label: 'Registrar Pago' },
          ]}
        />
        <div className="flex items-center gap-4 mt-4">
          <Link to="/pagos" className="btn-ghost btn-icon">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="heading-2">Registrar Pago</h1>
            <p className="text-muted">Ingresa un nuevo pago de paciente</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selección de Paciente */}
        <div className="card p-6 animate-fade-in-up stagger-1">
          <h2 className="heading-4 mb-4">Paciente</h2>

          {!selectedPacienteId ? (
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
                      className="w-full px-4 py-3 text-left hover:bg-heal-50 flex items-center justify-between transition-colors"
                      onClick={() => {
                        setSelectedPacienteId(p.id);
                        setSearchPaciente('');
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar firstName={p.firstName} lastName={p.lastName} size="sm" />
                        <div>
                          <p className="font-medium text-heal-900">
                            {p.firstName} {p.lastName}
                          </p>
                          <p className="text-sm text-heal-500">{formatRut(p.rut)}</p>
                        </div>
                      </div>
                      {Number(p.saldoPendiente) > 0 && (
                        <span className="text-sm font-semibold text-red-600">
                          Deuda: {formatMoney(p.saldoPendiente)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-heal-50 to-sage-50 rounded-xl border border-heal-100">
              <div className="flex items-center gap-3">
                <Avatar
                  firstName={balance?.paciente?.firstName}
                  lastName={balance?.paciente?.lastName}
                  size="md"
                />
                <div>
                  <p className="font-semibold text-heal-900">
                    {balance?.paciente?.firstName} {balance?.paciente?.lastName}
                  </p>
                  <p className="text-sm text-heal-500">{formatRut(balance?.paciente?.rut)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-heal-500">Deuda total</p>
                  <p className="font-bold text-red-600">
                    {formatMoney(balance?.totalDeuda || 0)}
                  </p>
                </div>
                {saldoAFavor > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-heal-500">Saldo a favor</p>
                    <p className="font-bold text-emerald-600">
                      {formatMoney(saldoAFavor)}
                    </p>
                  </div>
                )}
                <button
                  type="button"
                  className="text-sm font-medium text-heal-600 hover:text-heal-700 transition-colors"
                  onClick={() => {
                    setSelectedPacienteId(null);
                    setSelectedSesiones([]);
                    setMonto('');
                  }}
                >
                  Cambiar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sesiones pendientes */}
        {selectedPacienteId && (
          <div className="card p-6 animate-fade-in-up stagger-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="heading-4">
                Sesiones Pendientes de Pago
              </h2>
              {sesionesConDeuda.length > 0 && (
                <div className="flex gap-2 text-sm">
                  <button
                    type="button"
                    className="text-heal-600 hover:text-heal-700 font-medium transition-colors"
                    onClick={selectAll}
                  >
                    Seleccionar todas
                  </button>
                  <span className="text-heal-300">|</span>
                  <button
                    type="button"
                    className="text-heal-500 hover:text-heal-700 transition-colors"
                    onClick={selectNone}
                  >
                    Ninguna
                  </button>
                </div>
              )}
            </div>

            {sesionesConDeuda.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-2xl bg-sage-100 flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-7 h-7 text-sage-600" />
                </div>
                <p className="font-medium text-heal-700">No hay sesiones pendientes de pago</p>
                <p className="text-sm text-heal-500 mt-1">
                  Puedes registrar un pago anticipado que quedará como saldo a favor
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sesionesConDeuda.map((sesion: any) => (
                  <label
                    key={sesion.id}
                    className={cn(
                      'flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all',
                      selectedSesiones.includes(sesion.id)
                        ? 'border-heal-400 bg-gradient-to-r from-heal-50 to-transparent shadow-soft'
                        : 'border-heal-100 hover:border-heal-200 hover:bg-heal-50/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
                          selectedSesiones.includes(sesion.id)
                            ? 'bg-heal-600 border-heal-600'
                            : 'border-heal-300'
                        )}
                      >
                        {selectedSesiones.includes(sesion.id) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={selectedSesiones.includes(sesion.id)}
                        onChange={() => toggleSesion(sesion.id)}
                      />
                      <div>
                        <p className="font-medium text-heal-900">
                          {formatDateTime(sesion.fechaHora)}
                        </p>
                        <p className="text-sm text-heal-500">
                          {sesion.profesional} • {sesion.servicio || 'Sesión'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">
                        {formatMoney(sesion.pendiente)}
                      </p>
                      {sesion.pendiente < sesion.precioFinal && (
                        <p className="text-xs text-heal-500">
                          de {formatMoney(sesion.precioFinal)}
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}

            {selectedSesiones.length > 0 && (
              <div className="mt-4 pt-4 border-t border-heal-100 flex justify-between items-center">
                <span className="font-medium text-heal-700">Total seleccionado:</span>
                <span className="text-lg font-bold text-heal-900">
                  {formatMoney(totalSeleccionado)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Monto y método */}
        {selectedPacienteId && (
          <div className="card p-6 animate-fade-in-up stagger-3">
            <h2 className="heading-4 mb-4">
              Detalles del Pago
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">
                  Monto a pagar
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-heal-500 font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    className="input pl-8 text-xl font-bold"
                    placeholder="0"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    min="0"
                    required
                  />
                </div>
                {saldoAFavor > 0 && (
                  <p className="text-sm text-emerald-600 mt-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    + {formatMoney(saldoAFavor)} saldo a favor = {formatMoney(montoConSaldo)}
                  </p>
                )}
                {totalSeleccionado > 0 && (
                  <button
                    type="button"
                    className="text-sm text-heal-600 hover:text-heal-700 font-medium mt-2 transition-colors"
                    onClick={() => setMonto(Math.max(0, totalSeleccionado - saldoAFavor).toString())}
                  >
                    Pagar total seleccionado ({formatMoney(Math.max(0, totalSeleccionado - saldoAFavor))})
                  </button>
                )}
              </div>

              <div>
                <label className="label">
                  Método de pago
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {METODOS_PAGO.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      className={cn(
                        'p-3 rounded-xl border-2 text-sm font-medium transition-all flex items-center justify-center gap-2',
                        metodoPago === m.value
                          ? 'border-heal-500 bg-heal-50 text-heal-700'
                          : 'border-heal-100 hover:border-heal-200 text-heal-600'
                      )}
                      onClick={() => setMetodoPago(m.value)}
                    >
                      {m.value === 'EFECTIVO' && <Banknote className="w-4 h-4" />}
                      {m.value === 'TRANSFERENCIA' && <Building2 className="w-4 h-4" />}
                      {m.value.includes('TARJETA') && <CreditCard className="w-4 h-4" />}
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="label">
                  Descripción (opcional)
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ej: Pago con cheque, abono, etc."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </div>
            </div>

            {/* Resumen */}
            {montoNumerico > 0 && (
              <div className="mt-6 p-5 bg-gradient-to-br from-heal-50 to-sage-50 rounded-xl border border-heal-100">
                <h3 className="font-semibold text-heal-900 mb-4">Resumen del pago</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-heal-600">Monto ingresado:</span>
                    <span className="font-semibold text-heal-900">{formatMoney(montoNumerico)}</span>
                  </div>
                  {saldoAFavor > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Saldo a favor aplicado:</span>
                      <span className="font-semibold">{formatMoney(saldoAFavor)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-heal-600">A pagar por sesiones:</span>
                    <span className="font-semibold text-heal-900">{formatMoney(totalSeleccionado)}</span>
                  </div>
                  <div className="pt-3 mt-3 border-t border-heal-200 flex justify-between items-center">
                    {diferencia >= 0 ? (
                      <>
                        <span className="text-emerald-700 font-medium">
                          Saldo a favor resultante:
                        </span>
                        <span className="text-lg font-bold text-emerald-600">
                          {formatMoney(diferencia)}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-amber-700 font-medium">
                          Deuda restante:
                        </span>
                        <span className="text-lg font-bold text-amber-600">
                          {formatMoney(Math.abs(diferencia))}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {selectedPacienteId && (
          <div className="flex justify-end gap-3 animate-fade-in-up stagger-4">
            <Link to="/pagos" className="btn-secondary">
              Cancelar
            </Link>
            <button
              type="submit"
              className="btn-primary"
              disabled={montoNumerico <= 0 || createPago.isPending}
            >
              {createPago.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Registrar Pago
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
