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
} from 'lucide-react';
import { Product } from '@/domain/entities/Product';
import { useCatalog } from '@/hooks/useCatalog';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductType } from '@/app/actions/products';
import { mapProductTypeToProduct } from '@/lib/product-mapping';
import { useRouter } from 'next/navigation';

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

const fallbackProducts: Product[] = [
    {
        id: 'adidas-forum',
        name: 'ADIDAS FORUM',
        description: 'Modelo urbano premium listo para publicar.',
        basePrice: 55000,
        brand: 'Adidas',
        images: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=700&h=700&fit=crop'],
        category: 'Sneakers',
        stockBySize: {},
        totalStock: 18,
        status: 'active',
        createdAt: new Date(),
    },
    {
        id: 'jordan-high',
        name: 'AIR JORDAN 1 HIGH',
        description: 'Silueta clásica de alta rotación.',
        basePrice: 95000,
        brand: 'Jordan',
        images: ['https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=700&h=700&fit=crop'],
        category: 'Sneakers',
        stockBySize: {},
        totalStock: 9,
        status: 'active',
        createdAt: new Date(),
    },
    {
        id: 'samba-og',
        name: 'ADIDAS SAMBA OG',
        description: 'Tendencia de calle con salida rápida.',
        basePrice: 55000,
        brand: 'Adidas',
        images: ['https://images.unsplash.com/photo-1562183241-b937e95585b6?q=80&w=700&h=700&fit=crop'],
        category: 'Sneakers',
        stockBySize: {},
        totalStock: 24,
        status: 'active',
        createdAt: new Date(),
    },
    {
        id: 'air-max-90',
        name: 'AIR MAX 90',
        description: 'Running urbano de margen alto.',
        basePrice: 75000,
        brand: 'Nike',
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=700&h=700&fit=crop'],
        category: 'Running',
        stockBySize: {},
        totalStock: 13,
        status: 'active',
        createdAt: new Date(),
    },
    {
        id: 'yeezy-350',
        name: 'YEEZY BOOST 350',
        description: 'Par aspiracional para catálogo premium.',
        basePrice: 120000,
        brand: 'Yeezy',
        images: ['https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?q=80&w=700&h=700&fit=crop'],
        category: 'Sneakers',
        stockBySize: {},
        totalStock: 6,
        status: 'active',
        createdAt: new Date(),
    },
    {
        id: 'dunk-low',
        name: 'NIKE DUNK LOW',
        description: 'Modelo de alta demanda semanal.',
        basePrice: 60000,
        brand: 'Nike',
        images: ['https://images.unsplash.com/photo-1600269452121-4f2416e55c28?q=80&w=700&h=700&fit=crop'],
        category: 'Sneakers',
        stockBySize: {},
        totalStock: 21,
        status: 'active',
        createdAt: new Date(),
    },
];

const metrics = [
    { icon: Users, value: '+500', label: 'Revendedores', sub: 'Activos' },
    { icon: Box, value: '+12k', label: 'Pares entregados', sub: 'Logística propia' },
    { icon: BarChart3, value: 'Margen', label: 'Propio', sub: 'Vos ponés el precio' },
    { icon: ShieldCheck, value: 'G5 / OG', label: 'Calidad', sub: 'La elite del calzado' },
];

const benefits = [
    { icon: Truck, title: 'Vos vendés', text: 'Nosotros nos encargamos del resto.' },
    { icon: DollarSign, title: 'Margen propio', text: 'Ganás lo que vos decidas sumarle al par.' },
    { icon: PackageCheck, title: 'Sin inversión', text: 'Publicás sin comprar stock previo.' },
    { icon: Star, title: 'Alta rotación', text: 'Modelos tendencia que salen solos.' },
];

