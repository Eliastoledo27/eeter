'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Users,
    MessageSquare,
    Zap,
    Trophy,
    Target,
    ShieldCheck,
    Globe,
    Cpu,
    Sparkles,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const easeOut = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0 },
};

const stagger = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.09,
            delayChildren: 0.08,
        },
    },
};

const communityMetrics = [
    { icon: Users, value: '+500', label: 'Revendedores', sub: 'En red' },
    { icon: Globe, value: 'MDQ Hub', label: 'Operación', sub: 'Mar del Plata' },
    { icon: Trophy, value: 'Margen', label: 'Propio', sub: 'Ganancia real' },
    { icon: MessageSquare, value: '24/7', label: 'Soporte', sub: 'Grupo WhatsApp' },
];

const pillars = [
    {
        icon: Cpu,
        title: 'Tecnología de Punta',
        text: 'Acceso a herramientas de gestión que automatizan tu catálogo y pedidos. Enfocate en vender, nosotros hacemos el resto.',
        color: 'cyan'
    },
    {
        icon: Target,
        title: 'Estrategias de Escala',
        text: 'Marketing assets de alta calidad y mentoría en pauta para que tu negocio no tenga techo geográfico.',
        color: 'purple'
    },
    {
        icon: ShieldCheck,
        title: 'Respaldo ÉTER',
        text: 'Cada miembro cuenta con la garantía de autenticidad absoluta y la logística más rápida del país.',
        color: 'green'
    },
    {
        icon: Sparkles,
        title: 'Eventos Exclusivos',
        text: 'Drops limitados solo para la comunidad y encuentros presenciales de Networking de alto nivel.',
        color: 'cyan'
    }
];

const steps = [
    { name: 'Publicación', detail: 'Subí los modelos a tus redes con tu margen de ganancia.', border: 'border-white/10' },
    { name: 'Consulta', detail: 'Confirmá stock y talle con nosotros antes de cerrar con el cliente.', border: 'border-[#00E5FF]/30' },
    { name: 'Cierre', detail: 'Tomás los datos, coordinamos la entrega y te quedás con tu ganancia.', border: 'border-[#7A00FF]/50' },
];

