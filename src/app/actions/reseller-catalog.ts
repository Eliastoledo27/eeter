'use server';

import { createClient } from '@/utils/supabase/server';
import { getProducts } from './products';

/**
 * Get reseller data by their unique slug
 */
export async function getResellerBySlug(slug: string) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('reseller_slug', slug)
        .single();

    if (error || !data) {
        return { data: null, error: 'Reseller no encontrado' };
    }

    return { data, error: null };
}

/**
 * Get products with prices adjusted for a specific reseller
 */
export async function getResellerProducts(resellerId: string, defaultMarkup: number = 10000) {
    const supabase = createClient();

    // 1. Get all base products
    const products = await getProducts();

    // 2. Get price overrides for this reseller
    const { data: overrides } = await supabase
        .from('reseller_product_prices')
        .select('product_id, custom_price')
        .eq('reseller_id', resellerId);

    const overridesMap = new Map(overrides?.map(o => [o.product_id, o.custom_price]) || []);

    // 3. Map products to adjusted prices
    const adjustedProducts = products.map(product => {
        const basePrice = product.base_price;
        const overridePrice = overridesMap.get(product.id);

        /**
         * Final price logic:
         * 1. If the reseller has a manual override for THIS specific product -> use it.
         * 2. Otherwise -> use the base_price + the reseller's global markup.
         * 3. In any case, it can NEVER be less than the base price.
         */
        let finalPrice: number;

        if (overridePrice && overridePrice > 0) {
            // Manual override takes precedence
            finalPrice = overridePrice;
        } else {
            // Use global markup
            finalPrice = basePrice + defaultMarkup;
        }

        // Safety check: Never below base cost
        if (finalPrice < basePrice) {
            finalPrice = basePrice;
        }

        return {
            ...product,
            resellerPrice: finalPrice,
            displayPrice: finalPrice,
            hasOverride: !!overridePrice && overridePrice > 0,
            overridePrice: overridePrice || 0
        };
    });

    return adjustedProducts;
}

/**
 * Update reseller's global markup
 */
export async function updateResellerMarkup(markup: number) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'No autorizado' };

    // Markup cannot be negative
    if (markup < 0) return { success: false, error: 'El margen no puede ser negativo' };

    const { error } = await supabase
        .from('profiles')
        .update({ reseller_markup: markup })
        .eq('id', user.id);

    if (error) return { success: false, error: error.message };

    return { success: true };
}

/**
 * Update or set a specific price for a product
 */
export async function updateProductOverride(productId: string, customPrice: number) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'No autorizado' };

    // Get base product price to ensure customPrice >= basePrice
    const { data: product } = await supabase
        .from('productos')
        .select('price')
        .eq('id', productId)
        .single();

    if (!product) return { success: false, error: 'Producto no encontrado' };

    if (customPrice < product.price) {
        return { success: false, error: `El precio no puede ser menor al precio base ($${product.price.toLocaleString()})` };
    }

    const { error } = await supabase
        .from('reseller_product_prices')
        .upsert({
            reseller_id: user.id,
            product_id: productId,
            custom_price: customPrice,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'reseller_id,product_id'
        });

    if (error) return { success: false, error: error.message };

    return { success: true };
}
