'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Crown, Users, Box, ShieldCheck } from 'lucide-react';

const easeOut = [0.16, 1, 0.3, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } } };

const metrics = [
    { icon: Users, value: '+500', label: 'Revendedores', sub: 'Activos en Argentina', color: 'text-[#00E5FF]' },
    { icon: Box, value: '+12k', label: 'Pares entregados', sub: 'Logística propia', color: 'text-[#C6FF00]' },
    { icon: ShieldCheck, value: 'G5 / OG', label: 'Calidad', sub: 'La elite del calzado', color: 'text-[#7A00FF]' },
    { icon: Crown, value: 'Libre', label: 'Margen', sub: 'Vos ponés el precio', color: 'text-[#00E5FF]' },
];

export function ResellerHero({ totalProducts }: { totalProducts: number }) {
    return (
        <>
            <section className="relative z-0 overflow-hidden bg-[#050505] pt-28 pb-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_44%_32%,rgba(198,255,0,.15),transparent_35%),radial-gradient(circle_at_82%_44%,rgba(122,0,255,.16),transparent_35%),radial-gradient(circle_at_20%_80%,rgba(0,229,255,.12),transparent_30%)]" />
                <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.4, 0.3], rotate: [0, 3, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} style={{ willChange: 'transform, opacity' }} className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-gradient-to-br from-[#C6FF00]/10 to-transparent blur-[60px] rounded-full" />
                <motion.div animate={{ scale: [1.05, 1, 1.05], opacity: [0.2, 0.3, 0.2], rotate: [0, -3, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} style={{ willChange: 'transform, opacity' }} className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-gradient-to-tr from-[#7A00FF]/10 to-transparent blur-[50px] rounded-full" />
                <div className="grunge-overlay" />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />

                <div className="mx-auto max-w-[1440px] px-5 md:px-10 relative z-10">
                    <motion.div initial="hidden" animate="visible" variants={stagger}>
                        <motion.div variants={fadeUp} transition={{ duration: 0.75, ease: easeOut }} className="mb-6 flex items-center gap-3">
                            <span className="h-3 w-3 rounded-full bg-[#00E5FF] shadow-[0_0_12px_#00E5FF] animate-pulse" />
                            <span className="text-sm font-black uppercase tracking-[0.2em] text-white">Catálogo Revendedor</span>
                        </motion.div>
                        <motion.h1 variants={fadeUp} transition={{ duration: 0.85, ease: easeOut }} className="mb-4 relative w-full max-w-[400px] sm:max-w-[500px] md:max-w-[700px] h-[80px] sm:h-[120px] md:h-[180px]">
                            <span className="sr-only">ÉTER</span>
                            <Image src="/texto.png" alt="ÉTER branding" fill priority className="object-contain object-left pointer-events-none drop-shadow-[0_0_35px_rgba(255,255,255,0.15)]" />
                        </motion.h1>
                        <motion.p variants={fadeUp} transition={{ duration: 0.75, ease: easeOut }} className="mb-2 text-lg font-black uppercase tracking-[0.18em] text-white/90">Catálogo profesional de ventas.</motion.p>
                        <motion.p variants={fadeUp} transition={{ duration: 0.75, ease: easeOut }} className="mb-5 text-3xl sm:text-4xl font-black uppercase leading-none tracking-[-0.04em] mt-4">
                            <span className="text-[#C6FF00]">Consultá.</span>{' '}<span className="text-[#00E5FF]">Vendé.</span>{' '}<span className="text-[#7A00FF]">Ganá.</span>
                        </motion.p>
                        <motion.p variants={fadeUp} transition={{ duration: 0.75, ease: easeOut }} className="text-sm text-white/50 max-w-lg leading-relaxed">
                            Tu herramienta definitiva. Stock en tiempo real, material descargable y precios actualizados para cerrar más ventas.
                        </motion.p>
                        <motion.div variants={fadeUp} transition={{ duration: 0.75, ease: easeOut }} className="flex flex-col gap-5 sm:flex-row mt-8">
                            <Link href="/catalog" className="eter-btn-glass group">VER CATÁLOGO PÚBLICO <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" size={18} /></Link>
                            <a href="#productos" className="eter-outline-cta">{totalProducts} MODELOS DISPONIBLES</a>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Metrics Bar */}
            <section className="relative z-0 bg-[#050505] px-5 md:px-10">
                <div className="eter-card mx-auto grid max-w-[1440px] grid-cols-2 overflow-hidden lg:grid-cols-4">
                    {metrics.map(({ icon: Icon, value, label, sub, color }, index) => (
                        <motion.div key={label} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6, ease: easeOut, delay: index * 0.06 }} whileHover={{ backgroundColor: 'rgba(198,255,0,0.035)' }} className="group relative flex items-center gap-5 border-white/10 px-5 py-5 even:border-l lg:border-l lg:first:border-l-0">
                            <Icon className={`h-9 w-9 shrink-0 ${color}`} strokeWidth={1.8} />
                            <div>
                                <div className="text-2xl font-black leading-none text-white md:text-3xl">{value}</div>
                                <div className="mt-1 text-[11px] font-black uppercase tracking-[0.12em] text-white">{label}</div>
                                <div className="text-[10px] uppercase tracking-[0.08em] text-white/55">{sub}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </>
    );
}
