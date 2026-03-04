import { NextRequest, NextResponse } from 'next/server';
import { SupabaseProductRepository } from '@/infrastructure/repositories/SupabaseProductRepository';

/**
 * CheckoutView API: Procesa compras de productos o créditos internos.
 * Diseñado para ser compatible con plataformas como Meta (Facebook Pay).
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const productsParam = searchParams.get('products');
    const creditsParam = searchParams.get('credits') || '50000'; // Cantidad por defecto
    const couponParam = searchParams.get('coupon');

    try {
        const repo = new SupabaseProductRepository();

        // --- LOGICA DE COMPRA DE CRÉDITOS ---
        // Si no hay productos o el parámetro está vacío, asumimos compra de créditos
        if (!productsParam || productsParam.trim() === '') {
            const amount = parseInt(creditsParam);

            // Payload de configuración para Meta Pay (Facebook Pay)
            const metaPayConfig = {
                merchant_id: "ETER_PROTOCOL_PAY",
                currency: "ARS",
                transaction_id: `ETER-CREDIT-${Date.now()}`,
                payment_token: `TOK_ETER_${Math.random().toString(36).substring(7).toUpperCase()}`,
                allowed_methods: ["facebook_pay", "card", "bank_transfer"],
                success_url: "https://eter.store/order-confirmation",
                cancel_url: "https://eter.store/cart"
            };

            // Registro de auditoría simulado (aquí se dispararía en Supabase)
            console.log(`[AUDIT] Iniciando compra de créditos: ${amount} por cliente.`);

            return NextResponse.json({
                success: true,
                transaction_type: "credit_purchase",
                credits_amount: amount,
                credits_image: "https://eter.store/images/eter-coin.png",
                gateway_id: "meta",
                meta_pay_config: metaPayConfig,
                preparation_status: "ready",
                message: "Protocolo de carga de saldo preventivo preparado.",
                timestamp: new Date().toISOString()
            }, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                }
            });
        }

        // --- LOGICA DE COMPRA DE PRODUCTOS (NORMAL) ---
        const productEntries = productsParam.split(',');
        const requestedItems: any[] = [];

        for (const entry of productEntries) {
            const [fullId, qtyStr] = entry.split(':');
            const qty = parseInt(qtyStr) || 1;

            let realId = fullId;
            let size = 'U';

            if (fullId.includes('-')) {
                const parts = fullId.split('-');
                size = parts.pop() || 'U';
                realId = parts.join('-');
            }

            const product = await repo.findById(realId);
            if (product) {
                requestedItems.push({
                    id: product.id,
                    name: product.name,
                    price: product.basePrice,
                    quantity: qty,
                    size: size,
                    image: product.images?.[0]
                });
            }
        }

        if (requestedItems.length === 0) {
            throw new Error('No se encontraron artículos válidos en el catálogo.');
        }

        const total = requestedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        return NextResponse.json({
            success: true,
            transaction_type: "product_purchase",
            items: requestedItems,
            total_amount: total,
            gateway_id: "meta",
            preparation_status: "ready",
            timestamp: new Date().toISOString()
        }, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            }
        });

    } catch (error: any) {
        console.error('[AUDIT] Error en CheckoutView:', error.message);
        return NextResponse.json({
            success: false,
            error: error.message,
            preparation_status: "failed",
            timestamp: new Date().toISOString()
        }, { status: 400 });
    }
}
