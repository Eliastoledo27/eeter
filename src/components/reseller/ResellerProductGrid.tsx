'use client';

import { ProductType } from '@/app/actions/products';
import { motion } from 'framer-motion';
import { Download, Share2, Package, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const easeOut = [0.16, 1, 0.3, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } };

interface Props {
    products: ProductType[];
    onCalculate: (p: ProductType) => void;
}

function downloadImage(url: string, name: string) {
    fetch(url).then(res => res.blob()).then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${name.replace(/\s+/g, '-').toLowerCase()}.jpg`;
        a.click();
        URL.revokeObjectURL(a.href);
        toast.success('Imagen descargada');
    }).catch(() => toast.error('Error al descargar'));
}

function shareProduct(product: ProductType) {
    const url = `${window.location.origin}/catalog/${product.id}`;
    if (navigator.share) {
        navigator.share({ title: product.name, text: `Mirá este modelo ÉTER: ${product.name}`, url });
    } else {
        navigator.clipboard.writeText(url);
        toast.success('Link copiado al portapapeles');
    }
}

import { memo } from 'react';

// ... (downloadImage and shareProduct remain the same or slightly cleaned)

const ProductCard = memo(({ product, index }: { product: ProductType; index: number }) => {
    const [copied, setCopied] = useState(false);
    const stock_by_size = product.stock_by_size || {};
    const totalStock = Object.values(stock_by_size).reduce((a, b) => Number(a) + Number(b), 0);
    const sizes = Object.entries(stock_by_size).filter(([_, v]) => Number(v) > 0);
    const isLow = totalStock > 0 && totalStock <= 5;
    const isOut = totalStock === 0;
    const tagColors = [
        'bg-[#C6FF00] shadow-[0_0_10px_#C6FF00] text-black', 
        'bg-[#00E5FF] shadow-[0_0_10px_#00E5FF] text-black', 
        'bg-[#7A00FF] shadow-[0_0_10px_#7A00FF] text-white'
    ];

    const copyForWhatsApp = () => {
        const text = `🔥 *${product.name}*\n💰 Precio: $${product.base_price.toLocaleString('es-AR')}\n📦 Talles: ${sizes.map(([s]) => s).join(', ')}\n✅ Stock disponible\n\n_Catálogo ÉTER — Calidad Premium_`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('Copiado para WhatsApp');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div 
            variants={fadeUp} 
            transition={{ duration: 0.4, ease: easeOut }} 
            whileHover={{ y: -5 }} 
            whileTap={{ scale: 0.98 }}
        >
            <div className="product-card group relative block overflow-hidden p-3 h-full">
                <span className="brush-stroke brush-green right-2 top-2 h-4 w-16 opacity-70" />
                
                {/* Tag */}
                <span className={`absolute left-3 top-3 z-20 rounded-sm px-2 py-1 text-[10px] font-black uppercase ${tagColors[index % 3]}`}>
                    {isOut ? 'Agotado' : isLow ? 'Últimas' : totalStock > 20 ? 'Hot' : 'New'}
                </span>

                {/* Image with action buttons */}
                <div className="relative mb-3 aspect-square overflow-hidden rounded-md bg-black">
                    {product.images?.[0] ? (
                        <Image 
                            src={product.images[0]} 
                            alt={product.name} 
                            fill 
                            sizes="(max-width: 640px) 50vw, 250px" 
                            className="object-cover transition-transform duration-500 group-hover:scale-110" 
                            priority={index < 8}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Package size={40} className="text-white/10" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60" />

                    {/* Top action buttons */}
                    <div className="absolute top-2 right-2 z-20 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-[-10px] group-hover:translate-y-0">
                        {product.images?.[0] && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); downloadImage(product.images[0], product.name); }} 
                                className="w-8 h-8 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg flex items-center justify-center text-white/70 hover:text-[#00E5FF] hover:border-[#00E5FF]/40 transition-all" 
                                title="Descargar imagen"
                            >
                                <Download size={14} />
                            </button>
                        )}
                        <button 
                            onClick={(e) => { e.stopPropagation(); shareProduct(product); }} 
                            className="w-8 h-8 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg flex items-center justify-center text-white/70 hover:text-[#C6FF00] hover:border-[#C6FF00]/40 transition-all" 
                            title="Compartir"
                        >
                            <Share2 size={14} />
                        </button>
                    </div>

                    {/* Sizes overlay at bottom of image */}
                    {sizes.length > 0 && (
                        <div className="absolute bottom-2 left-2 right-2 z-10 flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-[10px] group-hover:translate-y-0">
                            {sizes.slice(0, 8).map(([size]) => (
                                <span key={size} className="px-1.5 py-0.5 bg-black/80 backdrop-blur-md border border-white/10 rounded text-[8px] font-black text-white/90">{size}</span>
                            ))}
                            {sizes.length > 8 && <span className="px-1.5 py-0.5 bg-black/80 backdrop-blur-md border border-white/10 rounded text-[8px] font-black text-white/40">+{sizes.length - 8}</span>}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex flex-col gap-1">
                    <h3 className="line-clamp-1 text-[11px] font-black uppercase text-white group-hover:text-[#00E5FF] transition-colors">{product.name}</h3>
                    <div className="flex items-center justify-between">
                        <p className="text-[9px] uppercase text-white/40">{product.category || 'General'} · {totalStock > 0 ? `${totalStock}u` : 'Sin stock'}</p>
                        <span className="text-xs font-black text-[#00E5FF]">${product.base_price.toLocaleString('es-AR')}</span>
                    </div>
                </div>

                {/* Copy for WhatsApp */}
                <button 
                    onClick={copyForWhatsApp} 
                    className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/[0.02] border border-white/5 text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-[#C6FF00] hover:border-[#C6FF00]/30 hover:bg-[#C6FF00]/5 transition-all"
                >
                    {copied ? <Check size={12} className="text-[#C6FF00]" /> : <Copy size={12} />}
                    {copied ? 'Copiado' : 'WhatsApp Info'}
                </button>
            </div>
        </motion.div>
    );
});

ProductCard.displayName = 'ProductCard';

export function ResellerProductGrid({ products, onCalculate }: Props) {
    if (products.length === 0) {
        return (
            <div className="py-32 text-center">
                <Package size={48} className="text-white/10 mx-auto mb-4" />
                <p className="text-white/20 text-sm font-black uppercase tracking-widest">Sin resultados para esta búsqueda</p>
            </div>
        );
    }

    return (
        <section id="productos" className="relative z-0 bg-[#050505] py-6">
            <div className="paint-splatter splat-green -left-14 top-10 hidden md:block" />
            <div className="paint-splatter splat-purple -right-10 bottom-20 hidden md:block opacity-40" />
            
            <motion.div 
                initial="hidden" 
                animate="visible" 
                variants={stagger}
            >
                <motion.div variants={fadeUp} transition={{ duration: 0.65, ease: easeOut }} className="mb-4 flex items-center justify-between gap-4">
                    <h2 className="relative text-2xl font-black uppercase tracking-[-0.03em] text-white md:text-3xl">
                        <span className="brush-stroke brush-green -left-3 top-2 hidden w-40 opacity-40 md:block" />
                        <span className="relative">Modelos <span className="text-tri-gradient">Disponibles.</span></span>
                    </h2>
                    <span className="text-[10px] font-black uppercase text-white/20 tracking-tighter bg-white/5 px-2 py-1 rounded-sm border border-white/5">
                        {products.length} Items Encontrados
                    </span>
                </motion.div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                    {products.map((p, i) => (
                        <ProductCard key={p.id} product={p} index={i} />
                    ))}
                </div>
            </motion.div>
        </section>
    );
}
