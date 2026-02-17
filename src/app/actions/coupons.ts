'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface Coupon {
    id: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    applies_to: 'all' | 'category' | 'product' | 'shipping';
    target_id?: string;
    min_purchase_amount: number;
    usage_limit?: number;
    usage_limit_per_user?: number;
    used_count: number;
    valid_from: string;
    valid_until?: string;
    is_active: boolean;
}

/**
 * Valida un cupón y devuelve el descuento aplicable
 */
export async function validateCoupon(code: string, cartTotal: number, userEmail?: string) {
    const supabase = createClient();
    const cleanCode = code.trim().toUpperCase();

    const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', cleanCode)
        .eq('is_active', true)
        .single();

    if (error || !coupon) {
        return { success: false, error: 'Cupón inválido o expirado.' };
    }

    // Validar fecha
    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
        return { success: false, error: 'Este cupón aún no es válido.' };
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
        return { success: false, error: 'Este cupón ha expirado.' };
    }

    // Validar límite de uso total
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        return { success: false, error: 'Este cupón ha agotado sus usos totales.' };
    }

    // Validar límite de uso por usuario
    if (coupon.usage_limit_per_user && userEmail) {
        const { count, error: countError } = await supabase
            .from('pedidos')
            .select('*', { count: 'exact', head: true })
            .eq('applied_coupon_id', coupon.id)
            .eq('customer_email', userEmail);

        if (!countError && count !== null && count >= coupon.usage_limit_per_user) {
            return {
                success: false,
                error: `Has alcanzado el límite de usos para este cupón (${coupon.usage_limit_per_user}).`
            };
        }
    }

    // Validar monto mínimo
    if (cartTotal < coupon.min_purchase_amount) {
        return {
            success: false,
            error: `El monto mínimo para usar este cupón es $${coupon.min_purchase_amount.toLocaleString()}.`
        };
    }

    return {
        success: true,
        coupon: coupon as Coupon
    };
}

/**
 * Obtiene todos los cupones (Admin)
 */
export async function getCoupons() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Coupon[] };
}

/**
 * Crea un nuevo cupón
 */
export async function createCoupon(data: Partial<Coupon>) {
    const supabase = createClient();

    // Check if code already exists
    const { data: existing } = await supabase
        .from('coupons')
        .select('id')
        .eq('code', data.code?.toUpperCase())
        .single();

    if (existing) return { success: false, error: 'El código de cupón ya existe.' };

    const { error } = await supabase
        .from('coupons')
        .insert([{
            ...data,
            code: data.code?.toUpperCase().trim(),
            used_count: 0
        }]);

    if (error) return { success: false, error: error.message };

    revalidatePath('/dashboard/inventory');
    return { success: true };
}

/**
 * Actualiza un cupón existente
 */
export async function updateCoupon(id: string, data: Partial<Coupon>) {
    const supabase = createClient();
    const { error } = await supabase
        .from('coupons')
        .update({
            ...data,
            code: data.code?.toUpperCase().trim(),
            updated_at: new Date().toISOString()
        })
        .eq('id', id);

    if (error) return { success: false, error: error.message };

    revalidatePath('/dashboard/inventory');
    return { success: true };
}

/**
 * Elimina un cupón
 */
export async function deleteCoupon(id: string) {
    const supabase = createClient();
    const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

    if (error) return { success: false, error: error.message };

    revalidatePath('/dashboard/inventory');
    return { success: true };
}
