'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
    Sparkles, 
    Trophy, 
    Star, 
    History, 
    Box, 
    ShieldCheck, 
    Zap,
    ArrowRight,
    TrendingUp,
    Anchor
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const easeOut = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0 },
};

const STATS = [
    { label: 'Colecciones', value: '18+', icon: Sparkles, color: 'cyan' },
    { label: 'Revendedores', value: '500+', icon: Trophy, color: 'green' },
    { label: 'Satisfacción', value: '99%', icon: Star, color: 'purple' },
    { label: 'Años Elite', value: '5', icon: History, color: 'cyan' },
];

export default function AboutPage() {
    return (
        <main className="flex flex-col min-h-screen overflow-x-hidden bg-[#050505] text-white selection:bg-[#00E5FF] selection:text-black">
            <Navbar />
            
            {/* Hero Section */}
            <section className="relative z-0 overflow-hidden pt-40 pb-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(122,0,255,0.1),transparent_50%),radial-gradient(circle_at_20%_80%,rgba(0,229,255,0.05),transparent_40%)]" />
                <div className="grunge-overlay opacity-30" />
                
                <div className="mx-auto max-w-[1440px] px-5 md:px-10">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        transition={{ staggerChildren: 0.1 }}
                        className="relative z-10 text-center"
                    >
                        <motion.div variants={fadeUp} className="mb-6 flex items-center justify-center gap-3">
                            <span className="h-[1px] w-8 bg-white/20" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">El Manifiesto Éter</span>
                            <span className="h-[1px] w-8 bg-white/20" />
                        </motion.div>
                        
                        <motion.h1 variants={fadeUp} className="mb-10 text-5xl font-black uppercase leading-[0.9] tracking-tighter sm:text-7xl md:text-9xl italic">
                            CALZADO <br /> CON <span className="text-tri-gradient drop-shadow-[0_0_40px_rgba(0,229,255,0.2)]">CALLE.</span>
                        </motion.h1>
                        
                        <motion.p variants={fadeUp} className="mx-auto mb-12 max-w-2xl text-lg font-medium leading-relaxed text-white/60">
                            Nacimos en Mar del Plata con una misión clara: democratizar el calzado de elite. 
                            Curamos lo mejor del calzado brasilero para que vos solo te ocupes de vender.
                        </motion.p>
                    </motion.div>
                </div>

                {/* Floating Elements */}
                <motion.div 
                    animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="paint-splatter splat-cyan -left-20 top-40 opacity-10 blur-xl"
                />
            </section>

            {/* Metrics Grid */}
            <section className="relative z-10 px-5 md:px-10">
                <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/5 bg-white/5 lg:grid-cols-4">
                    {STATS.map((stat, i) => (
                        <div key={stat.label} className="group relative bg-[#050505] p-10 text-center transition-colors hover:bg-white/[0.02]">
                            <stat.icon className={`mx-auto mb-6 h-8 w-8 ${stat.color === 'cyan' ? 'text-[#00E5FF]' : stat.color === 'green' ? 'text-[#C6FF00]' : 'text-[#7A00FF]'}`} />
                            <div className="text-4xl font-black italic tracking-tighter text-white">{stat.value}</div>
                            <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-white/40">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Narrative Section - The Craft */}
            <section className="relative z-0 py-32 px-5 md:px-10 overflow-hidden">
                <div className="mx-auto max-w-[1440px] grid lg:grid-cols-2 gap-20 items-center">
                    <div className="relative">
                        <div className="absolute -left-10 -top-10 text-9xl font-black text-white/[0.02] select-none">01</div>
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative z-10"
                        >
                            <h2 className="text-4xl font-black uppercase tracking-tighter sm:text-6xl text-white mb-8">
                                DIRECTO DE FÁBRICA <br/>AL <span className="text-[#00E5FF]">ASFALTO.</span>
                            </h2>
                            <p className="text-xl text-white/50 leading-relaxed mb-10">
                                En ÉTER eliminamos las vueltas. Importamos directamente desde Brasil, auditamos cada par en Mar del Plata y lo ponemos en tus manos (o en las de tu cliente) en tiempo récord. Calidad G5/OG: lo que ves es lo que entregás.
                            </p>
                            
                            <div className="grid gap-6">
                                {[
                                    { icon: ShieldCheck, title: 'ÉTER Certified™', text: 'Protocolo de validación de materiales y construcción.' },
                                    { icon: Box, title: 'Packaging Elite', text: 'Una experiencia de unboxing que eleva el valor de tu marca.' },
                                    { icon: Zap, title: 'Trading Activo', text: 'Actualización diaria de stock para una reventa ágil.' }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-5 items-start p-6 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors group">
                                        <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10 group-hover:border-[#00E5FF]/40">
                                            <item.icon className="h-5 w-5 text-[#00E5FF]" />
                                        </div>
                                        <div>
                                            <h4 className="font-black uppercase text-sm text-white">{item.title}</h4>
                                            <p className="text-sm text-white/40">{item.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    <div className="relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative aspect-square lg:aspect-[4/5] rounded-3xl overflow-hidden eter-card border-none"
                        >
                            <Image 
                                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200" 
                                alt="Production Quality" 
                                fill 
                                className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                            <div className="absolute bottom-10 left-10">
                                <h3 className="text-2xl font-black italic uppercase text-[#00E5FF]">Cultura Productiva</h3>
                                <p className="text-xs text-white/60 uppercase tracking-widest mt-2 transition-opacity group-hover:opacity-100">Directo de fábrica · Mar del Plata Hub</p>
                            </div>
                        </motion.div>
                        <div className="paint-splatter splat-purple -right-20 top-20 opacity-20 -z-10" />
                    </div>
                </div>
            </section>

            {/* Strategic Anchored Values */}
            <section className="relative z-0 py-32 px-5 md:px-10 bg-black/40">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-16">NUESTRA <span className="text-[#C6FF00]">BRÚJULA.</span></h2>
                    
                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            { icon: TrendingUp, title: 'Crecimiento', text: 'Buscamos que tu negocio crezca con nosotros, no solo que compres mercadería.' },
                            { icon: Anchor, title: 'Transparencia', text: 'Precios honestos, stock real y logística trazable en cada paso.' },
                            { icon: Sparkles, color: 'cyan', title: 'Excelencia', text: 'Lo mejor o nada. No hay término medio en el catálogo de ÉTER.' }
                        ].map((v, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <div className="mb-6 h-12 w-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:border-[#00E5FF]/40">
                                    <v.icon className={`h-6 w-6 text-${v.color === 'cyan' ? '[#00E5FF]' : 'white'}`} />
                                </div>
                                <h4 className="text-lg font-black uppercase mb-4">{v.title}</h4>
                                <p className="text-sm text-white/40 leading-relaxed">{v.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Vision Call to Action */}
            <section className="py-40 px-5 md:px-10 relative overflow-hidden">
                <div className="mx-auto max-w-[1440px] text-center relative z-10">
                    <h2 className="text-5xl font-black uppercase tracking-tighter mb-8 sm:text-7xl italic">
                        DOMINÁ EL <br /><span className="text-[#00E5FF]">RETAIL URBANO.</span>
                    </h2>
                    <p className="max-w-2xl mx-auto text-white/50 text-lg mb-12">
                        De Mar del Plata al país entero. Unite a la red de reventa más potente de la región. Sin vueltas, sin inversión, solo ventas.
                    </p>
                    <Link href="/register" className="eter-cta mx-auto flex h-16 max-w-xs items-center justify-center gap-3 text-sm font-black uppercase italic italic">
                        ENTRAR AL ECOSISTEMA <ArrowRight size={20} />
                    </Link>
                </div>
                {/* Visual accents */}
                <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#7A00FF]/5 blur-[120px]" />
            </section>

            <Footer />
        </main>
    );
}
