'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Megaphone, MousePointerClick, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Announcement } from '@/hooks/useAnnouncements';

const AUTO_DISMISS_MS = 7000;
const DISPLAY_MODES = ['floating', 'modal', 'banner'] as const;
const STYLE_MAP: Record<string, { accent: string; glow: string; cta: string; border: string }> = {
  drop: { accent: 'text-[#00E5FF]', glow: 'bg-[#00E5FF]/15', cta: 'hover:bg-[#00E5FF]', border: 'border-[#00E5FF]/20' },
  stock: { accent: 'text-[#00E5FF]', glow: 'bg-[#00E5FF]/12', cta: 'hover:bg-[#00E5FF]', border: 'border-[#00E5FF]/25' },
  rose: { accent: 'text-[#FF007A]', glow: 'bg-[#FF007A]/18', cta: 'hover:bg-[#FF007A]', border: 'border-[#FF007A]/25' },
  gold: { accent: 'text-[#FFC857]', glow: 'bg-[#FFC857]/16', cta: 'hover:bg-[#FFC857]', border: 'border-[#FFC857]/25' },
  mono: { accent: 'text-white', glow: 'bg-white/10', cta: 'hover:bg-white', border: 'border-white/20' },
  flash: { accent: 'text-[#B7FF00]', glow: 'bg-[#B7FF00]/16', cta: 'hover:bg-[#B7FF00]', border: 'border-[#B7FF00]/25' },
  community: { accent: 'text-[#8B5CF6]', glow: 'bg-[#8B5CF6]/18', cta: 'hover:bg-[#8B5CF6]', border: 'border-[#8B5CF6]/25' },
};

function normalizeTargetPage(value: string) {
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

  if (['all', 'todos', 'todo', '*'].includes(normalized)) return 'all';
  if (['home', 'inicio', 'index', '/'].includes(normalized)) return 'home';
  if (['catalog', 'catalogo', 'catalogue', 'c'].includes(normalized)) return 'catalog';
  if (['community', 'comunidad'].includes(normalized)) return 'community';
  if (['about', 'sobre', 'sobre eter', 'sobreeter'].includes(normalized)) return 'about';
  if (['contact', 'contacto'].includes(normalized)) return 'contact';
  return normalized;
}

function getPageKey(pathname: string) {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/catalog') || pathname.startsWith('/c/')) return 'catalog';
  if (pathname.startsWith('/comunidad') || pathname.startsWith('/community')) return 'community';
  if (pathname.startsWith('/about') || pathname.startsWith('/sobre')) return 'about';
  if (pathname.startsWith('/contacto') || pathname.startsWith('/contact')) return 'contact';
  return 'home';
}

