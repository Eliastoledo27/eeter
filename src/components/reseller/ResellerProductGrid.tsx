'use client';

import { ProductType } from '@/app/actions/products';
import { motion } from 'framer-motion';
import { Calculator, Check, Copy, Download, Package, Share2 } from 'lucide-react';
import { memo, useState } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';

const easeOut = [0.16, 1, 0.3, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.035, delayChildren: 0.02 } } };

interface Props {
    products: ProductType[];
    onCalculate: (product: ProductType) => void;
}

function downloadImage(url: string, name: string) {
    fetch(url)
        .then((res) => res.blob())
        .then((blob) => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${name.replace(/\s+/g, '-').toLowerCase()}.jpg`;
            link.click();
            URL.revokeObjectURL(link.href);
            toast.success('Imagen descargada');
        })
        .catch(() => toast.error('Error al descargar'));
}

function shareProduct(product: ProductType) {
    const url = `${window.location.origin}/catalog/${product.id}`;
    if (navigator.share) {
        navigator.share({ title: product.name, text: `Mira este modelo ETER: ${product.name}`, url });
        return;
    }

    navigator.clipboard.writeText(url);
    toast.success('Link copiado al portapapeles');
}

const ProductCard = memo(({ product, index, onCalculate }: { product: ProductType; index: number; onCalculate: (product: ProductType) => void }) => {
    const [copied, setCopied] = useState(false);
    const stockBySize = product.stock_by_size || {};
    const totalStock = Object.values(stockBySize).reduce((a, b) => Number(a) + Number(b), 0);
    const sizes = Object.entries(stockBySize).filter(([, value]) => Number(value) > 0);
    const isLow = totalStock > 0 && totalStock <= 5;
    const isOut = totalStock === 0;
    const tagColors = [
        'bg-[#C6FF00] shadow-[0_0_10px_#C6FF00] text-black',
        'bg-[#00E5FF] shadow-[0_0_10px_#00E5FF] text-black',
        'bg-[#7A00FF] shadow-[0_0_10px_#7A00FF] text-white',
    ];

    const copyForWhatsApp = () => {
        const text = [
            `*${product.name}*`,
            `Precio: $${product.base_price.toLocaleString('es-AR')}`,
            `Talles: ${sizes.map(([size]) => size).join(', ') || 'Consultar'}`,
            `Stock disponible: ${totalStock} pares`,
            '',
            'Catalogo ETER - Calidad Premium',
        ].join('\n');

        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('Copiado para WhatsApp');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            variants={fadeUp}
            transition={{ duration: 0.32, ease: easeOut }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.985 }}
        >
            <div className="product-card group relative block h-full min-w-0 overflow-hidden rounded-xl border border-white/[0.055] bg-[#080808]/80 p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.22)] transition-colors hover:border-[#00E5FF]/20 min-[380px]:p-2 sm:p-3">
                <span className="brush-stroke brush-green right-2 top-2 h-4 w-16 opacity-70" />

                <span className={`absolute left-2.5 top-2.5 z-20 rounded-md px-1.5 py-1 text-[9px] font-black uppercase sm:left-3 sm:top-3 sm:px-2 sm:text-[10px] ${tagColors[index % 3]}`}>
                    {isOut ? 'Agotado' : isLow ? 'Ultimas' : totalStock > 20 ? 'Hot' : 'New'}
                </span>

                <div className="relative mb-2 aspect-[1/1.07] overflow-hidden rounded-lg bg-black min-[380px]:mb-2.5 sm:mb-3 sm:aspect-square sm:rounded-md">
                    {product.images?.[0] ? (
                        <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 48vw, (max-width: 1024px) 31vw, (max-width: 1280px) 23vw, 15vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            priority={index < 4}
                            loading={index < 4 ? undefined : 'lazy'}
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <Package size={40} className="text-white/10" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60" />

                    <div className="absolute right-1.5 top-1.5 z-20 flex gap-1 opacity-100 transition-all duration-300 sm:right-2 sm:top-2 sm:gap-1.5 sm:translate-y-[-10px] sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                        {product.images?.[0] && (
                            <button
                                onClick={(event) => {
                                    event.stopPropagation();
                                    downloadImage(product.images[0], product.name);
                                }}
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/65 text-white/75 backdrop-blur-md transition-all hover:border-[#00E5FF]/40 hover:text-[#00E5FF] sm:h-8 sm:w-8"
                                title="Descargar imagen"
                            >
                                <Download size={14} />
                            </button>
                        )}
                        <button
                            onClick={(event) => {
                                event.stopPropagation();
                                shareProduct(product);
                            }}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/65 text-white/75 backdrop-blur-md transition-all hover:border-[#C6FF00]/40 hover:text-[#C6FF00] sm:h-8 sm:w-8"
                            title="Compartir"
                        >
                            <Share2 size={14} />
                        </button>
                    </div>

                    {sizes.length > 0 && (
                        <div className="absolute bottom-2 left-2 right-2 z-10 flex translate-y-0 gap-1 overflow-hidden opacity-100 transition-all duration-300 sm:flex-wrap sm:translate-y-[10px] sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                            {sizes.slice(0, 4).map(([size]) => (
                                <span key={size} className="rounded border border-white/10 bg-black/80 px-1.5 py-0.5 text-[8px] font-black text-white/90 backdrop-blur-md">
                                    {size}
                                </span>
                            ))}
                            {sizes.length > 4 && (
                                <span className="rounded border border-white/10 bg-black/80 px-1.5 py-0.5 text-[8px] font-black text-white/45 backdrop-blur-md">
                                    +{sizes.length - 4}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex min-h-[44px] flex-col gap-1 sm:min-h-[46px]">
                    <h3 className="line-clamp-2 text-[10px] font-black uppercase leading-tight text-white transition-colors group-hover:text-[#00E5FF] min-[380px]:text-[10.5px] sm:text-[11px]">
                        {product.name}
                    </h3>
                    <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-[8.5px] uppercase text-white/40 sm:text-[9px]">
                            {product.category || 'General'} · {totalStock > 0 ? `${totalStock}u` : 'Sin stock'}
                        </p>
                        <span className="shrink-0 text-[11px] font-black text-[#00E5FF] sm:text-xs">${product.base_price.toLocaleString('es-AR')}</span>
                    </div>
                </div>

                <div className="mt-2 grid grid-cols-[1fr_34px] gap-1.5 sm:mt-3 sm:grid-cols-[1fr_38px] sm:gap-2">
                    <button
                        onClick={copyForWhatsApp}
                        className="flex min-h-9 w-full items-center justify-center gap-1 rounded-lg border border-white/5 bg-white/[0.025] px-1 text-[8px] font-black uppercase tracking-[0.04em] text-white/38 transition-all hover:border-[#C6FF00]/30 hover:bg-[#C6FF00]/5 hover:text-[#C6FF00] min-[380px]:gap-1.5 min-[380px]:px-1.5 min-[380px]:text-[8.5px] sm:gap-2 sm:px-2 sm:text-[9px] sm:tracking-widest"
                    >
                        {copied ? <Check size={12} className="text-[#C6FF00]" /> : <Copy size={12} />}
                        {copied ? 'Copiado' : 'WhatsApp'}
                    </button>
                    <button
                        onClick={() => onCalculate(product)}
                        className="flex min-h-9 items-center justify-center rounded-lg border border-[#00E5FF]/15 bg-[#00E5FF]/5 text-[#00E5FF] transition-all hover:border-[#00E5FF]/40 hover:bg-[#00E5FF]/10"
                        title="Calcular margen"
                    >
                        <Calculator size={14} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
});

ProductCard.displayName = 'ProductCard';

export function ResellerProductGrid({ products, onCalculate }: Props) {
    if (products.length === 0) {
        return (
            <div className="py-32 text-center">
                <Package size={48} className="mx-auto mb-4 text-white/10" />
                <p className="text-sm font-black uppercase tracking-widest text-white/20">Sin resultados para esta busqueda</p>
            </div>
        );
    }

    return (
        <section id="productos" className="relative z-0 bg-[#050505] py-3 sm:py-6">
            <div className="paint-splatter splat-green -left-14 top-10 hidden md:block" />
            <div className="paint-splatter splat-purple -right-10 bottom-20 hidden opacity-40 md:block" />

            <motion.div initial="hidden" animate="visible" variants={stagger}>
                <motion.div variants={fadeUp} transition={{ duration: 0.55, ease: easeOut }} className="mb-3 flex items-end justify-between gap-3 sm:mb-4 sm:gap-4">
                    <h2 className="relative text-base font-black uppercase tracking-normal text-white min-[380px]:text-lg sm:text-2xl md:text-3xl">
                        <span className="brush-stroke brush-green -left-3 top-2 hidden w-40 opacity-40 md:block" />
                        <span className="relative">
                            Modelos <span className="text-tri-gradient">Disponibles.</span>
                        </span>
                    </h2>
                    <span className="shrink-0 rounded-md border border-white/5 bg-white/5 px-2 py-1 text-right text-[7.5px] font-black uppercase tracking-normal text-white/25 min-[380px]:text-[8.5px] sm:text-[10px]">
                        {products.length} Items Encontrados
                    </span>
                </motion.div>

                <div className="grid min-w-0 grid-cols-2 gap-1.5 min-[380px]:gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-6">
                    {products.map((product, index) => (
                        <ProductCard key={product.id} product={product} index={index} onCalculate={onCalculate} />
                    ))}
                </div>
            </motion.div>
        </section>
    );
}
