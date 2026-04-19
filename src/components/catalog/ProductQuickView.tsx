'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Minus, ShoppingCart, Heart, Package, ShieldCheck, Truck, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProductType } from '@/app/actions/products';
import { useCartStore } from '@/store/cart-store';
import { toast } from 'sonner';

interface ProductQuickViewProps {
    product: ProductType;
    onClose: () => void;
}

export function ProductQuickView({ product, onClose }: ProductQuickViewProps) {
    const { addItem, setIsOpen: setIsCartOpen } = useCartStore();
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleEsc = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        },
        [onClose]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [handleEsc]);

    const availableSizes = Object.entries(product.stock_by_size || {})
        .filter(([, stock]) => Number(stock) > 0)
        .map(([size]) => size)
        .sort((a, b) => Number(a) - Number(b));

    const totalStock = Object.values(product.stock_by_size || {}).reduce((a, b) => Number(a) + Number(b), 0);
    const isLowStock = totalStock < 10 && totalStock > 0;

    const displayImages = Array.from(new Set(
        product.images && product.images.length > 0
            ? product.images
            : ['/placeholder-shoe.png']
    ));

    const handleAddToCart = (buyNow = false) => {
        if (!selectedSize) {
            toast.error('SELECCIÓN REQUERIDA', {
                description: 'Por favor seleccioná un talle para continuar.',
                style: { background: '#020202', color: '#FAFAF9', border: '1px solid rgba(239, 68, 68, 0.2)' }
            });
            return false;
        }

        setIsAdding(true);

        // Convert ProductType back to Product entity for the store
        const productToCart: any = {
            id: product.id,
            name: product.name,
            description: product.description || '',
            category: product.category || 'General',
            basePrice: product.base_price,
            images: displayImages,
            stockBySize: product.stock_by_size,
            totalStock: totalStock,
            status: product.is_active ? 'active' : 'inactive',
            createdAt: new Date(),
        };

        addItem(productToCart, selectedSize, quantity);

        setTimeout(() => {
            setIsAdding(false);
            if (!buyNow) {
                toast.success('ARCHIVO ACTUALIZADO', {
                    description: `${product.name} (Talle ${selectedSize}) añadido.`,
                    style: { background: '#020202', color: '#FAFAF9', border: '1px solid rgba(0, 229, 255, 0.2)' }
                });
                setIsCartOpen(true);
                onClose();
            } else {
                setIsCartOpen(true);
                onClose();
            }
        }, 500);
        
        return true;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6"
        >
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                className="relative w-full max-w-6xl h-full sm:h-auto sm:max-h-[85vh] bg-[#020202] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]"
            >
                {/* Header Actions */}
                <div className="absolute top-8 right-8 z-[70] hidden sm:block">
                    <button
                        onClick={onClose}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all duration-300"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 h-full overflow-y-auto no-scrollbar">
                    {/* LEFT: Image System */}
                    <div className="relative p-8 lg:p-12 flex flex-col gap-6">
                        <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-white/[0.02] border border-white/5 flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedImage}
                                    initial={{ opacity: 0, scale: 1.1, rotate: -3 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, rotate: 3 }}
                                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                    className="relative w-full h-full"
                                >
                                    <Image
                                        src={displayImages[selectedImage]}
                                        fill
                                        className="object-contain p-12"
                                        alt={product.name}
                                        priority
                                    />
                                </motion.div>
                            </AnimatePresence>

                            {/* Neon Scanner Effect */}
                            <motion.div
                                animate={{ top: ['-10%', '110%'] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                                className="absolute left-0 w-full h-[1px] bg-[#00E5FF]/30 blur-[2px] z-20 pointer-events-none"
                            />

                            {/* Tags */}
                            <div className="absolute top-6 left-6 flex flex-col gap-2">
                                <span className="bg-[#00E5FF]/10 text-[#00E5FF] px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-[#00E5FF]/20 backdrop-blur-md">
                                    {product.category || 'Limited Archive'}
                                </span>
                                {totalStock > 0 && totalStock < 10 && (
                                    <span className="bg-red-500/10 text-red-500 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-500/20 backdrop-blur-md animate-pulse">
                                        Escasez Crítica
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Gallery Thumbnails */}
                        {displayImages.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                                {displayImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-500 ${selectedImage === idx
                                            ? 'border-[#00E5FF] bg-[#00E5FF]/5 shadow-[0_0_20px_rgba(0,229,255,0.2)]'
                                            : 'border-white/5 bg-white/5 opacity-50 hover:opacity-100'
                                            }`}
                                    >
                                        <Image src={img} fill className="object-contain p-2" alt="Thumb" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Specs & Intelligence */}
                    <div className="p-8 lg:p-16 flex flex-col bg-white/[0.01] border-l border-white/5 relative h-full">
                        <div className="mb-8">
                            <span className="text-[10px] font-black text-[#00E5FF] uppercase tracking-[0.5em] mb-4 block">Detalles del Archivo</span>
                            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-6">
                                {product.name}
                            </h2>
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Precio Miembro</span>
                                    <span className="text-4xl font-black text-[#00E5FF] tracking-tighter">
                                        ${product.base_price.toLocaleString('es-AR')}
                                    </span>
                                </div>
                                <div className="h-10 w-px bg-white/10" />
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Estado</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Sincronizado</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-white/50 text-base leading-relaxed mb-10 font-light border-l-2 border-[#00E5FF]/20 pl-6">
                            {product.description || 'Este producto forma parte de la selección curada de Éter Store. Diseñado para ofrecer una estética disruptiva y un rendimiento superior en entornos urbanos.'}
                        </p>

                        {/* Size Selection Grid */}
                        <div className="mb-10">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#00E5FF]/60">Escala de Talles</span>
                                <span className="text-[9px] text-white/30 font-black uppercase">Stock Verificado</span>
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                {availableSizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`h-14 flex items-center justify-center rounded-2xl text-xs font-black transition-all duration-500 border ${selectedSize === size
                                            ? 'bg-[#00E5FF] border-[#00E5FF] text-black shadow-[0_0_30px_rgba(0,229,255,0.3)]'
                                            : 'bg-white/5 border-white/10 text-white/50 hover:border-[#00E5FF]/40 hover:text-white'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-auto pt-8 border-t border-white/5 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center bg-white/5 rounded-2xl p-1 border border-white/10">
                                    <button
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="w-12 h-14 flex items-center justify-center text-white/40 hover:text-[#00E5FF] transition-colors"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="w-12 text-center font-black text-lg">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(q => q + 1)}
                                        className="w-12 h-14 flex items-center justify-center text-white/40 hover:text-[#00E5FF] transition-colors"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <button className="flex-1 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 hover:border-white/30 transition-all text-white/40 hover:text-white group">
                                    <Heart size={20} className="group-hover:fill-white" />
                                    <span className="ml-3 text-[10px] font-black uppercase tracking-widest">Añadir a Deseos</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleAddToCart()}
                                    disabled={isAdding || availableSizes.length === 0}
                                    className="h-16 bg-[#00E5FF] hover:bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl flex items-center justify-center gap-3 transition-all duration-500 shadow-2xl shadow-[#00E5FF]/20 active:scale-[0.98]"
                                >
                                    {isAdding ? (
                                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <ShoppingCart size={18} />
                                            Agregar al Arsenal
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleAddToCart(true)}
                                    disabled={availableSizes.length === 0}
                                    className="h-16 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl flex items-center justify-center gap-3 hover:bg-[#00E5FF] transition-all duration-500"
                                >
                                    Compra Express
                                    <ArrowUpRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Close Button */}
                <button
                    onClick={onClose}
                    className="sm:hidden absolute top-6 right-6 w-12 h-12 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white z-[80]"
                >
                    <X size={20} />
                </button>
            </motion.div>
        </motion.div>
    );
}
