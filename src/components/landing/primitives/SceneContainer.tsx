'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SceneContainerProps extends React.HTMLAttributes<HTMLElement> {
    children: React.ReactNode;
    className?: string;
    id?: string;
    fullHeight?: boolean;
    withTexture?: boolean;
}

/**
 * SceneContainer
 * Base primitive for every full-screen scene in the ÉTER narrative.
 * Enforces dynamic viewport height (100dvh) on mobile to avoid browser chrome jumping.
 */
export const SceneContainer = React.forwardRef<HTMLElement, SceneContainerProps>(
    ({ children, className, id, fullHeight = true, withTexture = true, ...props }, ref) => {
        return (
            <section
                ref={ref}
                id={id}
                className={cn(
                    'relative w-full overflow-hidden bg-[#050505] text-white flex flex-col justify-center',
                    fullHeight ? 'min-h-[100dvh] py-16 sm:py-20 md:py-24' : 'py-12 sm:py-16',
                    'px-4 sm:px-6 md:px-10 lg:px-16',
                    className
                )}
                {...props}
            >
                {/* Optional Subtle Noise / Grain Overlay */}
                {withTexture && (
                    <div
                        className="pointer-events-none absolute inset-0 z-0 opacity-[0.035] mix-blend-overlay"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        }}
                    />
                )}

                {/* Inner Content Max-Width Wrapper */}
                <div className="relative z-10 mx-auto w-full max-w-[1440px]">
                    {children}
                </div>
            </section>
        );
    }
);

SceneContainer.displayName = 'SceneContainer';
