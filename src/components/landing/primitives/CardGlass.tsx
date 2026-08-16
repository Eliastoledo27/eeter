'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CardGlassProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
    glowTone?: 'cyan' | 'green' | 'violet' | 'none';
}

const glowHoverStyles = {
    cyan: 'hover:border-[#00E5FF]/40 hover:shadow-[0_0_30px_rgba(0,229,255,0.12)]',
    green: 'hover:border-[#39FF14]/40 hover:shadow-[0_0_30px_rgba(57,255,20,0.12)]',
    violet: 'hover:border-[#A020F0]/40 hover:shadow-[0_0_30px_rgba(160,32,240,0.12)]',
    none: 'hover:border-white/20',
};

/**
 * CardGlass
 * Luxury dark acrylic container with ultra-subtle border and optional neon hover highlights.
 */
export const CardGlass = React.forwardRef<HTMLDivElement, CardGlassProps>(
    ({ children, className, hoverEffect = true, glowTone = 'cyan', ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'relative overflow-hidden rounded-2xl border border-white/10 bg-[#080808]/70 p-5 sm:p-6 md:p-8 backdrop-blur-xl',
                    'transition-all duration-500 ease-out',
                    hoverEffect && glowHoverStyles[glowTone],
                    className
                )}
                {...props}
            >
                {/* Subtle Inner Highlight Line */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                
                {children}
            </div>
        );
    }
);

CardGlass.displayName = 'CardGlass';
