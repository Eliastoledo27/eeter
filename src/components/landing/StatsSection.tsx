'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface Stat {
    value: string;
    numericEnd: number;
    prefix: string;
    suffix: string;
    label: string;
    sublabel: string;
}

const STATS: Stat[] = [
    {
        value: '+500',
        numericEnd: 500,
        prefix: '+',
        suffix: '',
        label: 'Revendedores Activos',
        sublabel: 'En toda Argentina',
    },
    {
        value: '+12.000',
        numericEnd: 12000,
        prefix: '+',
        suffix: '',
        label: 'Pares Vendidos',
        sublabel: 'En los últimos 12 meses',
    },
    {
        value: '30-50%',
        numericEnd: 50,
        prefix: '',
        suffix: '%',
        label: 'Margen de Ganancia',
        sublabel: 'Por par vendido',
    },
    {
        value: '100%',
        numericEnd: 100,
        prefix: '',
        suffix: '%',
        label: 'Autenticación',
        sublabel: 'Todos los pares verificados',
    },
];

function CounterNumber({ stat, isInView }: { stat: Stat; isInView: boolean }) {
    const [display, setDisplay] = useState(0);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        if (!isInView) return;
        const duration = 1800;
        const start = performance.now();
        const end = stat.numericEnd;

        const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out expo
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setDisplay(Math.floor(eased * end));
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(tick);
            }
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [isInView, stat.numericEnd]);

    // Format with locale
    const formatted =
        stat.value === '30-50%'
            ? '30–50'
            : display >= 1000
            ? display.toLocaleString('es-AR')
            : display.toString();

    return (
        <span className="text-white">
            {stat.prefix}
            {formatted}
            {stat.suffix}
        </span>
    );
}

export function StatsSection() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section ref={ref} className="bg-[#050505] py-20 border-y border-white/[0.04] relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.04)_0%,_transparent_60%)]" />

            <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/[0.06]">
                    {STATS.map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.8, delay: idx * 0.15, ease: [0.19, 1, 0.22, 1] }}
                            className="px-6 lg:px-12 py-10 text-center first:pl-0 last:pr-0 group"
                        >
                            <div className="text-[2.8rem] md:text-[3.5rem] font-black tracking-tighter leading-none mb-3 text-gradient-gold overflow-hidden">
                                <CounterNumber stat={stat} isInView={isInView} />
                            </div>
                            <div className="text-[11px] font-black tracking-[0.25em] uppercase text-white mb-1">
                                {stat.label}
                            </div>
                            <div className="text-[10px] text-gray-600 uppercase tracking-widest">
                                {stat.sublabel}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
