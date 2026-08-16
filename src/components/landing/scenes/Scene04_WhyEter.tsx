'use client';

import * as React from 'react';
import Link from 'next/link';
import { PackageCheck, ShieldCheck, Zap, MessageCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export interface Scene04_WhyEterProps {
    className?: string;
}

interface PillarData {
    number: string;
    tag: string;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ElementType;
    highlight: string;
}

const PILLARS: PillarData[] = [
    {
        number: '01',
        tag: 'STOCK FÍSICO REAL',
        title: 'EN MANO, LISTO PARA SALIR',
        subtitle: 'Sin esperas de meses ni preventas',
        description: 'No vendemos fotos de catálogo ni hacemos dropshipping eterno. Cada modelo publicado está en estantería en Mar del Plata, verificado y listo para salir.',
        icon: PackageCheck,
        highlight: 'Stock Verificado MDQ',
    },
    {
        number: '02',
        tag: 'CURADURÍA BRASIL',
        title: 'CONFORT & MATERIALES REFORZADOS',
        subtitle: 'Calidad probada para todos los días',
        description: 'Seleccionamos cada silueta en polos industriales de Brasil. Costuras firmes, suelas resistentes y plantillas pensadas para bancarse el uso diario real.',
        icon: Zap,
        highlight: 'Terminación Superior',
    },
    {
        number: '03',
        tag: 'LOGÍSTICA INMEDIATA',
        title: 'DESPACHOS EN 24 A 48HS',
        subtitle: 'De Mar del Plata a todo el país',
        description: 'Salidas diarias con Andreani y Correo Argentino. Embalaje blindado y código de seguimiento online para que veas el viaje de tu par en tiempo real.',
        icon: ShieldCheck,
        highlight: 'Seguimiento en Vivo',
    },
    {
        number: '04',
        tag: 'RESPALDO HUMANO',
        title: 'ATENCIÓN DIRECTA & CAMBIO DE TALLE',
        subtitle: 'Una persona real atrás de cada par',
        description: 'Si le errás al talle o tenés alguna duda, nos escribís a WhatsApp y te lo resolvemos al toque. Comprás con la tranquilidad de que respondemos siempre.',
        icon: MessageCircle,
        highlight: 'Garantía por Talle',
    },
];

/**
 * Scene04_WhyEter — "Por Qué Éter" (High-End Streetwear Tactical Grid)
 * Rediseño completo: grilla 2x2 de alta gama, números monumentales y beneficios concretos y reales.
 */
export function Scene04_WhyEter({ className }: Scene04_WhyEterProps) {
    return (
        <section
            id="por-que-eter"
            className={`relative w-full bg-[#050505] text-white py-20 sm:py-28 overflow-hidden select-none border-b border-white/10 ${className || ''}`}
        >
            {/* Subtle atmospheric glow */}
            <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 h-[450px] w-[650px] rounded-full bg-[#39FF14]/5 blur-[160px]" />

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 md:px-12">
                
                {/* ── 1. SECTION HEADER (Monumental & Directo) ── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16 border-b border-white/10 pb-8">
                    <div>
                        <div className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#39FF14] mb-3 flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-[#39FF14] animate-ping" />
                            <span>ACTO 04 // EL ESTÁNDAR ÉTER</span>
                            <span className="text-white/20">|</span>
                            <span className="text-white/50">4 PILARES REALES</span>
                        </div>
                        <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-[0.9]">
                            POR QUÉ <br />
                            <span className="text-white/35 not-italic font-extrabold">ELEGIR ÉTER.</span>
                        </h2>
                    </div>

                    <p className="text-xs sm:text-sm md:text-base text-white/70 font-normal max-w-md leading-relaxed">
                        No somos una tienda más de internet. Construimos un estándar de producto, stock físico y atención directa para que compres o revendas con total seguridad.
                    </p>
                </div>

                {/* ── 2. TACTICAL 2x2 GRID (Diseño Urbano de Alto Impacto) ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    {PILLARS.map((pillar) => {
                        const IconComponent = pillar.icon;
                        return (
                            <div
                                key={pillar.number}
                                className="group relative flex flex-col justify-between rounded-3xl bg-[#090909] border border-white/10 p-6 sm:p-8 transition-all duration-500 hover:border-[#39FF14]/50 hover:bg-[#0c0c0c] hover:shadow-[0_15px_40px_rgba(0,0,0,0.85),0_0_30px_rgba(57,255,20,0.08)]"
                            >
                                {/* Technical Corner Accents on Hover */}
                                <div className="absolute top-3 left-3 h-2 w-2 border-t border-l border-[#39FF14] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                <div className="absolute top-3 right-3 h-2 w-2 border-t border-r border-[#39FF14] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                <div className="absolute bottom-3 left-3 h-2 w-2 border-b border-l border-[#39FF14] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                <div className="absolute bottom-3 right-3 h-2 w-2 border-b border-r border-[#39FF14] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                {/* Top Row: Index & Micro Tag & Icon */}
                                <div className="flex items-start justify-between gap-4 mb-6">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl sm:text-4xl font-mono font-black text-white/25 group-hover:text-[#39FF14] transition-colors duration-300">
                                            {pillar.number}
                                        </span>
                                        <div className="h-4 w-[1px] bg-white/15" />
                                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#00E5FF]">
                                            {pillar.tag}
                                        </span>
                                    </div>

                                    {/* Icon Badge */}
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/70 transition-all duration-300 group-hover:bg-[#39FF14] group-hover:border-[#39FF14] group-hover:text-black group-hover:scale-110 shadow-md">
                                        <IconComponent size={20} />
                                    </div>
                                </div>

                                {/* Content: Title & Real Truth Statement */}
                                <div className="space-y-2 mb-6">
                                    <h3 className="text-lg sm:text-xl md:text-2xl font-black uppercase tracking-tight text-white group-hover:text-white transition-colors leading-tight">
                                        {pillar.title}
                                    </h3>
                                    <p className="text-[11px] font-mono uppercase tracking-wider text-white/40">
                                        {pillar.subtitle}
                                    </p>
                                    <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-normal pt-2">
                                        {pillar.description}
                                    </p>
                                </div>

                                {/* Bottom Feature Badge */}
                                <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#39FF14]">
                                        <CheckCircle2 size={13} />
                                        <span className="uppercase tracking-wider font-bold">{pillar.highlight}</span>
                                    </div>

                                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest group-hover:text-white/70 transition-colors">
                                        ESTÁNDAR 0{pillar.number.replace('0', '')}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── 3. BOTTOM TRUST CTA BAR ── */}
                <div className="mt-12 sm:mt-16 rounded-3xl bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent border border-white/10 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="space-y-1 text-center sm:text-left">
                        <div className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
                            ¿QUERÉS VER LOS MODELOS DISPONIBLES EN TU TALLE?
                        </div>
                        <p className="text-xs sm:text-sm text-white/60 font-normal">
                            Consultá directamente el stock físico del día por WhatsApp o explorá el catálogo online.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Link
                            href="/catalog"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#39FF14] px-6 py-3 text-xs font-mono font-black uppercase tracking-widest text-black shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all hover:bg-white hover:scale-105"
                        >
                            VER CATÁLOGO
                            <ArrowUpRight size={14} />
                        </Link>
                    </div>
                </div>

            </div>
        </section>
    );
}
