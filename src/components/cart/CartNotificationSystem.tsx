'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertTriangle, Minus } from 'lucide-react';

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
}: {
  notification: CartNotification;
  onDismiss: (id: string) => void;
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
      className="relative w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[1.25rem] shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
      style={{
        background: `linear-gradient(135deg, ${cfg.bg}, rgba(5,5,5,0.95))`,
        border: `1px solid ${cfg.border}`,
        boxShadow: `0 20px 60px rgba(0,0,0,0.7), 0 0 30px ${cfg.glow}`,
      }}
    >
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-[2px] w-full bg-white/5">
        <div
          ref={progressRef}
          className="h-full"
          style={{ background: cfg.color }}
        />
      </div>

      <div className="flex items-start gap-4 p-4 pr-3">
        {/* Icon / product image */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: `${cfg.color}20`, border: `1px solid ${cfg.color}40` }}
        >
          {notification.productImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={notification.productImage}
              alt={notification.productName ?? ''}
              className="h-full w-full rounded-xl object-cover"
            />
          ) : (
            <Icon size={18} style={{ color: cfg.color }} aria-hidden="true" />
          )}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p
            className="text-[11px] font-black uppercase tracking-[0.18em] leading-none mb-1"
            style={{ color: cfg.color }}
          >
            {notification.title}
          </p>
          {notification.productName && (
            <p className="text-sm font-bold text-white truncate leading-tight">
              {notification.productName}
            </p>
          )}
          {notification.message && (
            <p className="text-[11px] text-white/50 mt-0.5 leading-relaxed">
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
  const [notifications, setNotifications] = useState<CartNotification[]>([]);

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
          <NotificationCard key={n.id} notification={n} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
