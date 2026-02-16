'use client';

import { ProductType } from '@/app/actions/products';
import { Edit2, Trash2, AlertCircle, Package } from 'lucide-react';
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
    <div className="bg-[#0A0A0A] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-white/5 border-b border-white/5 uppercase tracking-[0.2em] text-[10px] font-black">
            <th className="p-6 w-16">
              <div
                onClick={onSelectAll}
                className={`w-6 h-6 rounded-lg border-2 cursor-pointer flex items-center justify-center transition-all ${isAllSelected ? 'bg-[#C88A04] border-[#C88A04] shadow-[0_0_15px_rgba(200,138,4,0.3)]' : 'border-white/20 hover:border-[#C88A04]'}`}
              >
                {isAllSelected && <div className="w-2.5 h-2.5 bg-black rounded-sm" />}
              </div>
            </th>
            <th className="p-6 text-[#C88A04]">Producto</th>
            <th className="p-6 text-gray-500">Categoría</th>
            <th className="p-6 text-gray-500 text-right">Precio</th>
            <th className="p-6 text-gray-500 text-right">Stock</th>
            <th className="p-6 text-gray-500">Estado</th>
            <th className="p-6 w-24"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.03]">
          {products.map((product) => {
            const totalStock = product.stock_by_size
              ? Object.values(product.stock_by_size).reduce((a, b) => a + Number(b), 0)
              : 0;

            const isSelected = selectedIds.has(product.id);

            return (
              <tr
                key={product.id}
                className={`group transition-all duration-500 hover:bg-white/[0.02] ${isSelected ? 'bg-[#C88A04]/5' : ''} ${product.is_active ? '' : 'opacity-60'}`}
              >
                <td className="p-6">
                  <div
                    onClick={() => onToggleSelect(product.id)}
                    className={`w-6 h-6 rounded-lg border-2 cursor-pointer flex items-center justify-center transition-all ${isSelected ? 'bg-[#C88A04] border-[#C88A04] shadow-[0_0_15px_rgba(200,138,4,0.3)]' : 'border-white/10 hover:border-[#C88A04]'}`}
                  >
                    {isSelected && <div className="w-2.5 h-2.5 bg-black rounded-sm" />}
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-5">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-black border border-white/10 flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/5">
                          <Package size={20} />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-black text-white text-lg tracking-tight group-hover:text-[#C88A04] transition-colors">{product.name.toUpperCase()}</p>
                      <p className="text-[11px] text-gray-500 font-light truncate max-w-[200px]">{product.description || 'SIN DESCRIPCIÓN DISPONIBLE'}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-white/5 border border-white/5 text-gray-400 uppercase">
                    {product.category || 'GENERAL'}
                  </span>
                </td>
                <td className="p-6 text-right font-light text-xl text-white">
                  <span className="text-xs text-[#C88A04] font-black mr-1">$</span>
                  {Number(product.base_price).toLocaleString()}
                </td>
                <td className="p-6 text-right">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-black tracking-widest ${totalStock > 0 ? 'text-[#C88A04] bg-[#C88A04]/10' : 'text-red-500 bg-red-500/10'}`}>
                    {totalStock === 0 && <AlertCircle size={14} />}
                    {totalStock} <span className="opacity-50">UDS</span>
                  </div>
                </td>
                <td className="p-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${product.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    {product.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(product)}
                        className="p-3 bg-white text-black rounded-xl hover:bg-[#C88A04] hover:text-white transition-all shadow-xl"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                        className="p-3 bg-red-600/10 text-red-500 border border-red-600/20 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-xl"
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
  );
};
