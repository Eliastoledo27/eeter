'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
    PackageSearch,
    Share2,
    Wallet,
    Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BrandMarquee } from '@/components/catalog/BrandMarquee';
import { Product } from '@/domain/entities/Product';
import { useCatalog } from '@/hooks/useCatalog';
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

const HeroSection = ({ products }: { products: Product[] }) => {
    const heroProduct = useMemo(() => {
        if (!products || !products.length) return null;
        return [...products].sort((a, b) => b.basePrice - a.basePrice)[0];
    }, [products]);

    const primaryHeroImage = heroProduct?.images?.[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=90&w=2400&auto=format&fit=crop";

    return (
        <section className="relative h-screen min-h-[600px] w-full flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 -z-10">
                <Image
                    src={primaryHeroImage}
                    alt="Background"
                    fill
                    priority
                    quality={90}
                    className="object-cover"
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/40 via-[#0A0A0A]/60 to-[#0A0A0A]" />
            </div>

            <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-20">
                <span
                    className="inline-block px-4 py-1 bg-[#C88A04]/20 border border-[#C88A04]/30 text-[#C88A04] text-xs font-bold tracking-[0.3em] uppercase rounded-full mb-6 backdrop-blur-md"
                >
                    Tu Negocio Digital
                </span>

                <h1
                    className="text-[18vw] md:text-[12rem] font-bold tracking-tighter text-white mb-4 leading-[0.85] select-none"
                >
                    ÉTER
                </h1>

                <p
                    className="text-gray-300 text-base md:text-xl max-w-2xl mx-auto mb-10 font-light tracking-wide"
                >
                    Vende calzado premium brasilero desde tu casa y genera ingresos reales. Nosotros manejamos la logística. Vos enfocate en vender.
                </p>

                <div
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link href="/catalog" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto h-16 px-10 bg-[#C88A04] hover:bg-[#ECA413] text-black font-bold tracking-widest uppercase rounded-full transition-all transform transform-gpu hover:scale-105 text-sm">
                            Ver Catálogo
                        </Button>
                    </Link>
                    <Link href="/register" className="w-full sm:w-auto">
                        <Button variant="outline" className="w-full sm:w-auto h-16 px-10 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white border-white/20 font-bold tracking-widest uppercase rounded-full transition-all text-sm">
                            Comenzar Ahora
                        </Button>
                    </Link>
                </div>
            </div>

            <div
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <span className="text-[10px] tracking-[0.5em] uppercase text-gray-500">Scroll</span>
                <div className="w-px h-12 bg-gradient-to-b from-[#C88A04] to-transparent" />
            </div>
        </section >
    );
};

const ProductShowcase = ({ products, loading }: { products: Product[], loading: boolean }) => {
    const showcaseProducts = useMemo(() => {
        if (!products || !products.length) return [];
        return [...products].sort((a, b) => b.basePrice - a.basePrice).slice(0, 8);
    }, [products]);

    if (loading) return (
        <section className="py-24 bg-[#0A0A0A]">
            <div className="container mx-auto px-6 h-[400px] bg-white/[0.02] rounded-3xl animate-pulse" />
        </section>
    );

    return (
        <section className="py-24 bg-[#050505] overflow-hidden border-t border-white/5">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-bold tracking-tighter text-white uppercase">Trending Now</h2>
                    <p className="text-gray-500 tracking-widest uppercase text-xs mt-2">Drops Limitados</p>
                </div>
                <div className="flex gap-4">
                    <Link href="/catalog" className="h-12 px-6 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors text-xs font-bold uppercase tracking-widest text-white">
                        Ver Todos
                    </Link>
                </div>
            </div>
            <div className="flex gap-6 overflow-x-auto no-scrollbar px-6 lg:px-12 pb-8">
                {showcaseProducts.map((product) => (
                    <Link href="/catalog" key={product.id} className="min-w-[300px] md:min-w-[360px] group cursor-pointer block">
                        <div className="relative aspect-[3/4] bg-[#111] rounded-2xl overflow-hidden mb-6 border border-white/5 group-hover:border-[#C88A04]/30 transition-colors">
                            <Image
                                src={product.images?.[0] || 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80'}
                                alt={product.name}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover transition-transform duration-700 group-hover:scale-110 will-change-transform transform-gpu"
                            />
                            <div className="absolute top-4 left-4">
                                <span className="bg-[#C88A04] text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg">
                                    {product.category}
                                </span>
                            </div>
                        </div>
                        <div className="flex justify-between items-start">
                            <div className="pr-4">
                                <h3 className="text-xl font-bold tracking-tight text-white line-clamp-1">{product.name}</h3>
                                <p className="text-gray-500 text-xs uppercase tracking-widest mt-1 line-clamp-1">{product.description}</p>
                            </div>
                            <span className="text-lg font-bold text-[#C88A04] whitespace-nowrap">${product.basePrice.toLocaleString('es-AR')}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

const PhilosophySection = () => {
    return (
        <section id="philosophy" className="py-24 bg-[#0A0A0A] px-6 lg:px-12 border-t border-white/5">
            <div className="max-w-[1440px] mx-auto">
                <div
                    className="mb-12"
                >
                    <span className="text-[#C88A04] font-bold tracking-widest text-sm uppercase mb-4 block">Nuestros Pilares</span>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">
                        Tu Éxito Es <br /> Nuestro Éxito.
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:auto-rows-[340px]">
                    <div className="md:col-span-8 md:row-span-2 relative group overflow-hidden rounded-3xl border border-white/5 bg-[#111]">
                        <Image
                            src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80"
                            alt="Calzado Premium"
                            fill
                            sizes="(max-width: 768px) 100vw, 66vw"
                            className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80 will-change-transform transform-gpu"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-12 left-8 md:left-12 text-white">
                            <h3 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 uppercase">CALZADO PREMIUM</h3>
                            <p className="text-base md:text-lg mb-6 max-w-sm text-gray-300">Zapatillas brasileras de máxima calidad. Marcas exclusivas que tus clientes van a querer.</p>
                        </div>
                    </div>

                    <div className="md:col-span-4 md:row-span-2 relative group overflow-hidden rounded-3xl bg-[#111] border border-white/5">
                        <Image
                            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80"
                            alt="Logística Incluida"
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-30 will-change-transform transform-gpu"
                        />
                        <div className="absolute top-12 left-8 md:left-12 text-white">
                            <h3 className="text-3xl font-bold tracking-tighter mb-2 uppercase">LOGÍSTICA<br />INCLUIDA</h3>
                            <p className="text-gray-400 text-sm uppercase tracking-widest">Nosotros Enviamos</p>
                        </div>
                        <div className="absolute bottom-12 left-8 md:left-12 text-gray-300 text-sm max-w-[200px]">
                            Nos encargamos del stock, envíos y atención al cliente. Vos solo vendés.
                        </div>
                        <div className="absolute bottom-12 right-8">
                            <div className="size-12 rounded-full bg-[#C88A04] flex items-center justify-center text-black">
                                <Truck size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-12 md:row-span-1 relative group overflow-hidden rounded-3xl bg-[#C88A04]">
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-8xl md:text-9xl font-black text-black/10 select-none">PROFIT</span>
                        </div>
                        <div className="relative z-10 p-8 md:p-12 h-full flex flex-col justify-center text-black">
                            <h3 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4 uppercase">INGRESOS REALES</h3>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                                <p className="text-black/80 text-sm font-medium max-w-md">Ganá lo mismo que un empleado de comercio, pero trabajando desde tu casa con tu celular.</p>
                                <Wallet size={32} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const TechSection = () => {
    return (
        <section id="how-it-works" className="py-32 bg-[#050505] relative overflow-hidden border-t border-white/5">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[#C88A04]/5 -skew-x-12 translate-x-1/4 pointer-events-none" />
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div className="relative z-10">
                    <div className="absolute -top-10 -left-10 text-[8rem] md:text-[12rem] font-black text-white/[0.02] leading-none pointer-events-none">SYSTEM</div>
                    <h2 className="text-5xl md:text-6xl font-bold tracking-tighter text-white mb-10 leading-[0.9] uppercase">
                        VENDER <br /> NUNCA FUE <br /> <span className="text-[#C88A04]">TAN SIMPLE.</span>
                    </h2>
                    <div className="space-y-10">
                        {[
                            {
                                title: '01. ELEGÍ TUS PRODUCTOS',
                                desc: 'Navegá nuestro catálogo de zapatillas premium y seleccioná las que mejor encajen con tu audiencia.',
                                icon: PackageSearch
                            },
                            {
                                title: '02. PUBLICÁ Y VENDÉ',
                                desc: 'Compartí en tus redes sociales con las fotos de alta calidad que te proporcionamos.',
                                icon: Share2
                            },
                            {
                                title: '03. COBRÁ TU GANANCIA',
                                desc: 'Recibí comisiones directas por cada venta. Transparencia total y sin inversión inicial.',
                                icon: Wallet
                            }
                        ].map((spec, idx) => (
                            <div key={idx} className="flex gap-6">
                                <div className="shrink-0 size-14 rounded-full border border-[#C88A04]/50 flex items-center justify-center text-[#C88A04]">
                                    <spec.icon size={24} />
                                </div>
                                <div>
                                    <h4 className="text-lg md:text-xl font-bold text-white mb-2 tracking-tight">{spec.title}</h4>
                                    <p className="text-gray-400 leading-relaxed text-sm md:text-base">{spec.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="relative group z-10">
                    <div className="absolute inset-0 bg-[#C88A04]/10 blur-[100px] rounded-full scale-75 transform-gpu pointer-events-none" />
                    <Image
                        src="https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80"
                        alt="Ecosistema Logístico"
                        width={800}
                        height={800}
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="relative z-10 w-full rounded-2xl grayscale hover:grayscale-0 transition-all duration-700 object-cover aspect-square will-change-transform"
                    />
                    <div className="absolute -top-4 -right-4 z-20 size-32 border-t-2 border-r-2 border-[#C88A04]" />
                    <div className="absolute -bottom-4 -left-4 z-20 size-32 border-b-2 border-l-2 border-[#C88A04]" />
                </div>
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
            <Navbar />

            <HeroSection products={products} />
            <BrandMarquee />
            <PhilosophySection />
            <ProductShowcase products={products} loading={loading} />
            <TechSection />

            <Footer />
        </main>
    );
}

