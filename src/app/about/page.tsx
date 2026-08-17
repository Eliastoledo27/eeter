import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, MapPin, Zap, ArrowUpRight } from 'lucide-react';
import { PreviewHeader } from '@/components/landing/primitives/PreviewHeader';
import { PreviewFooter } from '@/components/landing/primitives/PreviewFooter';
import { WhatsAppFloatingButton } from '@/components/layout/WhatsAppFloatingButton';
import { SceneBrandBanner } from '@/components/landing/scenes/SceneBrandBanner';

export const metadata: Metadata = {
    title: 'Origen & Calidad en Calzado Brasil | ÉTER Store Zapatillas',
    description: 'Conocé el estándar de calidad detrás de nuestro calzado: selección directa en fábricas de Brasil, control par por par y logística integral de zapatillas desde Mar del Plata a todo el país.',
    keywords: [
        'calzado brasilero calidad', 'importación de zapatillas brasil', 'zapas importadas mar del plata',
        'calidad zapatillas', 'distribuidores de zapatillas argentina', 'fábrica de calzado brasil',
        'eter calzados origen', 'sobre eter store'
    ],
    alternates: {
        canonical: 'https://www.eter.store/about',
    },
};

export default function AboutPage() {
    return (
        <div className="relative min-h-screen w-full bg-[#050505] text-white selection:bg-[#39FF14] selection:text-black">
            
            {/* Lateral Neon Green Lines */}
            <div className="fixed top-0 bottom-0 left-0 w-[1.5px] bg-[#39FF14] shadow-[0_0_8px_#39FF14] z-40 pointer-events-none" />
            <div className="fixed top-0 bottom-0 right-0 w-[1.5px] bg-[#39FF14] shadow-[0_0_8px_#39FF14] z-40 pointer-events-none" />

            {/* Fixed Header */}
            <PreviewHeader />

            <main className="pt-28 sm:pt-36 pb-20">
                
                {/* ── 1. ABOUT HERO STATEMENT ── */}
                <section className="px-4 sm:px-8 md:px-12 max-w-7xl mx-auto mb-16 sm:mb-24">
                    
                    {/* Back Link */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-10">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-white/60 hover:text-[#39FF14] transition-colors"
                        >
                            <ArrowLeft size={15} /> VOLVER AL INICIO
                        </Link>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#39FF14]">
                            ● EST. 2024 · MAR DEL PLATA
                        </span>
                    </div>

                    <div className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#39FF14] mb-3 flex items-center gap-2">
                        <span>ACTO 02 // MANIFIESTO & ORIGEN</span>
                        <span className="text-white/20">|</span>
                        <span className="text-white/50">CERO INTERMEDIARIOS</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase italic tracking-tighter text-white leading-[0.9]">
                        EL ESTÁNDAR <br />
                        <span className="text-white/35 not-italic font-extrabold">DE ÉTER.</span>
                    </h1>

                    <div className="relative mt-2 transform -rotate-1">
                        <span
                            className="font-['Rock_Salt',_'Caveat',_'Permanent_Marker',_cursive] text-xl sm:text-3xl md:text-4xl text-[#00E5FF] tracking-wide"
                            style={{ textShadow: '0 0 20px rgba(0,229,255,0.6)' }}
                        >
                            & Curaduría Real en Mar del Plata
                        </span>
                    </div>

                    <p className="mt-8 text-base sm:text-xl text-white/80 max-w-3xl font-normal leading-relaxed">
                        Nacimos con una premisa simple: erradicar las fotos truchas de catálogo y las esperas eternas. En Éter seleccionamos calzado urbano en Brasil, lo verificamos par por par en Mar del Plata y lo despachamos en 24/48hs a todo el país.
                    </p>
                </section>

                {/* ── 2. EL PROCESO DE CURADURÍA EN 4 PASOS ── */}
                <section className="px-4 sm:px-8 md:px-12 max-w-7xl mx-auto mb-20 sm:mb-28">
                    <div className="border-t border-white/10 pt-12 mb-12">
                        <div className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#39FF14] mb-2">
                            // NUESTRO MÉTODO OPERATIVO
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-black uppercase italic tracking-tight text-white">
                            CÓMO TRABAJAMOS.
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="rounded-3xl bg-[#090909] border border-white/10 p-6 sm:p-7 space-y-4 hover:border-[#39FF14]/50 transition-colors">
                            <span className="text-3xl font-mono font-black text-white/20">01</span>
                            <h3 className="text-lg font-black uppercase text-white">Curaduría en Brasil</h3>
                            <p className="text-xs text-white/70 leading-relaxed font-normal">
                                Selección directa en polos industriales brasileros priorizando confort de pisada, resistencia y costuras reforzadas.
                            </p>
                        </div>

                        <div className="rounded-3xl bg-[#090909] border border-white/10 p-6 sm:p-7 space-y-4 hover:border-[#39FF14]/50 transition-colors">
                            <span className="text-3xl font-mono font-black text-white/20">02</span>
                            <h3 className="text-lg font-black uppercase text-white">Control Físico en MDQ</h3>
                            <p className="text-xs text-white/70 leading-relaxed font-normal">
                                Cada caja y silueta se inspecciona manualmente en nuestro hub de Mar del Plata antes de ingresar al inventario activo.
                            </p>
                        </div>

                        <div className="rounded-3xl bg-[#090909] border border-white/10 p-6 sm:p-7 space-y-4 hover:border-[#39FF14]/50 transition-colors">
                            <span className="text-3xl font-mono font-black text-white/20">03</span>
                            <h3 className="text-lg font-black uppercase text-white">Embalaje Blindado</h3>
                            <p className="text-xs text-white/70 leading-relaxed font-normal">
                                Doble protección contra impactos para que la caja original y el calzado lleguen en condiciones de colección a tu casa.
                            </p>
                        </div>

                        <div className="rounded-3xl bg-[#090909] border border-white/10 p-6 sm:p-7 space-y-4 hover:border-[#39FF14]/50 transition-colors">
                            <span className="text-3xl font-mono font-black text-white/20">04</span>
                            <h3 className="text-lg font-black uppercase text-white">Salidas en 24/48hs</h3>
                            <p className="text-xs text-white/70 leading-relaxed font-normal">
                                Despachos diarios con Andreani y Correo Argentino con código de seguimiento online minuto a minuto.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ── 3. ATMOSPHERIC BRAND BANNER ── */}
                <SceneBrandBanner />

                {/* ── 4. PILARES & GARANTÍAS ── */}
                <section className="px-4 sm:px-8 md:px-12 max-w-7xl mx-auto mt-20 sm:mt-28">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="rounded-3xl bg-[#090909] border border-white/10 p-8 space-y-3">
                            <MapPin size={28} className="text-[#39FF14]" />
                            <h3 className="text-xl font-black uppercase text-white">Base Mar del Plata</h3>
                            <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-normal">
                                Stock físico real disponible para envíos inmediatos o retiro coordinado en Mar del Plata.
                            </p>
                        </div>

                        <div className="rounded-3xl bg-[#090909] border border-white/10 p-8 space-y-3">
                            <ShieldCheck size={28} className="text-[#00E5FF]" />
                            <h3 className="text-xl font-black uppercase text-white">Garantía por Talle</h3>
                            <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-normal">
                                Si le errás al número, nos escribís y te realizamos el cambio de forma rápida y sin complicaciones.
                            </p>
                        </div>

                        <div className="rounded-3xl bg-[#090909] border border-white/10 p-8 space-y-3">
                            <Zap size={28} className="text-[#39FF14]" />
                            <h3 className="text-xl font-black uppercase text-white">Ecosistema Mayorista</h3>
                            <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-normal">
                                Oportunidad de reventa directa sin inversión inicial de stock y con soporte operativo diario.
                            </p>
                        </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="mt-16 rounded-3xl bg-gradient-to-r from-white/[0.04] to-transparent border border-white/10 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-lg font-black uppercase text-white">¿Tenés alguna consulta puntual?</h3>
                            <p className="text-xs text-white/60">Hablamos de forma directa por WhatsApp para resolver cualquier duda sobre talles o envíos.</p>
                        </div>

                        <a
                            href="https://wa.me/5492236204002?text=Hola%20ÉTER,%20quisiera%20hacerles%20una%20consulta"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl bg-[#39FF14] px-6 py-3 text-xs font-mono font-black uppercase tracking-widest text-black transition-all hover:bg-white hover:scale-105"
                        >
                            HABLAR POR WHATSAPP <ArrowUpRight size={14} />
                        </a>
                    </div>
                </section>

            </main>

            {/* Footer & WhatsApp Floating */}
            <PreviewFooter />
            <WhatsAppFloatingButton />
        </div>
    );
}