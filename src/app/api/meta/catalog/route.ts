import { NextResponse } from 'next/server';
import { SupabaseProductRepository } from '@/infrastructure/repositories/SupabaseProductRepository';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
    try {
        const repo = new SupabaseProductRepository();
        const products = await repo.findAll();
        const activeProducts = products.filter(p => p.status === 'active');

        // Create Google Merchant / Meta Shop XML
        let xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
<title>Éter Store - Product Feed</title>
<link>https://eter.store</link>
<description>Catálogo de alta gama de Éter Store para Meta Shops</description>`;

        activeProducts.forEach(product => {
            const sizes = Object.keys(product.stockBySize);

            sizes.forEach(size => {
                const stock = product.stockBySize[size];
                if (stock <= 0) return;

                // Unique ID per variant
                const variantId = `${product.id}_${size}`;
                const checkoutUrl = `https://xn--ter-9la.store/checkout?products=${variantId}:1&cart_origin=meta_shops`;

                xml += `
<item>
    <g:id>${variantId}</g:id>
    <g:title>${product.name} (Talle ${size})</g:title>
    <g:description>${product.description || 'Calzado premium de Éter Store'}</g:description>
    <g:link>${checkoutUrl}</g:link>
    <g:image_link>${product.images[0] || ''}</g:image_link>
    <g:brand>ÉTER PROTOCOL</g:brand>
    <g:condition>new</g:condition>
    <g:availability>${stock > 0 ? 'in stock' : 'out of stock'}</g:availability>
    <g:price>${product.basePrice} ARS</g:price>
    <g:google_product_category>Apparel &amp; Accessories &gt; Shoes</g:google_product_category>
    <g:item_group_id>${product.id}</g:item_group_id>
    <g:size>${size}</g:size>
    <g:shipping_label>classic</g:shipping_label>
</item>`;
            });
        });

        xml += `
</channel>
</rss>`;

        return new Response(xml, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600'
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
