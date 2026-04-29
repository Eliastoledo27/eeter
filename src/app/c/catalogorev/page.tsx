import { Metadata } from 'next';
import { getProducts, getCategories } from '@/app/actions/products';
import { ResellerCatalog } from '@/components/reseller/ResellerCatalog';

export const metadata: Metadata = {
    title: 'Catálogo Exclusivo Revendedores | ÉTER',
    description: 'Herramienta profesional de ventas para revendedores autorizados ÉTER. Catálogo interactivo con calculadora de márgenes, material de marketing descargable y sistema de pedidos.',
    robots: { index: false, follow: false },
};

export const revalidate = 300; // revalidate every 5 minutes

export default async function ResellerCatalogPage() {
    const [products, categories] = await Promise.all([
        getProducts(undefined, undefined, 'active'),
        getCategories(),
    ]);

    return <ResellerCatalog products={products} categories={categories as string[]} />;
}
