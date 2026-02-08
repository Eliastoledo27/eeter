'use client';

import { useMemo, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, Eye, Heart, ShoppingBag, ShoppingCart, ShieldCheck, Truck } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ProductType } from '@/app/actions/products';
import type { Product } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import { useFavoritesStore } from '@/store/favorites-store';
import { toast } from 'sonner';

const BLUR = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

interface ProductGridProps {
  products: ProductType[];
}

const getTotalStock = (stockBySize: Record<string, number>) =>
  Object.values(stockBySize || {}).reduce((sum, value) => sum + Number(value || 0), 0);

const getAvailableSizes = (stockBySize: Record<string, number>) => {
  return Object.entries(stockBySize || {})
    .filter(([, qty]) => Number(qty || 0) > 0)
    .sort(([a], [b]) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      return isNaN(numA) || isNaN(numB) ? a.localeCompare(b) : numA - numB;
    });
};

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

export const ProductGrid = ({ products }: ProductGridProps) => {
  const shouldReduceMotion = useReducedMotion();
  const { addItem } = useCartStore();
  const { toggle, has } = useFavoritesStore();
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');

  const openQuickView = (product: ProductType) => {
    setSelectedProduct(product);
    setSelectedSize(getDefaultSize(product.stock_by_size || {}));
  };

  const handleAddToCart = (product: ProductType, size?: string, event?: MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();

    const fallbackSize = getDefaultSize(product.stock_by_size || {});
    const finalSize = size || fallbackSize;
    addItem(mapToCartProduct(product), finalSize);
    toast.success(`Agregado al carrito: ${product.name}`);
  };

  const handleToggleFavorite = (productId: string, event?: MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    toggle(productId);
  };

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
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-7 lg:gap-8 pb-20">
        {products?.map((product, index) => {
          const totalStock = getTotalStock(product.stock_by_size || {});
          const isAvailable = Boolean(product.is_active) && totalStock > 0;
          const isFavorite = has(product.id);

          return (
            <motion.div
              key={product.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: index * 0.03 }}
              onClick={() => openQuickView(product)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openQuickView(product);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Vista rapida de ${product.name}`}
              className="outline-none focus-visible:ring-2 focus-visible:ring-[#CA8A04]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF9] rounded-[28px]"
            >
              <div className="group cursor-pointer flex flex-col h-full overflow-hidden rounded-[2.5rem] border border-white bg-white/40 backdrop-blur-2xl transition-all duration-500 hover:border-amber-500/30 hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] active:scale-[0.98] group">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#F5F4F1]">
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#C4C4C4]">
                      <ShoppingBag size={32} />
                    </div>
                  )}

                  <div className="absolute top-4 left-4 flex flex-col items-start gap-2">
                    <span className="bg-primary/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] text-white">
                      {product.category || 'General'}
                    </span>
                    {Number(product.base_price) > 50000 && (
                      <span className="bg-accent/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] text-white">
                        Top Choice
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(event) => handleToggleFavorite(product.id, event)}
                    aria-pressed={isFavorite}
                    aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    className={`absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border transition-all ${isFavorite
                      ? 'border-accent bg-accent text-white'
                      : 'border-white/10 bg-white/80 text-foreground hover:border-accent hover:text-accent'
                      }`}
                  >
                    <Heart size={16} className={isFavorite ? 'fill-white' : undefined} />
                  </button>
                </div>

                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <div className="flex flex-col gap-1 mb-3">
                    <p className="text-[10px] font-bold text-accent uppercase tracking-widest">
                      Exclusive Edition
                    </p>
                    <h3 className="font-heading text-lg sm:text-xl font-medium text-foreground line-clamp-2 leading-tight">
                      {product.name}
                    </h3>
                  </div>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span suppressHydrationWarning className="text-lg font-black text-[#CA8A04]">
                      ${Number(product.base_price).toLocaleString('es-AR')}
                    </span>
                    <span suppressHydrationWarning className="text-[10px] text-muted-foreground uppercase tracking-wider line-through decoration-black/20">
                      ${Math.round(product.base_price * 1.3).toLocaleString('es-AR')}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-6">
                    {product.description || 'Edición premium con materiales de alta calidad y diseño exclusivo para revendedores.'}
                  </p>

                  <div className="mt-auto flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(event) => handleAddToCart(product, undefined, event)}
                        disabled={!isAvailable}
                        title={isAvailable ? 'Agregar al carrito' : 'Sin stock disponible'}
                        className="flex-1 rounded-xl bg-primary px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.25em] text-white transition-all duration-500 hover:bg-black hover:shadow-xl hover:shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
                      >
                        {isAvailable ? 'Comprar Ahora' : 'Agotado'}
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          openQuickView(product);
                        }}
                        title="Vista rápida"
                        className="flex items-center justify-center rounded-xl border border-black/5 bg-white/60 backdrop-blur-md px-4 py-3.5 text-foreground hover:border-accent hover:text-accent transition-all active:scale-95 shadow-sm"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <div className="flex gap-1 flex-wrap max-w-[60%]">
                        {getAvailableSizes(product.stock_by_size || {}).slice(0, 4).map(([size]) => (
                          <span key={size} className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {size}
                          </span>
                        ))}
                        {getAvailableSizes(product.stock_by_size || {}).length > 4 && (
                          <span className="text-[9px] font-bold text-slate-300 px-1 py-0.5">+</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 group/btn cursor-pointer" onClick={() => openQuickView(product)}>
                        <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-muted-foreground group-hover/btn:text-accent transition-colors">Detalles</span>
                        <ArrowRight size={12} className="text-accent transition-transform duration-300 group-hover/btn:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {(!products || products.length === 0) && (
          <div className="col-span-full py-20 text-center">
            <p className="text-[#44403C] text-lg">No se encontraron productos.</p>
          </div>
        )}
      </div>

      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-white/80 backdrop-blur-3xl border border-white/40 shadow-[0_40px_120px_rgba(0,0,0,0.15)] rounded-[2.5rem] gap-0">
          {selectedProduct && (
            <div className="flex flex-col md:flex-row h-[90vh] md:h-auto md:max-h-[85vh]">
              <div className="w-full md:w-1/2 bg-[#F5F5F4] relative h-64 md:h-auto">
                {selectedProduct.images && selectedProduct.images[0] ? (
                  <img
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                    <ShoppingBag size={64} />
                  </div>
                )}
                <div className="absolute top-6 left-6 flex items-center gap-2">
                  <span className="bg-primary/90 backdrop-blur px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                    {selectedProduct.category || 'General'}
                  </span>
                  <span className="rounded-full bg-accent px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                    {modalAvailability.totalStock > 0 ? 'Stock Real' : 'Agotado'}
                  </span>
                </div>
              </div>

              <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col overflow-y-auto bg-white/40">
                <DialogHeader className="mb-8">
                  <DialogTitle className="font-heading text-3xl md:text-4xl font-medium text-foreground leading-tight mb-3">
                    {selectedProduct.name}
                  </DialogTitle>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-medium text-foreground font-heading">
                      ${selectedProduct.base_price.toLocaleString()}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground line-through decoration-black/20">
                      ${Math.round(selectedProduct.base_price * 1.3).toLocaleString()}
                    </span>
                  </div>
                </DialogHeader>

                <div className="space-y-8 flex-1">
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-3">
                      <span className="w-8 h-px bg-accent"></span>
                      Especificaciones
                    </h4>
                    <p className="text-foreground/70 leading-relaxed text-sm md:text-base font-body">
                      {selectedProduct.description || 'Nuestra curaduría Éter garantiza piezas de alta calidad, diseñadas para el mercado premium de reventa en Argentina.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-black/[0.03] shadow-sm">
                      <div className="flex items-center gap-3 text-primary mb-2 font-bold text-xs uppercase tracking-widest">
                        <ShieldCheck size={18} className="text-accent" /> Garantía
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug">Autenticidad verificada Éter Store.</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-black/[0.03] shadow-sm">
                      <div className="flex items-center gap-3 text-primary mb-2 font-bold text-xs uppercase tracking-widest">
                        <Truck size={18} className="text-accent" /> Envío MDQ
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug">Despacho inmediato a todo el país.</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-3">
                      <span className="w-8 h-px bg-accent"></span>
                      Talles Disponibles
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                      {sizeOptions.map(([size, qty]) => {
                        const isSelected = selectedSize === size;
                        const disabled = Number(qty) <= 0;

                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            disabled={disabled}
                            className={`w-12 h-12 rounded-xl border text-sm font-bold transition-all duration-300 ${isSelected
                              ? 'border-primary bg-primary text-white shadow-xl shadow-primary/20 scale-105'
                              : 'border-black/5 bg-white text-foreground hover:border-accent hover:text-accent shadow-sm'
                              } ${disabled ? 'opacity-30 cursor-not-allowed grayscale' : 'hover:scale-105 active:scale-95'}`}
                            aria-pressed={isSelected}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-black/5 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <Button
                      className="flex-1 h-14 text-sm rounded-xl font-bold uppercase tracking-[0.2em] gap-3 bg-primary text-white shadow-2xl shadow-primary/20 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                      onClick={() => handleAddToCart(selectedProduct, selectedSize)}
                      disabled={!modalAvailability.canAdd}
                    >
                      Añadir al Carrito <ShoppingCart size={18} />
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleToggleFavorite(selectedProduct.id)}
                      className={`flex h-14 w-14 items-center justify-center rounded-xl border transition-all duration-500 active:scale-95 ${has(selectedProduct.id)
                        ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20'
                        : 'bg-white border-black/5 text-foreground hover:border-accent hover:text-accent shadow-sm'}`}
                      aria-label="Favorito"
                    >
                      <Heart size={20} className={has(selectedProduct.id) ? 'fill-white' : undefined} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                    <span>Precio Mayorista</span>
                    <Link href="/register" className="text-accent hover:text-primary transition-colors border-b border-accent/20">
                      Crear Cuenta de Revendedor
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
