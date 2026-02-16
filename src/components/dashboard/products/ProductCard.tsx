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
        <div className={`group relative bg-[#111] border rounded-[2.5rem] overflow-hidden hover:shadow-[0_0_50px_-10px_rgba(200,138,4,0.2)] transition-all duration-700 ease-out hover:-translate-y-2 ${isSelected ? 'border-[#C88A04] ring-4 ring-[#C88A04]/10' : 'border-white/5 hover:border-[#C88A04]/30'} ${product.is_active ? '' : 'opacity-60 grayscale'}`}>

            {/* Selection Checkbox */}
            {onToggleSelect && (
                <div className="absolute top-5 right-5 z-30">
                    <div
                        onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
                        className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all duration-500 ${isSelected ? 'bg-[#C88A04] border-[#C88A04] shadow-[0_0_20px_rgba(200,138,4,0.4)]' : 'border-white/20 bg-black/40 backdrop-blur-md hover:border-[#C88A04]'}`}
                    >
                        {isSelected && <div className="w-3 h-3 bg-black rounded-sm" />}
                    </div>
                </div>
            )}

            {/* Image Section */}
            <div className="relative h-[220px] overflow-hidden bg-[#050505]">
                {/* Background Noise/Glow */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }} />

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#C88A04]/10 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {product.images?.[0] ? (
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        loading="lazy"
                        className="object-contain p-6 transition-all duration-1000 ease-out group-hover:scale-110 group-hover:-rotate-3 drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10">
                        <Package size={64} strokeWidth={1} />
                    </div>
                )}

                {/* Top Badges */}
                <div className="absolute top-5 left-5 flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-black tracking-widest text-[#C88A04] uppercase flex items-center gap-2 shadow-xl">
                        <Tag size={12} className="text-[#C88A04]" />
                        {product.category || 'GENERAL'}
                    </span>
                    {!product.is_active && (
                        <span className="px-3 py-1.5 rounded-full bg-red-600 text-[10px] font-black tracking-widest text-white uppercase shadow-lg">
                            INACTIVO
                        </span>
                    )}
                </div>

                {/* Actions (Overlay) */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-all duration-500 ease-out flex gap-2 z-20">
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="flex-1 bg-white text-black py-3 rounded-2xl font-black text-[10px] tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-[#C88A04] transition-colors shadow-2xl"
                        >
                            <Edit2 size={14} /> EDITAR
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="w-12 bg-red-600/20 backdrop-blur-md text-red-500 rounded-2xl flex items-center justify-center border border-red-600/30 hover:bg-red-600 hover:text-white transition-all shadow-2xl"
                        >
                            {isDeleting ? <div className="animate-spin w-4 h-4 border-2 border-current rounded-full border-t-transparent" /> : <Trash2 size={18} />}
                        </button>
                    )}
                </div>

                {/* Bottom Reflection Gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#111] to-transparent pointer-events-none" />
            </div>

            {/* Content Section */}
            <div className="p-6 pt-2">
                <div className="mb-1">
                    <h3 className="text-xl font-black text-white tracking-tighter leading-tight line-clamp-1 group-hover:text-[#C88A04] transition-colors" title={product.name}>
                        {product.name.toUpperCase()}
                    </h3>
                </div>

                <p className="text-gray-500 text-[13px] font-light line-clamp-2 mb-6 h-10 leading-relaxed">
                    {product.description || 'Sin descripción disponible para este producto exclusivo de la colección ÉTER.'}
                </p>

                <div className="flex items-center justify-between border-t border-white/5 pt-5 mt-auto">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1">Precio Unitario</span>
                        <span className="text-2xl font-light text-white flex items-center gap-1">
                            <span className="text-sm text-[#C88A04] font-black">$</span>
                            {product.base_price.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1">Unidades</span>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-black tracking-widest ${totalStock > 0 ? 'text-[#C88A04] bg-[#C88A04]/10' : 'text-red-500 bg-red-500/10'}`}>
                            {totalStock === 0 && <AlertCircle size={12} />}
                            {totalStock} <span className="opacity-50">UDS</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
