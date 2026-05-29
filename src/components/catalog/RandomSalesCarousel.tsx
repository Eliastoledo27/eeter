'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import type { Product } from '@/domain/entities/Product';

const cities = [
  'Mar del Plata',
  'Buenos Aires',
  'Córdoba',
  'Rosario',
  'Mendoza',
  'La Plata',
  'Neuquén',
  'Salta',
  'Tandil',
  'Bahía Blanca',
];

const fallbackModels = ['Nike Dunk Panda', 'Adidas Gazelle Indoor', 'Jordan 1 Low', 'New Balance 550'];

export function RandomSalesCarousel({ products }: { products: Product[] }) {
  const models = useMemo(() => {
    const names = products.map((product) => product.name).filter(Boolean).slice(0, 18);
    return names.length ? names : fallbackModels;
  }, [products]);
  const [index, setIndex] = useState(0);

  const events = useMemo(
    () =>
      Array.from({ length: 12 }, (_, idx) => ({
        id: `${idx}-${models[idx % models.length]}-${cities[(idx * 3) % cities.length]}`,
        model: models[idx % models.length],
        city: cities[(idx * 3 + 2) % cities.length],
        minutes: 2 + ((idx * 5) % 17),
      })),
    [models]
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % events.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [events.length]);

  const current = events[index];

  return (
    <section className="border-t border-white/10 bg-[#050505] px-4 py-5">
      <div className="mx-auto flex max-w-7xl items-center gap-4 overflow-hidden rounded-lg border border-white/8 bg-white/[0.025] px-4 py-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#00E5FF]/25 bg-[#00E5FF]/10 text-[#00E5FF]">
          <ShoppingBag size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.p
              key={current.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28 }}
              className="truncate text-xs font-bold uppercase tracking-[0.12em] text-white/68 sm:text-sm"
            >
              Venta reciente: <span className="text-white">{current.model}</span> en{' '}
              <span className="text-[#00E5FF]">{current.city}</span> hace {current.minutes} min
            </motion.p>
          </AnimatePresence>
        </div>
        <span className="hidden text-[10px] font-black uppercase tracking-[0.22em] text-[#39FF14] sm:block">Actividad en vivo</span>
      </div>
    </section>
  );
}
