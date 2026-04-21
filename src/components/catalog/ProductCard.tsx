'use client';

import { Product } from '@/types';
import { ShoppingCart, ArrowUpRight, X, Info } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { toast } from 'sonner';
import Image from 'next/image';
import { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  href?: string;
  viewMode?: 'grid' | 'list';
}

export function ProductCard({ product, href, viewMode = 'grid' }: ProductCardProps) {
  const router = useRouter();
  const { addItem, setIsOpen: setIsCartOpen } = useCartStore();
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.push(href || `/catalog/${product.id}`)}
        className="group relative bg-white/[0.02] border border-white/[0.06] hover:border-[#00E5FF]/30 p-4 flex items-center gap-6 cursor-pointer transition-all duration-300"
      >
        <div className="w-20 h-20 relative bg-white/[0.03] rounded-xl overflow-hidden shrink-0">
          <Image
            src={product.images[0] || '/placeholder-shoe.png'}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-110"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black text-[#00E5FF] uppercase tracking-widest">{product.category}</span>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <span className="text-[10px] text-white/40 uppercase tracking-widest">In Stock</span>
          </div>
          <h3 className="text-sm md:text-base font-bold text-white truncate group-hover:text-[#00E5FF] transition-colors">
            {product.name}
          </h3>
          <div className="flex flex-wrap gap-1 mt-2">
            {availableSizes.slice(0, 5).map(s => (
              <span key={s} className="text-[9px] font-bold px-2 py-0.5 bg-white/5 border border-white/5 text-white/40 rounded">
                {s}
              </span>
            ))}
            {availableSizes.length > 5 && <span className="text-[9px] text-white/20">+{availableSizes.length - 5}</span>}
          </div>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <span className="text-lg font-black text-white">
            ${product.basePrice.toLocaleString('es-AR')}
          </span>
          <button 
            onClick={handleAddToCart}
            className="h-10 px-4 bg-[#00E5FF] text-black text-[10px] font-black uppercase tracking-wider hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] active:scale-95 transition-all"
          >
            AÑADIR
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={() => router.push(href || `/catalog/${product.id}`)}
      className="group relative bg-[#0A0A0A] rounded-2xl md:rounded-3xl overflow-hidden border border-white/[0.06] hover:border-[#00E5FF]/25 transition-all duration-500 cursor-pointer h-full flex flex-col"
    >
      {/* Hover glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#00E5FF]/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Image / Video Container */}
      <div className="aspect-[4/5] relative overflow-hidden bg-gradient-to-b from-white/[0.02] to-transparent">
        <AnimatePresence mode="wait">
          {isHovered && product.id.length % 2 === 0 ? ( // Simulating video availability for demonstration
            <motion.div
              key="video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10"
            >
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                src="https://tolzrvsykzmvndvomllt.supabase.co/storage/v1/object/public/products/videos/loop-360-preview.mp4"
                poster={product.images[0]}
              />
            </motion.div>
          ) : (
            <motion.div
              key="image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <Image
                src={product.images[0] || '/placeholder-shoe.png'}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-contain p-4 md:p-6 transition-transform duration-700 group-hover:scale-105"
                priority={false}
              />
            </motion.div>
          )}
        </AnimatePresence>

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
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-20">
          {availableSizes.length > 0 && availableSizes.length < 3 && (
            <span className="bg-rose-500/20 text-rose-400 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border border-rose-500/20 backdrop-blur-sm">
              Últimos
            </span>
          )}
          {product.category === 'Running' && (
            <span className="bg-[#00E5FF]/20 text-[#00E5FF] px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border border-[#00E5FF]/20 backdrop-blur-sm">
              Performance
            </span>
          )}
        </div>

        {/* Fit Tip (Tooltip Style) */}
        <div className="absolute bottom-4 left-4 z-20 group/tip">
          <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full pl-1.5 pr-3 py-1 hover:border-[#00E5FF]/50 transition-all cursor-help">
            <Info size={10} className="text-[#00E5FF]" />
            <span className="text-[8px] font-black uppercase tracking-widest text-white/70">Calce</span>
          </div>
          <div className="absolute bottom-full left-0 mb-2 w-48 p-3 bg-[#111] border border-[#00E5FF]/30 rounded-xl opacity-0 translate-y-2 pointer-events-none group-hover/tip:opacity-100 group-hover/tip:translate-y-0 transition-all z-50">
            <p className="text-[10px] text-white/80 leading-relaxed font-bold italic">
            &ldquo;Seleccioná el talle que usás habitualmente en tus zapatillas.&rdquo;
            </p>
            <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-[#111] border-b border-r border-[#00E5FF]/30 rotate-45" />
          </div>
        </div>

        {/* Quick Add (hover) */}
        {!showSizeSelector && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-4 right-4 h-12 w-12 bg-white text-black flex items-center justify-center rounded-2xl opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hover:bg-[#00E5FF] shadow-[0_8px_30px_rgba(0,0,0,0.5)] z-30"
          >
            <ShoppingCart size={18} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-5 pt-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-bold text-[#00E5FF] uppercase tracking-widest">
            {product.category || 'Premium Collection'}
          </span>
          <span className="w-1 h-1 rounded-full bg-white/10" />
          <span className="text-[9px] text-white/30 uppercase tracking-[0.2em]">Brasil</span>
        </div>

        <h3 className="text-base md:text-lg font-black text-white leading-snug mb-2 line-clamp-2 group-hover:text-[#00E5FF] transition-colors duration-300 uppercase tracking-tight">
          {product.name}
        </h3>

        {/* Sizes visual indicator */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {availableSizes.slice(0, 6).map(size => (
            <span 
              key={size}
              className="px-2 py-0.5 bg-white/[0.03] border border-white/[0.06] rounded text-[9px] font-bold text-white/40 group-hover:text-white/60 group-hover:border-[#00E5FF]/20 transition-all"
            >
              {size}
            </span>
          ))}
          {availableSizes.length > 6 && (
            <span className="text-[9px] font-bold text-white/20 ml-0.5">+{availableSizes.length - 6}</span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-white/[0.04] pt-4">
          <div className="flex flex-col">
            <span className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-0.5">Precio Elite</span>
            <span className="text-xl md:text-2xl font-black text-white tracking-tighter">
              <span className="text-xs text-[#00E5FF] mr-0.5">$</span>
              {product.basePrice.toLocaleString('es-AR')}
            </span>
          </div>

          <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center group-hover:border-[#00E5FF]/30 group-hover:bg-[#00E5FF]/5 transition-all">
            <ArrowUpRight size={18} className="text-white/20 group-hover:text-[#00E5FF] transition-all group-hover:rotate-45 duration-500" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
