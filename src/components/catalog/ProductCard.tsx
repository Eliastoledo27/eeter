'use client';

import { Product } from '@/types';
import { ShoppingCart, ArrowUpRight, X } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { toast } from 'sonner';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function ProductCard({ product, href }: { product: Product; href?: string; onQuickView?: () => void }) {
  const router = useRouter();
  const { addItem, setIsOpen: setIsCartOpen } = useCartStore();
  const [showSizeSelector, setShowSizeSelector] = useState(false);

  const availableSizes = useMemo(() => {
    if (!product.stockBySize) return [];
    return Object.entries(product.stockBySize)
      .filter(([, qty]) => Number(qty) > 0)
      .map(([size]) => size)
      .sort((a, b) => Number(a) - Number(b));
  }, [product.stockBySize]);

  const handleAddToCart = (e: React.MouseEvent, size?: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!size && availableSizes.length > 0) {
      if (availableSizes.length === 1) {
        processAddToCart(availableSizes[0]);
      } else {
        setShowSizeSelector(true);
      }
      return;
    }
    processAddToCart(size || 'Unique');
  };

  const processAddToCart = (size: string) => {
    addItem(product, size);
    setShowSizeSelector(false);
    setIsCartOpen(true);
    toast.success(`${product.name} añadido`, {
      description: `Talle ${size}`,
      style: {
        background: '#111',
        color: '#fff',
        border: '1px solid rgba(0,229,255,0.15)',
      }
    });
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={() => router.push(href || `/catalog/${product.id}`)}
      className="group relative bg-white/[0.02] rounded-2xl md:rounded-3xl overflow-hidden border border-white/[0.06] hover:border-[#00E5FF]/25 transition-all duration-500 cursor-pointer h-full flex flex-col"
    >
      {/* Hover glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#00E5FF]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Image */}
      <div className="aspect-square relative overflow-hidden bg-gradient-to-b from-white/[0.02] to-transparent">
        <Image
          src={product.images[0] || '/placeholder-shoe.png'}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain p-4 md:p-6 transition-transform duration-700 group-hover:scale-105"
          priority={false}
        />

        {/* Size Selector Overlay */}
        <AnimatePresence>
          {showSizeSelector && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-black/85 backdrop-blur-xl flex flex-col justify-center items-center p-4"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              <button
                onClick={(e) => { e.stopPropagation(); setShowSizeSelector(false); }}
                className="absolute top-3 right-3 text-white/40 hover:text-white p-1.5 transition-colors"
              >
                <X size={18} />
              </button>

              <p className="text-[10px] font-bold text-[#00E5FF] uppercase tracking-[0.2em] mb-4">Elegí tu talle</p>

              <div className="grid grid-cols-3 gap-2 w-full max-w-[200px]">
                {availableSizes.map(size => (
                  <button
                    key={size}
                    onClick={(e) => handleAddToCart(e, size)}
                    className="h-10 border border-white/10 bg-white/5 text-white rounded-lg text-xs font-bold hover:bg-[#00E5FF] hover:border-[#00E5FF] hover:text-black transition-all active:scale-90"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
          {availableSizes.length > 0 && availableSizes.length < 3 && (
            <span className="bg-rose-500/20 text-rose-400 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border border-rose-500/20 backdrop-blur-sm">
              Últimos
            </span>
          )}
        </div>

        {/* Quick Add (hover) */}
        {!showSizeSelector && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 h-10 w-10 md:h-11 md:w-11 bg-white text-black flex items-center justify-center rounded-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400 hover:bg-[#00E5FF] shadow-lg z-30"
          >
            <ShoppingCart size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-3 md:p-5 pt-2 md:pt-3 flex flex-col flex-1">
        <span className="text-[9px] md:text-[10px] font-semibold text-[#00E5FF]/60 uppercase tracking-wider mb-1">
          {product.category || 'Premium'}
        </span>

        <h3 className="text-sm md:text-base font-bold text-white leading-snug mb-3 line-clamp-2 group-hover:text-[#00E5FF] transition-colors duration-300">
          {product.name}
        </h3>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-lg md:text-xl font-black text-white tracking-tight">
            <span className="text-xs text-[#00E5FF] mr-0.5">$</span>
            {product.basePrice.toLocaleString('es-AR')}
          </span>

          <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:border-[#00E5FF]/30 transition-colors">
            <ArrowUpRight size={14} className="text-white/20 group-hover:text-[#00E5FF] transition-all group-hover:rotate-45 duration-300" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
