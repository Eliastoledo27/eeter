'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Instagram, Twitter, Facebook } from 'lucide-react'

export function Footer() {
    const currentYear = new Date().getFullYear()

    const footerLinks = [
        {
            title: 'TIENDA',
            links: [
                { label: 'Novedades', href: '/catalog/new' },
                { label: 'Más Vendidos', href: '/catalog/best' },
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
                { label: 'Garantía de Autenticidad', href: '/authenticity' },
            ]
        },
        {
            title: 'EMPRESA',
            links: [
                { label: 'Nuestra Historia', href: '/about' },
                { label: 'Sustentabilidad', href: '/sustainability' },
                { label: 'Carreras', href: '/careers' },
                { label: 'Prensa', href: '/press' },
            ]
        }
    ]

    return (
        <footer className="bg-black text-white pt-20 pb-10 border-t border-white/5 relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C88A04]/50 to-transparent" />

            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link href="/" className="inline-block">
                            <h2 className="text-3xl font-black tracking-tighter hover:text-[#C88A04] transition-colors">ÉTER</h2>
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                            El futuro del calzado de lujo. <br />
                            Artesanía italiana, ingeniería diseñada para el cosmos.
                        </p>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="inline-flex gap-4 pt-4"
                        >
                            {[Instagram, Twitter, Facebook].map((Icon, i) => (
                                <Link key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#C88A04] hover:text-black transition-all">
                                    <Icon size={18} />
                                </Link>
                            ))}
                        </motion.div>
                    </div>

                    {/* Links Columns */}
                    {footerLinks.map((column, idx) => (
                        <div key={idx} className="space-y-6">
                            <h3 className="text-xs font-bold text-[#C88A04] tracking-widest">{column.title}</h3>
                            <ul className="space-y-4">
                                {column.links.map((link, linkIdx) => (
                                    <li key={linkIdx}>
                                        <Link href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors flex items-center group">
                                            <span className="relative">
                                                {link.label}
                                                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#C88A04] group-hover:w-full transition-all duration-300" />
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
                    <p>© {currentYear} ÉTER STORE. Todos los derechos reservados.</p>
                    <div className="flex gap-8">
                        <Link href="/privacy" className="hover:text-gray-400 transition-colors">Política de Privacidad</Link>
                        <Link href="/terms" className="hover:text-gray-400 transition-colors">Términos de Servicio</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
