'use client';

import * as React from 'react';
import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, CheckCircle2, HeartHandshake } from 'lucide-react';

interface ReferenceItem {
    id: string;
    number: string;
    title: string;
    subtitle: string;
    description: string;
    metric: string;
    metricLabel: string;
    image: string;
    badgeText: string;
    author: string;
    location: string;
}

const COMMUNITY_REFERENCES: ReferenceItem[] = [
    {
        id: 'comunidad-01',
        number: '01',
        title: 'CADA VEZ SOMOS MÁS',
        subtitle: 'Clientes y revendedores reales',
        description: 'Una comunidad activa en todo el país de personas que usan, eligen y recomiendan ÉTER todos los días. Sin filtros ni personajes armados.',
        metric: 'Comunidad Federal',
        metricLabel: 'Presencia en todo el país',
        image: '/images/comunidad-01.png',
        badgeText: '01 CADA VEZ SOMOS MÁS',
        author: 'Comunidad ÉTER',
        location: 'Clientes & Revendedores Reales',
    },
    {
        id: 'comunidad-02',
        number: '02',
        title: 'DE ACÁ A TU PUERTA',
        subtitle: 'Despachos diarios y seguimiento real',
        description: 'Los pedidos salen con Andreani y Correo Argentino directo desde Mar del Plata. Te pasamos el código de seguimiento para que veas el viaje de tu par en todo momento.',
        metric: 'Salidas Diarias',
        metricLabel: 'Mar del Plata a todo el país',
        image: '/images/comunidad-02.png',
        badgeText: '02 DE ACÁ A TU PUERTA',
        author: 'Despachos Oficiales',
        location: 'Andreani & Correo Argentino',
    },
    {
        id: 'comunidad-03',
        number: '03',
        title: 'MIRÁ LO QUE TE LLEVÁS',
        subtitle: 'Fotos y unboxings de clientes reales',
        description: 'Sin fotos de catálogo truchas ni retoques engañosos. Lo que ves en los videos y unboxings de la gente en mano es exactamente lo que te llega a tu casa.',
        metric: '100% Real',
        metricLabel: 'Fotos y unboxings en mano',
        image: '/images/comunidad-03.png',
        badgeText: '03 MIRÁ LO QUE TE LLEVÁS',
        author: 'Unboxings de Clientes',
        location: 'Experiencias en Primera Persona',
    },
    {
        id: 'comunidad-04',
        number: '04',
        title: 'OTROS YA ARRANCARON',
        subtitle: 'Historias reales de quienes venden Éter',
        description: 'Personas comunes de distintas provincias que sumaron un ingreso extra o armaron su propio showroom vendiendo calzado con stock garantizado y atención directa.',
        metric: 'Historias Reales',
        metricLabel: 'Emprendedores y Showrooms',
        image: '/images/comunidad-04.png',
        badgeText: '04 OTROS YA ARRANCARON',
        author: 'Revendedores ÉTER',
        location: 'Showrooms y Tiendas Locales',
    },
    {
        id: 'comunidad-05',
        number: '05',
        title: 'COMPRÁ TRANQUILO',
        subtitle: 'Atención humana y cambio de talle',
        description: 'Si le errás al talle o tenés alguna duda, nos escribís a WhatsApp y te lo resolvemos. Hay un equipo real atrás de cada par despachado para darte una mano.',
        metric: 'Respaldo Humano',
        metricLabel: 'Cambio de talle asegurado',
        image: '/images/comunidad-05.png',
        badgeText: '05 COMPRÁ TRANQUILO',
        author: 'Soporte Directo ÉTER',
        location: 'WhatsApp Oficial +54 9 223 620-4002',
    },
];

