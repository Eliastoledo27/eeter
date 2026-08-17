'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Megaphone, MousePointerClick, Sparkles, X, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import type { Announcement } from '@/hooks/useAnnouncements';

const AUTO_DISMISS_MS = 9000;

function getVisualConfig(templateKey?: string, category?: string) {
  const key = `${templateKey || ''} ${category || ''}`.toLowerCase();
  if (key.includes('rose') || key.includes('pink') || key.includes('mujer') || key.includes('femme')) {
    return { accent: 'text-[#FF007A]', glow: 'bg-[#FF007A]/25', border: 'border-[#FF007A]/35', hex: '#FF007A' };
  }
  if (key.includes('gold') || key.includes('luxury') || key.includes('oro') || key.includes('signature') || key.includes('minimal')) {
    return { accent: 'text-[#FFC857]', glow: 'bg-[#FFC857]/20', border: 'border-[#FFC857]/30', hex: '#FFC857' };
  }
  if (key.includes('flash') || key.includes('sale') || key.includes('oferta') || key.includes('verde') || key.includes('green') || key.includes('bold')) {
    return { accent: 'text-[#39FF14]', glow: 'bg-[#39FF14]/25', border: 'border-[#39FF14]/35', hex: '#39FF14' };
  }
  if (key.includes('community') || key.includes('comunidad') || key.includes('vip') || key.includes('purple') || key.includes('morado') || key.includes('club')) {
    return { accent: 'text-[#A855F7]', glow: 'bg-[#A855F7]/25', border: 'border-[#A855F7]/35', hex: '#A855F7' };
  }
  return { accent: 'text-[#00E5FF]', glow: 'bg-[#00E5FF]/20', border: 'border-[#00E5FF]/30', hex: '#00E5FF' };
}

