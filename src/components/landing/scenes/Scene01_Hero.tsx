'use client';

import * as React from 'react';
import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import { EterButton } from '@/components/landing/primitives/EterButton';

export interface Scene01_HeroProps {
    className?: string;
    onExploreClick?: () => void;
}

/**
 * Scene01_Hero (High-End Streetwear Cover Architecture - Refined & Subtle)
 * Hero con fondo oficial banner hero (2).png montado en alta definición.
 */
export function Scene01_Hero({ className, onExploreClick }: Scene01_HeroProps) {
    const heroRef = useRef<HTMLElement | null>(null);
    const bgImageRef = useRef<HTMLDivElement | null>(null);
    const headlineRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!heroRef.current || !bgImageRef.current) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
            gsap.to(bgImageRef.current, {
                y: 60,
                scale: 1.03,
                ease: 'none',
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true,
                },
            });

            if (headlineRef.current) {
                gsap.to(headlineRef.current, {
                    y: -25,
                    opacity: 0.9,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: heroRef.current,
                        start: 'top top',
                        end: 'bottom 20%',
                        scrub: true,
                    },
                });
            }
        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={heroRef}
            id="hero"
            className={`relative w-full min-h-[100dvh] flex flex-col justify-between overflow-hidden bg-[#050505] text-white select-none pt-28 sm:pt-32 ${className || ''}`}
        >
            {/* 1. OFFICIAL HERO BANNER (banner hero (2).png) */}
            <div
                ref={bgImageRef}
                className="absolute inset-0 z-0 h-full w-full will-change-transform"
            >
                <Image
                    src="/images/banner-hero-official.png"
                    alt="ÉTER Calzado Urbano Oficial"
                    fill
                    priority
                    unoptimized
                    sizes="100vw"
                    className="object-cover object-center filter brightness-[0.8] contrast-[1.1]"
                />

                {/* Subtle Atmospheric Overlays for legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/30 to-[#050505]/70" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/60 via-transparent to-[#050505]/60" />
            </div>

            {/* 2. REFINED & SUBTLE CENTRAL COMPOSITION */}
            <div
                ref={headlineRef}
                className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-8 my-auto py-4 sm:py-8 flex flex-col items-center justify-center text-center will-change-transform"
            >
                <div className="relative inline-flex flex-col items-center select-none">
                    
                    {/* Top Refined Line: CALIDAD Y CONFORT */}
                    <div className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase italic tracking-tight text-white leading-[0.95] drop-shadow-[0_8px_25px_rgba(0,0,0,0.9)]">
                        CALIDAD Y CONFORT
                    </div>

                    {/* Overlapping Urban Script: & Todo en un Solo Lugar */}
                    <div className="relative -my-1 sm:-my-3 md:-my-4 z-20 transform -rotate-3 sm:-rotate-2">
                        <span
                            className="font-['Rock_Salt',_'Caveat',_'Permanent_Marker',_cursive] text-lg sm:text-2xl md:text-3xl lg:text-4xl text-[#00E5FF] tracking-wide drop-shadow-[0_0_15px_rgba(0,229,255,0.7)]"
                            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 0 20px rgba(0,229,255,0.5)' }}
                        >
                            & Todo en un Solo Lugar
                        </span>
                    </div>

                    {/* Bottom Refined Line: TODO EN UN SOLO LUGAR. */}
                    <div className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase italic tracking-tight text-white leading-[0.95] drop-shadow-[0_8px_25px_rgba(0,0,0,0.9)]">
                        TODO EN UN SOLO LUGAR<span className="text-[#39FF14]">.</span>
                    </div>

                </div>

                {/* Subtitle Statement - Exact Copy Request */}
                <p className="mt-5 sm:mt-6 max-w-xl text-xs sm:text-sm md:text-base font-normal text-white/85 leading-relaxed drop-shadow-md">
                    Zapas urbanas para todos los días. Las ves, las probás y, si te van, te las llevás. Sin vueltas.
                </p>

                {/* Primary & Secondary Dual CTAs */}
                <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
                    <EterButton
                        href="/catalog"
                        variant="solid-cyan"
                        size="md"
                        icon={ArrowUpRight}
                        iconPosition="right"
                        fullWidth={true}
                        className="sm:w-auto font-bold tracking-wider px-7 bg-[#39FF14] hover:bg-white text-black shadow-[0_0_25px_rgba(57,255,20,0.3)] transition-all"
                        onClick={onExploreClick}
                    >
                        VER CATÁLOGO
                    </EterButton>

                    <EterButton
                        href="/community"
                        variant="outline-glass"
                        size="md"
                        fullWidth={true}
                        className="sm:w-auto font-bold tracking-wider px-7 border-white/20 hover:border-white text-white/90 backdrop-blur-md"
                    >
                        QUIERO REVENDER
                    </EterButton>
                </div>
            </div>

            {/* 3. BOTTOM MARGIN LABELS (Corner Proofs) */}
            <footer className="relative z-20 w-full px-4 sm:px-8 md:px-12 pb-6 sm:pb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-4">
                <div className="flex items-center gap-3 text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.25em] text-white/60 text-center sm:text-left">
                    <span>CADA PAR, UN ESTÁNDAR ÚNICO.</span>
                    <span className="hidden md:inline text-white/20">|</span>
                    <span className="hidden md:inline">BUENOS AIRES · ARGENTINA · STOCK FÍSICO</span>
                </div>

                <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#39FF14]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#39FF14] animate-pulse" />
                    <span>DESPACHOS EN 24/48HS</span>
                </div>
            </footer>
        </section>
    );
}
