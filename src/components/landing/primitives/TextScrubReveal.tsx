'use client';

import * as React from 'react';
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

export interface TextScrubRevealProps {
    text: string;
    className?: string;
    wordClassName?: string;
    highlightWordIndices?: number[];
    highlightTone?: 'cyan' | 'green' | 'violet';
}

const highlightColor = {
    cyan: 'text-[#00E5FF] drop-shadow-[0_0_20px_rgba(0,229,255,0.35)]',
    green: 'text-[#39FF14] drop-shadow-[0_0_20px_rgba(57,255,20,0.35)]',
    violet: 'text-[#A020F0] drop-shadow-[0_0_20px_rgba(160,32,240,0.35)]',
};

/**
 * TextScrubReveal
 * Kinetic typography component that illuminates text word-by-word driven by scroll progress.
 * Falls back to full opacity automatically when prefers-reduced-motion is active.
 */
export function TextScrubReveal({
    text,
    className,
    wordClassName,
    highlightWordIndices = [],
    highlightTone = 'cyan',
}: TextScrubRevealProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const words = text.split(/\s+/);

    useEffect(() => {
        if (!containerRef.current) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        gsap.registerPlugin(ScrollTrigger);

        const wordElements = containerRef.current.querySelectorAll('.scrub-word');

        const ctx = gsap.context(() => {
            gsap.fromTo(
                wordElements,
                { opacity: 0.18, y: 6 },
                {
                    opacity: 1,
                    y: 0,
                    stagger: 0.04,
                    ease: 'power1.out',
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: 'top 75%',
                        end: 'bottom 40%',
                        scrub: 0.8,
                    },
                }
            );
        }, containerRef);

        return () => ctx.revert();
    }, [text]);

    return (
        <div
            ref={containerRef}
            className={cn('flex flex-wrap leading-tight text-white select-none', className)}
        >
            {words.map((word, idx) => {
                const isHighlighted = highlightWordIndices.includes(idx);
                return (
                    <span
                        key={`${word}-${idx}`}
                        className={cn(
                            'scrub-word inline-block mr-[0.28em] mb-[0.1em] transition-colors',
                            isHighlighted ? highlightColor[highlightTone] : 'text-white',
                            wordClassName
                        )}
                    >
                        {word}
                    </span>
                );
            })}
        </div>
    );
}
