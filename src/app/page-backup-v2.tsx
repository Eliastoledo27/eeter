'use client'

import { Navbar } from '@/components/layout/Navbar'
import { ArrowRight, Star, ShieldCheck, Package, DollarSign, CheckCircle2, ShoppingBag, Globe, Infinity, Clock, Award, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function RevolutionaryLandingPage() {
    const [scrollProgress, setScrollProgress] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollHeight - window.innerHeight
            const currentScroll = window.scrollY
            setScrollProgress((currentScroll / totalScroll) * 100)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className="min-h-screen bg-black text-white overflow-x-hidden relative">
            {/* Scroll Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 bg-black/50 z-[9999]">
                <div
                    className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-purple-600 transition-all duration-300"
                    style={{ width: `${scrollProgress}%` }}
                />
            </div>

            <Navbar />

            {/* HERO SECTION */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
                {/* Animated Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-yellow-500/20 to-orange-600/20 rounded-full blur-3xl animate-pulse"
                        style={{ animationDuration: '4s' }}
                    />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-600/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"
                        style={{ animationDuration: '6s', animationDelay: '1s' }}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,215,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,215,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
                </div>

                <div className="container relative z-10 px-6 mx-auto">
                    <div className="flex flex-col items-center text-center space-y-12">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full backdrop-blur-xl bg-white/5 border border-yellow-500/20 text-sm font-bold shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                            </span>
                            LA PLATAFORMA #1 PARA REVENDEDORES
                        </div>

                        {/* Hero Title */}
                        <h1 className="font-black text-7xl md:text-9xl lg:text-[12rem] tracking-tighter leading-[0.85]">
                            <span className="block">ÉTER</span>
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600">
                                STORE
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-gray-400 font-light max-w-3xl mx-auto leading-relaxed">
                            Accedé al catálogo de zapatillas más exclusivo del país.
                            <br />
                            <span className="text-white font-medium">Nosotros ponemos el stock y la logística. Vos la venta.</span>
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-6">
                            <Link href="/register">
                                <button className="group relative px-10 py-5 rounded-full font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105">
                                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600 animate-gradient-x"></div>
                                    <span className="relative z-10 flex items-center gap-3 text-black">
                                        Empezar Gratis
                                        <ArrowRight className="group-hover:translate-x-2 transition-transform" size={20} />
                                    </span>
                                </button>
                            </Link>

                            <Link href="/catalog">
                                <button className="group px-10 py-5 rounded-full font-bold text-lg backdrop-blur-xl bg-white/5 border-2 border-white/20 hover:border-yellow-500/50 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                                    Ver Catálogo
                                </button>
                            </Link>
                        </div>

                        {/* Social Proof */}
                        <div className="flex items-center gap-6 opacity-70">
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="w-12 h-12 rounded-full border-4 border-black bg-gradient-to-br from-gray-700 to-gray-900 overflow-hidden">
                                        <Image src={`https://randomuser.me/api/portraits/men/${i + 20}.jpg`} width={48} height={48} alt="User" />
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm">
                                <span className="font-black text-yellow-500 text-lg">+1,200</span>
                                <span className="text-gray-400"> revendedores activos</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* VALUE PROPOSITION - BENTO GRID */}
            <section className="py-32 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20 space-y-6">
                        <h2 className="text-5xl md:text-7xl font-black tracking-tight">
                            <span className="text-white">POR QUÉ</span>{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600">
                                NOSOTROS
                            </span>
                        </h2>
                        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                            Olvidate del stock, los envíos y las planillas de excel. Éter es tu socio logístico y tecnológico.
                        </p>
                    </div>

                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[200px]">
                        {/* Card 1 - CATÁLOGO PREMIUM */}
                        <div className="md:col-span-2 md:row-span-2 group backdrop-blur-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-[2.5rem] p-8 border-4 border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-500 overflow-hidden hover:scale-[1.02]">
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 to-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative z-10 h-full flex flex-col">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-4 bg-yellow-500/20 rounded-2xl border-2 border-yellow-500/30">
                                        <ShoppingBag className="text-yellow-400" size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black">CATÁLOGO</h3>
                                        <h3 className="text-3xl font-black text-yellow-500">PREMIUM</h3>
                                    </div>
                                </div>

                                <p className="text-gray-300 mb-6 text-lg">
                                    Más de <span className="text-yellow-500 font-bold">500 modelos</span> de las marcas más buscadas.
                                </p>

                                <div className="grid grid-cols-3 gap-4 mt-auto">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="aspect-square rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden border-2 border-white/10 group-hover:scale-105 transition-transform duration-500">
                                            <Image
                                                src={`https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=400&q=80`}
                                                fill
                                                className="object-cover"
                                                alt="Shoe"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Card 2 - 0% INVERSIÓN */}
                        <div className="md:col-span-2 group backdrop-blur-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-[2.5rem] p-8 border-4 border-purple-500/20 hover:border-purple-500/50 transition-all duration-500 hover:scale-[1.02]">
                            <div className="relative z-10 h-full flex items-center gap-6">
                                <div className="flex-1">
                                    <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                                        0%
                                    </div>
                                    <h3 className="text-2xl font-black mb-2">INVERSIÓN</h3>
                                    <p className="text-gray-400">Empezá sin poner un peso</p>
                                </div>
                                <div className="p-6 bg-purple-500/20 rounded-3xl border-2 border-purple-500/30">
                                    <ShieldCheck className="text-purple-400" size={48} />
                                </div>
                            </div>
                        </div>

                        {/* Card 3 - ENVÍOS 24H */}
                        <div className="md:col-span-2 group backdrop-blur-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-[2.5rem] p-8 border-4 border-green-500/20 hover:border-green-500/50 transition-all duration-500 hover:scale-[1.02]">
                            <div className="relative z-10 h-full flex items-center gap-6">
                                <div className="p-6 bg-green-500/20 rounded-3xl border-2 border-green-500/30">
                                    <Clock className="text-green-400" size={48} />
                                </div>
                                <div className="flex-1">
                                    <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-2">
                                        24H
                                    </div>
                                    <h3 className="text-2xl font-black mb-2">ENVÍOS FLASH</h3>
                                    <p className="text-gray-400">Entregas en 24/48hs</p>
                                </div>
                            </div>
                        </div>

                        {/* Card 4 - GANANCIAS */}
                        <div className="md:col-span-2 md:row-span-2 group backdrop-blur-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-[2.5rem] p-8 border-4 border-blue-500/20 hover:border-blue-500/50 transition-all duration-500 hover:scale-[1.02]">
                            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
                                <Infinity className="text-blue-400 animate-pulse mb-6" size={120} strokeWidth={1.5} />
                                <h3 className="text-4xl font-black mb-4">GANANCIAS</h3>
                                <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-4">
                                    INFINITAS
                                </h3>
                                <p className="text-xl text-gray-300">Tu esfuerzo define tu éxito</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="py-32 px-6 relative bg-gradient-to-b from-black via-gray-900 to-black border-y border-white/10">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <span className="text-yellow-500 font-black tracking-wider uppercase text-sm mb-4 block">
                            EL ECOSISTEMA ÉTER
                        </span>
                        <h2 className="text-5xl md:text-6xl font-black">
                            De revendedor a empresario
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">
                                en 3 pasos
                            </span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { step: "01", title: "ELEGÍ", desc: "Seleccioná los mejores modelos de nuestro catálogo curado.", icon: ShoppingBag, color: "from-blue-500 to-purple-500" },
                            { step: "02", title: "PUBLICÁ", desc: "Descargá las fotos HD y subilas a tus redes con un clic.", icon: Globe, color: "from-purple-500 to-pink-500" },
                            { step: "03", title: "GANÁ", desc: "Nosotros enviamos, vos cobrás la diferencia.", icon: DollarSign, color: "from-pink-500 to-yellow-500" }
                        ].map((item, idx) => (
                            <div key={idx} className="group relative">
                                <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center font-black text-2xl text-black border-4 border-black z-20 group-hover:scale-110 transition-transform">
                                    {item.step}
                                </div>

                                <div className="backdrop-blur-2xl bg-gradient-to-br from-white/5 to-white/0 rounded-3xl p-8 border-4 border-white/10 group-hover:border-white/30 transition-all duration-500 h-full group-hover:scale-105">
                                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${item.color} p-4 mb-6 group-hover:rotate-12 transition-transform`}>
                                        <item.icon className="w-full h-full text-white" />
                                    </div>

                                    <h3 className="text-3xl font-black mb-4 group-hover:text-yellow-500 transition-colors">
                                        {item.title}
                                    </h3>

                                    <p className="text-gray-400 leading-relaxed text-lg">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* STATS */}
            <section className="py-24 px-6 bg-black border-y border-yellow-500/20">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { value: "+500", label: "MODELOS EN CATÁLOGO", icon: Package },
                            { value: "$2.5M", label: "VENTAS GENERADAS", icon: TrendingUp },
                            { value: "+12K", label: "ENVÍOS REALIZADOS", icon: Award }
                        ].map((stat, idx) => (
                            <div key={idx} className="text-center group">
                                <div className="inline-block p-4 bg-yellow-500/10 rounded-2xl mb-4 group-hover:bg-yellow-500/20 transition-colors">
                                    <stat.icon className="text-yellow-500" size={40} />
                                </div>
                                <div className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500 mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-gray-400 font-bold tracking-wider uppercase">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TESTIMONIAL */}
            <section className="py-32 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 rounded-[3rem] p-12 border-4 border-white/10 hover:border-yellow-500/30 transition-all duration-500">
                        <div className="flex gap-1 mb-6 justify-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="fill-yellow-500 text-yellow-500" size={24} />
                            ))}
                        </div>

                        <blockquote className="text-2xl md:text-3xl font-light text-center text-gray-300 mb-8 leading-relaxed">
                            &quot;Éter cambió completamente mi forma de ver el e-commerce. Sin stock, sin líos,
                            <span className="text-white font-medium"> solo ganancias puras.</span>&quot;
                        </blockquote>

                        <div className="flex items-center justify-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 p-1">
                                <div className="w-full h-full rounded-full overflow-hidden">
                                    <Image src="https://randomuser.me/api/portraits/men/32.jpg" width={64} height={64} alt="Martín" />
                                </div>
                            </div>
                            <div>
                                <p className="font-black text-lg">Martín González</p>
                                <p className="text-yellow-500 text-sm">Reseller Top Tier</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA FINAL */}
            <section className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-radial from-purple-900/50 via-black to-black" />

                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s', animationDelay: '1s' }} />
                </div>

                <div className="relative z-10 text-center max-w-5xl mx-auto space-y-12">
                    <h2 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none">
                        <span className="block">EMPIEZA</span>
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600">
                            AHORA
                        </span>
                    </h2>

                    <Link href="/register">
                        <button className="group px-16 py-8 rounded-full font-black text-2xl overflow-hidden transition-all duration-300 hover:scale-110 relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600 animate-gradient-x"></div>
                            <span className="relative z-10 flex items-center gap-4 text-black">
                                CREAR CUENTA GRATIS
                                <ArrowRight className="group-hover:translate-x-3 transition-transform" size={28} />
                            </span>
                        </button>
                    </Link>

                    <div className="flex flex-wrap justify-center gap-8 text-gray-400">
                        {['Sin costos fijos', 'Sin compra mínima', 'Cancelá cuando quieras'].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <CheckCircle2 className="text-green-500" size={20} />
                                <span className="font-medium">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-white text-black py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center text-white font-black text-3xl">
                                    É
                                </div>
                                <span className="font-black text-2xl">ÉTER STORE</span>
                            </div>
                            <p className="text-gray-600 text-sm">
                                Plataforma líder de dropshipping B2B en Argentina.
                            </p>
                        </div>

                        {[
                            { title: "PLATAFORMA", links: [{ name: "Catálogo", href: "/catalog" }, { name: "Registro", href: "/register" }, { name: "Ingresar", href: "/login" }] },
                            { title: "COMUNIDAD", links: [{ name: "Instagram", href: "#" }, { name: "Discord", href: "#" }] },
                            { title: "LEGALES", links: [{ name: "Términos", href: "#" }, { name: "Privacidad", href: "#" }] }
                        ].map((col, idx) => (
                            <div key={idx}>
                                <h4 className="font-black mb-4">{col.title}</h4>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    {col.links.map((link, i) => (
                                        <li key={i}>
                                            <Link href={link.href} className="hover:text-yellow-600 transition-colors">
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
                        © 2026 Éter Store Inc. Designed in Buenos Aires.
                    </div>
                </div>
            </footer>
        </div>
    )
}
