import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Search,
  ShoppingCart,
  Package,
  User,
  CreditCard,
  Banknote,
  Building2,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useProductos,
  useCreateVenta,
  usePacientes,
  Producto,
  MetodoPago,
} from '@/api/hooks';

interface CartItem {
  producto: Producto;
  cantidad: number;
  precioUnit: number;
  descuento: number;
}

const metodosPago: { value: MetodoPago; label: string; icon: typeof CreditCard }[] = [
  { value: 'EFECTIVO', label: 'Efectivo', icon: Banknote },
  { value: 'REDCOMPRA_DEBITO', label: 'Redcompra Débito', icon: CreditCard },
  { value: 'REDCOMPRA_CREDITO', label: 'Redcompra Crédito', icon: CreditCard },
  { value: 'TRANSFERENCIA', label: 'Transferencia', icon: Building2 },
];

export function NuevaVenta() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [searchPaciente, setSearchPaciente] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pacienteId, setPacienteId] = useState<string | null>(null);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('EFECTIVO');
  const [descuentoGeneral, setDescuentoGeneral] = useState(0);
  const [showPacienteSearch, setShowPacienteSearch] = useState(false);

  const { data: productos } = useProductos({ search: search || undefined, isActive: true });
  const { data: pacientes } = usePacientes({ search: searchPaciente || undefined });
  const createVenta = useCreateVenta();

  const selectedPaciente = pacientes?.find((p: any) => p.id === pacienteId);

  const addToCart = (producto: Producto) => {
    const existing = cart.find((item) => item.producto.id === producto.id);
    if (existing) {
      if (existing.cantidad >= producto.stock) {
        alert('No hay suficiente stock');
        return;
      }
      setCart(cart.map((item) =>
        item.producto.id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      if (producto.stock < 1) {
        alert('Producto sin stock');
        return;
      }
      setCart([...cart, {
        producto,
        cantidad: 1,
        precioUnit: Number(producto.precio),
        descuento: 0,
      }]);
    }
    setSearch('');
  };

  const updateQuantity = (productoId: string, cantidad: number) => {
    const item = cart.find((i) => i.producto.id === productoId);
    if (!item) return;
    if (cantidad > item.producto.stock) {
      alert('No hay suficiente stock');
      return;
    }
    if (cantidad < 1) {
      removeFromCart(productoId);
      return;
    }
    setCart(cart.map((i) =>
      i.producto.id === productoId ? { ...i, cantidad } : i
    ));
  };

  const removeFromCart = (productoId: string) => {
    setCart(cart.filter((item) => item.producto.id !== productoId));
  };

  const subtotal = cart.reduce((sum, item) => {
    return sum + (item.precioUnit * item.cantidad) - item.descuento;
  }, 0);

  const total = subtotal - descuentoGeneral;

  const handleSubmit = async () => {
    if (cart.length === 0) {
      alert('Agrega al menos un producto');
      return;
    }

    try {
      await createVenta.mutateAsync({
        pacienteId: pacienteId || undefined,
        items: cart.map((item) => ({
          productoId: item.producto.id,
          cantidad: item.cantidad,
          precioUnit: item.precioUnit,
          descuento: item.descuento,
        })),
        descuento: descuentoGeneral,
        metodoPago,
      });
      navigate('/ventas');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al crear venta');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/ventas')}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Nueva Venta</h1>
          <p className="text-gray-500 mt-1">Registrar venta de productos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Search & Cart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search Products */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Agregar Productos</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar producto por nombre o código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-heal-500/20 focus:border-heal-500"
              />
            </div>

            {/* Search Results */}
            {search && productos && productos.length > 0 && (
              <div className="mt-4 border border-gray-100 rounded-xl divide-y divide-gray-100 max-h-60 overflow-y-auto">
                {productos.map((producto) => (
                  <button
                    key={producto.id}
                    onClick={() => addToCart(producto)}
                    disabled={producto.stock === 0}
                    className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{producto.nombre}</p>
                        <p className="text-xs text-gray-500">
                          Stock: {producto.stock} | {producto.codigo || 'Sin código'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-heal-600">{formatPrice(Number(producto.precio))}</p>
                      <Plus className="w-4 h-4 text-gray-400 ml-auto" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">
              Carrito ({cart.length} {cart.length === 1 ? 'item' : 'items'})
            </h2>

            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>Carrito vacío</p>
                <p className="text-sm">Busca productos para agregar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.producto.id}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.producto.nombre}</p>
                      <p className="text-sm text-gray-500">
                        {formatPrice(item.precioUnit)} c/u
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.producto.id, item.cantidad - 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={item.cantidad}
                        onChange={(e) => updateQuantity(item.producto.id, parseInt(e.target.value) || 0)}
                        className="w-12 text-center border border-gray-200 rounded-lg py-1"
                        min={1}
                        max={item.producto.stock}
                      />
                      <button
                        onClick={() => updateQuantity(item.producto.id, item.cantidad + 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                    <div className="w-24 text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(item.precioUnit * item.cantidad - item.descuento)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.producto.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          {/* Client Selection */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Cliente (Opcional)</h2>

            {selectedPaciente ? (
              <div className="flex items-center justify-between p-3 bg-heal-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-heal-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-heal-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedPaciente.firstName} {selectedPaciente.lastName}
                    </p>
                    {selectedPaciente.rut && (
                      <p className="text-xs text-gray-500">{selectedPaciente.rut}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setPacienteId(null)}
                  className="text-sm text-gray-500 hover:text-red-500"
                >
                  Quitar
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar paciente..."
                  value={searchPaciente}
                  onChange={(e) => { setSearchPaciente(e.target.value); setShowPacienteSearch(true); }}
                  onFocus={() => setShowPacienteSearch(true)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-heal-500/20 focus:border-heal-500"
                />

                {showPacienteSearch && searchPaciente && pacientes && pacientes.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {pacientes.slice(0, 5).map((paciente: any) => (
                      <button
                        key={paciente.id}
                        onClick={() => {
                          setPacienteId(paciente.id);
                          setSearchPaciente('');
                          setShowPacienteSearch(false);
                        }}
                        className="w-full p-3 text-left hover:bg-gray-50 flex items-center gap-3"
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-sm">{paciente.firstName} {paciente.lastName}</p>
                          <p className="text-xs text-gray-500">{paciente.rut}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Método de Pago</h2>
            <div className="grid grid-cols-2 gap-2">
              {metodosPago.map((metodo) => {
                const Icon = metodo.icon;
                return (
                  <button
                    key={metodo.value}
                    onClick={() => setMetodoPago(metodo.value)}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-xl border transition-all",
                      metodoPago === metodo.value
                        ? "border-heal-500 bg-heal-50 text-heal-700"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{metodo.label}</span>
                    {metodoPago === metodo.value && (
                      <Check className="w-4 h-4 ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Total */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Resumen</h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Descuento</span>
                <input
                  type="number"
                  value={descuentoGeneral}
                  onChange={(e) => setDescuentoGeneral(Number(e.target.value) || 0)}
                  className="w-24 text-right px-2 py-1 border border-gray-200 rounded-lg text-sm"
                  min={0}
                />
              </div>

              <div className="pt-3 border-t border-gray-100">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-heal-600">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={cart.length === 0 || createVenta.isPending}
              className="w-full mt-6 py-3 bg-heal-600 text-white rounded-xl font-semibold hover:bg-heal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {createVenta.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Confirmar Venta
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
