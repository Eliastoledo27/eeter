'use client'

import { useEffect, useState } from 'react'
import { Heart, Share2, ShoppingCart, Shield, Truck, Zap, ChevronDown, Package, Clock, Star, ArrowRight, Check } from 'lucide-react'
import { ProductType } from '@/app/actions/products'
import { useCartStore } from '@/store/cart-store'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useAuraStore } from '@/hooks/useAuraStore'
import { Product } from '@/domain/entities/Product'
import { cn } from '@/lib/utils'
import { cartNotify } from '@/components/cart/CartNotificationSystem'

interface ProductInfoProps {
    product: ProductType
    hideOutboundLinks?: boolean
}

export function ProductInfo({ product, hideOutboundLinks }: ProductInfoProps) {
    const { addItem, toggleCart, setCartStep } = useCartStore()
    const trackView = useAuraStore((state) => state.trackView)
    const [selectedSize, setSelectedSize] = useState<string | null>(null)
    const [isDescOpen, setIsDescOpen] = useState(true)
    const [isLiked, setIsLiked] = useState(false)
    const quantity = 1

    useEffect(() => {
        trackView(product.id)
    }, [product.id, trackView])

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

        const productToCart: Product = {
            id: product.id,
            name: product.name,
            description: product.description || '',
            category: product.category || 'General',
            brand: '',
            basePrice: product.base_price,
            images: product.images,
            stockBySize: product.stock_by_size,
            totalStock: totalStock,
            status: 'active',
            createdAt: new Date(),
        };

        addItem(productToCart, selectedSize, quantity);

        if (!silent) {
            cartNotify({
                type: 'added',
                title: 'Producto agregado',
                productName: `${product.name} — Talle ${selectedSize}`,
                productImage: product.images?.[0],
            });
        }
        return true;
    };

    const handleBuyNow = () => {
        const added = handleAddToCart(true);
        if (added) {
            setCartStep('checkout');
            setTimeout(() => toggleCart(), 50);
        }
    }

    const descriptionSections = product.description ? product.description.split('\n').filter(l => l.trim()) : [];

    return (
        <div className="sticky top-24 pb-12">
            {/* Metadata Badge */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-black border border-[#00E5FF]/30 text-[9px] font-black text-[#00E5FF] tracking-[0.2em] uppercase rounded-full shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                        <Zap size={10} fill="currentColor" />
                        {product.category || 'Sneakers'}
                    </span>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={8} className="text-amber-500 fill-amber-500" />)}
                    </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10 italic">
                    CORE—ARCHIVE v.26
                </span>
            </div>

            {/* Title & Price Container */}
            <div className="mb-10 space-y-4">
                <motion.h1 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-[0.9]"
                >
                    {product.name}
                </motion.h1>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.1 }}
                    className="flex items-baseline gap-4"
                >
                    <span className="text-5xl font-black text-[#00E5FF] tracking-tighter italic shadow-sm">
                        ${product.base_price.toLocaleString('es-AR')}
                    </span>
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] line-through">
                        ${(product.base_price * 1.4).toLocaleString('es-AR')}
                    </span>
                </motion.div>

                <div className="flex items-center gap-4 py-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <Check size={12} className="text-emerald-500" />
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Stock Verificado</span>
                    </div>
                    {totalStock <= 10 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg animate-pulse">
                            <Clock size={12} className="text-amber-500" />
                            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Últimas Unidades</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Size Matrix */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">
                            Matriz de Talles
                        </label>
                    </div>
                    {!hideOutboundLinks && (
                        <Link href="/size-guide" className="text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-[#00E5FF] transition-all border-b border-white/5 pb-0.5">
                            Guía Técnica
                        </Link>
                    )}
                </div>
                
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                    {availableSizes.map((size) => (
                        <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={cn(
                                "aspect-square flex items-center justify-center font-black text-sm transition-all duration-300 rounded-xl border relative overflow-hidden",
                                selectedSize === size
                                    ? "bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.2)] scale-110 z-10"
                                    : "bg-white/[0.02] text-white/40 border-white/5 hover:border-white/20 hover:text-white"
                            )}
                        >
                            {size}
                            {selectedSize === size && (
                                <motion.div layoutId="size-glow" className="absolute inset-0 bg-[#00E5FF]/20 mix-blend-overlay" />
                            )}
                        </button>
                    ))}
                    {availableSizes.length === 0 && (
                        <div className="col-span-full py-4 text-center border border-white/5 rounded-2xl bg-white/[0.01]">
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Sin Stock Disponible</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Command Center */}
            <div className="flex flex-col gap-3 mb-10">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAddToCart()}
                    disabled={availableSizes.length === 0}
                    className="group h-16 bg-white text-black rounded-2xl flex items-center justify-center gap-4 font-black text-xs tracking-[0.3em] uppercase transition-all disabled:opacity-20 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00E5FF] to-[#00B3FF] translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                    <span className="relative z-10 flex items-center gap-3 group-hover:text-black transition-colors">
                        <ShoppingCart size={18} strokeWidth={2.5} />
                        Inyectar al Carrito
                    </span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(0, 229, 255, 0.1)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBuyNow}
                    disabled={availableSizes.length === 0}
                    className="h-14 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center gap-4 text-white/50 hover:text-[#00E5FF] hover:border-[#00E5FF]/30 font-black text-[10px] tracking-[0.3em] uppercase transition-all disabled:opacity-20 italic"
                >
                    <Zap size={16} />
                    Liquidación Inmediata
                </motion.button>
            </div>

            {/* Specs & Description Section */}
            <div className="space-y-1">
                <button 
                    onClick={() => setIsDescOpen(!isDescOpen)}
                    className="w-full flex items-center justify-between py-5 px-1 border-t border-white/5 group hover:bg-white/[0.01] transition-all"
                >
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 group-hover:text-white transition-colors">Detalles del Artefacto</span>
                    <ChevronDown size={14} className={cn("text-white/20 transition-transform duration-500", isDescOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                    {isDescOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                            className="overflow-hidden"
                        >
                            <div className="pb-8 pt-2 px-1 space-y-4">
                                {descriptionSections.length > 0 ? (
                                    descriptionSections.map((line, i) => (
                                        <p key={i} className="text-xs text-white/40 leading-relaxed font-medium tracking-tight">
                                            {line.replace(/\*/g, '')}
                                        </p>
                                    ))
                                ) : (
                                    <p className="text-xs text-white/20 italic">No hay descripción técnica disponible para este modelo.</p>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-3 gap-3 pb-8">
                                {[
                                    { icon: Shield, label: 'Original' },
                                    { icon: Truck, label: 'Envíos' },
                                    { icon: Package, label: 'Garantía' }
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                        <item.icon size={16} className="text-[#00E5FF]/40" />
                                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Social Matrix */}
            <div className="flex gap-2">
                <button 
                    onClick={() => setIsLiked(!isLiked)}
                    className={cn(
                        "flex-1 h-12 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all border",
                        isLiked 
                          ? "bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]" 
                          : "bg-white/[0.02] border-white/5 text-white/30 hover:text-white hover:border-white/20"
                    )}
                >
                    <Heart size={14} fill={isLiked ? "currentColor" : "none"} className={cn("transition-transform", isLiked && "scale-110")} />
                    Archivo Personal
                </button>
                <button 
                    onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copiado al clúster.') }}
                    className="w-12 h-12 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-center text-white/30 hover:text-white transition-all"
                >
                    <Share2 size={14} />
                </button>
            </div>
        </div>
    )
}
