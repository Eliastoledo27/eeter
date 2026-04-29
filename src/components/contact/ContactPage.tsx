'use client';

import { motion } from 'framer-motion';
import { 
    Mail, 
    MessageCircle, 
    MapPin, 
    Clock, 
    Send,
    ArrowRight,
    HeadphonesIcon,
    Globe2
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function ContactPage() {
    return (
        <main className="flex flex-col min-h-screen bg-[#050505] text-white selection:bg-[#00E5FF] selection:text-black">
            <Navbar />
            
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(0,229,255,0.1),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(122,0,255,0.08),transparent_40%)]" />
                
                <div className="mx-auto max-w-[1440px] px-5 md:px-10">
                    <div className="relative z-10 grid gap-16 lg:grid-cols-2 lg:items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: easeOut }}
                        >
                            <h1 className="text-5xl font-black uppercase leading-tight sm:text-7xl md:text-8xl tracking-tighter">
                                CONTACTO <br />
                                <span className="text-tri-gradient">DIRECTO.</span>
                            </h1>
                            <p className="mt-8 text-lg text-white/50 max-w-lg leading-relaxed">
                                Estamos acá para potenciar tu negocio. Consultas comerciales, soporte a revendedores y alianzas estratégicas.
                            </p>
                            
                            <div className="mt-12 space-y-8">
                                <div className="flex items-start gap-6 group">
                                    <div className="h-12 w-12 shrink-0 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-[#00E5FF]/50 transition-colors">
                                        <MessageCircle className="text-[#00E5FF]" />
                                    </div>
                                    <div>
                                        <h3 className="font-black uppercase tracking-widest text-xs text-[#00E5FF]">WhatsApp Oficial</h3>
                                        <p className="mt-1 text-lg font-bold text-white">+54 9 223 620-4002</p>
                                        <p className="text-xs text-white/40 uppercase tracking-tighter mt-1">Atención inmediata para revendedores</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-6 group">
                                    <div className="h-12 w-12 shrink-0 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-[#7A00FF]/50 transition-colors">
                                        <Mail className="text-[#7A00FF]" />
                                    </div>
                                    <div>
                                        <h3 className="font-black uppercase tracking-widest text-xs text-[#7A00FF]">Consultas de Email</h3>
                                        <p className="mt-1 text-lg font-bold text-white">equiporeveter@gmail.com</p>
                                        <p className="text-xs text-white/40 uppercase tracking-tighter mt-1">Respuesta en menos de 24hs hábiles</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-6 group">
                                    <div className="h-12 w-12 shrink-0 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-[#C6FF00]/50 transition-colors">
                                        <MapPin className="text-[#C6FF00]" />
                                    </div>
                                    <div>
                                        <h3 className="font-black uppercase tracking-widest text-xs text-[#C6FF00]">Base Operativa</h3>
                                        <p className="mt-1 text-lg font-bold text-white">Mar del Plata, Argentina</p>
                                        <p className="text-xs text-white/40 uppercase tracking-tighter mt-1">Distribución a todo el país</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, ease: easeOut, delay: 0.2 }}
                            className="eter-card p-10 relative overflow-hidden"
                        >
                            <div className="grunge-overlay opacity-20" />
                            <h2 className="text-2xl font-black uppercase mb-8 flex items-center gap-3">
                                ENVIANOS UN <span className="text-[#00E5FF]">MENSAJE</span>
                            </h2>
                            
                            <form className="space-y-6 relative z-10">
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Nombre Completo</label>
                                        <input type="text" className="w-full bg-white/5 border border-white/10 rounded-md p-4 outline-none focus:border-[#00E5FF] transition-colors" placeholder="Tu nombre..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">WhatsApp</label>
                                        <input type="text" className="w-full bg-white/5 border border-white/10 rounded-md p-4 outline-none focus:border-[#00E5FF] transition-colors" placeholder="+54 9..." />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Asunto</label>
                                    <select className="w-full bg-white/5 border border-white/10 rounded-md p-4 outline-none focus:border-[#00E5FF] transition-colors appearance-none">
                                        <option className="bg-[#050505]">Quiero ser revendedor</option>
                                        <option className="bg-[#050505]">Consulta sobre mi pedido</option>
                                        <option className="bg-[#050505]">Alianza comercial</option>
                                        <option className="bg-[#050505]">Otro motivo</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Mensaje</label>
                                    <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-md p-4 outline-none focus:border-[#00E5FF] transition-colors resize-none" placeholder="¿En qué podemos ayudarte?"></textarea>
                                </div>
                                
                                <button className="eter-cta w-full py-5 text-sm font-black uppercase italic tracking-tighter flex items-center justify-center gap-3">
                                    ENVIAR SOLICITUD <Send size={18} />
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Support Metrics */}
            <section className="py-20 bg-black/40 border-y border-white/5 px-5 md:px-10">
                <div className="mx-auto max-w-[1440px] grid gap-8 sm:grid-cols-3">
                    <div className="flex flex-col items-center text-center">
                        <Clock className="mb-4 text-[#C6FF00]" size={32} strokeWidth={1} />
                        <h4 className="font-black uppercase text-xs tracking-widest text-white mb-2">Respuesta Promedio</h4>
                        <p className="text-2xl font-black text-[#C6FF00]">15 MIN</p>
                        <p className="text-[10px] text-white/30 uppercase mt-1">Vía WhatsApp Business</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <HeadphonesIcon className="mb-4 text-[#00E5FF]" size={32} strokeWidth={1} />
                        <h4 className="font-black uppercase text-xs tracking-widest text-white mb-2">Atención al Revendedor</h4>
                        <p className="text-2xl font-black text-[#00E5FF]">24/7</p>
                        <p className="text-[10px] text-white/30 uppercase mt-1">Soporte estratégico permanente</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <Globe2 className="mb-4 text-[#7A00FF]" size={32} strokeWidth={1} />
                        <h4 className="font-black uppercase text-xs tracking-widest text-white mb-2">Envios a todo el país</h4>
                        <p className="text-2xl font-black text-[#7A00FF]">LOGÍSTICA TOTAL</p>
                        <p className="text-[10px] text-white/30 uppercase mt-1">Desde Mar del Plata a tu puerta</p>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
