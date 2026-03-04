import { SupabaseProductRepository } from '@/infrastructure/repositories/SupabaseProductRepository';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Stock & Catalog - AI Knowledge Base',
    description: 'Private access endpoint for AI assistant.',
    robots: {
        index: false,
        follow: false,
    },
};

export const revalidate = 0; // Prevent caching

export default async function AIKnowledgeBase() {
    const repository = new SupabaseProductRepository();
    const products = await repository.findAll();

    // Create a clean markdown representation of the entire catalog for AI models
    const catalogData = products.map((product) => {
        const sizesStr = Object.keys(product.stockBySize).length > 0
            ? Object.entries(product.stockBySize)
                .map(([size, quantity]) => `Talle ${size} (${quantity} disponibles)`)
                .join(', ')
            : 'No aplica o sin stock específico';

        const imagesStr = product.images.map((img) => `  - ${img}`).join('\n');

        return `### Producto: ${product.name}
- **ID**: \`${product.id}\`
- **Categoría**: ${product.category}
- **Precio Base**: $${product.basePrice}
- **Estado**: ${product.status === 'active' ? 'Activo (En stock/Venta)' : 'Inactivo'}
- **Descripción**: ${product.description || 'Sin descripción'}
- **Stock Total**: ${product.totalStock}
- **Stock por Talle**: ${sizesStr}
- **Imágenes (URLs)**:
${imagesStr}`;
    }).join('\n---\n');

    return (
        <main className="min-h-screen bg-black text-green-400 p-8 font-mono text-sm sm:text-base selection:bg-green-900 selection:text-green-100">
            <div className="max-w-4xl mx-auto space-y-6">
                <header className="border-b border-green-800 pb-4 mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-widest mb-2 text-green-500">
                        [SYS_RDY] Éter Catalog Knowledge Base
                    </h1>
                    <p className="opacity-80">
                        Autorización concedida. Punto de acceso directo al sistema de inventario y catálogo de Éter para Asistente de IA.
                    </p>
                    <p className="mt-2 text-xs opacity-60">
                        Última actualización: {new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}
                    </p>
                </header>

                <section className="bg-black/50 border border-green-900/50 rounded-lg p-6">
                    <pre className="whitespace-pre-wrap overflow-x-auto">
                        {catalogData || 'No se encontraron productos en la base de datos.'}
                    </pre>
                </section>

                <footer className="border-t border-green-800 pt-4 mt-8 text-xs opacity-50 text-center">
                    Terminal de IA activa. Conexión segura establecida.
                </footer>
            </div>
        </main>
    );
}
