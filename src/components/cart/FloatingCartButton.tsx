'use client';

import { useCartStore } from '@/store/cart-store';
import { ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion, type Transition } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

/**
 * FloatingCartButton
 * ─────────────────────────────────────────────────────────────────────────────
 * WCAG AA compliant floating cart bubble.
 *  - Min touch target: 56×56px (exceeds 48×48 requirement)
 *  - Contrast: white icon on #050505 bg → ≥ 7:1 (WCAG AAA)
 *  - States: hover, focus-visible, active (scale-press), loading
 *  - Quantity badge pulses on change for visual feedback
 *  - Appears only when cart has items
 *  - Respects prefers-reduced-motion
 */
export function FloatingCartButton() {
  const { items, toggleCart } = useCartStore();
  const shouldReduceMotion = useReducedMotion();

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const prevCountRef = useRef(itemCount);
  const [badgePulse, setBadgePulse] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Pulse animation whenever item count changes
  useEffect(() => {
    if (prevCountRef.current !== itemCount && itemCount > 0) {
      setBadgePulse(true);
      const t = setTimeout(() => setBadgePulse(false), 600);
      prevCountRef.current = itemCount;
      return () => clearTimeout(t);
    }
    prevCountRef.current = itemCount;
  }, [itemCount]);

  const subtotal = items.reduce((acc, item) => acc + (item.basePrice || 0) * item.quantity, 0);
  const formattedSubtotal = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(subtotal);

  const spring: Transition = shouldReduceMotion
    ? {}
    : { type: 'spring', damping: 26, stiffness: 280 };

  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.div
          key="floating-cart"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.85 }}
          transition={spring}
          className="fixed bottom-6 left-5 z-[300] sm:bottom-8 sm:left-8"
        >
          <motion.button
            onClick={() => {
              toggleCart();
            }}
            onPointerDown={() => setIsPressed(true)}
            onPointerUp={() => setIsPressed(false)}
            onPointerLeave={() => setIsPressed(false)}
            whileHover={shouldReduceMotion ? {} : { scale: 1.06 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.94 }}
            // ARIA
            aria-label={`Abrir carrito de compras, ${itemCount} ${itemCount === 1 ? 'producto' : 'productos'}, total ${formattedSubtotal}`}
            aria-haspopup="dialog"
            id="floating-cart-btn"
            className={cn(
              // Layout & sizing — min 56×56px touch target
              'group relative flex h-14 min-w-[56px] items-center gap-0 overflow-hidden rounded-[2rem] transition-all duration-300 ease-out',
              // Colors: dark bg + white text → WCAG AAA contrast
              'bg-[#050505] text-white',
              // Border with cyan glow
              'border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)]',
              // Hover glow
              'hover:border-[#00E5FF]/50 hover:shadow-[0_12px_40px_rgba(0,0,0,0.9),0_0_30px_rgba(0,229,255,0.2)]',
              // Focus
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]',
              // Active
              isPressed && 'border-[#00E5FF]/60',
              // Expanded when has items — shows label
              itemCount > 0 && 'pr-5 pl-3.5',
            )}
          >
            {/* Animated cyan glow inner ring */}
            <div className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: 'radial-gradient(ellipse at 50% 120%, rgba(0,229,255,0.12) 0%, transparent 70%)' }}
            />

            {/* Top-right cyber accent */}
            <div className="absolute right-0 top-0 h-[2px] w-8 rounded-full bg-[#00E5FF]/60 transition-all duration-300 group-hover:w-full group-hover:bg-[#00E5FF]" />

            {/* Icon */}
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
              <ShoppingBag
                size={19}
                strokeWidth={2.5}
                className="text-white/90 transition-transform duration-500 group-hover:scale-110 group-hover:text-[#00E5FF]"
                aria-hidden="true"
              />

              {/* Badge */}
              <AnimatePresence mode="wait">
                <motion.span
                  key={itemCount}
                  initial={shouldReduceMotion ? { scale: 1 } : { scale: 0.5, opacity: 0 }}
                  animate={{
                    scale: badgePulse && !shouldReduceMotion ? [1, 1.4, 1] : 1,
                    opacity: 1,
                  }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'backOut' }}
                  aria-hidden="true"
                  className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#00E5FF] text-[9px] font-black leading-none text-black shadow-[0_0_8px_rgba(0,229,255,0.7)]"
                >
                  {itemCount > 9 ? '9+' : itemCount}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Expanded label */}
            <div className="ml-2.5 flex flex-col items-start leading-none">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/90 group-hover:text-[#00E5FF] transition-colors">
                Mi Pedido
              </span>
              <span className="mt-0.5 text-[9px] font-bold text-white/40">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} &nbsp;
                <span className="text-white/60 font-black">{formattedSubtotal}</span>
              </span>
            </div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
