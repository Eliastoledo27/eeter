'use client';

import React, { useRef, useEffect, useMemo, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowRight,
    Play,
    ArrowUpRight,
    MoveRight,
    PackageSearch,
    Share2,
    Wallet,
    Truck,
    Cpu,
    Megaphone,
    Plus,
    Image as ImageIcon
} from 'lucide-react';
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
import { useCatalog } from '@/hooks/useCatalog';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import Image from 'next/image';

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
        totalStock: 75,
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
        category: 'Ojotas',
        stockBySize: {},
        totalStock: 40,
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
                    className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-[#C88A04]/5 rounded-full blur-[150px] animate-pulse-slow"
                />

                <motion.div
                    style={{ y: useTransform(scrollY, [0, 1000], [0, -300]) }}
                    className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-[#C88A04]/10 rounded-full blur-[180px]"
                />

                {/* Kinetic Diagnostic Lines */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-[#C88A04]/20 to-transparent"
                            style={{ top: `${20 * i}%` }}
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{
                                duration: 8 + i * 2,
                                repeat: Infinity,
                                ease: "linear",
                                delay: i * 1
                            }}
                        />
                    ))}
                </div>

                {/* Visual Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(200,138,4,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(200,138,4,0.03)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_90%)] opacity-40" />
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
                        <Link href="/register">
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

const PhilosophyCard = ({ title, desc, image, alt, index }: { title: string, desc: string, image: string, alt: string, index: number }) => (
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
                alt={alt}
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
        <section id="philosophy" className="py-32 bg-[#0A0A0A]" aria-labelledby="philosophy-title">
            <div className="container mx-auto px-6">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOptions}
                    variants={fadeInUpVariants}
                    className="mb-20"
                >
                    <span className="text-[#C88A04] font-bold tracking-widest text-sm uppercase mb-4 block">Nuestros Pilares</span>
                    <h2 id="philosophy-title" className="text-4xl md:text-7xl font-black text-white tracking-tighter">
                        TU ÉXITO ES <br /> NUESTRO ÉXITO.
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <PhilosophyCard
                        title="CALZADO PREMIUM"
                        desc="Zapatillas brasileras de máxima calidad. Marcas exclusivas que tus clientes van a querer."
                        image="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2400&auto=format&fit=crop"
                        alt="Zapatillas premium brasileras de diseño exclusivo en ÉTER Store"
                        index={0}
                    />
                    <PhilosophyCard
                        title="LOGÍSTICA INCLUIDA"
                        desc="Nos encargamos del stock, envíos y atención al cliente. Vos solo vendés y cobrás."
                        image="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2400&auto=format&fit=crop"
                        alt="Gestión logística avanzada para revendedores de calzado ÉTER"
                        index={1}
                    />
                    <PhilosophyCard
                        title="INGRESOS REALES"
                        desc="Ganá lo mismo que un empleado de comercio, pero trabajando desde tu casa con tu celular."
                        image="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=2400&auto=format&fit=crop"
                        alt="Emprendimiento digital exitoso con venta de calzado premium"
                        index={2}
                    />
                </div>
            </div>
        </section>
    );
};

const FeaturedProduct = ({ product }: { product: Product }) => {
    if (!product) return null;

    const imageSrc = product.images?.[0] || 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=90&w=2400&auto=format&fit=crop';

    return (
        <div className="md:col-span-8 group relative h-[500px] md:h-[700px] rounded-[3rem] overflow-hidden bg-[#0A0A0A] border border-white/5 transition-all duration-1000">
            {/* Architectural Background */}
            <div className="absolute inset-0 z-0 opacity-20 bg-[linear-gradient(rgba(200,138,4,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(200,138,4,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />

            {/* Holographic Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.02] select-none text-[25vw] font-black text-white tracking-tighter whitespace-nowrap rotate-[-10deg] z-0">
                EXCLUSIVE
            </div>

            {/* Kinetic Scan Line */}
            <motion.div
                className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C88A04]/40 to-transparent z-10 pointer-events-none"
                animate={{ top: ['0%', '100%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />

            {/* Product Image Stage */}
            <div className="absolute inset-0 flex items-center justify-center z-10 p-12 lg:p-24 h-full w-full">
                <div className="relative w-full h-full flex items-center justify-center transition-all duration-1000 ease-out group-hover:scale-110">
                    {/* Shadow / Glow */}
                    <div className="absolute w-[60%] h-[20%] bg-[#C88A04]/20 blur-[100px] rounded-full bottom-[-10%] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                    <Image
                        src={imageSrc}
                        alt={product.name}
                        fill
                        className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] filter transition-transform duration-1000 group-hover:rotate-[-2deg]"
                        sizes="(max-width: 1200px) 100vw, 800px"
                    />
                </div>
            </div>

            {/* HUD / Info Overlay */}
            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-between z-20 pointer-events-none">
                <div className="flex justify-between items-start">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="space-y-2 pointer-events-auto"
                    >
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#C88A04] animate-pulse" />
                            <span className="text-[10px] font-black text-[#C88A04] uppercase tracking-[0.4em]">Active_Protocol</span>
                        </div>
                        <h3 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.85]">{product.name}</h3>
                        <p className="text-sm font-mono text-gray-500 tracking-[0.2em] uppercase">{product.category} // v2.6</p>
                    </motion.div>
                </div>

                <div className="flex items-end justify-between pointer-events-auto">
                    <div className="space-y-1">
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest block">Precio_Unitario</span>
                        <div className="text-4xl md:text-6xl font-light text-white tracking-tighter">${product.basePrice.toLocaleString('es-AR')}</div>
                    </div>

                    <Link href="/catalog">
                        <MagneticButton className="h-20 w-20 md:w-auto md:px-10 bg-white text-black hover:bg-[#C88A04] hover:text-white rounded-[2rem] flex items-center justify-center gap-4 transition-all duration-700">
                            <span className="hidden md:block font-black text-sm uppercase tracking-widest">ADQUIRIR</span>
                            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                        </MagneticButton>
                    </Link>
                </div>
            </div>
        </div>
    );
}

