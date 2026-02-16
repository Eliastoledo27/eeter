'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { Sparkles, Trophy, Star, History } from 'lucide-react';
import Image from 'next/image';

const STATS = [
    { label: 'Colecciones', value: '12+', icon: Sparkles },
    { label: 'Vendedores', value: '500+', icon: Trophy },
    { label: 'Satisfacción', value: '99%', icon: Star },
    { label: 'Años', value: '5', icon: History },
];

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#C88A04] selection:text-black overflow-x-hidden">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-60 pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-radial-gradient from-[#C88A04]/10 to-transparent blur-3xl opacity-50" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(200,138,4,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(200,138,4,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] opacity-30" />
                </div>

                <div className="container relative z-10 px-6 mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <span className="px-4 py-2 rounded-full border border-[#C88A04]/30 bg-[#C88A04]/5 text-[#C88A04] text-[10px] font-black tracking-[0.3em] uppercase mb-8 inline-block">
                            Ecosistema Éter
                        </span>
                        <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter uppercase leading-none">
                            REDEFINIENDO EL <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C88A04] to-[#ECA413]">CALZADO DIGITAL</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
                            No solo vendemos zapatillas. Construimos una plataforma donde cualquier persona puede iniciar su negocio premium de calzado brasilero con riesgo cero.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Stats Grid */}
            <section className="py-24 border-t border-white/5 bg-white/[0.01]">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {STATS.map((stat, idx) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex flex-col items-center text-center p-8 rounded-[2rem] border border-white/5 bg-black/40 hover:border-[#C88A04]/30 transition-all group"
                            >
                                <stat.icon className="text-[#C88A04] mb-4 group-hover:scale-110 transition-transform" size={32} />
                                <span className="text-4xl md:text-5xl font-black mb-2 text-white">{stat.value}</span>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* History / Vision Section */}
            <section className="py-32 relative overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="space-y-8"
                        >
                            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none uppercase">
                                LA VISIÓN <br /> <span className="text-gray-400">DETRÁS DE</span> <br /> CADA PAR.
                            </h2>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                Nacimos de la necesidad de democratizar el acceso a productos de alta gama. Seleccionamos cuidadosamente cada modelo en las mejores fábricas de Brasil para asegurar una calidad que el pie argentino merece.
                            </p>
                            <div className="space-y-4">
                                {['Calidad Brasilera Certificada', 'Packaging de Lujo', 'Envío Express a todo el país'].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-[#C88A04]">
                                        <div className="w-2 h-2 rounded-full bg-[#C88A04]" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/10"
                        >
                            <Image
                                src="https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=1200"
                                alt="Éter Vision"
                                fill
                                className="object-cover opacity-60"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                        </motion.div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}