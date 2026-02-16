'use client';

import React, { useRef, useEffect, useMemo, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Play, ArrowUpRight, MoveRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MagneticButton } from '@/components/ui/magnetic-button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BrandMarquee } from '@/components/catalog/BrandMarquee';
import {
    fadeInUpVariants,
    viewportOptions
} from '@/lib/animations';
import { Product } from '@/domain/entities/Product';
import Image from 'next/image';

const CURATED_PRODUCTS: Product[] = [
    {
        id: 'hero-1',
        name: 'AURUM SPECIAL EDITION',
        description: 'Edición limitada con acabados en oro y materiales premium.',
        basePrice: 1250000,
        images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=90&w=2400&auto=format&fit=crop'],
        category: 'Exclusivo',
        stockBySize: {},
        totalStock: 10,
        status: 'active',
        createdAt: new Date()
    },
    {
        id: 'feat-1',
        name: 'ÉTER QUANTUM',
        description: 'Amortiguación reactiva para un retorno de energía absoluto.',
        basePrice: 890000,
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=90&w=2400&auto=format&fit=crop'],
        category: 'Performance',
        stockBySize: {},
        totalStock: 50,
        status: 'active',
        createdAt: new Date()
    },
    {
        id: 'sec-2',
        name: 'NEBULA X',
        description: 'Silueta minimalista diseñada para el confort diario.',
        basePrice: 520000,
        images: ['https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=90&w=2400&auto=format&fit=crop'],
        category: 'Lifestyle',
        stockBySize: {},
        totalStock: 80,
        status: 'active',
        createdAt: new Date()
    },
    {
        id: 'sec-1',
        name: 'VOID WALKER',
        description: 'Estética técnica blindada para la exploración urbana.',
        basePrice: 450000,
        images: ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=90&w=2400&auto=format&fit=crop'],
        category: 'Techwear',
        stockBySize: {},
        totalStock: 100,
        status: 'active',
        createdAt: new Date()
    }
];

// --- COMPONENTS ---

const CustomCursor = () => {
    const cursorRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            mouseX.set(e.clientX - 16);
            mouseY.set(e.clientY - 16);
        };
        window.addEventListener('mousemove', moveCursor);
        return () => window.removeEventListener('mousemove', moveCursor);
    }, [mouseX, mouseY]);

    return (
        <motion.div
            ref={cursorRef}
            className="fixed top-0 left-0 w-8 h-8 border border-[#C88A04] rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:flex items-center justify-center"
            style={{ x: mouseX, y: mouseY }}
        >
            <div className="w-1 h-1 bg-[#C88A04] rounded-full" />
        </motion.div>
    );
};

const ScrollProgress = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C88A04] to-[#ECA413] origin-left z-[100]"
            style={{ scaleX }}
        />
    );
};