function normalizeTargetPage(value: string) {
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

  if (['all', 'todos', 'todo', '*', 'toda la web'].includes(normalized)) return 'all';
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

  // No mostrar en el panel de control ni portal de revendedor
  if (pathname?.startsWith('/reseller') || pathname?.startsWith('/dashboard')) return null;

  const routeKey = pathname || '/';
  const pageKey = getPageKey(routeKey);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Consulta de anuncios sincronizada con FETER Stock y el Dashboard
  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function loadAnnouncements() {
      try {
        // 1. Intentar cargar vía API del servidor (ignora bloqueos RLS y optimiza cache)
        const res = await fetch(`/api/announcements?page=${encodeURIComponent(pageKey)}`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const payload = await res.json();
          if (payload.success && Array.isArray(payload.announcements) && isMounted) {
            setAnnouncements(payload.announcements);
            return;
          }
        }
      } catch (e) {
        // Fallback a consulta directa Supabase
      }

      try {
        // 2. Consulta directa a Supabase
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .order('priority', { ascending: false })
          .order('published_at', { ascending: false });

        if (!error && data && isMounted) {
          setAnnouncements(data);
        }
      } catch (err) {
        console.error('Error fetching announcements from supabase:', err);
      }
    }

    loadAnnouncements();

    // Polling cada 12 segundos para detectar cambios de FETER Stock inmediatamente
    const interval = setInterval(loadAnnouncements, 12000);

    // Suscribirse a cambios en tiempo real desde Supabase / FETER Stock
    const channel = supabase
      .channel('announcements_realtime_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        () => {
          loadAnnouncements();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [pageKey]);

  // Filtrar anuncios activos y asignados a esta página
  const eligibleAnnouncements = useMemo(() => {
    const activeList = announcements
      .filter((a) => a.is_active)
      .sort((a, b) => {
        const priorityDelta = (b.priority || 0) - (a.priority || 0);
        if (priorityDelta !== 0) return priorityDelta;
        return new Date(b.published_at || b.created_at || 0).getTime() - new Date(a.published_at || a.created_at || 0).getTime();
      });

    const filtered = activeList.filter((a) => {
      const targetPages = a.target_pages && a.target_pages.length > 0 ? a.target_pages : ['all'];
      const normalizedTargets = targetPages.map(normalizeTargetPage);
      const isTarget = normalizedTargets.includes('all') || normalizedTargets.includes(pageKey);
      return isTarget && !dismissedIds.has(a.id);
    });

    return filtered;
  }, [announcements, dismissedIds, pageKey]);

  const active = eligibleAnnouncements[currentIndex % Math.max(1, eligibleAnnouncements.length)] || null;

  // Rotación y temporizador
  useEffect(() => {
    if (!active || isHovered) return;

    timerRef.current = setTimeout(() => {
      if (eligibleAnnouncements.length > 1) {
        setCurrentIndex((prev) => (prev + 1) % eligibleAnnouncements.length);
      }
    }, AUTO_DISMISS_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, isHovered, eligibleAnnouncements.length, currentIndex]);

  const dismissCurrent = () => {
    if (!active) return;
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(active.id);
      return next;
    });
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 250);
  };

  if (!active) return null;

  const mode = active.display_mode || 'floating';
  const visual = getVisualConfig(active.template_key, active.category || undefined);
  const badgeText = active.category || 'ÉTER // ANUNCIO';

  // ── 1. Modo MODAL ─────────────────────────────────────────────────────────────
  if (mode === 'modal') {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-[9990] grid place-items-center px-4 py-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissCurrent}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />
          <motion.div
            key={`modal-${active.id}`}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border bg-gradient-to-b from-[#111113] via-[#09090b] to-[#040405] p-6 text-white shadow-[0_25px_80px_rgba(0,0,0,0.95)] backdrop-blur-2xl"
            style={{ borderColor: `${visual.hex}44` }}
          >
            <div className={`pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full blur-3xl ${visual.glow}`} />

            <button
              type="button"
              onClick={dismissCurrent}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/15 hover:text-white"
              aria-label="Cerrar"
            >
              <X size={15} />
            </button>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {active.image_url && (
                <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-2xl border border-white/10 sm:h-32 sm:w-32">
                  <Image src={active.image_url} alt="" fill sizes="128px" className="object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[9px] font-mono font-black uppercase tracking-wider"
                  style={{ borderColor: `${visual.hex}55`, color: visual.hex, backgroundColor: `${visual.hex}15` }}
                >
                  <Sparkles size={10} />
                  {badgeText}
                </span>
                <h3 className="mt-2 text-lg font-black uppercase tracking-tight text-white sm:text-xl">
                  {active.title}
                </h3>
                {active.content && (
                  <p className="mt-1.5 text-xs text-white/70 leading-relaxed sm:text-sm">
                    {active.content}
                  </p>
                )}
              </div>
            </div>

            {active.cta_label && active.cta_url && (
              <div className="mt-5 pt-3 border-t border-white/10 flex justify-end">
                <Link
                  href={active.cta_url}
                  onClick={dismissCurrent}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
                  style={{ backgroundColor: visual.hex }}
                >
                  <MousePointerClick size={14} />
                  {active.cta_label}
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  // ── 2. Modo BANNER ────────────────────────────────────────────────────────────
  if (mode === 'banner') {
    return (
      <aside aria-label="Anuncios Éter">
      <AnimatePresence>
        <motion.div
          key={`banner-${active.id}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="fixed inset-x-0 bottom-4 z-[9990] mx-auto w-[min(48rem,calc(100vw-1.5rem))] px-2"
        >
          <div
            className="relative flex items-center justify-between gap-3 overflow-hidden rounded-2xl border bg-[#0a0a0c]/95 p-3 text-white shadow-[0_15px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:px-5 sm:py-3.5"
            style={{ borderColor: `${visual.hex}44` }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="hidden shrink-0 items-center justify-center rounded-lg p-2 sm:flex"
                style={{ backgroundColor: `${visual.hex}20`, color: visual.hex }}
              >
                <Megaphone size={16} />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-white/50">{badgeText}</span>
                </div>
                <h4 className="truncate text-xs font-bold uppercase tracking-tight text-white sm:text-sm">{active.title}</h4>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {active.cta_label && active.cta_url && (
                <Link
                  href={active.cta_url}
                  onClick={dismissCurrent}
                  className="rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-black transition hover:scale-105"
                  style={{ backgroundColor: visual.hex }}
                >
                  {active.cta_label}
                </Link>
              )}
              <button
                type="button"
                onClick={dismissCurrent}
                className="grid h-7 w-7 place-items-center rounded-full text-white/40 hover:bg-white/10 hover:text-white"
                aria-label="Cerrar"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      </aside>
    );
  }

  // ── 3. Modo FLOATING (Predeterminado — Card en esquina inferior izquierda) ──
  return (
    <aside aria-label="Anuncios Éter">
    <AnimatePresence mode="wait">
      <motion.div
        key={`floating-${active.id}`}
        initial={{ opacity: 0, scale: 0.9, y: 25, x: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } }}
        transition={{ type: 'spring', damping: 24, stiffness: 280 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed bottom-5 left-4 z-[9990] w-[min(24rem,calc(100vw-2rem))] sm:bottom-6 sm:left-6"
        role="region"
        aria-live="polite"
      >
        <div
          className="group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-[#0c0c0e]/95 via-[#08080a]/98 to-[#030304] p-3.5 text-white shadow-[0_20px_60px_rgba(0,0,0,0.92),0_0_30px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-all duration-300 sm:p-4"
          style={{
            borderColor: `${visual.hex}35`,
            boxShadow: `0 20px 60px rgba(0,0,0,0.9), 0 0 25px ${visual.hex}18`,
          }}
        >
          {/* Sombra de glow */}
          <div
            className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl ${visual.glow} opacity-60`}
          />

          {/* Barra de progreso de auto-cierre */}
          {!isHovered && (
            <motion.div
              key={`progress-${active.id}-${currentIndex}`}
              className="absolute inset-x-0 bottom-0 h-[2px] origin-left"
              style={{ backgroundColor: visual.hex }}
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: AUTO_DISMISS_MS / 1000, ease: 'linear' }}
            />
          )}

          {/* Botón cerrar */}
          <button
            type="button"
            onClick={dismissCurrent}
            className="absolute right-2.5 top-2.5 z-20 grid h-6 w-6 place-items-center rounded-full border border-white/10 bg-white/5 text-white/40 transition-all hover:bg-white/20 hover:text-white"
            aria-label="Cerrar anuncio"
          >
            <X size={12} />
          </button>

          <div className="relative z-10 flex items-start gap-3">
            {/* Imagen o icono del anuncio del dashboard */}
            {active.image_url ? (
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/60 shadow-md sm:h-16 sm:w-16">
                <Image
                  src={active.image_url}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ) : (
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border sm:h-16 sm:w-16"
                style={{ backgroundColor: `${visual.hex}15`, borderColor: `${visual.hex}40`, color: visual.hex }}
              >
                <Megaphone size={20} className="animate-pulse" />
              </div>
            )}

            {/* Contenido configurado en el Dashboard */}
            <div className="min-w-0 flex-1 pr-4">
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block rounded px-1.5 py-0.5 text-[8px] font-mono font-black uppercase tracking-wider"
                  style={{
                    backgroundColor: `${visual.hex}20`,
                    color: visual.hex,
                    border: `1px solid ${visual.hex}40`,
                  }}
                >
                  {badgeText}
                </span>
              </div>

              <h4 className="mt-1 text-xs font-black uppercase leading-tight tracking-tight text-white sm:text-sm line-clamp-2">
                {active.title}
              </h4>

              {active.content && (
                <p className="mt-1 text-[11px] leading-snug text-white/65 line-clamp-2">
                  {active.content}
                </p>
              )}

              {/* Botón CTA del Dashboard */}
              {active.cta_label && active.cta_url && (
                <div className="mt-2.5">
                  <Link
                    href={active.cta_url}
                    onClick={dismissCurrent}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-black transition-all hover:scale-105 active:scale-95 shadow"
                    style={{ backgroundColor: visual.hex }}
                  >
                    <span>{active.cta_label}</span>
                    <ChevronRight size={11} strokeWidth={3} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
    </aside>
  );
}


