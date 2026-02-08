'use client';

import { Product } from '@/types';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { toast } from 'sonner';
import Image from 'next/image';
import { useState, useMemo } from 'react';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartStore();
  const [selectedSize, setSelectedSize] = useState<string>('');

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
      // If has sizes but none selected, try to select first or error
      if (availableSizes.length === 1) {
        addItem(product, availableSizes[0]);
        toast.success(`Agregado: ${product.name}`, {
          style: { background: '#1C1917', color: '#FAFAF9', border: '1px solid #CA8A04' }
        });
        return;
      }

      toast.error('Por favor selecciona un talle', {
        style: { background: '#1C1917', color: '#FAFAF9', border: '1px solid #CA8A04' }
      });
      return;
    }

    const sizeToAdd = selectedSize || (availableSizes.length > 0 ? availableSizes[0] : 'Unique');

    addItem(product, sizeToAdd);
    toast.success(`Agregado: ${product.name} (Talle ${sizeToAdd})`, {
      style: {
        background: '#1C1917',
        color: '#FAFAF9',
        border: '1px solid #CA8A04',
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-accent/10 cursor-pointer"
    >
      {/* Image Container */}
      <div className="aspect-[1/1] relative overflow-hidden bg-[#F5F5F4]">
        <Image
          src={product.images[0] || '/placeholder-shoe.png'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Quick Add Button */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-4 right-4 h-11 w-11 bg-primary text-white flex items-center justify-center rounded-full shadow-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hover:bg-accent hover:scale-110 active:scale-95"
          aria-label="Agregar al carrito"
        >
          <ShoppingCart size={18} />
        </button>

        {/* Stock Badge */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(product as any).is_active ? (
          <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
            En Stock
          </div>
        ) : (
          <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-rose-500/10 backdrop-blur-md border border-rose-500/20 text-[10px] font-bold text-rose-600 uppercase tracking-widest">
            Sin Stock
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">
            {product.category}
          </p>
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
            MDQ Orig.
          </span>
        </div>

        <h3 className="font-heading text-lg font-medium text-foreground leading-tight group-hover:text-accent transition-colors line-clamp-1">
          {product.name}
        </h3>

        <div className="flex flex-col gap-3 pt-2 border-t border-black/5">
          <div className="flex items-center justify-between">
            <span className="text-xl font-medium text-foreground font-heading">
              ${product.basePrice.toLocaleString()}
            </span>
          </div>

          {availableSizes.length > 0 && availableSizes[0] !== 'Unique' && (
            <div className="flex flex-wrap gap-1.5" onClick={(e) => e.preventDefault()}>
              {availableSizes.slice(0, 5).map(size => (
                <button
                  key={size}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedSize(size);
                  }}
                  className={`
                            h-6 min-w-[24px] px-1 rounded text-[10px] font-bold border transition-all
                            ${selectedSize === size
                      ? 'bg-primary border-primary text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-primary hover:text-primary'}
                        `}
                >
                  {size}
                </button>
              ))}
              {availableSizes.length > 5 && (
                <span className="text-[10px] text-slate-400 self-center">+{availableSizes.length - 5}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
