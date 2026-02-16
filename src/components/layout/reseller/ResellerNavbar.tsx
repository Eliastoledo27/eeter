'use client'

import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { ShoppingCart, Globe } from 'lucide-react'
import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'

interface ResellerNavbarProps {
    resellerSlug: string
    resellerName: string
}

export function ResellerNavbar({ resellerSlug, resellerName }: ResellerNavbarProps) {
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

    return (
        <motion.nav
            variants={{
                visible: { y: 0, opacity: 1 },
                hidden: { y: -100, opacity: 0 }
            }}
            animate={isHidden ? "hidden" : "visible"}
            transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
            className={cn(
                "fixed top-0 left-0 right-0 z-[100] transition-all duration-700",
                isScrolled ? "py-3 px-4 md:px-10" : "py-6 px-6 md:px-12"
            )}
        >
            <div className="max-w-screen-2xl mx-auto flex items-center justify-between">

                {/* Left Section: Logo & Reseller Info */}
                <div className="flex items-center gap-8 relative z-[110]">
                    <Link href={`/c/${resellerSlug}`} className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-white text-black rounded-2xl flex items-center justify-center font-black text-xl md:text-2xl shadow-[0_0_40px_rgba(255,255,255,0.2)] group-hover:bg-[#C88A04] group-hover:shadow-[0_0_40px_rgba(200,138,4,0.4)] transition-all duration-500 ease-out">
                                É
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-lg md:text-2xl tracking-tight text-white leading-none uppercase">ÉTER</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#C88A04] shadow-[0_0_8px_rgba(200,138,4,0.8)]" />
                                <span className="text-[7px] md:text-[9px] font-black text-[#C88A04] uppercase tracking-[0.2em]">{resellerName || 'TIENDA OFICIAL'}</span>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Right Section: Action Buttons */}
                <div className="flex items-center gap-2 md:gap-4 relative z-[110]">
                    <div className="hidden sm:flex flex-col items-end mr-4">
                        <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.3em]">Catálogo Curado</span>
                        <span className="text-[10px] font-bold text-white/60">Selección Premium</span>
                    </div>

                    <div className="h-4 w-px bg-white/10 mx-2" />

                    <button
                        onClick={openCart}
                        className="relative p-3 rounded-2xl group transition-all"
                    >
                        <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all border border-white/10" />
                        <ShoppingCart size={20} className="text-zinc-400 group-hover:text-white relative z-10" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-white text-black text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    <div className="hidden md:flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/40 px-4 h-10 rounded-xl border border-white/5 bg-white/[0.02]">
                        <Globe size={12} className="text-[#C88A04]/50" />
                        ARG / ES
                    </div>
                </div>
            </div>
        </motion.nav>
    )
}
