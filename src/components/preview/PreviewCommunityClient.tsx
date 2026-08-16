'use client';

import * as React from 'react';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, CheckCircle2, TrendingUp, Users, Sparkles, BookOpen, MessageCircle, ShieldCheck } from 'lucide-react';
import { PreviewHeader } from '@/components/landing/primitives/PreviewHeader';
import { PreviewFooter } from '@/components/landing/primitives/PreviewFooter';
import { WhatsAppFloatingButton } from '@/components/layout/WhatsAppFloatingButton';

const COMMUNITY_PROOFS = [
    {
        number: '01',
        title: 'CADA VEZ SOMOS MÁS',
        subtitle: 'Clientes y revendedores reales',
        image: '/images/comunidad-01.png',
        tag: 'Red Nacional',
    },
    {
        number: '02',
        title: 'DE ACÁ A TU PUERTA',
        subtitle: 'Despachos diarios con Andreani',
        image: '/images/comunidad-02.png',
        tag: 'Salidas 24/48hs',
    },
    {
        number: '03',
        title: 'MIRÁ LO QUE TE LLEVÁS',
        subtitle: 'Unboxings reales en mano',
        image: '/images/comunidad-03.png',
        tag: 'Calidad 100% Real',
    },
    {
        number: '04',
        title: 'OTROS YA ARRANCARON',
        subtitle: 'Showrooms y tiendas locales',
        image: '/images/comunidad-04.png',
        tag: 'Historias Reales',
    },
    {
        number: '05',
        title: 'COMPRÁ TRANQUILO',
        subtitle: 'Atención y cambio de talle',
        image: '/images/comunidad-05.png',
        tag: 'Respaldo WhatsApp',
    },
];

const ACADEMIA_MODULES = [
    {
        number: '01',
        title: 'Contenido Visual que Vende',
        description: 'Cómo usar nuestras fotos y videos de unboxing para publicar en Instagram y TikTok sin necesidad de comprar muestras físicas.',
    },
    {
        number: '02',
        title: 'Cierres Rápidos por WhatsApp',
        description: 'Estructura de mensajes, confirmación de talles y resolución de dudas para cerrar ventas con clientes finales en 3 mensajes.',
    },
    {
        number: '03',
        title: 'Logística & Trazabilidad',
        description: 'Paso a paso de cómo pasar el pedido a nuestro equipo, generar la etiqueta de Andreani y enviarle el tracking a tu cliente.',
    },
    {
        number: '04',
        title: 'Estrategia de Precios & Margen',
        description: 'Cómo fijar tu precio de venta según tu zona y cómo armar combos o promociones para maximizar tu ganancia neta.',
    },
];

