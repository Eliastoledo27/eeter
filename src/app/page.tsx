import { Metadata } from 'next';
import { getProducts } from '@/app/actions/products';
import { mapProductTypeToProduct } from '@/lib/product-mapping';
import { LandingExperience } from '@/components/landing/LandingExperience';

export const revalidate = 60;

export const metadata: Metadata = {
    title: 'ÉTER Store | Calzado Urbano Brasil & Sneakers de Lujo',
    description: 'Calidad y confort en calzado urbano brasilero. Stock físico verificado en Mar del Plata, logística integrada en 24/48hs y el ecosistema de revendedores más transparente del país.',
    keywords: ['Zapatillas importadas Brasil Mar del Plata', 'Calzado urbano premium', 'Éter Store Oficial', 'sneakers argentina', 'revendedores calzado'],
    openGraph: {
        title: 'ÉTER Store | Calzado Urbano & The New Standard',
        description: 'Curaduría exclusiva de calzado brasilero, stock real en Mar del Plata y despachos en 24/48hs a todo el país.',
        url: 'https://www.eter.store',
        siteName: 'ÉTER Store',
        locale: 'es_AR',
        type: 'website',
        images: [
            {
                url: '/images/eter-brand-logo.png',
                width: 1200,
                height: 630,
                alt: 'ÉTER Store Official Footwear & Archive',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'ÉTER Store | Calzado Urbano Oficial',
        description: 'Stock físico real y despachos en 24/48hs a todo el país.',
        images: ['/images/eter-brand-logo.png'],
    },
};

export default async function Page() {
    const rawProducts = await getProducts();
    const products = rawProducts.map(mapProductTypeToProduct);

    return (
        <main className="min-h-screen bg-[#050505] text-white">
            <h1 className="sr-only">ÉTER Store — Calzado Urbano Brasil y Sneakers de Alta Gama</h1>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'ShoeStore',
                        name: 'ÉTER Store',
                        image: 'https://www.eter.store/images/eter-brand-logo.png',
                        description: 'La tienda oficial de calzado urbano brasilero en Argentina con stock físico en Mar del Plata.',
                        address: {
                            '@type': 'PostalAddress',
                            addressLocality: 'Mar del Plata',
                            addressRegion: 'Buenos Aires',
                            addressCountry: 'AR',
                        },
                        priceRange: '$$$',
                    }),
                }}
            />

            {/* Complete Official Landing Experience */}
            <LandingExperience products={products} />
        </main>
    );
}
