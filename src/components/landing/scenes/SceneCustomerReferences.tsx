'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, ShieldCheck, Maximize2, X, Star, CheckCircle2, MessageCircle } from 'lucide-react';

interface CustomerReference {
    id: string;
    image: string;
    badge: string;
    title: string;
    subtitle: string;
    testimonial?: string;
    location: string;
    date: string;
}

const REFERENCES_DATA: CustomerReference[] = [
    {
        id: 'refe-1',
        image: '/refes/refe-1.png',
        badge: '★ CLIENTE SATISFECHO',
        title: 'ENTREGA INMEDIATA',
        subtitle: 'Experiencia real y producto verificado',
        testimonial: 'La calidad del calzado es increíble, tal cual como en las fotos. El despacho llegó en tiempo récord.',
        location: 'Mar del Plata · Argentina',
        date: '2025 — 2026',
    },
    {
        id: 'refe-2',
        image: '/refes/refe-2.png',
        badge: '★ ENTREGA EN MANO',
        title: 'CONFIANZA TOTAL',
        subtitle: 'Atención personalizada 1 a 1',
        testimonial: 'Excelente atención de principio a fin. Te asesoran con los talles y el seguimiento es continuo.',
        location: 'Buenos Aires · Argentina',
        date: '2025 — 2026',
    },
    {
        id: 'refe-3',
        image: '/refes/refe-3.png',
        badge: '★ CALZADO PREMIUM',
        title: 'CALIDAD SUPREMA',
        subtitle: 'Detalles y terminaciones de lujo',
        testimonial: 'Impecable confección y comodidad. Es mi segunda compra en ÉTER y superó mis expectativas.',
        location: 'Córdoba · Argentina',
        date: '2025 — 2026',
    },
    {
        id: 'refe-4',
        image: '/refes/refe-4.png',
        badge: '★ 100% VERIFICADO',
        title: 'UNBOXING EN VIVO',
        subtitle: 'Lo que ves es lo que recibes',
        testimonial: 'Cero sorpresas, el producto llega con su empaque original de colección en perfectas condiciones.',
        location: 'Santa Fe · Argentina',
        date: '2025 — 2026',
    },
    {
        id: 'refe-5',
        image: '/refes/refe-5.png',
        badge: '★ CLIENTE RECURRENTE',
        title: 'COMUNIDAD ACTIVA',
        subtitle: 'Recomendación garantizada',
        testimonial: 'Compramos con amigos y revendedores. La confiabilidad en los envíos y stock es insuperable.',
        location: 'Mendoza · Argentina',
        date: '2025 — 2026',
    },
    {
        id: 'refe-6',
        image: '/refes/refe-6.png',
        badge: '★ ENVÍO SEGURO',
        title: 'DESPACHO PRIORITARIO',
        subtitle: 'Seguimiento oficial puerta a puerta',
        testimonial: 'Súper rápido y seguro. Me pasaron el número de guía al instante y el paquete llegó perfecto.',
        location: 'Rosario · Argentina',
        date: '2025 — 2026',
    },
];

// Triplicamos la lista para lograr un bucle infinito continuo y sin saltos
const EXTENDED_REFERENCES = [...REFERENCES_DATA, ...REFERENCES_DATA, ...REFERENCES_DATA];

