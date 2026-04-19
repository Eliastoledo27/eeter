'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface HeaderProps {
    productName: string
    productCategory?: string
}

export function ArchitecturalHeader({ productName, productCategory }: HeaderProps) {
    return (
        <section className="relative w-full pt-20 lg:pt-24 pb-2 px-6 overflow-hidden">
            {/* MASSIVE Background Text (flyer-style) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                <span className="text-[28vw] font-black uppercase text-white/[0.03] whitespace-nowrap tracking-tighter leading-none">
                    {productName}
                </span>
            </div>

            <div className="container mx-auto max-w-7xl relative z-10">
                {/* Breadcrumb */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center gap-3 text-[10px] font-bold tracking-widest text-[#00E5FF]/40 uppercase mb-3"
                >
                    <Link href="/catalog" className="hover:text-[#00E5FF] transition-colors drop-shadow-[0_0_5px_#00E5FF20]">
                        CATÁLOGO
                    </Link>
                    <ChevronRight size={10} className="text-[#00E5FF]/20" />
                    {productCategory && (
                        <>
                            <span className="text-[#00E5FF]/80">{productCategory}</span>
                            <ChevronRight size={10} className="text-[#00E5FF]/20" />
                        </>
                    )}
                </motion.div>

                {/* BRUTAL Title */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative"
                >
                    {/* Diagonal accent slash behind title */}
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-[120%] bg-[#00E5FF] -skew-x-12 rounded-sm shadow-[0_0_15px_#00E5FF80]" />
                    
                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] font-black uppercase leading-[0.85] tracking-tighter text-white pl-6 drop-shadow-[0_0_20px_rgba(0,229,255,0.15)]">
                        {productName.split(' ').map((word, i) => (
                            <span key={i} className="block">
                                {i === 0 ? (
                                    <span className="text-[#00E5FF] drop-shadow-[0_0_10px_#00E5FF60]">{word}</span>
                                ) : (
                                    word
                                )}
                            </span>
                        ))}
                    </h1>

                    {/* Category badge */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="mt-3 pl-6"
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#00E5FF] text-black text-[11px] font-black uppercase tracking-widest rounded-sm shadow-[0_0_15px_#00E5FF50]">
                            <span className="w-1.5 h-1.5 bg-black rounded-full shadow-[0_0_5px_black]" />
                            {productCategory || 'EXCLUSIVE NEON'}
                        </span>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}
