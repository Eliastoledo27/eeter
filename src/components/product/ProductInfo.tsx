'use client'

import { useState } from 'react'
import { Heart, Share2, ShoppingCart, Shield, Package, Truck } from 'lucide-react'
import { ProductType } from '@/app/actions/products'
import { useCart } from '@/hooks/useCart'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface ProductInfoProps {
    product: ProductType
    hideOutboundLinks?: boolean
}

export function ProductInfo({ product, hideOutboundLinks }: ProductInfoProps) {
    const { addItem, openCart } = useCart()
    const [selectedSize, setSelectedSize] = useState<string | null>(null)
    const quantity = 1

    // Obtener talles disponibles del stock_by_size
    const availableSizes = Object.entries(product.stock_by_size || {})
        .filter(([, stock]) => stock > 0)
        .map(([size]) => size)
        .sort((a, b) => Number(a) - Number(b))

    const totalStock = Object.values(product.stock_by_size || {}).reduce((a, b) => a + b, 0)
    const isLowStock = totalStock < 10

    const handleAddToCart = () => {
        if (!selectedSize) {
            toast.error('Por favor seleccioná un talle');
            return;
        }

        // Convert ProductType back to Product entity for the store
        const productToCart: any = {
            id: product.id,
            name: product.name,
            description: product.description || '',
            category: product.category || 'General',
            basePrice: product.base_price,
            images: product.images,
            stockBySize: product.stock_by_size,
            totalStock: totalStock,
            status: 'active',
            createdAt: new Date(),
        };

        addItem(productToCart, selectedSize, quantity);

        toast.success('¡Producto agregado al carrito!', {
            action: {
                label: 'Ver carrito',
                onClick: () => openCart()
            }
        });
    };

    const handleBuyNow = () => {
        handleAddToCart()
        setTimeout(() => openCart(), 300)
    }

    return (
        <div className="sticky top-40 backdrop-blur-3xl bg-white/[0.03] rounded-[3rem] p-10 border border-white/5 space-y-10 shadow-2xl relative overflow-hidden">
            {/* Ambient Background Glow in Sidebar */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#CA8A04]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Brand & Name */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-[#CA8A04]/10 border border-[#CA8A04]/30 rounded-full text-[10px] font-bold text-[#CA8A04] tracking-[0.2em] uppercase">
                        {product.category || 'Premium Selection'}
                    </span>
                    <span className="text-[10px] font-mono text-gray-600 tracking-widest uppercase">STRICT_AUTH</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none uppercase">
                    {product.name}
                </h1>
                {isLowStock && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        <span className="text-rose-400 font-bold text-[10px] uppercase tracking-widest">Stock Limitado</span>
                    </motion.div>
                )}
            </div>

            {/* Price */}
            <div className="space-y-1">
                <div className="flex items-baseline gap-4">
                    <span className="text-6xl font-light text-white tracking-tighter">
                        ${product.base_price.toLocaleString('es-AR')}
                    </span>
                </div>
                <p className="text-[10px] font-mono text-gray-500 tracking-[0.2em] uppercase">IVA INCLUIDO / ENVÍO SIN CARGO</p>
            </div>

            {/* Size Selector */}
            {availableSizes.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Seleccionar Talle</label>
                        {!hideOutboundLinks && (
                            <Link href="/size-guide" className="text-[10px] text-[#CA8A04] hover:underline font-bold uppercase tracking-widest">Guía de talles</Link>
                        )}
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                        {availableSizes.map((size) => (
                            <button
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                className={`h-14 rounded-2xl font-mono font-bold text-sm transition-all duration-500 transform ${selectedSize === size
                                    ? 'bg-[#CA8A04] text-black shadow-[0_0_30px_rgba(202,138,4,0.3)] scale-105'
                                    : 'bg-white/5 border border-white/10 text-gray-400 hover:border-[#CA8A04]/50 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Description */}
            {product.description && (
                <div className="space-y-3">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Morfología y ADN</h3>
                    <p className="text-gray-400 text-sm leading-relaxed font-light">{product.description}</p>
                </div>
            )}

            {/* CTAs */}
            <div className="space-y-4 pt-6">
                <button
                    onClick={handleAddToCart}
                    disabled={availableSizes.length === 0}
                    className="w-full h-20 bg-white text-black font-black text-lg rounded-[1.5rem] hover:bg-[#CA8A04] transition-all duration-700 shadow-xl flex items-center justify-center gap-4 group disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-tighter"
                >
                    <ShoppingCart size={24} className="group-hover:scale-110 transition-transform" />
                    {availableSizes.length === 0 ? 'Sin Stock' : 'Añadir al Carrito'}
                </button>

                <button
                    onClick={handleBuyNow}
                    disabled={availableSizes.length === 0}
                    className="w-full h-20 border border-white/10 text-white font-bold text-lg rounded-[1.5rem] hover:bg-white/5 hover:border-white/20 transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-tighter"
                >
                    Comprar Ahora
                </button>
            </div>

            {/* Footer Features */}
            <div className="grid grid-cols-2 gap-4 pt-10 border-t border-white/5">
                {[
                    { label: 'CALIDAD_CERT', value: 'ÉTER ORIGINALS' },
                    { label: 'LOGÍSTICA_EST', value: 'PREMIUM_SECURE' }
                ].map((spec, idx) => (
                    <div key={idx} className="space-y-1">
                        <div className="text-[10px] text-gray-600 font-mono tracking-widest">{spec.label}</div>
                        <div className="text-xs text-white font-bold tracking-widest">{spec.value}</div>
                    </div>
                ))}
            </div>

            {/* Social Share */}
            <div className="flex items-center gap-4 pt-4">
                <button className="flex-1 h-12 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all flex items-center justify-center gap-2 group">
                    <Heart size={16} className="text-gray-500 group-hover:text-rose-500 transition-colors" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Deseados</span>
                </button>
                <button className="h-12 w-12 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all flex items-center justify-center group">
                    <Share2 size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                </button>
            </div>
        </div>
    )
}
