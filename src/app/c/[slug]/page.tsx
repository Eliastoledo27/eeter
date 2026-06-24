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
    const resellerTheme = reseller.reseller_theme || 'original';

    const themeMainClasses: Record<string, string> = {
        original: 'min-h-screen bg-[#050505] text-white font-sans',
        minimal: 'min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans tracking-tight',
        cyber: 'min-h-screen bg-[#020408] text-emerald-400 font-mono',
        warm: 'min-h-screen bg-[#121110] text-[#F5F2EB] font-serif',
        swiss: 'min-h-screen bg-[#080808] text-white font-sans font-medium',
        kinetic: 'min-h-screen bg-[#030303] text-white font-sans tracking-wide',
    };

    const renderHeader = () => {
        switch (resellerTheme) {
            case 'minimal':
                return (
                    <div className="mb-12 text-center max-w-2xl mx-auto border-b border-zinc-900 pb-8">
                        <h1 className="text-4xl md:text-5xl font-light tracking-tight font-serif text-white uppercase">
                            {reseller.full_name}
                        </h1>
                    </div>
                );
            case 'cyber':
                return (
                    <div className="mb-10 border-l-2 border-emerald-500 pl-6 py-2">
                        <h1 className="text-3xl md:text-5xl font-bold tracking-wider font-mono text-emerald-400 uppercase">
                            {reseller.full_name?.toUpperCase()}
                        </h1>
                    </div>
                );
            case 'warm':
                return (
                    <div className="mb-12 text-left max-w-3xl">
                        <h1 className="text-4xl md:text-6xl font-normal font-serif text-[#F5F2EB] tracking-wide">
                            {reseller.full_name}
                        </h1>
                    </div>
                );
            case 'swiss':
                return (
                    <div className="mb-12 text-left border-4 border-white p-8 max-w-4xl bg-black">
                        <h1 className="text-4xl md:text-8xl font-black tracking-tighter text-white uppercase leading-none">
                            {reseller.full_name?.toUpperCase()}
                        </h1>
                    </div>
                );
            case 'kinetic':
                return (
                    <div className="mb-12 text-left relative overflow-hidden py-4">
                        <h1 className="text-5xl md:text-8xl font-black tracking-widest text-white uppercase italic select-none skew-x-3 bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-zinc-600 leading-none">
                            {reseller.full_name?.toUpperCase()}
                        </h1>
                    </div>
                );
            case 'original':
            default:
                return (
                    <div className="mb-10">
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic text-white">
                            {reseller.full_name}
                        </h1>
                    </div>
                );
        }
    };

    return (
        <main className={themeMainClasses[resellerTheme]}>
            <ResellerCartInitializer
                whatsappNumber={reseller.whatsapp_number}
                resellerTheme={resellerTheme}
            />
            <ResellerNavbar
                resellerSlug={params.slug}
                resellerName={reseller.full_name || ''}
                resellerTheme={resellerTheme}
            />

            <div className="pt-32 pb-20 container mx-auto px-6">
                {renderHeader()}

                <ResellerCatalogClient
                    initialProducts={products}
                    resellerName={reseller.full_name || ''}
                    resellerSlug={params.slug}
                    resellerTheme={resellerTheme}
                />
            </div>


            <ResellerFooter
                resellerSlug={params.slug}
                resellerName={reseller.full_name || ''}
            />
        </main>
    );
}
