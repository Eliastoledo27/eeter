'use client';

import { ProductType } from '@/app/actions/products';
import { Trash2, Edit2, Package, Tag, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { deleteProduct } from '@/app/actions/products';

interface ProductCardProps {
    product: ProductType;
    onDelete?: () => void;
    onEdit?: () => void;
    isSelected?: boolean;
    onToggleSelect?: () => void;
}

export const ProductCard = ({ product, onDelete, onEdit, isSelected, onToggleSelect }: ProductCardProps) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

        setIsDeleting(true);
        try {
            const res = await deleteProduct(product.id);
            if (res.success) {
                onDelete?.();
            } else {
                alert('Error al eliminar');
            }
        } catch {
            // console.error(e);
            alert('Error al eliminar');
        } finally {
            setIsDeleting(false);
        }
    };

    const totalStock = product.stock_by_size
        ? Object.values(product.stock_by_size).reduce((a, b) => a + Number(b), 0)
        : 0;

    return (
        <div className={`group relative bg-white border rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-1 ${isSelected ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-slate-100'} ${product.is_active ? '' : 'opacity-85'}`}>

            {/* Selection Checkbox */}
            {onToggleSelect && (
                <div className="absolute top-3 right-3 z-30">
                    <div
                        onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all shadow-sm ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-white bg-white/90 hover:border-orange-300'}`}
                    >
                        {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                    </div>
                </div>
            )}

            {/* Image Section */}
            <div className="relative h-[180px] overflow-hidden bg-slate-50">
                {product.images?.[0] ? (
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        loading="lazy"
                        className="object-cover transition-transform duration-500 group-hover:scale-105 w-full h-full"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Package size={48} />
                    </div>
                )}

                {/* Top Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-slate-100 text-[10px] font-bold text-slate-700 flex items-center gap-1 shadow-sm">
                        <Tag size={10} className="text-orange-500" />
                        {product.category || 'Sin categoría'}
                    </span>
                    {!product.is_active && (
                        <span className="px-2.5 py-1 rounded-full bg-slate-900/90 text-[10px] font-bold text-white shadow-sm">
                            Inactivo
                        </span>
                    )}
                </div>

                {/* Actions (Slide Up) */}
                {(onEdit || onDelete) && (
                    <div className="absolute inset-x-3 bottom-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex gap-2">
                        {onEdit && (
                            <button
                                onClick={onEdit}
                                className="flex-1 bg-white/95 backdrop-blur text-slate-900 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-orange-50 hover:text-orange-700 transition-colors shadow-lg shadow-black/5"
                            >
                                <Edit2 size={14} /> Editar
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="w-10 bg-white/95 backdrop-blur text-red-500 rounded-xl flex items-center justify-center hover:bg-red-50 transition-all shadow-lg shadow-black/5"
                            >
                                {isDeleting ? <div className="animate-spin w-3 h-3 border-2 border-current rounded-full border-t-transparent" /> : <Trash2 size={16} />}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-4">
                <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-orange-600 transition-colors" title={product.name}>
                        {product.name}
                    </h3>
                </div>

                <p className="text-slate-500 text-xs line-clamp-2 mb-4 h-8 leading-relaxed">
                    {product.description || 'Sin descripción disponible para este producto.'}
                </p>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-auto">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Precio</span>
                        <span className="text-lg font-black text-slate-900 flex items-center gap-0.5">
                            <span className="text-sm text-slate-400">$</span>
                            {product.base_price}
                        </span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Stock</span>
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold ${totalStock > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
                            {totalStock === 0 && <AlertCircle size={10} />}
                            {totalStock} <span className="font-normal opacity-70">uds</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
