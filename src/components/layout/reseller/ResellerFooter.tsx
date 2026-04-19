'use client'

import Link from 'next/link'
import { Instagram, Twitter, MessageCircle, MapPin, ShieldCheck, Zap, Truck } from 'lucide-react'

interface ResellerFooterProps {
    resellerSlug: string
    resellerName: string
}

export function ResellerFooter({ resellerSlug, resellerName }: ResellerFooterProps) {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-[#020202] text-white pt-20 pb-10 border-t border-white/5 relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00E5FF]/50 to-transparent" />

            {/* Decorative background text */}
            <div className="absolute bottom-0 right-0 text-[15vw] font-black text-white/[0.02] pointer-events-none select-none translate-y-1/4 leading-none uppercase">
                {resellerName || 'ÉTER'}
            </div>

            <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
                    {/* Reseller Info */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="flex items-center gap-4 group">
                            <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center font-black text-2xl group-hover:bg-[#00E5FF] transition-all duration-500">
                                É
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-white tracking-tighter uppercase leading-none">ÉTER</span>
                                <span className="text-[10px] font-black text-[#00E5FF] tracking-[0.3em] uppercase">{resellerName || 'PARTNER OFICIAL'}</span>
                            </div>
                        </div>

                        <p className="text-gray-500 text-sm leading-relaxed max-w-xs italic uppercase font-mono">
                            Distrubuidor autorizado de calzado premium brasilero. Exclusivdad y calidad garantizada por la red ÉTER.
                        </p>

                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#00E5FF]">
                                    <ShieldCheck size={20} />
                                </div>
                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-tight">ORIGINAL<br/>CERTIFICADO</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#00E5FF]">
                                    <Truck size={20} />
                                </div>
                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-tight">LOGÍSTICA<br/>ÉTER</span>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="lg:col-span-4 lg:col-start-6 space-y-8">
                        <h3 className="text-[10px] font-black text-[#00E5FF] tracking-widest uppercase">Atención Directa</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 group">
                                <MapPin size={18} className="text-gray-600 group-hover:text-[#00E5FF]" />
                                <span className="text-sm text-gray-400 group-hover:text-white transition-colors">Argentina, Logística Federal</span>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <MessageCircle size={18} className="text-gray-600 group-hover:text-[#00E5FF]" />
                                <span className="text-sm text-gray-400 group-hover:text-white transition-colors">Whatsapp Support 24/7</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Link href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-[#00E5FF] hover:text-black transition-all border border-white/5">
                                <Instagram size={18} />
                            </Link>
                            <Link href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-[#00E5FF] hover:text-black transition-all border border-white/5">
                                <Twitter size={18} />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-700">
                    <p>© {currentYear} ÉTER STORE x {resellerName}.</p>
                    <div className="flex gap-8">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacidad</Link>
                        <Link href="/support" className="hover:text-white transition-colors">Soporte</Link>
                        <span className="cursor-default">Partner Certificado</span>
                        <span className="cursor-default">Logística Internacional</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
