'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Terminal, X } from 'lucide-react'
import Link from 'next/link'

interface ArchitecturalHeaderProps {
    productName: string;
    productCategory?: string;
}

export function ArchitecturalHeader({ productName, productCategory }: ArchitecturalHeaderProps) {
    return (
        <div className="sticky top-0 z-50 backdrop-blur-3xl bg-black/60 border-b border-[#ffd900]/10 py-10 overflow-hidden">
            {/* Horizontal Scan */}
            <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ffd900]/30 to-transparent z-[51]"
            />

            {/* Hologram Name */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] select-none text-[12vw] font-black uppercase text-white whitespace-nowrap tracking-tighter">
                {productName}
            </div>

            <div className="container mx-auto max-w-7xl px-8 relative z-[52]">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                    <div className="flex items-center gap-8">
                        <Link
                            href="/catalog"
                            className="h-20 w-20 flex items-center justify-center bg-black border border-white/10 hover:border-[#ffd900]/50 rounded-[2rem] transition-all duration-700 shadow-2xl group relative overflow-hidden shrink-0"
                        >
                            <div className="absolute inset-2 border border-white/[0.05] rounded-[1.5rem]" />
                            <div className="absolute inset-0 bg-[#ffd900] opacity-0 group-hover:opacity-10 transition-opacity" />
                            <ArrowLeft className="relative z-10 text-gray-500 group-hover:text-[#ffd900] group-hover:-translate-x-1 transition-all" size={28} />
                        </Link>

                        <div className="space-y-3">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-[#ffd900]/10 border border-[#ffd900]/20 px-3 py-1 rounded-full">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#ffd900] animate-pulse shadow-[0_0_8px_#ffd900]" />
                                    <span className="text-[9px] font-black text-[#ffd900] uppercase tracking-[0.4em]">Core_Active</span>
                                </div>
                                <span className="text-[9px] font-mono text-gray-600 tracking-widest uppercase">/ Protocolo v2.6 /</span>
                            </div>

                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase leading-none">
                                {productName}
                            </h1>

                            <nav className="text-[10px] font-mono font-medium text-gray-500 flex items-center gap-4 uppercase">
                                <Link href="/catalog" className="hover:text-[#ffd900] transition-colors">Archivo</Link>
                                <span className="opacity-20">//</span>
                                <span className="text-white/40">{productCategory || 'General'}</span>
                            </nav>
                        </div>
                    </div>

                    {/* Diagnostic HUD */}
                    <div className="flex flex-wrap gap-12 items-center lg:justify-end">
                        <div className="flex flex-col gap-1.5 text-right">
                            <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest">Latencia_Ping</span>
                            <span className="text-[10px] font-mono text-emerald-500 uppercase">08ms // ESTABLE</span>
                        </div>

                        <div className="hidden sm:flex flex-col gap-1.5 text-right">
                            <span className="text-[8px] font-black text-[#ffd900] uppercase tracking-widest">Estado_Protocolo</span>
                            <span className="text-xs font-black text-white italic tracking-widest">AUTORIZADO_FULL</span>
                        </div>

                        <div className="w-16 h-16 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center group overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#ffd900]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Terminal className="text-[#ffd900] relative z-10" size={24} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
