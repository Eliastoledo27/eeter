'use server';

import { createClient } from '@/utils/supabase/server';
import { requireAuth, requireCanManageProfiles, invalidateUserRoleCache } from '@/utils/supabase/middleware-auth';
import { revalidatePath } from 'next/cache';
import type { Profile, ProfileUpdateData, AdminProfileUpdateData, ResellerStats, UserRole } from '@/types/profiles';

/**
 * Get profile for a specific user
 */
export async function getProfile(userId?: string): Promise<{ data: Profile | null; error: string | null }> {
    try {
        const { user } = await requireAuth();

        const supabase = createClient();
        const targetUserId = userId || user.id;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', targetUserId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return { data: null, error: `Error al obtener perfil: ${error.message}` };
        }

        return { data: data as Profile, error: null };
    } catch (err) {
        console.error('Error in getProfile:', err);
        return { data: null, error: err instanceof Error ? err.message : 'No autorizado' };
    }
}

/**
 * Get all profiles (admin only)
 */
export async function getAllProfiles(): Promise<{ data: Profile[] | null; error: string | null }> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { data: null, error: 'No autorizado' };
    }

    // Check if user is admin
    const { data: userProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!userProfile || !['admin', 'support'].includes(userProfile.role)) {
        return { data: null, error: 'Permisos insuficientes' };
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('*');

    if (error) {
        console.error('Error fetching all profiles:', error);
        return { data: null, error: `Error al obtener perfiles: ${error.message}` };
    }

    return { data: data as Profile[], error: null };
}

/**
 * Update user's own profile
 */
export async function updateProfile(
    updateData: ProfileUpdateData
): Promise<{ success: boolean; error: string | null }> {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { success: false, error: 'No autorizado' };
    }

    const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

    if (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: 'Error al actualizar perfil' };
    }

    revalidatePath('/dashboard/profile');
    revalidatePath('/dashboard/settings');

    return { success: true, error: null };
}

/**
 * Update any user's profile (admin only)
 */
export async function adminUpdateProfile(
    userId: string,
    updateData: AdminProfileUpdateData
): Promise<{ success: boolean; error: string | null }> {
    try {
        // Validar permisos con middleware
        await requireCanManageProfiles();

        const supabase = createClient();

        const { error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', userId);

        if (error) {
            console.error('Error updating profile (admin):', error);
            return { success: false, error: `Error al actualizar perfil: ${error.message}` };
        }

        // Si se actualizó el rol, invalidar cache
        if (updateData.role) {
            invalidateUserRoleCache(userId);
        }

        revalidatePath('/dashboard/profiles');
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/users');

        return { success: true, error: null };
    } catch (err) {
        console.error('Error in adminUpdateProfile:', err);
        return { success: false, error: err instanceof Error ? err.message : 'Permisos insuficientes' };
    }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(
    userId: string,
    role: UserRole
): Promise<{ success: boolean; error: string | null }> {
    return adminUpdateProfile(userId, { role });
}

/**
 * Get reseller statistics
 */
export async function getResellerStats(userId?: string): Promise<{ data: ResellerStats | null; error: string | null }> {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { data: null, error: 'No autorizado' };
    }

    const targetUserId = userId || user.id;

    // Get all orders for this reseller
    const { data: orders, error } = await supabase
        .from('reseller_orders')
        .select('*')
        .eq('reseller_id', targetUserId);

    if (error) {
        console.error('Error fetching reseller stats:', error);
        return { data: null, error: 'Error al obtener estadísticas' };
    }

    if (!orders || orders.length === 0) {
        return {
            data: {
                total_orders: 0,
                total_revenue: 0,
                total_profit: 0,
                active_customers: 0,
                conversion_rate: 0,
            },
            error: null,
        };
    }

    const total_orders = orders.length;
    const completed_orders = orders.filter(o => o.status === 'completed');
    const total_revenue = completed_orders.reduce((sum, o) => sum + (o.sale_price || 0), 0);
    const total_profit = completed_orders.reduce((sum, o) => sum + (o.profit || 0), 0);

    // Count unique customers
    const unique_customers = new Set(orders.map(o => o.customer_phone).filter(Boolean));
    const active_customers = unique_customers.size;

    const conversion_rate = total_orders > 0 ? (completed_orders.length / total_orders) * 100 : 0;

    return {
        data: {
            total_orders,
            total_revenue,
            total_profit,
            active_customers,
            conversion_rate: Number(conversion_rate.toFixed(2)),
        },
        error: null,
    };
}

/**
 * Get profiles by role
 */
export async function getProfilesByRole(role: UserRole): Promise<{ data: Profile[] | null; error: string | null }> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', role)
        .order('full_name', { ascending: true });

    if (error) {
        console.error('Error fetching profiles by role:', error);
        return { data: null, error: 'Error al obtener perfiles' };
    }

    return { data: data as Profile[], error: null };
}
