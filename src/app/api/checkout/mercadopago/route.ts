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

        const accessToken = (process.env.MP_ACCESS_TOKEN || '').replace(/['"]/g, '').trim();
        if (!accessToken) {
            console.error('[Mercado Pago] Missing MP_ACCESS_TOKEN inside .env.local');
            return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
        }

        const client = new MercadoPagoConfig({ accessToken, options: { timeout: 10000 } });
        const preference = new Preference(client);

        // Sanitize baseUrl (remove quotes if present in .env)
        let baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://xn--ter-9la.store').replace(/['"]/g, '').trim();
        if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

        // Ensure we use the production domain if we are not in localhost
        if (baseUrl.includes('localhost') && process.env.NODE_ENV === 'production') {
            baseUrl = 'https://xn--ter-9la.store';
        }

        // Force HTTPS for non-localhost
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
                    surname: payer?.lastName || '',
                    email: payer?.email || 'vendedor@eterstore.com.ar',
                    phone: {
                        area_code: '54',
                        number: (payer?.phone || '').replace(/\D/g, '')
                    },
                    address: {
                        street_name: payer?.address || '',
                        zip_code: payer?.postalCode || ''
                    }
                },
                back_urls: {
                    success: `${baseUrl}/catalog?payment=success`,
                    failure: `${baseUrl}/catalog?payment=failure`,
                    pending: `${baseUrl}/catalog?payment=pending`
                },
                auto_return: baseUrl.startsWith('https') ? 'approved' : undefined,
                notification_url: baseUrl.startsWith('https') ? `${baseUrl}/api/webhooks/mercadopago` : undefined,
                statement_descriptor: 'ETER STORE',
                external_reference: `ORDER-${Date.now()}`
            }
        };

        const result = await preference.create(preferenceData);

        return NextResponse.json({
            success: true,
            id: result.id,
            init_point: accessToken.startsWith('APP_USR') ? result.init_point : (result.sandbox_init_point || result.init_point)
        });

    } catch (error: any) {
        console.error('[Mercado Pago PROD] Error:', error);
        return NextResponse.json({ success: false, error: 'Hubo un problema al procesar el pago. Por favor intente nuevamente.' }, { status: 500 });
    }
}
