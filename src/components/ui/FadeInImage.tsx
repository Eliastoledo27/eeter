'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';

interface FadeInImageProps extends Omit<ImageProps, 'onLoadingComplete' | 'onLoad'> {
    fallbackIconSize?: number;
    containerClassName?: string;
}

export function FadeInImage({
    src,
    alt,
    className,
    fallbackIconSize = 40,
    containerClassName,
    fill,
    sizes,
    priority,
    ...props
}: FadeInImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);

    if (error || !src) {
        return (
            <div className={cn("w-full h-full flex flex-col items-center justify-center bg-neutral-900 border border-white/5 rounded-2xl text-neutral-600", containerClassName)}>
                <ShoppingBag size={fallbackIconSize} strokeWidth={1.5} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest mt-2 text-neutral-500">Sin Imagen</span>
            </div>
        );
    }

    return (
        <div className={cn("relative overflow-hidden w-full h-full bg-[#0a0a0a]/50 select-none", containerClassName)}>
            {/* Elegant Luxury Shimmer Backdrop before load */}
            {!isLoaded && (
                <div 
                    className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 animate-pulse z-10" 
                    style={{ animationDuration: '2s' }}
                />
            )}
            
            <Image
                src={src}
                alt={alt || "Éter Store Calzado"}
                fill={fill ?? true}
                sizes={sizes || "(max-width: 768px) 100vw, 50vw"}
                priority={priority}
                onLoad={() => setIsLoaded(true)}
                onError={() => setError(true)}
                className={cn(
                    "object-cover transition-all duration-700 ease-out",
                    isLoaded 
                        ? "scale-100 blur-0 opacity-100" 
                        : "scale-[1.03] blur-md opacity-0",
                    className
                )}
                {...props}
            />
        </div>
    );
}
