'use client';

import { useCartStore } from '@/store/cart-store';
import { ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion, type Transition } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * FloatingCartButton
 * ─────────────────────────────────────────────────────────────────────────────
 * Theme-adaptive, WCAG AA compliant floating cart bubble.
 */
export function FloatingCartButton() {
  const pathname = usePathname();
  const { items, toggleCart, resellerTheme } = useCartStore();
  const shouldReduceMotion = useReducedMotion();

  // No mostrar en el portal del revendedor
  if (pathname?.startsWith('/reseller')) return null;

  const activeTheme = resellerTheme || 'original';

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

  // Theme styling configurations
  const themeButtonClasses: Record<string, string> = {
    original: cn(
      'group relative flex h-14 min-w-[56px] items-center gap-0 overflow-hidden rounded-[2rem] transition-all duration-300 ease-out',
      'bg-[#050505] text-white border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)]',
      'hover:border-[#00E5FF]/50 hover:shadow-[0_12px_40px_rgba(0,0,0,0.9),0_0_30px_rgba(0,229,255,0.2)]',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]',
      isPressed && 'border-[#00E5FF]/60',
      itemCount > 0 && 'pr-5 pl-3.5'
    ),
    minimal: cn(
      'group relative flex h-14 min-w-[56px] items-center gap-0 overflow-hidden rounded-none transition-all duration-200 ease-out font-sans tracking-tight',
      'bg-neutral-900 text-zinc-100 border border-zinc-800 shadow-md',
      'hover:border-zinc-500 hover:shadow-lg hover:text-white',
      'focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:ring-offset-1 focus-visible:ring-offset-black',
      isPressed && 'border-zinc-500',
      itemCount > 0 && 'pr-5 pl-3.5'
    ),
    cyber: cn(
      'group relative flex h-14 min-w-[56px] items-center gap-0 overflow-hidden rounded-[0.5rem] transition-all duration-300 ease-out font-mono',
      'bg-[#020408] text-emerald-400 border border-dashed border-emerald-500/40 shadow-[0_8px_24px_rgba(16,185,129,0.1)]',
      'hover:border-emerald-400 hover:shadow-[0_10px_30px_rgba(16,185,129,0.25)] hover:text-emerald-300',
      'focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 focus-visible:ring-offset-1 focus-visible:ring-offset-black',
      isPressed && 'border-emerald-400',
      itemCount > 0 && 'pr-5 pl-3.5'
    ),
    warm: cn(
      'group relative flex h-14 min-w-[56px] items-center gap-0 overflow-hidden rounded-[1.5rem] transition-all duration-300 ease-out font-serif',
      'bg-[#1A1816] text-[#F5F2EB] border border-[#3A3530] shadow-[0_8px_24px_rgba(0,0,0,0.5)]',
      'hover:border-[#8B7E74] hover:shadow-xl hover:text-[#E6DFD3]',
      'focus:outline-none focus-visible:ring-1 focus-visible:ring-[#8B7E74] focus-visible:ring-offset-1 focus-visible:ring-offset-[#1A1816]',
      isPressed && 'border-[#8B7E74]',
      itemCount > 0 && 'pr-5 pl-3.5'
    ),
    swiss: cn(
      'group relative flex h-14 min-w-[56px] items-center gap-0 overflow-hidden rounded-none transition-all duration-300 ease-out font-sans font-black uppercase',
      'bg-black text-white border-2 border-white shadow-[6px_6px_0px_rgba(255,255,255,0.2)]',
      'hover:border-[#EF4444] hover:shadow-[6px_6px_0px_rgba(239,68,68,0.4)] hover:text-[#EF4444]',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black',
      isPressed && 'border-[#EF4444]',
      itemCount > 0 && 'pr-5 pl-3.5'
    ),
    kinetic: cn(
      'group relative flex h-14 min-w-[56px] items-center gap-0 overflow-hidden rounded-br-[2rem] rounded-tl-[2rem] rounded-bl-sm rounded-tr-sm transition-all duration-300 ease-out font-sans font-black italic',
      'bg-zinc-950 text-white border-y-2 border-x border-zinc-800 shadow-[0_8px_32px_rgba(0,0,0,0.8)]',
      'hover:border-yellow-500 hover:shadow-[0_0_30px_rgba(234,179,8,0.25)] hover:text-yellow-400',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
      isPressed && 'border-yellow-500',
      itemCount > 0 && 'pr-5 pl-3.5'
    ),
  };

  const themeIconClasses: Record<string, string> = {
    original: 'text-white/90 group-hover:text-[#00E5FF] transition-transform duration-500 group-hover:scale-110',
    minimal: 'text-zinc-400 group-hover:text-zinc-100 transition-colors',
    cyber: 'text-emerald-500/80 group-hover:text-emerald-400 transition-colors',
    warm: 'text-[#c2b29f] group-hover:text-[#f5f2eb] transition-colors',
    swiss: 'text-white group-hover:text-[#EF4444] transition-colors',
    kinetic: 'text-zinc-400 group-hover:text-yellow-400 transition-colors',
  };

  const themeBadgeClasses: Record<string, string> = {
    original: 'absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#00E5FF] text-[9px] font-black leading-none text-black shadow-[0_0_8px_rgba(0,229,255,0.7)]',
    minimal: 'absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-none bg-zinc-200 text-[9px] font-bold leading-none text-black',
    cyber: 'absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-[0.25rem] bg-emerald-500 text-[9px] font-bold leading-none text-black shadow-[0_0_8px_rgba(16,185,129,0.7)] font-mono',
    warm: 'absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#c2b29f] text-[9px] font-bold leading-none text-[#121110]',
    swiss: 'absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-none bg-[#EF4444] text-[9px] font-black leading-none text-white',
    kinetic: 'absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-none bg-yellow-500 text-[9px] font-black italic leading-none text-black shadow-[2px_2px_0px_rgba(0,0,0,1)]',
  };

  const themeTextLabelClasses: Record<string, string> = {
    original: 'text-[10px] font-black uppercase tracking-[0.15em] text-white/90 group-hover:text-[#00E5FF] transition-colors',
    minimal: 'text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-100 group-hover:text-white transition-colors',
    cyber: 'text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 group-hover:text-emerald-300 transition-colors font-mono',
    warm: 'text-[10px] font-normal uppercase tracking-[0.15em] text-[#f5f2eb] group-hover:text-[#e6dfd3] transition-colors font-serif',
    swiss: 'text-[11px] font-black uppercase tracking-tighter text-white group-hover:text-[#EF4444] transition-colors',
    kinetic: 'text-[11px] font-black uppercase tracking-widest text-white group-hover:text-yellow-400 transition-colors italic skew-x-3',
  };

  const themeSubtextLabelClasses: Record<string, string> = {
    original: 'mt-0.5 text-[9px] font-bold text-white/40',
    minimal: 'mt-0.5 text-[9px] text-zinc-500',
    cyber: 'mt-0.5 text-[8px] text-emerald-600 font-mono',
    warm: 'mt-0.5 text-[9px] text-[#c2b29f]/60 font-serif',
    swiss: 'mt-0.5 text-[9px] text-zinc-400 font-medium',
    kinetic: 'mt-0.5 text-[9px] text-zinc-500 font-bold italic skew-x-3',
  };

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
            aria-label={`Abrir carrito de compras, ${itemCount} ${itemCount === 1 ? 'producto' : 'productos'}, total ${formattedSubtotal}`}
            aria-haspopup="dialog"
            id="floating-cart-btn"
            className={themeButtonClasses[activeTheme]}
          >
            {/* Theme-specific Background glow inner ring */}
            {activeTheme === 'original' && (
              <div className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: 'radial-gradient(ellipse at 50% 120%, rgba(0,229,255,0.12) 0%, transparent 70%)' }}
              />
            )}
            {activeTheme === 'cyber' && (
              <div className="pointer-events-none absolute inset-0 rounded-[0.5rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: 'radial-gradient(ellipse at 50% 120%, rgba(16,185,129,0.1) 0%, transparent 70%)' }}
              />
            )}
            {activeTheme === 'kinetic' && (
              <div className="pointer-events-none absolute inset-0 rounded-br-[2rem] rounded-tl-[2rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: 'radial-gradient(ellipse at 50% 120%, rgba(234,179,8,0.1) 0%, transparent 70%)' }}
              />
            )}

            {/* Top-right accent lines per theme */}
            {activeTheme === 'original' && (
              <div className="absolute right-0 top-0 h-[2px] w-8 rounded-full bg-[#00E5FF]/60 transition-all duration-300 group-hover:w-full group-hover:bg-[#00E5FF]" />
            )}
            {activeTheme === 'cyber' && (
              <div className="absolute right-0 top-0 h-[2px] w-8 bg-emerald-500/60 transition-all duration-300 group-hover:w-full group-hover:bg-emerald-400" />
            )}
            {activeTheme === 'kinetic' && (
              <div className="absolute right-0 top-0 h-[2px] w-8 bg-yellow-500/60 transition-all duration-300 group-hover:w-full group-hover:bg-yellow-400" />
            )}
            {activeTheme === 'warm' && (
              <div className="absolute right-0 top-0 h-[2px] w-8 bg-[#c2b29f]/60 transition-all duration-300 group-hover:w-full group-hover:bg-[#c2b29f]" />
            )}

            {/* Icon */}
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
              <ShoppingBag
                size={19}
                strokeWidth={2.5}
                className={themeIconClasses[activeTheme]}
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
                  className={themeBadgeClasses[activeTheme]}
                >
                  {itemCount > 9 ? '9+' : itemCount}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Expanded label */}
            <div className="ml-2.5 flex flex-col items-start leading-none">
              <span className={themeTextLabelClasses[activeTheme]}>
                Mi Pedido
              </span>
              <span className={themeSubtextLabelClasses[activeTheme]}>
                {itemCount} {itemCount === 1 ? 'item' : 'items'} &nbsp;
                <span className="font-black">{formattedSubtotal}</span>
              </span>
            </div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
