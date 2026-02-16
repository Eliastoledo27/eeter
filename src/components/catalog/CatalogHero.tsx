'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export function CatalogHero() {
    const heroRef = useRef<HTMLDivElement>(null);
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            if (heroRef.current) {
                const rect = heroRef.current.getBoundingClientRect();
                if (rect.bottom > 0) {
                    setScrollY(window.scrollY * 0.4);
                }
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <section
            ref={heroRef}
            className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden"
            aria-label="Hero del catálogo"
        >
            {/* Parallax Background — cinematic dark with gold accents */}
            <div
                className="absolute inset-0 w-full h-[130%] -top-[15%]"
                style={{ transform: `translateY(${scrollY}px)` }}
            >
                {/* Dark luxury gradient background */}
                <div className="w-full h-full bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#0a0a0a]" />
            </div>

            {/* Ambient Orbs */}
            <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] bg-[#ffd900]/5 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDuration: '8s' }} />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-[#c88a04]/5 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDuration: '10s', animationDelay: '3s' }} />

            {/* Noise texture */}
            <div className="absolute inset-0 bg-noise opacity-[0.03]" />

            {/* Gradient bottom fade */}
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0a0a0a] to-transparent z-[1]" />

            {/* Content */}
            <div className="relative z-10 container mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="max-w-4xl mx-auto"
                >
                    {/* Premium badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-[#ffd900]/20 backdrop-blur-sm mb-8"
                    >
                        <span className="w-2 h-2 bg-[#ffd900] rounded-full animate-pulse" />
                        <span className="text-[#ffd900] font-display font-bold text-xs tracking-[0.3em] uppercase">
                            Premium Collection
                        </span>
                    </motion.div>

                    {/* Main Title */}
                    <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-display font-black text-white leading-[0.9] tracking-tighter mb-6">
                        COLECCIÓN
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffd900] via-amber-400 to-[#c88a04]">
                            EXCLUSIVA
                        </span>
                        <br />
                        <span className="text-white/30">2026</span>
                    </h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-gray-400 text-lg sm:text-xl md:text-2xl font-light max-w-2xl mx-auto leading-relaxed mb-10"
                    >
                        Redefiniendo el streetwear en Argentina. Piezas limitadas diseñadas
                        para quienes no siguen tendencias, <span className="text-white font-medium">las crean.</span>
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <button
                            onClick={() =>
                                window.scrollTo({ top: window.innerHeight * 0.85, behavior: 'smooth' })
                            }
                            className="inline-flex items-center justify-center min-h-[56px] px-12 bg-gradient-to-br from-[#ffd900] to-[#c88a04] text-black font-display font-bold rounded-full uppercase tracking-widest text-sm hover:shadow-[0_0_40px_rgba(255,217,0,0.4)] transition-all duration-500 transform hover:-translate-y-1 active:scale-95"
                            aria-label="Explorar catálogo"
                        >
                            Explorar Catálogo
                        </button>
                        <a
                            href="https://wa.me/542235025196"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center min-h-[56px] px-12 bg-white/5 border border-white/15 backdrop-blur-sm text-white font-display font-bold rounded-full uppercase tracking-widest text-sm hover:bg-white/10 hover:border-white/30 transition-all duration-500"
                        >
                            Contactar
                        </a>
                    </motion.div>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
            >
                <span className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-display">Scroll</span>
                <div className="w-[1px] h-8 bg-gradient-to-b from-[#ffd900]/50 to-transparent" />
            </motion.div>
        </section>
    );
}
