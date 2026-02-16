'use server';

import { getResellerBySlug, getResellerProducts } from '@/app/actions/reseller-catalog';
import { ResellerNavbar } from '@/components/layout/reseller/ResellerNavbar';
import { ResellerFooter } from '@/components/layout/reseller/ResellerFooter';
import { ResellerCatalogClient } from './ResellerCatalogClient';
import { notFound } from 'next/navigation';
import { ResellerCartInitializer } from '@/components/cart/ResellerCartInitializer';

export default async function ResellerPublicCatalog({ params }: { params: { slug: string } }) {
    const { data: reseller, error } = await getResellerBySlug(params.slug);

    if (error || !reseller) {
        return notFound();
    }

    // Pass the reseller's custom pricing to the grid
    const products = await getResellerProducts(reseller.id, reseller.reseller_markup ?? 10000);

    return (
        <main className="min-h-screen bg-[#050505] text-white">
            <ResellerCartInitializer whatsappNumber={reseller.whatsapp_number} />
            <ResellerNavbar
                resellerSlug={params.slug}
                resellerName={reseller.full_name || ''}
            />

            <div className="pt-32 pb-20 container mx-auto px-6">
                <div className="mb-12">
                    <span className="text-[#C88A04] font-mono text-sm tracking-[0.4em] uppercase mb-4 block">
                        Catálogo Exclusivo por
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
                        {reseller.full_name} <span className="text-white/20">/</span> <span className="text-[#C88A04]">ÉTER</span>
                    </h1>
                    <p className="text-gray-500 mt-4 max-w-2xl font-light">
                        Bienvenido a mi selección curada de calzado premium. Todos los productos cuentan con la garantía de calidad de ÉTER.
                    </p>
                </div>

                <ResellerCatalogClient
                    initialProducts={products}
                    resellerName={reseller.full_name || ''}
                    resellerSlug={params.slug}
                />
            </div>


            <ResellerFooter
                resellerSlug={params.slug}
                resellerName={reseller.full_name || ''}
            />
        </main>
    );
}
