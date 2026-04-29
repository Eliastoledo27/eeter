'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BadgePercent, Flame, Sparkles, ArrowRight } from 'lucide-react';
import type { Product } from '@/types';

interface Props {
    products: Product[];
}

export function SidebarLiquidation({ products }: Props) {
    const liquidationItems = useMemo(() => {
        return products
            .filter((p) => p.liquidationActive || (p.liquidationPrice && p.liquidationPrice > 0))
            .slice(0, 50); // Massively increased to match product grid length
    }, [products]);

    if (liquidationItems.length === 0) return null;

    return (
        <div className="mt-12 space-y-8 pb-10">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.15)] transition-transform hover:scale-110">
                        <Flame size={20} />
                    </div>
                    <div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-white">Stock <span className="text-rose-500">Liquidation</span></h3>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/30">Oportunidades únicas</p>
                    </div>
                </div>
                <Link href="/catalog?filter=liquidation" className="group flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-[#00E5FF] transition-colors">
                    Ver mas
                    <ArrowRight size={10} className="transition-transform group-hover:translate-x-1" />
                </Link>
            </div>

            <div className="space-y-4">
                {liquidationItems.map((product, idx) => {
                    const priceNow = product.liquidationPrice || product.basePrice;
                    const discount =
                        product.liquidationDiscountPercent ||
                        (product.basePrice > 0 && priceNow < product.basePrice
                            ? Math.round(((product.basePrice - priceNow) / product.basePrice) * 100)
                            : 0);
                    
                    const colors = [
                        'from-[#00E5FF]/20 to-transparent',
                        'from-[#7A00FF]/20 to-transparent',
                    ];
                    const color = colors[idx % colors.length];

                    return (
                        <motion.article
                            key={product.id}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                            className="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.02] p-4 transition-all hover:bg-white/[0.05] hover:border-[#00E5FF]/30 hover:shadow-[0_0_30px_rgba(0,229,255,0.1)]"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                            
                            <div className="relative flex items-center gap-4">
                                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-black/40 border border-white/10">
                                    {product.images?.[0] ? (
                                        <Image
                                            src={product.images[0]}
                                            alt={product.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-115 group-hover:rotate-2"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-[8px] text-white/20 uppercase font-black">Sin Imagen</div>
                                    )}
                                    <div className="absolute top-1.5 left-1.5">
                                        <div className="flex items-center gap-1 rounded-lg bg-[#00E5FF] px-1.5 py-0.5 text-[8px] font-black text-black shadow-lg">
                                            -{discount}%
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="truncate text-[11px] font-black uppercase tracking-tight text-white/90 group-hover:text-[#00E5FF] transition-colors">
                                        {product.name}
                                    </h4>
                                    <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-white/30 truncate">
                                        {product.brand} • {product.category}
                                    </p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-sm font-black tracking-tighter text-white">${priceNow.toLocaleString('es-AR')}</span>
                                        <span className="text-[10px] font-bold text-white/20 line-through decoration-[#00E5FF]/40">${product.basePrice.toLocaleString('es-AR')}</span>
                                    </div>
                                </div>
                                
                                <Link 
                                    href={`/catalog/${product.id}`}
                                    className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/10 text-white/30 transition-all group-hover:bg-[#00E5FF] group-hover:text-black group-hover:border-[#00E5FF] group-hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] group-hover:-translate-y-1"
                                >
                                    <ArrowRight size={14} />
                                </Link>
                            </div>
                        </motion.article>
                    );
                })}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="rounded-3xl border border-dashed border-[#00E5FF]/20 bg-[#00E5FF]/5 p-5 text-center"
            >
                <div className="mb-3 flex justify-center">
                    <Sparkles className="text-[#00E5FF]" size={20} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                    Stock Crítico
                </p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-white/40">
                    Últimos pares disponibles en oferta
                </p>
            </motion.div>
        </div>
    );
}
