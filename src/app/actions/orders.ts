'use server';

import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { validateCoupon } from './coupons';

// Schema for validating cart checkout
const cartItemSchema = z.object({
    productId: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number().min(1),
    size: z.string().optional(),
    image: z.string().optional()
});

const checkoutSchema = z.object({
    items: z.array(cartItemSchema).min(1, 'El carrito está vacío'),
    customerName: z.string().min(2, 'Nombre requerido'),
    customerEmail: z.string().email('Email inválido').optional(),
    customerPhone: z.string().min(6, 'Teléfono requerido'),
    resellerName: z.string().min(2, 'Nombre del revendedor requerido'),
    deliveryAddress: z.string().min(5, 'Dirección requerida'),
    // city: z.string().optional(), // Fixed to Mar del Plata
    // province: z.string().optional(), // Fixed to Buenos Aires
    postalCode: z.string().optional(),
    deliveryDate: z.string().optional(),
    paymentMethod: z.enum(['efectivo', 'transferencia', 'mercado_pago', 'tarjeta']),
    notes: z.string().optional(),
    couponCode: z.string().optional()
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export interface ShippingDetails {
    address: string;
    city?: string;
    province?: string;
    postalCode?: string;
    phone?: string;
    date?: string;
    method?: string;
    notes?: string;
    resellerName?: string;
}

export interface OrderRecord {
    id: string;
    reference_code: string;
    customer_name: string;
    customer_email: string | null;
    status: 'pendiente' | 'procesando' | 'enviado' | 'completado' | 'cancelado';
    total_amount: number;
    items: Array<{
        productId: string;
        name: string;
        price: number;
        quantity: number;
        size?: string;
        image?: string;
    }>;
    shippingDetails?: ShippingDetails;
    created_at: string;
}

/**
 * Creates a new order from catalog cart checkout
 */
export async function createOrderFromCart(input: CheckoutInput) {
    const supabase = createClient();

    // Validate input
    const validated = checkoutSchema.safeParse(input);
    if (!validated.success) {
        return {
            success: false,
            message: 'Error de validación',
            errors: validated.error.flatten().fieldErrors
        };
    }

    const {
        items,
        customerName,
        customerEmail,
        customerPhone,
        deliveryAddress,
        postalCode,
        deliveryDate,
        paymentMethod,
        notes,
        resellerName,
        couponCode
    } = validated.data;

    // Default values for fixed location
    const city = 'Mar del Plata';
    const province = 'Buenos Aires';

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discountAmount = 0;
    let appliedCouponId = null;

    // Server-side Coupon Validation
    if (couponCode) {
        const validation = await validateCoupon(couponCode, subtotal, customerEmail);

        if (validation.success && validation.coupon) {
            const coupon = validation.coupon;
            appliedCouponId = coupon.id;

            if (coupon.discount_type === 'percentage') {
                discountAmount = (subtotal * coupon.discount_value) / 100;
            } else {
                discountAmount = coupon.discount_value;
            }
        }
    }

    const totalAmount = Math.max(0, subtotal - discountAmount);

    // Get authenticated user if available
    const { data: { user } } = await supabase.auth.getUser();

    const orderData = {
        // customer_id: user?.id || null, // Field does not exist in schema
        // reseller_id: user?.id || null, // Field removed from schema
        customer_name: customerName,
        customer_email: customerEmail || null,
        // customer_phone: customerPhone || null, // Field removed from schema
        // customer_dni: customerDNI || null, // Field removed from schema
        // delivery_address: deliveryAddress || null, // Field removed from schema
        // city: city || null, // Field removed from schema
        // province: province || null, // Field removed from schema
        // postal_code: postalCode || null, // Field removed from schema
        // delivery_date: deliveryDate || null, // Field removed from schema
        // payment_method: paymentMethod || null, // Field removed from schema
        total_amount: totalAmount,
        discount_amount: discountAmount,
        applied_coupon_id: appliedCouponId,
        status: 'pendiente',
        // notes: notes || null, // Field removed from schema
        items: {
            products: items.map(item => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                size: item.size,
                image: item.image
            })),
            shipping: {
                address: deliveryAddress,
                city,
                province,
                postalCode,
                phone: customerPhone,
                date: deliveryDate,
                method: paymentMethod,
                notes,
                resellerName
            },
            reseller_id: user?.id || null
        }
    };

    // Use admin client to bypass RLS policies for order creation if key is available
    let supabaseClient;

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        supabaseClient = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );
    } else {
        // Fallback to standard client (user session)
        console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY no encontrada. Usando cliente estándar.');

        // If user is not logged in and no service key, we can't bypass RLS for guest checkout
        if (!user) {
            console.error('❌ Intento de Guest Checkout sin SUPABASE_SERVICE_ROLE_KEY. Fallará por RLS.');
            return {
                success: false,
                message: 'Para realizar el pedido como invitado, el sistema requiere configuración adicional. Por favor, inicia sesión para continuar o contacta al soporte.'
            };
        }

        supabaseClient = createClient();
    }

    try {
        const { data: newOrder, error: insertError } = await supabaseClient
            .from('pedidos')
            .insert(orderData)
            .select('id, created_at')
            .single();

        if (insertError) {
            console.error('Error creating order in Supabase:', insertError);
            return {
                success: false,
                message: `Error al guardar el pedido: ${insertError.message || 'Error de base de datos'}`
            };
        }

        // Increment coupon usage if applied
        if (appliedCouponId) {
            const { error: rpcError } = await supabaseClient.rpc('increment_coupon_usage', { coupon_id: appliedCouponId });
            if (rpcError) {
                console.error('Error incrementing coupon usage:', rpcError);
            }
        }

        // Generate reference code
        const referenceCode = `ETER-${newOrder.id.slice(0, 4).toUpperCase()}-${new Date().getFullYear()}`;

        // Revalidate orders pages
        try {
            revalidatePath('/dashboard');
            revalidatePath('/dashboard?view=orders');
        } catch (e) {
            console.error('Error revalidating paths:', e);
            // Continue execution, this is not fatal
        }

        return {
            success: true,
            message: 'Pedido creado exitosamente',
            orderId: newOrder.id,
            referenceCode
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        console.error('Unexpected error during order creation:', err);
        return {
            success: false,
            message: `Error inesperado: ${err.message || 'Intente nuevamente'}`
        };
    }
}

