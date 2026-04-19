'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShieldCheck, Factory, QrCode } from 'lucide-react';

const STEPS = [
    {
        icon: Factory,
        title: 'VERIFICACIÓN DE ORIGEN',
        desc: 'Trabajamos exclusivamente con proveedores certificados en Brasil. Cada marca, cada modelo, trazado hasta su fuente.',
    },
    {
        icon: ShieldCheck,
        title: 'CONTROL DE CALIDAD',
        desc: 'Inspección física de materiales, costura, suela y acabados antes de que cada par sea aprobado para venta.',
    },
    {
        icon: QrCode,
        title: 'CERTIFICADO DIGITAL',
        desc: 'Cada par recibe un QR único con historial completo: origen, inspección, fecha y número de certificado ÉTER.',
    },
];

export function EterCertifiedSection() {
    return (
        <section className="py-32 bg-black relative overflow-hidden border-t border-white/[0.04]">
            {/* Background glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.06)_0%,_transparent_65%)]" />

            {/* Large watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                <span className="text-[20vw] font-black text-white/[0.015] whitespace-nowrap tracking-tighter">
                    CERTIFIED
                </span>
            </div>

            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
                {/* Badge central */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center mb-20"
                >
                    {/* Outer ring */}
                    <div className="relative mb-10">
                        <div className="w-36 h-36 rounded-full border-2 border-[#00E5FF]/60 flex items-center justify-center">
                            <div className="w-28 h-28 rounded-full border border-[#00E5FF]/30 flex items-center justify-center bg-[#00E5FF]/5 backdrop-blur-sm">
                                <div className="text-center">
                                    <ShieldCheck className="w-8 h-8 text-[#00E5FF] mx-auto mb-1" />
                                    <span className="text-[7px] font-black tracking-[0.3em] text-[#00E5FF] uppercase block">
                                        ÉTER
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* Rotating ring */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-0 rounded-full border border-dashed border-[#00E5FF]/20"
                        />
                    </div>

                    <span className="text-[11px] font-black tracking-[0.6em] text-[#00E5FF] uppercase mb-4">
                        Garantía de Autenticidad
                    </span>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase text-center leading-none">
                        ÉTER<br />
                        <span className="text-stroke-gold">CERTIFIED</span>
                    </h2>
                    <style jsx>{`
                        .text-stroke-gold {
                            -webkit-text-stroke: 2px #00E5FF;
                            color: transparent;
                        }
                    `}</style>
                    <p className="text-gray-400 mt-6 text-center max-w-lg text-base leading-relaxed">
                        Cada par que vendés a través de ÉTER pasó por un proceso de verificación de 3 etapas.
                        Tu reputación está protegida.
                    </p>
                </motion.div>

                {/* 3 steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-white/[0.06]">
                    {STEPS.map((step, idx) => (
                        <motion.div
                            key={step.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: idx * 0.15, ease: [0.19, 1, 0.22, 1] }}
                            viewport={{ once: true }}
                            className={`p-10 relative group ${
                                idx < 2 ? 'md:border-r border-white/[0.06]' : ''
                            } hover:bg-[#00E5FF]/[0.02] transition-colors duration-500`}
                        >
                            {/* Step number */}
                            <div className="absolute top-8 right-8 text-[3rem] font-black text-white/[0.03] leading-none">
                                0{idx + 1}
                            </div>

                            <div className="w-12 h-12 border border-[#00E5FF]/40 rounded-full flex items-center justify-center mb-8 group-hover:border-[#00E5FF] group-hover:bg-[#00E5FF]/10 transition-all duration-500">
                                <step.icon className="w-5 h-5 text-[#00E5FF]" />
                            </div>

                            <h3 className="text-sm font-black tracking-[0.2em] text-white uppercase mb-4">
                                {step.title}
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                {step.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="mt-12 text-center"
                >
                    <Link
                        href="/authenticity"
                        className="inline-flex items-center gap-3 text-[11px] font-black tracking-[0.3em] uppercase text-[#00E5FF] hover:text-white transition-colors group"
                    >
                        Conocé más sobre nuestra garantía
                        <span className="w-8 h-px bg-[#00E5FF] group-hover:w-16 transition-all duration-500 inline-block" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
