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
    <div className="bg-[#050505]/40 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl overflow-x-auto backdrop-blur-3xl">
      <table className="w-full text-left border-collapse min-w-[900px]">
        <thead>
          <tr className="bg-white/[0.02] border-b border-white/5 uppercase tracking-[0.4em] text-[9px] font-black text-white/40">
            <th className="p-8 w-20">
              <div
                onClick={onSelectAll}
                className={`w-6 h-6 rounded-lg border-2 cursor-pointer flex items-center justify-center transition-all duration-500 ${isAllSelected ? 'bg-[#00E5FF] border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.4)]' : 'border-white/10 hover:border-[#00E5FF]/40'}`}
              >
                {isAllSelected && <div className="w-2.5 h-2.5 bg-black rounded-sm" />}
              </div>
            </th>
            <th className="p-8 font-black tracking-[0.4em]">Ítem_Identidad</th>
            <th className="p-8 font-black tracking-[0.4em]">Sector</th>
            <th className="p-8 font-black tracking-[0.4em] text-right">Inversión</th>
            <th className="p-8 font-black tracking-[0.4em] text-right">Escala_Stock</th>
            <th className="p-8 font-black tracking-[0.4em]">Estado</th>
            <th className="p-8 w-24"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.02]">
          {products.map((product) => {
            const totalStock = product.stock_by_size
              ? Object.values(product.stock_by_size).reduce((a, b) => Number(a) + Number(b), 0)
              : 0;

            const isSelected = selectedIds.has(product.id);

            return (
              <tr
                key={product.id}
                className={`group transition-all duration-700 hover:bg-white/[0.03] ${isSelected ? 'bg-[#00E5FF]/5' : ''} ${product.is_active ? '' : 'opacity-40 grayscale'}`}
              >
                <td className="p-8">
                  <div
                    onClick={() => onToggleSelect(product.id)}
                    className={`w-6 h-6 rounded-lg border-2 cursor-pointer flex items-center justify-center transition-all duration-500 ${isSelected ? 'bg-[#00E5FF] border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.4)]' : 'border-white/5 hover:border-[#00E5FF]/20'}`}
                  >
                    {isSelected && <div className="w-2.5 h-2.5 bg-black rounded-sm" />}
                  </div>
                </td>
                <td className="p-8">
                  <div className="flex items-center gap-6">
                    <div className="relative w-16 h-16 rounded-[1.25rem] overflow-hidden bg-black border border-white/10 flex-shrink-0 group-hover:border-[#00E5FF]/40 transition-all duration-500 shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#00E5FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-contain p-2 group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/5">
                          <Package size={24} />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-black text-white text-lg tracking-tighter group-hover:text-[#00E5FF] transition-all duration-500">{product.name.toUpperCase()}</p>
                      <p className="text-[10px] text-white/20 font-black tracking-widest uppercase mt-1 truncate max-w-[250px]">{product.description || 'ARCHIVO SIN METADATOS'}</p>
                    </div>
                  </div>
                </td>
                <td className="p-8">
                  <span className="inline-flex items-center px-4 py-2 rounded-xl text-[9px] font-black tracking-[0.2em] bg-white/[0.03] border border-white/5 text-white/40 group-hover:text-white transition-colors uppercase">
                    {product.category || 'GENERAL'}
                  </span>
                </td>
                <td className="p-8 text-right font-black text-xl text-white tabular-nums">
                  <span className="text-xs text-[#00E5FF] mr-2 opacity-50">$</span>
                  {Number(product.base_price).toLocaleString()}
                </td>
                <td className="p-8 text-right">
                  <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-2xl text-[10px] font-black tracking-widest ${totalStock > 0 ? 'text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/20' : 'text-rose-500 bg-rose-500/10 border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]'}`}>
                    {totalStock === 0 && <AlertCircle size={14} />}
                    {totalStock} <span className="opacity-40">UDS</span>
                  </div>
                </td>
                <td className="p-8">
                  <span className={`inline-flex items-center px-4 py-2 rounded-xl text-[9px] font-black tracking-[0.2em] uppercase border ${product.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-white/20 border-white/10'}`}>
                    {product.is_active ? 'Online' : 'Offline'}
                  </span>
                </td>
                <td className="p-8">
                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-8 group-hover:translate-x-0">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(product)}
                        className="p-4 bg-white text-black rounded-2xl hover:bg-[#00E5FF] transition-all shadow-2xl active:scale-90"
                      >
                        <Edit2 size={16} strokeWidth={3} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                        className="p-4 bg-rose-600/10 text-rose-500 border border-rose-600/20 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-2xl active:scale-90"
                      >
                        {deletingId === product.id ? (
                          <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
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
