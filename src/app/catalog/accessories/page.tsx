import { GeneralPageLayout } from '@/components/layout/GeneralPageLayout';
import { ShoppingBag, Star, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function AccessoriesPage() {
    return (
        <GeneralPageLayout
            title="ACCESORIOS"
            subtitle="CURATED COLLECTION"
            description="El complemento perfecto para tu calzado Éter. Explora nuestra línea de accesorios premium diseñados para elevar tu outfit."
            breadcrumb="TIENDA / ACCESORIOS"
        >
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Sparkles className="text-[#C88A04] mb-8 animate-pulse" size={64} />
                <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 text-white">Próximamente</h2>
                <p className="text-gray-500 max-w-md mb-12">Estamos finalizando los detalles de nuestra nueva línea de accesorios. Registrate para recibir la notificación de lanzamiento.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl opacity-40 grayscale pointer-events-none">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="aspect-[3/4] bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center">
                            <ShoppingBag className="text-white/20" size={48} />
                        </div>
                    ))}
                </div>

                <Link href="/catalog" className="mt-16 group">
                    <button className="h-16 px-10 bg-white text-black font-black rounded-full hover:bg-[#C88A04] hover:text-white transition-all flex items-center gap-4">
                        VOLVER AL CATÁLOGO
                        <Star size={20} className="group-hover:rotate-45 transition-transform" />
                    </button>
                </Link>
            </div>
        </GeneralPageLayout>
    );
}
