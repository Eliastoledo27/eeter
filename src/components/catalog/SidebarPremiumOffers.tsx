'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BadgePercent, Flame, ArrowRight, Eye } from 'lucide-react';
import type { Product } from '@/types';

interface Props {
    products: Product[];
}

export function SidebarPremiumOffers({ products }: Props) {
    const items = useMemo(() => {
        return products
            .filter((p) => p.liquidationActive || (p.liquidationPrice && p.liquidationPrice > 0))
            .slice(10, 40); // Massively increased to match product grid length
    }, [products]);

    if (items.length === 0) return null;

    return (
        <div className="space-y-6 pt-4">
            <div className="flex items-center gap-3 px-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00E5FF] text-black shadow-[0_0_20px_rgba(0,229,255,0.3)]">
                    <Flame size={20} />
                </div>
                <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Ofertas <span className="text-[#00E5FF]">Imperdibles</span></h3>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/30">Selección Premium</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {items.map((product, idx) => {
                    const priceNow = product.liquidationPrice || product.basePrice;
                    const discount = product.liquidationDiscountPercent || 
                        (product.basePrice > 0 ? Math.round(((product.basePrice - priceNow) / product.basePrice) * 100) : 0);

                    return (
                        <motion.article
                            key={product.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="group relative overflow-hidden rounded-3xl border border-white/5 bg-black/40 transition-all hover:border-[#00E5FF]/30"
                        >
                            <div className="relative aspect-square w-full overflow-hidden">
                                {product.images?.[0] ? (
                                    <Image
                                        src={product.images[0]}
                                        alt={product.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-white/[0.03] text-[8px] text-white/20 uppercase font-black">No Image</div>
                                )}
                                
                                <div className="absolute top-3 left-3">
                                    <div className="flex items-center gap-1 rounded-full bg-rose-500 px-2 py-0.5 text-[8px] font-black text-white shadow-xl">
                                        -{discount}%
                                    </div>
                                </div>

                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                                
                                <div className="absolute inset-0 flex flex-col justify-end p-4">
                                    <div className="mb-2">
                                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#00E5FF] mb-0.5">{product.brand}</p>
                                        <h4 className="text-[10px] font-black uppercase tracking-tight text-white leading-tight line-clamp-1">{product.name}</h4>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[9px] font-bold text-white/40 line-through decoration-rose-500/40">${product.basePrice.toLocaleString('es-AR')}</p>
                                            <p className="text-sm font-black tracking-tighter text-white">${priceNow.toLocaleString('es-AR')}</p>
                                        </div>
                                        <Link 
                                            href={`/catalog/${product.id}`}
                                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-black transition-all hover:bg-[#00E5FF] hover:scale-110 shadow-xl"
                                        >
                                            <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.article>
                    );
                })}
            </div>
        </div>
    );
}
