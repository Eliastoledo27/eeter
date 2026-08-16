'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CrossedKineticRibbonsProps {
    primaryText?: string;
    secondaryText?: string;
    className?: string;
}

/**
 * CrossedKineticRibbons
 * Cintas cinéticas cruzadas en diagonal en el verde neón emblemático de ÉTER (#39FF14).
 * Dos rieles independientes que corren en direcciones opuestas con rotación y sombras tridimensionales.
 */
export function CrossedKineticRibbons({
    primaryText = 'ÉTER STORE',
    secondaryText = 'CALZADO URBANO BRASIL',
    className,
}: CrossedKineticRibbonsProps) {
    const items1 = Array(14).fill(primaryText);
    const items2 = Array(14).fill(secondaryText);

    return (
        <div
            className={cn(
                'relative w-full overflow-hidden select-none pointer-events-none z-30',
                'py-10 sm:py-16 -my-6 sm:-my-10',
                className
            )}
            aria-hidden="true"
        >
            {/* CINTA 1 (INFERIOR - ROTACIÓN NEGATIVA - DIRECCIÓN DERECHA) */}
            <div className="absolute inset-x-[-10%] top-[42%] -translate-y-1/2 -rotate-[2.5deg] sm:-rotate-[2deg] transform origin-center shadow-[0_20px_50px_rgba(0,0,0,0.95)] z-10">
                <div className="flex w-max items-center whitespace-nowrap bg-gradient-to-r from-[#2ee610] via-[#39FF14] to-[#20C00C] text-black py-4 sm:py-5 border-y-2 border-black/30 shadow-[0_0_35px_rgba(57,255,20,0.4)] animate-ribbon-left">
                    {items2.map((text, idx) => (
                        <div key={`ribbon-2-${idx}`} className="flex items-center gap-8 sm:gap-10 px-6 sm:px-8">
                            {/* Éter Flash / Lightning Isotype en negro */}
                            <svg className="h-4 w-4 sm:h-5 sm:w-5 fill-black flex-shrink-0" viewBox="0 0 24 24">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                            </svg>
                            <span className="text-sm sm:text-base font-black italic uppercase tracking-[0.28em] drop-shadow-sm text-black">
                                {text}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* CINTA 2 (SUPERIOR - ROTACIÓN POSITIVA - DIRECCIÓN IZQUIERDA) */}
            <div className="relative inset-x-[-10%] rotate-[2.5deg] sm:rotate-[2deg] transform origin-center shadow-[0_25px_60px_rgba(0,0,0,0.98)] z-20">
                <div className="flex w-max items-center whitespace-nowrap bg-gradient-to-r from-[#39FF14] via-[#4dff2b] to-[#39FF14] text-black py-4.5 sm:py-6 border-y-2 border-black/40 shadow-[0_0_40px_rgba(57,255,20,0.6)] animate-ribbon-right">
                    {items1.map((text, idx) => (
                        <div key={`ribbon-1-${idx}`} className="flex items-center gap-8 sm:gap-10 px-6 sm:px-8">
                            {/* Éter Flash / Lightning Isotype en negro */}
                            <svg className="h-4 w-4 sm:h-5 sm:w-5 fill-black flex-shrink-0" viewBox="0 0 24 24">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                            </svg>
                            <span className="text-sm sm:text-base font-black italic uppercase tracking-[0.28em] drop-shadow-sm text-black">
                                {text}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes ribbon-left {
                    0% { transform: translate3d(0, 0, 0); }
                    100% { transform: translate3d(-50%, 0, 0); }
                }
                @keyframes ribbon-right {
                    0% { transform: translate3d(-50%, 0, 0); }
                    100% { transform: translate3d(0, 0, 0); }
                }
                .animate-ribbon-left {
                    animation: ribbon-left 26s linear infinite;
                }
                .animate-ribbon-right {
                    animation: ribbon-right 22s linear infinite;
                }
                @media (prefers-reduced-motion: reduce) {
                    .animate-ribbon-left,
                    .animate-ribbon-right {
                        animation: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
