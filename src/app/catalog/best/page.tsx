import { GeneralPageLayout } from '@/components/layout/GeneralPageLayout';
import { Trophy, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function BestSellersPage() {
    return (
        <GeneralPageLayout
            title="TOP"
            subtitle="MÁS VENDIDOS"
            description="Los favoritos de nuestra comunidad. Estos son los modelos que definen la estética Éter en las calles."
            breadcrumb="TIENDA / BEST SELLERS"
        >
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Trophy className="text-[#C88A04] mb-8" size={64} />
                <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 text-white">Favoritos del Público</h2>
                <p className="text-gray-500 max-w-md mb-12">Nuestros modelos más icónicos están volviendo a stock. Asegurá el tuyo antes de que se agoten nuevamente.</p>

                <Link href="/catalog" className="group">
                    <button className="h-16 px-10 border-2 border-white text-white font-black rounded-full hover:bg-[#C88A04] hover:border-[#C88A04] hover:text-black transition-all flex items-center gap-4 uppercase">
                        Explorar Modelos
                        <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                </Link>
            </div>
        </GeneralPageLayout>
    );
}
