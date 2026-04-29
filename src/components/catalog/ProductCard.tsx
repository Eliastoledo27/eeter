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

interface ProductCardProps {
    product: Product;
    viewMode?: 'grid' | 'list';
    href?: string;
    index?: number;
    onProductClick?: (product: Product) => void;
}

/**
 * ProductCard - Premium High-End Dark Mode Component
 * Optimized for ÉTER Brand Identity (2026)
 */
export function ProductCard({ product, href, index = 0, onProductClick }: ProductCardProps) {
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
            
            toast.success('PROTOCOLO COMPLETADO', {
                description: `${product.name} (Talle ${selectedSize}) añadido al clúster.`,
                icon: <CheckCircle2 className="text-[#00E5FF]" size={16} />,
                action: {
                    label: 'VER CARRITO',
                    onClick: () => toggleCart()
                },
                style: { 
                    background: '#050505', 
                    color: '#fff',
                    border: '1px solid rgba(0, 229, 255, 0.2)',
                    borderRadius: '1.25rem'
                }
            });
        }, 800);
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
            className="group relative flex flex-col h-full overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#050505] p-3 transition-all duration-700 hover:border-[#00E5FF]/30"
        >
            {/* Glassmorphism Background Effects */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-50 pointer-events-none" />
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#00E5FF]/5 blur-[90px] transition-all duration-1000 group-hover:bg-[#00E5FF]/10 group-hover:scale-125" />
            <div className="texture-grain absolute inset-0 opacity-10 pointer-events-none" />
            
            {/* Media Content Wrapper */}
            <div className="relative z-10 w-full mb-6 aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#0A0A0A] border border-white/[0.03]">
                {/* Tactical Status Badges */}
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

                {/* Actions Overlay Controls */}
                <div className="absolute right-4 top-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col gap-2">
                    <button 
                        className="h-10 w-10 flex items-center justify-center rounded-full bg-black/60 border border-white/10 text-white/60 hover:text-[#00E5FF] hover:border-[#00E5FF]/40 backdrop-blur-md transition-all"
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
                            Explorar <ArrowRight size={14} className="text-[#00E5FF]" />
                        </span>
                    </div>
                </Link>
            </div>

            {/* Product Structural Data */}
            <div className="relative z-10 flex flex-col flex-1 px-3 pb-2">
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <Box size={10} className="text-white/20" />
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">
                                {product.brand || 'ÉTER ORIGINAL'}
                            </p>
                        </div>
                        <div className="h-1.5 w-1.5 rounded-full bg-white/10" />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-white italic group-hover:text-[#00E5FF] transition-colors duration-500 leading-tight">
                        {product.name}
                    </h3>
                </div>

                {/* Tactical Size Selection Matrix */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">
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
                                        getStockStatus(selectedSize) === 'critical' ? 'bg-red-500/10 text-red-500' : 'bg-[#00E5FF]/10 text-[#00E5FF]'
                                    )}
                                >
                                    {getStockStatus(selectedSize) === 'critical' ? '¡ÚLTIMA!' : 'EN STOCK'}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-2">
                        {availableSizes.map(([size, stock]) => {
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
                                        "relative aspect-square flex items-center justify-center rounded-xl border text-[10px] font-black transition-all duration-300",
                                        status === 'out'
                                            ? 'opacity-10 cursor-not-allowed border-white/5 grayscale'
                                            : isSelected
                                            ? 'bg-white text-black border-white shadow-[0_0_25px_rgba(255,255,255,0.3)] scale-110 z-20'
                                            : 'bg-white/[0.02] border-white/5 text-white/40 hover:border-[#00E5FF]/40 hover:text-[#00E5FF] group/size'
                                    )}
                                >
                                    {size}
                                    {status === 'critical' && !isSelected && (
                                        <div className="absolute top-1 right-1 h-1 w-1 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
                                    )}
                                    {isSelected && (
                                        <motion.div 
                                            layoutId={`active-size-${product.id}`}
                                            className="absolute inset-0 bg-[#00E5FF]/10 mix-blend-overlay pointer-events-none rounded-xl"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
                
                {/* Pricing & Deployment Hub */}
                <div className="mt-auto pt-6 flex items-center justify-between border-t border-white/5">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-1">
                            Valuación
                        </span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-black text-[#00E5FF]">$</span>
                            <span className="text-2xl font-black tracking-tighter text-white italic">
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
                            "relative flex h-14 w-14 items-center justify-center rounded-[1.25rem] transition-all duration-500 overflow-hidden",
                            selectedSize 
                                ? "bg-[#00E5FF] text-black shadow-[0_0_40px_rgba(0,229,255,0.25)]" 
                                : "bg-white/[0.03] text-white/10 border border-white/5 grayscale"
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
                                    className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin"
                                />
                            ) : (
                                <motion.div
                                    key="cart"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center justify-center"
                                >
                                    <ShoppingCart size={22} strokeWidth={2.5} />
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
            <div className="absolute inset-0 z-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
            
            {/* Visual Continuity Label */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                <ShieldCheck size={10} className="text-[#00E5FF]/40" />
                <span className="text-[7px] font-black uppercase tracking-[0.4em] text-white/20 whitespace-nowrap">Authentic Archive Series</span>
            </div>
        </motion.div>
    );
}
