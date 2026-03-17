import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-01-27.acacia' as const,
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { items, payer } = body;

        // Validar que Stripe esté configurado
        if (!process.env.STRIPE_SECRET_KEY) {
            console.warn('[Stripe] Simulation mode: Missing credentials');
            return NextResponse.json({
                success: true,
                init_point: `/checkout/success?session_id=simulated_${Date.now()}`
            });
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: payer.email,
            line_items: items.map((item: any) => ({
                price_data: {
                    currency: 'ars', // o 'usd' según corresponda
                    product_data: {
                        name: `${item.name} (Talle: ${item.size})`,
                        images: item.images && item.images.length > 0 ? [item.images[0]] : [],
                    },
                    unit_amount: Math.round(item.price * 100), // Stripe espera los montos en centavos
                },
                quantity: item.quantity,
            })),
            mode: 'payment',
            metadata: {
                firstName: payer.firstName,
                lastName: payer.lastName,
                phone: payer.phone,
                address: payer.address,
                city: payer.city,
                postalCode: payer.postalCode,
                province: payer.province,
            },
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cart`,
        });

        return NextResponse.json({
            success: true,
            init_point: session.url
        });

    } catch (error: any) {
        console.error('[Stripe] Error creating checkout session:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
