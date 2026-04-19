'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function CatalogHero() {
    return (
        <section className="relative w-full pt-28 pb-6 md:pt-32 md:pb-10 overflow-hidden">
            {/* Subtle ambient glow */}
            <div className="absolute top-0 right-[10%] w-[40vw] h-[30vw] bg-[#00E5FF]/[0.04] rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-5 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="flex flex-col md:flex-row md:items-end md:justify-between gap-6"
                >
                    {/* Left: Title block */}
                    <div className="space-y-3">
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00E5FF]/[0.08] border border-[#00E5FF]/20"
                        >
                            <Sparkles size={12} className="text-[#00E5FF]" />
                            <span className="text-[#00E5FF] text-[10px] font-bold tracking-[0.2em] uppercase">
                                Colección 2026
                            </span>
                        </motion.div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[0.95] tracking-tight">
                            Catálogo
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-cyan-400 ml-3">
                                Premium
                            </span>
                        </h1>

                        <p className="text-white/40 text-sm md:text-base max-w-md leading-relaxed">
                            Piezas limitadas diseñadas para quienes crean tendencias.
                        </p>
                    </div>

                    {/* Right: Live counter pill (desktop) */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="hidden md:flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm"
                    >
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                        <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
                            Stock en tiempo real
                        </span>
                    </motion.div>
                </motion.div>
            </div>

            {/* Bottom separator line */}
            <div className="container mx-auto px-5 md:px-6 mt-6 md:mt-8">
                <div className="h-px bg-gradient-to-r from-[#00E5FF]/20 via-white/[0.06] to-transparent" />
            </div>
        </section>
    );
}
