'use client';

import { motion } from 'framer-motion';
import { Share2, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { GlassCard, Badge } from './GlassCard';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  images: string[];
  description?: string;
}

interface DashboardCatalogProps {
  user: {
    full_name: string;
    commission_rate?: number;
  };
  products: Product[];
}

export const DashboardCatalog = ({ user, products }: DashboardCatalogProps) => {
  const commission = user.commission_rate || 0;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="space-y-10"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Badge variant="gold">Tu Catálogo Oficial</Badge>
          <h1 className="text-4xl font-black text-white mt-2 tracking-tighter uppercase">Showroom {user.full_name}</h1>
          <p className="text-slate-400 mt-2 max-w-lg">
            Precios actualizados con tu comisión del {(commission * 100).toFixed(0)}%. Compartí tu link para generar ventas automáticas.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-2xl transition-all text-sm font-bold border border-white/10 text-white shadow-lg hover:shadow-slate-700/20">
          <Share2 size={18} /> Copiar Link Personalizado
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        {products.map((product) => {
          // Use 'price' from DB column, fallback to 0
          const basePrice = product.price || 0;
          const finalPrice = basePrice * (1 + commission);
          const image = product.images && product.images.length > 0 ? product.images[0] : null;
          
          return (
            <GlassCard key={product.id} className="group cursor-pointer flex flex-col h-full overflow-hidden hover:shadow-sky-500/20 hover:shadow-2xl transition-all duration-500 border-white/5 hover:border-sky-500/30">
              <div className="relative h-[120px] md:h-[200px] lg:h-[300px] overflow-hidden bg-slate-800">
                {image ? (
                    <Image
                      src={image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 120px, (max-width: 1024px) 200px, 300px"
                      placeholder="empty"
                      loading="lazy"
                      className="object-cover group-hover:scale-105 transition-transform duration-500 w-full h-full"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900">
                        <span className="text-xs">Sin imagen</span>
                    </div>
                )}
                <div className="absolute top-2 right-2 hidden md:block">
                  <Badge variant="orange">Nuevo</Badge>
                </div>
              </div>
              <div className="p-3 md:p-5 flex flex-col flex-1 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />
                <div className="relative z-10 flex flex-col h-full">
                    <p className="hidden md:block text-[10px] font-bold text-sky-400 uppercase tracking-widest mb-2">{product.category || 'General'}</p>
                    <h3 className="text-sm md:text-lg font-bold text-white leading-tight mb-2 md:mb-4 group-hover:text-sky-300 transition-colors">{product.name}</h3>
                    
                    {product.description && (
                        <p className="hidden md:block text-xs text-slate-400 line-clamp-2 mb-4">{product.description}</p>
                    )}

                    <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
                    <div>
                        <p className="hidden md:block text-xs text-slate-500 font-medium">Precio final</p>
                        <p className="text-base md:text-2xl font-black text-white mt-0.5">${finalPrice.toLocaleString('es-AR')}</p>
                    </div>
                    <button className="hidden lg:inline bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white p-3 rounded-xl transition-all hover:scale-110 active:scale-95">
                        <MessageCircle size={20} />
                    </button>
                    </div>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </motion.div>
  );
};
