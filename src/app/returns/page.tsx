import { GeneralPageLayout } from '@/components/layout/GeneralPageLayout';
import { RefreshCcw, ShieldPlus, CheckCircle2 } from 'lucide-react';

export default function ReturnsPage() {
    return (
        <GeneralPageLayout
            title="CAMBIOS"
            subtitle="SOPORTE AL CLIENTE"
            description="Tu satisfacción es nuestra prioridad absoluta. Si el producto no es lo que esperabas o el talle no es el correcto, estamos acá para solucionarlo."
            breadcrumb="DEVOLUCIONES"
        >
            <div className="space-y-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: CheckCircle2, title: '30 DÍAS DE PLAZO', desc: 'Tenés un mes completo para solicitar un cambio o devolución.' },
                        { icon: RefreshCcw, title: 'CAMBIO SIMPLE', desc: 'Proceso 100% online y asistido por nuestro equipo.' },
                        { icon: ShieldPlus, title: 'COMPRA PROTEGIDA', desc: 'Garantía oficial Éter en todos nuestros productos.' }
                    ].map((item, i) => (
                        <div key={i} className="text-center p-8 border border-white/5 rounded-[2rem] bg-white/[0.02]">
                            <item.icon className="mx-auto text-[#C88A04] mb-6" size={48} />
                            <h3 className="text-xl font-bold mb-4 uppercase">{item.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="max-w-4xl mx-auto p-12 rounded-[3rem] border border-[#C88A04]/20 bg-gradient-to-br from-[#111] to-black">
                    <h2 className="text-3xl font-black mb-8 border-b border-white/5 pb-4 uppercase">¿Cómo inicio un cambio?</h2>
                    <ol className="space-y-8 list-decimal list-inside text-gray-400">
                        <li className="text-lg"><span className="text-white font-bold uppercase">Solicitud:</span> Envíanos un mensaje vía WhatsApp o email con tu número de orden.</li>
                        <li className="text-lg"><span className="text-white font-bold uppercase">Verificación:</span> Revisaremos el estado de la prenda y el motivo del cambio.</li>
                        <li className="text-lg"><span className="text-white font-bold uppercase">Retiro/Envío:</span> Coordinamos el retiro del producto original.</li>
                        <li className="text-lg"><span className="text-white font-bold uppercase">Nueva Entrega:</span> Te enviamos el nuevo talle o producto sin demoras.</li>
                    </ol>
                </div>
            </div>
        </GeneralPageLayout>
    );
}
