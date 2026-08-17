import { Metadata } from 'next';
import { getProducts } from '@/app/actions/products';
import { mapProductTypeToProduct } from '@/lib/product-mapping';
import { LandingExperience } from '@/components/landing/LandingExperience';

export const revalidate = 60;

export const metadata: Metadata = {
    title: 'Zapatillas Urbanas, Calzado Brasil & Sneakers de Lujo | ÉTER Store Oficial',
    description: 'Comprá zapatillas urbanas, calzado importado de Brasil y sneakers exclusivos en ÉTER Store. Stock físico verificado en Mar del Plata (MDQ), despachos en 24/48hs a todo el país y precios para revendedores.',
    keywords: [
        'zapas', 'calzado', 'zapatillas', 'sneakers', 'calzado urbano', 'zapas urbanas',
        'zapatillas urbanas', 'zapatillas brasil', 'calzado brasilero', 'zapas importadas',
        'zapatillas importadas brasil', 'sneakers argentina', 'comprar zapas', 'tienda de calzado',
        'zapatillas mar del plata', 'zapas mdq', 'calzado mdq', 'revendedores calzado',
        'eter', 'éter', 'eter store', 'éter store', 'eter calzados', 'eter zapas'
    ],
    alternates: {
        canonical: 'https://www.eter.store',
    },
    openGraph: {
        title: 'Zapatillas Urbanas, Calzado Brasil & Sneakers de Lujo | ÉTER Store Oficial',
        description: 'Curaduría exclusiva de calzado brasilero y zapas urbanas con stock real en Mar del Plata y despachos en 24/48hs a todo el país.',
        url: 'https://www.eter.store',
        siteName: 'ÉTER Store Oficial',
        locale: 'es_AR',
        type: 'website',
        images: [
            {
                url: '/images/eter-brand-logo.png',
                width: 1200,
                height: 630,
                alt: 'ÉTER Store Oficial - Zapatillas Urbanas, Calzado & Sneakers',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Zapatillas Urbanas, Calzado Brasil & Sneakers | ÉTER Store Oficial',
        description: 'Stock físico real en Mar del Plata y despachos en 24/48hs a todo el país.',
        images: ['/images/eter-brand-logo.png'],
    },
};

export default async function Page() {
    const rawProducts = await getProducts();
    const products = rawProducts.map(mapProductTypeToProduct);

    return (
        <main className="min-h-screen bg-[#050505] text-white">
            <h1 className="sr-only">ÉTER Store — Calzado Urbano Brasil, Sneakers y Zapas en Mar del Plata (MDQ)</h1>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'ShoeStore',
                        name: 'ÉTER Store Oficial',
                        alternateName: [
                            'ÉTER',
                            'ETER',
                            'Éter Store',
                            'Eter Store',
                            'Éter Calzados',
                            'Eter Calzados',
                            'Éter Zapas',
                            'Eter Zapas',
                            'Éter Shop',
                            'Eter Shop',
                            'Éter MDQ',
                            'Eter MDQ',
                            'Éter Mar del Plata'
                        ],
                        url: 'https://www.eter.store',
                        image: 'https://www.eter.store/images/eter-brand-logo.png',
                        logo: 'https://www.eter.store/images/eter-brand-logo.png',
                        description: 'Tienda oficial de calzado urbano y zapatillas importadas de Brasil en Argentina con base y stock físico en Mar del Plata (MDQ).',
                        address: {
                            '@type': 'PostalAddress',
                            addressLocality: 'Mar del Plata',
                            addressRegion: 'Buenos Aires',
                            addressCountry: 'AR',
                        },
                        geo: {
                            '@type': 'GeoCoordinates',
                            latitude: -38.0055,
                            longitude: -57.5426,
                        },
                        priceRange: '$$$',
                        telephone: '+5492236204002',
                    }),
                }}
            />

            {/* Complete Official Landing Experience */}
            <LandingExperience products={products} />
        </main>
    );
}
