import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Optimized Public API endpoint for Chatfuel.
 * Returns only the exact fields requested, for active products.
 */
export async function GET() {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );

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
            return new NextResponse(JSON.stringify([]), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'no-store, max-age=0, must-revalidate',
                }
            });
        }

        const catalog = products.map((p: any) => {
            // Process sizes
            const stockBySize = p.stock_by_size || {};
            const sizes = Object.keys(stockBySize).filter(size => Number(stockBySize[size]) > 0);

            // Process images
            const images = Array.isArray(p.images) && p.images.length > 0
                ? p.images
                : (p.image ? [p.image] : []);

            // Ensure description exists
            let description = p.description;
            if (!description || description.trim() === '') {
                description = p.category ? `${p.name} - ${p.category}` : `${p.name} - Sneakers premium importadas`;
            }

            return {
                name: String(p.name || ''),
                price: Number(p.price) || 0,
                description: String(description),
                images: images,
                sizes: sizes
            };
        });

        return new NextResponse(JSON.stringify(catalog), {
            status: 200,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-store, max-age=0, must-revalidate',
            }
        });

    } catch (error: any) {
        console.error('API Catalog Error:', error);
        return new NextResponse(JSON.stringify([]), {
            status: 500,
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        });
    }
}
