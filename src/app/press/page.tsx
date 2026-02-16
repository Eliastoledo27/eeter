import { GeneralPageLayout } from '@/components/layout/GeneralPageLayout';
import { Newspaper, Image as ImageIcon, Download, Share2 } from 'lucide-react';

export default function PressPage() {
    return (
        <GeneralPageLayout
            title="PRENSA"
            subtitle="MEDIA KIT"
            description="Recursos oficiales, comunicados y material gráfico para medios de comunicación y colaboradores."
            breadcrumb="PRENSA"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="space-y-12">
                    <div className="p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.02]">
                        <Newspaper className="text-[#C88A04] mb-6" size={40} />
                        <h3 className="text-2xl font-black mb-6 uppercase">Comunicados</h3>
                        <div className="space-y-6">
                            {[
                                { date: 'FEB 10, 2026', title: 'Éter Store revoluciona la logística con su nuevo hub automatizado.' },
                                { date: 'ENE 24, 2026', title: 'Lanzamiento: Colección Aurum Special Edition bate récords de venta.' }
                            ].map((item, i) => (
                                <div key={i} className="pb-6 border-b border-white/5 last:border-0">
                                    <span className="text-[#C88A04] text-xs font-mono">{item.date}</span>
                                    <h4 className="text-white font-medium hover:text-[#C88A04] cursor-pointer transition-colors mt-2">{item.title}</h4>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="p-8 border border-[#C88A04]/20 rounded-3xl bg-[#C88A04]/5">
                        <ImageIcon className="text-[#C88A04] mb-4" size={32} />
                        <h4 className="text-xl font-bold mb-2 uppercase">Brand Assets</h4>
                        <p className="text-gray-400 text-sm mb-6">Descargá logotipos en alta resolución, tipografías y guías de estilo oficiales.</p>
                        <button className="flex items-center gap-2 text-black bg-[#C88A04] px-6 py-3 rounded-full font-bold uppercase text-xs hover:bg-[#ECA413] transition-colors">
                            <Download size={16} /> DESCARGAR MEDIA KIT
                        </button>
                    </div>

                    <div className="p-8 border border-white/5 rounded-3xl bg-white/[0.02] flex items-center justify-between">
                        <div>
                            <h4 className="font-bold uppercase">Contacto de Prensa</h4>
                            <p className="text-gray-500 text-sm">press@eter.store</p>
                        </div>
                        <Share2 className="text-gray-500" size={24} />
                    </div>
                </div>
            </div>
        </GeneralPageLayout>
    );
}
