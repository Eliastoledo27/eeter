import { Navbar } from '@/components/layout/Navbar'
import { ArrowRight, Target, Users, Globe, ShieldCheck, Heart, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export const metadata = {
  title: "Nosotros | Éter Store",
  description: "Conoce la historia detrás de la plataforma líder de dropshipping de zapatillas en Argentina.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gray-50 -z-10" />
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                <span className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 font-bold text-sm mb-6">
                    Nuestra Historia
                </span>
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
                    Revolucionando el <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Comercio Digital</span> en Latam.
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                    Éter Store nació con una misión simple: democratizar el acceso al e-commerce permitiendo que cualquier persona pueda iniciar su propio negocio de moda sin riesgos ni barreras de entrada.
                </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision Grid */}
        <section className="py-20 px-6">
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                <div className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700">
                    <Image 
                        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2000"
                        alt="Equipo Éter Store"
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="space-y-8">
                    <div className="flex gap-4 items-start">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                            <Target size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Nuestra Misión</h3>
                            <p className="text-gray-600 leading-relaxed">Empoderar a emprendedores digitales proveyéndoles la infraestructura, tecnología y logística necesaria para construir marcas exitosas desde cero.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 flex-shrink-0">
                            <Globe size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Nuestra Visión</h3>
                            <p className="text-gray-600 leading-relaxed">Convertirnos en el ecosistema de dropshipping más confiable y eficiente de Latinoamérica, conectando proveedores de calidad con vendedores apasionados.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 flex-shrink-0">
                            <Users size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Nuestra Comunidad</h3>
                            <p className="text-gray-600 leading-relaxed">Más de 5,000 revendedores activos que confían en nosotros día a día para gestionar sus ventas y hacer crecer sus ingresos.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Values Section */}
        <section className="py-24 bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-4xl font-black mb-16">Nuestros Valores Fundamentales</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-colors">
                        <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-6" />
                        <h3 className="text-xl font-bold mb-3">Transparencia Total</h3>
                        <p className="text-gray-400">Sin letras chicas. Nuestros precios, stock y tiempos de envío son siempre claros y en tiempo real.</p>
                    </div>
                    <div className="p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-colors">
                        <Heart className="w-12 h-12 text-rose-400 mx-auto mb-6" />
                        <h3 className="text-xl font-bold mb-3">Pasión por el Cliente</h3>
                        <p className="text-gray-400">Entendemos que tu cliente es lo más importante. Por eso cuidamos cada paquete como si fuera propio.</p>
                    </div>
                    <div className="p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-colors">
                        <TrendingUp className="w-12 h-12 text-amber-400 mx-auto mb-6" />
                        <h3 className="text-xl font-bold mb-3">Innovación Constante</h3>
                        <p className="text-gray-400">Mejoramos nuestra plataforma semanalmente para darte las mejores herramientas de venta del mercado.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6 text-center">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl font-black text-gray-900 mb-6">Sé parte del futuro del retail</h2>
                <p className="text-xl text-gray-500 mb-10">No necesitas experiencia previa. Nosotros te guiamos en cada paso.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/register">
                        <button className="bg-gray-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-black transition-all flex items-center justify-center gap-2">
                            Unirme al Equipo <ArrowRight />
                        </button>
                    </Link>
                    <Link href="/catalog">
                        <button className="bg-white border border-gray-200 text-gray-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition-all">
                            Explorar Catálogo
                        </button>
                    </Link>
                </div>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm">
            © 2026 Éter Store Inc.
        </div>
      </footer>
    </div>
  )
}