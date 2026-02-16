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
      onClick={() => {
        // Al hacer click en la card (fuera de botones), vamos al detalle
        window.location.href = `/catalog/${product.id}`;
      }}
      className="group relative bg-gradient-to-br from-[#111] to-[#050505] rounded-[2rem] overflow-hidden border border-white/5 hover:border-[#CA8A04]/30 transition-all duration-700 ease-out cursor-pointer shadow-2xl"
    >
      {/* Noise Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
      }} />

      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-[#CA8A04]/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Image Container */}
      <div className="aspect-[1/1] relative overflow-hidden bg-black/20">
        <Image
          src={product.images[0] || '/placeholder-shoe.png'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain p-8 w-full h-full group-hover:scale-110 group-hover:-rotate-3 transition-all duration-1000 ease-out drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
        />

        {/* Hover Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        {/* Quick Add Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart(e);
          }}
          className="absolute bottom-6 right-6 h-12 w-12 bg-white text-black flex items-center justify-center rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 hover:bg-[#CA8A04] hover:text-black active:scale-95 z-30"
          aria-label="Agregar al carrito"
        >
          <ShoppingCart size={20} />
        </button>

        {/* Status Badge */}
        <div className="absolute top-6 left-6 z-20">
          {product.status === 'active' ? (
            <span className="px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-[10px] font-bold text-emerald-400 uppercase tracking-widest backdrop-blur-md">
              Disponible
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 text-[10px] font-bold text-rose-400 uppercase tracking-widest backdrop-blur-md">
              Agotado
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-8 relative z-20">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold text-[#CA8A04] uppercase tracking-[0.3em] opacity-80">
            {product.category}
          </p>
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
            EDICIÓN_LIMITED
          </span>
        </div>

        <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-[#CA8A04] transition-colors duration-500 line-clamp-1 mb-4 uppercase">
          {product.name}
        </h3>

        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-light text-white tracking-tighter">
              ${product.basePrice.toLocaleString('es-AR')}
            </span>
          </div>

          <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
            {availableSizes.length > 0 && availableSizes[0] !== 'Unique' ? (
              availableSizes.slice(0, 5).map(size => (
                <button
                  key={size}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedSize(size);
                  }}
                  className={`
                        h-8 min-w-[32px] px-2 rounded-lg text-xs font-mono font-bold border transition-all duration-300
                        ${selectedSize === size
                      ? 'bg-[#CA8A04] border-[#CA8A04] text-black shadow-[0_0_15px_rgba(202,138,4,0.4)]'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-[#CA8A04] hover:text-[#CA8A04]'}
                    `}
                >
                  {size}
                </button>
              ))
            ) : (
              <span className="h-8 flex items-center text-[10px] font-mono text-gray-600 uppercase tracking-tighter">Sin talles disponibles</span>
            )}
            {availableSizes.length > 5 && (
              <span className="h-8 flex items-center text-[10px] font-mono text-gray-600 uppercase tracking-tighter">+{availableSizes.length - 5} MÁS</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
