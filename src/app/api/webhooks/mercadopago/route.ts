import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    // Mercado Pago sends different notification types
    if (type === 'payment') {
      const paymentId = data?.id;
      if (!paymentId) {
        return NextResponse.json({ received: true }, { status: 200 });
      }

      // Fetch payment details from MP API
      const accessToken = (process.env.MP_ACCESS_TOKEN || '').replace(/['"]/g, '').trim();
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (!mpResponse.ok) {
        console.error('[Webhook MP] Failed to fetch payment:', mpResponse.status);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      const payment = await mpResponse.json();
      const externalReference = payment.external_reference; // e.g. "ORDER-1713499200000"
      const paymentStatus = payment.status; // approved, pending, rejected, etc.

      // Map MP status to our order status
      let orderStatus = 'pendiente';
      if (paymentStatus === 'approved') orderStatus = 'procesando';
      else if (paymentStatus === 'rejected') orderStatus = 'cancelado';

      // Update order in Supabase if we have a service key
      if (supabaseUrl && supabaseServiceKey && externalReference) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Find and update the order by reference code
        const { error } = await supabase
          .from('orders')
          .update({
            status: orderStatus,
            payment_id: String(paymentId),
            payment_status: paymentStatus,
            updated_at: new Date().toISOString()
          })
          .eq('reference_code', externalReference);

        if (error) {
          console.error('[Webhook MP] Failed to update order:', error);
        }
      }
    }

    // Always return 200 so MP doesn't retry
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[Webhook MP] Error processing webhook:', error);
    // Return 200 anyway to prevent retries
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
