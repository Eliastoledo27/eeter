import { GeneralPageLayout } from '@/components/layout/GeneralPageLayout';
import { Leaf, Recycle, Wind, Droplets } from 'lucide-react';

export default function SustainabilityPage() {
    return (
        <GeneralPageLayout
            title="ECO"
            subtitle="SUSTENTABILIDAD"
            description="Creemos en un futuro donde el lujo no comprometa el planeta. Éter está comprometido con la producción responsable y la reducción de huella de carbono."
            breadcrumb="SUSTENTABILIDAD"
        >
            <div className="space-y-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">Menos impacto, <br /> <span className="text-[#C88A04]">más futuro.</span></h2>
                        <p className="text-gray-400 text-lg font-light leading-relaxed">
                            Nuestra cadena de suministro está optimizada para reducir residuos. Desde el uso de cueros sintéticos de alta tecnología hasta el packaging 100% reciclable, cada paso cuenta.
                        </p>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-6 border border-white/5 rounded-2xl bg-white/[0.01]">
                                <Recycle className="text-[#C88A04] mb-4" size={32} />
                                <h4 className="font-bold mb-1 uppercase">CIRCULAR</h4>
                                <p className="text-xs text-gray-500">Programa de reciclaje de calzado usado.</p>
                            </div>
                            <div className="p-6 border border-white/5 rounded-2xl bg-white/[0.01]">
                                <Leaf className="text-[#68A04] mb-4" size={32} />
                                <h4 className="font-bold mb-1 uppercase">VEGANO</h4>
                                <p className="text-xs text-gray-500">Opciones 0% crueldad animal.</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/10">
                        <img
                            src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2000&auto=format"
                            alt="Naturaleza"
                            className="w-full h-full object-cover opacity-60"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-white/5 pt-20">
                    {[
                        { icon: Wind, title: 'LIMPIO', desc: 'Producción con 40% de energía renovable.' },
                        { icon: Droplets, title: 'CONSCIENTE', desc: 'Reducción de consumo de agua en el teñido.' },
                        { icon: Recycle, title: 'REUTILIZABLE', desc: 'Packaging diseñado para ser conservado.' }
                    ].map((item, i) => (
                        <div key={i} className="text-center">
                            <item.icon className="mx-auto text-gray-600 mb-6" size={40} />
                            <h4 className="font-bold text-xl mb-4 uppercase">{item.title}</h4>
                            <p className="text-gray-500 text-sm">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </GeneralPageLayout>
    );
}
