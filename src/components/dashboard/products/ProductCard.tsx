'use client';

import { ProductType } from '@/app/actions/products';
import { Trash2, Edit2, Package, Tag, AlertCircle, ScanText } from 'lucide-react';
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
            alert('Error al eliminar');
        } finally {
            setIsDeleting(false);
        }
    };

    const totalStock = product.stock_by_size
        ? Object.values(product.stock_by_size).reduce((a, b) => Number(a) + Number(b), 0)
        : 0;

    return (
        <div className={`group relative bg-[#050505] border rounded-[2.5rem] overflow-hidden hover:shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_80px_-20px_rgba(0,229,255,0.15)] transition-all duration-700 ease-[0.16,1,0.3,1] ${isSelected ? 'border-[#00E5FF] ring-8 ring-[#00E5FF]/5' : 'border-white/5 hover:border-[#00E5FF]/30'} ${product.is_active ? '' : 'opacity-40 grayscale'}`}>

            {/* Selection Checkbox */}
            {onToggleSelect && (
                <div className="absolute top-5 right-5 z-30">
                    <div
                        onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
                        className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all duration-500 ${isSelected ? 'bg-[#00E5FF] border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.4)]' : 'border-white/10 bg-black/40 backdrop-blur-md hover:border-[#00E5FF]/40'}`}
                    >
                        {isSelected && <div className="w-3 h-3 bg-black rounded-sm" />}
                    </div>
                </div>
            )}

            {/* Image Section */}
            <div className="relative h-[240px] overflow-hidden bg-black">
                {/* Background Noise/Glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#00E5FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-[#00E5FF]/5 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                {product.images?.[0] ? (
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        loading="lazy"
                        className="object-contain p-8 transition-all duration-1000 ease-[0.16,1,0.3,1] group-hover:scale-110 group-hover:-rotate-2 drop-shadow-[0_25px_40px_rgba(0,0,0,0.8)]"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/5">
                        <Package size={64} strokeWidth={1} />
                    </div>
                )}

                {/* Top Badges */}
                <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                    <span className="px-4 py-2 rounded-xl bg-black/60 backdrop-blur-xl border border-white/5 text-[9px] font-black tracking-[0.3em] text-[#00E5FF] uppercase flex items-center gap-2 shadow-2xl">
                        <ScanText size={12} className="text-[#00E5FF]" />
                        {product.category || 'MÓDULO_GEN'}
                    </span>
                    {!product.is_active && (
                        <span className="px-4 py-2 rounded-xl bg-rose-600 text-[9px] font-black tracking-[0.3em] text-white uppercase shadow-2xl animate-pulse">
                            SINCRONIZACIÓN_OFF
                        </span>
                    )}
                </div>

                {/* Actions (Overlay) */}
                <div className="absolute inset-x-6 bottom-6 translate-y-[150%] group-hover:translate-y-0 transition-all duration-700 ease-[0.16,1,0.3,1] flex gap-3 z-20">
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="flex-1 bg-white text-black py-4 rounded-2xl font-black text-[9px] tracking-[0.3em] uppercase flex items-center justify-center gap-3 hover:bg-[#00E5FF] transition-all shadow-2xl active:scale-95"
                        >
                            <Edit2 size={14} strokeWidth={3} /> RECALIBRAR
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="w-14 bg-rose-600/10 backdrop-blur-xl text-rose-500 rounded-2xl flex items-center justify-center border border-rose-600/20 hover:bg-rose-600 hover:text-white transition-all shadow-2xl active:scale-95"
                        >
                            {isDeleting ? <div className="animate-spin w-5 h-5 border-2 border-current rounded-full border-t-transparent" /> : <Trash2 size={18} />}
                        </button>
                    )}
                </div>

                {/* Bottom Shadow Transition */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent pointer-events-none" />
            </div>

            {/* Content Section */}
            <div className="p-8 pt-4">
                <div className="mb-2">
                    <h3 className="text-2xl font-black text-white tracking-tighter leading-none line-clamp-1 group-hover:text-[#00E5FF] transition-colors duration-500" title={product.name}>
                        {product.name.toUpperCase()}
                    </h3>
                </div>

                <p className="text-white/20 text-[11px] font-black tracking-widest uppercase line-clamp-2 mb-8 h-10 leading-relaxed overflow-hidden">
                    {product.description || 'ARCHIVO DE PRODUCTO SIN METADATOS COMPLEMENTARIOS.'}
                </p>

                <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-auto">
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em]">Invasión_Base</span>
                        <span className="text-2xl font-black text-white tabular-nums flex items-center">
                            <span className="text-sm text-[#00E5FF] mr-1.5 opacity-40">$</span>
                            {product.base_price.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em]">Registros</span>
                        <div className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest ${totalStock > 0 ? 'text-[#00E5FF] bg-[#00E5FF]/10' : 'text-rose-500 bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.1)]'}`}>
                            {totalStock === 0 && <AlertCircle size={14} />}
                            {totalStock} <span className="opacity-30">UDS</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
