'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface NavItem {
    label: string;
    href: string;
}

const NAV_ITEMS_LEFT: NavItem[] = [
    { label: 'INICIO', href: '/' },
    { label: 'PRODUCTOS', href: '/catalog' },
    { label: 'SOBRE ÉTER', href: '/about' },
];

const NAV_ITEMS_RIGHT: NavItem[] = [
    { label: 'COMUNIDAD', href: '/community' },
    { label: 'ACADEMIA', href: '/community#academia' },
    { label: 'CONTACTO', href: '/contact' },
];

/**
 * PreviewHeader
 * Header fijo con desenfoque de fondo al scrollear y el logotipo oficial de Éter enmarcado en badge.
 */
export function PreviewHeader() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
                isScrolled
                    ? 'bg-black/75 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.85)] py-2.5 sm:py-3'
                    : 'bg-transparent border-b border-white/10 py-4 sm:py-5'
            }`}
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-8 md:px-12 flex items-center justify-between">
                
                {/* Left Links: Inicio, Productos, Sobre Éter */}
                <nav className="flex items-center gap-3 sm:gap-6 md:gap-8">
                    {NAV_ITEMS_LEFT.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="text-[9px] sm:text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-white/70 hover:text-[#39FF14] transition-colors"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Center: Official Brand Logo inside the Framed Badge Box */}
                <div className="flex items-center justify-center px-2">
                    <Link href="/" className="group flex items-center">
                        <div className="relative flex items-center justify-center rounded-xl sm:rounded-2xl border-[1.5px] sm:border-2 border-white bg-black px-3.5 sm:px-4 py-1.5 sm:py-2 shadow-[0_4px_25px_rgba(0,0,0,0.95)] transition-all duration-300 group-hover:border-[#39FF14] group-hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] group-hover:scale-105">
                            <Image
                                src="/images/eter-brand-logo.png"
                                alt="ÉTER Oficial"
                                width={160}
                                height={45}
                                priority
                                unoptimized
                                className="h-6 sm:h-8 md:h-9 w-auto object-contain transition-transform duration-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                            />
                        </div>
                    </Link>
                </div>

                {/* Right Links: Comunidad, Academia, Contacto */}
                <nav className="flex items-center gap-3 sm:gap-6 md:gap-8">
                    {NAV_ITEMS_RIGHT.slice(0, 2).map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="hidden sm:inline-block text-[9px] sm:text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-white/70 hover:text-[#39FF14] transition-colors"
                        >
                            {item.label}
                        </Link>
                    ))}

                    {/* Contacto Button CTA */}
                    <Link
                        href="/contact"
                        className="rounded-lg bg-[#39FF14] px-3 sm:px-4 py-1.5 sm:py-2 text-[9px] sm:text-xs font-mono font-black uppercase tracking-widest text-black shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all hover:bg-white hover:scale-105"
                    >
                        CONTACTO
                    </Link>
                </nav>
            </div>
        </header>
    );
}
