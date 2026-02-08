import { Navbar } from '@/components/layout/Navbar'
import { ArrowRight, Star, TrendingUp, ShieldCheck, Truck } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Éter Store | Proveedor Mayorista de Zapatillas Premium y Dropshipping",
  description: "¿Buscas revender zapatillas? En Éter Store te damos el catálogo, la logística y la plataforma. Empieza tu negocio sin inversión. Envíos a todo el país.",
}

export const dynamic = 'force-dynamic';

export default async function IndexPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#09090B] selection:bg-[#EC4899]/20">
      <Navbar />

      {/* Hero Section - Warm & Welcoming */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Abstract Background Shapes */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[25%] -right-[10%] w-[52vw] h-[52vw] bg-[#EC4899]/15 rounded-full blur-3xl opacity-70 animate-pulse motion-reduce:animate-none" style={{ animationDuration: '9s' }} />
          <div className="absolute top-[35%] -left-[12%] w-[42vw] h-[42vw] bg-black/10 rounded-full blur-3xl opacity-60 animate-pulse motion-reduce:animate-none" style={{ animationDuration: '12s', animationDelay: '1s' }} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.12),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(24,24,27,0.08),_transparent_50%)]" />
        </div>

        <div className="container relative z-10 px-6 mx-auto flex flex-col items-center">
          <div className="relative text-left space-y-6 md:space-y-8 animate-in slide-in-from-bottom-10 fade-in duration-700 pt-10 md:pt-0 max-w-4xl w-full mx-auto">
             
             {/* Mini Floating Photo */}
             <div className="absolute top-0 right-4 md:-right-4 w-28 h-28 md:w-40 md:h-40 rotate-12 animate-in zoom-in duration-1000 delay-300 z-20">
               <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/70 shadow-2xl bg-white/80 backdrop-blur transform hover:scale-110 transition-transform duration-500 cursor-pointer">
                    <Image 
                        src="https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=500" 
                        alt="Mini Sneaker" 
                        fill 
                        className="object-cover"
                    />
                </div>
                {/* Decorative Badge on Mini Photo */}
                <div className="absolute -bottom-2 -left-2 bg-[#18181B] text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/60">
                    NEW
                </div>
             </div>

             {/* Floating Balloons (Integrated) */}
             <div className="absolute -top-6 left-0 md:-left-12 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/60 animate-bounce motion-reduce:animate-none z-10 hidden md:block" style={{ animationDuration: '3s' }}>
                <p className="font-bold text-[#09090B] text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse motion-reduce:animate-none"/> Stock en tiempo real
                </p>
             </div>
             <div className="absolute top-20 right-0 md:-right-32 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/60 animate-bounce motion-reduce:animate-none z-10 hidden md:block" style={{ animationDuration: '4s', animationDelay: '1.5s' }}>
                <p className="font-bold text-[#09090B] text-xs flex items-center gap-2">
                    <Truck size={14} className="text-[#EC4899]" /> Envíos 24hs
                </p>
             </div>


            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/75 backdrop-blur-sm border border-black/10 shadow-sm text-[#18181B] text-xs md:text-sm font-bold w-fit">
              <Star size={14} className="fill-[#EC4899] text-[#EC4899]" />
              <span>La plataforma #1 para revendedores</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-[#09090B] leading-[0.95] md:leading-[1.1] max-w-3xl">
              Tu propio <br className="md:hidden" /> negocio de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#18181B] to-[#EC4899] relative inline-block">
                zapatillas
                <svg className="absolute w-full h-2 md:h-3 -bottom-1 left-0 text-[#EC4899] opacity-20" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-[#3F3F46] font-medium leading-relaxed max-w-xl">
              Nosotros ponemos el stock y la logística. <span className="text-[#09090B] font-bold">Vos ponés las ventas.</span> Empezá a ganar dinero hoy mismo.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href="/register" className="w-full sm:w-auto">
                <button className="w-full bg-[#18181B] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-black hover:scale-[1.02] transition-all shadow-xl shadow-black/20 flex items-center justify-center gap-3">
                  Empezar Gratis <ArrowRight size={20} className="text-[#EC4899]" />
                </button>
              </Link>
              <Link href="/catalog" className="w-full sm:w-auto">
                <button className="w-full bg-white/80 backdrop-blur border border-black/10 text-[#18181B] px-8 py-4 rounded-2xl font-bold text-lg hover:border-black/20 hover:bg-white transition-all flex items-center justify-center gap-2">
                  Ver Catálogo
                </button>
              </Link>
            </div>
            
{/* Section moved below */}
          </div>
        </div>
      </section>

      {/* Moved Indicators Section */}
      <section className="py-16 px-6 bg-white/80 backdrop-blur border-b border-black/5">
        <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-black text-[#09090B] mb-12 text-center">¿Por qué Elegirnos?</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              <div className="flex flex-col items-center text-center p-6 bg-white/70 backdrop-blur rounded-3xl border border-black/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-default h-full">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                    <ShieldCheck size={28} />
                </div>
                <span className="text-lg font-bold text-[#09090B] mb-1">Sin riesgos</span>
                <span className="text-sm text-[#3F3F46] leading-snug">Garantía de satisfacción total en cada compra</span>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 bg-white/70 backdrop-blur rounded-3xl border border-black/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-default h-full">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-sky-600 mb-4 group-hover:scale-110 transition-transform">
                    <Truck size={28} />
                </div>
                <span className="text-lg font-bold text-[#09090B] mb-1">Envíos país</span>
                <span className="text-sm text-[#3F3F46] leading-snug">Logística rápida y segura a todo el territorio</span>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 bg-white/70 backdrop-blur rounded-3xl border border-black/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-default h-full">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-fuchsia-600 mb-4 group-hover:scale-110 transition-transform">
                    <TrendingUp size={28} />
                </div>
                <span className="text-lg font-bold text-[#09090B] mb-1">Rentable</span>
                <span className="text-sm text-[#3F3F46] leading-snug">Márgenes de ganancia superiores al mercado</span>
              </div>

              <div className="flex flex-col items-center text-center p-6 bg-white/70 backdrop-blur rounded-3xl border border-black/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-default h-full">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#EC4899] mb-4 group-hover:scale-110 transition-transform">
                    <Star size={28} />
                </div>
                <span className="text-lg font-bold text-[#09090B] mb-1">Premium</span>
                <span className="text-sm text-[#3F3F46] leading-snug">Calidad top en materiales y confección</span>
              </div>
            </div>
        </div>
      </section>

{/* Trust Section removed */}

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-[#18181B] rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.25),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(255,255,255,0.1),_transparent_55%)]" />
            <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">¿Listo para empezar tu negocio?</h2>
                <p className="text-xl text-zinc-300 mb-10 max-w-2xl mx-auto">Únete a miles de revendedores que ya están generando ingresos con Éter Store.</p>
                <Link href="/register">
                    <button className="bg-white text-[#18181B] px-10 py-5 rounded-full font-bold text-xl hover:bg-white/90 hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-3 mx-auto">
                        Crear Cuenta Gratis <ArrowRight className="text-[#EC4899]" />
                    </button>
                </Link>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/90 backdrop-blur border-t border-black/5 py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
                     <div className="w-8 h-8 bg-[#18181B] rounded-lg flex items-center justify-center text-white font-black text-lg">É</div>
                     <span className="font-bold text-xl text-[#09090B]">ÉTER STORE</span>
                </div>
                <p className="text-[#3F3F46] text-sm max-w-xs">Plataforma integral de dropshipping y reventa de calzado premium en Argentina.</p>
            </div>
            <div className="flex gap-8">
                <a href="#" className="text-[#3F3F46] hover:text-[#EC4899] transition-colors font-medium">Instagram</a>
                <a href="#" className="text-[#3F3F46] hover:text-[#EC4899] transition-colors font-medium">WhatsApp</a>
                <a href="#" className="text-[#3F3F46] hover:text-[#EC4899] transition-colors font-medium">Soporte</a>
            </div>
            <div className="text-[#3F3F46] text-sm">
                © 2026 Éter Store Inc.
            </div>
        </div>
      </footer>
    </div>
  )
}
