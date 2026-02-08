/**
 * Middleware Auth Helper
 * 
 * Funciones centralizadas para validación de permisos y roles de usuario.
 * Utiliza cache en memoria para optimizar consultas repetitivas.
 */

import { createClient } from './server';
import type { SupabaseClient, User } from '@supabase/supabase-js';

// Cache simple en memoria para roles (se limpia cada 5 minutos)
const roleCache = new Map<string, { role: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Limpia entradas expiradas del cache
 */
function cleanExpiredCache() {
    const now = Date.now();
    for (const [key, value] of roleCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
            roleCache.delete(key);
        }
    }
}

/**
 * Obtiene el rol del usuario con cache
 */
async function getUserRole(userId: string, supabase: SupabaseClient): Promise<string | null> {
    // Limpiar cache expirado
    cleanExpiredCache();

    // Verificar cache
    const cached = roleCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.role;
    }

    // Consultar base de datos (primero user_roles, luego profiles como fallback)
    const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

    if (roleData?.role) {
        roleCache.set(userId, { role: roleData.role, timestamp: Date.now() });
        return roleData.role;
    }

    // Fallback: consultar profiles si user_roles no tiene el dato
    const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

    if (profileData?.role) {
        const role = profileData.role;
        roleCache.set(userId, { role, timestamp: Date.now() });
        return role;
    }

    return null;
}

/**
 * Invalida el cache para un usuario específico
 */
export function invalidateUserRoleCache(userId: string) {
    roleCache.delete(userId);
}

/**
 * Verifica los permisos del usuario actual
 */
export async function checkUserPermissions(): Promise<{
    user: User | null;
    role: string | null;
    isAdmin: boolean;
    isSupport: boolean;
    isReseller: boolean;
    canManageProfiles: boolean;
    error: string | null;
}> {
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return {
            user: null,
            role: null,
            isAdmin: false,
            isSupport: false,
            isReseller: false,
            canManageProfiles: false,
            error: 'No autorizado'
        };
    }

    const role = await getUserRole(user.id, supabase);

    return {
        user,
        role,
        isAdmin: role === 'admin',
        isSupport: role === 'support',
        isReseller: role === 'reseller',
        canManageProfiles: role === 'admin' || role === 'support',
        error: null
    };
}

/**
 * Verifica si el usuario actual es admin
 */
export async function isAdmin(): Promise<boolean> {
    const { isAdmin } = await checkUserPermissions();
    return isAdmin;
}

/**
 * Verifica si el usuario actual es admin o support
 */
export async function canManageProfiles(): Promise<boolean> {
    const { canManageProfiles } = await checkUserPermissions();
    return canManageProfiles;
}

/**
 * Verifica si el usuario actual es reseller
 */
export async function isReseller(): Promise<boolean> {
    const { isReseller } = await checkUserPermissions();
    return isReseller;
}

/**
 * Obtiene el usuario actual con su rol
 */
export async function getCurrentUser(): Promise<{
    user: User | null;
    role: string | null;
    error: string | null;
}> {
    const { user, role, error } = await checkUserPermissions();
    return { user, role, error };
}

/**
 * Middleware guard para verificar que el usuario está autenticado
 * Lanza error si no está autenticado
 */
export async function requireAuth(): Promise<{ user: User; role: string | null }> {
    const { user, role, error } = await checkUserPermissions();

    if (error || !user) {
        throw new Error('No autorizado');
    }

    return { user, role };
}

/**
 * Middleware guard para verificar que el usuario es admin
 * Lanza error si no tiene permisos
 */
export async function requireAdmin(): Promise<{ user: User; role: string }> {
    const { user, isAdmin, error } = await checkUserPermissions();

    if (error || !user || !isAdmin) {
        throw new Error('Permisos insuficientes - Se requiere rol de administrador');
    }

    return { user, role: 'admin' };
}

/**
 * Middleware guard para verificar que el usuario puede gestionar perfiles
 * Lanza error si no tiene permisos
 */
export async function requireCanManageProfiles(): Promise<{ user: User; role: string }> {
    const { user, role, canManageProfiles, error } = await checkUserPermissions();

    if (error || !user || !canManageProfiles) {
        throw new Error('Permisos insuficientes - Se requiere rol de administrador o soporte');
    }

    return { user, role: role! };
}

/**
 * Crea un cliente de Supabase con validación de variables de entorno
 */
export function createValidatedClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.error('❌ Supabase environment variables not configured');
        throw new Error('Configuración de Supabase faltante');
    }

    return createClient();
}
