import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { items, payer } = body;

        // In a real integration, you would call the Nave Galicia API here.
        // Using the user provided code: P-69AF-88A4-X as reference.

        console.log('[Nave Galicia] Processing payment for:', payer.firstName);
        console.log('[Nave Galicia] Ref Code Provided:', 'P-69AF-88A4-X');

        // Simulate a checkout URL generation
        const checkoutUrl = `https://nave.galicia.ar/checkout/simulate?id=P-69AF-88A4-X&ref=ETER-${Date.now()}`;

        return NextResponse.json({
            success: true,
            init_point: checkoutUrl
        });

    } catch (error: any) {
        console.error('[Nave Galicia] Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
