import { GeneralPageLayout } from '@/components/layout/GeneralPageLayout';
import { Gift, CreditCard, Send, Sparkles } from 'lucide-react';

export default function GiftCardsPage() {
    return (
        <GeneralPageLayout
            title="REGALÁ"
            subtitle="GIFT CARDS"
            description="El regalo perfecto para quienes eligen su propio estilo. Tarjetas de regalo virtuales con entrega inmediata."
            breadcrumb="TARJETAS DE REGALO"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#C88A04] to-[#ECA413] rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative aspect-[16/9] rounded-[2rem] bg-gradient-to-br from-[#111] to-black border border-white/10 p-12 flex flex-col justify-between overflow-hidden">
                        <div className="flex justify-between items-start">
                            <h3 className="text-4xl font-black italic tracking-tighter text-[#C88A04]">ÉTER</h3>
                            <Sparkles className="text-[#C88A04]" size={24} />
                        </div>
                        <div>
                            <span className="text-sm font-mono text-gray-500 block mb-2 uppercase">VIRTUAL GIFT CARD</span>
                            <span className="text-5xl font-light tracking-widest text-white">$10.000 / $50.000</span>
                        </div>
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Gift size={200} />
                        </div>
                    </div>
                </div>

                <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { icon: Send, title: 'ENVÍO INSTANTÁNEO', desc: 'Recibila en tu email al instante.' },
                            { icon: CreditCard, title: 'SALDO FLEXIBLE', desc: 'Cargá el monto que desees.' }
                        ].map((item, i) => (
                            <div key={i} className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02]">
                                <item.icon className="text-[#C88A04] mb-4" size={32} />
                                <h4 className="font-bold mb-2 uppercase">{item.title}</h4>
                                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <button className="w-full h-16 bg-[#C88A04] hover:bg-[#ECA413] text-black font-black text-xl rounded-full transition-all shadow-[0_0_40px_-10px_rgba(200,138,4,0.4)] uppercase">
                        COMPRAR AHORA
                    </button>
                    <p className="text-center text-xs text-gray-600 uppercase tracking-widest">Válida por 12 meses desde la fecha de emisión.</p>
                </div>
            </div>
        </GeneralPageLayout>
    );
}