export function SceneCustomerReferences() {
    const [selectedImage, setSelectedImage] = useState<CustomerReference | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-rotación continua suave (infinite smooth auto-scroll)
    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        let animationFrameId: number;
        const scrollSpeed = 0.75; // Pixeles por frame para suavidad total

        const step = () => {
            if (!isPaused && container) {
                container.scrollLeft += scrollSpeed;

                // Si recorrió un tercio completo, se reinicia al inicio de forma invisible
                const singleLoopWidth = container.scrollWidth / 3;
                if (container.scrollLeft >= singleLoopWidth) {
                    container.scrollLeft = 0;
                }
            }
            animationFrameId = requestAnimationFrame(step);
        };

        animationFrameId = requestAnimationFrame(step);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isPaused]);

    const manualScroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const amount = 320;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -amount : amount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <section
            id="referencias"
            className="relative w-full bg-[#050505] text-white py-14 sm:py-20 md:py-28 overflow-hidden select-none border-b border-white/10"
        >
            {/* ── RESPLANDOR AMBIENTAL SUPERIOR EN NARANJA FUEGO ── */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF6A00] to-transparent opacity-90" />
            <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[90vw] max-w-[900px] h-[280px] bg-gradient-to-b from-[#FF6A00]/25 via-[#FF4500]/8 to-transparent blur-[110px]" />
            <div className="pointer-events-none absolute -bottom-10 right-0 w-[350px] h-[200px] bg-[#FF7A00]/8 blur-[120px]" />

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
                
                {/* ── 1. HEADER EDITORIAL COMPACTO SIN ESPACIOS VACÍOS ── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 md:gap-8 pb-6 sm:pb-8 border-b border-white/10">
                    
                    {/* Izquierda: Pre-título + Título COMPLETO en una sola línea */}
                    <div className="space-y-1.5 sm:space-y-2.5">
                        <div className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.22em] text-[#FF7A00] flex items-center gap-1.5 sm:gap-2">
                            <span className="text-[#FF7A00]">—</span>
                            <span>CLIENTES REALES</span>
                            <span className="text-white/30">·</span>
                            <span>MOMENTOS & REFERENCIAS</span>
                        </div>

                        {/* PALABRA COMPLETA SIN CORTES NI ESPACIOS MUERTOS */}
                        <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.25rem] font-black uppercase tracking-tighter text-white leading-none">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#FFF0E6] to-[#FF8A00]">
                                REFEREN
                            </span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8A00] via-[#FF5500] to-[#E63900]">
                                CIAS.
                            </span>
                        </h2>
                    </div>

                    {/* Derecha: Descripción persuasiva y badge de contador */}
                    <div className="max-w-md space-y-3">
                        <p className="text-xs sm:text-sm text-white/75 font-sans leading-relaxed">
                            Entregas reales en mano, unboxings y fotos auténticas que demuestran la seriedad, calidad y confianza de <strong className="text-white font-bold">ÉTER</strong> en todo el país.
                        </p>

                        <div className="flex items-center gap-3">
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF7A00]/40 bg-[#FF7A00]/10 px-3.5 py-1 backdrop-blur-md">
                                <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-widest text-[#FF9E40]">
                                    {REFERENCES_DATA.length} FOTOS REALES
                                </span>
                                <span className="text-white/20">|</span>
                                <span className="text-[10px] sm:text-[11px] font-mono font-medium text-white/60">
                                    2025 — 2026
                                </span>
                            </div>

                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#39FF14]">
                                <CheckCircle2 size={12} />
                                100% Verificadas
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── 2. DIVISOR CENTRAL CON DOT CONCÉNTRICO PULSANTE ── */}
                <div className="relative my-6 sm:my-8 flex items-center justify-center">
                    <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                    
                    <div className="relative z-10 flex items-center gap-2 bg-[#050505] px-4 sm:px-6">
                        <div className="relative flex h-6 w-6 items-center justify-center">
                            <span className="absolute h-5 w-5 rounded-full border border-[#FF7A00]/40 animate-ping opacity-30" />
                            <span className="absolute h-3.5 w-3.5 rounded-full border border-[#FF7A00]/60" />
                            <span className="h-1.5 w-1.5 rounded-full bg-[#FF7A00] shadow-[0_0_8px_#FF7A00]" />
                        </div>
                        <span className="text-[9px] sm:text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#FF8A00] truncate">
                            CLIENTES SATISFECHOS · ENTREGAS EN MANO · UNBOXINGS REALES
                        </span>
                    </div>
                </div>

                {/* ── 3. BARRA DE CONTROL DE ROTACIÓN & BOTONES ── */}
                <div className="flex items-center justify-between pb-3 sm:pb-4">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] sm:text-[10px] font-mono font-bold uppercase text-[#FF8A00]">
                            <ShieldCheck size={12} />
                            COMPRA 100% SEGURA
                        </span>
                        <span className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-mono text-white/60">
                            <Star size={11} className="text-[#FF8A00] fill-[#FF8A00]" />
                            5.0 / 5.0 REPUTACIÓN
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsPaused(p => !p)}
                            className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-[#FF7A00]/40 transition"
                        >
                            {isPaused ? '▶ Reanudar Auto' : '⏸ Pausar'}
                        </button>
                        <button
                            type="button"
                            onClick={() => manualScroll('left')}
                            className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full border border-white/15 bg-[#121214] text-white/80 transition hover:border-[#FF7A00] hover:bg-[#FF7A00] hover:text-black active:scale-95 shadow"
                            aria-label="Anterior"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={() => manualScroll('right')}
                            className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full border border-white/15 bg-[#121214] text-white/80 transition hover:border-[#FF7A00] hover:bg-[#FF7A00] hover:text-black active:scale-95 shadow"
                            aria-label="Siguiente"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                {/* ── 4. CARRUSEL EN ROTACIÓN AUTOMÁTICA INFINITA ── */}
                <div
                    ref={scrollRef}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)}
                    onTouchEnd={() => setIsPaused(false)}
                    className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing"
                >
                    {EXTENDED_REFERENCES.map((item, idx) => (
                        <div
                            key={`${item.id}-${idx}`}
                            onClick={() => setSelectedImage(item)}
                            className="group relative flex-none w-[240px] sm:w-[290px] md:w-[340px] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-[#0d0d10] shadow-[0_12px_35px_rgba(0,0,0,0.85)] transition-all duration-400 hover:border-[#FF7A00]/70 hover:shadow-[0_16px_45px_rgba(255,106,0,0.22)] cursor-pointer"
                        >
                            {/* Card Image */}
                            <div className="relative aspect-[3/4] w-full overflow-hidden bg-black">
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    sizes="(max-width: 640px) 240px, (max-width: 768px) 290px, 340px"
                                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                />

                                {/* Dark Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d10] via-black/20 to-black/35 opacity-80 transition-opacity duration-300 group-hover:opacity-90" />

                                {/* Badge Top Left */}
                                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                                    <span className="inline-flex items-center gap-1 rounded-full border border-black/30 bg-[#FF6A00] px-2.5 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-black shadow-md">
                                        {item.badge}
                                    </span>
                                </div>

                                {/* Zoom Icon Top Right */}
                                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full border border-white/20 bg-black/60 text-white/80 backdrop-blur-md transition-all group-hover:scale-110 group-hover:bg-[#FF7A00] group-hover:text-black">
                                    <Maximize2 size={13} />
                                </div>

                                {/* Bottom Info in Card */}
                                <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4 md:p-5 space-y-1.5 sm:space-y-2 z-10 bg-gradient-to-t from-[#0d0d10] via-[#0d0d10]/95 to-transparent">
                                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-[#FF9E40]">
                                        <span className="font-bold uppercase tracking-wider truncate">{item.location}</span>
                                        <span className="text-white/40 shrink-0">{item.date}</span>
                                    </div>

                                    <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white leading-tight">
                                        {item.title}
                                    </h3>

                                    {item.testimonial && (
                                        <p className="text-[11px] sm:text-xs text-white/70 italic line-clamp-2 leading-relaxed font-sans">
                                            "{item.testimonial}"
                                        </p>
                                    )}

                                    <div className="pt-0.5 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-white/40">
                                        <span className="flex items-center gap-1 text-[#00E5FF]">
                                            <CheckCircle2 size={11} />
                                            Verificada
                                        </span>
                                        <span className="text-white/60 group-hover:text-[#FF7A00] font-bold uppercase transition">
                                            Tocar para ampliar ↗
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── 5. BANNER INFERIOR DE CONFIANZA & WHATSAPP DIRECTO (RESPONSIVE) ── */}
                <div className="mt-5 sm:mt-7 rounded-2xl border border-white/10 bg-gradient-to-r from-[#121215] via-[#1a1410] to-[#121215] p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-mono font-bold uppercase text-[#FF7A00]">
                            <Sparkles size={13} />
                            <span>COMPRA TRANSPARENTE & SEGURA</span>
                        </div>
                        <p className="text-xs sm:text-sm text-white/75 max-w-2xl">
                            ¿Tenés dudas sobre tu talle o modelo? Podés pedirnos fotos y videos en mano del calzado antes de despachar directo a tu WhatsApp.
                        </p>
                    </div>

                    <a
                        href="https://wa.me/5492236204002?text=Hola!%20Quiero%20ver%20referencias%20y%20consultar%20por%20un%20modelo%20en%20Éter"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-xs font-black uppercase tracking-wider text-black transition-all hover:bg-white hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(37,211,102,0.3)] shrink-0 w-full sm:w-auto"
                    >
                        <MessageCircle size={15} />
                        <span>Pedir Video en WhatsApp</span>
                        <ChevronRight size={14} strokeWidth={3} />
                    </a>
                </div>

            </div>

            {/* ── 6. LIGHTBOX MODAL RESPONSIVE FULLSCREEN ZOOM ── */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[99999] grid place-items-center bg-black/90 p-3 sm:p-6 backdrop-blur-xl"
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.92, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.92, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={e => e.stopPropagation()}
                            className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl sm:rounded-3xl border border-white/20 bg-[#0d0d10] p-4 sm:p-6 text-white shadow-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        >
                            <button
                                type="button"
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-full border border-white/20 bg-black/70 text-white transition hover:bg-white hover:text-black"
                                aria-label="Cerrar"
                            >
                                <X size={16} />
                            </button>

                            <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-center">
                                <div className="relative h-[48vh] sm:h-[60vh] w-full sm:w-[50%] overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 bg-black shrink-0">
                                    <Image
                                        src={selectedImage.image}
                                        alt={selectedImage.title}
                                        fill
                                        sizes="(max-width: 640px) 100vw, 400px"
                                        className="object-cover"
                                    />
                                </div>

                                <div className="space-y-3 sm:space-y-4 flex-1 text-left">
                                    <span className="inline-block rounded-full bg-[#FF6A00] px-3 py-1 text-[9px] sm:text-[10px] font-black uppercase text-black">
                                        {selectedImage.badge}
                                    </span>
                                    <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                                        {selectedImage.title}
                                    </h3>
                                    <p className="text-xs font-mono text-[#FF9E40]">
                                        {selectedImage.location} · {selectedImage.date}
                                    </p>
                                    {selectedImage.testimonial && (
                                        <p className="text-xs sm:text-sm text-white/80 italic leading-relaxed border-l-2 border-[#FF7A00] pl-3 py-1">
                                            "{selectedImage.testimonial}"
                                        </p>
                                    )}
                                    <div className="pt-2">
                                        <a
                                            href="https://wa.me/5492236204002?text=Hola!%20Vi%20esta%20referencia%20en%20la%20web%20y%20quiero%20consultar%20disponibilidad"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#FF6A00] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black transition hover:bg-white active:scale-95"
                                        >
                                            <MessageCircle size={14} />
                                            Consultar por WhatsApp
                                            <ChevronRight size={14} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}

export default SceneCustomerReferences;
