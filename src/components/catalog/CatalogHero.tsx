'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowUpRight,
  Headphones,
  LucideIcon,
  PackageCheck,
  ScanLine,
  ShieldCheck,
  Truck,
} from 'lucide-react';

const easeOut = [0.16, 1, 0.3, 1] as const;

interface FeatureItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

function FeatureItem({ icon: Icon, title, description }: FeatureItemProps) {
  return (
    <div className="group flex items-center gap-4 md:gap-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-[#39FF14]/20 bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.1)] transition-all group-hover:border-[#39FF14]/50 group-hover:bg-[#39FF14]/10 md:h-14 md:w-14">
        <Icon size={24} className="text-[#39FF14]" />
      </div>
      <div className="min-w-0 space-y-1">
        <h4 className="text-[10px] font-black uppercase tracking-[0.18em] text-white transition-colors group-hover:text-[#39FF14] md:text-[11px]">
          {title}
        </h4>
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/45 md:text-[10px]">
          {description}
        </p>
      </div>
    </div>
  );
}

export function CatalogHero() {
  const heroRef = useRef<HTMLElement | null>(null);
  const shoeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(min-width: 1024px)').matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.to(shoeRef.current, {
        y: -34,
        rotate: -2,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top 20%',
          end: 'bottom top',
          scrub: 0.8,
        },
      });
    }, heroRef);

    return () => context.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative w-full overflow-hidden bg-[#030303] pb-10 pt-28 sm:pb-16 sm:pt-36">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:56px_56px] opacity-35" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_34%_24%,rgba(57,255,20,.16),transparent_34%),radial-gradient(circle_at_82%_40%,rgba(160,32,240,.18),transparent_34%),radial-gradient(circle_at_52%_82%,rgba(0,224,255,.13),transparent_30%)]" />
        <div className="absolute right-0 top-0 hidden h-[620px] w-[620px] translate-x-1/4 opacity-20 md:block">
          <Image
            src="/design/grafiti violeta.png"
            alt=""
            fill
            sizes="620px"
            className="rotate-12 scale-110 object-contain"
          />
        </div>
      </div>

      <div className="container relative z-10 mx-auto px-5 md:px-8">
        <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)]">
          <div className="max-w-5xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: easeOut }}
              className="mb-6 flex items-center gap-3"
            >
              <div className="h-2 w-2 animate-pulse rounded-full bg-[#39FF14] shadow-[0_0_18px_rgba(57,255,20,.85)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.42em] text-[#39FF14]">
                Catalogo ETER / live stock
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: easeOut, delay: 0.1 }}
              style={{ willChange: 'transform', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              className="mb-6 max-w-[920px] text-[46px] font-black uppercase leading-[0.86] tracking-normal text-white sm:text-[68px] md:text-[88px]"
            >
              Stock urbano.
              <br />
              <span className="text-[#00E0FF]">Compra rapida.</span>
              <br />
              <span className="text-[#39FF14] drop-shadow-[0_0_28px_rgba(57,255,20,0.34)]">Vende hoy.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: easeOut, delay: 0.2 }}
              className="max-w-2xl text-base font-medium leading-relaxed text-white/68 md:text-xl"
            >
              Catalogo mobile-first para compradores y revendedores: modelos premium, talles visibles, stock real y decisiones sin friccion.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: easeOut, delay: 0.28 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link href="#catalogo" className="inline-flex items-center justify-center gap-3 rounded-md bg-[#39FF14] px-7 py-4 text-[11px] font-black uppercase tracking-[0.18em] text-black transition hover:bg-white">
                Ver stock
                <ArrowUpRight size={16} />
              </Link>
              <Link href="/register" className="inline-flex items-center justify-center gap-3 rounded-md border border-white/15 bg-white/[0.04] px-7 py-4 text-[11px] font-black uppercase tracking-[0.18em] text-white transition hover:border-[#00E0FF]/50 hover:text-[#00E0FF]">
                Canal revendedor
              </Link>
            </motion.div>
          </div>

          <motion.div
            ref={shoeRef}
            initial={{ opacity: 0, y: 30, rotate: 2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.9, ease: easeOut, delay: 0.2 }}
            className="relative hidden min-h-[430px] lg:block"
          >
            <div className="absolute inset-x-6 bottom-10 h-28 bg-[#00E0FF]/18 blur-3xl" />
            <div className="absolute right-0 top-2 z-10 flex items-center gap-2 rounded-md border border-[#A020F0]/35 bg-black/70 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#A020F0] backdrop-blur">
              <ScanLine size={14} />
              verified drop
            </div>
            <Image
              src="/hero.webp"
              alt="Zapatilla premium ETER"
              fill
              priority
              sizes="(min-width: 1024px) 48vw, 0vw"
              className="object-contain object-bottom drop-shadow-[0_26px_80px_rgba(0,224,255,.28)]"
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easeOut, delay: 0.3 }}
          className="mt-10 grid grid-cols-2 gap-4 border-t border-white/10 bg-gradient-to-b from-white/[0.035] to-transparent px-0 py-6 md:grid-cols-4 md:gap-8 md:px-4"
        >
          <FeatureItem icon={ShieldCheck} title="Verificados" description="Control previo" />
          <FeatureItem icon={Truck} title="Envio rapido" description="A todo el pais" />
          <FeatureItem icon={PackageCheck} title="Sin compra minima" description="Vende desde 1 par" />
          <FeatureItem icon={Headphones} title="Soporte real" description="Canal revendedor" />
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
}
