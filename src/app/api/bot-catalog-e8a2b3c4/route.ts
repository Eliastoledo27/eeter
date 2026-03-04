import { NextResponse } from 'next/server';
import { SupabaseProductRepository } from '@/infrastructure/repositories/SupabaseProductRepository';

export const revalidate = 0;

/**
 * Endpoint optimizado para Bots de WhatsApp (WhaSapi, Manychat, etc.)
 * Retorna un JSON con la estructura exacta que necesitan para mapear
 * nombres de productos a URLs de imágenes.
 */
export async function GET() {
    try {
        const repo = new SupabaseProductRepository();
        let products = await repo.findAll();

        // Filtramos solo activos y mapeamos a lo esencial para el bot
        const botData = products
            .filter(p => p.status === 'active')
            .map(p => ({
                id: p.id,
                name: p.name,
                category: p.category,
                price: p.basePrice,
                // WhaSapi necesita una URL directa
                main_image: p.images?.[0] || 'https://eter.store/placeholder.png',
                all_images: p.images || [],
                description: p.description?.substring(0, 150) + '...',
                stock: p.totalStock,
                url: `https://eter.store/c/${p.category.toLowerCase().replace(/\s+/g, '-')}/${p.id}`
            }));

        return NextResponse.json({
            success: true,
            total: botData.length,
            last_update: new Date().toISOString(),
            products: botData
        }, {
            headers: {
                'Access-Control-Allow-Origin': '*', // Permitir que el bot lo llame desde cualquier server
                'Content-Type': 'application/json'
            }
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
