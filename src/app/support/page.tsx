'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { 
    MessageCircle, 
    Truck, 
    RefreshCcw, 
    ShieldCheck, 
    Search,
    ArrowRight,
    HelpCircle,
    Instagram,
    Mail
} from 'lucide-react';

const easeOut = [0.16, 1, 0.3, 1] as const;

const SUPPORT_CATEGORIES = [
    {
        title: 'ENVÍOS',
        icon: Truck,
        color: 'cyan',
        links: ['Costos de Envío', 'Tiempos de Entrega', 'Seguimiento de Pedido', 'Zonificación Argentina']
    },
    {
        title: 'CAMBIOS',
        icon: RefreshCcw,
        color: 'green',
        links: ['Política de Devolución', 'Guía de Talles', 'Fallos de Fábrica', 'Plazos y Condiciones']
    },
    {
        title: 'SEGURIDAD',
        icon: ShieldCheck,
        color: 'purple',
        links: ['ÉTER Certified', 'Pagos Seguros', 'Protección al Vendedor', 'Autenticidad Brasilera']
    }
];

const FAQS = [
    { q: '¿Cómo puedo pagar mis pedidos?', a: 'Aceptamos transferencias bancarias, Mercado Pago (con recargo) y efectivo en puntos de retiro seleccionados.' },
    { q: '¿Qué garantía tienen los productos?', a: 'Todos los calzados cuentan con garantía por fallas de fabricación de 15 días posteriores a la recepción.' },
    { q: '¿Hacen envíos a todo el país?', a: 'Sí, llegamos a toda la Argentina a través de Correo Argentino y Andreani.' },
];

export default function SupportPage() {
    return (
        <main className="min-h-screen bg-[#050505] text-white selection:bg-[#C6FF00] selection:text-black overflow-x-hidden">
            <Navbar />

            {/* Support Hero Section */}
            <section className="relative z-0 pt-60 pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,229,255,0.08),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(198,255,0,0.08),transparent_25%)]" />
                <div className="grunge-overlay" />
                
                {/* Artistic Splatters */}
                <motion.div 
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                    transition={{ duration: 12, repeat: Infinity }}
                    className="paint-splatter splat-cyan -right-40 top-20 opacity-30"
                />
                
                <div className="container relative z-10 px-6 mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: easeOut }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <h1 className="eter-hero-logo text-6xl md:text-9xl mb-8 leading-none">
                            CENTRO DE <br /><span className="text-tri-gradient italic">TRANQUILIDAD</span>
                        </h1>
                        
                        {/* Search Bar - Stylized */}
                        <div className="relative max-w-xl mx-auto mt-12">
                            <div className="absolute inset-0 bg-[#00E5FF]/5 blur-2xl -z-10" />
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#00E5FF]" size={20} />
                            <input 
                                type="text"
                                placeholder="¿Cómo podemos ayudarte hoy?"
                                className="w-full bg-white/5 border border-white/10 rounded-full py-6 pl-14 pr-6 text-lg font-medium outline-none focus:border-[#00E5FF]/50 transition-all placeholder:text-white/20"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Category Grid */}
            <section className="relative z-0 py-24">
                <div className="paint-splatter splat-green -left-20 top-1/2 opacity-20" />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {SUPPORT_CATEGORIES.map((cat, idx) => (
                            <motion.div
                                key={cat.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="eter-card group p-10 flex flex-col items-start border-white/5 bg-white/[0.01]"
                            >
                                <span className={`brush-stroke brush-${cat.color} -top-3 left-10 w-24 h-4 opacity-0 transition-all duration-500 group-hover:opacity-60`} />
                                <div className={`mb-10 p-5 rounded-2xl bg-black border border-white/10 ${cat.color === 'cyan' ? 'text-[#00E5FF]' : cat.color === 'green' ? 'text-[#C6FF00]' : 'text-[#7A00FF]'}`}>
                                    <cat.icon size={32} />
                                </div>
                                <h3 className="text-2xl font-black mb-8 tracking-tighter uppercase">{cat.title}</h3>
                                <ul className="space-y-4 w-full">
                                    {cat.links.map(link => (
                                        <li key={link}>
                                            <button className="text-white/40 hover:text-white text-sm font-medium transition-colors flex items-center justify-between w-full group/link">
                                                {link}
                                                <ArrowRight size={14} className="opacity-0 -translate-x-2 transition-all group-hover/link:opacity-100 group-hover/link:translate-x-0" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quick Contact Bar */}
            <section className="relative z-0 py-20 bg-black border-y border-white/5 overflow-hidden">
                <motion.div 
                    animate={{ x: [-1000, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute top-0 whitespace-nowrap opacity-5 pointer-events-none"
                >
                    <span className="text-[120px] font-black italic tracking-tighter">SOPORTE PREMIUM ÉTER SOPORTE PREMIUM ÉTER</span>
                </motion.div>
                
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 bg-[#00E5FF]/5 border border-[#00E5FF]/20 rounded-[3rem] p-12 backdrop-blur-xl">
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">
                                ¿PROBLEMAS <span className="text-[#00E5FF]">URGENTES?</span>
                            </h2>
                            <p className="text-white/60 font-medium text-lg">Nuestro equipo de soporte está operando en vivo.</p>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <motion.a 
                                href="https://wa.me/5492236204002"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-3 bg-[#25D366] text-black font-black uppercase tracking-widest px-8 py-5 rounded-full text-xs shadow-[0_15px_40px_rgba(37,211,102,0.3)]"
                            >
                                <MessageCircle size={20} fill="black" />
                                WhatsApp Chat Live
                            </motion.a>
                            <motion.a 
                                href="mailto:soporte@eter.store"
                                whileHover={{ scale: 1.05, backgroundColor: '#fff', color: '#000' }}
                                className="flex items-center gap-3 bg-white/10 text-white font-black uppercase tracking-widest px-8 py-5 rounded-full text-xs border border-white/10 transition-colors"
                            >
                                <Mail size={20} />
                                Enviar Correo
                            </motion.a>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Accordion Section */}
            <section className="relative z-0 py-32">
                <div className="container max-w-4xl mx-auto px-6">
                    <div className="text-center mb-20 space-y-4">
                        <HelpCircle className="mx-auto text-[#7A00FF]" size={48} />
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">PREGUNTAS FRECUENTES</h2>
                    </div>
                    <div className="space-y-4">
                        {FAQS.map((faq, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                className="eter-card group p-8 bg-white/[0.02] border-white/5 hover:bg-white/[0.05] cursor-pointer"
                            >
                                <h4 className="text-lg font-black tracking-tight mb-4 flex items-center justify-between text-[#C6FF00]">
                                    {faq.q}
                                    <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-white/40 group-hover:bg-[#C6FF00] group-hover:text-black group-hover:border-[#C6FF00] transition-all">+</div>
                                </h4>
                                <p className="text-white/40 font-medium leading-relaxed group-hover:text-white/80 transition-colors">
                                    {faq.a}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
