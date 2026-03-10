import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { SupabaseProductRepository } from '@/infrastructure/repositories/SupabaseProductRepository';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { items, payer } = body;

        // items should be an array of: { id, size, quantity }
        if (!items || items.length === 0) {
            return NextResponse.json({ success: false, error: 'Cart is empty' }, { status: 400 });
        }

        const repo = new SupabaseProductRepository();
        const preferenceItems = [];

        for (const item of items) {
            const product = await repo.findById(item.id);
            if (product) {
                // Determine unit price, considering sales if any, though basePrice is requested.
                // Assuming basePrice is the final price for now. We can add more logic if needed.
                const price = product.basePrice || 0;
                const quantity = Math.max(1, item.quantity); // Ensures quantity >= 1

                preferenceItems.push({
                    id: `${product.id}-${item.size}`,
                    title: `${product.name} (Talle: ${item.size})`,
                    quantity: quantity,
                    unit_price: price,
                    currency_id: 'ARS',
                    picture_url: product.images?.[0] || '',
                    description: product.description ? product.description.substring(0, 256) : '',
                });
            }
        }

        if (preferenceItems.length === 0) {
            return NextResponse.json({ success: false, error: 'No valid items found' }, { status: 400 });
        }

        if (!process.env.MP_ACCESS_TOKEN) {
            console.error('[Mercado Pago] Missing MP_ACCESS_TOKEN inside .env.local');
            return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
        }

        const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN, options: { timeout: 10000 } });
        const preference = new Preference(client);

        // Ensure baseUrl is absolute and valid. Mercado Pago in 2025+ REQUIRES HTTPS for all back_urls.
        let baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

        // Force HTTPS for non-localhost, and recommended even for localhost if using a tunnel
        if (!baseUrl.startsWith('http')) {
            baseUrl = `https://${baseUrl}`;
        } else if (baseUrl.startsWith('http://') && !baseUrl.includes('localhost')) {
            baseUrl = baseUrl.replace('http://', 'https://');
        }

        const preferenceData = {
            body: {
                items: preferenceItems,
                payer: {
                    name: payer?.firstName || 'Cliente',
                    surname: payer?.lastName || 'Final',
                    email: payer?.email || 'vendedor@eterstore.com.ar', // Real-looking email
                    phone: {
                        area_code: '54',
                        number: (payer?.phone || '1122334455').replace(/\D/g, '')
                    },
                    address: {
                        street_name: payer?.address || 'Calle Falsa 123',
                        zip_code: payer?.postalCode || '1000'
                    }
                },
                back_urls: {
                    success: `${baseUrl}/catalog?payment=success`,
                    pending: `${baseUrl}/catalog?payment=pending`,
                    failure: `${baseUrl}/catalog?payment=failure`
                },
                auto_return: 'approved',
                statement_descriptor: 'ETER STORE',
                external_reference: `ORDER-${Date.now()}`
            }
        };

        console.log('[Mercado Pago] Creating Preference with Body:', JSON.stringify(preferenceData.body, null, 2));
        const result = await preference.create(preferenceData);

        console.log('[Mercado Pago] Preference Created:', result.id);

        return NextResponse.json({
            success: true,
            id: result.id,
            init_point: result.init_point,
            sandbox_init_point: result.sandbox_init_point
        });

    } catch (error: any) {
        console.error('[Mercado Pago] Error creating preference:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
