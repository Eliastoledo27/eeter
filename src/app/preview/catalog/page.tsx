import { getProducts } from '@/app/actions/products';
import { mapProductTypeToProduct } from '@/lib/product-mapping';
import { PreviewCatalogClient } from '@/components/preview/PreviewCatalogClient';

export const dynamic = 'force-dynamic';

export default async function PreviewCatalogPage() {
    const rawProducts = await getProducts();
    const products = rawProducts.map(mapProductTypeToProduct);

    return <PreviewCatalogClient initialProducts={products} />;
}
