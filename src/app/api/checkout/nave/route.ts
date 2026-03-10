import { NextRequest, NextResponse } from 'next/server';

const NAVE_AUTH_URL = 'https://services.apinaranja.com/security-ms/api/security/auth0/b2b/m2ms';
const NAVE_PAYMENT_URL = 'https://api.navenegocios.ar/api/v1/checkout/payment-intent';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { items, payer, integration_id } = body;

        // Credentials should come from environment variables once the store is "Activa" in Nave
        const client_id = process.env.NAVE_CLIENT_ID;
        const client_secret = process.env.NAVE_CLIENT_SECRET;
        const store_id = process.env.NAVE_STORE_ID;
        const pos_id = process.env.NAVE_POS_ID;

        // If credentials are not set, we return a simulation URL to avoid breaking the UI
        if (!client_id || !client_secret || !store_id || !pos_id) {
            console.warn('[Nave Galicia] Simulation mode: Missing credentials');
            return NextResponse.json({
                success: true,
                init_point: `https://nave.galicia.ar/checkout/simulate?id=${integration_id}&ref=ETER-${Date.now()}`
            });
        }

        // 1. Get Auth Token
        const authResponse = await fetch(NAVE_AUTH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id,
                client_secret,
                audience: 'nave-checkout-prod',
                grant_type: 'client_credentials'
            })
        });

        const authData = await authResponse.json();
        if (!authData.access_token) {
            throw new Error('Could not obtain Nave auth token');
        }

        // 2. Calculate total amount
        const totalAmount = items.reduce((acc: number, item: any) => acc + (item.price || 0) * item.quantity, 0);

        // 3. Create Payment Intent
        const paymentResponse = await fetch(NAVE_PAYMENT_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authData.access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                store_id,
                pos_id,
                external_id: `ETER-${Date.now()}`,
                amount: totalAmount,
                currency: 'ARS',
                description: 'Compra en Eter Store',
                items: items.map((i: any) => ({
                    description: `${i.name || 'Producto'} (${i.size || 'N/A'})`,
                    quantity: i.quantity,
                    amount: i.price || 0
                })),
                notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/nave`,
                success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
                platform: integration_id // P-69AF-88A4-X or R-69AF-8D1F-M
            })
        });

        const paymentData = await paymentResponse.json();

        if (paymentData.checkout_url) {
            return NextResponse.json({
                success: true,
                init_point: paymentData.checkout_url
            });
        } else {
            return NextResponse.json({ success: false, error: paymentData.message || 'Error creating payment intent' });
        }

    } catch (error: any) {
        console.error('[Nave Galicia] Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
