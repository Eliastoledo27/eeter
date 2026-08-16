'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export type ButtonVariant = 'solid-cyan' | 'solid-green' | 'solid-violet' | 'outline-glass' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface EterButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    href?: string;
    icon?: LucideIcon;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
    'solid-cyan':
        'bg-[#00E5FF] text-black border border-[#00E5FF] shadow-[0_0_25px_rgba(0,229,255,0.25)] hover:bg-white hover:border-white hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]',
    'solid-green':
        'bg-[#39FF14] text-black border border-[#39FF14] shadow-[0_0_25px_rgba(57,255,20,0.25)] hover:bg-white hover:border-white hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]',
    'solid-violet':
        'bg-[#A020F0] text-white border border-[#A020F0] shadow-[0_0_25px_rgba(160,32,240,0.25)] hover:bg-white hover:text-black hover:border-white',
    'outline-glass':
        'bg-white/[0.04] text-white border border-white/15 backdrop-blur-md hover:border-[#00E5FF]/60 hover:bg-[#00E5FF]/10 hover:text-[#00E5FF]',
    'ghost':
        'bg-transparent text-white/70 hover:text-white hover:bg-white/5 border border-transparent',
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'h-10 px-4 text-[10px] tracking-[0.18em]',
    md: 'h-12 sm:h-13 px-6 sm:px-8 text-[11px] tracking-[0.20em]',
    lg: 'h-14 sm:h-15 px-8 sm:px-10 text-[12px] tracking-[0.22em]',
};

/**
 * EterButton
 * High-performance tactile button supporting both standard <button> and Next.js <Link>.
 * Implements micro-scale feedback (active:scale-[0.97]) and WCAG accessible focus rings.
 */
export const EterButton = React.forwardRef<HTMLButtonElement, EterButtonProps>(
    (
        {
            children,
            variant = 'solid-cyan',
            size = 'md',
            href,
            icon: Icon,
            iconPosition = 'right',
            fullWidth = false,
            className,
            onClick,
            disabled,
            type = 'button',
            ...props
        },
        ref
    ) => {
        const baseClasses = cn(
            'group relative inline-flex items-center justify-center font-black uppercase italic select-none rounded-xl',
            'transition-all duration-300 ease-out active:scale-[0.97]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus-visible:ring-offset-2 focus-visible:ring-offset-black',
            'disabled:pointer-events-none disabled:opacity-50',
            variantStyles[variant],
            sizeStyles[size],
            fullWidth ? 'w-full' : 'w-auto',
            className
        );

        const content = (
            <>
                {Icon && iconPosition === 'left' && (
                    <Icon
                        size={size === 'sm' ? 14 : size === 'md' ? 16 : 18}
                        className="mr-2.5 transition-transform duration-300 group-hover:-translate-x-0.5"
                    />
                )}
                <span>{children}</span>
                {Icon && iconPosition === 'right' && (
                    <Icon
                        size={size === 'sm' ? 14 : size === 'md' ? 16 : 18}
                        className="ml-2.5 transition-transform duration-300 group-hover:translate-x-1"
                    />
                )}
            </>
        );

        if (href) {
            return (
                <Link href={href} className={baseClasses} aria-disabled={disabled}>
                    {content}
                </Link>
            );
        }

        return (
            <button
                ref={ref}
                type={type}
                className={baseClasses}
                onClick={onClick}
                disabled={disabled}
                {...props}
            >
                {content}
            </button>
        );
    }
);

EterButton.displayName = 'EterButton';
