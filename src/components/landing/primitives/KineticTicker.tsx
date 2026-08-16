'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface KineticTickerProps {
    items: string[];
    separator?: string;
    speedSeconds?: number;
    reverse?: boolean;
    tone?: 'cyan' | 'green' | 'violet' | 'monochrome';
    className?: string;
}

const toneStyles = {
    cyan: 'border-y border-[#00E5FF]/20 bg-black/60 text-white selection:bg-[#00E5FF] selection:text-black',
    green: 'border-y border-[#39FF14]/20 bg-black/60 text-white selection:bg-[#39FF14] selection:text-black',
    violet: 'border-y border-[#A020F0]/20 bg-black/60 text-white selection:bg-[#A020F0] selection:text-white',
    monochrome: 'border-y border-white/10 bg-black/40 text-white/85',
};

const separatorColor = {
    cyan: 'text-[#00E5FF]',
    green: 'text-[#39FF14]',
    violet: 'text-[#A020F0]',
    monochrome: 'text-white/40',
};

/**
 * KineticTicker
 * Dual-rail continuous marquee accelerated by hardware (translate3d).
 * Acts as a graphic signature dividing scenes without JavaScript overhead.
 */
export function KineticTicker({
    items,
    separator = '✦',
    speedSeconds = 25,
    reverse = false,
    tone = 'cyan',
    className,
}: KineticTickerProps) {
    // Duplicate the item array multiple times to ensure seamless infinite looping on ultra-wide screens
    const renderedItems = [...items, ...items, ...items, ...items];

    return (
        <div
            className={cn(
                'relative w-full overflow-hidden py-3.5 sm:py-4 select-none backdrop-blur-md z-20',
                toneStyles[tone],
                className
            )}
            aria-hidden="true"
        >
            <div
                className={cn(
                    'flex w-max items-center whitespace-nowrap will-change-transform',
                    reverse ? 'animate-marquee-reverse' : 'animate-marquee'
                )}
                style={{
                    animationDuration: `${speedSeconds}s`,
                    animationTimingFunction: 'linear',
                    animationIterationCount: 'infinite',
                }}
            >
                {renderedItems.map((text, idx) => (
                    <div key={`${text}-${idx}`} className="flex items-center gap-6 px-4 sm:gap-8 sm:px-6">
                        <span className="text-xs sm:text-sm font-black uppercase tracking-[0.28em] text-white">
                            {text}
                        </span>
                        <span className={cn('text-xs sm:text-sm font-bold', separatorColor[tone])}>
                            {separator}
                        </span>
                    </div>
                ))}
            </div>

            <style jsx>{`
                @keyframes marquee {
                    0% {
                        transform: translate3d(0, 0, 0);
                    }
                    100% {
                        transform: translate3d(-50%, 0, 0);
                    }
                }
                @keyframes marquee-reverse {
                    0% {
                        transform: translate3d(-50%, 0, 0);
                    }
                    100% {
                        transform: translate3d(0, 0, 0);
                    }
                }
                .animate-marquee {
                    animation-name: marquee;
                }
                .animate-marquee-reverse {
                    animation-name: marquee-reverse;
                }
                @media (prefers-reduced-motion: reduce) {
                    .animate-marquee,
                    .animate-marquee-reverse {
                        animation: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
