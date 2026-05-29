'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, BadgePercent, Flame, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { Product } from '@/types';

function getDiscount(basePrice: number, liquidationPrice: number) {
  if (basePrice <= 0 || liquidationPrice <= 0 || liquidationPrice >= basePrice) return 0;
  return Math.round(((basePrice - liquidationPrice) / basePrice) * 100);
}

interface Props {
  products: Product[];
  title?: string;
}

export function LiquidationCardsSection({ products, title = 'Ofertas Flash' }: Props) {
  const [selected, setSelected] = useState<Product | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const liquidated = useMemo(() => {
    const activeProducts = products.filter((product) => product.status === 'active');
    const sortedPrices = activeProducts.map((product) => product.basePrice || 0).sort((a, b) => a - b);
    const cheapestThreshold = sortedPrices[Math.min(7, sortedPrices.length - 1)] || 0;

    return activeProducts
      .filter((product) => {
        const isFlash = product.productSections?.includes('flash');
        const isRealLiquidation = product.liquidationActive === true;
        const isCheap = cheapestThreshold > 0 && product.basePrice <= cheapestThreshold;
        return isFlash || (!isRealLiquidation && isCheap);
      })
      .sort((a, b) => {
        const flashA = a.productSections?.includes('flash') ? 0 : 1;
        const flashB = b.productSections?.includes('flash') ? 0 : 1;
        if (flashA !== flashB) return flashA - flashB;
        return (a.liquidationPrice || a.basePrice) - (b.liquidationPrice || b.basePrice);
      })
      .slice(0, 8);
  }, [products]);

  if (liquidated.length === 0) return null;

  return (
    <section className="mb-12 overflow-hidden rounded-[2.5rem] border border-rose-500/20 bg-gradient-to-b from-rose-500/5 to-transparent p-6 md:p-8 relative">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Flame size={120} className="text-rose-500" />
      </div>

      <div className="relative z-10 mb-8 flex items-center justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500/80">Ofertas Flash</span>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-white md:text-4xl">{title}</h2>
        </div>
        <Link href="/catalog?filter=liquidation" className="group flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-white/40 transition-colors hover:text-white">
          Explorar todo
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {liquidated.map((p) => {
          const priceNow = p.liquidationPrice || p.basePrice;
          const discount = p.liquidationDiscountPercent || getDiscount(p.basePrice, priceNow);
          const src = !imgErrors[p.id] && p.images?.[0] ? p.images[0] : null;
          
          return (
            <article
              key={p.id}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/5 bg-black/40 transition-all hover:-translate-y-2 hover:border-rose-500/30 hover:shadow-[0_20px_40px_rgba(244,63,94,0.1)]"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                {src ? (
                  <Image
                    src={src}
                    alt={p.name}
                    fill
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={() => setImgErrors((prev) => ({ ...prev, [p.id]: true }))}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white/[0.03] text-xs text-white/50">Imagen no disponible</div>
                )}
                
                <div className="absolute top-4 left-4">
                  <div className="flex items-center gap-1.5 rounded-full bg-rose-500 px-3 py-1 text-[10px] font-black text-white shadow-xl">
                    <BadgePercent size={12} />
                    {discount}% OFF
                  </div>
                </div>

                <button 
                  onClick={() => setSelected(p)}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-all duration-300 group-hover:opacity-100 backdrop-blur-[2px]"
                >
                  <span className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[10px] font-black uppercase tracking-widest text-black shadow-2xl transition-transform hover:scale-105">
                    <Eye size={14} /> Vista Previa
                  </span>
                </button>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">{p.brand}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-rose-400">{p.category}</span>
                </div>
                <h3 className="mb-4 line-clamp-1 text-sm font-black uppercase tracking-tight text-white group-hover:text-rose-400 transition-colors">{p.name}</h3>
                
                <div className="mt-auto flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-white/30 line-through decoration-rose-500/40">${p.basePrice.toLocaleString('es-AR')}</p>
                    <p className="text-xl font-black tracking-tighter text-white">${priceNow.toLocaleString('es-AR')}</p>
                  </div>
                  <Link 
                    href={`/catalog/${p.id}`}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/10 text-white/40 transition-all hover:bg-rose-500 hover:text-white hover:border-rose-500 hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]"
                  >
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-4xl overflow-hidden border-white/10 bg-[#050505] p-0 text-white shadow-2xl backdrop-blur-xl">
          {selected && (
            <div className="grid md:grid-cols-2">
              <div className="relative h-[400px] md:h-full min-h-[400px]">
                {!imgErrors[selected.id] && selected.images?.[0] ? (
                  <Image src={selected.images[0]} alt={selected.name} fill className="object-cover" onError={() => setImgErrors((prev) => ({ ...prev, [selected.id]: true }))} />
                ) : (
                  <div className="flex h-full items-center justify-center bg-white/[0.03] text-sm text-white/55">Imagen no disponible</div>
                )}
                <div className="absolute top-6 left-6">
                  <div className="flex items-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-xs font-black text-white shadow-2xl">
                    <Flame size={14} />
                    OFERTA FLASH
                  </div>
                </div>
              </div>
              <div className="flex flex-col p-8 md:p-12">
                <div className="mb-6">
                  <nav className="mb-3 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] text-white/30">
                    <span>{selected.brand}</span>
                    <span className="h-1 w-1 rounded-full bg-white/20" />
                    <span className="text-rose-400">{selected.category}</span>
                  </nav>
                  <DialogTitle className="text-4xl font-black uppercase tracking-tight text-white leading-none">{selected.name}</DialogTitle>
                </div>

                <div className="mb-8 space-y-4">
                   <div className="flex items-center gap-4">
                      <span className="text-4xl font-black tracking-tighter text-white">
                        ${(selected.liquidationPrice || selected.basePrice).toLocaleString('es-AR')}
                      </span>
                      <span className="text-lg font-bold text-white/20 line-through decoration-rose-500/50">
                        ${selected.basePrice.toLocaleString('es-AR')}
                      </span>
                      <span className="rounded-lg bg-rose-500/10 px-2 py-1 text-xs font-black text-rose-500 border border-rose-500/20">
                        -{selected.liquidationDiscountPercent || getDiscount(selected.basePrice, selected.liquidationPrice || selected.basePrice)}%
                      </span>
                   </div>
                   <p className="text-sm leading-relaxed text-white/50">{selected.description || 'Este producto forma parte de nuestras Ofertas Flash. Stock limitado y precio bajo por tiempo acotado.'}</p>
                </div>

                <div className="mt-auto space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">Estado</p>
                      <p className="text-xs font-bold text-rose-400">Stock Crítico</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">Disponibilidad</p>
                      <p className="text-xs font-bold text-white">Entrega Inmediata</p>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/catalog/${selected.id}`}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#00E5FF] py-5 text-xs font-black uppercase tracking-[0.2em] text-black shadow-[0_0_30px_rgba(0,229,255,0.3)] transition-all hover:scale-[1.02] hover:bg-white"
                  >
                    Ver detalles completos
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

