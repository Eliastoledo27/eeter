import { GeneralPageLayout } from '@/components/layout/GeneralPageLayout';
import { Truck, Package, Clock, ShieldCheck } from 'lucide-react';

export default function ShippingPage() {
    const features = [
        { icon: Truck, title: 'ENVÍO EXPRESS', desc: 'Entregas en 24-48h en las principales ciudades del país.' },
        { icon: Package, title: 'PACKAGING PREMIUM', desc: 'Cada pedido es embalado con materiales de alta resistencia y diseño exclusivo.' },
        { icon: Clock, title: 'SEGUIMIENTO REAL', desc: 'Trackeo en tiempo real desde que sale de nuestro centro logístico.' },
        { icon: ShieldCheck, title: 'ENTREGA SEGURA', desc: 'Garantizamos que tu producto llegue en perfectas condiciones o te devolvemos el dinero.' }
    ];

    return (
        <GeneralPageLayout
            title="ENVÍOS"
            subtitle="SOPORTE Y LOGÍSTICA"
            description="Entregamos excelencia en cada paquete. Conocé nuestro sistema de logística integral diseñado para tu tranquilidad."
            breadcrumb="ENVÍOS"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                {features.map((f, i) => (
                    <div key={i} className="p-8 rounded-3xl border border-white/5 bg-white/5 hover:border-[#C88A04]/30 transition-all group">
                        <f.icon className="text-[#C88A04] mb-6 group-hover:scale-110 transition-transform" size={40} />
                        <h3 className="text-2xl font-bold mb-4 uppercase">{f.title}</h3>
                        <p className="text-gray-400 font-light leading-relaxed">{f.desc}</p>
                    </div>
                ))}
            </div>

            <div className="prose prose-invert max-w-none">
                <h2 className="text-3xl font-bold mb-8 text-[#C88A04] uppercase">Tiempos de Entrega</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="border-l border-white/10 pl-6">
                        <h4 className="text-white font-bold mb-2 uppercase">ZONA METROPOLITANA</h4>
                        <p className="text-gray-500 font-light">De 24 a 48 horas hábiles después de la confirmación del pago.</p>
                    </div>
                    <div className="border-l border-white/10 pl-6">
                        <h4 className="text-white font-bold mb-2 uppercase">RESTO DEL PAÍS</h4>
                        <p className="text-gray-500 font-light">De 3 a 5 días hábiles, dependiendo de la ubicación geográfica.</p>
                    </div>
                    <div className="border-l border-white/10 pl-6">
                        <h4 className="text-white font-bold mb-2 uppercase">INTERNACIONAL</h4>
                        <p className="text-gray-500 font-light">Contactar con soporte para cotizaciones y plazos específicos.</p>
                    </div>
                </div>
            </div>
        </GeneralPageLayout>
    );
}
