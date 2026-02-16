'use client';

import { useMemo, useState, useCallback, type MouseEvent } from 'react';
import Image from 'next/image';
import { Heart, ShoppingBag, ShoppingCart } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ProductType } from '@/app/actions/products';
import type { Product } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import { useFavoritesStore } from '@/store/favorites-store';
import { toast } from 'sonner';

interface ProductGridProps {
  products: ProductType[];
}

/* ── Stock helpers ── */
const getTotalStock = (stockBySize: Record<string, number>) =>
  Object.values(stockBySize || {}).reduce((sum, v) => sum + Number(v || 0), 0);

const getAvailableSizes = (stockBySize: Record<string, number>) =>
  Object.entries(stockBySize || {})
    .filter(([, qty]) => Number(qty || 0) > 0)
    .sort(([a], [b]) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      return isNaN(numA) || isNaN(numB) ? a.localeCompare(b) : numA - numB;
    });

const getDefaultSize = (stockBySize: Record<string, number>) => {
  const available = getAvailableSizes(stockBySize);
  return available?.[0]?.[0] || 'Unique';
};

const mapToCartProduct = (product: ProductType): Product => ({
  id: product.id,
  name: product.name,
  description: product.description || '',
  category: product.category || 'General',
  basePrice: product.base_price,
  images: product.images || [],
  stockBySize: product.stock_by_size || {},
  totalStock: getTotalStock(product.stock_by_size || {}),
  status: product.is_active ? 'active' : 'inactive',
  createdAt: product.created_at ? new Date(product.created_at) : new Date(),
});

/* ── Availability badge logic ── */
type StockLevel = 'available' | 'low' | 'out';

function getStockLevel(product: ProductType): StockLevel {
  const total = getTotalStock(product.stock_by_size || {});
  if (total <= 0) return 'out';
  if (total <= 3) return 'low';
  return 'available';
}

const stockBadgeConfig: Record<StockLevel, { label: string; classes: string }> = {
  available: {
    label: 'Disponible',
    classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  },
  low: {
    label: 'Últimas unidades',
    classes: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  },
  out: {
    label: 'Agotado',
    classes: 'bg-red-500/15 text-red-400 border-red-500/25',
  },
};

