'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight, BadgePercent, Flame, Sparkles } from 'lucide-react';
import type { Product } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import { getPublicLiquidationProducts } from '@/app/actions/liquidation-actions';

const marquee = ['Liquidacion sin cambios', 'Hot sale ETER', 'Precio final hoy', 'Stock limitado', 'Envios a todo el pais'];

interface Props {
    products: Product[];
}

export function LiquidationCarousel({ products }: Props) {
    const [remoteItems, setRemoteItems] = useState<Array<Record<string, unknown>>>([]);

    useEffect(() => {
        getPublicLiquidationProducts(3).then((res) => {
            if (!res.error) setRemoteItems(res.data as Array<Record<string, unknown>>);
        });
    }, []);

    const sourceProducts = useMemo(() => {
        if (remoteItems.length > 0) {
            return remoteItems.map((r) => ({
                id: String(r.id),
                name: String(r.name || ''),
                description: String(r.description || ''),
                basePrice: Number(r.price || 0),
                images: (r.images as string[]) || [],
                liquidationActive: Boolean(r.liquidation_active),
                liquidationPrice: Number(r.liquidation_price || 0),
                liquidationDiscountPercent: Number(r.liquidation_discount_percent || 0),
            }));
        }
        return products;
    }, [products, remoteItems]);

    const liquidationItems = sourceProducts
        .filter((p) => {
            const liq = p as unknown as {
                liquidationActive?: boolean;
            };
            return liq.liquidationActive === true;
        })
        .slice(0, 3)
        .map((p, idx) => {
            const liq = p as unknown as { liquidationPrice?: number; liquidationDiscountPercent?: number };
            const priceNow = Number(liq.liquidationPrice || p.basePrice);
            const discount = Number(liq.liquidationDiscountPercent || 20) || 20;
            const colors = [
                'from-[#00E5FF]/30 to-[#00E5FF]/5',
                'from-[#C6FF00]/25 to-[#C6FF00]/5',
                'from-[#7A00FF]/25 to-[#7A00FF]/5',
            ];
            return {
                id: p.id,
                title: p.name,
                discount: `-${discount}%`,
                subtitle: (p.description || 'Liquidacion express por tiempo limitado').slice(0, 52),
                priceNow: `$${priceNow.toLocaleString('es-AR')}`,
                priceBefore: `$${Math.round(priceNow * 1.2).toLocaleString('es-AR')}`,
                image: p.images?.[0] || '',
                color: colors[idx % colors.length],
            };
        });

    if (liquidationItems.length === 0) return null;

    return (
        <section className="relative overflow-hidden border-y border-white/10 bg-[#050505] py-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(0,229,255,.15),transparent_35%),radial-gradient(circle_at_80%_65%,rgba(122,0,255,.14),transparent_38%),radial-gradient(circle_at_40%_85%,rgba(198,255,0,.14),transparent_32%)]" />

            <div className="relative mb-6 overflow-hidden border-y border-white/10 bg-black/30 py-2">
                <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: '-50%' }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                    className="flex w-max gap-8 pr-8"
                >
                    {[...marquee, ...marquee].map((item, idx) => (
                        <span key={`${item}-${idx}`} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-white/80">
                            <Flame size={12} className="text-[#C6FF00]" />
                            {item}
                        </span>
                    ))}
                </motion.div>
            </div>

            <div className="mx-auto max-w-[1440px] px-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-3">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-[#00E5FF]" />
                        <p className="text-xs font-black uppercase tracking-[0.25em] text-[#00E5FF]">Liquidacion sin cambios</p>
                    </div>
                    <Link href="/catalog/best" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-white hover:text-[#C6FF00] transition-colors">
                        Ver ofertas
                        <ArrowUpRight size={14} />
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {liquidationItems.map((item, idx) => (
                        <motion.article
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ delay: idx * 0.08 }}
                            whileHover={{ y: -4 }}
                            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-4"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-80`} />
                            <div className="relative flex items-start justify-between gap-4">
                                <div>
                                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#C6FF00]/40 bg-[#C6FF00]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-[#C6FF00]">
                                        <BadgePercent size={12} />
                                        {item.discount}
                                    </div>
                                    <h3 className="text-lg font-black uppercase tracking-tight text-white">{item.title}</h3>
                                    <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-white/70">{item.subtitle}</p>
                                    <div className="mt-4 flex items-end gap-3">
                                        <span className="text-2xl font-black text-white">{item.priceNow}</span>
                                        <span className="text-xs font-bold text-white/40 line-through">{item.priceBefore}</span>
                                    </div>
                                    <Link
                                        href={`/catalog/${item.id}`}
                                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#00E5FF] px-3 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-black hover:brightness-110"
                                    >
                                        Vista previa
                                    </Link>
                                </div>
                                <Link href={`/catalog/${item.id}`} className="relative h-[82px] w-[82px] shrink-0">
                                    {item.image ? (
                                        <Image src={item.image} alt={item.title} fill className="object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.55)] transition-transform duration-500 group-hover:scale-110" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center rounded-lg bg-white/[0.05] text-[10px] text-white/50">Sin imagen</div>
                                    )}
                                </Link>
                            </div>
                            <div className="relative mt-5 h-[1px] bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                            <div className="relative mt-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/90">
                                <Sparkles size={12} className="text-[#00E5FF]" />
                                Aprovecha la ventana de precio
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
