'use server';

import { getResellerBySlug, getResellerProducts } from '@/app/actions/reseller-catalog';
import { ResellerNavbar } from '@/components/layout/reseller/ResellerNavbar';
import { ResellerFooter } from '@/components/layout/reseller/ResellerFooter';
import { ResellerCatalogClient } from './ResellerCatalogClient';
import { notFound } from 'next/navigation';
import { ResellerCartInitializer } from '@/components/cart/ResellerCartInitializer';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const { data: reseller } = await getResellerBySlug(params.slug);

    if (!reseller) {
        return {
            title: 'Catálogo de Revendedor | ÉTER Store',
            description: 'Explorá la selección curada de zapatillas premium de ÉTER Store.',
        };
    }

    const resellerName = reseller.full_name || 'Revendedor Autorizado';
    const avatarUrl = reseller.avatar_url || '/logo.png';

    return {
        title: `Catálogo de ${resellerName} | ÉTER Store`,
        description: `Explorá el catálogo curado de zapatillas premium por ${resellerName}. Envíos express a toda el país y calidad certificada.`,
        openGraph: {
            title: `Catálogo de ${resellerName} | ÉTER Store`,
            description: `Explorá el catálogo curado de zapatillas premium por ${resellerName}. Envíos express a toda el país y calidad certificada.`,
            url: `https://eter.store/c/${params.slug}`,
            images: [
                {
                    url: avatarUrl,
                    width: 1200,
                    height: 630,
                    alt: `Catálogo de ${resellerName}`,
                }
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `Catálogo de ${resellerName} | ÉTER Store`,
            description: `Explorá el catálogo curado de zapatillas premium por ${resellerName}.`,
            images: [avatarUrl],
        }
    };
}

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
                    <span className="text-[#00E5FF] font-mono text-sm tracking-[0.4em] uppercase mb-4 block">
                        Catálogo Exclusivo por
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
                        {reseller.full_name} <span className="text-white/20">/</span> <span className="text-[#00E5FF]">ÉTER</span>
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
