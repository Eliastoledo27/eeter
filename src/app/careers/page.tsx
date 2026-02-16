import { GeneralPageLayout } from '@/components/layout/GeneralPageLayout';
import { Briefcase, Users, Zap, Heart } from 'lucide-react';

export default function CareersPage() {
    const roles = [
        { title: 'UX Designer', type: 'Remoto / Full-time', area: 'Diseño' },
        { title: 'Logistics Lead', type: 'Buenos Aires / On-site', area: 'Operaciones' },
        { title: 'Fullstack Developer', type: 'Remoto / Full-time', area: 'Tech' },
        { title: 'Social Media Manager', type: 'Híbrido', area: 'Marketing' }
    ];

    return (
        <GeneralPageLayout
            title="ÚNETE"
            subtitle="TALENTO ÉTER"
            description="Estamos construyendo el futuro del comercio digital en Argentina. Buscamos mentes creativas y apasionadas por la moda y la tecnología."
            breadcrumb="CARRERAS"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
                {[
                    { icon: Heart, title: 'CULTURA', desc: 'Ambiente dinámico y disruptivo.' },
                    { icon: Zap, title: 'CRECIMIENTO', desc: 'Plan de carrera real y acelerado.' },
                    { icon: Users, title: 'EQUIPO', desc: 'Expertos de toda la región.' },
                    { icon: Briefcase, title: 'FLEXIBLE', desc: 'Work-life balance como prioridad.' }
                ].map((item, i) => (
                    <div key={i} className="p-8 border border-white/5 rounded-3xl bg-white/[0.02]">
                        <item.icon className="text-[#C88A04] mb-4" size={32} />
                        <h4 className="font-bold mb-2 uppercase">{item.title}</h4>
                        <p className="text-gray-500 text-xs uppercase tracking-widest">{item.desc}</p>
                    </div>
                ))}
            </div>

            <div className="space-y-6">
                <h3 className="text-2xl font-black uppercase tracking-widest mb-10 text-[#C88A04]">Posiciones Abiertas</h3>
                {roles.map((role, i) => (
                    <div key={i} className="group flex flex-col md:flex-row justify-between items-center p-8 rounded-2xl border border-white/5 hover:border-[#C88A04]/50 hover:bg-white/[0.03] transition-all cursor-pointer">
                        <div className="text-center md:text-left mb-4 md:mb-0">
                            <span className="text-[#C88A04] text-xs font-mono uppercase tracking-[0.2em]">{role.area}</span>
                            <h4 className="text-2xl font-bold uppercase">{role.title}</h4>
                        </div>
                        <div className="flex items-center gap-8">
                            <span className="text-gray-500 text-sm uppercase font-mono">{role.type}</span>
                            <button className="px-6 py-2 rounded-full border border-white/20 group-hover:bg-white group-hover:text-black transition-all font-bold uppercase text-xs">APLICAR</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-24 p-12 text-center border border-white/10 rounded-[3rem] bg-white/[0.01]">
                <h3 className="text-2xl font-bold mb-4 uppercase">¿No encontrás lo que buscás?</h3>
                <p className="text-gray-500 mb-8">Envíanos tu CV de forma espontánea a <span className="text-[#C88A04]">talento@eter.store</span></p>
            </div>
        </GeneralPageLayout>
    );
}
