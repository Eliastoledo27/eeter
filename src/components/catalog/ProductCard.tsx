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

    // If no size provided and multiple sizes exist, show selector
    if (!size && availableSizes.length > 0) {
      if (availableSizes.length === 1) {
        processAddToCart(availableSizes[0]);
      } else {
        setShowSizeSelector(true);
      }
      return;
    }

    // Process add with either selected size or default
    processAddToCart(size || 'Unique');
  };

  const processAddToCart = (size: string) => {
    addItem(product, size);
    setShowSizeSelector(false);
    setIsCartOpen(true);
    toast.success(`Agregado: ${product.name} (Talle ${size})`, {
      style: { background: '#0A0A0A', color: '#FAFAF9', border: '1px solid #C88A04' }
    });
  };

  return (
    <div
      onClick={() => router.push(href || `/catalog/${product.id}`)}
      className="group relative bg-[#0A0A0A] rounded-xl overflow-hidden border border-white/5 hover:border-[#C88A04]/40 transition-colors duration-200 cursor-pointer h-full flex flex-col"
    >
      {/* Image Container */}
      <div className="aspect-square relative overflow-hidden bg-transparent">
        <Image
          src={product.images[0] || '/placeholder-shoe.png'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-105"
          priority={false}
        />

        {/* Size Selector Overlay */}
        <AnimatePresence>
          {showSizeSelector && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute inset-0 z-40 bg-black/90 backdrop-blur-sm p-4 flex flex-col justify-center items-center"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <button
                onClick={() => setShowSizeSelector(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-white p-2"
              >
                <X size={24} />
              </button>

              <h4 className="text-[10px] font-black text-[#C88A04] uppercase tracking-[0.2em] mb-4">Selecciona tu talle</h4>

              <div className="grid grid-cols-4 gap-2 w-full max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                {availableSizes.map(size => (
                  <button
                    key={size}
                    onClick={(e) => handleAddToCart(e, size)}
                    className="h-10 border border-white/20 bg-white/5 text-white rounded-lg text-sm font-black hover:bg-[#C88A04] hover:border-[#C88A04] hover:text-black transition-all"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Simple Label */}
        {product.status === 'active' && !showSizeSelector && (
          <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded-sm text-[8px] font-bold text-white uppercase tracking-wider z-20">
            Premium
          </div>
        )}

        {/* Action Button */}
        {!showSizeSelector && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-2 right-2 h-10 w-10 bg-white text-black flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-[#C88A04] z-30"
          >
            <ShoppingCart size={18} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Info Section */}
      <div className="p-3 flex flex-col flex-1">
        <span className="text-[9px] font-bold text-[#C88A04] uppercase tracking-wider mb-0.5">
          {product.category || 'ÉTER'}
        </span>

        <h3 className="text-sm font-bold text-white uppercase line-clamp-1 group-hover:text-[#C88A04] transition-colors mb-2">
          {product.name}
        </h3>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-base font-bold text-white">
            <span className="text-xs mr-0.5 opacity-50">$</span>
            {product.basePrice.toLocaleString('es-AR')}
          </span>
          <ArrowUpRight size={14} className="text-gray-600 group-hover:text-[#C88A04]" />
        </div>
      </div>
    </div>
  );
}
