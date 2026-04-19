'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    PackageSearch,
    Share2,
    Wallet,
    Truck,
    ShieldCheck,
    ArrowRight,
    Star,
    Users,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BrandMarquee } from '@/components/catalog/BrandMarquee';
import { GrainOverlay } from '@/components/ui/GrainOverlay';
import { StatsSection } from '@/components/landing/StatsSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { EterCertifiedSection } from '@/components/landing/EterCertifiedSection';
import { DropCalendarSection } from '@/components/landing/DropCalendarSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { Product } from '@/domain/entities/Product';
import { useCatalog } from '@/hooks/useCatalog';

const CURATED_PRODUCTS: Product[] = [
    {
        id: '99739373-1de2-404a-817a-9a092e9f2268',
        name: 'NB SUPER PREMIUM',
        description: 'Máximo rendimiento y estilo con tecnología de amortiguación avanzada.',
        basePrice: 48000,
        images: ['https://tolzrvsykzmvndvomllt.supabase.co/storage/v1/object/public/products/products/1771217183904-9hv6w.jpeg'],
        category: 'Sneakers',
        stockBySize: {},
        totalStock: 75,
        status: 'active',
        createdAt: new Date()
    },
    {
        id: '8b6d3f46-32fd-4414-87fc-cd33771c689f',
        name: 'ADIDAS RESPONSE',
        description: 'Diseño icónico con confort inigualable para el uso diario.',
        basePrice: 48000,
        images: ['https://tolzrvsykzmvndvomllt.supabase.co/storage/v1/object/public/products/products/1771217183908-vt9lxf.jpeg'],
        category: 'Sneakers',
        stockBySize: {},
        totalStock: 8,
        status: 'active',
        createdAt: new Date()
    },
    {
        id: '3caa3822-5309-4fd9-966f-4bb695be761e',
        name: 'ÉTER SLIDE PURE',
        description: 'Simplicidad y confort absoluto para momentos de relax.',
        basePrice: 38000,
        images: ['https://tolzrvsykzmvndvomllt.supabase.co/storage/v1/object/public/products/products/1771217183903-3is6vo.jpeg'],
        category: 'Ojotas',
        stockBySize: {},
        totalStock: 60,
        status: 'active',
        createdAt: new Date()
    },
    {
        id: '1f196f65-2906-45b6-a7e2-e0748df7d9d4',
        name: 'ÉTER PERFORMANCE PRO',
        description: 'La evolución del calzado deportivo. Tracción extrema y ligereza.',
        basePrice: 38000,
        images: ['https://tolzrvsykzmvndvomllt.supabase.co/storage/v1/object/public/products/products/1771217183903-km43ae.jpeg'],
        category: 'Running',
        stockBySize: {},
        totalStock: 5,
        status: 'active',
        createdAt: new Date()
    },
    {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'JORDAN LEGACY',
        description: 'Silhouette clásica con materiales de primera selección.',
        basePrice: 55000,
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&h=600&fit=crop'],
        category: 'Sneakers',
        stockBySize: {},
        totalStock: 30,
        status: 'active',
        createdAt: new Date()
    },
    {
        id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
        name: 'URBAN RUNNER X',
        description: 'Diseñadas para la ciudad. Livianas, resistentes y premium.',
        basePrice: 42000,
        images: ['https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?q=80&w=600&h=600&fit=crop'],
        category: 'Running',
        stockBySize: {},
        totalStock: 50,
        status: 'active',
        createdAt: new Date()
    },
    {
        id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
        name: 'STREET BOOT PRO',
        description: 'Botín urbano de cuero con suela reforzada. Estilo que dura.',
        basePrice: 65000,
        images: ['https://images.unsplash.com/photo-1600269452121-4f2416e55c28?q=80&w=600&h=600&fit=crop'],
        category: 'Botas',
        stockBySize: {},
        totalStock: 20,
        status: 'active',
        createdAt: new Date()
    },
    {
        id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
        name: 'SLIDE COLLECTION 26',
        description: 'La colección de slides más cómoda del año. Imprescindibles.',
        basePrice: 28000,
        images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=600&h=600&fit=crop'],
        category: 'Ojotas',
        stockBySize: {},
        totalStock: 3,
        status: 'active',
        createdAt: new Date()
    },
];

