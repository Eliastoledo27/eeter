'use client';

import { Product } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ArrowUpRight, ShieldCheck, Zap } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { toast } from 'sonner';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

export function ProductCard({ product, href, onQuickView }: { product: Product; href?: string; onQuickView?: () => void }) {
  const router = useRouter();
  const { addItem, setIsOpen } = useCartStore();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [isHovered, setIsHovered] = useState(false);

  const availableSizes = useMemo(() => {
    if (!product.stockBySize) return [];
    return Object.entries(product.stockBySize)
      .filter(([, qty]) => qty > 0)
      .map(([size]) => size)
      .sort((a, b) => {
        const numA = parseInt(a);
        const numB = parseInt(b);
        return isNaN(numA) || isNaN(numB) ? a.localeCompare(b) : numA - numB;
      });
  }, [product.stockBySize]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (availableSizes.length > 0 && !selectedSize) {
      if (availableSizes.length === 1) {
        addItem(product, availableSizes[0]);
        toast.success(`Agregado: ${product.name}`, {
          style: { background: '#0A0A0A', color: '#FAFAF9', border: '1px solid #C88A04' }
        });
        return;
      }

      toast.error('Por favor selecciona un talle', {
        style: { background: '#0A0A0A', color: '#FAFAF9', border: '1px solid #C88A04' }
      });
      return;
    }

    const sizeToAdd = selectedSize || (availableSizes.length > 0 ? availableSizes[0] : 'Unique');

    addItem(product, sizeToAdd);
    setIsOpen(true);
    toast.success(`Agregado: ${product.name} (Talle ${sizeToAdd})`, {
      style: {
        background: '#0A0A0A',
        color: '#FAFAF9',
        border: '1px solid #C88A04',
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -15 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        if (href) {
          router.push(href);
        } else {
          router.push(`/catalog/${product.id}`);
        }
      }}
      className="group relative bg-gradient-to-b from-[#0F0F0F] to-[#050505] rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-white/5 hover:border-[#C88A04]/50 transition-all duration-1000 ease-[0.19,1,0.22,1] cursor-pointer shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] h-full flex flex-col group/card"
    >
      {/* Premium Tech Frame (Only visible on hover) */}
      <div className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-700 opacity-0 group-hover:opacity-100">
        <div className="absolute top-0 left-0 w-12 h-12 border-t border-l border-[#C88A04]/40 rounded-tl-[2.5rem]" />
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b border-r border-[#C88A04]/40 rounded-br-[2.5rem]" />
        <div className="absolute top-6 right-6 flex gap-2">
          <div className="w-1 h-1 bg-[#C88A04]/40 rounded-full" />
          <div className="w-1 h-1 bg-[#C88A04]/40 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
      }} />

      {/* Dynamic Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#C88A04]/10 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Image Container */}
      <div className="aspect-[1/1] relative overflow-hidden bg-gradient-to-b from-[#111] to-transparent">
        <Image
          src={product.images[0] || '/placeholder-shoe.png'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-contain p-4 md:p-10 w-full h-full group-hover:scale-110 group-hover:-rotate-6 transition-all duration-1000 ease-[0.19,1,0.22,1] drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] z-10"
        />

        {/* Hover Info Badges - Hidden on small mobile */}
        <div className="absolute top-4 left-4 md:top-8 md:left-8 z-40 transition-all duration-700 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 flex flex-col gap-1 md:gap-2">
          <div className="flex items-center gap-1.5 md:gap-2 bg-black/40 backdrop-blur-md border border-white/10 px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[6px] md:text-[8px] font-bold text-white uppercase tracking-widest">
            <ShieldCheck size={8} className="text-[#C88A04] md:w-[10px]" />
            Auténtico
          </div>
        </div>

        {/* Action Button - More visible on mobile (always slightly visible) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart(e);
          }}
          className="absolute bottom-4 right-4 md:bottom-8 md:right-8 h-10 w-10 md:h-14 md:w-14 bg-white text-black flex items-center justify-center rounded-xl md:rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.4)] md:opacity-0 md:translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 hover:bg-[#C88A04] hover:scale-110 active:scale-95 z-40"
          aria-label="Agregar al carrito"
        >
          <ShoppingCart size={18} className="md:w-[22px]" strokeWidth={2.5} />
        </button>

        {/* Availability Badge */}
        <div className="absolute top-4 right-4 md:top-8 md:right-8 z-20">
          <span className={`px-2 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[7px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] backdrop-blur-xl border ${product.status === 'active'
            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
            : 'border-white/10 bg-white/5 text-gray-500'
            }`}>
            {product.status === 'active' ? 'Stock' : 'Agotado'}
          </span>
        </div>

        {/* Quick View Button (Desktop) */}
        {onQuickView && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-30 hidden md:flex">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView();
              }}
              className="px-6 py-2.5 bg-black/40 backdrop-blur-xl border border-white/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transform translate-y-4 group-hover:translate-y-0 transition-all duration-700 hover:bg-[#C88A04] hover:text-black hover:border-[#C88A04]"
            >
              Vista Rápida
            </button>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-4 md:p-10 pt-4 flex flex-col flex-1 relative z-20">
        <div className="flex items-baseline justify-between mb-2 md:mb-4">
          <span className="text-[8px] md:text-[10px] font-mono text-[#C88A04] uppercase tracking-[0.2em] md:tracking-[0.4em] font-bold">
            {product.category || 'ÉTER_CORE'}
          </span>
          <div className="h-px flex-1 mx-2 md:mx-4 bg-white/10 group-hover:bg-[#C88A04]/40 transition-colors duration-700" />
          <span className="text-[8px] md:text-[10px] font-mono text-gray-600 uppercase tracking-widest hidden sm:block">
            V2.6
          </span>
        </div>

        <h3 className="text-xs md:text-2xl font-black text-white tracking-tighter group-hover:text-[#C88A04] transition-colors duration-500 uppercase leading-tight mb-3 md:mb-6 line-clamp-2">
          {product.name}
        </h3>

        <div className="mt-auto space-y-4 md:space-y-8">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-[8px] md:text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">Inversión</span>
              <span className="text-lg md:text-4xl font-light text-white tracking-tighter leading-none">
                <span className="text-[10px] md:text-xl mr-0.5 opacity-50">$</span>
                {product.basePrice.toLocaleString('es-AR')}
              </span>
            </div>

            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#C88A04] group-hover:text-[#C88A04] transition-all duration-500">
              <ArrowUpRight size={14} className="md:w-[18px]" />
            </div>
          </div>

          {/* Size Selector - Now visible on all devices */}
          <div className="pt-4 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {availableSizes.length > 0 && availableSizes[0] !== 'Unique' ? (
                availableSizes.slice(0, 6).map(size => (
                  <button
                    key={size}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedSize(size);
                    }}
                    className={`
                      h-8 md:h-10 min-w-[32px] md:min-w-[40px] px-2 md:px-3 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-mono font-black border transition-all duration-500
                      ${selectedSize === size
                        ? 'bg-[#C88A04] border-[#C88A04] text-black shadow-[0_0_20px_rgba(200,138,4,0.4)]'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-[#C88A04]/40 hover:text-white'}
                    `}
                  >
                    {size}
                  </button>
                ))
              ) : (
                <span className="text-[10px] font-mono text-gray-700 uppercase tracking-[0.2em]">Consultar disponibilidad</span>
              )}
              {availableSizes.length > 6 && (
                <span className="h-10 flex items-center text-[10px] font-mono text-gray-600 uppercase tracking-widest px-2">
                  +{availableSizes.length - 6}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