export function PreviewCommunityClient() {
    const [pairsPerWeek, setPairsPerWeek] = useState(5);
    const profitPerPair = 15000; // $15.000 ARS average profit per sneaker
    const monthlyProfit = pairsPerWeek * profitPerPair * 4;

    return (
        <div className="relative min-h-screen w-full bg-[#050505] text-white selection:bg-[#39FF14] selection:text-black">
            
            {/* Lateral Neon Green Lines */}
            <div className="fixed top-0 bottom-0 left-0 w-[1.5px] bg-[#39FF14] shadow-[0_0_8px_#39FF14] z-40 pointer-events-none" />
            <div className="fixed top-0 bottom-0 right-0 w-[1.5px] bg-[#39FF14] shadow-[0_0_8px_#39FF14] z-40 pointer-events-none" />

            {/* Fixed Header */}
            <PreviewHeader />

            <main className="pt-28 sm:pt-36 pb-20">
                
                {/* ── 1. COMMUNITY HERO ── */}
                <section className="px-4 sm:px-8 md:px-12 max-w-7xl mx-auto mb-16 sm:mb-24">
                    <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-10">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-white/60 hover:text-[#39FF14] transition-colors"
                        >
                            <ArrowLeft size={15} /> VOLVER AL INICIO
                        </Link>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#39FF14]">
                            ● COMUNIDAD FEDERAL ÉTER
                        </span>
                    </div>

                    <div className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#39FF14] mb-3 flex items-center gap-2">
                        <span>ACTO 03 // ECOSISTEMA & REVENTA</span>
                        <span className="text-white/20">|</span>
                        <span className="text-white/50">NEGOCIO REAL</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase italic tracking-tighter text-white leading-[0.9]">
                        COMUNIDAD <br />
                        <span className="text-white/35 not-italic font-extrabold">& ACADEMIA.</span>
                    </h1>

                    <div className="relative mt-2 transform -rotate-1">
                        <span
                            className="font-['Rock_Salt',_'Caveat',_'Permanent_Marker',_cursive] text-xl sm:text-3xl md:text-4xl text-[#00E5FF] tracking-wide"
                            style={{ textShadow: '0 0 20px rgba(0,229,255,0.6)' }}
                        >
                            & Red Federal de Revendedores
                        </span>
                    </div>

                    <p className="mt-8 text-base sm:text-xl text-white/80 max-w-3xl font-normal leading-relaxed">
                        Vendé calzado urbano de alta rotación con stock físico asegurado. Vos conectás con clientes y fijás tu precio; nosotros verificamos el producto y lo despachamos en 24/48hs.
                    </p>
                </section>

                {/* ── 2. CÓMO FUNCIONA EL MODELO EN 3 PASOS ── */}
                <section className="px-4 sm:px-8 md:px-12 max-w-7xl mx-auto mb-20 sm:mb-28">
                    <div className="border-t border-white/10 pt-12 mb-12">
                        <div className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#39FF14] mb-2">
                            // MODELO DROPSHIPPING DIRECTO
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-black uppercase italic tracking-tight text-white">
                            CÓMO VENDÉS CON ÉTER.
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="rounded-3xl bg-[#090909] border border-white/10 p-8 space-y-4 hover:border-[#39FF14]/50 transition-colors">
                            <span className="text-4xl font-mono font-black text-[#39FF14]">01</span>
                            <h3 className="text-xl font-black uppercase text-white">Elegís del Catálogo</h3>
                            <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-normal">
                                Accedés al catálogo mayorista con fotos reales y talles sincronizados. Publicás en tus redes con tu propio precio de venta.
                            </p>
                        </div>

                        <div className="rounded-3xl bg-[#090909] border border-white/10 p-8 space-y-4 hover:border-[#39FF14]/50 transition-colors">
                            <span className="text-4xl font-mono font-black text-[#39FF14]">02</span>
                            <h3 className="text-xl font-black uppercase text-white">Confirmás el Pedido</h3>
                            <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-normal">
                                Cuando tu cliente te compra, nos pasás los datos por WhatsApp. Cobrás tu ganancia al instante y nos abonás el precio mayorista.
                            </p>
                        </div>

                        <div className="rounded-3xl bg-[#090909] border border-white/10 p-8 space-y-4 hover:border-[#39FF14]/50 transition-colors">
                            <span className="text-4xl font-mono font-black text-[#39FF14]">03</span>
                            <h3 className="text-xl font-black uppercase text-white">Despachamos por Vos</h3>
                            <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-normal">
                                Armamos el paquete y lo despachamos por Andreani o Correo Argentino con código de seguimiento para que tu cliente lo reciba impecable.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ── 3. SIMULADOR DE GANANCIA MENSUAL ── */}
                <section className="px-4 sm:px-8 md:px-12 max-w-7xl mx-auto mb-20 sm:mb-28">
                    <div className="rounded-3xl bg-[#090909] border border-white/10 p-6 sm:p-12">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                            
                            <div className="lg:col-span-6 space-y-6">
                                <div className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#39FF14]">
                                    // CALCULADORA DE MARGEN ESTIMADO
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tight text-white leading-tight">
                                    Simulá tu Ganancia Mensual
                                </h2>
                                <p className="text-xs sm:text-sm text-white/70 font-normal leading-relaxed">
                                    Con un margen promedio de $15.000 ARS por par vendido, fijate cómo escalan tus ingresos mensuales según las ventas semanales que generes.
                                </p>

                                {/* Slider Control */}
                                <div className="space-y-3 pt-4">
                                    <div className="flex items-center justify-between text-xs font-mono">
                                        <span className="text-white/60">Pares vendidos por semana:</span>
                                        <span className="text-base font-black text-[#39FF14]">{pairsPerWeek} pares/semana</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="2"
                                        max="30"
                                        step="1"
                                        value={pairsPerWeek}
                                        onChange={(e) => setPairsPerWeek(Number(e.target.value))}
                                        className="w-full accent-[#39FF14] cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[10px] font-mono text-white/40">
                                        <span>2 pares/sem</span>
                                        <span>15 pares/sem</span>
                                        <span>30 pares/sem</span>
                                    </div>
                                </div>
                            </div>

                            {/* Result Display Box */}
                            <div className="lg:col-span-6 rounded-2xl bg-[#121212] border border-white/10 p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                                <span className="text-xs font-mono uppercase tracking-widest text-white/50">
                                    Ganancia Estimada Neta Mensual
                                </span>
                                <div className="text-4xl sm:text-6xl font-black font-mono text-[#39FF14] drop-shadow-[0_0_25px_rgba(57,255,20,0.4)]">
                                    ${monthlyProfit.toLocaleString('es-AR')}
                                </div>
                                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                                    ({pairsPerWeek * 4} pares vendidos en el mes · margen 100% tuyo)
                                </span>
                                
                                <a
                                    href="https://wa.me/5492236204002?text=Hola%20ÉTER,%20quiero%20empezar%20a%20revender%20calzado"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#39FF14] px-6 py-3 text-xs font-mono font-black uppercase tracking-widest text-black transition-all hover:bg-white hover:scale-105"
                                >
                                    QUIERO EMPEZAR AHORA <ArrowUpRight size={14} />
                                </a>
                            </div>

                        </div>
                    </div>
                </section>

                {/* ── 4. ACADEMIA ÉTER: FORMACIÓN PRÁCTICA ── */}
                <section id="academia" className="px-4 sm:px-8 md:px-12 max-w-7xl mx-auto mb-20 sm:mb-28">
                    <div className="border-t border-white/10 pt-12 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#39FF14] mb-2">
                                // CAPACITACIÓN & SOPORTE OPERATIVO
                            </div>
                            <h2 className="text-3xl sm:text-5xl font-black uppercase italic tracking-tight text-white">
                                ACADEMIA ÉTER.
                            </h2>
                        </div>
                        <p className="text-xs sm:text-sm text-white/70 max-w-md font-normal">
                            No te dejamos solo con una lista de precios. Te enseñamos a vender, armar publicaciones atractivas y cerrar pedidos por WhatsApp.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {ACADEMIA_MODULES.map((mod) => (
                            <div
                                key={mod.number}
                                className="rounded-3xl bg-[#090909] border border-white/10 p-6 sm:p-8 space-y-3 hover:border-[#39FF14]/50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-mono font-black text-[#39FF14]">{mod.number}</span>
                                    <BookOpen size={18} className="text-white/40" />
                                </div>
                                <h3 className="text-lg font-black uppercase text-white">{mod.title}</h3>
                                <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-normal">
                                    {mod.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── 5. GALERÍA DE PRUEBA REAL / UNBOXINGS DE LA COMUNIDAD ── */}
                <section className="px-4 sm:px-8 md:px-12 max-w-7xl mx-auto mb-20">
                    <div className="border-t border-white/10 pt-12 mb-10">
                        <div className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#39FF14] mb-2">
                            // FOTOS REALES EN MANO
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-black uppercase italic tracking-tight text-white">
                            EN LA CALLE.
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
                        {COMMUNITY_PROOFS.map((proof) => (
                            <div
                                key={proof.number}
                                className="group relative flex flex-col rounded-2xl bg-[#090909] border border-white/10 overflow-hidden"
                            >
                                <div className="relative aspect-[4/3] w-full bg-[#0d0d0d] overflow-hidden">
                                    <Image
                                        src={proof.image}
                                        alt={proof.title}
                                        fill
                                        unoptimized
                                        sizes="(max-width: 640px) 100vw, 20vw"
                                        className="object-cover object-center filter brightness-95 contrast-105 transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                                    <span className="absolute bottom-2 left-2 text-[9px] font-mono font-bold uppercase text-[#39FF14] bg-black/80 px-2 py-0.5 rounded">
                                        {proof.tag}
                                    </span>
                                </div>
                                <div className="p-3 bg-[#090909]">
                                    <h4 className="text-xs font-black uppercase text-white line-clamp-1">{proof.title}</h4>
                                    <p className="text-[10px] font-mono text-white/50 mt-0.5">{proof.subtitle}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </main>

            {/* Footer & WhatsApp Floating */}
            <PreviewFooter />
            <WhatsAppFloatingButton />
        </div>
    );
}
