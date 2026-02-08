'use client';

import { ProductType } from '@/app/actions/products';
import { Edit2, Trash2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { deleteProduct } from '@/app/actions/products';

interface ProductTableProps {
  products: ProductType[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll?: () => void;
  onEdit?: (product: ProductType) => void;
  onDelete?: (id: string) => void;
}

export const ProductTable = ({
  products,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onEdit,
  onDelete
}: ProductTableProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const isAllSelected = products.length > 0 && selectedIds.size === products.length;

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

    setDeletingId(id);
    try {
      const res = await deleteProduct(id);
      if (res.success) {
        onDelete?.(id);
      } else {
        alert('Error al eliminar');
      }
    } catch (e) {
      console.error(e);
      alert('Error al eliminar');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-orange-50/50 border-b border-orange-100">
              <th className="p-4 w-12">
                <div
                  onClick={onSelectAll}
                  className={`w-4 h-4 rounded border cursor-pointer flex items-center justify-center transition-colors ${isAllSelected ? 'bg-orange-500 border-orange-500' : 'border-orange-200 bg-white hover:border-orange-400'}`}
                >
                  {isAllSelected && <div className="w-2 h-2 bg-white rounded-[1px]" />}
                </div>
              </th>
              <th className="p-4 text-xs font-bold text-orange-900 uppercase tracking-wider">Producto</th>
              <th className="p-4 text-xs font-bold text-orange-900 uppercase tracking-wider">Categoría</th>
              <th className="p-4 text-xs font-bold text-orange-900 uppercase tracking-wider text-right">Precio</th>
              <th className="p-4 text-xs font-bold text-orange-900 uppercase tracking-wider text-right">Stock</th>
              <th className="p-4 text-xs font-bold text-orange-900 uppercase tracking-wider">Estado</th>
              <th className="p-4 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-orange-50">
            {products.map((product) => {
              const totalStock = product.stock_by_size
                ? Object.values(product.stock_by_size).reduce((a, b) => a + Number(b), 0)
                : 0;

              const isSelected = selectedIds.has(product.id);

              return (
                <tr
                  key={product.id}
                  className={`group transition-colors hover:bg-orange-50/30 ${isSelected ? 'bg-orange-50' : ''}`}
                >
                  <td className="p-4">
                    <div
                      onClick={() => onToggleSelect(product.id)}
                      className={`w-5 h-5 rounded border cursor-pointer flex items-center justify-center transition-colors ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-slate-300 bg-white hover:border-orange-400'}`}
                    >
                      {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-[1px]" />}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <div className="w-4 h-4 bg-slate-200 rounded-full" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 line-clamp-1">{product.name}</p>
                        <p className="text-xs text-slate-500 line-clamp-1">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {product.category || 'Sin categoría'}
                    </span>
                  </td>
                  <td className="p-4 text-right font-mono font-medium text-slate-700">
                    ${Number(product.base_price).toLocaleString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold ${totalStock > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
                      {totalStock === 0 && <AlertCircle size={12} />}
                      {totalStock} uds
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${product.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {product.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(product)}
                          className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        >
                          {deletingId === product.id ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