export function SceneCommunityReferences() {
    const [activeIndex, setActiveIndex] = useState(0);

    const prevItem = () => {
        setActiveIndex((prev) => (prev === 0 ? COMMUNITY_REFERENCES.length - 1 : prev - 1));
    };

    const nextItem = () => {
        setActiveIndex((prev) => (prev === COMMUNITY_REFERENCES.length - 1 ? 0 : prev + 1));
    };

    const currentItem = COMMUNITY_REFERENCES[activeIndex];

    return (
        <section
            id="comunidad-referencias"
            className="relative w-full bg-[#050505] text-white py-16 sm:py-24 md:py-28 overflow-hidden select-none border-b border-white/10"
        >
            {/* Subtle atmospheric ambient light */}
            <div className="pointer-events-none absolute top-1/2 right-0 h-96 w-96 rounded-full bg-[#0055FF]/10 blur-[130px]" />

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 md:px-12">
                
                {/* ── 1. SECTION HEADER (Conciso, Urbano & Profesional) ── */}
                <div className="mb-8 sm:mb-12 border-b border-white/10 pb-6 sm:pb-8">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#39FF14] mb-2.5 flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-[#39FF14] animate-ping" />
                        <span>ACTO 03 // REFERENCIAS</span>
                        <span className="text-white/20">|</span>
                        <span className="text-white/50">EN LA CALLE</span>
                    </div>
                    <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-[0.9]">
                        EN LA CALLE<span className="text-[#39FF14]">.</span>
                    </h2>
                    <p className="mt-2.5 text-xs sm:text-sm text-white/70 font-medium max-w-md leading-relaxed">
                        Experiencias y unboxings de clientes y revendedores reales. Sin chamuyo.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
                    
                    {/* LEFT COLUMN: INTERACTIVE ACCORDION WITH EMBEDDED MOBILE IMAGE (5 cols) */}
                    <div className="lg:col-span-5 flex flex-col justify-between">
                        
                        <div className="flex flex-col gap-2.5">
                            {COMMUNITY_REFERENCES.map((item, index) => {
                                const isActive = activeIndex === index;
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => setActiveIndex(index)}
                                        className={`group cursor-pointer transition-all duration-300 rounded-2xl ${
                                            isActive
                                                ? 'bg-gradient-to-r from-white/[0.06] to-transparent border-l-2 border-[#39FF14] p-4 sm:p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] bg-[#0c0c0c]'
                                                : 'p-3.5 sm:p-4 border-l-2 border-transparent hover:border-white/20 hover:bg-white/[0.02]'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3.5">
                                                <span className={`text-xs font-mono font-bold transition-colors ${isActive ? 'text-[#39FF14]' : 'text-white/40 group-hover:text-white/70'}`}>
                                                    {item.number}
                                                </span>
                                                <div>
                                                    <h3 className={`text-sm sm:text-base font-black uppercase tracking-tight transition-colors ${isActive ? 'text-white' : 'text-white/50 group-hover:text-white'}`}>
                                                        {item.title}
                                                    </h3>
                                                    {isActive && (
                                                        <span className="text-[10px] font-mono text-[#00E5FF] uppercase tracking-wider block mt-0.5">
                                                            {item.subtitle}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action indicator */}
                                            <div className="flex items-center gap-1 text-white/40 group-hover:text-[#39FF14] transition-colors">
                                                {isActive ? (
                                                    <div className="flex items-center gap-1 text-[#39FF14]">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-[#39FF14]" />
                                                        <span className="h-1.5 w-1.5 rounded-full bg-[#39FF14]/50" />
                                                        <ArrowRight size={14} className="ml-1" />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 opacity-40">
                                                        <span className="h-1 w-1 rounded-full bg-white" />
                                                        <span className="h-1 w-1 rounded-full bg-white" />
                                                        <span className="h-1 w-1 rounded-full bg-white" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Expanded Description & Real Metric */}
                                        {isActive && (
                                            <div className="mt-3 space-y-3 animate-fadeIn">
                                                <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
                                                    {item.description}
                                                </p>

                                                {/* ── MOBILE EMBEDDED PHOTO (Visible on Mobile & Tablets) ── */}
                                                <div className="block lg:hidden relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-[#0a0a0a] border border-white/10 my-3 shadow-lg">
                                                    <Image
                                                        src={item.image}
                                                        alt={item.title}
                                                        fill
                                                        unoptimized
                                                        priority
                                                        sizes="(max-width: 1024px) 100vw, 400px"
                                                        className="object-cover object-center filter brightness-95 contrast-105"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                                                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[9px] font-mono text-white">
                                                        <span className="px-2 py-1 rounded bg-black/70 border border-white/10 font-bold uppercase tracking-wider text-[#39FF14]">
                                                            {item.badgeText}
                                                        </span>
                                                        <span className="text-white/60">
                                                            {item.location}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-4 pt-2 border-t border-white/10">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm sm:text-base font-black font-mono text-[#39FF14]">
                                                            {item.metric}
                                                        </span>
                                                        <span className="text-[10px] font-mono uppercase text-white/50 tracking-wider">
                                                            · {item.metricLabel}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Bottom Trust Stamp */}
                        <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.25em] text-white/50">
                            <div className="flex items-center gap-1.5 text-[#39FF14]">
                                <ShieldCheck size={14} />
                                <span>RESPALDO & ATENCIÓN DIRECTA</span>
                            </div>
                            <div className="flex items-center gap-1 text-white/40">
                                <HeartHandshake size={13} />
                                <span>COMPROMISO ÉTER</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: LARGE DYNAMIC DESKTOP SHOWCASE (7 cols, hidden on mobile for clean hierarchy) */}
                    <div className="hidden lg:block lg:col-span-7 relative sticky top-28">
                        
                        {/* Main Image Container */}
                        <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full rounded-3xl overflow-hidden bg-[#0a0a0a] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)]">
                            
                            {/* Dynamic Showcase Image */}
                            <Image
                                key={currentItem.id}
                                src={currentItem.image}
                                alt={currentItem.title}
                                fill
                                unoptimized
                                priority
                                sizes="60vw"
                                className="object-cover object-center filter brightness-95 contrast-105 transition-all duration-700 ease-out"
                            />

                            {/* Inner Dark Vignette & Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none" />

                            {/* Top Badge: Source Tag */}
                            <div className="absolute top-4 left-4 rounded-2xl bg-black/80 backdrop-blur-md border border-white/15 px-4 py-2 flex items-center gap-2">
                                <CheckCircle2 size={14} className="text-[#39FF14]" />
                                <div>
                                    <div className="text-xs font-black font-mono text-white leading-tight">
                                        {currentItem.author}
                                    </div>
                                    <div className="text-[9px] font-mono text-white/50 uppercase tracking-widest">
                                        {currentItem.location}
                                    </div>
                                </div>
                            </div>

                            {/* Top Corner Watermark Number */}
                            <div className="absolute top-4 right-6 text-5xl sm:text-7xl font-black font-mono text-white/10 select-none pointer-events-none">
                                {currentItem.number}
                            </div>

                            {/* Bottom Bar: Badge and Navigation Buttons */}
                            <div className="absolute inset-x-4 bottom-4 flex items-center justify-between">
                                
                                {/* Bottom Pill Badge */}
                                <div className="rounded-full bg-black/80 backdrop-blur-md border border-white/15 px-4 py-2 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-white shadow-lg flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-[#39FF14] animate-pulse" />
                                    <span>{currentItem.badgeText}</span>
                                </div>

                                {/* Navigation Arrows (< and >) */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={prevItem}
                                        aria-label="Anterior referencia"
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white transition-all hover:bg-[#39FF14] hover:border-[#39FF14] hover:text-black hover:scale-110 active:scale-95 shadow-lg"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button
                                        onClick={nextItem}
                                        aria-label="Siguiente referencia"
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white transition-all hover:bg-[#39FF14] hover:border-[#39FF14] hover:text-black hover:scale-110 active:scale-95 shadow-lg"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </section>
    );
}
