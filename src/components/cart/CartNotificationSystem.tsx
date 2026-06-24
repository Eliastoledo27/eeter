'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertTriangle, Minus } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────
export type CartNotificationType = 'added' | 'removed' | 'updated' | 'error' | 'stock_warning';

export interface CartNotification {
  id: string;
  type: CartNotificationType;
  title: string;
  message?: string;
  productName?: string;
  productImage?: string;
  quantity?: number;
  duration?: number; // ms, default 3000
}

// ─── Notification Store (simple module-level event emitter) ───────────────────
type NotificationListener = (notification: CartNotification) => void;
const listeners: NotificationListener[] = [];

export const cartNotify = (notification: Omit<CartNotification, 'id'>) => {
  const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const full: CartNotification = { duration: 3000, ...notification, id };
  listeners.forEach((fn) => fn(full));
};

// ─── Config per type ─────────────────────────────────────────────────────────
const CONFIG: Record<
  CartNotificationType,
  { icon: React.ElementType; color: string; bg: string; border: string; glow: string }
> = {
  added: {
    icon: Check,
    color: '#00E5FF',
    bg: 'rgba(0,229,255,0.06)',
    border: 'rgba(0,229,255,0.25)',
    glow: 'rgba(0,229,255,0.15)',
  },
  removed: {
    icon: X,
    color: '#FF3A5C',
    bg: 'rgba(255,58,92,0.06)',
    border: 'rgba(255,58,92,0.25)',
    glow: 'rgba(255,58,92,0.15)',
  },
  updated: {
    icon: Minus,
    color: '#7A00FF',
    bg: 'rgba(122,0,255,0.06)',
    border: 'rgba(122,0,255,0.25)',
    glow: 'rgba(122,0,255,0.15)',
  },
  error: {
    icon: AlertTriangle,
    color: '#FF8C00',
    bg: 'rgba(255,140,0,0.06)',
    border: 'rgba(255,140,0,0.25)',
    glow: 'rgba(255,140,0,0.15)',
  },
  stock_warning: {
    icon: AlertTriangle,
    color: '#FFD700',
    bg: 'rgba(255,215,0,0.06)',
    border: 'rgba(255,215,0,0.25)',
    glow: 'rgba(255,215,0,0.15)',
  },
};

