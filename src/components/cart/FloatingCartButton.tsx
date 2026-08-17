'use client';

import { useCartStore } from '@/store/cart-store';
import { ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * FloatingCartButton
 * ─────────────────────────────────────────────────────────────────────────────
 * Ultra-luxury, minimalist floating cart capsule with fluid haptics & glassmorphism.
 */
export function FloatingCartButton() {
  const pathname = usePathname();
  const { items, toggleCart } = useCartStore();
  const shouldReduceMotion = useReducedMotion();

  // Hide inside admin / reseller studio pages
  if (pathname?.startsWith('/reseller') || pathname?.startsWith('/dashboard')) return null;

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const prevCountRef = useRef(itemCount);
  const [badgePulse, setBadgePulse] = useState(false);

  // Trigger subtle pulse whenever item count increases
  useEffect(() => {
    if (prevCountRef.current !== itemCount && itemCount > 0) {
      setBadgePulse(true);
      const t = setTimeout(() => setBadgePulse(false), 500);
      prevCountRef.current = itemCount;
      return () => clearTimeout(t);
    }
    prevCountRef.current = itemCount;
  }, [itemCount]);

  const subtotal = items.reduce((acc, item) => acc + (item.basePrice || 0) * item.quantity, 0);
  const formattedSubtotal = `$${subtotal.toLocaleString('es-AR')}`;

  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.div
          key="floating-cart-pill"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 25, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 25, scale: 0.92 }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          className="fixed bottom-6 left-5 sm:bottom-8 sm:left-8 z-[150]"
        >
          <motion.button
            onClick={toggleCart}
            whileHover={shouldReduceMotion ? {} : { scale: 1.04, y: -2 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
            aria-label={`Abrir carrito de compras: ${itemCount} ${itemCount === 1 ? 'producto' : 'productos'}, total ${formattedSubtotal}`}
            id="floating-cart-btn"
            className={cn(
              'group relative flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300',
              'bg-[#080808]/95 backdrop-blur-2xl border border-white/15 text-white',
              'shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_20px_rgba(57,255,20,0.06)]',
              'hover:border-[#39FF14]/60 hover:shadow-[0_16px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(57,255,20,0.2)]',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#39FF14]'
            )}
          >
            {/* Ambient Light Accent */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-[#39FF14]/5 via-transparent to-[#00E5FF]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Icon Container + Badge */}
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 group-hover:border-[#39FF14]/40 group-hover:bg-[#39FF14]/10 transition-all">
              <ShoppingBag
                size={18}
                className="text-white/90 group-hover:text-[#39FF14] transition-colors duration-300"
                aria-hidden="true"
              />

              {/* Dynamic Notification Badge */}
              <AnimatePresence mode="wait">
                <motion.span
                  key={itemCount}
                  initial={shouldReduceMotion ? { scale: 1 } : { scale: 0.5, opacity: 0 }}
                  animate={{
                    scale: badgePulse && !shouldReduceMotion ? [1, 1.35, 1] : 1,
                    opacity: 1,
                  }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#39FF14] text-[9px] font-mono font-black leading-none text-black shadow-[0_0_10px_rgba(57,255,20,0.8)]"
                >
                  {itemCount}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Typography Details */}
            <div className="flex flex-col items-start text-left leading-tight pr-1">
              <span className="text-[10px] font-mono font-black uppercase tracking-[0.18em] text-white/90 group-hover:text-[#39FF14] transition-colors">
                MI PEDIDO
              </span>
              <span className="text-xs font-mono font-bold text-white/70 mt-0.5 flex items-center gap-1.5">
                <span>{itemCount} {itemCount === 1 ? 'par' : 'pares'}</span>
                <span className="text-white/30">·</span>
                <span className="text-[#39FF14] font-black">{formattedSubtotal}</span>
              </span>
            </div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