/**
 * Get all orders for the dashboard (admin view)
 */
export async function getOrders(options?: { limit?: number; status?: string }) {
    const supabase = createClient();

    let query = supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false });

    if (options?.status && options.status !== 'all') {
        query = query.eq('status', options.status);
    }

    if (options?.limit) {
        query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching orders:', error);
        return [];
    }

    return data.map(order => {
        // Handle new items structure (object with products array) vs legacy (direct array)
        const items = Array.isArray(order.items)
            ? order.items
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            : (order.items as any)?.products || [];


        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const shippingDetails = !Array.isArray(order.items) ? (order.items as any)?.shipping : null;

        return {
            id: order.id,
            reference_code: `ETER-${order.id.slice(0, 4).toUpperCase()}-${new Date(order.created_at).getFullYear()}`,
            customer_name: order.customer_name,
            customer_email: order.customer_email,
            // Try to extract phone from items.shipping if not available in column
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            customer_phone: order.customer_phone || (order.items as any)?.shipping?.phone || null,
            status: order.status,
            total_amount: order.total_amount,
            items: items,
            shippingDetails: shippingDetails,
            created_at: order.created_at
        };
    }) as OrderRecord[];
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: string, status: OrderRecord['status']) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: 'No autorizado' };
    }

    // Check if admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        return { success: false, message: 'Solo administradores pueden actualizar pedidos' };
    }

    const { error } = await supabase
        .from('pedidos')
        .update({ status })
        .eq('id', orderId);

    if (error) {
        console.error('Error updating order:', error);
        return { success: false, message: 'Error al actualizar el pedido' };
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard?view=orders');

    return { success: true, message: 'Estado actualizado correctamente' };
}

/**
 * Get single order by ID
 */
export async function getOrderById(orderId: string) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id', orderId)
        .single();

    if (error) {
        return null;
    }

    const items = Array.isArray(data.items)
        ? data.items
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        : (data.items as any)?.products || [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shippingDetails = !Array.isArray(data.items) ? (data.items as any)?.shipping : null;

    return {
        ...data,
        items,
        shippingDetails,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        customer_phone: data.customer_phone || (data.items as any)?.shipping?.phone || null,
        reference_code: `ETER-${data.id.slice(0, 4).toUpperCase()}-${new Date(data.created_at).getFullYear()}`
    } as OrderRecord;
}
