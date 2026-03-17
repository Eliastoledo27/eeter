import { createClient } from '@supabase/supabase-js';

export async function getChatfuelCatalog(page?: number, limit: number = 30) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    let query = supabase
        .from('productos')
        .select('*')
        .eq('status', 'activo')
        .order('created_at', { ascending: false });

    // Apply pagination only if page is provided
    if (page !== undefined) {
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);
    }

    const { data: products, error } = await query;

    if (error) {
        console.error('Supabase Error:', error);
        throw new Error(error.message);
    }

    if (!products || products.length === 0) {
        return [];
    }

    return products.map((p: any) => {
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

        // Generate a unique SKU from the ID (first segment)
        const sku = p.id ? p.id.split('-')[0].toUpperCase() : `SKU-${Math.floor(Math.random() * 100000)}`;

        return {
            sku: sku,
            name: String(p.name || ''),
            price: Number(p.price) || 0,
            description: String(description),
            images: images,
            sizes: sizes
        };
    });
}