export default function CommunityPage() {
    return (
        <main className="flex flex-col min-h-screen overflow-x-hidden bg-[#050505] text-white selection:bg-[#00E5FF] selection:text-black">
            <Navbar />
            
            {/* Hero Section */}
            <section className="relative z-0 overflow-hidden pt-32 pb-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(0,229,255,0.15),transparent_50%),radial-gradient(circle_at_80%_40%,rgba(122,0,255,0.1),transparent_40%)]" />
                
                <div className="mx-auto max-w-[1440px] px-5 md:px-10">
                    <motion.div initial="hidden" animate="visible" variants={stagger} className="relative z-10 text-center">
                        <motion.div variants={fadeUp} transition={{ duration: 0.75, ease: easeOut }} className="mb-6 flex items-center justify-center gap-3">
                            <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#00E5FF]" />
                            <span className="text-sm font-black uppercase tracking-[0.3em] text-[#00E5FF]">El Ecosistema Elite</span>
                            <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#00E5FF]" />
                        </motion.div>
                        
                        <motion.h1 variants={fadeUp} transition={{ duration: 0.85, ease: easeOut }} className="mb-8 text-5xl font-black uppercase leading-none tracking-tight sm:text-7xl md:text-8xl">
                            MÁS QUE UNA TIENDA.<br />
                            <span className="text-tri-gradient drop-shadow-[0_0_35px_rgba(0,229,255,0.3)]">UN ESTILO DE VIDA.</span>
                        </motion.h1>
                        
                        <motion.p variants={fadeUp} transition={{ duration: 0.75, ease: easeOut }} className="mx-auto mb-12 max-w-3xl text-lg font-medium leading-relaxed text-white/60 md:text-xl">
                            Unite a la red de reventa de calzado premium más sólida de Argentina. 
                            Tecnología aplicada al trading de sneakers y un equipo que respalda cada una de tus ventas.
                        </motion.p>
                        
                        <motion.div variants={fadeUp} transition={{ duration: 0.75, ease: easeOut }} className="flex flex-col items-center justify-center gap-6 sm:flex-row">
                            <Link href="/register" className="eter-cta flex h-14 items-center justify-center gap-3 px-12 text-sm font-black uppercase italic shadow-[0_0_30px_rgba(0,229,255,0.2)]">
                                SOLICITAR ACCESO <ArrowRight size={20} />
                            </Link>
                            <Link href="#mastermind" className="eter-outline-cta px-10 py-4 text-[11px] font-black uppercase tracking-widest">
                                EXPLORAR BENEFICIOS
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Aesthetic Splatters */}
                <div className="paint-splatter splat-cyan -left-20 top-40 opacity-20 blur-[2px]" />
                <div className="paint-splatter splat-purple -right-10 bottom-20 opacity-15" />
            </section>

            {/* Metrics Bar */}
            <section className="relative z-10 px-5 md:px-10 -mt-10">
                <div className="eter-card mx-auto grid max-w-[1440px] grid-cols-2 overflow-hidden lg:grid-cols-4">
                    {communityMetrics.map(({ icon: Icon, value, label, sub }, index) => (
                        <div key={label} className="group relative flex items-center gap-5 border-white/10 px-8 py-8 even:border-l lg:border-l lg:first:border-l-0">
                            <Icon className="h-10 w-10 text-[#00E5FF]" strokeWidth={1.5} />
                            <div>
                                <div className="text-3xl font-black text-white">{value}</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-[#00E5FF]">{label}</div>
                                <div className="text-[9px] uppercase tracking-wider text-white/40">{sub}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pillars / Benefits */}
            <section id="mastermind" className="relative z-0 bg-[#050505] px-5 py-32 md:px-10">
                <div className="mx-auto max-w-[1440px]">
                    <div className="mb-20 text-center">
                        <h2 className="text-3xl font-black uppercase tracking-tight sm:text-5xl">LOS PILARES DEL <span className="text-[#C6FF00]">ÉXITO</span></h2>
                        <div className="mx-auto mt-4 h-1 w-24 bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent" />
                    </div>
                    
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {pillars.map((pillar, i) => (
                            <motion.div
                                key={pillar.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group eter-card relative p-8 transition-all hover:border-[#00E5FF]/50"
                            >
                                <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-${pillar.color === 'cyan' ? '[#00E5FF]' : pillar.color === 'purple' ? '[#7A00FF]' : '[#C6FF00]'}/10`}>
                                    <pillar.icon className={`h-6 w-6 text-${pillar.color === 'cyan' ? '[#00E5FF]' : pillar.color === 'purple' ? '[#7A00FF]' : '[#C6FF00]'}`} />
                                </div>
                                <h3 className="mb-4 text-lg font-black uppercase tracking-tight text-white">{pillar.title}</h3>
                                <p className="text-sm leading-relaxed text-white/50">{pillar.text}</p>
                                <div className="absolute -bottom-1 -right-1 h-8 w-8 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                                    <div className="h-[1px] w-full bg-gradient-to-r from-transparent to-[#00E5FF]" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Levels Section */}
            <section className="relative z-0 bg-black/40 py-32 px-5 md:px-10">
                <div className="grunge-overlay opacity-30" />
                <div className="mx-auto max-w-[1440px]">
                    <div className="mb-16 grid items-end gap-8 md:grid-cols-2">
                        <div>
                            <p className="mb-2 text-sm font-black uppercase tracking-[0.2em] text-[#7A00FF]">El Sistema</p>
                            <h2 className="text-4xl font-black uppercase leading-none sm:text-6xl text-white">VENDÉ<br/><span className="text-[#00E5FF]">SIN VUELTAS.</span></h2>
                        </div>
                        <p className="text-white/50 max-w-sm">No hay niveles, no hay comisiones fijas. Vos decidís cuánto ganar en cada par. Nosotros nos ocupamos de que el calzado llegue perfecto.</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {steps.map((step, i) => (
                            <div 
                                key={step.name} 
                                className={`eter-card p-10 relative overflow-hidden group ${step.border} hover:bg-white/[0.02] transition-colors`}
                            >
                                <div className="absolute -right-8 -top-8 text-8xl font-black text-white/[0.03] italic">{i + 1}</div>
                                <h4 className={`text-2xl font-black uppercase tracking-tighter ${i === 2 ? 'text-[#7A00FF]' : i === 1 ? 'text-[#00E5FF]' : 'text-white'}`}>{step.name}</h4>
                                <div className="mt-8 mb-10 h-[1px] w-12 bg-white/10 group-hover:w-full transition-all duration-700" />
                                <p className="text-sm font-medium text-white/70">{step.detail}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA focused on Community */}
            <section className="relative z-0 overflow-hidden border-y border-white/5 bg-[#050505] py-32 px-5 md:px-10">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00E5FF]/50 to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(122,0,255,0.05),transparent_70%)]" />
                
                <div className="relative z-10 mx-auto max-w-4xl text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2"
                    >
                        <Zap size={14} className="text-[#C6FF00]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Últimas 12 vacantes disponibles</span>
                    </motion.div>
                    
                    <h2 className="mb-8 text-4xl font-black uppercase leading-none sm:text-6xl">PASA AL SIGUIENTE NIVEL <span className="text-[#00E5FF]">CON NOSOTROS.</span></h2>
                    <p className="mx-auto mb-12 max-w-2xl text-lg text-white/50">
                        El ecosistema ÉTER está diseñado para que tu única preocupación sea el crecimiento. 
                        Nosotros ponemos la tecnología, los productos y el soporte. Vos ponés la visión.
                    </p>
                    
                    <Link href="/register" className="eter-cta mx-auto flex h-16 max-w-md items-center justify-center gap-4 text-lg font-black uppercase italic tracking-tight">
                        UNIRME AL MASTERMIND <ArrowRight size={24} />
                    </Link>
                </div>
            </section>

            <Footer />
        </main>
    );
}
