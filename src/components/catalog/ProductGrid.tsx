'use client';

import { useSearchParams } from 'next/navigation';
import { useCatalog } from '@/hooks/useCatalog';
import { ProductCard } from './ProductCard';
import { useEffect, useState, Suspense } from 'react';

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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-[300px] bg-gray-100 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-400">No se encontraron productos.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export function ProductGrid() {
  return (
    <Suspense fallback={
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-[300px] bg-gray-100 animate-pulse rounded-2xl" />
        ))}
      </div>
    }>
      <ProductGridContent />
    </Suspense>
  );
}
