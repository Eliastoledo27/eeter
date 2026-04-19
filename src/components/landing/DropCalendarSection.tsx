'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Drop {
    id: number;
    codename: string;
    hint: string;
    image: string;
    dropDate: Date;
    category: string;
}

const DROPS: Drop[] = [
    {
        id: 1,
        codename: '??? × ÉTER',
        hint: 'Colaboración exclusiva. Silhouette icónica rediseñada.',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&h=600&fit=crop',
        dropDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000),
        category: 'Sneakers',
    },
    {
        id: 2,
        codename: 'PROJECT: NB',
        hint: 'Running heritage meets luxury street. Edición limitada.',
        image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=600&h=600&fit=crop',
        dropDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
        category: 'Running',
    },
    {
        id: 3,
        codename: 'SLIDE GOLD EDIT.',
        hint: 'La comodidad más cotizada del verano. Solo 50 pares.',
        image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=600&h=600&fit=crop',
        dropDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000),
        category: 'Ojotas',
    },
];

function getTimeLeft(target: Date) {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
    return {
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((diff % (1000 * 60)) / 1000),
    };
}

function CountdownTimer({ target }: { target: Date }) {
    const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setTime(getTimeLeft(target));
        const interval = setInterval(() => setTime(getTimeLeft(target)), 1000);
        return () => clearInterval(interval);
    }, [target]);

    if (!mounted) {
        return (
            <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="text-center opacity-0">
                        <div className="text-xl font-black w-10">00</div>
                        <div className="text-[9px] uppercase tracking-widest">...</div>
                    </div>
                ))}
            </div>
        );
    }

    const parts = [
        { value: time.d, label: 'días' },
        { value: time.h, label: 'hrs' },
        { value: time.m, label: 'min' },
        { value: time.s, label: 'seg' },
    ];

    return (
        <div className="flex gap-2">
            {parts.map((p, i) => (
                <div key={i} className="text-center">
                    <div className="text-xl font-black text-white w-10 tabular-nums">
                        {String(p.value).padStart(2, '0')}
                    </div>
                    <div className="text-[9px] text-gray-600 uppercase tracking-widest">{p.label}</div>
                </div>
            ))}
        </div>
    );
}

export function DropCalendarSection() {
    return (
        <section className="py-32 bg-[#050505] relative overflow-hidden border-t border-white/[0.04]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(212,175,55,0.04)_0%,_transparent_60%)]" />

            <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
                >
                    <div>
                        <span className="text-[#00E5FF] text-[10px] font-black tracking-[0.5em] uppercase block mb-4">
                            Próximos Lanzamientos
                        </span>
                        <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white uppercase leading-none">
                            Drop<br />
                            <span className="text-[#00E5FF]">Calendar.</span>
                        </h2>
                    </div>
                    <p className="text-gray-500 text-sm max-w-sm">
                        Registrate antes del drop y accedé a precio de revendedor con prioridad de stock.
                    </p>
                </motion.div>

                {/* Drop Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {DROPS.map((drop, idx) => (
                        <motion.div
                            key={drop.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: idx * 0.12, ease: [0.19, 1, 0.22, 1] }}
                            viewport={{ once: true }}
                            className="group border border-white/[0.06] hover:border-[#00E5FF]/30 transition-all duration-700 bg-[#0A0A0A]"
                        >
                            {/* Image — blurred */}
                            <div className="relative aspect-square overflow-hidden">
                                <Image
                                    src={drop.image}
                                    alt="Drop exclusivo"
                                    fill
                                    className="object-cover blur-md grayscale group-hover:blur-none group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                                <div className="absolute inset-0 bg-black/70 group-hover:bg-black/40 transition-all duration-700" />

                                {/* Category pill */}
                                <div className="absolute top-4 left-4">
                                    <span className="bg-[#00E5FF] text-black text-[9px] font-black uppercase tracking-widest px-3 py-1">
                                        {drop.category}
                                    </span>
                                </div>

                                {/* Codename overlay */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-black text-white tracking-tighter text-center px-4">
                                        {drop.codename}
                                    </span>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-6">
                                <p className="text-gray-500 text-sm mb-6">{drop.hint}</p>

                                <div className="flex items-center justify-between mb-6">
                                    <CountdownTimer target={drop.dropDate} />
                                </div>

                                <button
                                    className="w-full py-4 border border-[#00E5FF]/40 text-[#00E5FF] text-[10px] font-black uppercase tracking-[0.25em] hover:bg-[#00E5FF] hover:text-black transition-all duration-500"
                                    aria-label={`Unirme a la lista de espera para ${drop.codename}`}
                                >
                                    Unirme a la Lista de Espera
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
