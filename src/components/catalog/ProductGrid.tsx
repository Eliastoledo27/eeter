'use client';

import { useSearchParams } from 'next/navigation';
import { useCatalog } from '@/hooks/useCatalog';
import { ProductCard } from './ProductCard';
import { ProductSkeleton } from './ProductSkeleton';
import { useEffect, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

function ProductGridContent() {
  const searchParams = useSearchParams();
  const { filterProducts, loading } = useCatalog();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'Todos';

  const filteredProducts = filterProducts({ query, category });

  if (!mounted || loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8 lg:gap-10">
        {[...Array(10)].map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-32 text-center"
      >
        <div className="w-24 h-24 bg-white/[0.02] border border-white/5 rounded-[2rem] flex items-center justify-center mb-8">
           <ShoppingBag className="text-[#00E5FF]/40" size={40} />
        </div>
        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">No se encontraron productos</h3>
        <p className="text-gray-500 max-w-xs text-sm">Prueba ajustando los filtros o buscando otros modelos en nuestro catálogo ÉTER.</p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8 lg:gap-10">
      <AnimatePresence mode="popLayout">
        {filteredProducts.map((product, index) => (
          <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ 
              duration: 0.4, 
              delay: index * 0.05,
              ease: [0.23, 1, 0.32, 1]
            }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function ProductGrid() {
  return (
    <Suspense fallback={
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8 lg:gap-10">
        {[...Array(10)].map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    }>
      <ProductGridContent />
    </Suspense>
  );
}
