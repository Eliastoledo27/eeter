import { SupabaseProductRepository } from '@/infrastructure/repositories/SupabaseProductRepository';
import { headers } from 'next/headers';
import CatalogClient from './CatalogClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Catálogo Oficial Éter Store | Zapatillas Importadas y Stock Inmediato',
    description: 'Comprá las mejores zapatillas premium de Brasil en Mar del Plata. Modelos exclusivos, calidad G5/Espejo y envíos express a toda Argentina. ¡Entrá y llevate las tuyas!',
};

export const revalidate = 0; // Fresh stock for bots

export default async function CatalogPage({
    searchParams
}: {
    searchParams: { format?: string };
}) {
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || '';

    // Detect typical bot agents or explicit text request
    const isBot = /Chatfuel|ManyChat|curl|bot|googlebot|crawler/i.test(userAgent) || searchParams.format === 'text';

    if (isBot) {
        const repository = new SupabaseProductRepository();
        const products = await repository.findAll();
        const activeProducts = products.filter(p => p.status === 'active');

        const catalogData = activeProducts.map((product) => {
            const sizesStr = Object.keys(product.stockBySize).length > 0
                ? Object.entries(product.stockBySize)
                    .map(([size, quantity]) => `Talle ${size} (${quantity} disponibles)`)
                    .join(', ')
                : 'Stock único';

            return `### ${product.name}
- **ID**: ${product.id}
- **Categoría**: ${product.category}
- **Precio**: $${product.basePrice}
- **Stock Total**: ${product.totalStock}
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
        "description": "Comprá las mejores zapatillas premium de Brasil en Mar del Plata. Modelos exclusivos, calidad G5/Espejo y envíos express a toda Argentina.",
        "url": "https://eter.store/catalog"
    };

    // For normal users, we serve the premium visual experience
    return (
        <>
            <h1 className="sr-only">Catálogo Oficial Éter Store | Zapatillas Importadas y Stock Inmediato</h1>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <CatalogClient />
        </>
    );
}
