import { headers } from 'next/headers';
import CatalogClient from './CatalogClient';
import { Metadata } from 'next';
import { getProducts } from '@/app/actions/products';
import { getActiveResellerCatalogLinks } from '@/app/actions/reseller-catalog';

export const metadata: Metadata = {
    title: 'Catálogo Oficial Éter Store | Zapatillas Importadas y Stock Inmediato',
    description: 'Comprá zapatillas premium de Brasil en Mar del Plata. Modelos seleccionados, stock claro y envíos express a toda Argentina. ¡Entrá y llevate las tuyas!',
    openGraph: {
        title: 'Catálogo Oficial Éter Store | Zapatillas Importadas y Stock Inmediato',
        description: 'Comprá zapatillas premium de Brasil en Mar del Plata. Modelos seleccionados, stock claro y envíos express a toda Argentina. ¡Entrá y llevate las tuyas!',
        url: 'https://xn--ter-9la.store/catalog',
        images: [
            {
                url: '/catalog-og.jpg',
                width: 1200,
                height: 630,
                alt: 'Catálogo Oficial Éter Store',
            }
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Catálogo Oficial Éter Store | Zapatillas Importadas y Stock Inmediato',
        description: 'Comprá zapatillas premium de Brasil en Mar del Plata.',
        images: ['/catalog-og.jpg'],
    }
};

export const revalidate = 300; // Fresh stock every 5 minutes

export default async function CatalogPage({
    searchParams
}: {
    searchParams: { format?: string };
}) {
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || '';

    // Detect typical bot agents or explicit text request
    const isBot = /Chatfuel|ManyChat|curl|bot|googlebot|crawler/i.test(userAgent) || searchParams.format === 'text';

    // Fetch products for both bots and normal users (for SSR/Hydration)
    const [products, resellerCatalogLinks] = await Promise.all([
        getProducts(undefined, undefined, 'active'),
        getActiveResellerCatalogLinks(),
    ]);

    if (isBot) {
        const catalogData = products.map((product) => {
            const sizesStr = Object.keys(product.stock_by_size || {}).length > 0
                ? Object.entries(product.stock_by_size)
                    .map(([size, quantity]) => `Talle ${size} (${quantity} disponibles)`)
                    .join(', ')
                : 'Stock único';

            return `### ${product.name}
- **ID**: ${product.id}
- **Categoría**: ${product.category}
- **Precio**: $${product.base_price}
- **Stock Total**: ${Object.values(product.stock_by_size || {}).reduce((a, b) => a + (Number(b) || 0), 0)}
- **Talles**: ${sizesStr}
- **Link**: https://eter.store/catalog/${product.id}
- **Imagen**: ${product.images?.[0] || ''}`;
        }).join('\n\n---\n\n');

        return (
            <main className="min-h-screen bg-black text-green-400 p-8 font-mono text-sm selection:bg-green-900">
                <div className="max-w-4xl mx-auto">
                    <header className="border-b border-green-800 pb-4 mb-8">
                        <h1 className="text-xl font-bold uppercase tracking-widest text-green-500">
                            [SERVER_RESPONSE] Éter Catalog Data Feed
                        </h1>
                        <p className="opacity-70 mt-1">Sincronización de inventario en tiempo real para agentes.</p>
                    </header>
                    <pre className="whitespace-pre-wrap">
                        {catalogData || 'No hay productos activos en este momento.'}
                    </pre>
                </div>
            </main>
        );
    }

    // JSON-LD for rich snippets globally in Catalog
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Catálogo Oficial Éter Store",
        "description": "Comprá zapatillas premium de Brasil en Mar del Plata. Modelos seleccionados, stock claro y envíos express a toda Argentina.",
        "url": "https://xn--ter-9la.store/catalog"
    };

    // For normal users, we serve the premium visual experience
    return (
        <>
            <h1 className="sr-only">Catálogo Oficial Éter Store | Zapatillas Importadas y Stock Inmediato</h1>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <CatalogClient initialProducts={products} resellerCatalogLinks={resellerCatalogLinks} />
        </>
    );
}
