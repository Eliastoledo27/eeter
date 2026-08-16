import { getProducts } from '@/app/actions/products';
import { mapProductTypeToProduct } from '@/lib/product-mapping';
import LandingExperience from '@/components/landing/LandingExperience';

export const dynamic = 'force-dynamic';

export default async function PreviewLandingPage() {
    const rawProducts = await getProducts();
    const domainProducts = rawProducts.map(mapProductTypeToProduct);

    return (
        <main className="min-h-screen bg-[#050505] text-white">
            <LandingExperience products={domainProducts} />
        </main>
    );
}
