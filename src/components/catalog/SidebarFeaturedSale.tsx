'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BadgePercent, Flame, ArrowRight, Eye } from 'lucide-react';
import type { Product } from '@/types';

interface Props {
    products: Product[];
}

export function SidebarFeaturedSale({ products }: Props) {
    const featuredItems = useMemo(() => {
        return products
            .filter((p) => p.liquidationActive || (p.liquidationPrice && p.liquidationPrice > 0))
            .slice(4, 34); // Massively increased to match product grid length
    }, [products]);

    if (featuredItems.length === 0) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                    <BadgePercent size={20} />
                </div>
                <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Últimas <span className="text-rose-500">Unidades</span></h3>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/30">Liquidación Final</p>
                </div>
            </div>

            <div className="space-y-6">
                {featuredItems.map((product, idx) => {
                    const priceNow = product.liquidationPrice || product.basePrice;
                    const discount = product.liquidationDiscountPercent || 
                        Math.round(((product.basePrice - priceNow) / product.basePrice) * 100);

                    return (
                        <motion.article
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-black/40 transition-all hover:border-rose-500/30"
                        >
                            <div className="relative aspect-[4/5] w-full overflow-hidden">
                                {product.images?.[0] ? (
                                    <Image
                                        src={product.images[0]}
                                        alt={product.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-white/[0.03] text-xs text-white/50">Sin Imagen</div>
                                )}
                                
                                <div className="absolute top-4 left-4">
                                    <div className="flex items-center gap-1.5 rounded-full bg-rose-500 px-3 py-1 text-[9px] font-black text-white shadow-xl">
                                        <Flame size={10} />
                                        {discount}% OFF
                                    </div>
                                </div>

                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                                
                                <div className="absolute inset-0 flex flex-col justify-end p-6">
                                    <div className="mb-2">
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-400 mb-1">{product.brand}</p>
                                        <h4 className="text-sm font-black uppercase tracking-tight text-white leading-tight line-clamp-2">{product.name}</h4>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-bold text-white/40 line-through decoration-rose-500/40">${product.basePrice.toLocaleString('es-AR')}</p>
                                            <p className="text-xl font-black tracking-tighter text-white">${priceNow.toLocaleString('es-AR')}</p>
                                        </div>
                                        <Link 
                                            href={`/catalog/${product.id}`}
                                            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-black transition-all hover:bg-rose-500 hover:text-white hover:scale-110 shadow-xl"
                                        >
                                            <ArrowRight size={18} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.article>
                    );
                })}
            </div>

            <Link 
                href="/catalog?filter=liquidation"
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/60 transition-all hover:bg-white/[0.05] hover:text-white group"
            >
                Ver todas las ofertas
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
        </div>
    );
}