const testimonials = [
    {
        name: 'Valentina R.',
        city: 'Mar del Plata, MDQ',
        since: 'Revendedora desde 2024',
        quote: 'Me cambió el juego. Pasé de vender ropa a enfocarme 100% en ÉTER. Consulto stock, cierro la venta y me olvido del envío. La ganancia me queda limpia en el momento.',
        win: '$450k',
        orders: '35',
        rating: '5.0',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=160&h=160&fit=crop',
    },
    {
        name: 'Matías G.',
        city: 'Mar del Plata, MDQ',
        since: 'Revendedor desde 2025',
        quote: 'La velocidad es todo. Meto 2 o 3 ventas por día y me quedo tranquilo porque el producto es de primera. Mis clientes se vuelven locos con la calidad G5.',
        win: '$620k',
        orders: '52',
        rating: '5.0',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=160&h=160&fit=crop',
    },
    {
        name: 'Carolina M.',
        city: 'Envíos Nacionales',
        since: 'Revendedora desde 2024',
        quote: 'Coordino todo desde el celu. ÉTER me resuelve la logística y yo solo me encargo de que los clientes vean los modelos nuevos. Es un sistema que no falla si le ponés pilas.',
        win: '$980k',
        orders: '80',
        rating: '4.9',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=160&h=160&fit=crop',
    },
];

