'use client';

import * as React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Instagram, MapPin, Send, ChevronDown } from 'lucide-react';
import { PreviewHeader } from '@/components/landing/primitives/PreviewHeader';
import { PreviewFooter } from '@/components/landing/primitives/PreviewFooter';
import { WhatsAppFloatingButton } from '@/components/layout/WhatsAppFloatingButton';

const FAQ_ITEMS = [
    {
        q: '¿Cómo son los envíos y cuánto tardan?',
        a: 'Despachamos de lunes a sábados por Andreani y Correo Argentino directo desde Mar del Plata. El tiempo promedio de entrega es de 24 a 48 horas hábiles en provincia de Buenos Aires y 48 a 72 horas al resto del país. Te enviamos el código de seguimiento online apenas sale.',
    },
    {
        q: '¿Qué pasa si el calzado no me va de talle?',
        a: 'Tenés cambio garantizado. Nos escribís a WhatsApp, coordinamos el retorno del par y te enviamos el número correcto sin complicaciones. Cada par pasa control de calidad previo.',
    },
    {
        q: '¿Cómo empiezo a revender si no tengo experiencia?',
        a: 'Nos escribís a WhatsApp indicando que querés revender. Te enviamos el catálogo mayorista con fotos reales para que puedas publicar en tus redes y te damos acceso a la guía de venta inicial.',
    },
    {
        q: '¿Tienen local a la calle o se puede retirar?',
        a: 'Operamos con centro logístico y depósito central en Mar del Plata. Se pueden coordinar entregas y retiros puntuales en la ciudad previa confirmación por WhatsApp.',
    },
];

