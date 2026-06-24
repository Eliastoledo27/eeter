'use client'

import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'
import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'

interface ResellerNavbarProps {
    resellerSlug: string
    resellerName: string
    resellerTheme?: string
}

export function ResellerNavbar({ resellerSlug, resellerName, resellerTheme = 'original' }: ResellerNavbarProps) {
    const { totals, openCart } = useCart()
    const [isScrolled, setIsScrolled] = useState(false)
    const [isHidden, setIsHidden] = useState(false)
    const { scrollY } = useScroll()
    const lastScrollY = useRef(0)

    const cartCount = totals.itemCount

    // Handle scroll behavior (hide on scroll down, show on scroll up)
    useMotionValueEvent(scrollY, "change", (latest) => {
        const direction = latest - lastScrollY.current
        if (latest > 100 && direction > 0) {
            setIsHidden(true)
        } else {
            setIsHidden(false)
        }
        setIsScrolled(latest > 50)
        lastScrollY.current = latest
    })

    // Theme mappings for navbar styling
    const themeNavClasses: Record<string, string> = {
        original: cn(
            "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
            isScrolled
                ? "py-3 px-4 md:px-10 bg-black/80 backdrop-blur-md border-b border-white/5 shadow-lg"
                : "py-6 px-6 md:px-12 bg-transparent"
        ),
        minimal: cn(
            "fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b border-zinc-900 bg-[#0a0a0a]",
            isScrolled ? "py-3 px-4 md:px-10" : "py-5 px-6 md:px-12"
        ),
        cyber: cn(
            "fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b border-dashed border-emerald-500/20 bg-[#020408]",
            isScrolled ? "py-3 px-4 md:px-10" : "py-5 px-6 md:px-12"
        ),
        warm: cn(
            "fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b border-[#3a3530]/40 bg-[#121110]",
            isScrolled ? "py-3 px-4 md:px-10" : "py-5 px-6 md:px-12"
        ),
        swiss: cn(
            "fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b-4 border-white bg-black",
            isScrolled ? "py-3 px-4" : "py-5 px-6"
        ),
        kinetic: cn(
            "fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b border-zinc-800 bg-[#030303]",
            isScrolled ? "py-3 px-4 md:px-10" : "py-5 px-6 md:px-12"
        ),
    };

    // Render reseller name according to theme
    const renderResellerBrand = () => {
        switch (resellerTheme) {
            case 'minimal':
                return (
                    <span className="text-lg md:text-xl font-light tracking-tight font-serif text-white uppercase">
                        {resellerName}
                    </span>
                );
            case 'cyber':
                return (
                    <div className="flex items-center">
                        <span className="text-base md:text-lg font-bold tracking-wider font-mono text-emerald-400 uppercase">
                            {resellerName.toUpperCase()}
                        </span>
                        <span className="w-2 h-2 bg-emerald-500 inline-block ml-2 animate-ping rounded-full shrink-0" />
                    </div>
                );
            case 'warm':
                return (
                    <div className="flex items-center">
                        <span className="text-lg md:text-xl font-normal font-serif text-[#F5F2EB] tracking-wide">
                            {resellerName}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C2B29F] inline-block ml-2" />
                    </div>
                );
            case 'swiss':
                return (
                    <span className="text-xl md:text-2xl font-black tracking-tighter text-white uppercase">
                        {resellerName.toUpperCase()}
                    </span>
                );
            case 'kinetic':
                return (
                    <div className="flex items-center">
                        <span className="text-2xl md:text-3xl font-black tracking-widest text-white uppercase italic select-none skew-x-3 bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-zinc-600 leading-none">
                            {resellerName.toUpperCase()}
                        </span>
                        <span className="w-2.5 h-2.5 bg-yellow-500 inline-block ml-2.5 skew-x-3 shrink-0" />
                    </div>
                );
            case 'original':
            default:
                return (
                    <div className="flex items-center">
                        <span className="text-xl md:text-2xl font-black tracking-tighter text-white uppercase italic">
                            {resellerName.toUpperCase()}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-[#00E5FF] inline-block ml-2 shadow-[0_0_8px_rgba(0,229,255,0.8)] shrink-0" />
                    </div>
                );
        }
    };

    // Cart button wrapper style per theme
    const cartButtonClasses: Record<string, string> = {
        original: "relative p-3 rounded-2xl group transition-all border border-white/5 bg-white/5 hover:border-[#00E5FF]/40",
        minimal: "relative p-3 rounded-none group transition-all border border-zinc-800 hover:border-zinc-500 bg-transparent",
        cyber: "relative p-3 rounded-[0.5rem] group transition-all border border-dashed border-emerald-500/30 hover:border-emerald-400 bg-transparent",
        warm: "relative p-3 rounded-[1.25rem] group transition-all border border-[#3a3530] hover:border-[#8b7e74] bg-[#1a1816]",
        swiss: "relative p-3 rounded-none group transition-all border-2 border-white hover:border-[#EF4444] bg-black",
        kinetic: "relative p-3 rounded-br-[1rem] rounded-tl-[1rem] group transition-all border border-zinc-800 hover:border-yellow-500 bg-zinc-950",
    };

    // Cart Icon class per theme
    const cartIconClasses: Record<string, string> = {
        original: "text-zinc-400 group-hover:text-white transition-colors relative z-10",
        minimal: "text-zinc-400 group-hover:text-zinc-100 transition-colors relative z-10",
        cyber: "text-emerald-500/80 group-hover:text-emerald-400 transition-colors relative z-10",
        warm: "text-[#c2b29f] group-hover:text-[#f5f2eb] transition-colors relative z-10",
        swiss: "text-white group-hover:text-[#EF4444] transition-colors relative z-10",
        kinetic: "text-zinc-400 group-hover:text-yellow-400 transition-colors relative z-10",
    };

    // Cart count badge class per theme
    const cartBadgeClasses: Record<string, string> = {
        original: "absolute -top-1 -right-1 bg-white text-black text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)]",
        minimal: "absolute -top-1 -right-1 bg-zinc-200 text-black text-[9px] font-bold w-5 h-5 flex items-center justify-center rounded-none",
        cyber: "absolute -top-1 -right-1 bg-emerald-500 text-black text-[9px] font-bold w-5 h-5 flex items-center justify-center rounded-[0.25rem] shadow-[0_0_8px_rgba(16,185,129,0.7)] font-mono",
        warm: "absolute -top-1 -right-1 bg-[#c2b29f] text-[#121110] text-[9px] font-bold w-5 h-5 flex items-center justify-center rounded-full",
        swiss: "absolute -top-1 -right-1 bg-[#EF4444] text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-none",
        kinetic: "absolute -top-1 -right-1 bg-yellow-500 text-black text-[9px] font-black italic w-5 h-5 flex items-center justify-center rounded-none shadow-[2px_2px_0px_rgba(0,0,0,1)]",
    };

    return (
        <motion.nav
            variants={{
                visible: { y: 0, opacity: 1 },
                hidden: { y: -100, opacity: 0 }
            }}
            animate={isHidden ? "hidden" : "visible"}
            transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
            className={themeNavClasses[resellerTheme]}
        >
            <div className="max-w-screen-2xl mx-auto flex items-center justify-between">

                {/* Left Section: Reseller Brand Only (White-Labeled) */}
                <div className="flex items-center gap-8 relative z-[110]">
                    <Link href={`/c/${resellerSlug}`} className="flex items-center gap-3 group">
                        {renderResellerBrand()}
                    </Link>
                </div>

                {/* Right Section: Action Buttons (Only Cart Button, Clean Layout) */}
                <div className="flex items-center gap-2 relative z-[110]">
                    <button
                        onClick={openCart}
                        className={cartButtonClasses[resellerTheme]}
                        aria-label="Abrir carrito"
                    >
                        {/* Hover effect overlays */}
                        {resellerTheme === 'original' && (
                            <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all border border-white/10" />
                        )}
                        <ShoppingCart size={20} className={cartIconClasses[resellerTheme]} />
                        {cartCount > 0 && (
                            <span className={cartBadgeClasses[resellerTheme]}>
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </motion.nav>
    )
}