const SecondaryProduct = ({ product, index }: { product: Product, index: number }) => {
    const imageSrc = product.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=90&w=2670&auto=format&fit=crop';

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 1, ease: [0.19, 1, 0.22, 1] }}
            className="md:col-span-4 group relative h-[450px] md:h-[600px] rounded-[3rem] overflow-hidden bg-white/[0.03] border border-white/5 p-8 flex flex-col justify-between hover:bg-white/[0.05] hover:border-[#C88A04]/30 transition-all duration-700"
        >
            {/* Ambient Background */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-[radial-gradient(circle_at_center,rgba(200,138,4,0.05)_0%,transparent_70%)]" />

            {/* Product Center Stage */}
            <div className="absolute inset-0 flex items-center justify-center z-10 p-12">
                <div className="relative w-full h-[60%] transition-all duration-1000 ease-out group-hover:scale-110 group-hover:rotate-3">
                    <Image
                        src={imageSrc}
                        alt={product.name}
                        fill
                        className="object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                        sizes="(max-width: 768px) 100vw, 400px"
                    />
                </div>
            </div>

            <div className="relative z-20 flex justify-between items-start pointer-events-none">
                <div className="space-y-1">
                    <span className="text-[9px] font-black text-[#C88A04] uppercase tracking-widest block opacity-70">Model_{index + 2}</span>
                    <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter leading-[0.9]">{product.name}</h4>
                </div>
                <div className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C88A04]" />
                </div>
            </div>

            <div className="relative z-20 flex items-end justify-between pointer-events-auto">
                <div className="text-2xl font-light text-white tracking-tighter">${product.basePrice.toLocaleString('es-AR')}</div>
                <Link href="/catalog">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-700">
                        <ArrowUpRight size={20} />
                    </div>
                </Link>
            </div>
        </motion.div>
    );
}