function Hero() {
    return (
        <section className="relative z-0 overflow-hidden bg-[#050505] pt-28">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_44%_32%,rgba(198,255,0,.15),transparent_35%),radial-gradient(circle_at_82%_44%,rgba(122,0,255,.16),transparent_35%),radial-gradient(circle_at_20%_80%,rgba(0,229,255,.12),transparent_30%)]" />
            
            <motion.div 
                animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: [0.3, 0.4, 0.3],
                    rotate: [0, 3, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                
                className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-gradient-to-br from-[#C6FF00]/10 to-transparent blur-[60px] rounded-full"
            />
            <div className="brush-stroke brush-tricolor top-[15%] -right-[5%] opacity-40 rotate-[15deg] hidden lg:block" />
            <motion.div 
                animate={{ 
                    scale: [1.05, 1, 1.05],
                    opacity: [0.2, 0.3, 0.2],
                    rotate: [0, -3, 0]
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                
                className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-gradient-to-tr from-[#7A00FF]/10 to-transparent blur-[50px] rounded-full"
            />

            <div className="grunge-overlay" />
            
            <motion.div 
                animate={{ 
                    x: [0, 10, 0], 
                    y: [0, -5, 0], 
                    scale: [1, 1.05, 1],
                    rotate: [0, 3, 0] 
                }} 
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} 
                
                className="paint-splatter splat-cyan -left-20 top-40 hidden md:block opacity-30 blur-[1px]" 
            />
            <motion.div 
                animate={{ 
                    x: [0, -8, 0], 
                    y: [0, 10, 0], 
                    scale: [1, 1.02, 1],
                    rotate: [45, 48, 45] 
                }} 
                transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }} 
                
                className="paint-splatter splat-purple -right-10 bottom-40 hidden md:block opacity-25" 
            />
            <motion.div 
                animate={{ 
                    x: [0, 8, 0], 
                    y: [0, 15, 0], 
                    scale: [1, 1.1, 1],
                    rotate: [-10, -5, -10] 
                }} 
                transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 4 }} 
                
                className="paint-splatter splat-green left-[30%] -top-10 hidden md:block opacity-20 blur-[1px]" 
            />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />
            <div className="mx-auto grid min-h-[690px] max-w-[1440px] grid-cols-1 items-center gap-8 px-5 pb-8 md:px-10 lg:grid-cols-[.9fr_1.1fr]">
                <motion.div initial="hidden" animate="visible" variants={stagger} className="relative z-10 max-w-[610px] pt-8">
                    <span className="brush-stroke brush-cyan -left-10 top-20 hidden md:block opacity-60 blur-[0.5px]" />
                    <span className="brush-stroke brush-green -left-2 top-24 hidden md:block animate-float-slow" />
                    <span className="brush-stroke brush-purple left-44 top-52 hidden md:block animate-float-organic" />
                    <span className="brush-stroke brush-cyan right-0 bottom-40 hidden md:block opacity-40 rotate-[15deg]" />
                    <motion.div variants={fadeUp} transition={{ duration: 0.75, ease: easeOut }} className="mb-6 flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full bg-[#00E5FF] shadow-[0_0_12px_#00E5FF] animate-pulse" />
                        <span className="text-sm font-black uppercase tracking-[0.2em] text-white">Live drop</span>
                    </motion.div>
                    <motion.h1 
                        variants={fadeUp} 
                        transition={{ duration: 0.85, ease: easeOut }} 
                        className="mb-4 relative w-full max-w-[400px] sm:max-w-[500px] md:max-w-[700px] h-[100px] sm:h-[150px] md:h-[220px]"
                    >
                        <span className="sr-only">ÉTER</span>
                        <Image 
                            src="/texto.png" 
                            alt="ÉTER branding" 
                            fill
                            priority
                            className="object-contain object-left pointer-events-none drop-shadow-[0_0_35px_rgba(255,255,255,0.15)]"
                        />
                    </motion.h1>
                    <motion.p variants={fadeUp} transition={{ duration: 0.75, ease: easeOut }} className="mb-2 text-lg font-black uppercase tracking-[0.18em] text-white/90">Calzado premium de alta gama.</motion.p>
                    <motion.p variants={fadeUp} transition={{ duration: 0.75, ease: easeOut }} className="mb-5 text-4xl font-black uppercase leading-none tracking-[-0.04em] sm:text-5xl mt-4">
                        <span className="text-[#C6FF00]">Sin stock.</span> <br className="sm:hidden" /><span className="text-[#00E5FF]">Sin límites.</span> <br className="sm:hidden" /><span className="text-[#7A00FF]">Risk-free.</span>
                    </motion.p>
                    <motion.p variants={fadeUp} transition={{ duration: 0.75, ease: easeOut }} className="mb-7 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.05em] text-white">
                        <span className="flex -space-x-2">
                            {testimonials.map((t) => (
                                <Image key={t.name} src={t.avatar} alt="" width={28} height={28} className="h-7 w-7 rounded-full border border-black object-cover" />
                            ))}
                        </span>
                        <span><span className="text-[#00E5FF]">+500</span> revendedores activos en Argentina</span>
                    </motion.p>
                    <motion.div variants={fadeUp} transition={{ duration: 0.75, ease: easeOut }} className="flex flex-col gap-5 sm:flex-row mt-4">
                        <Link href="/catalog" className="eter-btn-glass group">
                            VER CATÁLOGO <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" size={18} />
                        </Link>
                        <Link href="/register" className="eter-outline-cta">
                            UNIRME COMO REVENDEDOR
                        </Link>
                    </motion.div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 60, scale: 0.96 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: 1.05, ease: easeOut, delay: 0.2 }} className="relative z-10 min-h-[380px] lg:min-h-[620px]">
                    <span className="brush-stroke brush-green right-8 top-24 hidden scale-125 lg:block animate-float-fast" />
                    <span className="brush-stroke brush-purple bottom-24 left-16 hidden scale-110 lg:block opacity-80" />
                    <span className="brush-stroke brush-cyan -right-12 bottom-48 hidden lg:block rotate-[120deg] opacity-50" />
                    
                    <motion.div 
                        animate={{ y: [0, -15, 0], x: [0, 10, 0], scale: [1, 1.1, 1] }} 
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        
                        className="absolute -top-10 -right-20 w-40 h-40 bg-gradient-to-br from-[#00E5FF]/20 to-transparent blur-[30px] rounded-full hidden lg:block" 
                    />
                    <motion.div 
                        animate={{ y: [0, 15, 0], x: [0, -10, 0], scale: [1.05, 0.95, 1.05] }} 
                        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        
                        className="absolute -bottom-20 -left-10 w-56 h-56 bg-gradient-to-tr from-[#7A00FF]/15 to-transparent blur-[40px] rounded-full hidden lg:block" 
                    />
                    <div className="absolute bottom-12 left-4 right-0 mx-auto h-[120px] max-w-[700px] bg-[#00E5FF]/10 blur-3xl" />
                    <motion.div  animate={{ y: [0, -10, 0], rotate: [0, -1.5, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
                    <Image
                        src="/hero.png"
                        alt="Zapatillas Premium Éter"
                        width={900}
                        height={700}
                        priority
                        className="relative z-10 h-auto w-full object-contain drop-shadow-[0_20px_80px_rgba(0,229,255,0.25)]"
                    />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}

function MetricsBar() {
    return (
        <section className="relative z-0 bg-[#050505] px-5 md:px-10" >
            <div className="paint-splatter splat-cyan -right-20 top-1/2 -translate-y-1/2 opacity-20" />
            <div className="eter-card mx-auto grid max-w-[1440px] grid-cols-2 overflow-hidden lg:grid-cols-4">
                {metrics.map(({ icon: Icon, value, label, sub }, index) => (
                    <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.6, ease: easeOut, delay: index * 0.06 }}
                        whileHover={{ backgroundColor: 'rgba(198,255,0,0.035)' }}
                        
                        className="group relative flex items-center gap-5 border-white/10 px-5 py-5 even:border-l lg:border-l lg:first:border-l-0"
                    >
                        <span className={`brush-stroke brush-${index % 3 === 0 ? 'cyan' : index % 3 === 1 ? 'green' : 'purple'} -top-1 right-2 h-2 w-12 opacity-0 transition-opacity group-hover:opacity-40`} />
                        <Icon className={`h-9 w-9 shrink-0 ${index === 0 ? 'text-[#00E5FF]' : index === 1 ? 'text-[#C6FF00]' : index === 2 ? 'text-[#7A00FF]' : 'text-[#00E5FF]'}`} strokeWidth={1.8} />
                        <div>
                            <div className="text-2xl font-black leading-none text-white md:text-3xl">{value}</div>
                            <div className="mt-1 text-[11px] font-black uppercase tracking-[0.12em] text-white">{label}</div>
                            <div className="text-[10px] uppercase tracking-[0.08em] text-white/55">{sub}</div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

function ProductSection({ products }: { products: Product[] }) {
    const visibleProducts = products.slice(0, 6);

    return (
        <section className="relative z-0 bg-[#050505] px-5 py-6 md:px-10" >
            <div className="paint-splatter splat-green -left-14 top-10 hidden md:block" />
            <div className="paint-splatter splat-purple -right-10 bottom-20 hidden md:block opacity-40" />
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                variants={stagger}
                className="mx-auto max-w-[1440px]"
            >
                <motion.div variants={fadeUp} transition={{ duration: 0.65, ease: easeOut }} className="mb-3 flex items-center justify-between gap-4">
                    <h2 className="relative text-2xl font-black uppercase tracking-[-0.03em] text-white md:text-4xl">
                        <span className="brush-stroke brush-green -left-3 top-2 hidden w-40 opacity-40 md:block" />
                        <span className="relative">Modelos que ya se están vendiendo <span className="text-tri-gradient drop-shadow-[0_0_15px_rgba(0,229,255,0.3)]">hoy.</span></span>
                    </h2>
                    <Link href="/catalog" className="eter-outline-cta hidden h-10 items-center gap-3 px-6 text-[10px] md:inline-flex hover:border-[#00E5FF] hover:text-[#00E5FF] hover:bg-[#00E5FF]/5 transition-all">
                        Ver colección completa <ArrowRight size={14} className="text-[#C6FF00] group-hover:text-[#C6FF00]" />
                    </Link>
                </motion.div>
                <div className="flex snap-x gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible lg:grid-cols-6">
                    {visibleProducts.map((product, index) => (
                        <motion.div
                            key={product.id}
                            variants={fadeUp}
                            transition={{ duration: 0.55, ease: easeOut }}
                            whileHover={{ y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            
                        >
                        <Link
                            href={`/catalog/${product.id}`}
                            className="product-card group relative block min-w-[175px] snap-start overflow-hidden p-3"
                        >
                            <span className="brush-stroke brush-green right-2 top-2 h-4 w-16 opacity-70" />
                            <span className={`absolute left-3 top-3 z-10 rounded-sm px-2 py-1 text-[10px] font-black uppercase text-black ${index % 3 === 0 ? 'bg-[#C6FF00] shadow-[0_0_10px_#C6FF00]' : index % 3 === 1 ? 'bg-[#00E5FF] shadow-[0_0_10px_#00E5FF]' : 'bg-[#7A00FF] text-white shadow-[0_0_10px_#7A00FF]'}`}>
                                {index % 2 === 0 ? 'Hot' : 'New'}
                            </span>
                            <div className="relative mb-3 aspect-square overflow-hidden rounded-md bg-black">
                                <Image
                                    src={product.images?.[0] || fallbackProducts[0].images[0]}
                                    alt={product.name}
                                    fill
                                    sizes="220px"
                                    priority={index < 3}
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                            </div>
                            <div className="flex items-end justify-between gap-3">
                                <div>
                                    <h3 className="line-clamp-1 text-[11px] font-black uppercase text-white">{product.name}</h3>
                                    <p className="mt-1 text-[10px] uppercase text-white/40">Talles disponibles</p>
                                </div>
                                <span className="text-sm font-black text-[#00E5FF]">${product.basePrice.toLocaleString('es-AR')}</span>
                            </div>
                        </Link>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
}

function Benefits() {
    return (
        <section className="relative z-0 bg-[#050505] px-5 pb-4 md:px-10">
            <div className="brush-stroke brush-purple right-12 top-4 hidden opacity-30 md:block" />
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="mx-auto max-w-[1440px]">
                <h2 className="mb-3 text-2xl font-black uppercase tracking-[-0.03em] text-white md:text-3xl">¿Por qué <span className="text-[#00E5FF]">ÉTER?</span></h2>
                <div className="eter-card grid overflow-hidden md:grid-cols-4">
                    {benefits.map(({ icon: Icon, title, text }, index) => (
                        <motion.div key={title} variants={fadeUp} transition={{ duration: 0.55, ease: easeOut, delay: index * 0.03 }} whileHover={{ y: -3, backgroundColor: 'rgba(0,229,255,0.035)' }}  className="relative flex items-center gap-5 border-white/10 p-5 md:border-l md:first:border-l-0">
                            <span className={`brush-stroke brush-${index % 2 === 0 ? 'green' : 'purple'} -bottom-2 right-5 h-3 w-16 opacity-25`} />
                            <Icon className={`h-9 w-9 shrink-0 ${index % 3 === 0 ? 'text-[#00E5FF]' : index % 3 === 1 ? 'text-[#7A00FF]' : 'text-[#C6FF00]'}`} strokeWidth={1.8} />
                            <div>
                                <h3 className="text-[12px] font-black uppercase text-white">{title}</h3>
                                <p className="mt-1 text-xs leading-snug text-white/65">{text}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
}

function Community() {
    return (
        <section className="relative z-0 bg-[#050505] px-5 py-3 md:px-10">
            <motion.div animate={{ y: [0, -8, 0], rotate: [0, -4, 0] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}  className="paint-splatter splat-purple -right-16 bottom-0 hidden md:block opacity-30 blur-[1px]" />
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="mx-auto grid max-w-[1440px] gap-4 lg:grid-cols-[1.05fr_1fr_1fr_1fr]">
                <motion.div variants={fadeUp} transition={{ duration: 0.65, ease: easeOut }} whileHover={{ y: -4 }}  className="group eter-card relative overflow-hidden p-7 shadow-[0_0_40px_rgba(122,0,255,0.1)]">
                    <div className="grunge-overlay opacity-20" />
                    <span className="brush-stroke brush-purple -right-10 top-6 opacity-60 transition-opacity group-hover:opacity-100" />
                    <p className="relative z-10 mb-3 text-[11px] uppercase tracking-[0.12em] text-white/55">Comunidad ÉTER</p>
                    <h2 className="relative z-10 text-3xl font-black uppercase leading-none text-white md:text-4xl">No vendés solo.<br /><span className="text-tri-gradient drop-shadow-[0_0_15px_rgba(122,0,255,0.5)]">Tenés sistema.</span></h2>
                    <p className="relative z-10 mt-5 text-sm leading-relaxed text-white/70">Grupo privado, lanzamientos exclusivos, estrategia y soporte.</p>
                    <div className="relative z-10 mt-7 text-3xl font-black text-[#00E5FF]">+500 <span className="text-xs uppercase tracking-[0.12em] text-white/60">revendedores activos</span></div>
                    <Link href="/register" className="eter-cta relative z-10 mt-6 inline-flex h-12 w-full items-center justify-center text-sm font-black italic uppercase tracking-tighter shadow-[0_0_20px_rgba(0,229,255,0.2)]">
                        Unirme a la comunidad
                    </Link>
                </motion.div>
                {testimonials.map((t, index) => (
                    <motion.article key={t.name} variants={fadeUp} transition={{ duration: 0.6, ease: easeOut, delay: index * 0.04 }} whileHover={{ y: -5, borderColor: 'rgba(198,255,0,0.45)' }}  className="group relative eter-card overflow-hidden p-6">
                        <span className={`brush-stroke brush-${index % 2 === 0 ? 'green' : 'cyan'} -right-4 top-10 opacity-0 group-hover:opacity-40 transition-opacity`} />
                        <div className="relative z-10 mb-5 flex items-center gap-3">
                            <div className={`relative p-0.5 rounded-full bg-gradient-to-tr ${index % 2 === 0 ? 'from-[#C6FF00] to-[#00E5FF]' : 'from-[#7A00FF] to-[#00E5FF]'}`}>
                                <Image src={t.avatar} alt={t.name} width={48} height={48} className="h-12 w-12 rounded-full object-cover grayscale transition-all group-hover:grayscale-0" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white">{t.name}</h3>
                                <p className="text-[10px] uppercase tracking-[0.08em] text-white/45">{t.city}</p>
                                <p className={`text-[10px] font-bold ${index % 2 === 0 ? 'text-[#C6FF00]' : 'text-[#00E5FF]'}`}>{t.since}</p>
                            </div>
                        </div>
                        <p className="relative z-10 min-h-[96px] text-[15px] italic leading-relaxed text-white/85">&ldquo;{t.quote}&rdquo;</p>
                        <div className="relative z-10 mt-6 grid grid-cols-3 gap-3 border-t border-white/5 pt-4">
                            <div><b className={`block text-lg ${index % 2 === 0 ? 'text-[#C6FF00]' : 'text-[#00E5FF]'}`}>{t.win}</b><span className="text-[9px] uppercase text-white/45">Ganancia/mes</span></div>
                            <div><b className="block text-lg text-white">{t.orders}</b><span className="text-[9px] uppercase text-white/45">Pedidos/mes</span></div>
                            <div><b className="block text-lg text-white">{t.rating}</b><span className="text-[9px] uppercase text-white/45">Satisfacción</span></div>
                        </div>
                    </motion.article>
                ))}
            </motion.div>
        </section>
    );
}

function Certified() {
    return (
        <section className="relative z-0 bg-[#050505] px-5 py-5 md:px-10">
            <motion.div animate={{ x: [0, 8, 0], rotate: [0, 5, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}  className="paint-splatter splat-green left-4 top-8 hidden md:block opacity-30" />
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="eter-card relative mx-auto grid max-w-[1440px] gap-6 overflow-hidden p-6 md:grid-cols-[.9fr_1.4fr] lg:grid-cols-[.8fr_1.1fr_1.8fr]">
                <div className="grunge-overlay opacity-30" />
                <motion.div variants={fadeUp} transition={{ duration: 0.65, ease: easeOut }} className="relative z-10 flex items-center gap-5">
                    <div className="relative flex h-72 w-72 shrink-0 items-center justify-center rounded-full bg-black shadow-[0_0_80px_rgba(255,255,255,0.12)] overflow-hidden">
                        <span className="brush-stroke brush-green -left-12 top-16 w-56 opacity-40" />
                        <Image 
                            src="/logo.png" 
                            alt="ÉTER Certified Logo" 
                            fill 
                            className="object-contain p-2"
                        />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black uppercase text-white">ÉTER <span className="text-[#C6FF00]">Certified</span></h2>
                        <p className="mt-3 text-sm leading-relaxed text-white/65">Cada par pasa por verificación de origen, control físico y certificado digital.</p>
                    </div>
                </motion.div>
                <div className="relative z-10 grid gap-3 sm:grid-cols-3 lg:col-span-2">
                    {[
                        ['01', ShieldCheck, 'Verificación'],
                        ['02', BadgeCheck, 'Calidad'],
                        ['03', CheckCircle2, 'Certificado'],
                    ].map(([num, Icon, title]) => {
                        const StepIcon = Icon as typeof ShieldCheck;
                        return (
                            <motion.div key={num as string} variants={fadeUp} transition={{ duration: 0.55, ease: easeOut }} whileHover={{ y: -4, borderColor: 'rgba(198,255,0,0.45)' }}  className="group relative rounded-md border border-[#252525] bg-black/40 p-5 backdrop-blur-sm">
                                <span className="brush-stroke brush-cyan -bottom-1 -right-1 h-2 w-10 opacity-0 group-hover:opacity-40 transition-opacity" />
                                <StepIcon className="mb-4 h-7 w-7 text-[#00E5FF]" />
                                <div className="mb-2 text-4xl font-black text-white">{num as string}</div>
                                <h3 className="text-[11px] font-black uppercase tracking-[0.08em] text-white">{title as string}</h3>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </section>
    );
}

function HowItWorks() {
    return (
        <section className="relative z-0 bg-[#050505] px-5 py-10 md:px-10">
            <div className="paint-splatter splat-purple -left-20 top-0 opacity-10" />
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="eter-card relative mx-auto grid max-w-[1440px] gap-6 overflow-hidden p-6 lg:grid-cols-[.9fr_2fr]">
                <motion.div variants={fadeUp} transition={{ duration: 0.65, ease: easeOut }} className="relative z-10">
                    <p className="text-sm font-bold uppercase tracking-[0.08em] text-white">Cómo funciona</p>
                    <h2 className="mt-2 text-4xl font-black uppercase leading-none text-white">Vender nunca fue <span className="text-[#00E5FF]">tan simple.</span></h2>
                    <span className="brush-stroke brush-purple -left-4 bottom-0 w-48 opacity-30" />
                </motion.div>
                <div className="relative z-10 grid gap-4 md:grid-cols-3">
                    {[
                        [ShoppingBag, '01', 'Publicá', 'Subí los modelos a tus redes con tu precio.'],
                        [PackageCheck, '02', 'Consultá', 'Confirmá stock con nosotros antes de cerrar.'],
                        [DollarSign, '03', 'Ganá', 'Tomá los datos y nosotros entregamos el par.'],
                    ].map(([Icon, num, title, text]) => {
                        const StepIcon = Icon as typeof ShoppingBag;
                        return (
                            <motion.div key={num as string} variants={fadeUp} transition={{ duration: 0.55, ease: easeOut }} whileHover={{ x: 4 }}  className="group flex gap-4">
                                <div className="relative">
                                    <StepIcon className={`mt-1 h-8 w-8 shrink-0 transition-transform group-hover:scale-110 ${num === '01' ? 'text-[#00E5FF]' : num === '02' ? 'text-[#7A00FF]' : 'text-[#C6FF00]'}`} />
                                    <span className={`absolute -right-2 -top-2 brush-stroke brush-${num === '01' ? 'cyan' : num === '02' ? 'purple' : 'green'} h-3 w-8 opacity-0 group-hover:opacity-40`} />
                                </div>
                                <div>
                                    <div className="text-xl font-black text-white">{num as string}</div>
                                    <h3 className="text-[11px] font-black uppercase text-white">{title as string}</h3>
                                    <p className="mt-2 text-xs leading-relaxed text-white/55">{text as string}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </section>
    );
}

function FinalCta() {
    return (
        <section className="relative z-0 mt-2 overflow-hidden border-y border-[#252525] bg-[#050505] px-5 py-8 md:px-10">
            <div className="grunge-overlay opacity-40" />
            <motion.div animate={{ x: [0, 12, 0], rotate: [0, 4, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}  className="paint-splatter splat-cyan -left-8 top-0 opacity-25" />
            <motion.div animate={{ x: [0, -10, 0], rotate: [45, 39, 45] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}  className="paint-splatter splat-green -right-8 bottom-0 hidden opacity-25 md:block" />
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="relative z-10 mx-auto grid max-w-[1440px] items-center gap-8 md:grid-cols-[1.15fr_.85fr]">
                <motion.h2 variants={fadeUp} transition={{ duration: 0.7, ease: easeOut }} className="relative text-4xl font-black uppercase leading-none text-white md:text-6xl">
                    <span className="brush-stroke brush-green -left-2 bottom-0 hidden w-64 opacity-40 md:block" />
                    <span className="relative">Tu primer par puede ser <span className="block text-[#00E5FF] drop-shadow-[0_0_15px_rgba(0,229,255,0.3)]">tu primer negocio.</span></span>
                </motion.h2>
                <motion.div variants={fadeUp} transition={{ duration: 0.65, ease: easeOut }}>
                    <p className="mb-6 text-base leading-relaxed text-white/70">Más de <b className="text-[#00E5FF]">500 revendedores</b> ya están ganando con ÉTER. El próximo podés ser vos.</p>
                    <form className="grid gap-3 sm:grid-cols-[1fr_auto]">
                        <input className="h-14 rounded-md border border-white/10 bg-black/60 px-4 text-white backdrop-blur-md outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]" placeholder="tu@email.com" type="email" />
                        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                        <Link href="/register" className="eter-cta flex h-14 items-center justify-center gap-3 px-10 text-sm font-black uppercase italic">
                            Quiero empezar <ArrowRight size={20} />
                        </Link>
                        </motion.div>
                    </form>
                </motion.div>
            </motion.div>
        </section>
    );
}

interface LandingPageProps {
    initialProducts?: ProductType[];
}

export default function LandingPage({ initialProducts }: LandingPageProps) {
    const { products: dbProducts } = useCatalog();
    
    const mappedInitial = initialProducts?.map(mapProductTypeToProduct) || [];
    const products = dbProducts?.length ? dbProducts : (mappedInitial.length ? mappedInitial : fallbackProducts);

    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        requestAnimationFrame(() => {
            if (e.currentTarget) {
                e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
                e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
            }
        });
    };

    return (
        <main 
            onMouseMove={handleMouseMove}
            className="flex flex-col min-h-screen overflow-x-hidden text-white selection:bg-[#00E5FF] selection:text-black"
            style={{ willChange: 'transform' } as any}
        >
            <Navbar />
            <div className="flex-1 flex flex-col">
                <Hero />
                <MetricsBar />
                <ProductSection products={products} />
                <div >
                    <Benefits />
                    <Community />
                    <Certified />
                    <HowItWorks />
                </div>
                <FinalCta />
            </div>
            <Footer />
        </main>
    );
}
