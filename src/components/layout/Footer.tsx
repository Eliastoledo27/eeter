'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Instagram, Twitter, Facebook, Youtube, MessageCircle, ArrowUpRight } from 'lucide-react'

const FOOTER_LINKS = [
    {
        title: 'TIENDA',
        links: [
            { label: 'Novedades', href: '/catalog/new' },
            { label: 'Más Vendidos', href: '/catalog/best' },
            { label: 'Drop Calendar', href: '#drops' },
            { label: 'Accesorios', href: '/catalog/accessories' },
            { label: 'Tarjetas de Regalo', href: '/gift-cards' },
        ]
    },
    {
        title: 'SOPORTE',
        links: [
            { label: 'Envíos y Entregas', href: '/shipping' },
            { label: 'Cambios y Devoluciones', href: '/returns' },
            { label: 'Guía de Talles', href: '/size-guide' },
            { label: 'ÉTER Certified', href: '/authenticity' },
            { label: 'Contacto', href: '/contact' },
        ]
    },
    {
        title: 'EMPRESA',
        links: [
            { label: 'Nuestra Historia', href: '/about' },
            { label: 'Ser Revendedor', href: '/register' },
            { label: 'Comunidad ÉTER', href: '/community' },
            { label: 'Sustentabilidad', href: '/sustainability' },
            { label: 'Prensa', href: '/press' },
        ]
    }
]

const SOCIAL_LINKS = [
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter / X' },
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
]

const TRUST_BADGES = ['ÉTER CERTIFIED', 'LOGÍSTICA TOTAL', 'ORIGINAL 100%', '+500 REVENDEDORES']

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <>
            {/* WhatsApp Floating Button */}
            <motion.a
                href="https://wa.me/5492236204002?text=Hola%20ÉTER%2C%20quiero%20más%20información"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contactar por WhatsApp"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2, duration: 0.5, type: 'spring' }}
                whileHover={{ scale: 1.08 }}
                className="fixed bottom-8 left-8 z-[9990] flex items-center gap-3 bg-[#25D366] text-white pl-5 pr-6 py-3.5 rounded-full shadow-[0_0_30px_rgba(37,211,102,0.4)] hover:shadow-[0_0_40px_rgba(37,211,102,0.6)] transition-shadow"
            >
                <MessageCircle size={18} className="shrink-0" fill="white" />
                <span className="text-[11px] font-black uppercase tracking-[0.15em]">WhatsApp</span>
            </motion.a>

            <footer className="bg-[#020202] text-white pt-24 pb-12 border-t border-white/[0.05] relative overflow-hidden">
                {/* Top gradient separator */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00E5FF]/40 to-transparent" />

                {/* Background radial */}
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00E5FF]/[0.02] rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                    {/* Main grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-20">
                        {/* Brand Column */}
                        <div className="lg:col-span-4 space-y-8">
                            <Link href="/" className="inline-block group">
                                <h2 className="text-5xl font-black tracking-tighter text-white group-hover:text-[#00E5FF] transition-colors duration-300 uppercase">
                                    ÉTER<span className="text-[#00E5FF] italic">.</span>
                                </h2>
                            </Link>

                            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                                La plataforma de reventa de calzado premium más completa de Argentina.
                                Calzado brasilero autenticado. Logística total incluida.
                            </p>

                            {/* Trust badges */}
                            <div className="flex flex-wrap gap-2">
                                {TRUST_BADGES.map(badge => (
                                    <span key={badge} className="text-[8px] font-black uppercase tracking-widest text-[#00E5FF] border border-[#00E5FF]/30 px-2.5 py-1">
                                        {badge}
                                    </span>
                                ))}
                            </div>

                            {/* Social icons */}
                            <div className="flex gap-3">
                                {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                                    <Link
                                        key={label}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={label}
                                        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#00E5FF] hover:border-[#00E5FF] hover:text-black text-gray-400 transition-all duration-300"
                                    >
                                        <Icon size={15} />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Links columns */}
                        {FOOTER_LINKS.map((col, idx) => (
                            <div key={idx} className="lg:col-span-2 space-y-6">
                                <h3 className="text-[10px] font-black tracking-[0.35em] text-[#00E5FF] uppercase">
                                    {col.title}
                                </h3>
                                <ul className="space-y-4">
                                    {col.links.map(link => (
                                        <li key={link.label}>
                                            <Link
                                                href={link.href}
                                                className="text-gray-500 hover:text-white text-sm transition-colors group flex items-center gap-1.5"
                                            >
                                                <span className="relative inline-block">
                                                    {link.label}
                                                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#00E5FF] group-hover:w-full transition-all duration-300" />
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        {/* Newsletter column */}
                        <div className="lg:col-span-2 space-y-6">
                            <h3 className="text-[10px] font-black tracking-[0.35em] text-[#00E5FF] uppercase">
                                NEWSLETTER
                            </h3>
                            <p className="text-gray-500 text-xs leading-relaxed">
                                Drops exclusivos, tips de ventas y novedades del catálogo.
                            </p>
                            <div className="flex flex-col gap-2">
                                <input
                                    type="email"
                                    placeholder="tu@email.com"
                                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#00E5FF]/50 transition-colors"
                                    aria-label="Email para newsletter"
                                />
                                <button className="w-full py-3 bg-[#00E5FF] text-black text-[9px] font-black uppercase tracking-[0.3em] hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(0,229,255,0.2)]">
                                    SUSCRIBIRME
                                    <ArrowUpRight size={12} />
                                </button>
                            </div>
                        </div>
                    </div>


                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10" />

                    {/* Certified bar */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <Image
                                src="https://upload.wikimedia.org/wikipedia/commons/4/41/Flag_of_Brazil.svg"
                                alt="Calzado brasilero"
                                width={24}
                                height={18}
                                className="opacity-60"
                            />
                            <span className="text-[10px] text-gray-600 uppercase tracking-widest">
                                Calzado de origen brasilero — verificado y certificado por ÉTER
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-600 uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Plataforma operativa 24/7
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-gray-700">
                        <p>© {currentYear} ÉTER STORE. Todos los derechos reservados.</p>
                        <div className="flex gap-8">
                            <Link href="/privacy" className="hover:text-gray-400 transition-colors">
                                Política de Privacidad
                            </Link>
                            <Link href="/terms" className="hover:text-gray-400 transition-colors">
                                Términos de Servicio
                            </Link>
                            <Link href="/cookies" className="hover:text-gray-400 transition-colors">
                                Cookies
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    )
}