export default function ContactPage() {
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const text = `Hola ÉTER, mi nombre es ${name || 'Cliente'} y quisiera consultar: ${message}`;
        window.open(`https://wa.me/5492236204002?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="relative min-h-screen w-full bg-[#050505] text-white selection:bg-[#39FF14] selection:text-black">
            
            {/* Lateral Neon Green Lines */}
            <div className="fixed top-0 bottom-0 left-0 w-[1.5px] bg-[#39FF14] shadow-[0_0_8px_#39FF14] z-40 pointer-events-none" />
            <div className="fixed top-0 bottom-0 right-0 w-[1.5px] bg-[#39FF14] shadow-[0_0_8px_#39FF14] z-40 pointer-events-none" />

            {/* Fixed Header */}
            <PreviewHeader />

            <main className="pt-28 sm:pt-36 pb-20">
                
                {/* ── 1. CONTACT HERO ── */}
                <section className="px-4 sm:px-8 md:px-12 max-w-7xl mx-auto mb-16 sm:mb-24">
                    <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-10">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-white/60 hover:text-[#39FF14] transition-colors"
                        >
                            <ArrowLeft size={15} /> VOLVER AL INICIO
                        </Link>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#39FF14]">
                            ● RESPUESTA HUMANA DIRECTA
                        </span>
                    </div>

                    <div className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#39FF14] mb-3 flex items-center gap-2">
                        <span>ACTO 04 // CANALES OFICIALES</span>
                        <span className="text-white/20">|</span>
                        <span className="text-white/50">MAR DEL PLATA</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase italic tracking-tighter text-white leading-[0.9]">
                        CONTACTO <br />
                        <span className="text-white/35 not-italic font-extrabold">DIRECTO.</span>
                    </h1>

                    <div className="relative mt-2 transform -rotate-1">
                        <span
                            className="font-['Rock_Salt',_'Caveat',_'Permanent_Marker',_cursive] text-xl sm:text-3xl md:text-4xl text-[#00E5FF] tracking-wide"
                            style={{ textShadow: '0 0 20px rgba(0,229,255,0.6)' }}
                        >
                            & Atención Humana Sin Vueltas
                        </span>
                    </div>

                    <p className="mt-8 text-base sm:text-xl text-white/80 max-w-3xl font-normal leading-relaxed">
                        Hablamos de forma directa. Ya sea para consultar disponibilidad de un par, coordinar un cambio o sumarte a la red de revendedores, acá tenés nuestros canales oficiales.
                    </p>
                </section>

                {/* ── 2. CARDS DE CANALES DIRECTOS ── */}
                <section className="px-4 sm:px-8 md:px-12 max-w-7xl mx-auto mb-20 sm:mb-28">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        
                        {/* WhatsApp Card */}
                        <a
                            href="https://wa.me/5492236204002?text=Hola%20ÉTER,%20quisiera%20hacer%20una%20consulta"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group rounded-3xl bg-[#090909] border border-white/10 p-8 flex flex-col justify-between space-y-6 hover:border-[#39FF14] hover:bg-[#0c0c0c] transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.7)]"
                        >
                            <div className="space-y-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] group-hover:scale-110 transition-transform">
                                    <MessageCircle size={24} />
                                </div>
                                <h3 className="text-xl font-black uppercase text-white">WhatsApp Oficial</h3>
                                <p className="text-xs sm:text-sm text-white/70 font-normal leading-relaxed">
                                    Canal prioritario para ventas, confirmación de talles y soporte de revendedores.
                                </p>
                            </div>

                            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                <span className="text-xs font-mono font-bold text-[#39FF14]">+54 9 223 620-4002</span>
                                <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
                                    CHATEAR →
                                </span>
                            </div>
                        </a>

                        {/* Instagram Card */}
                        <a
                            href="https://www.instagram.com/eter.mdq"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group rounded-3xl bg-[#090909] border border-white/10 p-8 flex flex-col justify-between space-y-6 hover:border-[#00E5FF] hover:bg-[#0c0c0c] transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.7)]"
                        >
                            <div className="space-y-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] group-hover:scale-110 transition-transform">
                                    <Instagram size={24} />
                                </div>
                                <h3 className="text-xl font-black uppercase text-white">Instagram Oficial</h3>
                                <p className="text-xs sm:text-sm text-white/70 font-normal leading-relaxed">
                                    Fotos en mano, unboxings de la comunidad, lanzamientos y drops exclusivos.
                                </p>
                            </div>

                            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                <span className="text-xs font-mono font-bold text-[#00E5FF]">@eter.mdq</span>
                                <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
                                    SEGUIR →
                                </span>
                            </div>
                        </a>

                        {/* Location Card */}
                        <div className="rounded-3xl bg-[#090909] border border-white/10 p-8 flex flex-col justify-between space-y-6 shadow-[0_10px_30px_rgba(0,0,0,0.7)]">
                            <div className="space-y-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/70">
                                    <MapPin size={24} />
                                </div>
                                <h3 className="text-xl font-black uppercase text-white">Hub Mar del Plata</h3>
                                <p className="text-xs sm:text-sm text-white/70 font-normal leading-relaxed">
                                    Base operativa, almacenamiento físico y empaque para despachos nacionales.
                                </p>
                            </div>

                            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                <span className="text-xs font-mono text-white/60">Buenos Aires · Argentina</span>
                                <span className="text-[10px] font-mono uppercase text-[#39FF14]">STOCK REAL</span>
                            </div>
                        </div>

                    </div>
                </section>

                {/* ── 3. FORMULARIO RÁPIDO & FAQ ── */}
                <section className="px-4 sm:px-8 md:px-12 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        
                        {/* Left: Mensaje Rápido por WhatsApp */}
                        <div className="lg:col-span-5 rounded-3xl bg-[#090909] border border-white/10 p-6 sm:p-8 space-y-6">
                            <div className="space-y-2">
                                <div className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#39FF14]">
                                    // CONSULTA RÁPIDA
                                </div>
                                <h2 className="text-2xl font-black uppercase italic text-white">
                                    Envianos tu Mensaje
                                </h2>
                                <p className="text-xs text-white/60">
                                    Completá tus datos y te redirigimos al WhatsApp con el mensaje pre-cargado para atenderte al instante.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-mono uppercase tracking-wider text-white/50">Tu Nombre:</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej. Martín"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full rounded-xl bg-[#121212] border border-white/10 px-4 py-3 text-xs font-mono text-white focus:border-[#39FF14] focus:outline-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-mono uppercase tracking-wider text-white/50">¿Qué te gustaría consultar?:</label>
                                    <textarea
                                        required
                                        rows={4}
                                        placeholder="Ej. Quiero saber disponibilidad del Dunk Low en talle 41 y costo de envío a Córdoba."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="w-full rounded-xl bg-[#121212] border border-white/10 px-4 py-3 text-xs font-mono text-white focus:border-[#39FF14] focus:outline-none resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#39FF14] px-6 py-3.5 text-xs font-mono font-black uppercase tracking-widest text-black hover:bg-white transition-all shadow-[0_0_20px_rgba(57,255,20,0.3)]"
                                >
                                    <Send size={14} /> ENVIAR POR WHATSAPP
                                </button>
                            </form>
                        </div>

                        {/* Right: FAQ Acordeón */}
                        <div className="lg:col-span-7 space-y-4">
                            <div className="mb-6 space-y-2">
                                <div className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#39FF14]">
                                    // PREGUNTAS FRECUENTES
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-black uppercase italic text-white">
                                    Dudas Resueltas Sin Vueltas
                                </h2>
                            </div>

                            <div className="space-y-3">
                                {FAQ_ITEMS.map((faq, idx) => {
                                    const isOpen = openFaq === idx;
                                    return (
                                        <div
                                            key={faq.q}
                                            onClick={() => setOpenFaq(isOpen ? null : idx)}
                                            className={`rounded-2xl border transition-all duration-300 cursor-pointer p-5 ${
                                                isOpen
                                                    ? 'bg-[#0c0c0c] border-[#39FF14]/50'
                                                    : 'bg-[#090909] border-white/10 hover:border-white/25'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <h3 className={`text-sm sm:text-base font-bold transition-colors ${isOpen ? 'text-[#39FF14]' : 'text-white'}`}>
                                                    {faq.q}
                                                </h3>
                                                <ChevronDown
                                                    size={18}
                                                    className={`text-white/40 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#39FF14]' : ''}`}
                                                />
                                            </div>

                                            {isOpen && (
                                                <p className="mt-3 text-xs sm:text-sm text-white/70 leading-relaxed font-normal pt-2 border-t border-white/5 animate-fadeIn">
                                                    {faq.a}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </section>

            </main>

            {/* Footer & WhatsApp Floating */}
            <PreviewFooter />
            <WhatsAppFloatingButton />
        </div>
    );
}
