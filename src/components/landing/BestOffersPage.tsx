'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    BadgeCheck,
    BarChart3,
    Box,
    CheckCircle2,
    DollarSign,
    Menu,
    PackageCheck,
    ShieldCheck,
    ShoppingBag,
    Star,
    Truck,
    Users,
    Flame,
    TrendingUp,
    Trophy
} from 'lucide-react';
import { Product } from '@/domain/entities/Product';
import { useCatalog } from '@/hooks/useCatalog';
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

const metrics = [
    { icon: Trophy, value: 'TOP 1', label: 'Favoritos de MDQ', sub: 'Selección de la semana' },
    { icon: Flame, value: '-30%', label: 'Descuentos Flash', sub: 'En modelos seleccionados' },
    { icon: TrendingUp, value: '+200', label: 'Pares vendidos hoy', sub: 'Alta rotación' },
    { icon: BadgeCheck, value: 'Elite', label: 'Curaduría Best', sub: 'Solo lo más buscado' },
];

function Hero() {
    return (
        <section className="relative z-0 overflow-hidden bg-[#050505] pt-28">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_44%_32%,rgba(0,229,255,.15),transparent_35%),radial-gradient(circle_at_82%_44%,rgba(198,255,0,.16),transparent_35%),radial-gradient(circle_at_20%_80%,rgba(122,0,255,.12),transparent_30%)]" />
            <div className="grunge-overlay" />
            
            <div className="mx-auto grid min-h-[690px] max-w-[1440px] grid-cols-1 items-center gap-8 px-5 pb-8 md:px-10 lg:grid-cols-[.9fr_1.1fr]">
                <motion.div initial="hidden" animate="visible" variants={stagger} className="relative z-10 max-w-[610px] pt-8">
                    <motion.div variants={fadeUp} transition={{ duration: 0.75, ease: easeOut }} className="mb-6 flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full bg-[#C6FF00] shadow-[0_0_12px_#C6FF00] animate-pulse" />
                        <span className="text-sm font-black uppercase tracking-[0.2em] text-white">Top Sellers & Ofertas</span>
                    </motion.div>
                    
                    <motion.h1 
                        variants={fadeUp} 
                        transition={{ duration: 0.85, ease: easeOut }} 
                        className="mb-4 relative w-full h-[100px] sm:h-[150px] md:h-[220px]"
                    >
                        <span className="sr-only">ÉTER BEST</span>
                        <Image 
                            src="/texto.png" 
                            alt="ÉTER BEST" 
                            fill
                            priority
                            className="object-contain object-left pointer-events-none drop-shadow-[0_0_35px_rgba(0,229,255,0.2)]"
                        />
                    </motion.h1>

                    <motion.p variants={fadeUp} transition={{ duration: 0.75, ease: easeOut }} className="mb-2 text-lg font-black uppercase tracking-[0.18em] text-white/90">La selección elite de Mar del Plata.</motion.p>
                    
                    <motion.p variants={fadeUp} transition={{ duration: 0.75, ease: easeOut }} className="mb-5 text-4xl font-black uppercase leading-none tracking-[-0.04em] sm:text-5xl mt-4">
                        <span className="text-[#00E5FF]">Más vendidos.</span> <br className="sm:hidden" /><span className="text-[#C6FF00]">Mejores precios.</span> <br className="sm:hidden" /><span className="text-[#7A00FF]">Stock limitado.</span>
                    </motion.p>

                    <motion.p variants={fadeUp} transition={{ duration: 0.75, ease: easeOut }} className="mb-7 text-sm font-bold uppercase tracking-[0.05em] text-white/60">
                        Accedé a los modelos que definen la tendencia en MDQ. Curaduría exclusiva con precios de oportunidad directa.
                    </motion.p>

                    <motion.div variants={fadeUp} transition={{ duration: 0.75, ease: easeOut }} className="flex flex-col gap-5 sm:flex-row mt-4">
                        <Link href="/catalog" className="eter-btn-glass group">
                            APROVECHAR OFERTAS <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" size={18} />
                        </Link>
                        <Link href="/catalog?category=sneakers" className="eter-outline-cta">
                            VER TOP SELLERS
                        </Link>
                    </motion.div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 60, scale: 0.96 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: 1.05, ease: easeOut, delay: 0.2 }} className="relative z-10">
                    <div className="absolute bottom-12 left-4 right-0 mx-auto h-[120px] max-w-[700px] bg-[#C6FF00]/10 blur-3xl" />
                    <motion.div animate={{ y: [0, -10, 0], rotate: [0, 1.5, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
                        <Image
                            src="/hero.webp"
                            alt="Top Sneakers ÉTER Mar del Plata"
                            width={1024}
                            height={1024}
                            priority
                            className="relative mx-auto h-auto w-full max-w-[660px] object-contain drop-shadow-[0_40px_55px_rgba(0,0,0,.75)] lg:max-w-[720px]"
                        />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}

function ProductSection({ products }: { products: Product[] }) {
    // Simulamos selección de "Best Sellers" o productos en oferta
    const bestSellers = products
        .filter(p => p.liquidationActive || p.basePrice < 60000)
        .slice(0, 12);

    return (
        <section className="relative z-0 bg-[#050505] px-5 py-20 md:px-10">
            <div className="mx-auto max-w-[1440px]">
                <div className="mb-12 flex items-end justify-between">
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-white md:text-5xl">
                            LO MÁS <span className="text-[#C6FF00]">HOT</span> DE ÉTER
                        </h2>
                        <p className="mt-2 text-sm font-black uppercase tracking-[0.2em] text-white/40">Zapatillas que no duran 24hs en stock</p>
                    </div>
                    <Link href="/catalog" className="text-xs font-black uppercase tracking-widest text-[#00E5FF] hover:underline hidden md:block">
                        Explorar todo el vault
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                    {bestSellers.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link href={`/catalog/${product.id}`} className="product-card group block p-3">
                                <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-black/40">
                                    <Image 
                                        src={product.images[0]} 
                                        alt={product.name} 
                                        fill 
                                        className="object-cover transition-transform duration-500 group-hover:scale-110" 
                                    />
                                    {product.liquidationActive && (
                                        <div className="absolute top-2 right-2 rounded-full bg-[#C6FF00] px-3 py-1 text-[9px] font-black uppercase text-black">
                                            Oferta
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className="line-clamp-1 text-[11px] font-black uppercase text-white">{product.name}</h3>
                                    <span className="text-sm font-black text-[#00E5FF]">${product.basePrice.toLocaleString()}</span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default function BestOffersPage() {
    const { products } = useCatalog();

    return (
        <main className="flex flex-col min-h-screen text-white">
            <Navbar />
            <Hero />
            <section className="bg-[#050505] py-10 px-5 md:px-10">
                <div className="eter-card mx-auto grid max-w-[1440px] grid-cols-2 lg:grid-cols-4">
                    {metrics.map((m, i) => (
                        <div key={m.label} className="flex items-center gap-4 p-6 border-white/5 border-r last:border-r-0">
                            <m.icon className="text-[#00E5FF]" size={32} strokeWidth={1.5} />
                            <div>
                                <div className="text-2xl font-black">{m.value}</div>
                                <div className="text-[10px] font-bold uppercase text-white/40">{m.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            <ProductSection products={products || []} />
            <Footer />
        </main>
    );
}
