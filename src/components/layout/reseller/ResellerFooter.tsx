'use client'

import Link from 'next/link'
import { Instagram, Twitter, MessageCircle, MapPin, ShieldCheck, Zap } from 'lucide-react'

interface ResellerFooterProps {
    resellerSlug: string
    resellerName: string
}

export function ResellerFooter({ resellerSlug, resellerName }: ResellerFooterProps) {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-black text-white pt-20 pb-10 border-t border-white/5 relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C88A04]/50 to-transparent" />

            {/* Decorative background text */}
            <div className="absolute bottom-0 right-0 text-[15vw] font-black text-white/[0.02] pointer-events-none select-none translate-y-1/4 leading-none uppercase">
                {resellerName || 'ÉTER'}
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 mb-20">
                    {/* Brand Column */}
                    <div className="space-y-8">
                        <Link href={`/c/${resellerSlug}`} className="inline-block group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center font-black text-2xl group-hover:bg-[#C88A04] transition-all duration-500">
                                    É
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-2xl font-black tracking-tighter uppercase">ÉTER</h2>
                                    <span className="text-[10px] font-black text-[#C88A04] tracking-[0.3em] uppercase">{resellerName || 'PARTNER OFICIAL'}</span>
                                </div>
                            </div>
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                            Estás visualizando el catálogo exclusivo curado por <strong>{resellerName}</strong>.
                            Cada pieza ha sido seleccionada bajo los estándares más altos de ÉTER STORE.
                        </p>
                    </div>

                    {/* Features Column */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:col-span-1">
                        <div className="space-y-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#C88A04]">
                                <ShieldCheck size={20} />
                            </div>
                            <h3 className="text-[10px] font-black tracking-widest uppercase">Garantía Total</h3>
                            <p className="text-gray-500 text-xs">Autenticidad verificada por ÉTER en cada par.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#C88A04]">
                                <Zap size={20} />
                            </div>
                            <h3 className="text-[10px] font-black tracking-widest uppercase">Envío Élite</h3>
                            <p className="text-gray-500 text-xs">Logística prioritaria para clientes seleccionados.</p>
                        </div>
                    </div>

                    {/* Contact Column */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-[#C88A04] tracking-widest uppercase">Atención Directa</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-gray-400 hover:text-white transition-colors group cursor-default">
                                <MapPin size={18} className="text-gray-600 group-hover:text-[#C88A04]" />
                                <span className="text-sm">Envíos a todo el país</span>
                            </div>
                            <div className="flex items-center gap-4 text-gray-400 hover:text-white transition-colors group cursor-default">
                                <MessageCircle size={18} className="text-gray-600 group-hover:text-[#C88A04]" />
                                <span className="text-sm">Soporte personalizado vía WhatsApp</span>
                            </div>
                        </div>
                        <div className="flex gap-4 pt-4">
                            {[Instagram, Twitter].map((Icon, i) => (
                                <Link key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-[#C88A04] hover:text-black transition-all border border-white/5">
                                    <Icon size={18} />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-700">
                    <p>© {currentYear} ÉTER STORE x {resellerName}.</p>
                    <div className="flex gap-8">
                        <span className="cursor-default">Partner Certificado</span>
                        <span className="cursor-default">Logística Internacional</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
