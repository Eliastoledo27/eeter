'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type BadgeTone = 'cyan' | 'green' | 'violet' | 'white';

export interface SectionBadgeProps {
    text: string;
    tone?: BadgeTone;
    className?: string;
    withPulse?: boolean;
}

const toneStyles: Record<BadgeTone, { container: string; dot: string; glow: string }> = {
    cyan: {
        container: 'border-[#00E5FF]/20 bg-[#00E5FF]/5 text-[#00E5FF]',
        dot: 'bg-[#00E5FF]',
        glow: 'shadow-[0_0_10px_#00E5FF]',
    },
    green: {
        container: 'border-[#39FF14]/20 bg-[#39FF14]/5 text-[#39FF14]',
        dot: 'bg-[#39FF14]',
        glow: 'shadow-[0_0_10px_#39FF14]',
    },
    violet: {
        container: 'border-[#A020F0]/20 bg-[#A020F0]/5 text-[#A020F0]',
        dot: 'bg-[#A020F0]',
        glow: 'shadow-[0_0_10px_#A020F0]',
    },
    white: {
        container: 'border-white/20 bg-white/5 text-white/90',
        dot: 'bg-white',
        glow: 'shadow-[0_0_10px_rgba(255,255,255,0.6)]',
    },
};

/**
 * SectionBadge
 * Minimal luxury pill badge with pulsing beacon to label chapters in the story.
 */
export function SectionBadge({
    text,
    tone = 'cyan',
    className,
    withPulse = true,
}: SectionBadgeProps) {
    const currentTone = toneStyles[tone];

    return (
        <div
            className={cn(
                'inline-flex items-center gap-2.5 rounded-full border px-3.5 py-1.5 backdrop-blur-md select-none',
                currentTone.container,
                className
            )}
        >
            {withPulse && (
                <span className="relative flex h-2 w-2">
                    <span
                        className={cn(
                            'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
                            currentTone.dot
                        )}
                    />
                    <span
                        className={cn(
                            'relative inline-flex h-2 w-2 rounded-full',
                            currentTone.dot,
                            currentTone.glow
                        )}
                    />
                </span>
            )}
            <span className="text-[10px] font-black uppercase tracking-[0.22em]">
                {text}
            </span>
        </div>
    );
}
