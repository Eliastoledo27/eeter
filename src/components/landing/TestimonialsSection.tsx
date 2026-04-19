'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface Testimonial {
    name: string;
    city: string;
    avatar: string;
    quote: string;
    stats: { icon: string; value: string; label: string }[];
    since: string;
}

const TESTIMONIALS: Testimonial[] = [
    {
        name: 'Valentina R.',
        city: 'Buenos Aires',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&fit=crop',
        quote: 'En 2 meses ya recuperé la inversión y tengo clientes fijos. ÉTER cambió mi forma de generar ingresos.',
        stats: [
            { icon: '💰', value: '$120K', label: 'ganancia/mes' },
            { icon: '📦', value: '23', label: 'pedidos/mes' },
            { icon: '⭐', value: '4.9', label: 'satisfacción' },
        ],
        since: 'Revendedora desde 2024',
    },
    {
        name: 'Matías G.',
        city: 'Rosario, Santa Fe',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&fit=crop',
        quote: 'Lo que más me convenció fue la logística. Yo solo vendo, ellos se encargan de todo. Brutal.',
        stats: [
            { icon: '💰', value: '$95K', label: 'ganancia/mes' },
            { icon: '📦', value: '18', label: 'pedidos/mes' },
            { icon: '⭐', value: '5.0', label: 'satisfacción' },
        ],
        since: 'Revendedor desde 2025',
    },
    {
        name: 'Carolina M.',
        city: 'Córdoba',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&fit=crop',
        quote: 'Las fotos que proveen son increíbles. Mis clientes piensan que tengo una tienda física en otra ciudad.',
        stats: [
            { icon: '💰', value: '$145K', label: 'ganancia/mes' },
            { icon: '📦', value: '31', label: 'pedidos/mes' },
            { icon: '⭐', value: '4.8', label: 'satisfacción' },
        ],
        since: 'Revendedora desde 2024',
    },
];

export function TestimonialsSection() {
    return (
        <section className="py-32 bg-[#0A0A0A] relative overflow-hidden border-t border-white/[0.04]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.03)_0%,_transparent_50%)]" />

            <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="mb-20"
                >
                    <span className="text-[#00E5FF] text-[10px] font-black tracking-[0.5em] uppercase block mb-4">
                        Comunidad ÉTER
                    </span>
                    <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white uppercase leading-none">
                        Ellos Ya<br />
                        <span className="text-[#00E5FF]">Lo Lograron.</span>
                    </h2>
                </motion.div>

                {/* Testimonials */}
                <div className="space-y-0">
                    {TESTIMONIALS.map((t, idx) => (
                        <motion.div
                            key={t.name}
                            initial={{ opacity: 0, x: idx % 2 === 0 ? -40 : 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.9, delay: 0.1, ease: [0.19, 1, 0.22, 1] }}
                            viewport={{ once: true, margin: '-80px' }}
                            className={`flex flex-col lg:flex-row items-start lg:items-center gap-10 lg:gap-20 py-14 border-b border-white/[0.06] ${
                                idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''
                            }`}
                        >
                            {/* Avatar + Info */}
                            <div className="flex items-center gap-6 lg:w-64 shrink-0">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full overflow-hidden border border-[#00E5FF]/30">
                                        <Image
                                            src={t.avatar}
                                            alt={t.name}
                                            width={64}
                                            height={64}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#00E5FF] rounded-full flex items-center justify-center">
                                        <span className="text-black text-[8px] font-black">✓</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-white font-black text-base">{t.name}</div>
                                    <div className="text-gray-500 text-[11px] uppercase tracking-widest">{t.city}</div>
                                    <div className="text-[#00E5FF] text-[10px] font-bold mt-1">{t.since}</div>
                                </div>
                            </div>

                            {/* Quote */}
                            <blockquote className="flex-1">
                                <p className="text-2xl md:text-3xl font-light text-white leading-relaxed italic">
                                    &ldquo;{t.quote}&rdquo;
                                </p>
                            </blockquote>

                            {/* Stats */}
                            <div className="flex flex-row lg:flex-col gap-4 lg:w-48 shrink-0">
                                {t.stats.map(s => (
                                    <div key={s.label} className="text-center lg:text-left">
                                        <div className="text-lg font-black text-white">
                                            {s.icon} {s.value}
                                        </div>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-widest">{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center"
                >
                    <p className="text-gray-500 text-sm mb-6">
                        Más de <span className="text-white font-bold">500 revendedores activos</span> en toda Argentina.
                    </p>
                    <a
                        href="/register"
                        className="inline-flex items-center gap-3 text-[11px] font-black tracking-[0.3em] uppercase text-[#00E5FF] hover:text-white transition-colors group"
                    >
                        Unirme a la comunidad
                        <span className="w-8 h-px bg-[#00E5FF] group-hover:w-16 transition-all duration-500 inline-block" />
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
