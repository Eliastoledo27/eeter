import { Metadata } from 'next';
import { getProducts } from '@/app/actions/products';
import { mapProductTypeToProduct } from '@/lib/product-mapping';
import { PreviewCatalogClient } from '@/components/preview/PreviewCatalogClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Catálogo de Zapatillas, Calzado Urbano & Zapas Brasil | ÉTER Store',
    description: 'Comprá zapatillas urbanas y sneakers importados de Brasil en nuestro catálogo online. Encontrá todos los modelos de zapas con stock físico en Mar del Plata (MDQ), talles reales y envíos en 24/48hs.',
    keywords: [
        'catálogo de zapatillas', 'catálogo de calzado', 'comprar zapas online',
        'zapatillas importadas precio', 'zapas en stock', 'modelos de zapatillas',
        'sneakers catálogo', 'calzado urbano brasil', 'zapatillas hombre', 'zapatillas mujer',
        'zapatillas mar del plata catálogo', 'catálogo eter', 'eter calzados catálogo'
    ],
    alternates: {
        canonical: 'https://www.eter.store/catalog',
    },
    openGraph: {
        title: 'Catálogo de Zapatillas, Calzado Urbano & Zapas Brasil | ÉTER Store',
        description: 'Explorá nuestro catálogo completo de zapatillas urbanas y sneakers con stock físico en Mar del Plata. Despachos en 24/48hs a todo el país.',
        url: 'https://www.eter.store/catalog',
        siteName: 'ÉTER Store Oficial - Catálogo de Calzado',
        images: [
            {
                url: '/images/eter-brand-logo.png',
                width: 1200,
                height: 630,
                alt: 'Catálogo de Zapatillas & Calzado Urbano - ÉTER Store',
            },
        ],
    },
};

export default async function CatalogPage() {
    const rawProducts = await getProducts();
    const products = rawProducts.map(mapProductTypeToProduct);

    return <PreviewCatalogClient initialProducts={products} />;
}
