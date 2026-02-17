'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Minus, ShoppingCart, Heart, Package, ShieldCheck, Truck, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProductType } from '@/app/actions/products';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

interface ProductQuickViewProps {
    product: ProductType;
    onClose: () => void;
}

export function ProductQuickView({ product, onClose }: ProductQuickViewProps) {
    const { addItem, openCart } = useCart();
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
        .filter(([, stock]) => stock > 0)
        .map(([size]) => size)
        .sort((a, b) => Number(a) - Number(b));

    const totalStock = Object.values(product.stock_by_size || {}).reduce((a, b) => a + b, 0);
    const isLowStock = totalStock < 10 && totalStock > 0;

    const displayImages = Array.from(new Set(
        product.images && product.images.length > 0
            ? product.images
            : ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200']
    ));

    const handleAddToCart = () => {
        if (!selectedSize) {
            toast.error('Por favor seleccioná un talle');
            return;
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
            toast.success('¡Producto agregado!', {
                description: `${quantity}x ${product.name} - Talle ${selectedSize}`,
                action: {
                    label: 'Ver carrito',
                    onClick: () => {
                        onClose();
                        openCart();
                    },
                },
            });
        }, 500);
    };

    const handleBuyNow = () => {
        handleAddToCart();
        setTimeout(() => {
            onClose();
            openCart();
        }, 800);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-xl"
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-5xl max-h-[90vh] bg-[#111]/95 backdrop-blur-3xl rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl shadow-black/60"
            >
                {/* Header / Close Controller */}
                <div className="absolute top-0 left-0 right-0 z-[60] p-6 md:p-8 flex justify-between items-center pointer-events-none">
                    <div className="flex items-center gap-4 bg-black/80 backdrop-blur-3xl px-5 py-2.5 rounded-[1.5rem] border border-white/10 pointer-events-auto shadow-2xl">
                        <div className="relative">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#ffd900] animate-pulse" />
                            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-[#ffd900] animate-ping opacity-30" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">
                                Vista_Rápida
                            </span>
                            <span className="text-[7px] font-mono text-gray-500 uppercase tracking-widest">
                                Protocolo_Core // v2.6.4
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="group flex items-center gap-4 bg-white/5 hover:bg-rose-500/20 backdrop-blur-3xl border border-white/10 hover:border-rose-500/30 px-6 py-3 rounded-[1.5rem] transition-all duration-700 pointer-events-auto relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-rose-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 group-hover:text-rose-400 transition-colors">
                                Desconectar
                            </span>
                            <span className="text-[7px] font-mono text-gray-600 group-hover:text-rose-500/60 uppercase">
                                Cerrar_Acceso
                            </span>
                        </div>
                        <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:bg-rose-500/20 group-hover:scale-110 transition-all">
                            <X className="text-gray-400 group-hover:text-rose-400" size={18} />
                        </div>
                    </button>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-y-auto max-h-[90vh]">
                    {/* LEFT: Gallery */}
                    <div className="p-6 lg:p-8 space-y-4">
                        {/* Main Image Stage */}
                        <div className="relative aspect-square md:rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.03] to-transparent border-b md:border border-white/5">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedImage}
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                    className="relative w-full h-full"
                                >
                                    <Image
                                        src={displayImages[selectedImage]}
                                        fill
                                        className="object-cover"
                                        alt={product.name}
                                        priority
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </motion.div>
                            </AnimatePresence>

                            {/* Kinetic Image Scan Line */}
                            <motion.div
                                initial={{ top: '0%' }}
                                animate={{ top: '100%' }}
                                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#ffd900]/40 to-transparent z-[31] pointer-events-none"
                            />

                            {/* Badges */}
                            <div className="absolute top-4 left-4 flex items-center gap-2">
                                <span className="bg-[#ffd900]/90 backdrop-blur px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] text-black">
                                    {product.category || 'General'}
                                </span>
                                {totalStock > 0 && (
                                    <span className="bg-white/10 backdrop-blur px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] text-white border border-white/20">
                                        Stock Real
                                    </span>
                                )}
                            </div>

                            {/* Navigation Dots (Always visible on mobile, dots only on desktop if dots > 1) */}
                            {displayImages.length > 1 && (
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 z-30">
                                    {displayImages.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(idx)}
                                            className={`h-1.5 rounded-full transition-all duration-500 ${selectedImage === idx ? 'bg-[#ffd900] w-6' : 'bg-white/20 w-1.5'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Thumbnails - Optimized for Mobile Horizontal Scroll */}
                        {displayImages.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth px-2 py-1 md:grid md:grid-cols-4 md:px-0">
                                {displayImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`relative w-20 h-20 md:w-full md:aspect-square shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-500 ${selectedImage === idx
                                            ? 'border-[#ffd900] shadow-glow scale-[1.05]'
                                            : 'border-white/5 opacity-50 hover:opacity-100'
                                            }`}
                                    >
                                        <Image
                                            src={img}
                                            fill
                                            className="object-cover"
                                            alt={`Vista ${idx + 1}`}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { icon: ShieldCheck, label: 'Autenticidad', desc: 'Verificada Éter' },
                                { icon: Package, label: 'Envío MDQ', desc: 'A todo el país' },
                                { icon: Truck, label: '48-72hs', desc: 'Despacho ágil' },
                            ].map((badge, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white/[0.03] rounded-xl p-3 text-center border border-white/[0.08]"
                                >
                                    <badge.icon className="mx-auto mb-1.5 text-[#ffd900]" size={18} />
                                    <p className="text-[9px] font-bold text-white uppercase tracking-wider">
                                        {badge.label}
                                    </p>
                                    <p className="text-[8px] text-gray-500 mt-0.5">{badge.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Product Info */}
                    <div className="p-6 lg:p-8 flex flex-col bg-white/[0.02] border-l border-white/5">
                        {/* Product Header / Identity */}
                        <div className="mb-10 mt-8 lg:mt-0">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-[#ffd900] text-black text-[9px] font-black uppercase px-2 py-1 rounded-sm transform -skew-x-12">
                                    {product.category || 'Limited Edition'}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">
                                    Archivo_2026
                                </span>
                            </div>

                            <h2 className="font-heading text-3xl md:text-5xl font-black text-white leading-none tracking-tighter uppercase mb-6 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/60 transition-all">
                                {product.name}
                            </h2>

                            {/* Status Bar: High Density */}
                            <div className="flex flex-wrap gap-3">
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${totalStock > 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${totalStock > 0 ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 animate-pulse'}`} />
                                    <span className={`text-[8px] font-black uppercase tracking-widest ${totalStock > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {totalStock > 0 ? 'Sinc_Stock: OK' : 'Stock_Agotado'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                                    <ShieldCheck size={12} className="text-[#ffd900]" />
                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                                        Auth_Origen: VERIFICADO
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#ffd900]/5 border border-[#ffd900]/10 rounded-xl">
                                    <span className="text-[8px] font-mono text-[#ffd900]/60 uppercase">
                                        Ref: #{product.id.split('-')[0].toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Price & Summary */}
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-1">Inversión</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl md:text-5xl font-black text-[#ffd900] tracking-tighter">
                                        ${product.base_price.toLocaleString('es-AR')}
                                    </span>
                                    <span className="text-sm text-gray-600 font-medium line-through decoration-rose-500/50">
                                        ${Math.round(product.base_price * 1.3).toLocaleString('es-AR')}
                                    </span>
                                </div>
                            </div>
                            {totalStock > 0 && totalStock < 10 && (
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest animate-pulse">Últimas</span>
                                    <span className="text-2xl font-black text-rose-500 tracking-tighter">{totalStock}</span>
                                </div>
                            )}
                        </div>

                        {/* Size Selection Grid */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Escala de Talles</span>
                                {selectedSize && (
                                    <motion.span
                                        initial={{ opacity: 0, x: 5 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-[10px] font-black text-[#ffd900] uppercase tracking-widest"
                                    >
                                        Sel: {selectedSize}
                                    </motion.span>
                                )}
                            </div>
                            <div className="grid grid-cols-5 gap-2">
                                {availableSizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`h-12 flex items-center justify-center rounded-xl text-xs font-black transition-all duration-300 border
                                            ${selectedSize === size
                                                ? 'bg-[#ffd900] border-[#ffd900] text-black shadow-glow scale-[1.05]'
                                                : 'bg-white/5 border-white/10 text-gray-300 hover:border-[#ffd900]/30 hover:bg-white/10'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions & Quantity */}
                        <div className="mt-auto space-y-4 pt-8 border-t border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center bg-white/5 rounded-2xl p-1 border border-white/10">
                                    <button
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-[#ffd900] transition-colors"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="w-10 text-center font-black text-lg">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(q => q + 1)}
                                        className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-[#ffd900] transition-colors"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>

                                <button className="flex-1 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 hover:border-rose-500/30 transition-all text-gray-500 hover:text-rose-500">
                                    <Heart size={20} />
                                    <span className="ml-3 text-[10px] font-black uppercase tracking-widest hidden md:inline">Favoritos</span>
                                </button>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={isAdding || availableSizes.length === 0}
                                    className="flex-[3] h-16 bg-[#ffd900] hover:bg-[#ffe033] disabled:opacity-30 text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-[#ffd900]/10"
                                >
                                    {isAdding ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                            className="w-5 h-5 border-3 border-black border-t-transparent rounded-full"
                                        />
                                    ) : (
                                        <>
                                            <ShoppingCart size={18} />
                                            AGREGAR AL ARSENAL
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    disabled={availableSizes.length === 0}
                                    className="flex-[2] h-16 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all"
                                >
                                    COMPRA FLASH
                                </button>
                            </div>

                            <Link
                                href={`/catalog/${product.id}`}
                                className="block w-full py-4 text-[9px] font-black uppercase tracking-[0.5em] text-gray-700 hover:text-[#ffd900] transition-colors text-center"
                            >
                                / ver_archivo_completo
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
