import { Metadata } from 'next';
import { getProducts, getCategories } from '@/app/actions/products';
import { ResellerCatalog } from '@/components/reseller/ResellerCatalog';

export const metadata: Metadata = {
    title: 'Catálogo Exclusivo Revendedores | ÉTER',
    description: 'Herramienta profesional de ventas para revendedores autorizados ÉTER. Catálogo interactivo con calculadora de márgenes, material de marketing descargable y sistema de pedidos.',
    robots: { index: false, follow: false },
    alternates: {
        canonical: '/c/catalogorev',
    },
    openGraph: {
        title: 'Catálogo Exclusivo Revendedores | ÉTER',
        description: 'Stock en tiempo real, talles visibles y herramientas rápidas para vender calzado premium ÉTER.',
        url: 'https://xn--ter-9la.store/c/catalogorev',
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
        title: 'Catálogo Exclusivo Revendedores | ÉTER',
        description: 'Stock en tiempo real, talles visibles y herramientas rápidas para vender.',
        images: ['/catalog-og.jpg'],
    },
};

export const revalidate = 300;

export default async function ResellerCatalogPage() {
    const [products, categories] = await Promise.all([
        getProducts(undefined, undefined, 'active'),
        getCategories(),
    ]);

    return <ResellerCatalog products={products} categories={categories as string[]} />;
}
