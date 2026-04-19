'use client'

import { useState } from 'react'
import { Heart, Share2, ShoppingCart, Shield, Truck } from 'lucide-react'
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
    const { addItem, openCart, setCartStep } = useCart()
    const [selectedSize, setSelectedSize] = useState<string | null>(null)
    const quantity = 1

    const availableSizes = Object.entries(product.stock_by_size || {})
        .filter(([, stock]) => stock > 0)
        .map(([size]) => size)
        .sort((a, b) => Number(a) - Number(b))

    const totalStock = Object.values(product.stock_by_size || {}).reduce((a, b) => a + b, 0)

    const handleAddToCart = (silent = false) => {
        if (!selectedSize) {
            toast.error('Por favor seleccioná un talle');
            return false;
        }

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

        if (!silent) {
            toast.success('¡Producto agregado al carrito!', {
                action: {
                    label: 'Ver carrito',
                    onClick: () => {
                        setCartStep('items');
                        openCart();
                    }
                }
            });
        }
        return true;
    };

    const handleBuyNow = () => {
        const added = handleAddToCart(true);
        if (added) {
            setCartStep('checkout');
            setTimeout(() => openCart(), 0);
        }
    }

    return (
        <div className="sticky top-24 space-y-10 pb-12">
            {/* Category + Badge */}
            <div className="flex justify-between items-center">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[10px] font-black text-[#00E5FF] tracking-widest uppercase rounded-md shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                    {product.category || 'Sneakers'}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00E5FF]/50 drop-shadow-[0_0_5px_#00E5FF40]">
                    ÉTER NEON ARCHIVE
                </span>
            </div>

            {/* GIANT Price — flyer style */}
            <motion.div 
                initial={{ opacity: 0, x: 30 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative"
            >
                <div className="text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-none drop-shadow-[0_0_15px_rgba(0,229,255,0.15)]">
                    $ {product.base_price.toLocaleString('es-AR')}
                </div>
                <p className="text-xs mt-2 font-bold uppercase tracking-widest text-[#00E5FF]">
                    Hasta 3 cuotas sin interés
                </p>
            </motion.div>

            {/* Size Selector — Bold Grid */}
            {availableSizes.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase tracking-widest text-white/70">
                            Elegí tu talle
                        </label>
                        {!hideOutboundLinks && (
                            <Link href="/size-guide" className="text-[10px] uppercase tracking-widest text-[#00E5FF]/70 hover:text-[#00E5FF] transition-colors font-bold hover:drop-shadow-[0_0_8px_#00E5FF80]">
                                Guía de talles →
                            </Link>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2">
                        {availableSizes.map((size) => (
                            <button
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                className={`h-14 font-black text-sm transition-all duration-300 rounded-lg border-2 ${selectedSize === size
                                    ? 'bg-[#00E5FF] text-black border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.4)] scale-105'
                                    : 'bg-white/5 text-white/80 border-white/10 hover:border-[#00E5FF]/50 hover:text-white hover:shadow-[0_0_10px_rgba(0,229,255,0.1)]'
                                    }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* CTAs — Flyer Impact Buttons */}
            <div className="space-y-3 pt-4">
                <button
                    onClick={() => handleAddToCart()}
                    disabled={availableSizes.length === 0}
                    className="group relative w-full h-16 overflow-hidden rounded-xl transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:shadow-[0_0_30px_rgba(0,229,255,0.4)]"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00B3FF] to-[#00E5FF] group-hover:from-[#00E5FF] group-hover:to-[#50EFFF] transition-all" />
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-all" />
                    <div className="relative z-10 flex items-center justify-center gap-3 text-black font-black text-sm uppercase tracking-widest">
                        <ShoppingCart size={18} className="group-hover:scale-110 transition-transform" />
                        {availableSizes.length === 0 ? 'AGOTADO' : 'AGREGAR AL CARRITO'}
                    </div>
                </button>

                <button
                    onClick={handleBuyNow}
                    disabled={availableSizes.length === 0}
                    className="group w-full h-14 rounded-xl bg-transparent border-2 border-white/20 hover:border-[#00E5FF] hover:shadow-[inset_0_0_15px_rgba(0,229,255,0.2)] transition-all duration-300 text-white hover:text-[#00E5FF] font-black text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    COMPRAR AHORA →
                </button>
            </div>

            {/* Description */}
            {product.description && (
                <div className="space-y-5 pt-8 border-t border-white/10">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#00E5FF] drop-shadow-[0_0_5px_rgba(0,229,255,0.5)]">Detalles del Producto</h3>
                    
                    <div className="text-white/70 text-sm leading-relaxed font-light space-y-3">
                        {product.description.split('\n').map((line, i) => {
                            const isHeader = line.includes(':') || (line === line.toUpperCase() && line.length > 5);
                            if (!line.trim()) return <div key={i} className="h-2" />;
                            return (
                                <span key={i} className={`block ${isHeader ? 'font-black text-white tracking-wide text-xs uppercase mt-5 mb-1 flex items-center gap-2' : ''}`}>
                                    {isHeader && <div className="w-2 h-2 bg-[#00E5FF] rounded-sm shadow-[0_0_5px_#00E5FF80]" />}
                                    {line.replace(/\*/g, '')}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Trust Features */}
            <div className="grid grid-cols-2 gap-3 pt-8 border-t border-white/10">
                {[
                    { icon: Shield, label: 'Autenticidad', value: '100% Original' },
                    { icon: Truck, label: 'Envíos', value: 'Todo el país' }
                ].map((spec, idx) => (
                    <div key={idx} className="flex gap-3 items-center p-3 bg-gradient-to-r from-transparent to-[#00E5FF]/[0.02] hover:bg-[#00E5FF]/[0.05] transition-colors rounded-lg border border-white/5 hover:border-[#00E5FF]/20">
                        <div className="w-10 h-10 flex items-center justify-center bg-[#00E5FF]/10 rounded-lg shadow-[inset_0_0_10px_rgba(0,229,255,0.1)]">
                            <spec.icon size={16} className="text-[#00E5FF] drop-shadow-[0_0_3px_rgba(0,229,255,0.8)]" />
                        </div>
                        <div>
                            <div className="text-[10px] text-[#00E5FF]/80 uppercase tracking-widest font-bold">{spec.label}</div>
                            <div className="text-xs text-white font-bold">{spec.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Social */}
            <div className="flex items-center gap-3 pt-4">
                <button className="flex-1 h-12 bg-white/5 hover:bg-[#00E5FF]/10 border border-white/5 hover:border-[#00E5FF]/30 rounded-lg transition-all flex items-center justify-center gap-2 group hover:shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                    <Heart size={14} className="text-white/50 group-hover:text-[#00E5FF] transition-colors" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 group-hover:text-[#00E5FF]">Favoritos</span>
                </button>
                <button className="h-12 w-12 bg-white/5 hover:bg-[#00E5FF]/10 border border-white/5 hover:border-[#00E5FF]/30 rounded-lg transition-all flex items-center justify-center group hover:shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                    <Share2 size={14} className="text-white/50 group-hover:text-[#00E5FF] transition-colors" />
                </button>
            </div>
        </div>
    )
}
