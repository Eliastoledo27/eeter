'use client';

import * as React from 'react';
import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface EcosystemItem {
    id: string;
    number: string;
    title: string;
    description: string;
    image: string;
    badgeText: string;
}

const ECOSYSTEM_ITEMS: EcosystemItem[] = [
    {
        id: 'revendedores',
        number: '01',
        title: 'PROGRAMA DE REVENDEDORES',
        description: 'Accedé a precios mayoristas con catálogo sincronizado en tiempo real. Vendé calzado urbano sin comprar stock anticipado: nosotros nos encargamos del empaque y del despacho por vos.',
        image: '/images/lo-que-hacemos-01.png',
        badgeText: '01 PROGRAMA DE REVENDEDORES',
    },
    {
        id: 'academia',
        number: '02',
        title: 'ACADEMIA ÉTER',
        description: 'Entrenamiento paso a paso en venta digital, creación de contenido, pauta en redes y técnicas de cierre por WhatsApp para que construyas una marca sólida y rentable.',
        image: '/images/lo-que-hacemos-02.png',
        badgeText: '02 ACADEMIA ÉTER',
    },
    {
        id: 'logistica',
        number: '03',
        title: 'LOGÍSTICA & DROPSHIPPING',
        description: 'Centro logístico propio en Mar del Plata. Despachos rápidos en 24 a 48 horas a cualquier punto de Argentina con número de seguimiento y garantía física de entrega.',
        image: '/images/lo-que-hacemos-03.png',
        badgeText: '03 LOGÍSTICA & DROPSHIPPING',
    },
    {
        id: 'curaduria',
        number: '04',
        title: 'CURADURÍA BRASIL',
        description: 'Importación directa y control de calidad riguroso en cada par. Siluetas urbanas seleccionadas por su comodidad, durabilidad de materiales y alta rotación comercial.',
        image: '/images/lo-que-hacemos-04.png',
        badgeText: '04 CURADURÍA BRASIL',
    },
    {
        id: 'soporte',
        number: '05',
        title: 'COMUNIDAD & SOPORTE 1 A 1',
        description: 'Canal de atención directa y comunidad activa de emprendedores. Respondemos tus consultas operativas y te acompañamos en cada etapa de tus ventas diarias.',
        image: '/images/lo-que-hacemos-05.png',
        badgeText: '05 COMUNIDAD & SOPORTE',
    },
];

export function SceneEcosystem() {
    const [activeIndex, setActiveIndex] = useState(0);

    const prevItem = () => {
        setActiveIndex((prev) => (prev === 0 ? ECOSYSTEM_ITEMS.length - 1 : prev - 1));
    };

    const nextItem = () => {
        setActiveIndex((prev) => (prev === ECOSYSTEM_ITEMS.length - 1 ? 0 : prev + 1));
    };

    const currentItem = ECOSYSTEM_ITEMS[activeIndex];

    return (
        <section
            id="ecosistema"
            className="relative w-full bg-[#050505] text-white py-16 sm:py-24 md:py-28 overflow-hidden select-none border-b border-white/10"
        >
            {/* Ambient subtle glow */}
            <div className="pointer-events-none absolute top-1/3 left-0 h-96 w-96 rounded-full bg-[#0055FF]/10 blur-[120px]" />

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 md:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
                    
                    {/* LEFT COLUMN: INTERACTIVE ACCORDION & HEADLINE (5 cols) */}
                    <div className="lg:col-span-5 flex flex-col justify-between">
                        
                        {/* Section Tag & Title */}
                        <div className="mb-8">
                            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#39FF14] mb-3 flex items-center gap-2">
                                <span className="h-1 w-1 rounded-full bg-[#39FF14] animate-ping" />
                                <span>ACTO 02 // ECOSISTEMA & ACADEMIA</span>
                                <span className="text-white/20">|</span>
                                <span className="text-white/50">MARGEN 100% LIBRE</span>
                            </div>
                            <h2 className="text-4xl sm:text-6xl font-black uppercase italic tracking-tighter text-white leading-[0.9]">
                                LO QUE <br />
                                <span className="text-white/30 not-italic font-extrabold">HACEMOS.</span>
                            </h2>
                        </div>

                        {/* Interactive Item List */}
                        <div className="flex flex-col gap-2.5">
                            {ECOSYSTEM_ITEMS.map((item, index) => {
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
                                            <div className="flex items-center gap-4">
                                                <span className={`text-xs font-mono font-bold transition-colors ${isActive ? 'text-[#39FF14]' : 'text-white/40 group-hover:text-white/70'}`}>
                                                    {item.number}
                                                </span>
                                                <h3 className={`text-sm sm:text-base font-black uppercase tracking-tight transition-colors ${isActive ? 'text-white' : 'text-white/50 group-hover:text-white'}`}>
                                                    {item.title}
                                                </h3>
                                            </div>

                                            {/* Action / dots icon */}
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

                                        {/* Expanded Description & Mobile Photo */}
                                        {isActive && (
                                            <div className="mt-3 space-y-3 animate-fadeIn">
                                                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                                                    {item.description}
                                                </p>

                                                {/* Mobile embedded image */}
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
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Bottom Tag */}
                        <div className="mt-8 pt-4 border-t border-white/10 text-[9px] font-mono uppercase tracking-[0.25em] text-white/40">
                            ÉTER STORE · MAR DEL PLATA / BUENOS AIRES
                        </div>
                    </div>

                    {/* RIGHT COLUMN: LARGE VISUAL SHOWCASE ON DESKTOP (7 cols) */}
                    <div className="hidden lg:block lg:col-span-7 relative sticky top-28">
                        
                        {/* Main Image Container */}
                        <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full rounded-3xl overflow-hidden bg-[#0a0a0a] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)]">
                            
                            {/* Dynamic Background Image with Smooth Fade */}
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

                            {/* Inner Vignette / Ambient Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none" />

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
                                        aria-label="Anterior elemento"
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white transition-all hover:bg-[#39FF14] hover:border-[#39FF14] hover:text-black hover:scale-110 active:scale-95 shadow-lg"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button
                                        onClick={nextItem}
                                        aria-label="Siguiente elemento"
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