const ProductShowcase = ({ products, loading }: { products: Product[], loading: boolean }) => {
    const showcaseProducts = useMemo(() => {
        if (!products || !products.length) return [];
        return [...products].sort((a, b) => b.basePrice - a.basePrice).slice(0, 5);
    }, [products]);

    if (loading) return (
        <section className="py-32 bg-[#050505]">
            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-8 h-[600px] bg-white/[0.02] rounded-[3rem] animate-pulse" />
                <div className="md:col-span-4 h-[600px] bg-white/[0.02] rounded-[3rem] animate-pulse" />
            </div>
        </section>
    );

    return (
        <section className="py-32 bg-[#050505] relative overflow-hidden">
            {/* Visual Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C88A04]/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={viewportOptions}
                        className="space-y-6"
                    >
                        <span className="text-[#C88A04] font-black tracking-[0.5em] text-[10px] uppercase block">// Archivo_Exploración</span>
                        <h2 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-[0.8] uppercase">
                            DROPS <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C88A04] to-[#ECA413]">LIMITADOS</span>
                        </h2>
                    </motion.div>

                    <Link href="/catalog" className="group flex items-center gap-4 py-4 px-10 border border-white/10 rounded-full hover:border-[#C88A04]/50 transition-all duration-700">
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-white/60 group-hover:text-[#C88A04] transition-colors">Ver Colección Completa</span>
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#C88A04] group-hover:text-black transition-all">
                            <MoveRight size={20} />
                        </div>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {showcaseProducts.length > 0 ? (
                        <>
                            <FeaturedProduct product={showcaseProducts[0]} />
                            {showcaseProducts.slice(1).map((product, idx) => (
                                <SecondaryProduct
                                    key={product.id}
                                    product={product}
                                    index={idx}
                                />
                            ))}
                        </>
                    ) : (
                        <div className="md:col-span-12 py-40 border border-white/5 rounded-[3rem] bg-white/[0.01] flex flex-col items-center justify-center text-center">
                            <span className="text-[#C88A04] animate-pulse mb-6">Sincronizando Archivo...</span>
                            <div className="w-48 h-[1px] bg-gradient-to-r from-transparent via-[#C88A04] to-transparent" />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

const TechSection = () => {
    return (
        <section id="how-it-works" className="py-32 bg-black relative border-t border-white/5 overflow-hidden">
            {/* Background Tech Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(200,138,4,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(200,138,4,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row gap-24 items-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
                        viewport={viewportOptions}
                        className="lg:w-1/2 relative w-full aspect-square md:aspect-video lg:aspect-square"
                    >
                        {/* High-Tech Frame */}
                        <div className="absolute inset-0 border border-white/10 rounded-3xl" />
                        <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-[#C88A04] rounded-tl-3xl z-20" />
                        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-[#C88A04] rounded-br-3xl z-20" />

                        <div className="absolute inset-4 bg-[#050505] rounded-2xl flex items-center justify-center overflow-hidden group">
                            <Image
                                src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2400&auto=format&fit=crop"
                                alt="Núcleo de Inteligencia Logística ÉTER"
                                fill
                                className="object-cover opacity-50 mix-blend-screen group-hover:scale-110 transition-transform duration-[3s] ease-out"
                            />

                            {/* Scanning Animation */}
                            <motion.div
                                className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#C88A04] to-transparent z-10"
                                animate={{
                                    top: ['0%', '100%', '0%']
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                            />

                            {/* Digital Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-60" />

                            <div className="relative text-center z-10 p-8">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="w-32 h-32 border border-[#C88A04]/20 rounded-full mx-auto mb-8 flex items-center justify-center relative"
                                >
                                    <div className="absolute inset-0 border-t-2 border-[#C88A04] rounded-full" />
                                    <Cpu size={40} className="text-[#C88A04] animate-pulse" />
                                </motion.div>
                                <span className="text-[#C88A04] font-mono text-xs tracking-[0.5em] block mb-4 uppercase">Ecosistema Digital de Alto Rendimiento</span>
                                <h3 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter shadow-2xl">NÚCLEO <br /> LOGÍSTICO</h3>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C88A04]/10 border border-[#C88A04]/20 rounded text-[#C88A04]/80 font-mono text-[10px]">
                                    <div className="w-1.5 h-1.5 bg-[#C88A04] rounded-full animate-ping" />
                                    SISTEMA OPERATIVO v4.0.2 ACTIVADO
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="lg:w-1/2">
                        <motion.h2 variants={fadeInUpVariants} initial="hidden" whileInView="visible" viewport={viewportOptions} className="text-[#C88A04] font-mono text-sm tracking-widest mb-6 uppercase">
                            {'// PROTOCOLO DE VENTA'}
                        </motion.h2>
                        <motion.h3 variants={fadeInUpVariants} initial="hidden" whileInView="visible" viewport={viewportOptions} className="text-4xl md:text-7xl font-black mb-12 text-white leading-[0.9] tracking-tighter">
                            VENDER NUNCA <br /> FUE TAN <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C88A04] to-[#ECA413]">SIMPLE.</span>
                        </motion.h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                            {[
                                {
                                    title: 'Elegí tus Productos',
                                    desc: 'Navegá nuestro catálogo de zapatillas premium y seleccioná las que mejor encajen con tu audiencia.',
                                    val: '01',
                                    icon: PackageSearch
                                },
                                {
                                    title: 'Publicá y Vendé',
                                    desc: 'Compartí en tus redes sociales con las fotos de alta calidad que te proporcionamos.',
                                    val: '02',
                                    icon: Share2
                                },
                                {
                                    title: 'Cobrá tu Ganancia',
                                    desc: 'Recibí comisiones directas por cada venta. Transparencia total y sin inversión inicial.',
                                    val: '03',
                                    icon: Wallet
                                },
                                {
                                    title: 'Nosotros Enviamos',
                                    desc: 'ÉTER se encarga de todo el proceso logístico: desde el packaging hasta la puerta del cliente.',
                                    val: '04',
                                    icon: Truck
                                }
                            ].map((spec, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                                    viewport={viewportOptions}
                                    className="relative group group"
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#C88A04]/10 group-hover:border-[#C88A04]/50 transition-all duration-500">
                                            <spec.icon size={22} className="text-gray-400 group-hover:text-[#C88A04] transition-colors duration-500" />
                                        </div>
                                        <span className="font-mono text-[#C88A04] text-xs font-bold opacity-40 group-hover:opacity-100 transition-opacity">PROTOCOL_{spec.val}</span>
                                    </div>
                                    <h4 className="text-white font-bold text-xl mb-3 group-hover:text-[#C88A04] transition-colors duration-500">{spec.title}</h4>
                                    <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-500">{spec.desc}</p>

                                    {/* Bottom Line Decoration */}
                                    <div className="w-0 h-[1px] bg-gradient-to-r from-[#C88A04] to-transparent mt-6 group-hover:w-full transition-all duration-700 ease-in-out" />
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


// --- SHARED FLYER COMPONENT (Mini Version of Dashboard Engine) ---
const FlyerCard = ({ data, index }: { data: any, index: number }) => {
    // Parse design config or fallback to default
    const design = data.designConfig || {
        layout: 'classic',
        accent_color: '#C88A04',
        overlay_opacity: 0.6,
        blur_amount: 0,
        glass_intensity: 0.1,
        font_style: 'black',
        text_align: 'left',
        grain_effect: false,
        border_style: 'none',
        font_scale: 'lg',
        texture: 'none',
        promo_badge: ''
    };

    const layoutConfig: any = {
        classic: "flex-col justify-end p-8",
        minimal: "flex-col justify-center items-center p-10 text-center",
        cyber: "flex-col justify-between p-6",
        bold: "flex-col justify-end p-6"
    };

    const fontScales: any = {
        md: "text-xl",
        lg: "text-2xl",
        xl: "text-3xl",
        '2xl': "text-4xl md:text-5xl"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOptions}
            transition={{ delay: index * 0.15, duration: 0.8 }}
            className={`group relative overflow-hidden rounded-[2rem] bg-[#050505] aspect-[3/4] flex shadow-2xl transition-all duration-500 hover:shadow-[0_0_50px_-10px_rgba(200,138,4,0.3)] ${layoutConfig[design.layout] || layoutConfig.classic}`}
        >
            {/* 1. Base Texture/Effect */}
            {design.grain_effect && <div className="absolute inset-0 z-30 opacity-[0.15] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />}
            {design.texture === 'grid' && <div className="absolute inset-0 z-20 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />}

            {/* 2. Background Image */}
            <div className="absolute inset-0 z-0">
                {data.image_url ? (
                    <Image
                        src={data.image_url}
                        alt="Background"
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        style={{
                            filter: `blur(${design.blur_amount}px) contrast(1.1)`,
                            opacity: 1 - (design.overlay_opacity * 0.8)
                        }}
                    />
                ) : (
                    <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                        <ImageIcon className="text-white/5 w-24 h-24" />
                    </div>
                )}

                {/* 3. Gradient Overlays */}
                <div className="absolute inset-0 z-10"
                    style={{
                        background: design.layout === 'minimal'
                            ? `radial-gradient(circle at center, transparent 0%, #000000 120%)`
                            : `linear-gradient(to top, #000000 ${design.layout === 'bold' ? '90%' : '50%'}, transparent 100%)`
                    }}
                />
                <div className="absolute inset-0 z-10 opacity-60 mix-blend-overlay" style={{ backgroundColor: design.accent_color }} />
            </div>

            {/* --- DECORATIVE ELEMENTS (HUD) --- */}
            {design.border_style === 'tech' && (
                <div className="absolute inset-4 z-40 border border-white/20 rounded-xl pointer-events-none group-hover:border-white/40 transition-colors">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: design.accent_color }} />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: design.accent_color }} />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: design.accent_color }} />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: design.accent_color }} />
                </div>
            )}

            {design.border_style === 'double' && (
                <div className="absolute inset-6 z-40 border-4 border-double border-white/20 rounded-xl pointer-events-none" />
            )}

            {design.border_style === 'solid' && (
                <div className="absolute inset-0 z-40 border-[12px] pointer-events-none transition-all duration-500 group-hover:border-[8px]" style={{ borderColor: design.accent_color }} />
            )}

            {/* --- CONTENT LAYER --- */}
            <div className={`relative z-50 flex flex-col gap-3 ${design.text_align === 'center' ? 'items-center text-center' : 'items-start text-left'}`}>

                {/* Badge / Category */}
                <div className="flex items-center gap-2 mb-2">
                    {design.promo_badge && (
                        <span className="px-3 py-1 bg-white text-black text-[10px] font-black uppercase tracking-widest transform -skew-x-12 shadow-lg">
                            {design.promo_badge}
                        </span>
                    )}
                    <span
                        className="px-3 py-1 border text-[9px] font-black uppercase tracking-[0.2em] backdrop-blur-md rounded-sm"
                        style={{
                            borderColor: `${design.accent_color}60`,
                            color: design.accent_color,
                            backgroundColor: `${design.accent_color}10`
                        }}
                    >
                        {data.category || 'NEWS'}
                    </span>
                </div>

                {/* Main Title */}
                <h3
                    className={`${fontScales[design.font_scale || 'lg']} font-black leading-[0.9] tracking-tighter text-white uppercase break-words w-full group-hover:scale-[1.02] transition-transform duration-500`}
                    style={{
                        textShadow: design.layout === 'cyber' ? `3px 3px 0px ${design.accent_color}80` : '0 10px 30px rgba(0,0,0,0.5)',
                        fontFamily: design.layout === 'minimal' ? 'serif' : 'inherit'
                    }}
                >
                    {data.title}
                </h3>

                {/* Divider */}
                {design.layout !== 'bold' && (
                    <div className="w-12 h-1 rounded-full transition-all duration-500 group-hover:w-20" style={{ backgroundColor: design.accent_color }} />
                )}

                {/* Content */}
                <p
                    className="text-xs md:text-sm text-gray-300 font-medium leading-relaxed max-w-[90%] line-clamp-3 opacity-90 group-hover:opacity-100 transition-opacity"
                    style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
                >
                    {data.content}
                </p>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-white/10 w-full flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                    <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">ETER EXCLUSIVE</span>
                    <ArrowUpRight size={16} className="text-white" />
                </div>
            </div>
        </motion.div>
    );
};

