import { Metadata } from 'next';
import { getProducts } from '@/app/actions/products';
import { mapProductTypeToProduct } from '@/lib/product-mapping';
import { PreviewCatalogClient } from '@/components/preview/PreviewCatalogClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Catálogo Oficial | ÉTER Store',
    description: 'Explorá toda la colección de calzado urbano y sneakers con stock físico en Mar del Plata. Despachos en 24 a 48hs con Andreani y Correo Argentino.',
};

export default async function CatalogPage() {
    const rawProducts = await getProducts();
    const products = rawProducts.map(mapProductTypeToProduct);

    return <PreviewCatalogClient initialProducts={products} />;
}
