'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ShoppingBag, MessageCircle, ShieldCheck, Truck, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/domain/entities/Product';
import { useCartStore } from '@/store/cart-store';
import { cartNotify } from '@/components/cart/CartNotificationSystem';

interface ProductQuickViewModalProps {
    product: Product | null;
    onClose: () => void;
}

export function ProductQuickViewModal({ product, onClose }: ProductQuickViewModalProps) {
    const addItem = useCartStore((state) => state.addItem);
    const setIsCartOpen = useCartStore((state) => state.setIsOpen);

    const [selectedImageIdx, setSelectedImageIdx] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [isAdding, setIsAdding] = useState(false);

    // Reset state on product change
    useEffect(() => {
        if (product) {
            setSelectedImageIdx(0);
            const sizes = Object.entries(product.stockBySize || {})
                .filter(([, stock]) => Number(stock) > 0)
                .map(([sz]) => sz);
            setSelectedSize(sizes[0] || '');
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [product]);

    // Handle Esc key
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        },
        [onClose]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    if (!product) return null;

    const images = product.images && product.images.length > 0 ? product.images : ['/hero.webp'];
    const availableSizes = Object.entries(product.stockBySize || {})
        .filter(([, stock]) => Number(stock) > 0)
        .map(([sz]) => sz)
        .sort((a, b) => Number(a) - Number(b));

    const handleAddToCart = () => {
        if (!selectedSize) return;

        setIsAdding(true);
        addItem(product as any, selectedSize, 1);

        cartNotify({
            type: 'added',
            title: 'Agregado al Carrito',
            message: `${product.name} (Talle AR ${selectedSize})`,
            productImage: images[0],
        });

        setTimeout(() => {
            setIsAdding(false);
            setIsCartOpen(true);
            onClose();
        }, 300);
    };

    const handleWhatsApp = () => {
        const sizeText = selectedSize ? ` en talle ${selectedSize}` : '';
        const msg = `Hola ÉTER Store, quiero consultar disponibilidad para comprar el modelo ${product.name}${sizeText} ($${product.basePrice.toLocaleString('es-AR')}).`;
        window.open(`https://wa.me/5492236204002?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const cuotaPrice = Math.round(product.basePrice / 3);
    const transferPrice = Math.round(product.basePrice * 0.9);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 md:p-8">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/80 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 15 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#080808] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(57,255,20,0.05)] text-white p-5 sm:p-8 z-10 custom-scrollbar"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        aria-label="Cerrar modal"
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 h-10 w-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                    >
                        <X size={18} />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                        {/* ── Left: Interactive Gallery ── */}
                        <div className="flex flex-col gap-4">
                            {/* Main Stage */}
                            <div className="relative aspect-square w-full rounded-2xl bg-gradient-to-b from-[#111111] to-[#0a0a0a] border border-white/5 overflow-hidden flex items-center justify-center p-6">
                                {/* Stock badge overlay */}
                                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#39FF14]/30 text-[10px] font-mono font-bold text-[#39FF14]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#39FF14] animate-pulse" />
                                    <span>STOCK FÍSICO MDQ</span>
                                </div>

                                <Image
                                    src={images[selectedImageIdx] || images[0]}
                                    alt={product.name}
                                    fill
                                    unoptimized
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-contain p-6 drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)] transition-all duration-500 hover:scale-105"
                                />

                                {/* Carousel Controls if multiple images */}
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={() =>
                                                setSelectedImageIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1))
                                            }
                                            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/90 transition-all"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <button
                                            onClick={() =>
                                                setSelectedImageIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0))
                                            }
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/90 transition-all"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Thumbnail strip */}
                            {images.length > 1 && (
                                <div className="flex gap-2.5 overflow-x-auto pb-1">
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImageIdx(idx)}
                                            className={`relative h-16 w-16 flex-shrink-0 rounded-xl bg-[#0f0f0f] border overflow-hidden transition-all ${
                                                selectedImageIdx === idx
                                                    ? 'border-[#39FF14] ring-1 ring-[#39FF14]'
                                                    : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
                                            }`}
                                        >
                                            <Image
                                                src={img}
                                                alt=""
                                                fill
                                                unoptimized
                                                className="object-contain p-1"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Trust badges */}
                            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-[10px] font-mono text-white/60">
                                <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white/[0.02] border border-white/5">
                                    <Truck size={14} className="text-[#39FF14] mb-1" />
                                    <span>24/48hs Envíos</span>
                                </div>
                                <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white/[0.02] border border-white/5">
                                    <ShieldCheck size={14} className="text-[#00E5FF] mb-1" />
                                    <span>Calidad Brasil</span>
                                </div>
                                <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white/[0.02] border border-white/5">
                                    <RefreshCw size={14} className="text-white/80 mb-1" />
                                    <span>Cambio Fácil</span>
                                </div>
                            </div>
                        </div>

                        {/* ── Right: Product Info & Actions ── */}
                        <div className="flex flex-col justify-between">
                            <div>
                                {/* Brand Tag */}
                                <div className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#39FF14] mb-1">
                                    {product.brand || 'ÉTER SELECT'}
                                </div>

                                {/* Title */}
                                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-tight mb-3">
                                    {product.name}
                                </h2>

                                {/* Pricing Breakdown */}
                                <div className="rounded-2xl bg-[#0e0e0e] border border-white/5 p-4 mb-6">
                                    <div className="flex items-baseline gap-3 mb-1.5">
                                        <span className="text-2xl sm:text-3xl font-mono font-black text-white">
                                            ${product.basePrice.toLocaleString('es-AR')}
                                        </span>
                                        <span className="text-xs font-mono font-bold text-[#39FF14] bg-[#39FF14]/10 px-2 py-0.5 rounded border border-[#39FF14]/20">
                                            LISTA OFICIAL
                                        </span>
                                    </div>
                                    <div className="text-xs font-mono text-white/60 space-y-0.5">
                                        <div>● Hasta <strong>3 cuotas fijas</strong> de ${cuotaPrice.toLocaleString('es-AR')}</div>
                                        <div className="text-[#39FF14]">● <strong>${transferPrice.toLocaleString('es-AR')}</strong> pagando por transferencia (10% OFF)</div>
                                    </div>
                                </div>

                                {/* Size Selector */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between text-xs font-mono mb-2.5">
                                        <span className="text-white/60 font-bold uppercase">Seleccioná tu Talle (AR):</span>
                                        {selectedSize && (
                                            <span className="text-[#39FF14] font-bold">Seleccionado: AR {selectedSize}</span>
                                        )}
                                    </div>

                                    {availableSizes.length > 0 ? (
                                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                            {availableSizes.map((sz) => (
                                                <button
                                                    key={sz}
                                                    onClick={() => setSelectedSize(sz)}
                                                    className={`h-11 rounded-xl text-xs font-mono font-bold uppercase transition-all duration-200 border ${
                                                        selectedSize === sz
                                                            ? 'bg-[#39FF14] border-[#39FF14] text-black font-black shadow-[0_0_15px_rgba(57,255,20,0.35)] scale-105'
                                                            : 'bg-[#121212] border-white/10 text-white/80 hover:border-white/30 hover:text-white'
                                                    }`}
                                                >
                                                    {sz}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-xs font-mono text-amber-400/80 bg-amber-400/10 p-3 rounded-xl border border-amber-400/20">
                                            Consultá talles disponibles directamente por WhatsApp.
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                {product.description && (
                                    <p className="text-xs text-white/60 font-normal leading-relaxed mb-6 line-clamp-3">
                                        {product.description}
                                    </p>
                                )}
                            </div>

                            {/* CTAs */}
                            <div className="space-y-2.5 pt-4 border-t border-white/5">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={!selectedSize || isAdding}
                                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#39FF14] py-3.5 px-6 text-xs sm:text-sm font-mono font-black uppercase tracking-widest text-black transition-all hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ShoppingBag size={16} />
                                    <span>{isAdding ? 'AGREGANDO...' : 'AGREGAR AL CARRITO'}</span>
                                </button>

                                <button
                                    onClick={handleWhatsApp}
                                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white/5 border border-white/10 py-3.5 px-6 text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-white hover:text-[#39FF14] hover:bg-white/10 hover:border-[#39FF14]/40 transition-all"
                                >
                                    <MessageCircle size={16} className="text-[#39FF14]" />
                                    <span>CONSULTAR / COMPRAR POR WHATSAPP</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
