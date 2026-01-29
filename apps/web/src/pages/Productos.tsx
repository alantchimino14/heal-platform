import { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Edit2,
  Trash2,
  TrendingDown,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useProductos,
  useCreateProducto,
  useUpdateProducto,
  useDeleteProducto,
  useAdjustProductoStock,
  useProductosStockBajo,
  Producto,
} from '@/api/hooks';

export function Productos() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [showStockModal, setShowStockModal] = useState<Producto | null>(null);

  const { data: productos, isLoading } = useProductos({ search: search || undefined });
  const { data: stockBajo } = useProductosStockBajo();
  const createProducto = useCreateProducto();
  const updateProducto = useUpdateProducto();
  const deleteProducto = useDeleteProducto();
  const adjustStock = useAdjustProductoStock();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      codigo: formData.get('codigo') as string || undefined,
      nombre: formData.get('nombre') as string,
      descripcion: formData.get('descripcion') as string || undefined,
      categoria: formData.get('categoria') as string || undefined,
      precio: Number(formData.get('precio')),
      costo: formData.get('costo') ? Number(formData.get('costo')) : undefined,
      stock: formData.get('stock') ? Number(formData.get('stock')) : undefined,
      stockMinimo: formData.get('stockMinimo') ? Number(formData.get('stockMinimo')) : undefined,
    };

    if (editingProducto) {
      await updateProducto.mutateAsync({ id: editingProducto.id, ...data });
    } else {
      await createProducto.mutateAsync(data);
    }
    setShowModal(false);
    setEditingProducto(null);
  };

  const handleStockAdjust = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!showStockModal) return;
    const formData = new FormData(e.currentTarget);
    const cantidad = Number(formData.get('cantidad'));
    const motivo = formData.get('motivo') as string;
    await adjustStock.mutateAsync({ id: showStockModal.id, cantidad, motivo });
    setShowStockModal(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500 mt-1">Gestión de inventario y productos físicos</p>
        </div>
        <button
          onClick={() => { setEditingProducto(null); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-heal-600 text-white rounded-xl font-medium hover:bg-heal-700 transition-colors shadow-soft"
        >
          <Plus className="w-5 h-5" />
          Nuevo Producto
        </button>
      </div>

      {/* Stock Bajo Alert */}
      {stockBajo && stockBajo.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Stock bajo en {stockBajo.length} producto(s)</p>
            <p className="text-sm text-amber-600 mt-1">
              {stockBajo.map(p => p.nombre).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-heal-500/20 focus:border-heal-500"
        />
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {productos?.map((producto) => (
            <div
              key={producto.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-soft transition-shadow group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{producto.nombre}</h3>
                    {producto.stock <= producto.stockMinimo && (
                      <TrendingDown className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  {producto.codigo && (
                    <p className="text-xs text-gray-400 mt-0.5">Código: {producto.codigo}</p>
                  )}
                  {producto.categoria && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {producto.categoria}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setShowStockModal(producto)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg"
                    title="Ajustar stock"
                  >
                    <Package className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => { setEditingProducto(producto); setShowModal(true); }}
                    className="p-1.5 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => deleteProducto.mutate(producto.id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-heal-600">{formatPrice(Number(producto.precio))}</p>
                  {producto.costo && (
                    <p className="text-xs text-gray-400">Costo: {formatPrice(Number(producto.costo))}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-lg font-semibold",
                    producto.stock <= producto.stockMinimo ? "text-amber-500" : "text-gray-700"
                  )}>
                    {producto.stock} uds
                  </p>
                  <p className="text-xs text-gray-400">Stock</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && productos?.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="mt-4 text-gray-500">No hay productos registrados</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 text-heal-600 hover:text-heal-700 font-medium"
          >
            Agregar primer producto
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md animate-fade-in-up">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold">
                {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button
                onClick={() => { setShowModal(false); setEditingProducto(null); }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    name="nombre"
                    required
                    defaultValue={editingProducto?.nombre}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-heal-500/20 focus:border-heal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                  <input
                    name="codigo"
                    defaultValue={editingProducto?.codigo || ''}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-heal-500/20 focus:border-heal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <input
                    name="categoria"
                    defaultValue={editingProducto?.categoria || ''}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-heal-500/20 focus:border-heal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
                  <input
                    name="precio"
                    type="number"
                    required
                    defaultValue={editingProducto?.precio || ''}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-heal-500/20 focus:border-heal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo</label>
                  <input
                    name="costo"
                    type="number"
                    defaultValue={editingProducto?.costo || ''}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-heal-500/20 focus:border-heal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    name="stock"
                    type="number"
                    defaultValue={editingProducto?.stock || 0}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-heal-500/20 focus:border-heal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
                  <input
                    name="stockMinimo"
                    type="number"
                    defaultValue={editingProducto?.stockMinimo || 5}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-heal-500/20 focus:border-heal-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    name="descripcion"
                    rows={2}
                    defaultValue={editingProducto?.descripcion || ''}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-heal-500/20 focus:border-heal-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingProducto(null); }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createProducto.isPending || updateProducto.isPending}
                  className="px-4 py-2 bg-heal-600 text-white rounded-xl hover:bg-heal-700 transition-colors disabled:opacity-50"
                >
                  {editingProducto ? 'Guardar' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm animate-fade-in-up">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Ajustar Stock</h2>
              <button
                onClick={() => setShowStockModal(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleStockAdjust} className="p-5 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Producto</p>
                <p className="font-medium">{showStockModal.nombre}</p>
                <p className="text-sm text-gray-500 mt-1">Stock actual: {showStockModal.stock}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad (+ agregar, - quitar)
                </label>
                <input
                  name="cantidad"
                  type="number"
                  required
                  placeholder="+10 o -5"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-heal-500/20 focus:border-heal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                <input
                  name="motivo"
                  placeholder="Ej: Reposición, Ajuste inventario"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-heal-500/20 focus:border-heal-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowStockModal(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={adjustStock.isPending}
                  className="px-4 py-2 bg-heal-600 text-white rounded-xl hover:bg-heal-700 transition-colors disabled:opacity-50"
                >
                  Ajustar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
