'use client';

import { useMemo, useState, useCallback, type MouseEvent } from 'react';
import Image from 'next/image';
import { Heart, ShoppingBag, ShoppingCart, ArrowUpRight, Zap, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ProductType } from '@/app/actions/products';
import type { Product } from '@/types';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import { useFavoritesStore } from '@/store/favorites-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
  brand: 'ÉTER Original',
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
    classes: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  },
  out: {
    label: 'Agotado',
    classes: 'bg-red-500/15 text-red-400 border-red-500/25',
  },
};

/* ── Skeleton Card ── */
function SkeletonCard() {
  return (
    <div className="rounded-[2rem] overflow-hidden border border-white/[0.06] bg-[#050505]">
      {/* Image skeleton */}
      <div className="aspect-[4/3] bg-white/[0.03] skeleton-shimmer" />
      {/* Content skeleton */}
      <div className="p-6 space-y-4">
        <div className="h-3 w-16 bg-white/[0.06] rounded skeleton-shimmer" />
        <div className="h-4 w-3/4 bg-white/[0.06] rounded skeleton-shimmer" />
        <div className="h-5 w-20 bg-white/[0.06] rounded skeleton-shimmer mt-2" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 pb-20">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/* ── Main Grid ── */
export const ProductGrid = ({ products }: ProductGridProps) => {
  const shouldReduceMotion = useReducedMotion();
  const { addItem, setIsOpen: setIsCartOpen } = useCartStore();
  const { toggle, has } = useFavoritesStore();
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedSizesByProduct, setSelectedSizesByProduct] = useState<Record<string, string>>({});

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
      setIsCartOpen(true);
      toast.success(`Agregado: ${product.name}`, {
          description: `Talle ${finalSize} añadido con éxito.`,
          style: {
              background: '#020202',
              color: '#fff',
              border: '1px solid rgba(0, 229, 255, 0.2)'
          }
      });
    },
    [addItem, setIsCartOpen]
  );

  const handleToggleFavorite = useCallback(
    (productId: string, event?: MouseEvent) => {
      event?.preventDefault();
      event?.stopPropagation();
      toggle(productId);
    },
    [toggle]
  );

  const getSelectedCardSize = useCallback(
    (product: ProductType) =>
      selectedSizesByProduct[product.id] || getDefaultSize(product.stock_by_size || {}),
    [selectedSizesByProduct]
  );

  const handleSelectCardSize = useCallback((productId: string, size: string, event?: MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    setSelectedSizesByProduct((prev) => ({ ...prev, [productId]: size }));
  }, []);

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 pb-20">
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
              className="outline-none group cursor-pointer flex flex-col h-full overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#050505]/55 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-[#00E5FF]/35 hover:shadow-[0_16px_40px_rgba(0,0,0,0.35)] active:scale-[0.98] relative focus-within:ring-2 focus-within:ring-[#00E5FF]/60"
            >
                {/* Aura Match Flare */}
                {product.auraScore && product.auraScore > 40 && (
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-[#00E5FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                )}

                {/* Image Section */}
                <div className="relative aspect-[4/5] overflow-hidden bg-white/[0.02]">
                  {product.images && product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.1]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-800">
                      <ShoppingBag size={48} />
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border backdrop-blur-md ${badge.classes}`}>
                      {badge.label}
                    </span>
                    
                    {product.auraScore && product.auraScore > 50 && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-black/60 text-[#00E5FF] border border-[#00E5FF]/30 backdrop-blur-xl animate-pulse">
                            <Zap size={8} className="fill-[#00E5FF]" />
                            <span>{Math.round(Math.min(product.auraScore, 99))}% Match</span>
                        </div>
                    )}
                  </div>

                  {/* Favorite button */}
                  <button
                    onClick={(e) => handleToggleFavorite(product.id, e)}
                    className={`absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-2xl backdrop-blur-md transition-all duration-300 ${isFavorite
                      ? 'bg-red-500 text-white'
                      : 'bg-black/30 text-white/60 opacity-0 group-hover:opacity-100'
                      }`}
                  >
                    <Heart size={16} className={isFavorite ? 'fill-white' : ''} />
                  </button>

                  {/* Quick Add */}
                  <button
                    onClick={(e) => handleAddToCart(product, undefined, e)}
                    disabled={!isAvailable}
                    className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00E5FF] text-black opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hover:bg-white shadow-[0_0_20px_rgba(0,229,255,0.3)] disabled:hidden"
                  >
                    <ShoppingCart size={18} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Info Section */}
                <div className="p-4 sm:p-5 lg:p-6 flex flex-col flex-1 gap-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-black text-[#00E5FF] uppercase tracking-[0.24em]">
                        {product.category || 'ÉTER COLLECTION'}
                    </span>
                    {product.auraScore && product.auraScore > 75 && (
                        <Sparkles size={10} className="text-[#00E5FF]" />
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight line-clamp-2 group-hover:text-[#00E5FF] transition-colors">
                    {product.name}
                  </h3>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/65">Talles</span>
                      <span className="text-[10px] font-semibold text-white/45">
                        {sizesAvailable.length > 0 ? `${sizesAvailable.length} disponibles` : 'Sin stock'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Talles de ${product.name}`}>
                      {sizesAvailable.length > 0 ? (
                        sizesAvailable.slice(0, 8).map(([size, qty]) => {
                          const isSelected = getSelectedCardSize(product) === size;
                          const isLow = Number(qty) <= 2;
                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={(e) => handleSelectCardSize(product.id, size, e)}
                              className={cn(
                                'min-w-8 rounded-md border px-2 py-1 text-[11px] font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF]/70',
                                isSelected
                                  ? 'border-[#00E5FF] bg-[#00E5FF]/20 text-[#b9f8ff] shadow-[0_0_12px_rgba(0,229,255,0.25)]'
                                  : 'border-white/15 bg-white/[0.02] text-white/75 hover:border-[#00E5FF]/50 hover:text-white',
                                isLow && 'border-cyan-400/45'
                              )}
                              aria-pressed={isSelected}
                              aria-label={`Talle ${size}, stock ${qty}`}
                              title={`Talle ${size} - ${qty} en stock`}
                            >
                              {size}
                            </button>
                          );
                        })
                      ) : (
                        <span className="text-[11px] text-red-300/80">No hay talles disponibles</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto pt-1 flex items-end justify-between border-t border-white/10">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Inversión</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xs text-[#00E5FF] font-black">$</span>
                            <span className="text-xl font-black text-white font-mono tracking-tighter">
                                {Number(product.base_price).toLocaleString('es-AR')}
                            </span>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:bg-[#00E5FF]/10 group-hover:border-[#00E5FF]/30 transition-all">
                        <ArrowUpRight size={18} className="text-white/20 group-hover:text-[#00E5FF] group-hover:rotate-45 transition-all" />
                    </div>
                  </div>
                </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick View Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-[#020202] border-white/5 rounded-[2.5rem] gap-0 text-white">
          {selectedProduct && (
            <div className="flex flex-col md:flex-row min-h-[500px]">
              <div className="w-full md:w-1/2 bg-[#0A0A0A] relative h-[400px] md:h-auto">
                {selectedProduct.images && selectedProduct.images[0] && (
                  <Image
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    fill
                    className="object-contain p-12"
                  />
                )}
              </div>

              <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
                <div className="mb-8">
                  <span className="text-[10px] font-black text-[#00E5FF] uppercase tracking-[0.5em] block mb-2">
                    {selectedProduct.category}
                  </span>
                  <DialogTitle className="text-4xl font-black text-white tracking-tighter uppercase leading-none mb-4">
                    {selectedProduct.name}
                  </DialogTitle>
                  <span className="text-3xl font-black text-white font-mono">
                    <span className="text-sm text-[#00E5FF]">$</span>
                    {selectedProduct.base_price.toLocaleString()}
                  </span>
                </div>

                <div className="space-y-8 flex-1">
                  <p className="text-gray-500 text-sm leading-relaxed italic uppercase font-mono">
                    {selectedProduct.description || 'CONSTRUCCIÓN PREMIUM PARA EL ESCENARIO URBANO MODERNO.'}
                  </p>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-700">Talles Disponibles</h4>
                    <div className="flex flex-wrap gap-2">
                      {sizeOptions.map(([size, qty]) => {
                        const isSelected = selectedSize === size;
                        const disabled = Number(qty) <= 0;

                        return (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            disabled={disabled}
                            className={cn(
                                "w-12 h-12 rounded-xl text-xs font-black transition-all",
                                isSelected 
                                    ? "bg-[#00E5FF] text-black shadow-[0_0_20px_rgba(0,229,255,0.4)]" 
                                    : "bg-white/5 text-gray-500 hover:text-white border border-white/5 hover:border-[#00E5FF]/30",
                                disabled && "opacity-20 cursor-not-allowed"
                            )}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-12">
                  <Button
                    className="w-full h-16 bg-[#00E5FF] text-black font-black uppercase tracking-widest text-xs hover:bg-white transition-all rounded-2xl shadow-xl shadow-[#00E5FF]/20"
                    onClick={() => handleAddToCart(selectedProduct, selectedSize)}
                    disabled={!modalAvailability.canAdd}
                  >
                    {modalAvailability.canAdd
                      ? `AGREGAR TALLE ${selectedSize || getDefaultSize(selectedProduct.stock_by_size || {})}`
                      : 'AGOTADO'}
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
