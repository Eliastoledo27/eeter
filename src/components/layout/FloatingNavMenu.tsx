'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Home, Grid3X3, Users, Info, Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Nav Items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: 'Inicio',     href: '/',          icon: Home,       match: (p: string) => p === '/' },
  { label: 'Catálogo',   href: '/catalog',   icon: Grid3X3,    match: (p: string) => p.startsWith('/catalog') },
  { label: 'Comunidad',  href: '/comunidad', icon: Users,      match: (p: string) => p.startsWith('/comunidad') },
  { label: 'Sobre ÉTER', href: '/about',     icon: Info,       match: (p: string) => p.startsWith('/about') },
  { label: 'Contacto',   href: '/contacto',  icon: Mail,       match: (p: string) => p.startsWith('/contacto') },
] as const;

// ─── Scroll Detection Hook ────────────────────────────────────────────────────
/**
 * Returns 'up' when user is scrolling up, 'down' when scrolling down.
 * Ignores micro-movements < threshold px to avoid accidental triggers.
 */
function useScrollDirection(threshold = 12) {
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const lastY = useRef(0);
  const ticking = useRef(false);

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastY.current;

        if (Math.abs(delta) >= threshold) {
          setDirection(delta > 0 ? 'down' : 'up');
          lastY.current = currentY;
        }
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, [threshold]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return direction;
}

// ─── Component ────────────────────────────────────────────────────────────────
/**
 * FloatingNavMenu
 *
 * A glassmorphic pill/bubble fixed at the bottom-center of the viewport.
 * Behaviour:
 *  - Visible by default
 *  - Slides down & fades out on scroll-down (GPU-accelerated: opacity + transform)
 *  - Slides back up & fades in on scroll-up
 *  - 300ms cubic-bezier transition for natural feel
 *  - Fully responsive: compact icon-only on ≤640 px, labels on larger screens
 *  - Safe-area inset support for iOS devices
 */
export function FloatingNavMenu() {
  const pathname = usePathname();

  // Hide the menu on dashboard and reseller pages to prevent visual clutter
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/c/') ||
    pathname.startsWith('/resellers') ||
    pathname.startsWith('/reseller')
  ) {
    return null;
  }

  const scrollDir = useScrollDirection(12);
  const shouldReduceMotion = useReducedMotion();

  const isVisible = scrollDir === 'up';

  // Transition settings — GPU-only properties
  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

  return (
    <AnimatePresence>
      {/* Always render but animate show/hide */}
      <motion.nav
        key="floating-nav"
        role="navigation"
        aria-label="Navegación principal flotante"
        initial={{ opacity: 1, x: '-50%', y: 0 }}
        animate={{
          opacity: isVisible ? 1 : 0,
          x: '-50%',
          y: isVisible ? 0 : -80,
          pointerEvents: isVisible ? 'auto' : 'none',
        }}
        transition={transition}
        // Position: top-center, below any OS status bar (safe-area)
        className={cn(
          'fixed top-0 left-1/2 z-[150]',
          // Mobile (<768px): icon-only, tight margin
          'mt-4 pt-safe',
          // Tablet+ (≥768px): more margin
          'md:mt-8',
        )}
        style={{ willChange: 'opacity, transform' }}
      >
        {/* Glass pill container */}
        <div
          className={cn(
            'relative flex items-center gap-1 overflow-hidden',
            // Shape
            'rounded-[2rem] px-2 py-2',
            // Glass bg
            'bg-[#070707]/80 backdrop-blur-[24px] saturate-[1.8]',
            // Border
            'border border-white/10',
            // Shadow
            'shadow-[0_8px_40px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.04),inset_0_0_0_1px_rgba(255,255,255,0.02)]',
          )}
        >
          {/* Subtle bottom line accent */}
          <div className="pointer-events-none absolute inset-x-4 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[#00E5FF]/40 to-transparent" />

          {/* Nav items */}
          {NAV_ITEMS.map(({ label, href, icon: Icon, match }) => {
            const isActive = match(pathname);
            return (
              <NavItem
                key={href}
                href={href}
                label={label}
                icon={Icon}
                isActive={isActive}
                shouldReduceMotion={shouldReduceMotion ?? false}
              />
            );
          })}
        </div>
      </motion.nav>
    </AnimatePresence>
  );
}

// ─── Single Nav Item ──────────────────────────────────────────────────────────
interface NavItemProps {
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  shouldReduceMotion: boolean;
}

function NavItem({ href, label, icon: Icon, isActive, shouldReduceMotion }: NavItemProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        // Touch target — min 48×48px on all devices
        'group relative flex min-h-[48px] min-w-[48px] flex-col items-center justify-center gap-1 rounded-[1.5rem] px-3 transition-all duration-200',
        // Focus ring
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus-visible:ring-offset-1 focus-visible:ring-offset-[#070707]',
        // Active
        isActive
          ? 'bg-[#00E5FF]/10 text-[#00E5FF]'
          : 'text-white/50 hover:bg-white/[0.06] hover:text-white',
        // Tablet+ (≥768px) — wider padding
        'md:px-4',
      )}
    >
      {/* Active indicator dot */}
      {isActive && (
        <motion.div
          layoutId="nav-active-dot"
          className="absolute -bottom-0.5 left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.9)]"
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { type: 'spring', damping: 30, stiffness: 300 }
          }
        />
      )}

      {/* Icon */}
      <Icon
        size={18}
        aria-hidden="true"
        strokeWidth={isActive ? 2.5 : 2}
        className={cn(
          'transition-transform duration-200',
          !shouldReduceMotion && 'group-hover:scale-110',
          isActive && 'drop-shadow-[0_0_6px_rgba(0,229,255,0.8)]',
        )}
      />

      {/* Label — hidden on mobile (<768px), shown on tablet/desktop */}
      <span
        className={cn(
          'hidden text-[9px] font-black uppercase tracking-[0.14em] leading-none transition-colors',
          'md:block',
          isActive ? 'text-[#00E5FF]' : 'text-white/40 group-hover:text-white/70',
        )}
      >
        {label}
      </span>
    </Link>
  );
}