/* ── Skeleton Card ── */
function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-[#141414]">
      {/* Image skeleton */}
      <div className="aspect-[4/3] bg-[#1a1a1a] skeleton-shimmer" />
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 bg-white/[0.06] rounded skeleton-shimmer" />
        <div className="h-4 w-3/4 bg-white/[0.06] rounded skeleton-shimmer" />
        <div className="h-5 w-20 bg-white/[0.06] rounded skeleton-shimmer mt-2" />
        <div className="flex gap-1.5 mt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 w-8 bg-white/[0.06] rounded skeleton-shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 pb-20">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/* ── Main Grid ── */
export const ProductGrid = ({ products }: ProductGridProps) => {
  const shouldReduceMotion = useReducedMotion();
  const { addItem } = useCartStore();
  const { toggle, has } = useFavoritesStore();
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');

  const openQuickView = useCallback((product: ProductType) => {
    setSelectedProduct(product);
    setSelectedSize(getDefaultSize(product.stock_by_size || {}));
  }, []);

  const handleAddToCart = useCallback(
    (product: ProductType, size?: string, event?: MouseEvent) => {
      event?.preventDefault();
      event?.stopPropagation();
      const finalSize = size || getDefaultSize(product.stock_by_size || {});
      addItem(mapToCartProduct(product), finalSize);
      toast.success(`Agregado al carrito: ${product.name}`);
    },
    [addItem]
  );

  const handleToggleFavorite = useCallback(
    (productId: string, event?: MouseEvent) => {
      event?.preventDefault();
      event?.stopPropagation();
      toggle(productId);
    },
    [toggle]
  );

  const sizeOptions = useMemo(() => {
    if (!selectedProduct) return [];
    const available = getAvailableSizes(selectedProduct.stock_by_size || {});
    if (available.length > 0) return available;
    return [['Unique', 0]] as [string, number][];
  }, [selectedProduct]);

  const modalAvailability = useMemo(() => {
    if (!selectedProduct) return { canAdd: false, totalStock: 0 };
    const totalStock = getTotalStock(selectedProduct.stock_by_size || {});
    const hasStockData = Object.keys(selectedProduct.stock_by_size || {}).length > 0;
    const selectedStock = Number(selectedProduct.stock_by_size?.[selectedSize] || 0);
    const canAdd = selectedProduct.is_active && (!hasStockData || selectedStock > 0);
    return { canAdd, totalStock };
  }, [selectedProduct, selectedSize]);

  return (
    <>
      {/* ── Product Grid — 4 cols desktop · 2 tablet · 2 mobile ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6 pb-20">
        {products?.map((product, index) => {
          const stockLevel = getStockLevel(product);
          const badge = stockBadgeConfig[stockLevel];
          const isAvailable = stockLevel !== 'out';
          const isFavorite = has(product.id);
          const sizesAvailable = getAvailableSizes(product.stock_by_size || {});

          return (
            <motion.div
              key={product.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.35, delay: Math.min(index * 0.03, 0.3) }
              }
              onClick={() => openQuickView(product)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openQuickView(product);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Vista rápida de ${product.name}`}
              className="outline-none focus-visible:ring-2 focus-visible:ring-[#CA8A04]/60 rounded-xl"
            >
              <div className="group cursor-pointer flex flex-col h-full overflow-hidden rounded-xl border border-white/[0.06] bg-[#141414] transition-all duration-300 hover:border-[#ffd900]/20 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08),0_8px_32px_rgba(0,0,0,0.24)] active:scale-[0.99]">
                {/* ── Image — 4:3 aspect ratio with lazy loading ── */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#1a1a1a]">
                  {product.images && product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                      <ShoppingBag size={28} />
                    </div>
                  )}

                  {/* Availability Badge */}
                  <span
                    className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border backdrop-blur-sm ${badge.classes}`}
                  >
                    {badge.label}
                  </span>

                  {/* Favorite button */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleFavorite(product.id, e)}
                    className={`absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-all duration-300 ${isFavorite
                      ? 'bg-red-500/90 text-white scale-100'
                      : 'bg-black/30 text-white/60 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-black/50'
                      }`}
                  >
                    <Heart size={13} className={isFavorite ? 'fill-white' : undefined} />
                  </button>

                  {/* Quick add — appears on hover */}
                  <button
                    type="button"
                    onClick={(e) => handleAddToCart(product, undefined, e)}
                    disabled={!isAvailable}
                    aria-label="Agregar al carrito"
                    className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#ffd900] text-black opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-yellow-300 hover:scale-110 active:scale-95 disabled:opacity-0 shadow-lg shadow-black/30"
                  >
                    <ShoppingCart size={15} strokeWidth={2.5} />
                  </button>

                  {/* Out-of-stock overlay */}
                  {!isAvailable && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">
                        Agotado
                      </span>
                    </div>
                  )}
                </div>

                {/* ── Card Info — generous spacing ── */}
                <div className="p-4 flex flex-col flex-1 gap-2">
                  {/* Category */}
                  <span className="text-[9px] sm:text-[10px] font-semibold text-[#ffd900]/70 uppercase tracking-[0.15em]">
                    {product.category || 'General'}
                  </span>

                  {/* Name — 16px */}
                  <h3 className="font-display text-[16px] font-semibold text-white/90 line-clamp-2 leading-snug">
                    {product.name}
                  </h3>

                  {/* Price — 18px bold */}
                  <div className="mt-auto pt-3">
                    <span
                      suppressHydrationWarning
                      className="text-[16px] sm:text-[18px] font-bold text-white font-display"
                    >
                      ${Number(product.base_price).toLocaleString('es-AR')}
                    </span>
                  </div>

                  {/* Sizes preview */}
                  {sizesAvailable.length > 0 && sizesAvailable[0][0] !== 'Unique' && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {sizesAvailable.slice(0, 5).map(([size]) => (
                        <span
                          key={size}
                          className="text-[10px] text-gray-500 bg-white/[0.04] border border-white/[0.06] rounded px-1.5 py-0.5 font-medium"
                        >
                          {size}
                        </span>
                      ))}
                      {sizesAvailable.length > 5 && (
                        <span className="text-[10px] text-gray-600 self-center">
                          +{sizesAvailable.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Quick View Modal (unchanged) ── */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-[#0a0a0a]/95 backdrop-blur-3xl border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.5)] rounded-[2rem] gap-0 text-white">
          {selectedProduct && (
            <div className="flex flex-col md:flex-row h-full md:h-auto md:max-h-[85vh]">
              <div className="w-full md:w-1/2 bg-[#1a1a1a] relative h-64 md:h-auto">
                {selectedProduct.images && selectedProduct.images[0] ? (
                  <Image
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <ShoppingBag size={64} />
                  </div>
                )}
              </div>

              <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col flex-1 overflow-y-auto bg-black/20">
                <DialogHeader className="mb-6">
                  <p className="text-[#ffd900] font-semibold text-xs uppercase tracking-widest mb-2">
                    {selectedProduct.category}
                  </p>
                  <DialogTitle className="font-display text-2xl md:text-3xl font-bold text-white leading-tight mb-2">
                    {selectedProduct.name}
                  </DialogTitle>
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl md:text-3xl font-bold text-[#ffd900] font-display">
                      ${selectedProduct.base_price.toLocaleString()}
                    </span>
                  </div>
                </DialogHeader>

                <div className="space-y-6 flex-1">
                  <p className="text-gray-400 leading-relaxed text-sm font-body">
                    {selectedProduct.description ||
                      'Calidad premium garantizada. Stock limitado disponible para entrega inmediata.'}
                  </p>

                  <div className="space-y-3 pt-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                      Talles
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {sizeOptions.map(([size, qty]) => {
                        const isSelected = selectedSize === size;
                        const disabled = Number(qty) <= 0;

                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            disabled={disabled}
                            className={`w-10 h-10 rounded-lg text-sm font-bold transition-all duration-300 ${isSelected
                              ? 'bg-[#ffd900] text-black shadow-[0_0_15px_rgba(255,217,0,0.3)]'
                              : 'bg-white/5 border border-white/10 text-gray-300 hover:border-[#ffd900]/40 hover:text-[#ffd900]'
                              } ${disabled ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex gap-4">
                  <Button
                    className="flex-1 h-12 bg-[#ffd900] text-black font-bold uppercase tracking-widest hover:bg-yellow-400"
                    onClick={() => handleAddToCart(selectedProduct, selectedSize)}
                    disabled={!modalAvailability.canAdd}
                  >
                    {modalAvailability.canAdd ? 'Agregar al Carrito' : 'Sin Stock'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