// --- TRUST STRIP ---
const TRUST_ITEMS = [
    '✦ ÉTER CERTIFIED',
    '✦ LOGÍSTICA TOTAL',
    '✦ ENTREGA EXPRESS',
    '✦ +500 REVENDEDORES',
    '✦ SIN INVERSIÓN INICIAL',
    '✦ 100% AUTENTICADO',
    '✦ SOPORTE 24/7',
];

function TrustStrip() {
    const items = [...TRUST_ITEMS, ...TRUST_ITEMS]; // duplicate for seamless loop
    return (
        <div className="w-full overflow-hidden bg-[#00E5FF]/10 border-y border-[#00E5FF]/20 py-2.5">
            <div className="flex whitespace-nowrap animate-marquee">
                {items.map((item, i) => (
                    <span
                        key={i}
                        className="text-[#00E5FF] text-[10px] font-black tracking-[0.4em] uppercase mx-8 shrink-0"
                    >
                        {item}
                    </span>
                ))}
            </div>
        </div>
    );
}

// --- HERO SECTION ---
const HeroSection = ({ products }: { products: Product[] }) => {
    const heroProduct = useMemo(() => {
        if (!products || !products.length) return null;
        return [...products].sort((a, b) => b.basePrice - a.basePrice)[0];
    }, [products]);
    void heroProduct;

    const videoUrl = "https://assets.mixkit.co/videos/preview/mixkit-shoes-on-the-shelves-of-a-fashion-store-14072-large.mp4";
    const stableVideoUrl = videoUrl; 

    return (
        <section className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
            {/* Background video */}
            <motion.div
                initial={{ scale: 1.08 }}
                animate={{ scale: 1 }}
                transition={{ duration: 3, ease: 'easeOut' }}
                className="absolute inset-0 -z-10"
            >
                <video
                    src={stableVideoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />
            </motion.div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-7xl mx-auto pt-24 pb-12">
                {/* Label */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <span className="inline-flex items-center gap-2 px-5 py-2 bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-[10px] font-black tracking-[0.4em] uppercase rounded-full mb-8 backdrop-blur-xl">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
                        Cyan Neon Edition 2026 — Live Drop
                    </span>
                </motion.div>

                {/* Main title */}
                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.35, ease: [0.19, 1, 0.22, 1] }}
                    className="text-[clamp(5rem,18vw,15rem)] font-black tracking-tighter text-white leading-[0.8] select-none mb-2"
                >
                    ÉTER<span className="text-[#00E5FF] italic">.</span>
                </motion.h1>

                {/* Claim line */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="text-[11px] font-black tracking-[0.4em] uppercase text-white/40 mb-8"
                >
                    Calzado Brasilero Premium — Autenticado y Listo para Vender
                </motion.p>

                {/* Description */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.7, ease: [0.19, 1, 0.22, 1] }}
                    className="text-gray-400 text-base md:text-xl max-w-2xl mb-12 font-light leading-relaxed"
                >
                    La ingeniería de precisión se encuentra con la{' '}
                    <span className="text-white font-medium">estética del diseño premium</span>.{' '}
                    Vendé calzado brasilero con logística total incluida.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.9 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full"
                >
                    <Link href="/catalog" className="w-full sm:w-auto">
                        <button
                            data-cursor="cta"
                            className="bg-[#00E5FF] text-black font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_40px_rgba(0,229,255,0.8)] hover:-translate-y-1 transition-all w-full sm:w-auto h-16 px-10 text-sm"
                        >
                            Ver el Catálogo 2026
                        </button>
                    </Link>
                    <Link href="/register" className="w-full sm:w-auto">
                        <Button
                            variant="outline"
                            className="w-full sm:w-auto h-16 px-10 bg-white/[0.04] hover:bg-white/10 text-white border-white/10 font-black tracking-[0.2em] uppercase text-sm rounded-none"
                        >
                            Unirme como Revendedor
                        </Button>
                    </Link>
                </motion.div>

                {/* Mini stats row */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1.1 }}
                    className="flex items-center gap-8 text-center"
                >
                    {[
                        { value: '+500', label: 'Revendedores' },
                        { value: '100%', label: 'Autenticado' },
                        { value: '30-50%', label: 'Margen' },
                    ].map((s, i) => (
                        <React.Fragment key={s.label}>
                            <div>
                                <div className="text-xl font-black text-white">{s.value}</div>
                                <div className="text-[10px] text-gray-600 uppercase tracking-widest">{s.label}</div>
                            </div>
                            {i < 2 && <div className="w-px h-8 bg-white/10" />}
                        </React.Fragment>
                    ))}
                </motion.div>
            </div>

            {/* Section indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
            >
                <div className="flex items-center gap-4 text-[9px] font-black tracking-[0.5em] uppercase text-gray-600">
                    <span>01</span>
                    <div className="w-16 h-px bg-white/10" />
                    <span className="text-[#00E5FF]">07</span>
                </div>
                <div className="w-px h-16 bg-gradient-to-b from-[#00E5FF]/60 to-transparent animate-pulse" />
            </motion.div>
        </section>
    );
};

// --- PRODUCT SHOWCASE ---
const ProductShowcase = ({ products, loading }: { products: Product[]; loading: boolean }) => {
    const showcaseProducts = useMemo(() => {
        if (!products || !products.length) return [];
        return [...products].sort((a, b) => b.basePrice - a.basePrice).slice(0, 8);
    }, [products]);

    if (loading) return (
        <section className="py-24 bg-black">
            <div className="container mx-auto px-6 h-[400px] bg-white/[0.02] animate-pulse" />
        </section>
    );

    return (
        <section className="py-32 bg-black overflow-hidden relative border-t border-white/[0.04]">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00E5FF]/30 to-transparent" />

            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <span className="text-[#00E5FF] tracking-[0.5em] uppercase text-[10px] font-black mb-4 block">
                        Selección 2026
                    </span>
                    <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white uppercase leading-none">
                        The Addictive<br />Flow.
                    </h2>
                    <p className="text-gray-600 text-xs mt-3 tracking-widest uppercase">
                        Mostrando {showcaseProducts.length} de 47 modelos disponibles
                    </p>
                </motion.div>

                <Link
                    href="/catalog"
                    className="group h-14 px-10 bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#00E5FF] hover:text-black hover:border-[#00E5FF] transition-all duration-500 text-[10px] font-black uppercase tracking-[0.3em] text-white gap-3"
                >
                    Ver Colección Completa
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Horizontal scroll cards */}
            <div className="flex gap-6 overflow-x-auto no-scrollbar px-6 lg:px-12 pb-8 snap-x snap-mandatory">
                {showcaseProducts.map((product, idx) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: idx * 0.08 }}
                        viewport={{ once: true }}
                        className="min-w-[300px] md:min-w-[380px] snap-start group flex-shrink-0"
                    >
                        <Link href="/catalog">
                            {/* Image */}
                            <div
                                data-cursor="view"
                                data-cursor-label="VER"
                                className="relative aspect-[4/5] bg-[#0A0A0A] overflow-hidden mb-5 border border-white/[0.05] group-hover:border-[#00E5FF]/40 transition-all duration-700"
                            >
                                <Image
                                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80'}
                                    alt={product.name}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 40vw"
                                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-[1.04]"
                                />
                                {/* Hover overlay with CTA */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute bottom-6 left-6 right-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                    <button className="w-full py-3.5 bg-white text-black text-[9px] font-black uppercase tracking-widest hover:bg-[#00E5FF] transition-colors">
                                        ASEGURAR ESTE PAR
                                    </button>
                                </div>

                                {/* Category pill */}
                                <div className="absolute top-5 right-5">
                                    <span className="bg-[#00E5FF] px-3 py-1 text-black text-[9px] font-black uppercase tracking-tight">
                                        {product.category}
                                    </span>
                                </div>

                                {/* ÉTER Certified badge */}
                                <div className="absolute top-5 left-5">
                                    <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-sm border border-[#00E5FF]/40 px-2.5 py-1.5">
                                        <ShieldCheck size={9} className="text-[#00E5FF]" />
                                        <span className="text-[8px] font-black text-[#00E5FF] uppercase tracking-wider">
                                            CERTIFIED
                                        </span>
                                    </div>
                                </div>

                                {/* Low stock */}
                                {product.totalStock < 10 && (
                                    <div className="absolute bottom-[60px] left-5 right-5 group-hover:hidden">
                                        <span className="text-red-400 text-[9px] font-black uppercase tracking-widest">
                                            ⚡ Solo {product.totalStock} pares disponibles
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex justify-between items-end">
                                <div>
                                    <h3 className="text-lg font-black tracking-tighter text-white uppercase group-hover:text-[#00E5FF] transition-colors">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={8} className="fill-[#00E5FF] text-[#00E5FF]" />
                                            ))}
                                        </div>
                                        <span className="text-[9px] text-gray-600 uppercase tracking-wider">
                                            Último precio
                                        </span>
                                    </div>
                                </div>
                                <span className="text-lg font-black text-white">
                                    ${product.basePrice.toLocaleString('es-AR')}
                                </span>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

// --- PHILOSOPHY BENTO ---
const PhilosophySection = () => {
    return (
        <section id="philosophy" className="py-32 bg-[#0A0A0A] px-6 lg:px-12 border-t border-white/[0.04]">
            <div className="max-w-[1440px] mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="mb-12"
                >
                    <span className="text-[#00E5FF] font-black tracking-[0.5em] text-[10px] uppercase mb-4 block">
                        Nuestros Pilares
                    </span>
                    <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">
                        El Negocio del Siglo XXI<br />
                        <span className="text-[#00E5FF]">Empieza con un Par.</span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:auto-rows-[320px]">
                    {/* Large card — Calzado Premium */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.9 }}
                        viewport={{ once: true }}
                        className="md:col-span-8 md:row-span-2 relative group overflow-hidden border border-white/[0.05] hover:border-[#00E5FF]/30 transition-all duration-700"
                    >
                        <Image
                            src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80"
                            alt="Calzado Premium ÉTER"
                            fill
                            sizes="(max-width: 768px) 100vw, 66vw"
                            className="object-cover transition-transform duration-1000 group-hover:scale-[1.03] opacity-80 will-change-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
                        <div className="absolute bottom-10 left-8 md:left-12 text-white max-w-sm">
                            <h3 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 uppercase">
                                CALZADO PREMIUM
                            </h3>
                            <p className="text-base text-gray-300 mb-4">
                                Zapatillas brasileras de máxima calidad. Marcas exclusivas que tus clientes van a querer.
                            </p>
                            <div className="flex gap-4 text-[10px] font-black text-[#00E5FF] uppercase tracking-widest">
                                <span>47 modelos disponibles</span>
                                <span>·</span>
                                <span>Nuevos drops cada semana</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Logística card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.9, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="md:col-span-4 md:row-span-1 relative group overflow-hidden border border-white/[0.05] hover:border-[#00E5FF]/30 transition-all duration-700 bg-[#111] p-8 flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="size-10 rounded-full bg-[#00E5FF]/10 flex items-center justify-center border border-[#00E5FF]/30">
                                    <Truck size={16} className="text-[#00E5FF]" />
                                </div>
                                <h3 className="text-xl font-black tracking-tighter uppercase text-white">
                                    LOGÍSTICA INCLUIDA
                                </h3>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Nos encargamos del stock, empaque, envíos y atención. Vos solo vendés.
                            </p>
                        </div>
                        {/* Mini timeline */}
                        <div className="flex items-center gap-2 mt-4">
                            {['Pedido', 'Empaque', 'Envío', 'Entrega'].map((step, i, arr) => (
                                <React.Fragment key={step}>
                                    <div className="text-center">
                                        <div className="w-2 h-2 rounded-full bg-[#00E5FF] mx-auto mb-1" />
                                        <div className="text-[8px] text-gray-600 uppercase tracking-wider whitespace-nowrap">{step}</div>
                                    </div>
                                    {i < arr.length - 1 && (
                                        <div className="flex-1 h-px bg-[#00E5FF]/30" />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </motion.div>

                    {/* Ingresos card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.9, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="md:col-span-4 md:row-span-1 relative group overflow-hidden bg-[#00E5FF] border border-[#00E5FF]/80 p-8 flex flex-col justify-between"
                    >
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-8xl font-black text-black/10 select-none">$</span>
                        </div>
                        <div className="relative z-10">
                            <Wallet size={24} className="text-black mb-4" />
                            <h3 className="text-2xl font-black tracking-tighter mb-3 uppercase text-black">
                                INGRESOS REALES
                            </h3>
                            <p className="text-black/75 text-sm font-medium leading-relaxed">
                                Promedio{' '}
                                <span className="font-black text-black">$85.000 ARS</span>{' '}
                                de ganancia mensual por revendedor activo.
                            </p>
                        </div>
                    </motion.div>

                    {/* Comunidad card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.15 }}
                        viewport={{ once: true }}
                        className="md:col-span-12 md:row-span-1 relative group overflow-hidden bg-[#0D0D0D] border border-white/[0.05] hover:border-[#00E5FF]/30 transition-all duration-700 p-8 flex items-center gap-8"
                    >
                        <div className="size-16 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center shrink-0">
                            <Users size={24} className="text-[#00E5FF]" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-black tracking-tighter mb-2 uppercase text-white">
                                COMUNIDAD ÉTER
                            </h3>
                            <p className="text-gray-400 text-sm">
                                Grupo privado de revendedores. Estrategias, tips de ventas y soporte entre pares.
                            </p>
                        </div>
                        <div className="text-right shrink-0">
                            <div className="text-3xl font-black text-[#00E5FF]">+500</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest">Revendedores activos</div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

// --- HOW IT WORKS ---
const HowItWorksSection = () => {
    const [activeStep, setActiveStep] = useState(0);

    const steps = [
        {
            num: '01',
            icon: PackageSearch,
            title: 'ELEGÍ TUS PRODUCTOS',
            desc: 'Navegá nuestro catálogo de zapatillas premium y seleccioná las que mejor encajen con tu audiencia. Sin mínimo de compra.',
            image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80',
        },
        {
            num: '02',
            icon: Share2,
            title: 'PUBLICÁ Y VENDÉ',
            desc: 'Compartí en tus redes sociales con las fotos de alta calidad que te proporcionamos. Tu tienda, tus precios.',
            image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80',
        },
        {
            num: '03',
            icon: Wallet,
            title: 'COBRÁ TU GANANCIA',
            desc: 'Recibí comisiones directas por cada venta. Transparencia total, sin inversión inicial y sin sorpresas.',
            image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80',
        },
    ];

    return (
        <section id="how-it-works" className="py-32 bg-black relative overflow-hidden border-t border-white/[0.04]">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[#00E5FF]/[0.02] -skew-x-12 translate-x-1/4 pointer-events-none" />

            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                {/* Steps */}
                <div className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <span className="text-[#00E5FF] text-[10px] font-black tracking-[0.5em] uppercase block mb-4">
                            Cómo Funciona
                        </span>
                        <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-14 leading-[0.9] uppercase">
                            VENDER<br />NUNCA FUE<br />
                            <span className="text-[#00E5FF]">TAN SIMPLE.</span>
                        </h2>
                    </motion.div>

                    <div className="space-y-0">
                        {steps.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: idx * 0.15 }}
                                viewport={{ once: true }}
                                onMouseEnter={() => setActiveStep(idx)}
                                className={`flex gap-8 py-8 border-b border-white/[0.04] cursor-default group transition-all duration-300 ${
                                    activeStep === idx ? 'opacity-100' : 'opacity-50 hover:opacity-80'
                                }`}
                            >
                                {/* Number */}
                                <div className="shrink-0">
                                    <span className={`text-[3rem] font-black leading-none tabular-nums transition-colors duration-300 ${
                                        activeStep === idx ? 'text-[#00E5FF]' : 'text-white/20'
                                    }`}>
                                        {step.num}
                                    </span>
                                </div>
                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`size-8 rounded-full border flex items-center justify-center transition-all duration-300 ${
                                            activeStep === idx ? 'border-[#00E5FF] bg-[#00E5FF]/10' : 'border-white/10'
                                        }`}>
                                            <step.icon size={14} className={activeStep === idx ? 'text-[#00E5FF]' : 'text-white/40'} />
                                        </div>
                                        <h4 className="text-sm font-black text-white tracking-tight">{step.title}</h4>
                                    </div>
                                    <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        viewport={{ once: true }}
                        className="mt-10 flex items-center gap-4"
                    >
                        <Link href="/register">
                            <button
                                data-cursor="cta"
                                className="bg-[#00E5FF] text-black font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_40px_rgba(0,229,255,0.8)] hover:-translate-y-1 transition-all h-14 px-8 text-xs"
                            >
                                Registrarse Gratis
                            </button>
                        </Link>
                        <span className="text-[10px] text-gray-600 uppercase tracking-widest">
                            Sin inversión inicial
                        </span>
                    </motion.div>
                </div>

                {/* Dynamic image */}
                <div className="relative group hidden lg:block">
                    <div className="absolute inset-0 bg-[#00E5FF]/10 blur-[100px] rounded-full scale-75 pointer-events-none" />
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeStep}
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            transition={{ duration: 0.5 }}
                            className="relative z-10 aspect-square overflow-hidden"
                        >
                            <Image
                                src={steps[activeStep].image}
                                alt={steps[activeStep].title}
                                fill
                                className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                sizes="50vw"
                            />
                        </motion.div>
                    </AnimatePresence>
                    {/* Corner decorations */}
                    <div className="absolute -top-4 -right-4 z-20 size-24 border-t-2 border-r-2 border-[#00E5FF]" />
                    <div className="absolute -bottom-4 -left-4 z-20 size-24 border-b-2 border-l-2 border-[#00E5FF]" />
                </div>
            </div>
        </section>
    );
};

// --- CTA BANNER ---
const CTABannerSection = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setSubmitted(true);
    };

    return (
        <section className="py-24 bg-[#00E5FF] relative overflow-hidden border-t border-[#00B3FF]">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <span className="text-[20vw] font-black text-black/5 whitespace-nowrap tracking-tighter select-none">
                    ÉTER
                </span>
            </div>

            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-black uppercase leading-none mb-6">
                        Tu Primer Par Puede<br />
                        Ser Tu Primer Negocio.
                    </h2>
                    <p className="text-black/70 text-base md:text-xl mb-10 max-w-2xl mx-auto font-medium">
                        Más de 500 revendedores ya están ganando con ÉTER. El próximo podés ser vos.
                    </p>

                    {/* Social proof avatars */}
                    <div className="flex items-center justify-center gap-3 mb-10">
                        <div className="flex -space-x-3">
                            {[
                                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=64&h=64&fit=crop',
                                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=64&h=64&fit=crop',
                                'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=64&h=64&fit=crop',
                                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=64&h=64&fit=crop',
                            ].map((src, i) => (
                                <div key={i} className="w-9 h-9 rounded-full border-2 border-[#00E5FF] overflow-hidden">
                                    <Image src={src} alt="revendedor" width={36} height={36} className="object-cover" />
                                </div>
                            ))}
                        </div>
                        <span className="text-black/70 text-sm font-bold">
                            +120 nuevos revendedores esta semana
                        </span>
                    </div>

                    {/* Email form */}
                    {!submitted ? (
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col sm:flex-row items-center justify-center gap-0 max-w-lg mx-auto"
                        >
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                className="w-full sm:flex-1 h-14 px-6 bg-black text-white placeholder-white/30 text-sm font-medium outline-none border border-black focus:border-black"
                                aria-label="Tu correo electrónico"
                                required
                            />
                            <button
                                type="submit"
                                data-cursor="cta"
                                className="w-full sm:w-auto h-14 px-8 bg-black text-[#00E5FF] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300 whitespace-nowrap border border-black"
                            >
                                QUIERO EMPEZAR
                            </button>
                        </form>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-black font-black text-2xl"
                        >
                            ✓ ¡Listo! Te contactaremos pronto.
                        </motion.div>
                    )}

                    <p className="text-black/40 text-[10px] mt-4 uppercase tracking-widest">
                        Sin spam. Podés darte de baja cuando quieras.
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

// --- MAIN EXPORT ---
export default function LandingPage() {
    const { products: dbProducts, loading } = useCatalog();

    const products = useMemo(() => {
        if (dbProducts && dbProducts.length > 0) return dbProducts;
        return CURATED_PRODUCTS;
    }, [dbProducts]);

    return (
        <main className="min-h-screen bg-black text-white selection:bg-[#00E5FF] selection:text-black overflow-x-hidden">
            <GrainOverlay />
            <Navbar />

            <HeroSection products={products} />
            <TrustStrip />
            <BrandMarquee />
            <StatsSection />
            <ProductShowcase products={products} loading={loading} />
            <PhilosophySection />
            <TestimonialsSection />
            <EterCertifiedSection />
            <HowItWorksSection />
            <DropCalendarSection />
            <FAQSection />
            <CTABannerSection />

            <Footer />
        </main>
    );
}

