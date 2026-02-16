import { GeneralPageLayout } from '@/components/layout/GeneralPageLayout';
import { Target, Globe, Users, ShieldCheck, Heart, TrendingUp } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
    return (
        <GeneralPageLayout
            title="NOSOTROS"
            subtitle="NUESTRO ORIGEN"
            description="Revolucionando el comercio digital en Latinoamérica. Éter no es solo una marca, es un ecosistema diseñado para democratizar el lujo y el éxito."
            breadcrumb="EMPRESA / HISTORIA"
        >
            <div className="space-y-32">
                {/* Intro Section */}
                <div className="flex flex-col lg:flex-row gap-20 items-center">
                    <div className="lg:w-1/2 space-y-8">
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                            Democratizando el <br /> <span className="text-[#C88A04]">futuro.</span>
                        </h2>
                        <p className="text-gray-400 text-lg font-light leading-relaxed">
                            Éter Store nació con una visión clara: eliminar las barreras entre los grandes productores de calzado brasilero y los emprendedores locales.
                            Nuestra plataforma permite que cualquiera pueda vender productos de clase mundial sin los riesgos de stock tradicionales.
                        </p>
                    </div>
                    <div className="lg:w-1/2 relative aspect-video rounded-[3rem] overflow-hidden border border-white/10 group">
                        <Image
                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2000"
                            alt="Equipo Éter"
                            fill
                            className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000 grayscale group-hover:grayscale-0"
                        />
                    </div>
                </div>

                {/* Mission / Vision */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {[
                        { icon: Target, title: 'MISIÓN', desc: 'Proveer la infraestructura tecnológica necesaria para escalar marcas de moda.' },
                        { icon: Globe, title: 'VISIÓN', desc: 'Liderar el mercado de dropshipping de lujo en toda la región para 2030.' },
                        { icon: Users, title: 'COMUNIDAD', desc: 'Más de 5.000 emprendedores creciendo junto a nosotros cada mes.' }
                    ].map((item, i) => (
                        <div key={i} className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] hover:border-[#C88A04]/30 transition-all">
                            <item.icon className="text-[#C88A04] mb-6" size={40} />
                            <h4 className="text-xl font-bold mb-4 uppercase">{item.title}</h4>
                            <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Values Section */}
                <div className="relative p-12 md:p-24 rounded-[4rem] border border-white/5 bg-gradient-to-br from-[#111] to-black overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <h2 className="text-[20vw] font-black italic">ETHOS</h2>
                    </div>
                    <h3 className="text-4xl font-black mb-16 text-center uppercase tracking-widest underline decoration-[#C88A04]">Valores Fundamentales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div>
                            <ShieldCheck className="mx-auto text-[#C88A04] mb-6" size={40} />
                            <h5 className="font-bold mb-2 uppercase">Transparencia</h5>
                            <p className="text-gray-500 text-xs">Sin costos ocultos ni letras chicas.</p>
                        </div>
                        <div>
                            <Heart className="mx-auto text-[#C88A04] mb-6" size={40} />
                            <h5 className="font-bold mb-2 uppercase">Pasión</h5>
                            <p className="text-gray-500 text-xs">Cuidamos cada detalle del producto.</p>
                        </div>
                        <div>
                            <TrendingUp className="mx-auto text-[#C88A04] mb-6" size={40} />
                            <h5 className="font-bold mb-2 uppercase">Innovación</h5>
                            <p className="text-gray-500 text-xs">Evolución tecnológica semanal.</p>
                        </div>
                    </div>
                </div>
            </div>
        </GeneralPageLayout>
    );
}