export function FloatingAnnouncements() {
  const pathname = usePathname();
  const routeKey = pathname || '/';
  const pageKey = getPageKey(routeKey);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedKeys, setDismissedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const controller = new AbortController();

    async function fetchPublicAnnouncements() {
      try {
        const response = await fetch(`/api/announcements?page=${encodeURIComponent(pageKey)}`, {
          signal: controller.signal,
          cache: 'no-store',
        });
        const payload = await response.json();
        if (!response.ok || !payload.success) {
          throw new Error(payload.error || 'No se pudieron cargar los anuncios');
        }
        setAnnouncements(payload.announcements || []);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Error loading public announcements:', error);
          setAnnouncements([]);
        }
      }
    }

    fetchPublicAnnouncements();

    return () => controller.abort();
  }, [pageKey]);

  const active = useMemo(() => {
    const floating = announcements
      .filter((announcement) => {
        const mode = announcement.display_mode || 'floating';
        return announcement.is_active && DISPLAY_MODES.includes(mode);
      })
      .sort((a, b) => {
        const priorityDelta = (b.priority || 0) - (a.priority || 0);
        if (priorityDelta !== 0) return priorityDelta;
        return new Date(b.published_at || b.created_at || 0).getTime() - new Date(a.published_at || a.created_at || 0).getTime();
      });

    const eligible = floating.filter((announcement) => {
        const pages = (announcement.target_pages?.length ? announcement.target_pages : ['home']).map(normalizeTargetPage);
        const dismissedKey = `${routeKey}:${announcement.id}`;

        return (
          (pages.includes('all') || pages.includes(pageKey)) &&
          !dismissedKeys.has(dismissedKey)
        );
      });

    if (eligible[0]) return eligible[0];

    return null;
  }, [announcements, dismissedKeys, pageKey, routeKey]);

  useEffect(() => {
    if (!active) return;

    const dismissedKey = `${routeKey}:${active.id}`;
    const timer = window.setTimeout(() => {
      setDismissedKeys((current) => {
        const next = new Set(current);
        next.add(dismissedKey);
        return next;
      });
    }, AUTO_DISMISS_MS);

    return () => window.clearTimeout(timer);
  }, [active, routeKey]);

  const dismissActive = () => {
    if (!active) return;
    setDismissedKeys((current) => {
      const next = new Set(current);
      next.add(`${routeKey}:${active.id}`);
      return next;
    });
  };

  const badge = active?.category || active?.template_key || 'ETER';
  const mode = active?.display_mode || 'floating';
  const visualKey = active?.template_key || 'drop';
  const visual = STYLE_MAP[visualKey] || STYLE_MAP.drop;
  const isBanner = mode === 'banner';
  const shellClass = isBanner
    ? 'fixed inset-x-0 bottom-5 z-[94] grid place-items-center px-3 sm:bottom-6'
    : 'fixed inset-0 z-[94] grid place-items-center px-3 py-4';
  const panelClass = isBanner
    ? 'w-[min(46rem,100%)]'
    : 'w-[min(40rem,100%)] max-h-[calc(100dvh-2rem)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';
  const cardClass = isBanner
    ? 'rounded-2xl p-3 pr-12 sm:p-4 sm:pr-14'
    : 'rounded-[1.35rem] p-4 sm:p-5 md:p-6';
  const imageClass = isBanner
    ? 'h-14 w-14 rounded-xl sm:h-16 sm:w-16'
    : 'h-[4.75rem] w-[4.75rem] rounded-2xl sm:h-24 sm:w-24 md:h-28 md:w-28';
  const titleClass = isBanner
    ? 'line-clamp-2 text-sm sm:text-base'
    : 'line-clamp-3 text-xl sm:text-2xl md:text-3xl';

  return (
    <AnimatePresence mode="wait">
      {active && (
        <>
          {!isBanner && (
            <motion.button
              type="button"
              aria-label="Cerrar anuncio"
              className="fixed inset-0 z-[93] bg-black/55 backdrop-blur-[3px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={dismissActive}
            />
          )}
          <motion.div
            key={`${routeKey}:${active.id}`}
            initial={{ opacity: 0, y: isBanner ? 28 : 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isBanner ? 28 : 16, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            role="status"
            aria-live="polite"
            className={shellClass}
          >
          <div className={`${panelClass}`}>
          <div className={`relative overflow-hidden border-t border-r border-b bg-gradient-to-br from-[#0a0a0c] to-[#030303] text-white shadow-[0_28px_90px_rgba(0,0,0,0.85),0_0_40px_rgba(0,229,255,0.1)] backdrop-blur-20 ${visual.border} ${cardClass} border-l-[5px]`} style={{ borderLeftColor: visualKey === 'rose' ? '#FF007A' : visualKey === 'gold' ? '#FFC857' : visualKey === 'flash' ? '#B7FF00' : visualKey === 'community' ? '#8B5CF6' : '#00E5FF' }}>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent opacity-60" />
            <div className={`pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full blur-3xl ${visual.glow} animate-pulse`} />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),transparent_40%,rgba(255,255,255,0.02)_70%,transparent)]" />
            <motion.div
              className="absolute inset-x-0 bottom-0 h-[2.5px] origin-left"
              style={{ backgroundColor: visualKey === 'rose' ? '#FF007A' : visualKey === 'gold' ? '#FFC857' : visualKey === 'flash' ? '#B7FF00' : visualKey === 'community' ? '#8B5CF6' : '#00E5FF' }}
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: AUTO_DISMISS_MS / 1000, ease: 'linear' }}
            />

            <button
              type="button"
              onClick={dismissActive}
              className="absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-black/40 text-white/50 transition hover:bg-white/10 hover:text-white hover:border-white/25"
              aria-label="Cerrar anuncio"
            >
              <X size={15} />
            </button>

            <div className={`relative z-10 flex gap-3 ${isBanner ? 'items-center pr-3' : 'items-start pr-7 sm:gap-4 md:gap-5'}`}>
              {active.image_url ? (
                <div className={`relative shrink-0 overflow-hidden border border-white/10 bg-black/60 shadow-[0_8px_25px_rgba(0,0,0,0.5)] ${imageClass}`}>
                  <Image src={active.image_url} alt="" fill sizes="(max-width: 640px) 64px, 96px" className="object-cover transition-transform duration-700 hover:scale-105" />
                </div>
              ) : (
                <div className={`flex shrink-0 items-center justify-center border bg-black/40 shadow-[0_8px_25px_rgba(0,0,0,0.5)] ${visual.border} ${visual.accent} ${imageClass}`}>
                  <Megaphone size={24} className="animate-bounce duration-1000" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-[0.2em] sm:text-[9px] bg-white/5 border border-white/10 ${visual.accent}`}>
                  {badge}
                </span>
                <h3 className={`mt-2 font-black uppercase leading-tight tracking-normal text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70 ${titleClass}`}>
                  {active.title}
                </h3>
                {active.content && <p className={`mt-2.5 text-[12px] leading-relaxed text-white/75 sm:text-sm md:text-[15px] ${isBanner ? 'line-clamp-1 max-sm:hidden' : 'line-clamp-4 sm:line-clamp-3'}`}>{active.content}</p>}
                {active.cta_label && active.cta_url && (
                  <Link
                    href={active.cta_url}
                    onClick={dismissActive}
                    className={`mt-4 inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.16em] transition-all sm:w-auto sm:min-h-0 sm:rounded-lg sm:text-[10px] hover:scale-[1.03] duration-300 bg-white text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]`}
                    style={{
                      backgroundColor: visualKey === 'rose' ? '#FF007A' : visualKey === 'gold' ? '#FFC857' : visualKey === 'flash' ? '#B7FF00' : visualKey === 'community' ? '#8B5CF6' : '#00E5FF',
                      color: visualKey === 'gold' || visualKey === 'flash' ? '#000000' : '#ffffff',
                      boxShadow: `0 0 15px ${(visualKey === 'rose' ? '#FF007A' : visualKey === 'gold' ? '#FFC857' : visualKey === 'flash' ? '#B7FF00' : visualKey === 'community' ? '#8B5CF6' : '#00E5FF')}33`
                    }}
                  >
                    <MousePointerClick size={14} />
                    {active.cta_label}
                  </Link>
                )}
              </div>
            </div>
          </div>
          </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
