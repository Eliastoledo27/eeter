import { GeneralPageLayout } from '@/components/layout/GeneralPageLayout';
import { ShieldCheck, Fingerprint, Lock, QrCode } from 'lucide-react';

export default function AuthenticityPage() {
    return (
        <GeneralPageLayout
            title="ORIGINAL"
            subtitle="GARANTÍA ÉTER"
            description="La excelencia no se imita. Cada par de Éter es una pieza única de ingeniería y diseño brasilero, certificada para tu confianza."
            breadcrumb="AUTENTICIDAD"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="relative aspect-video rounded-[3rem] overflow-hidden border border-white/10">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#C88A04]/20 to-transparent z-10" />
                    <img
                        src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2000&auto=format"
                        alt="Calzado Premium"
                        className="w-full h-full object-cover grayscale opacity-50"
                    />
                    <div className="absolute inset-x-8 bottom-8 z-20">
                        <span className="text-4xl font-black italic tracking-tighter opacity-20">CERTIFIED AUTHENTIC</span>
                    </div>
                </div>

                <div className="space-y-8">
                    {[
                        { icon: Fingerprint, title: 'ID ÚNICO', desc: 'Cada producto posee un número de serie único grabado por láser en la estructura interna.' },
                        { icon: QrCode, title: 'VALIDACIÓN NFC/QR', desc: 'Escaneá la etiqueta inteligente para verificar la procedencia y materiales directamente en nuestra base.' },
                        { icon: ShieldCheck, title: 'PROCEDENCIA BRASILERA', desc: 'Trabajamos con las fábricas más avanzadas de Brasil, cuna del calzado de alta calidad en la región.' }
                    ].map((item, i) => (
                        <div key={i} className="flex gap-6 p-6 rounded-2xl border border-white/5 hover:bg-white/5 transition-all">
                            <item.icon className="text-[#C88A04] shrink-0" size={32} />
                            <div>
                                <h4 className="font-bold text-lg mb-1 uppercase">{item.title}</h4>
                                <p className="text-gray-500 text-sm">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-24 p-12 text-center bg-[#C88A04] rounded-[3rem]">
                <Lock className="mx-auto text-black mb-6" size={48} />
                <h2 className="text-4xl font-black text-black mb-4 uppercase">Sello de Confianza</h2>
                <p className="text-black/70 max-w-2xl mx-auto font-medium">
                    No aceptamos compromisos en la calidad. Si sospechás de una imitación, nuestro equipo legal está listo para asistirte y garantizar que recibas el producto por el cual pagaste.
                </p>
            </div>
        </GeneralPageLayout>
    );
}
