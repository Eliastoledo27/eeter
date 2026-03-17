import { NextResponse } from 'next/server';
import { SupabaseProductRepository } from '@/infrastructure/repositories/SupabaseProductRepository';

export const revalidate = 0; // Fresh data on every request

/**
 * Public API endpoint for Chatfuel and other bots.
 * Returns the complete product catalog in a strict JSON format.
 */
export async function GET() {
    try {
        const repository = new SupabaseProductRepository();
        const products = await repository.findAll();

        // Map to the exact format requested by the user
        const catalog = products.map((product) => {
            const sizes = Object.keys(product.stockBySize || {}).filter(size => {
                // Only include sizes that have stock > 0
                return Number(product.stockBySize[size]) > 0;
            });

            return {
                id: product.id,
                sku: product.id.split('-')[0].toUpperCase(), // Simple SKU generator if not present
                brand: "ÉTER PROTOCOL", // Default brand
                name: product.name,
                price: Number(product.basePrice) || 0,
                currency: "ARS",
                description: product.description || "",
                category: product.category || "",
                images: Array.isArray(product.images) ? product.images : [],
                sizes: sizes,
                stock: Number(product.totalStock) || 0,
                available: product.status === 'active' && (Number(product.totalStock) || 0) > 0,
                createdAt: product.createdAt.toISOString()
            };
        });

        return new NextResponse(JSON.stringify(catalog, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*', // Public access
                'Cache-Control': 'no-store, max-age=0, must-revalidate',
                'Pragma': 'no-cache'
            }
        });

    } catch (error: any) {
        console.error('API Catalog Error:', error);
        return NextResponse.json({
            error: 'Failed to fetch catalog',
            message: error.message
        }, { status: 500 });
    }
}