// ─── Single Notification Card ────────────────────────────────────────────────
function NotificationCard({
  notification,
  onDismiss,
  resellerTheme,
}: {
  notification: CartNotification;
  onDismiss: (id: string) => void;
  resellerTheme: string | null;
}) {
  const cfg = CONFIG[notification.type];
  const Icon = cfg.icon;
  const progressRef = useRef<HTMLDivElement>(null);
  const duration = notification.duration ?? 3000;

  useEffect(() => {
    // Animate the progress bar from 100 → 0
    const el = progressRef.current;
    if (!el) return;
    el.style.transition = 'none';
    el.style.width = '100%';
    // Force reflow
    void el.offsetWidth;
    el.style.transition = `width ${duration}ms linear`;
    el.style.width = '0%';
  }, [duration]);

  const activeTheme = resellerTheme || 'original';

  // Theme card styling configuration
  const cardThemeStyles: Record<string, {
    className: string;
    style: React.CSSProperties;
    progressBarColor: string;
    iconBgStyle: React.CSSProperties;
    titleStyle: React.CSSProperties;
    productNameClassName: string;
    messageClassName: string;
    fontClass: string;
  }> = {
    original: {
      className: "relative w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[1.25rem]",
      style: {
        background: `linear-gradient(135deg, ${cfg.bg}, rgba(5,5,5,0.95))`,
        border: `1px solid ${cfg.border}`,
        boxShadow: `0 20px 60px rgba(0,0,0,0.7), 0 0 30px ${cfg.glow}`,
      },
      progressBarColor: cfg.color,
      iconBgStyle: { background: `${cfg.color}20`, border: `1px solid ${cfg.color}40` },
      titleStyle: { color: cfg.color },
      productNameClassName: "text-sm font-bold text-white truncate leading-tight",
      messageClassName: "text-[11px] text-white/50 mt-0.5 leading-relaxed",
      fontClass: "font-sans",
    },
    minimal: {
      className: "relative w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-none border border-zinc-800 shadow-md",
      style: {
        background: '#09090b',
      },
      progressBarColor: '#e4e4e7',
      iconBgStyle: { background: '#18181b', border: '1px solid #27272a' },
      titleStyle: { color: '#a1a1aa' },
      productNameClassName: "text-sm font-medium text-zinc-100 truncate leading-tight",
      messageClassName: "text-[11px] text-zinc-500 mt-0.5 leading-relaxed",
      fontClass: "font-sans tracking-tight",
    },
    cyber: {
      className: "relative w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[0.5rem] border border-dashed border-emerald-500/40",
      style: {
        background: '#020408',
        boxShadow: '0 0 20px rgba(16,185,129,0.15)',
      },
      progressBarColor: '#10b981',
      iconBgStyle: { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' },
      titleStyle: { color: '#10b981' },
      productNameClassName: "text-sm font-bold text-emerald-300 truncate leading-tight",
      messageClassName: "text-[11px] text-emerald-600 mt-0.5 leading-relaxed",
      fontClass: "font-mono",
    },
    warm: {
      className: "relative w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[1.5rem] border border-[#3a3530]",
      style: {
        background: '#1a1816',
        boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
      },
      progressBarColor: '#c2b29f',
      iconBgStyle: { background: 'rgba(194,178,159,0.08)', border: '1px solid rgba(194,178,159,0.2)' },
      titleStyle: { color: '#c2b29f' },
      productNameClassName: "text-sm font-normal text-[#f5f2eb] truncate leading-tight",
      messageClassName: "text-[11px] text-[#c2b29f]/50 mt-0.5 leading-relaxed",
      fontClass: "font-serif",
    },
    swiss: {
      className: "relative w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-none border-2 border-white",
      style: {
        background: '#000000',
        boxShadow: '8px 8px 0px rgba(255,255,255,0.2)',
      },
      progressBarColor: '#ef4444',
      iconBgStyle: { background: '#000000', border: '2px solid #ffffff' },
      titleStyle: { color: '#ef4444', fontWeight: 900 },
      productNameClassName: "text-sm font-black text-white uppercase truncate leading-tight",
      messageClassName: "text-[11px] text-zinc-400 font-medium uppercase mt-0.5 leading-relaxed",
      fontClass: "font-sans uppercase",
    },
    kinetic: {
      className: "relative w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-br-[1.5rem] rounded-tl-[1.5rem] rounded-bl-none rounded-tr-none border border-zinc-800",
      style: {
        background: '#050506',
        boxShadow: '0 15px 40px rgba(0,0,0,0.8)',
      },
      progressBarColor: '#eab308',
      iconBgStyle: { background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' },
      titleStyle: { color: '#eab308' },
      productNameClassName: "text-sm font-black text-white italic truncate leading-tight skew-x-3",
      messageClassName: "text-[11px] text-zinc-500 font-bold italic mt-0.5 leading-relaxed skew-x-3",
      fontClass: "font-sans font-black italic",
    },
  };

  const ts = cardThemeStyles[activeTheme];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.92, x: 60 }}
      animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.88, x: 80 }}
      transition={{ type: 'spring', damping: 28, stiffness: 320 }}
      role="alert"
      aria-live="polite"
      aria-label={`${notification.title}: ${notification.message ?? ''}`}
      className={cn(ts.className, ts.fontClass)}
      style={ts.style}
    >
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-[2px] w-full bg-white/5">
        <div
          ref={progressRef}
          className="h-full"
          style={{ background: ts.progressBarColor }}
        />
      </div>

      <div className="flex items-start gap-4 p-4 pr-3">
        {/* Icon / product image */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={ts.iconBgStyle}
        >
          {notification.productImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={notification.productImage}
              alt={notification.productName ?? ''}
              className="h-full w-full rounded-xl object-cover"
            />
          ) : (
            <Icon size={18} style={ts.titleStyle} aria-hidden="true" />
          )}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p
            className="text-[11px] font-black uppercase tracking-[0.18em] leading-none mb-1"
            style={ts.titleStyle}
          >
            {notification.title}
          </p>
          {notification.productName && (
            <p className={ts.productNameClassName}>
              {notification.productName}
            </p>
          )}
          {notification.message && (
            <p className={ts.messageClassName}>
              {notification.message}
            </p>
          )}
        </div>

        {/* Dismiss */}
        <button
          onClick={() => onDismiss(notification.id)}
          aria-label="Cerrar notificación"
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white/25 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          <X size={13} aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Container (rendered once in layout) ─────────────────────────────────────
export function CartNotificationContainer() {
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<CartNotification[]>([]);
  const { resellerTheme } = useCartStore();

  // No mostrar en el portal del revendedor
  if (pathname?.startsWith('/reseller')) return null;

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  useEffect(() => {
    const handler: NotificationListener = (notif) => {
      setNotifications((prev) => [notif, ...prev].slice(0, 5)); // max 5 stacked
      const timer = setTimeout(() => dismiss(notif.id), notif.duration ?? 3000);
      return () => clearTimeout(timer);
    };
    listeners.push(handler);
    return () => {
      const idx = listeners.indexOf(handler);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, [dismiss]);

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed right-4 top-4 z-[500] flex flex-col gap-3 sm:right-6 sm:top-6"
      style={{ pointerEvents: notifications.length ? 'auto' : 'none' }}
    >
      <AnimatePresence mode="sync">
        {notifications.map((n) => (
          <NotificationCard
            key={n.id}
            notification={n}
            onDismiss={dismiss}
            resellerTheme={resellerTheme}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