const HeroSection = ({ products }: { products: Product[] }) => {
    const { scrollY } = useScroll();

    // Text Parallax & Effects - Subtle and smooth
    const y1 = useTransform(scrollY, [0, 600], [0, 120]);
    const opacity = useTransform(scrollY, [0, 500], [1, 0]);
    const scale = useTransform(scrollY, [0, 500], [1, 0.95]);
    const filter = useTransform(scrollY, [0, 500], ["blur(0px)", "blur(6px)"]);

    // Image Parallax - Gentle movement for depth
    const y2 = useTransform(scrollY, [0, 600], [0, 60]);
    const opacity2 = useTransform(scrollY, [0, 500], [0.6, 0]);

    // Select the most expensive product as the Hero Product
    const heroProduct = useMemo(() => {
        if (!products || !products.length) return null;
        return [...products].sort((a, b) => b.basePrice - a.basePrice)[0];
    }, [products]);

    // Fallback high-quality image if no product image or purely for aesthetic override if needed
    const primaryHeroImage = heroProduct?.images?.[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=90&w=2400&auto=format&fit=crop";
    const fallbackHeroImage = "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=90&w=2400&auto=format&fit=crop";
    const [heroImageSrc, setHeroImageSrc] = useState(primaryHeroImage);
    const [hasFallback, setHasFallback] = useState(false);

    useEffect(() => {
        setHeroImageSrc(primaryHeroImage);
        setHasFallback(false);
    }, [primaryHeroImage]);

    return (
        <section className="relative h-screen min-h-[600px] md:min-h-[900px] w-full overflow-hidden flex flex-col justify-center items-center bg-[#050505]">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }} />

                <motion.div
                    style={{ y: useTransform(scrollY, [0, 1000], [0, 400]) }}
                    className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] bg-radial-gradient from-[#C88A04]/15 to-transparent blur-[120px] animate-pulse-slow"
                />

                {/* Visual Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(200,138,4,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(200,138,4,0.05)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] opacity-30" />
            </div>

            <div className="container relative z-10 px-6 flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
                    className="relative"
                    style={{ y: y1, opacity, scale, filter }}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 1, ease: [0.19, 1, 0.22, 1] }}
                        className="mb-6 inline-block"
                    >
                        <span className="px-4 py-2 rounded-full border border-[#C88A04]/30 bg-[#C88A04]/5 text-[#C88A04] text-xs font-bold tracking-[0.2em] uppercase backdrop-blur-md">
                            Tu Negocio Digital
                        </span>
                    </motion.div>

                    <motion.h1
                        className="text-[18vw] md:text-[12vw] leading-[0.8] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 mb-8 select-none"
                    >
                        ÉTER
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 1, ease: [0.19, 1, 0.22, 1] }}
                        style={{ y: useTransform(scrollY, [0, 600], [0, 50]) }}
                    >
                        <p className="max-w-xl mx-auto text-base md:text-xl text-gray-400 font-light leading-relaxed mb-8 md:mb-12">
                            Vende <span className="text-white font-medium">calzado premium brasilero</span> desde tu casa y genera <span className="text-[#C88A04] font-medium">ingresos reales</span>.
                            Nosotros manejamos la logística. Vos enfocate en vender.
                        </p>
                    </motion.div>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <Link href="/catalog">
                            <MagneticButton className="h-16 px-10 text-lg bg-[#C88A04] hover:bg-[#D97706] text-black font-bold rounded-full shadow-[0_0_50px_-10px_rgba(200,138,4,0.4)] transition-all hover:shadow-[0_0_80px_-20px_rgba(200,138,4,0.6)]">
                                VER CATÁLOGO
                            </MagneticButton>
                        </Link>
                        <Link href="#journal">
                            <MagneticButton variant="outline" className="h-16 px-10 text-lg border-white/10 text-white hover:bg-white/5 font-bold rounded-full backdrop-blur-sm">
                                <Play size={20} className="mr-3 fill-white" />
                                COMENZAR AHORA
                            </MagneticButton>
                        </Link>
                    </div>
                </motion.div>
            </div>



            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-3 z-20"
                initial={{ opacity: 0, y: 10 }}
                animate={{
                    opacity: 1,
                    y: [0, 8, 0]
                }}
                transition={{
                    opacity: { delay: 1.5, duration: 1.2 },
                    y: {
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }
                }}
            >
                <span className="text-[9px] uppercase tracking-[0.4em] text-white/40 font-black">Desliza para Explorar</span>
                <div className="w-[1px] h-12 bg-white/5 relative overflow-hidden">
                    <motion.div
                        className="absolute top-0 left-0 w-full bg-gradient-to-b from-transparent via-[#C88A04] to-transparent h-full"
                        animate={{
                            y: ['-100%', '100%'],
                            opacity: [0, 1, 0]
                        }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </div>
            </motion.div>
        </section>
    );
};

const PhilosophyCard = ({ title, desc, image, index }: { title: string, desc: string, image: string, index: number }) => (
    <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOptions}
        variants={{
            hidden: { opacity: 0, y: 30 },
            visible: {
                opacity: 1,
                y: 0,
                transition: { delay: index * 0.15, duration: 1, ease: [0.19, 1, 0.22, 1] }
            }
        }}
        className="group relative h-[380px] md:h-[450px] flex flex-col justify-end p-6 md:p-10 rounded-[2.5rem] border border-white/5 bg-[#111] overflow-hidden hover:border-[#C88A04]/30 transition-all duration-700 ease-out"
    >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
            <Image
                src={image}
                alt={title}
                fill
                className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-1000 ease-out"
            />
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent z-[1]" />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-700 z-[1]" />
        </div>

        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity z-2" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }} />

        {/* Hover Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#C88A04]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 ease-out z-2" />

        <div className="relative z-10 transform group-hover:-translate-y-2 transition-transform duration-700 ease-out">
            <span className="text-[#C88A04] font-mono text-xs mb-4 block tracking-[0.3em] opacity-80 uppercase">Principios 0{index + 1}</span>
            <div className="w-12 h-[2px] bg-[#C88A04] mb-6 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out origin-left shadow-[0_0_10px_#C88A04]" />
            <h3 className="text-3xl font-black mb-4 leading-tight tracking-tighter uppercase whitespace-pre-line">{title}</h3>
            <p className="text-gray-400 font-light leading-relaxed group-hover:text-white transition-colors duration-700 text-sm max-w-[280px]">{desc}</p>
        </div>
    </motion.div>
);

const PhilosophySection = () => {
    return (
        <section className="py-32 bg-[#0A0A0A]">
            <div className="container mx-auto px-6">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOptions}
                    variants={fadeInUpVariants}
                    className="mb-20"
                >
                    <span className="text-[#C88A04] font-bold tracking-widest text-sm uppercase mb-4 block">Nuestros Pilares</span>
                    <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter">
                        TU ÉXITO ES <br /> NUESTRO ÉXITO.
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <PhilosophyCard
                        title="CALZADO PREMIUM"
                        desc="Zapatillas brasileras de máxima calidad. Marcas exclusivas que tus clientes van a querer."
                        image="https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=2400&auto=format&fit=crop"
                        index={0}
                    />
                    <PhilosophyCard
                        title="LOGÍSTICA INCLUIDA"
                        desc="Nos encargamos del stock, envíos y atención al cliente. Vos solo vendés y cobrás."
                        image="https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=1200&auto=format&fit=crop"
                        index={1}
                    />
                    <PhilosophyCard
                        title="INGRESOS REALES"
                        desc="Ganá lo mismo que un empleado de comercio, pero trabajando desde tu casa con tu celular."
                        image="https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=1200&auto=format&fit=crop"
                        index={2}
                    />
                </div>
            </div>
        </section>
    );
};

const FeaturedProduct = ({ product }: { product: Product }) => {
    if (!product) return null;

    // Use product image with optimized quality
    const imageSrc = product.images?.[0] || 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=90&w=2400&auto=format&fit=crop&ixlib=rb-4.0.3';

    return (
        <div className="md:col-span-8 relative group h-[450px] md:h-[600px] rounded-[2.5rem] overflow-hidden border border-white/10 bg-gradient-to-br from-[#0F0F0F] to-[#0A0A0A] hover:border-[#C88A04]/30 transition-all duration-1000">
            {/* Noise Texture */}
            <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
            }} />

            {/* Animated Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-radial from-[#C88A04]/20 via-[#C88A04]/10 to-transparent rounded-full blur-[120px] group-hover:from-[#C88A04]/30 group-hover:via-[#C88A04]/15 transition-all duration-1000 ease-out" />

            {/* Gradient Overlay for Depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 z-[5]" />

            {/* Product Image Container */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="relative w-[85%] h-[85%] transition-all duration-1000 ease-out group-hover:scale-105 group-hover:rotate-1">
                    {/* Image Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-radial from-[#C88A04]/20 to-transparent blur-2xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                    {/* Product Image */}
                    <Image
                        src={imageSrc}
                        alt={product.name}
                        fill
                        priority
                        quality={95}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                        className="object-contain filter drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)] drop-shadow-[0_0_80px_rgba(200,138,4,0.3)]"
                    />

                    {/* Reflection Effect */}
                    <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-[#C88A04]/10 to-transparent blur-xl opacity-60" />
                </div>
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 p-12 flex flex-col justify-between z-20 pointer-events-none">
                <div className="flex justify-between items-start pointer-events-auto">
                    <div>
                        <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-[#C88A04] to-[#ECA413] text-black text-xs font-bold uppercase rounded-full mb-4 shadow-lg shadow-[#C88A04]/30">
                            Modelo Insignia
                        </span>
                        <h3 className="text-4xl md:text-6xl font-black tracking-tighter mb-2 drop-shadow-2xl">{product.name}</h3>
                        <p className="text-lg md:text-xl text-gray-400 font-light tracking-widest">{product.category}</p>
                    </div>
                </div>

                <div className="flex items-end justify-between pointer-events-auto">
                    <div className="text-3xl md:text-5xl font-light text-white">${product.basePrice.toLocaleString('es-AR')}</div>
                    <Link href={`/catalog`}>
                        <MagneticButton className="h-16 w-16 md:w-auto md:px-8 bg-white text-black hover:bg-[#C88A04] hover:text-white rounded-full flex items-center justify-center gap-3 transition-all duration-500 ease-out">
                            <span className="hidden md:block font-bold">VER PRODUCTO</span>
                            <ArrowRight size={20} />
                        </MagneticButton>
                    </Link>
                </div>
            </div>
        </div>
    )
}

const SecondaryProduct = ({ product, index }: { product: Product, index: number }) => {
    // Optimized image with better quality
    const imageSrc = product.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=90&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOptions}
            transition={{ delay: 0.1 * index, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            className="md:col-span-4 relative group h-[450px] md:h-[600px] rounded-[2.5rem] overflow-hidden border border-white/10 bg-gradient-to-br from-[#0F0F0F] to-[#0A0A0A] p-6 md:p-8 flex flex-col justify-between hover:border-[#C88A04]/50 hover:shadow-[0_0_40px_rgba(200,138,4,0.15)] transition-all duration-700 ease-out"
        >
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-radial from-[#C88A04]/10 to-transparent rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            {/* Status Badge */}
            <div className="absolute top-8 right-8 z-20">
                <span className="text-xs font-bold px-3 py-1.5 rounded-full border border-[#C88A04]/50 text-[#C88A04] bg-[#C88A04]/10 backdrop-blur-sm shadow-lg shadow-[#C88A04]/20">
                    DISPONIBLE
                </span>
            </div>

            {/* Product Image Container */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="relative w-[80%] h-[50%] transition-all duration-800 ease-out group-hover:scale-105 group-hover:-rotate-3">
                    {/* Image Glow on Hover */}
                    <div className="absolute inset-0 bg-gradient-radial from-[#C88A04]/20 to-transparent blur-xl scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    {/* Product Image */}
                    <Image
                        src={imageSrc}
                        alt={product.name}
                        fill
                        quality={90}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                        className="object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] drop-shadow-[0_0_60px_rgba(200,138,4,0.2)]"
                    />
                </div>
            </div>

            <div className="relative z-20 mt-auto pointer-events-auto">
                <h4 className="text-2xl font-bold mb-1 truncate">{product.name}</h4>
                <div className="flex items-center justify-between">
                    <span className="text-lg text-[#C88A04] font-bold">${product.basePrice.toLocaleString('es-AR')}</span>
                    <Link href={`/catalog`}>
                        <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white hover:text-black flex items-center justify-center transition-all duration-500 ease-out">
                            <ArrowUpRight size={18} />
                        </button>
                    </Link>
                </div>
            </div>
        </motion.div>
    )
}

const ProductShowcase = ({ products, loading }: { products: Product[], loading: boolean }) => {
    // Sort by price high to low or newness for showcase
    const showcaseProducts = useMemo(() => {
        if (!products || !products.length) return [];
        // Skip the most expensive (Hero) one to avoid duplication
        return [...products].sort((a, b) => b.basePrice - a.basePrice).slice(1, 4);
    }, [products]);

    if (loading) return null;

    return (
        <section className="py-20 bg-[#0A0A0A]">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <motion.div variants={fadeInUpVariants} initial="hidden" whileInView="visible" viewport={viewportOptions}>
                        <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-2">
                            DROPS <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C88A04] to-[#ECA413]">LIMITADOS</span>
                        </h2>
                    </motion.div>
                    <Link href="/catalog">
                        <Button variant="link" className="text-white hover:text-[#C88A04] text-lg">
                            VER ARCHIVO <MoveRight className="ml-2" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {showcaseProducts.length > 0 ? (
                        <>
                            <FeaturedProduct product={showcaseProducts[0]} />
                            {showcaseProducts.slice(1).map((product, idx) => (
                                <SecondaryProduct key={product.id} product={product} index={idx} />
                            ))}
                        </>
                    ) : (
                        <div className="md:col-span-12 text-center text-gray-500 py-20">
                            Cargando colección exclusiva...
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

const TechSection = () => {
    return (
        <section className="py-32 bg-black relative border-t border-white/5 overflow-hidden">
            {/* Background Tech Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(200,138,4,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(200,138,4,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row gap-24 items-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
                        viewport={viewportOptions}
                        className="lg:w-1/2 relative w-full aspect-square"
                    >
                        {/* High-Tech Frame */}
                        <div className="absolute inset-0 border border-white/10 rounded-3xl" />
                        <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-[#C88A04]" />
                        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-[#C88A04]" />

                        <div className="absolute inset-4 bg-[#050505] rounded-2xl flex items-center justify-center overflow-hidden">
                            <Image
                                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2400&auto=format&fit=crop"
                                alt="Logística Éter"
                                fill
                                className="object-cover opacity-60 mix-blend-screen"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                {/* Simulated 3D Exploded View */}
                                <div className="w-64 h-2 bg-[#C88A04] blur-lg animate-pulse" />
                            </div>
                            <div className="text-center z-10">
                                <span className="text-[#C88A04]/50 font-mono text-xs tracking-[0.5em] block mb-4 uppercase">Ecosistema Digital</span>
                                <h3 className="text-4xl font-bold text-white mb-2">NÚCLEO LOGÍSTICO</h3>
                                <p className="text-gray-600 font-mono text-xs">SISTEMA AUTO-GESTIÓN V2.4</p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="lg:w-1/2">
                        <motion.h2 variants={fadeInUpVariants} initial="hidden" whileInView="visible" viewport={viewportOptions} className="text-[#C88A04] font-mono text-sm tracking-widest mb-6">
                            {'/' + '/ CÓMO_FUNCIONA'}
                        </motion.h2>
                        <motion.h3 variants={fadeInUpVariants} initial="hidden" whileInView="visible" viewport={viewportOptions} className="text-4xl md:text-6xl font-black mb-12 text-white leading-none">
                            VENDER NUNCA FUE <br /> TAN SIMPLE.
                        </motion.h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                            {[
                                { title: 'Elegí tus Productos', desc: 'Navegá nuestro catálogo de zapatillas premium brasileras y seleccioná las que querés vender.', val: '01' },
                                { title: 'Publicá y Vendé', desc: 'Compartí en tus redes sociales o con tus contactos. Nosotros te damos las fotos y descripciones.', val: '02' },
                                { title: 'Cobrá tu Ganancia', desc: 'Por cada venta confirmada, recibís tu comisión. Sin inversión inicial ni riesgos.', val: '03' },
                                { title: 'Nosotros Enviamos', desc: 'ÉTER se encarga de todo el proceso logístico. Stock, packaging y envío al cliente final.', val: '04' }
                            ].map((spec, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                                    viewport={viewportOptions}
                                    className="border-l border-white/10 pl-6 hover:border-[#C88A04] transition-colors duration-500 ease-out group"
                                >
                                    <h4 className="text-white font-bold text-lg mb-2 group-hover:text-[#C88A04] transition-colors duration-500">{spec.title}</h4>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-4">{spec.desc}</p>
                                    <span className="font-mono text-[#C88A04] text-xs px-2 py-1 bg-[#C88A04]/10 rounded">{spec.val}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

interface JournalEntryProps {
    title: string;
    date: string;
    category: string;
    image: string;
    index: number;
}

const JournalEntry = ({ title, date, category, image, index }: JournalEntryProps) => (
    <motion.article
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.15, duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
        viewport={viewportOptions}
        className="group cursor-pointer relative"
    >
        <div className="aspect-[3/4] bg-[#111] overflow-hidden mb-6 relative">
            {/* Background Image */}
            <div className="absolute inset-0 bg-white/5 group-hover:scale-105 transition-transform duration-1000 ease-out z-0">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover opacity-60 group-hover:opacity-80 transition-all duration-1000"
                />
            </div>

            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-800 ease-out z-1" />

            <div className="absolute top-4 left-4 z-10">
                <span className="bg-[#C88A04] text-black text-[10px] font-bold px-3 py-1.5 uppercase rounded-sm shadow-lg shadow-black/20">
                    {category}
                </span>
            </div>
        </div>
        <div className="border-t border-white/10 pt-6 group-hover:border-[#C88A04] transition-colors duration-700 ease-out">
            <span className="text-xs font-mono text-gray-400 block mb-2">{date}</span>
            <h3 className="text-2xl font-bold text-white group-hover:text-[#C88A04] transition-colors duration-500 ease-out leading-tight uppercase tracking-tight">{title}</h3>
        </div>
    </motion.article>
);

const TheJournal = () => {
    return (
        <section id="journal" className="py-32 bg-[#0C0C0C]">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-end mb-20">
                    <h2 className="text-6xl md:text-9xl font-black text-white/5 absolute left-0 right-0 text-center select-none pointer-events-none">DIARIO</h2>
                    <h2 className="text-3xl md:text-4xl font-bold relative z-10">EL DIARIO</h2>
                    <Button variant="ghost" className="text-white hover:text-[#C88A04] hidden md:flex">LEER TODOS LOS ARTÍCULOS</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <JournalEntry
                        date="MAY 24, 2026"
                        category="DISEÑO"
                        title="EL FUTURO DE LA TRACCIÓN: BIOMIMETISMO EN LA SUELA"
                        image="https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=1200&auto=format&fit=crop"
                        index={0}
                    />
                    <JournalEntry
                        date="MAY 18, 2026"
                        category="CIENCIA"
                        title="MATERIALES ÉTER: LA CIENCIA DETRÁS DE LA LIGEREZA"
                        image="https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=1200&auto=format&fit=crop"
                        index={1}
                    />
                    <JournalEntry
                        date="MAY 12, 2026"
                        category="TECNOLOGÍA"
                        title="DISEÑO GENERATIVO: DONDE EL ALGORITMO SE VUELVE ARTE"
                        image="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"
                        index={2}
                    />
                </div>
            </div>
        </section>
    );
};

export default function LandingPage() {
    const products = CURATED_PRODUCTS;
    const loading = false;

    return (
        <main className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#C88A04] selection:text-black overflow-x-hidden">
            <CustomCursor />
            <ScrollProgress />
            <Navbar />

            <HeroSection products={products} />
            <BrandMarquee />
            <PhilosophySection />
            <ProductShowcase products={products} loading={loading} />
            <TechSection />
            <TheJournal />

            <Footer />
        </main>
    );
}
