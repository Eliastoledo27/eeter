import { Navbar } from '@/components/layout/Navbar'
import { ArrowRight, Star, ShieldCheck, Truck, Package, Globe, BarChart3, Lock } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic';

export default async function IndexPage() {
    return (
        <div className="min-h-screen bg-[#0C0A09] font-sans text-white selection:bg-[#EC4899]/30 selection:text-[#EC4899]">
            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] bg-[#EC4899]/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#CA8A04]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}></div>
            </div>

            <Navbar />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden">
                <div className="container px-6 mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left Content */}
                    <div className="space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-glow animate-in slide-in-from-bottom-4 fade-in duration-700">
                            <Star size={14} className="text-[#CA8A04] fill-[#CA8A04]" />
                            <span className="text-sm font-medium text-gray-200">Plataforma B2B Premium #1</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] animate-in slide-in-from-bottom-6 fade-in duration-700 delay-100">
                            Tu propio <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
                                imperio de
                            </span> <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CA8A04] via-[#F59E0B] to-[#EC4899] relative">
                                sneakers
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">
                            Accede al stock más exclusivo del mundo. Nosotros nos encargamos de la logística global. <span className="text-white font-semibold">Tú te enfocas en vender y escalar.</span>
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4 animate-in slide-in-from-bottom-10 fade-in duration-700 delay-300">
                            <Link href="/register" className="group">
                                <button className="w-full sm:w-auto bg-gradient-to-r from-[#EC4899] to-[#CA8A04] text-white px-8 py-5 rounded-2xl font-bold text-lg hover:placeholder-opacity-100 hover:scale-[1.02] hover:shadow-[0_0_40px_-10px_rgba(236,72,153,0.5)] transition-all flex items-center justify-center gap-3">
                                    Empezar ahora <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                            <Link href="/catalog">
                                <button className="w-full sm:w-auto bg-white/5 border border-white/10 backdrop-blur-md text-white px-8 py-5 rounded-2xl font-bold text-lg hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2">
                                    Ver Catálogo
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Right Visual - Abstract Glass/Sneaker Composition */}
                    <div className="relative h-[500px] lg:h-[700px] w-full flex items-center justify-center animate-in zoom-in duration-1000 delay-300">
                        {/* Main Glass Card */}
                        <div className="relative w-[300px] md:w-[400px] h-[400px] md:h-[500px] bg-gradient-to-br from-white/10 to-white/0 backdrop-blur-xl border border-white/20 rounded-[40px] shadow-2xl transform rotate-[-6deg] hover:rotate-0 transition-all duration-700 group">
                            <div className="absolute inset-0 bg-noise opacity-20 rounded-[40px]"></div>

                            {/* Product Image Placeholder (Replace with actual sneaker image) */}
                            <div className="absolute inset-4 rounded-[32px] overflow-hidden bg-[#18181B] relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#EC4899]/20 to-transparent mix-blend-overlay"></div>
                                {/* Abstract shape representing a shoe for now */}
                                <div className="w-full h-full flex items-center justify-center text-white/10 font-black text-9xl select-none">
                                    NIKE
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <div className="absolute -right-12 top-20 bg-[#18181B]/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl animate-bounce" style={{ animationDuration: '4s' }}>
                                <div className="flex items-center gap-3">
                                    <div className="bg-emerald-500/20 p-2 rounded-full">
                                        <Package size={20} className="text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Stock Real</p>
                                        <p className="text-sm font-bold text-emerald-400">Disponible</p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -left-8 bottom-32 bg-[#18181B]/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl animate-bounce" style={{ animationDuration: '5s', animationDelay: '1s' }}>
                                <div className="flex items-center gap-3">
                                    <div className="bg-[#EC4899]/20 p-2 rounded-full">
                                        <Truck size={20} className="text-[#EC4899]" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Envíos</p>
                                        <p className="text-sm font-bold text-[#EC4899]">Global 24h</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Background Glows */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-[#CA8A04] to-[#EC4899] rounded-full blur-[100px] opacity-20 -z-10 animate-pulse"></div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 relative z-10">
                <div className="container px-6 mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: ShieldCheck, title: "Sin Riesgos", desc: "No necesitas comprar stock. Paga solo cuando vendes.", color: "text-[#CA8A04]" },
                            { icon: Globe, title: "Logística Global", desc: "Enviamos a tus clientes en todo el mundo con tracking.", color: "text-sky-500" },
                            { icon: BarChart3, title: "Alta Rentabilidad", desc: "Márgenes optimizados para el mercado de lujo.", color: "text-emerald-500" },
                            { icon: Lock, title: "100% Seguro", desc: "Pagos y transacciones protegidas con tecnología militar.", color: "text-[#EC4899]" },
                        ].map((feature, i) => (
                            <div key={i} className="group p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2">
                                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 ${feature.color}`}>
                                    <feature.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-400 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 relative z-10">
                <div className="max-w-6xl mx-auto relative rounded-[40px] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#18181B] via-black to-[#18181B] z-0"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(202,138,4,0.15),_transparent_50%)]"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(236,72,153,0.15),_transparent_50%)]"></div>

                    <div className="relative z-10 p-12 md:p-24 text-center">
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                            ¿Listo para dominar <br /> el mercado?
                        </h2>
                        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                            Únete a la nueva generación de emprendedores digitales. Configura tu tienda en minutos.
                        </p>
                        <Link href="/register">
                            <button className="bg-white text-black px-12 py-6 rounded-full font-bold text-xl hover:bg-gray-100 hover:scale-105 transition-all shadow-2xl shadow-white/10 flex items-center justify-center gap-3 mx-auto">
                                Crear Cuenta Gratis <ArrowRight className="text-[#EC4899]" />
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-16 bg-black/50 backdrop-blur-xl">
                <div className="container px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#EC4899] to-[#CA8A04] rounded-xl flex items-center justify-center text-black font-black text-xl">É</div>
                        <span className="font-bold text-2xl tracking-tight text-white">ÉTER STORE</span>
                    </div>
                    <div className="text-gray-500 text-sm">
                        © 2026 Éter Store Inc. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    )
}