const AnnouncementsSection = () => {
    const { announcements, loading } = useAnnouncements();

    const displayAnnouncements = useMemo(() => {
        if (announcements && announcements.length > 0) {
            // Favor active and recently published ones
            return announcements.filter(a => a.is_active).slice(0, 6);
        }
        return [];
    }, [announcements]);

    return (
        <section id="announcements" className="py-32 bg-[#050505] relative overflow-hidden border-t border-white/5">
            {/* Background Tech Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(200,138,4,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(200,138,4,0.02)_1px,transparent_1px)] bg-[size:60px_60px] opacity-20" />

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[60vh] bg-[#C88A04]/5 blur-[120px] rounded-full pointer-events-none opacity-40 translate-y-1/4" />

            {/* Section Header */}
            <div className="container mx-auto px-6 mb-24 relative z-10">
                <div className="flex flex-col lg:flex-row justify-between items-end gap-12">
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={viewportOptions}
                            className="flex items-center gap-4 mb-6"
                        >
                            <div className="h-[1px] w-12 bg-[#C88A04]" />
                            <span className="text-[#C88A04] font-mono text-xs tracking-[0.5em] uppercase">Sincronización_Global</span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                            viewport={viewportOptions}
                            className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase leading-[0.85] mb-8"
                        >
                            ÉTER <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C88A04] via-[#ECA413] to-[#C88A04]">BROADCAST</span>
                        </motion.h2>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 px-3 py-1 bg-black/50 border border-white/10 rounded-full">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest">Señal_Continua</span>
                            </div>
                            <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">Estatus_Enlace: ESTABLE v4.2</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-6 group">
                        <p className="text-gray-500 text-right text-xs max-w-[280px] font-medium leading-relaxed">
                            Accede a las últimas transmisiones, drops exclusivos y actualizaciones del ecosistema Éter en tiempo real.
                        </p>
                        <Link href="/catalog">
                            <MagneticButton variant="outline" className="h-14 px-10 border-white/10 text-white hover:bg-white hover:text-black hover:border-transparent rounded-full font-black text-[10px] tracking-[0.25em] uppercase transition-all flex items-center gap-3">
                                EXPLORAR ARCHIVO <Plus size={16} />
                            </MagneticButton>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="aspect-[3/4] bg-white/5 rounded-[2rem] animate-pulse" />
                        ))}
                    </div>
                ) : displayAnnouncements.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {displayAnnouncements.map((ann, idx) => (
                            <FlyerCard
                                key={ann.id}
                                data={ann}
                                index={idx}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 border border-dashed border-white/10 rounded-[3rem] bg-white/[0.02]">
                        <Megaphone size={40} className="text-[#C88A04] mx-auto mb-6 opacity-50" />
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Señal Silenciosa</h3>
                        <p className="text-gray-500">No hay transmisiones activas en este momento.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default function LandingPage() {
    const { products: dbProducts, loading } = useCatalog();

    // Combine curated fallbacks with DB products, favoring DB ones
    const products = useMemo(() => {
        if (dbProducts && dbProducts.length > 0) return dbProducts;
        return CURATED_PRODUCTS;
    }, [dbProducts]);

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
            <AnnouncementsSection />

            <Footer />
        </main>
    );
}
