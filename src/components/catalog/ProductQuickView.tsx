'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Minus, ShoppingCart, Heart, Package, ShieldCheck, Truck, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
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

    const displayImages =
        product.images.length > 0
            ? product.images
            : ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200'];

    const handleAddToCart = () => {
        if (!selectedSize) {
            toast.error('Por favor seleccioná un talle');
            return;
        }

        setIsAdding(true);

        addItem({
            productId: Number(product.id),
            name: product.name,
            brand: product.category || 'Premium',
            image: displayImages[0],
            size: Number(selectedSize),
            color: 'Standard',
            price: product.base_price,
            quantity,
        });

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
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 z-50 w-10 h-10 bg-white/5 backdrop-blur-md hover:bg-rose-500/20 border border-white/10 hover:border-rose-400/30 rounded-full flex items-center justify-center transition-all group"
                >
                    <X className="text-gray-400 group-hover:text-rose-400 transition-colors" size={18} />
                </button>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-y-auto max-h-[90vh]">
                    {/* LEFT: Gallery */}
                    <div className="p-6 lg:p-8 space-y-4">
                        {/* Main Image */}
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5">
                            <Image
                                src={displayImages[selectedImage]}
                                fill
                                className="object-cover"
                                alt={product.name}
                                priority
                                sizes="50vw"
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

                            {/* Navigation Dots */}
                            {displayImages.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                    {displayImages.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(idx)}
                                            className={`w-2 h-2 rounded-full transition-all ${selectedImage === idx ? 'bg-[#ffd900] w-6' : 'bg-white/20 hover:bg-white/40'
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {displayImages.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {displayImages.slice(0, 4).map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedImage === idx
                                            ? 'border-[#ffd900] shadow-md shadow-[#ffd900]/10 scale-[1.02]'
                                            : 'border-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        <Image
                                            src={img}
                                            width={150}
                                            height={150}
                                            className="object-cover w-full h-full"
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
                        {/* Header */}
                        <div className="mb-6">
                            <p className="text-[10px] font-bold text-[#ffd900] uppercase tracking-[0.2em] mb-2">
                                Exclusive Edition
                            </p>
                            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white leading-tight mb-3">
                                {product.name}
                            </h2>

                            {/* Low Stock Warning */}
                            {isLowStock && (
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full">
                                    <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                                    <span className="text-rose-400 font-bold text-xs">
                                        Solo {totalStock} unidades disponibles
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Price */}
                        <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] mb-5">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                Precio Mayorista
                            </p>
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl md:text-4xl font-black text-[#ffd900]">
                                    ${product.base_price.toLocaleString('es-AR')}
                                </span>
                                <span className="text-sm text-gray-600 line-through">
                                    ${Math.round(product.base_price * 1.3).toLocaleString('es-AR')}
                                </span>
                            </div>
                        </div>

                        {/* Size Selector */}
                        {availableSizes.length > 0 && (
                            <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] mb-5">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">
                                        Seleccionar Talle
                                    </label>
                                    {selectedSize && (
                                        <span className="text-[10px] text-[#ffd900] font-bold flex items-center gap-1.5">
                                            <Check size={12} /> Talle {selectedSize}
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                                    {availableSizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`aspect-square rounded-xl font-bold text-sm transition-all duration-300 ${selectedSize === size
                                                ? 'bg-[#ffd900] text-black border-2 border-[#ffd900] shadow-lg shadow-[#ffd900]/15 scale-105'
                                                : 'bg-white/5 border border-white/10 text-gray-300 hover:border-[#ffd900]/30 hover:text-white hover:scale-105'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[9px] text-gray-600 mt-3 flex items-center gap-1.5">
                                    <Package size={11} />
                                    {availableSizes.length} talles disponibles
                                </p>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] mb-5">
                            <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider mb-3 block">
                                Cantidad
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1.5 border border-white/10">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 bg-white/5 hover:bg-[#ffd900]/10 rounded-lg border border-white/10 hover:border-[#ffd900]/30 transition-all flex items-center justify-center text-gray-400 hover:text-white"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="w-12 text-center font-black text-xl text-white">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-10 bg-white/5 hover:bg-[#ffd900]/10 rounded-lg border border-white/10 hover:border-[#ffd900]/30 transition-all flex items-center justify-center text-gray-400 hover:text-white"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] text-gray-600 uppercase tracking-wider">
                                        Subtotal
                                    </p>
                                    <p className="text-xl font-black text-[#ffd900]">
                                        ${(product.base_price * quantity).toLocaleString('es-AR')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] mb-6">
                                <h3 className="text-[10px] font-bold uppercase text-gray-500 tracking-wider mb-2">
                                    Descripción
                                </h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{product.description}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-auto space-y-3">
                            <button
                                onClick={handleAddToCart}
                                disabled={availableSizes.length === 0 || isAdding}
                                className="w-full py-4 bg-[#ffd900] text-black font-bold uppercase tracking-[0.2em] text-xs rounded-2xl transition-all duration-300 shadow-xl shadow-[#ffd900]/10 hover:bg-[#ffe033] hover:shadow-[#ffd900]/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                            >
                                {isAdding ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                        AGREGANDO...
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart size={18} />
                                        AGREGAR AL CARRITO
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleBuyNow}
                                disabled={availableSizes.length === 0}
                                className="w-full py-4 border-2 border-[#ffd900] text-[#ffd900] hover:bg-[#ffd900] hover:text-black font-bold uppercase tracking-[0.2em] text-xs rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                            >
                                COMPRAR AHORA
                            </button>

                            <div className="flex gap-3">
                                <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-rose-400/30 rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-bold text-gray-500 hover:text-rose-400">
                                    <Heart size={16} /> Favorito
                                </button>
                                <Link
                                    href={`/catalog/${product.id}`}
                                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#ffd900]/30 rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-bold text-gray-500 hover:text-[#ffd900]"
                                >
                                    Ver detalle →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
