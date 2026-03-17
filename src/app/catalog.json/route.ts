import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Public API endpoint for Chatfuel and other bots.
 * Returns the complete product catalog in a strict JSON format.
 */
export async function GET() {
    try {
        // Direct Supabase client to ensure no browser-specific logic interferes
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );

        // Fetch all active products directly from the table
        const { data: products, error } = await supabase
            .from('productos')
            .select('*')
            .eq('status', 'activo')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase Error:', error);
            throw new Error(error.message);
        }

        if (!products || products.length === 0) {
            return Response.json({
                success: false,
                message: "No active products found in the database.",
                count: 0
            }, { status: 200 });
        }

        // Map to exact format requested
        const catalog = products.map((p: any) => {
            // Process sizes from stock_by_size jsonb
            const stockBySize = p.stock_by_size || {};
            const sizes = Object.keys(stockBySize).filter(size => Number(stockBySize[size]) > 0);

            return {
                id: p.id,
                sku: p.id.split('-')[0].toUpperCase(),
                brand: "ÉTER PROTOCOL",
                name: p.name,
                price: Number(p.price) || 0,
                currency: "ARS",
                description: p.description || "",
                category: p.category || "",
                images: Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []),
                sizes: sizes,
                stock: Number(p.stock) || 0,
                available: p.status === 'activo' && Number(p.stock) > 0,
                createdAt: p.created_at
            };
        });

        // Use Response.json() which is more robust for Next.js App Router
        return Response.json(catalog, {
            status: 200,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-store, max-age=0, must-revalidate',
            }
        });

    } catch (error: any) {
        console.error('API Catalog Error:', error);
        return Response.json({
            success: false,
            error: 'Failed to fetch catalog',
            message: error.message
        }, { status: 500 });
    }
}
