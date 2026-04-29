'use client';

import { ProductType } from '@/app/actions/products';
import { deleteProduct, bulkUpdateProducts } from '@/app/actions/products';
import { Edit2, Trash2, Package, X, Check } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { InlineInput } from './InlineInput';
import { StockInlineEditor } from './StockInlineEditor';
import { toast } from 'sonner';

interface ProductTableProps {
  products: ProductType[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll?: () => void;
  onEdit?: (product: ProductType) => void;
  onDelete?: (id: string) => void;
  onRefresh?: () => void;
}

export const ProductTable = ({
  products,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onRefresh
}: ProductTableProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const isAllSelected = products.length > 0 && selectedIds.size === products.length;

  const handleInlineSave = async (id: string, field: string, value: string) => {
    const data: any = {};
    if (field === 'price') data.base_price = Number(value);
    if (field === 'name') data.name = value;
    if (field === 'category') data.category = value;
    if (field === 'status') data.is_active = value === 'true';

    try {
      const res = await bulkUpdateProducts([{ id, data }]);
      if (res?.success) {
        toast.success(`Actualizado.`);
      } else {
        toast.error(res?.error || 'Error al actualizar.');
      }
    } catch (e) {
      toast.error('Error de red al sincronizar.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar producto?')) return;
    setDeletingId(id);
    try {
      const res = await deleteProduct(id);
      if (res.success) {
        onDelete?.(id);
        toast.success('Producto eliminado.');
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-[#050505] rounded-[1.5rem] border border-white/5 overflow-hidden shadow-2xl overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-white/[0.01] border-b border-white/5 text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">
            <th className="px-6 py-4 w-12">
              <div
                onClick={onSelectAll}
                className={cn(
                    "w-4 h-4 rounded border cursor-pointer flex items-center justify-center transition-all",
                    isAllSelected ? "bg-[#00E5FF] border-[#00E5FF]" : "border-white/10 hover:border-white/20"
                )}
              >
                {isAllSelected && <Check size={10} className="text-black" />}
              </div>
            </th>
            <th className="px-6 py-4">Producto</th>
            <th className="px-6 py-4">Categoría</th>
            <th className="px-6 py-4 text-right">Precio</th>
            <th className="px-6 py-4 text-right">Stock</th>
            <th className="px-6 py-4">Estado</th>
            <th className="px-6 py-4 w-20"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.01]">
          {products.map((product) => {
            const isSelected = selectedIds.has(product.id);
            return (
              <tr
                key={product.id}
                className={cn(
                    "group transition-all hover:bg-white/[0.02]",
                    isSelected ? "bg-[#00E5FF]/5" : "",
                    !product.is_active && "opacity-40"
                )}
              >
                <td className="px-6 py-4">
                  <div
                    onClick={() => onToggleSelect(product.id)}
                    className={cn(
                        "w-4 h-4 rounded border cursor-pointer flex items-center justify-center transition-all",
                        isSelected ? "bg-[#00E5FF] border-[#00E5FF]" : "border-white/5 hover:border-white/10"
                    )}
                  >
                    {isSelected && <Check size={10} className="text-black" />}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-black border border-white/5 p-1 shrink-0">
                      {product.images?.[0] ? (
                        <Image src={product.images[0]} alt="" width={56} height={56} className="object-contain w-full h-full" />
                      ) : (
                        <Package size={20} className="text-white/10 mx-auto mt-3" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <InlineInput
                         value={product.name}
                         onSave={(val) => handleInlineSave(product.id, 'name', val)}
                         className="font-bold text-white text-xs tracking-tight truncate max-w-[200px]"
                      />
                      <p className="text-[8px] text-white/20 font-medium truncate max-w-[200px] mt-0.5">{product.id.slice(0, 8)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <InlineInput
                    value={product.category || '—'}
                    onSave={(val) => handleInlineSave(product.id, 'category', val)}
                    className="text-[9px] font-black text-white/30 uppercase tracking-widest"
                  />
                </td>
                <td className="px-6 py-4 text-right">
                   <InlineInput
                      value={Number(product.base_price)}
                      type="number"
                      prefix="$"
                      onSave={(val) => handleInlineSave(product.id, 'price', val)}
                      className="justify-end font-bold text-xs"
                   />
                </td>
                <td className="px-6 py-4">
                    <div className="flex justify-end">
                        <StockInlineEditor
                          productId={product.id}
                          productName={product.name}
                          productImage={product.images?.[0]}
                          stockBySize={product.stock_by_size || {}}
                          onSuccess={onRefresh}
                        />
                    </div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                      "text-[8px] font-black uppercase tracking-widest",
                      product.is_active ? "text-emerald-500" : "text-white/20"
                  )}>
                    {product.is_active ? 'Online' : 'Offline'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => handleInlineSave(product.id, 'status', product.is_active ? 'false' : 'true')}
                        className="p-2 text-white/20 hover:text-white transition-colors"
                    >
                        {product.is_active ? <X size={14} /> : <Check size={14} />}
                    </button>
                    <button onClick={() => onEdit?.(product)} className="p-2 text-white/20 hover:text-[#00E5FF] transition-colors">
                        <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(product.id)} disabled={deletingId === product.id} className="p-2 text-white/20 hover:text-rose-500 transition-colors">
                        <Trash2 size={14} />
                    </button>
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
