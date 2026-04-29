'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/types';
import { getSmartRecommendations } from '@/app/actions/ai-recommendations';
import { ProductCard } from './ProductCard';
import { Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface SmartAuraSectionProps {
  currentProductId: string;
}

export function SmartAuraSection({ currentProductId }: SmartAuraSectionProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getSmartRecommendations(currentProductId);
        // Map server action ProductType to Domain Product
        const mappedData: (Product & { aiScale?: number })[] = (data as any[]).map(p => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          category: p.category || 'General',
          brand: 'ÉTER Original',
          basePrice: p.base_price,
          images: p.images || [],
          stockBySize: p.stock_by_size || {},
          totalStock: Object.values(p.stock_by_size || {}).reduce((a: any, b: any) => Number(a) + Number(b), 0) as number,
          status: p.is_active ? 'active' : 'inactive',
          createdAt: new Date(p.created_at || Date.now()),
          aiScale: p.aiScale
        }));
        setRecommendations(mappedData);
      } catch (e) {
        console.error('Error loading recommendations:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentProductId]);

  if (!loading && recommendations.length === 0) return null;

  return (
    <section className="mt-24 mb-10 px-4 md:px-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse shadow-[0_0_10px_#00E5FF]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#00E5FF]">Algoritmo Éter Aura</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic">
            Completa tu <span className="text-[#00E5FF]">Sintonía</span>
          </h2>
          <p className="text-white/30 text-xs font-medium uppercase tracking-[0.3em]">
            La IA ha seleccionado estas piezas para elevar tu arquitectura visual.
          </p>
        </div>
        
        <div className="hidden md:flex items-center gap-2 px-5 py-3 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-3xl">
          <Sparkles size={14} className="text-[#00E5FF]" />
          <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">IA Generativa Activada</span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-[#00E5FF] animate-spin" />
          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest animate-pulse">Sincronizando Probabilidades...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {recommendations.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="relative group"
            >
              {(product as any).aiScale && (
                <div className="absolute top-4 right-4 z-50 bg-black/80 backdrop-blur-md border border-[#00E5FF]/30 px-3 py-1.5 rounded-full flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
                  <span className="text-[8px] font-black text-white uppercase tracking-tighter">Afinidad {(product as any).aiScale}%</span>
                </div>
              )}
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
