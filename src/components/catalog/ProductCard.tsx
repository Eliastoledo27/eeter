'use client';

import Image from 'next/image';
import { Product } from '@/domain/entities/Product';
import Link from 'next/link';
import { ArrowRight, ShoppingCart, Zap, CheckCircle2, Maximize2, ShieldCheck, Box } from 'lucide-react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cart-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { cartNotify } from '@/components/cart/CartNotificationSystem';

interface ProductCardProps {
    product: Product;
    viewMode?: 'grid' | 'list';
    href?: string;
    index?: number;
    onProductClick?: (product: Product) => void;
    theme?: string;
}

/**
 * ProductCard - Premium High-End Dark Mode Component
 * Optimized for ÉTER Brand Identity (2026)
 */
export function ProductCard({ product, href, index = 0, onProductClick, theme = 'original' }: ProductCardProps) {
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const addItem = useCartStore((state) => state.addItem);
    const toggleCart = useCartStore((state) => state.toggleCart);

    // Dynamic Badges based on product metadata or index
    const isNew = index % 8 === 0;
    const isLimited = index % 12 === 3;

    // Memoized size processing for performance
    const availableSizes = useMemo(() => {
        return Object.entries(product.stockBySize || {})
            .filter(([, stock]) => Number(stock || 0) > 0)
            .sort(([a], [b]) => {
                const numA = parseInt(a);
                const numB = parseInt(b);
                if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                return a.localeCompare(b);
            });
    }, [product.stockBySize]);

    const getStockStatus = (size: string) => {
        const stock = product.stockBySize?.[size] || 0;
        if (stock === 0) return 'out';
        if (stock <= 3) return 'critical';
        if (stock <= 8) return 'low';
        return 'available';
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!selectedSize) {
            toast.error('SELECCIÓN REQUERIDA', {
                description: 'Por favor, inyecta un talle para continuar.',
                style: { background: '#0A0A0A', border: '1px solid rgba(255, 0, 0, 0.2)', color: '#fff' }
            });
            return;
        }

        setIsAdding(true);

        // Artificial delay for premium feedback feel
        setTimeout(() => {
            addItem(product, selectedSize, 1);
            setIsAdding(false);

            // Cart notification system
            cartNotify({
                type: 'added',
                title: 'Producto agregado',
                productName: `${product.name} — Talle ${selectedSize}`,
                productImage: product.images?.[0],
            });
        }, 800);
    };

    const cardStyles: Record<string, string> = {
        original: 'rounded-[1.75rem] md:rounded-[2.5rem] border border-white/5 bg-[#050505] hover:border-[#00E5FF]/30',
        minimal: 'rounded-none border border-zinc-900 bg-transparent hover:border-zinc-500',
        cyber: 'rounded-none border border-dashed border-zinc-900 bg-black/40 hover:border-emerald-500/30 font-mono',
        warm: 'rounded-2xl border border-white/5 bg-[#171615] hover:border-[#D39E82]/30 font-serif',
        swiss: 'rounded-none border-4 border-white bg-black hover:border-[#FF3B30] transition-colors duration-150',
        kinetic: 'rounded-none border border-white/10 bg-transparent hover:border-[#FFFF00]/50'
    };

    const brandStyles: Record<string, string> = {
        original: 'text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-white/40',
        minimal: 'text-[8px] md:text-[9px] font-medium uppercase tracking-[0.2em] text-zinc-600 font-sans',
        cyber: 'text-[8px] md:text-[9px] font-bold text-emerald-800 font-mono',
        warm: 'text-[8px] md:text-[9px] font-light uppercase tracking-[0.25em] text-[#8F9E8B] font-serif',
        swiss: 'text-[8px] md:text-[9px] font-black uppercase tracking-wider text-[#FF3B30] font-sans',
        kinetic: 'text-[8px] md:text-[9px] font-bold uppercase tracking-[0.4em] text-white/30 font-sans'
    };

    const titleStyles: Record<string, string> = {
        original: 'text-xs md:text-xl font-black uppercase tracking-tight text-white group-hover:text-[#00E5FF] transition-colors duration-500 leading-tight italic',
        minimal: 'text-xs md:text-lg font-normal tracking-tight text-white font-serif group-hover:text-zinc-400 transition-colors duration-300',
        cyber: 'text-xs md:text-lg font-bold tracking-widest text-emerald-400 font-mono group-hover:text-emerald-300 transition-colors duration-300 uppercase',
        warm: 'text-xs md:text-xl font-normal font-serif text-[#F5F2EB] group-hover:text-[#D39E82] transition-colors duration-400 leading-tight',
        swiss: 'text-xs md:text-xl font-black uppercase text-white font-sans group-hover:text-[#FF3B30] transition-colors duration-150 leading-none',
        kinetic: 'text-xs md:text-xl font-extrabold uppercase italic text-white font-sans group-hover:text-[#FFFF00] transition-colors duration-200 leading-none tracking-wider'
    };

    const pricePrefixStyles: Record<string, string> = {
        original: 'text-xs md:text-sm font-black text-[#00E5FF]',
        minimal: 'text-xs md:text-sm font-light text-zinc-500',
        cyber: 'text-xs md:text-sm font-bold text-emerald-500',
        warm: 'text-xs md:text-sm font-normal text-[#D39E82]',
        swiss: 'text-xs md:text-sm font-black text-[#FF3B30]',
        kinetic: 'text-xs md:text-sm font-bold text-[#FFFF00]'
    };

    const priceStyles: Record<string, string> = {
        original: 'text-lg md:text-2xl font-black tracking-tighter text-white italic',
        minimal: 'text-lg md:text-xl font-normal text-white',
        cyber: 'text-lg md:text-xl font-bold text-emerald-400 font-mono tracking-widest',
        warm: 'text-lg md:text-2xl font-normal font-serif text-[#F5F2EB] italic',
        swiss: 'text-lg md:text-2xl font-black text-white font-sans tracking-tight',
        kinetic: 'text-lg md:text-2xl font-black text-white font-sans tracking-widest italic'
    };

    const cartBtnStyles: Record<string, string> = {
        original: selectedSize
            ? "bg-[#00E5FF] text-black shadow-[0_0_40px_rgba(0,229,255,0.25)] rounded-xl md:rounded-[1.25rem]"
            : "bg-white/[0.03] text-white/10 border border-white/5 grayscale rounded-xl md:rounded-[1.25rem]",
        minimal: selectedSize
            ? "bg-white text-black rounded-none"
            : "bg-transparent text-zinc-700 border border-zinc-900 rounded-none",
        cyber: selectedSize
            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)] rounded-none"
            : "bg-transparent text-zinc-800 border border-zinc-900 rounded-none",
        warm: selectedSize
            ? "bg-[#D39E82] text-[#121110] rounded-xl"
            : "bg-white/[0.02] text-zinc-600 border border-white/5 rounded-xl",
        swiss: selectedSize
            ? "bg-[#FF3B30] text-white border-2 border-[#FF3B30] rounded-none"
            : "bg-transparent text-white/20 border-2 border-white/20 rounded-none",
        kinetic: selectedSize
            ? "bg-[#FFFF00] text-black rounded-none"
            : "bg-transparent text-white/10 border border-white/10 rounded-none"
    };

    const outlineBtnStyles: Record<string, string> = {
        original: 'bg-black/60 border-white/10 text-white/60 hover:text-[#00E5FF] hover:border-[#00E5FF]/40',
        minimal: 'bg-black/85 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-500 rounded-none',
        cyber: 'bg-black/85 border-zinc-900 text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/30 rounded-none font-mono',
        warm: 'bg-black/70 border-white/5 text-zinc-400 hover:text-[#D39E82] hover:border-[#D39E82]/30 rounded-xl',
        swiss: 'bg-black border-2 border-white text-white hover:border-[#FF3B30] hover:text-[#FF3B30] rounded-none',
        kinetic: 'bg-black border border-white/20 text-white hover:border-[#FFFF00] hover:text-[#FFFF00] rounded-none'
    };

    const imageWrapperStyles: Record<string, string> = {
        original: 'rounded-[1.25rem] md:rounded-[2rem] border border-white/[0.03]',
        minimal: 'rounded-none border border-zinc-900',
        cyber: 'rounded-none border border-zinc-950',
        warm: 'rounded-xl border border-white/[0.02]',
        swiss: 'rounded-none border-4 border-white',
        kinetic: 'rounded-none border border-white/10'
    };

    return (
        <motion.div
            layout
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.05, ease: [0.23, 1, 0.32, 1] }}
            style={{ willChange: 'transform' }}
            className={cn(
                "group relative flex flex-col h-full overflow-hidden p-2.5 md:p-3 transition-all duration-700",
                cardStyles[theme] || cardStyles.original
            )}
        >
            {/* Glassmorphism Background Effects */}
            {theme === 'original' && (
                <>
                    <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-50 pointer-events-none" />
                    <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#00E5FF]/5 blur-[90px] transition-all duration-1000 group-hover:bg-[#00E5FF]/10 group-hover:scale-125 pointer-events-none" />
                    <div className="texture-grain absolute inset-0 opacity-10 pointer-events-none" />
                </>
            )}

            {/* Media Content Wrapper */}
            <div className={cn(
                "relative z-10 w-full mb-3 md:mb-6 aspect-[4/5] overflow-hidden bg-[#0A0A0A]",
                imageWrapperStyles[theme] || imageWrapperStyles.original
            )}>
                {/* Tactical Status Badges */}
                {theme === 'original' && (
                    <div className="absolute left-4 top-4 z-30 flex flex-col gap-2">
                        <AnimatePresence>
                            {isNew && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-2 rounded-full border border-[#00E5FF]/30 bg-black/80 px-3 py-1.5 backdrop-blur-xl"
                                >
                                    <div className="h-1 w-1 rounded-full bg-[#00E5FF] animate-pulse" />
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#00E5FF]">New Deployment</span>
                                </motion.div>
                            )}
                            {index % 12 === 3 && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-black/80 px-3 py-1.5 backdrop-blur-xl"
                                >
                                    <Zap size={10} className="text-amber-500" fill="currentColor" />
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-500">Limited Edition</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* Actions Overlay Controls */}
                <div className="absolute right-4 top-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col gap-2">
                    <button
                        className={cn(
                            "h-10 w-10 flex items-center justify-center border backdrop-blur-md transition-all",
                            outlineBtnStyles[theme] || outlineBtnStyles.original
                        )}
                        aria-label="Vista rápida"
                    >
                        <Maximize2 size={16} />
                    </button>
                </div>

                <Link
                    href={href || `/catalog/${product.id}`}
                    onClick={() => onProductClick?.(product)}
                    className="block w-full h-full cursor-pointer relative"
                >
                    <Image
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=700&h=700&fit=crop'}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                        priority={index < 6}
                    />

                    {/* View Details Immersive Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-end p-6">
                        <span className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white">
                            Explorar <ArrowRight size={14} className="text-white/60" />
                        </span>
                    </div>
                </Link>
            </div>

            {/* Product Structural Data */}
            <div className="relative z-10 flex flex-col flex-1 px-1 pb-1 md:px-3 md:pb-2">
                <div className="mb-3 md:mb-6">
                    <div className="flex items-center justify-between mb-0.5 md:mb-1">
                        <div className="flex items-center gap-2">
                            <Box size={10} className="text-white/10" />
                            <p className={brandStyles[theme] || brandStyles.original}>
                                {product.brand || (theme === 'original' ? 'ÉTER ORIGINAL' : 'PREMIUM ARCHIVE')}
                            </p>
                        </div>
                        {theme === 'original' && <div className="h-1.5 w-1.5 rounded-full bg-white/10" />}
                    </div>
                    <h3 className={titleStyles[theme] || titleStyles.original}>
                        {product.name}
                    </h3>
                </div>

                {/* Size Selection Matrix */}
                <div className="mb-4 md:mb-8">
                    <div className="flex items-center justify-between mb-2 md:mb-4 px-1 min-h-[16px]">
                        <span className={cn(
                            "text-[10px] font-black uppercase tracking-[0.25em] text-white/30 hidden md:block",
                            theme === 'cyber' ? 'font-mono text-emerald-700' : '',
                            theme === 'warm' ? 'font-serif text-zinc-500' : ''
                        )}>
                            Matriz de Talles
                        </span>
                        <AnimatePresence mode="wait">
                            {selectedSize && (
                                <motion.span
                                    initial={{ opacity: 0, x: 5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -5 }}
                                    className={cn(
                                        "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                                        getStockStatus(selectedSize) === 'critical' ? 'bg-red-500/10 text-red-500' : 'bg-white/10 text-white'
                                    )}
                                >
                                    {getStockStatus(selectedSize) === 'critical' ? '¡ÚLTIMA!' : 'EN STOCK'}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex flex-wrap gap-1 md:grid md:grid-cols-5 md:gap-2">
                        {availableSizes.length > 0 ? (
                            availableSizes.map(([size, stock]) => {
                                const status = getStockStatus(size);
                                const isSelected = selectedSize === size;

                                return (
                                    <button
                                        key={size}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (status !== 'out') setSelectedSize(isSelected ? null : size);
                                        }}
                                        disabled={status === 'out'}
                                        className={cn(
                                            "relative flex items-center justify-center rounded-lg md:rounded-xl border text-[9px] md:text-[10px] font-black transition-all duration-300 h-7 w-7 md:h-auto md:aspect-square",
                                            theme === 'minimal' || theme === 'cyber' || theme === 'swiss' || theme === 'kinetic' ? 'rounded-none' : '',
                                            status === 'out'
                                                ? 'opacity-10 cursor-not-allowed border-white/5 grayscale'
                                                : isSelected
                                                ? theme === 'swiss'
                                                    ? 'bg-[#FF3B30] text-white border-[#FF3B30] scale-105 z-20'
                                                    : theme === 'cyber'
                                                    ? 'bg-emerald-500/30 text-emerald-400 border-emerald-500 scale-105 z-20 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                                                    : theme === 'kinetic'
                                                    ? 'bg-[#FFFF00] text-black border-[#FFFF00] scale-105 z-20'
                                                    : 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-105 z-20'
                                                : theme === 'cyber'
                                                ? 'bg-transparent border-zinc-900 text-zinc-500 hover:border-emerald-500/40 hover:text-emerald-400 font-mono'
                                                : 'bg-white/[0.02] border-white/5 text-white/40 hover:border-white/40 hover:text-white'
                                        )}
                                    >
                                        {size}
                                        {status === 'critical' && !isSelected && (
                                            <div className="absolute top-1 right-1 h-1 w-1 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
                                        )}
                                        {isSelected && (
                                            <motion.div
                                                layoutId={`active-size-${product.id}`}
                                                className="absolute inset-0 bg-white/5 mix-blend-overlay pointer-events-none rounded-xl"
                                            />
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-500/80 px-1 py-1.5">
                                Agotado / Sin stock
                            </span>
                        )}
                    </div>
                </div>

                {/* Pricing & Deployment Hub */}
                <div className="mt-auto pt-3 md:pt-6 flex items-center justify-between border-t border-white/5">
                    <div className="flex flex-col">
                        {theme === 'original' && (
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-1 hidden md:block">
                                Valuación
                            </span>
                        )}
                        <div className="flex items-baseline gap-0.5 md:gap-1.5">
                            <span className={pricePrefixStyles[theme] || pricePrefixStyles.original}>$</span>
                            <span className={priceStyles[theme] || priceStyles.original}>
                                {product.basePrice.toLocaleString('es-AR')}
                            </span>
                        </div>
                    </div>

                    <motion.button
                        whileHover={selectedSize ? { scale: 1.05 } : {}}
                        whileTap={selectedSize ? { scale: 0.95 } : {}}
                        onClick={handleAddToCart}
                        disabled={!selectedSize || isAdding}
                        className={cn(
                            "relative flex h-10 w-10 md:h-14 md:w-14 items-center justify-center transition-all duration-500 overflow-hidden shrink-0",
                            cartBtnStyles[theme] || cartBtnStyles.original
                        )}
                        aria-label="Añadir al carrito"
                    >
                        <AnimatePresence mode="wait">
                            {isAdding ? (
                                <motion.div
                                    key="adding"
                                    initial={{ opacity: 0, rotate: -180 }}
                                    animate={{ opacity: 1, rotate: 0 }}
                                    exit={{ opacity: 0, rotate: 180 }}
                                    className="h-4 w-4 md:h-5 md:w-5 border-2 border-black/30 border-t-black rounded-full animate-spin"
                                />
                            ) : (
                                <motion.div
                                    key="cart"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center justify-center"
                                >
                                    <ShoppingCart className="h-4 w-4 md:h-[22px] md:w-[22px]" strokeWidth={2.5} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Glow Animation on Clickable */}
                        {selectedSize && !isAdding && (
                            <motion.div
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute inset-0 bg-white/20 blur-xl pointer-events-none"
                            />
                        )}
                    </motion.button>
                </div>
            </div>

            {/* Glossy Interactive Filter */}
            {theme === 'original' && (
                <div className="absolute inset-0 z-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
            )}

            {/* Visual Continuity Label */}
            {theme === 'original' && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                    <ShieldCheck size={10} className="text-[#00E5FF]/40" />
                    <span className="text-[7px] font-black uppercase tracking-[0.4em] text-white/20 whitespace-nowrap">Authentic Archive Series</span>
                </div>
            )}
        </motion.div>
    );
}
