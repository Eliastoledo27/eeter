import { GeneralPageLayout } from '@/components/layout/GeneralPageLayout';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function NewArrivalsPage() {
    return (
        <GeneralPageLayout
            title="NOVEDADES"
            subtitle="NEW ARRIVALS"
            description="Las últimas tendencias en calzado premium. Diseños que desafían lo convencional y definen el futuro del estilo."
            breadcrumb="TIENDA / NOVEDADES"
        >
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Sparkles className="text-[#C88A04] mb-8 animate-bounce" size={64} />
                <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 text-white">Próximo Drop: Colección 2026</h2>
                <p className="text-gray-500 max-w-md mb-12">Estamos preparando el lanzamiento más importante del año. Los nuevos modelos estarán disponibles en breve.</p>

                <Link href="/catalog" className="group">
                    <button className="h-16 px-10 bg-[#C88A04] text-black font-black rounded-full hover:bg-white transition-all flex items-center gap-4 uppercase">
                        Ver Colección Actual
                        <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                </Link>
            </div>
        </GeneralPageLayout>
    );
}
