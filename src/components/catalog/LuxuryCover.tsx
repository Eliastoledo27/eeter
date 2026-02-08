'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { Playfair_Display, Inter } from 'next/font/google';
import { ArrowRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

export function LuxuryCover() {
  const shouldReduceMotion = useReducedMotion();

  const scrollToCatalog = () => {
    const catalogSection = document.getElementById('catalog-section');
    if (catalogSection) {
      catalogSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className={`${inter.className} relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#F7F7F5]`}>
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }} />

      {/* Geometric accent elements */}
      <div className="absolute top-20 right-20 w-64 h-64 border border-[#C9A227]/20 rounded-full hidden lg:block" />
      <div className="absolute bottom-32 left-16 w-32 h-32 bg-[#C9A227]/5 rounded-full hidden lg:block" />
      <div className="absolute top-40 left-1/4 w-1 h-32 bg-gradient-to-b from-[#C9A227]/30 to-transparent hidden lg:block" />

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-24">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left content - 7 columns */}
          <div className="lg:col-span-7 space-y-8">
            {/* Overline */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-4"
            >
              <div className="h-px w-12 bg-[#C9A227]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#6B6B6B]">
                Colección Exclusiva 2025
              </span>
            </motion.div>

            {/* Main headline with custom lettering effect */}
            <motion.h1
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={`${playfair.className} text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-semibold text-[#1C1C1C] leading-[0.95] tracking-tight`}
            >
              <span className="block">Éter</span>
              <span className="block mt-2 text-[#C9A227]">Store</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg sm:text-xl text-[#3A3A3A] max-w-lg leading-relaxed font-light"
            >
              Descubre nuestra curaduría de productos premium seleccionados para revendedores exigentes.
              Calidad excepcional, diseño atemporal.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <button
                onClick={scrollToCatalog}
                className="group inline-flex items-center gap-3 bg-[#C9A227] text-[#1C1C1C] px-8 py-4 text-sm font-semibold uppercase tracking-[0.15em] rounded-lg transition-all duration-300 hover:bg-[#B8941F] hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(201,162,39,0.3)]"
              >
                Explorar Catálogo
                <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <Link
                href="/about"
                className="inline-flex items-center gap-2 border border-[#1C1C1C] text-[#1C1C1C] px-8 py-4 text-sm font-semibold uppercase tracking-[0.15em] rounded-lg transition-all duration-300 hover:bg-[#1C1C1C] hover:text-white"
              >
                Conocer Más
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex gap-12 pt-8 border-t border-[#1C1C1C]/10"
            >
              <div>
                <div className={`${playfair.className} text-3xl font-semibold text-[#1C1C1C]`}>500+</div>
                <div className="text-xs uppercase tracking-[0.2em] text-[#6B6B6B] mt-1">Productos</div>
              </div>
              <div>
                <div className={`${playfair.className} text-3xl font-semibold text-[#1C1C1C]`}>50+</div>
                <div className="text-xs uppercase tracking-[0.2em] text-[#6B6B6B] mt-1">Marcas</div>
              </div>
              <div>
                <div className={`${playfair.className} text-3xl font-semibold text-[#1C1C1C]`}>24h</div>
                <div className="text-xs uppercase tracking-[0.2em] text-[#6B6B6B] mt-1">Envío</div>
              </div>
            </motion.div>
          </div>

          {/* Right content - 5 columns - Asymmetric composition */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-[4/5] lg:aspect-[3/4]"
            >
              {/* Main image container with editorial styling */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.15)]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4C5B0]/20 to-transparent z-10" />
                <Image
                  src="https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=90&w=800"
                  alt="Luxury product showcase"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Floating accent card */}
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -bottom-8 -left-8 bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-[#1C1C1C]/5 max-w-[200px]"
              >
                <div className="text-[10px] uppercase tracking-[0.3em] text-[#C9A227] mb-2">Destacado</div>
                <div className={`${playfair.className} text-lg font-medium text-[#1C1C1C] leading-tight`}>
                  Edición Limitada
                </div>
                <div className="text-xs text-[#6B6B6B] mt-2">Disponible ahora</div>
              </motion.div>

              {/* Geometric accent */}
              <div className="absolute -top-4 -right-4 w-24 h-24 border-2 border-[#C9A227]/30 rounded-full hidden lg:block" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
        onClick={scrollToCatalog}
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#6B6B6B]">Desplazar</span>
        <motion.div
          animate={shouldReduceMotion ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={20} className="text-[#C9A227]" />
        </motion.div>
      </motion.div>
    </section>
  );
}
