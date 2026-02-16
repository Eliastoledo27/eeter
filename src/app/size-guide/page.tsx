import { GeneralPageLayout } from '@/components/layout/GeneralPageLayout';
import { Ruler } from 'lucide-react';

export default function SizeGuidePage() {
    const mensSizes = [
        { arg: '38', cm: '25', us: '7' },
        { arg: '39', cm: '25.5', us: '7.5' },
        { arg: '40', cm: '26', us: '8' },
        { arg: '41', cm: '27', us: '9' },
        { arg: '42', cm: '28', us: '10' },
        { arg: '43', cm: '28.5', us: '10.5' },
        { arg: '44', cm: '29', us: '11' },
        { arg: '45', cm: '30', us: '12' },
    ];

    return (
        <GeneralPageLayout
            title="TALLES"
            subtitle="GUÍA TÉCNICA"
            description="Encontrá el ajuste perfecto. Nuestra guía de talles te ayudará a seleccionar el calzado ideal para tu comodidad."
            breadcrumb="GUÍA DE TALLES"
        >
            <div className="flex flex-col lg:flex-row gap-16 items-start">
                <div className="lg:w-1/2 overflow-hidden rounded-[2.5rem] border border-white/10">
                    <table className="w-full text-left">
                        <thead className="bg-[#C88A04] text-black font-bold uppercase text-sm">
                            <tr>
                                <th className="p-6">ARG / BR</th>
                                <th className="p-6">CM (Largo)</th>
                                <th className="p-6">US</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white/5 divide-y divide-white/5">
                            {mensSizes.map((s, i) => (
                                <tr key={i} className="hover:bg-white/10 transition-colors">
                                    <td className="p-6 font-mono text-xl">{s.arg}</td>
                                    <td className="p-6 text-gray-400">{s.cm} cm</td>
                                    <td className="p-6 text-gray-400">{s.us}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="lg:w-1/2 space-y-12">
                    <div className="p-10 rounded-[2.5rem] border border-[#C88A04]/20 bg-[#C88A04]/5">
                        <Ruler className="text-[#C88A04] mb-6" size={40} />
                        <h3 className="text-3xl font-black mb-6 uppercase leading-tight">¿Cómo medir tu pie?</h3>
                        <ol className="space-y-6 list-decimal list-inside text-gray-300">
                            <li>Colocá una hoja de papel en el piso contra la pared.</li>
                            <li>Poné tu pie sobre la hoja con el talón apoyado en la pared.</li>
                            <li>Marcá donde termina tu dedo más largo.</li>
                            <li>Medí la distancia en centímetros y consultá la tabla.</li>
                        </ol>
                    </div>
                </div>
            </div>
        </GeneralPageLayout>
    );
}
