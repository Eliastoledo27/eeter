'use client';

import * as React from 'react';
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SceneContainer } from '@/components/landing/primitives/SceneContainer';
import { TextScrubReveal } from '@/components/landing/primitives/TextScrubReveal';
import { LANDING_CONTENT } from '@/config/landing-content';

export interface Scene02_ManifestoProps {
    className?: string;
}

/**
 * Scene02_Manifesto (Art Direction V2 — Typographic Authority)
 * Declaración de marca puramente tipográfica.
 * Gran espacio negativo, letras monumentales a sangre y cero decoraciones superficiales.
 */
export function Scene02_Manifesto({ className }: Scene02_ManifestoProps) {
    const { manifesto } = LANDING_CONTENT;
    const sceneRef = useRef<HTMLElement | null>(null);
    const conclusionRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!sceneRef.current || !conclusionRef.current) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
            gsap.fromTo(
                conclusionRef.current,
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: conclusionRef.current,
                        start: 'top 85%',
                        end: 'bottom 65%',
                        scrub: 0.6,
                    },
                }
            );
        }, sceneRef);

        return () => ctx.revert();
    }, []);

    return (
        <SceneContainer
            ref={sceneRef}
            id="manifiesto"
            className={className}
            fullHeight={true}
            withTexture={true}
        >
            <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center py-12 sm:py-20 md:py-28">
                
                {/* Minimal Chapter Indicator */}
                <div className="mb-8 sm:mb-12 text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">
                    // 02 — MANIFIESTO ÉTER
                </div>

                {/* Monumental Kinetic Lines */}
                <div className="space-y-6 sm:space-y-10 max-w-4xl">
                    {manifesto.lines.map((line, index) => (
                        <TextScrubReveal
                            key={`manifesto-line-${index}`}
                            text={line}
                            highlightWordIndices={[]}
                            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight justify-center text-center leading-[1.08] text-white"
                            wordClassName="transition-opacity duration-300"
                        />
                    ))}
                </div>

                {/* Monolithic Brand Closing */}
                <div
                    ref={conclusionRef}
                    className="mt-12 sm:mt-16 text-xs sm:text-sm font-mono font-bold uppercase tracking-[0.35em] text-white/50 border-t border-white/10 pt-8"
                >
                    {manifesto.conclusion}
                </div>
            </div>
        </SceneContainer>
    );
}
