'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const purchaseSchema = z.object({
    reseller_id: z.string().uuid('Revendedor inválido'),
    product_id: z.string().uuid('Producto inválido'),
    quantity: z.coerce.number().min(1, 'Mínimo 1 unidad'),
    price: z.coerce.number().min(0, 'Precio inválido'),
    size: z.string().optional(),
});

export interface PurchaseRecord {
    id: string;
    reference_code: string;
    reseller_name: string;
    product_name: string;
    quantity: number;
    price: number;
    total: number;
    created_at: string;
}

export async function getPurchases() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const role = user.app_metadata?.role || 'user';
    let query = supabase
        .from('pedidos')
        .select(`
      id,
      created_at,
      total_amount,
      customer_name,
      items
    `)
        .order('created_at', { ascending: false });

    // Non-admins see only their own orders
    if (role !== 'admin' && role !== 'support') {
        query = query.eq('customer_id', user.id);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching purchases:', error);
        return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((order: any) => {
        const items = Array.isArray(order.items)
            ? order.items
            : (order.items)?.products || [];

        // Handle case where items might be empty or malformed
        const firstItem = items[0] || {};

        return {
            id: order.id,
            reference_code: `ETER-${order.id.slice(0, 4)}-${new Date(order.created_at).getFullYear()}`.toUpperCase(),
            reseller_name: order.customer_name,
            product_name: firstItem.name || 'Producto',
            quantity: firstItem.quantity || 1,
            price: firstItem.price || 0,
            total: order.total_amount,
            created_at: order.created_at
        };
    });
}

export async function registerPurchase(formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: 'No autorizado' };
    }

    // Verify if it's an admin (this can be checked in RLS but let's be explicit)
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        return { success: false, message: 'Sólo administradores pueden registrar compras manuales' };
    }

    const rawData = {
        reseller_id: formData.get('reseller_id'),
        product_id: formData.get('product_id'),
        quantity: formData.get('quantity'),
        price: formData.get('price'),
        size: formData.get('size'),
    };

    const validated = purchaseSchema.safeParse(rawData);

    if (!validated.success) {
        return {
            success: false,
            message: 'Error de validación',
            errors: validated.error.flatten().fieldErrors
        };
    }

    const { reseller_id, product_id, quantity, price, size } = validated.data;

    // Get reseller details
    const { data: resellerProfile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', reseller_id)
        .single();

    // Get product details
    const { data: product } = await supabase
        .from('productos')
        .select('name, images')
        .eq('id', product_id)
        .single();

    const total = quantity * price;

    const { data: newOrder, error } = await supabase
        .from('pedidos')
        .insert({
            customer_id: reseller_id,
            customer_name: resellerProfile?.full_name || 'Revendedor',
            customer_email: resellerProfile?.email,
            total_amount: total,
            status: 'completado',
            items: [{
                productId: product_id,
                name: product?.name,
                quantity,
                price,
                size,
                image: product?.images?.[0]
            }]
        })
        .select('id')
        .single();

    if (error) {
        console.error('Error registering purchase:', error);
        return { success: false, message: 'Error al registrar la compra en la base de datos' };
    }

    revalidatePath('/dashboard/purchases');

    return {
        success: true,
        message: 'Compra registrada con éxito',
        orderId: newOrder.id,
        referenceCode: `ETER-${newOrder.id.slice(0, 4)}-${new Date().getFullYear()}`.toUpperCase()
    };
}

export async function getResellers() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const role = user.app_metadata?.role || 'user';

    // Only admins/support can see reseller list
    if (role !== 'admin' && role !== 'support') {
        return [];
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'reseller')
        .order('full_name');

    if (error) return [];
    return data;
}

export async function getProductsForPurchase() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('productos')
        .select('id, name, base_price, images')
        .eq('status', 'active')
        .order('name');

    if (error) return [];
    return data;
}
