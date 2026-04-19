'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, Server, RefreshCw, Smartphone } from 'lucide-react';

export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#00E5FF] selection:text-black overflow-x-hidden">
            <Navbar />

            {/* Header Section */}
            <section className="relative pt-40 pb-20 px-6 lg:px-12 flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-radial-gradient from-[#00E5FF]/5 to-transparent blur-[120px] pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-4xl relative z-10"
                >
                    <span className="inline-block px-4 py-1 bg-[#00E5FF]/20 border border-[#00E5FF]/30 text-[#00E5FF] text-[10px] font-black tracking-[0.3em] uppercase rounded-full mb-8">
                        Legal Protocol v2.1
                    </span>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-none uppercase italic">
                        Política de <span className="text-[#00E5FF]">Privacidad</span>
                    </h1>

                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light">
                        En ÉTER, la seguridad de tus datos es nuestra prioridad fundamental.
                        Este protocolo detalla cómo protegemos y gestionamos tu información personal.
                    </p>
                </motion.div>
            </section>

            {/* Content Section */}
            <section className="py-24 border-t border-white/5 bg-[#050505] px-6 lg:px-12">
                <div className="max-w-4xl mx-auto space-y-20">

                    {/* Grid of Principles */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                        <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-[#00E5FF]/30 transition-all group">
                            <Lock className="text-[#00E5FF] mb-6 group-hover:scale-110 transition-transform" size={32} />
                            <h3 className="font-bold text-lg mb-2 tracking-tight">Encriptación</h3>
                            <p className="text-gray-500 text-sm">Tus datos bancarios y personales se procesan bajo protocolos SSL/TLS de 256 bits.</p>
                        </div>
                        <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-[#00E5FF]/30 transition-all group">
                            <Eye className="text-[#00E5FF] mb-6 group-hover:scale-110 transition-transform" size={32} />
                            <h3 className="font-bold text-lg mb-2 tracking-tight">Transparencia</h3>
                            <p className="text-gray-500 text-sm">Nunca vendemos tus datos a terceros. Los usamos solo para mejorar tu experiencia.</p>
                        </div>
                        <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-[#00E5FF]/30 transition-all group">
                            <Smartphone className="text-[#00E5FF] mb-6 group-hover:scale-110 transition-transform" size={32} />
                            <h3 className="font-bold text-lg mb-2 tracking-tight">Control</h3>
                            <p className="text-gray-500 text-sm">Tienes el derecho de solicitar la eliminación total de tus datos en cualquier momento.</p>
                        </div>
                    </div>

                    {/* Detailed Clauses */}
                    <div className="space-y-16">
                        <Clause
                            icon={<Server size={24} />}
                            title="1. Recopilación de Información"
                            content="Recopilamos información necesaria para el procesamiento de pedidos, como nombre, dirección de envío, correo electrónico y número de teléfono. También recolectamos datos de navegación de forma anónima para optimizar el rendimiento del sitio."
                        />
                        <Clause
                            icon={<ShieldCheck size={24} />}
                            title="2. Uso de los Datos"
                            content="Toda la información es utilizada para: (a) Procesar transacciones, (b) Enviar actualizaciones sobre el estado del pedido, (c) Personalizar tu experiencia en el catálogo de productos y (d) Enviar ofertas exclusivas si has optado por recibirlas."
                        />
                        <Clause
                            icon={<RefreshCw size={24} />}
                            title="3. Cookies y Seguimiento"
                            content="Utilizamos cookies para recordar los artículos en tu carrito de compras y comprender tus preferencias de navegación. Puedes desactivar las cookies en la configuración de tu navegador, aunque esto puede afectar algunas funciones de la tienda."
                        />
                    </div>

                    <div className="p-12 bg-white/[0.01] border border-dashed border-white/10 rounded-[3rem] text-center">
                        <h4 className="font-black text-2xl mb-4 italic uppercase tracking-tighter">¿Dudas sobre tus datos?</h4>
                        <p className="text-gray-400 mb-8 max-w-lg mx-auto">Nuestro equipo de soporte legal está disponible para responder cualquier inquietud sobre nuestra política.</p>
                        <a href="/support" className="inline-block px-10 py-4 bg-[#00E5FF] hover:bg-[#00B8D9] text-black font-black uppercase tracking-widest text-xs rounded-full transition-all transform hover:scale-105">
                            Contactar Soporte
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}

function Clause({ icon, title, content }: { icon: React.ReactNode, title: string, content: string }) {
    return (
        <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="size-14 rounded-2xl bg-white/5 flex items-center justify-center text-[#00E5FF] shrink-0 border border-white/10">
                {icon}
            </div>
            <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-white uppercase italic">{title}</h2>
                <p className="text-gray-400 leading-relaxed text-lg font-light">
                    {content}
                </p>
            </div>
        </div>
    );
}
