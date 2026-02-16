'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { MessageSquare, Phone, Mail, Instagram, MapPin, Clock } from 'lucide-react';

const CONTACT_METHODS = [
    {
        title: 'WhatsApp Ventas',
        desc: 'Atención directa para distribuidores',
        value: '+54 9 11 1234 5678',
        icon: MessageSquare,
        color: '#25D366'
    },
    {
        title: 'Email Soporte',
        desc: 'Consultas sobre logística y envíos',
        value: 'soporte@eterstore.com.ar',
        icon: Mail,
        color: '#C88A04'
    },
    {
        title: 'Instagram',
        desc: 'Novedades y nuevos ingresos',
        value: '@eterstore.ok',
        icon: Instagram,
        color: '#E1306C'
    },
];

export default function SupportPage() {
    return (
        <main className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#C88A04] selection:text-black overflow-x-hidden">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-60 pb-20 overflow-hidden">
                <div className="container relative z-10 px-6 mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <h1 className="text-7xl md:text-9xl font-black mb-8 tracking-tighter uppercase leading-none">
                            SOPORTE <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C88A04] to-[#ECA413]">ÉTER</span>
                        </h1>
                        <p className="text-lg text-gray-400 font-light max-w-xl mx-auto tracking-widest uppercase">
                            Estamos acá para que tu negocio nunca se detenga.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Contact Cards */}
            <section className="py-24">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {CONTACT_METHODS.map((method, idx) => (
                            <motion.div
                                key={method.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all text-center relative overflow-hidden"
                            >
                                <div className="relative z-10">
                                    <div className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-8 border border-white/10 bg-black shadow-2xl transition-transform group-hover:scale-110 group-hover:rotate-6">
                                        <method.icon size={32} style={{ color: method.color }} />
                                    </div>
                                    <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">{method.title}</h3>
                                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-6">{method.desc}</p>
                                    <div className="text-white font-mono text-sm border-t border-white/5 pt-6 group-hover:text-[#C88A04] transition-colors">
                                        {method.value}
                                    </div>
                                </div>
                                <div className="absolute -bottom-12 -right-12 w-32 h-32 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: method.color }} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Preview / More Info */}
            <section className="py-24 border-t border-white/5 bg-black">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        <div className="space-y-12">
                            <h2 className="text-4xl font-black uppercase tracking-tighter">PREGUNTAS <span className="text-[#C88A04]">FRECUENTES</span></h2>
                            {[
                                { q: '¿Cuál es el tiempo de entrega?', a: 'Los pedidos se procesan en 24hs y llegan a destino en 2 a 5 días hábiles.' },
                                { q: '¿Tienen garantía los productos?', a: 'Todos nuestros calzados cuentan con garantía de fábrica por 30 días.' },
                                { q: '¿Cómo cobro mis comisiones?', a: 'Las comisiones se liquidan semanalmente todos los lunes a tu cuenta bancaria.' },
                            ].map((faq, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    className="space-y-2 border-l-2 border-[#C88A04]/20 pl-6 hover:border-[#C88A04] transition-colors"
                                >
                                    <h4 className="text-white font-black text-sm uppercase tracking-widest">{faq.q}</h4>
                                    <p className="text-gray-500 text-sm">{faq.a}</p>
                                </motion.div>
                            ))}
                        </div>
                        <div className="bg-[#white]/[0.02] border border-white/5 rounded-[3rem] p-12 flex flex-col justify-center space-y-8">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-[#C88A04] bg-black">
                                    <MapPin size={24} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nuestra Central</span>
                                    <span className="text-white font-black uppercase tracking-tight">Buenos Aires, Argentina</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-[#C88A04] bg-black">
                                    <Clock size={24} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Horario de Atención</span>
                                    <span className="text-white font-black uppercase tracking-tight">Lunes a Viernes 09:00 - 18:00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
