import { Metadata } from 'next';
import ResellerCatalogPage, { revalidate } from '../catalogorev/page';

export const metadata: Metadata = {
    title: 'Catálogo Revendedor ÉTER | Stock y Talles en Vivo',
    description: 'Catálogo rápido para revendedores ÉTER: modelos activos, talles visibles, stock real y recursos para vender por WhatsApp.',
    robots: { index: false, follow: false },
    alternates: {
        canonical: '/c/catalogrev',
    },
    openGraph: {
        title: 'Catálogo Revendedor ÉTER | Stock y Talles en Vivo',
        description: 'Modelos activos, talles visibles, stock real y recursos para vender por WhatsApp.',
        url: 'https://xn--ter-9la.store/c/catalogrev',
        siteName: 'ÉTER Store',
        locale: 'es_AR',
        type: 'website',
        images: [
            {
                url: '/catalog-og.jpg',
                width: 1200,
                height: 630,
                alt: 'Catálogo revendedor ÉTER',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Catálogo Revendedor ÉTER | Stock y Talles en Vivo',
        description: 'Modelos activos, talles visibles y stock real para revendedores.',
        images: ['/catalog-og.jpg'],
    },
};

export { revalidate };
export default ResellerCatalogPage;
