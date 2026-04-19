'use client'

import { useState } from 'react'
import { Heart, Share2, ShoppingCart, Shield, Truck, Zap, Star, ChevronDown, Package, Clock } from 'lucide-react'
import { ProductType } from '@/app/actions/products'
import { useCart } from '@/hooks/useCart'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface ProductInfoProps {
    product: ProductType
    hideOutboundLinks?: boolean
}

export function ProductInfo({ product, hideOutboundLinks }: ProductInfoProps) {
    const { addItem, openCart, setCartStep } = useCart()
    const [selectedSize, setSelectedSize] = useState<string | null>(null)
    const [isDescOpen, setIsDescOpen] = useState(false)
    const [isLiked, setIsLiked] = useState(false)
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

    // Parse description into sections
    const descriptionSections = product.description ? product.description.split('\n').filter(l => l.trim()) : [];

    return (
        <div className="sticky top-24 pb-12">
            {/* Top Bar: Category + Archive */}
            <div className="flex justify-between items-center mb-5">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[9px] font-black text-[#00E5FF] tracking-[0.2em] uppercase rounded-lg">
                    <Zap size={10} />
                    {product.category || 'Sneakers'}
                </span>
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">
                    ÉTER ARCHIVE
                </span>
            </div>

            {/* Price Block */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, delay: 0.15 }}
                className="mb-6"
            >
                <div className="flex items-end gap-3">
                    <span className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none">
                        ${product.base_price.toLocaleString('es-AR')}
                    </span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] font-bold text-[#00E5FF] uppercase tracking-wider flex items-center gap-1.5">
                        <CreditCardIcon />
                        Hasta 3 cuotas sin interés
                    </span>
                    {totalStock <= 5 && totalStock > 0 && (
                        <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider animate-pulse flex items-center gap-1">
                            <Clock size={10} />
                            ¡Últimas {totalStock} unidades!
                        </span>
                    )}
                </div>
            </motion.div>

            {/* Size Selector */}
            {availableSizes.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="mb-6"
                >
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
                            {selectedSize ? `Talle seleccionado: ${selectedSize}` : 'Elegí tu talle'}
                        </label>
                        {!hideOutboundLinks && (
                            <Link href="/size-guide" className="text-[9px] uppercase tracking-widest text-[#00E5FF]/60 hover:text-[#00E5FF] transition-colors font-bold">
                                Guía →
                            </Link>
                        )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        {availableSizes.map((size) => (
                            <motion.button
                                key={size}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedSize(size)}
                                className={`h-12 min-w-[3.2rem] px-4 font-black text-sm transition-all duration-300 rounded-xl border-2 ${selectedSize === size
                                    ? 'bg-[#00E5FF] text-black border-[#00E5FF] shadow-[0_0_25px_rgba(0,229,255,0.35)] scale-105'
                                    : 'bg-white/[0.03] text-white/70 border-white/10 hover:border-[#00E5FF]/40 hover:text-white'
                                    }`}
                            >
                                {size}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* CTA Buttons */}
            <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="space-y-2.5 mb-6"
            >
                <button
                    onClick={() => handleAddToCart()}
                    disabled={availableSizes.length === 0}
                    className="group relative w-full h-14 overflow-hidden rounded-xl transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_25px_rgba(0,229,255,0.2)] hover:shadow-[0_0_40px_rgba(0,229,255,0.35)] active:scale-[0.98]"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00B3FF] to-[#00E5FF] group-hover:from-[#00E5FF] group-hover:to-[#50EFFF] transition-all duration-500" />
                    <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.15)_50%,transparent_75%)] bg-[length:300%_100%] group-hover:animate-[shimmer_1.5s_ease-in-out]" />
                    <div className="relative z-10 flex items-center justify-center gap-3 text-black font-black text-xs uppercase tracking-[0.2em]">
                        <ShoppingCart size={17} className="group-hover:scale-110 transition-transform" />
                        {availableSizes.length === 0 ? 'AGOTADO' : 'AGREGAR AL CARRITO'}
                    </div>
                </button>

                <button
                    onClick={handleBuyNow}
                    disabled={availableSizes.length === 0}
                    className="group w-full h-12 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#00E5FF]/40 hover:bg-[#00E5FF]/[0.05] transition-all duration-300 text-white/80 hover:text-[#00E5FF] font-black text-[10px] uppercase tracking-[0.2em] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <Zap size={13} />
                    COMPRAR AHORA
                </button>
            </motion.div>

            {/* Description — Collapsible Premium Card */}
            {product.description && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 }}
                    className="mb-6"
                >
                    <button 
                        onClick={() => setIsDescOpen(!isDescOpen)}
                        className="w-full flex items-center justify-between py-4 border-t border-b border-white/5 group"
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full shadow-[0_0_8px_#00E5FF]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/80 group-hover:text-[#00E5FF] transition-colors">
                                Detalles del Producto
                            </span>
                        </div>
                        <ChevronDown size={14} className={`text-white/30 transition-transform duration-300 ${isDescOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isDescOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="py-5 space-y-3">
                                    {descriptionSections.map((line, i) => {
                                        const trimmed = line.trim();
                                        const isHeader = trimmed.includes(':') && !trimmed.startsWith('•') && !trimmed.startsWith('-') && trimmed.length < 60;
                                        const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('▸');
                                        
                                        if (isHeader) {
                                            return (
                                                <div key={i} className="flex items-center gap-2 mt-4 mb-1">
                                                    <div className="w-6 h-px bg-[#00E5FF]/40" />
                                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#00E5FF]/80">{trimmed.replace(/\*/g, '')}</span>
                                                </div>
                                            );
                                        }

                                        if (isBullet) {
                                            return (
                                                <div key={i} className="flex items-start gap-2.5 pl-2">
                                                    <div className="w-1 h-1 bg-[#00E5FF]/40 rounded-full mt-1.5 shrink-0" />
                                                    <p className="text-white/50 text-xs leading-relaxed">{trimmed.replace(/^[•\-▸]\s*/, '').replace(/\*/g, '')}</p>
                                                </div>
                                            );
                                        }

                                        return (
                                            <p key={i} className="text-white/50 text-xs leading-relaxed pl-2">{trimmed.replace(/\*/g, '')}</p>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Trust Features — Compact Icons */}
            <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                    { icon: Shield, label: '100% Original' },
                    { icon: Truck, label: 'Envío Nacional' },
                    { icon: Package, label: '24hs Despacho' },
                ].map((spec, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1.5 py-3 bg-white/[0.02] border border-white/5 rounded-xl hover:border-[#00E5FF]/15 transition-all group">
                        <spec.icon size={15} className="text-[#00E5FF]/50 group-hover:text-[#00E5FF] transition-colors" />
                        <span className="text-[7px] font-black uppercase tracking-[0.15em] text-white/30 group-hover:text-white/50 transition-colors text-center leading-tight">{spec.label}</span>
                    </div>
                ))}
            </div>

            {/* Social — Compact */}
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => { setIsLiked(!isLiked); toast.success(isLiked ? 'Eliminado de favoritos' : '¡Agregado a favoritos!') }}
                    className={`flex-1 h-10 border rounded-lg transition-all flex items-center justify-center gap-2 group text-[9px] font-black uppercase tracking-widest ${
                        isLiked ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/[0.02] border-white/5 hover:border-[#00E5FF]/20 text-white/30 hover:text-white/50'
                    }`}
                >
                    <Heart size={12} fill={isLiked ? 'currentColor' : 'none'} />
                    {isLiked ? 'Favorito' : 'Favoritos'}
                </button>
                <button 
                    onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('¡Link copiado!') }}
                    className="h-10 w-10 bg-white/[0.02] border border-white/5 hover:border-[#00E5FF]/20 rounded-lg transition-all flex items-center justify-center group"
                >
                    <Share2 size={12} className="text-white/30 group-hover:text-white/50 transition-colors" />
                </button>
            </div>
        </div>
    )
}

// Tiny credit card icon inline
function CreditCardIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
    );
}
