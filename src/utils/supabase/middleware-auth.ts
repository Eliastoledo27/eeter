import { createClient } from '@/utils/supabase/server'
import type { User } from '@supabase/supabase-js'
import { hasPermission, type UserRole } from '@/config/roles'

// ─── Role Cache ────────────────────────────────────────────────────
// Caches role lookups per request to avoid repeated DB queries
const roleCache = new Map<string, { role: string; timestamp: number }>()
const ROLE_CACHE_TTL = 60_000 // 60 seconds

function getCachedRole(userId: string): string | null {
    const entry = roleCache.get(userId)
    if (entry && Date.now() - entry.timestamp < ROLE_CACHE_TTL) {
        return entry.role
    }
    roleCache.delete(userId)
    return null
}

function setCachedRole(userId: string, role: string): void {
    roleCache.set(userId, { role, timestamp: Date.now() })
}

/**
 * Invalidate the cached role for a user (e.g., after admin changes their role).
 */
export function invalidateUserRoleCache(userId: string): void {
    roleCache.delete(userId)
}

// ─── Permission Check Result ──────────────────────────────────────
export interface PermissionCheckResult {
    user: User | null
    role: UserRole
    isAdmin: boolean
    isStaff: boolean
    canManageProfiles: boolean
    error: string | null
}

// ─── Core Permission Check ────────────────────────────────────────
/**
 * Core function to check user authentication and resolve role.
 * Uses JWT app_metadata first, falls back to DB query with cache.
 */
export async function checkUserPermissions(): Promise<PermissionCheckResult> {
    const defaultResult: PermissionCheckResult = {
        user: null,
        role: 'user',
        isAdmin: false,
        isStaff: false,
        canManageProfiles: false,
        error: null,
    }

    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return { ...defaultResult, error: authError?.message || 'No autenticado' }
        }

        // Priority 1: JWT app_metadata (set by sync_role_to_jwt trigger)
        let role: UserRole = 'user'
        const jwtRole = user.app_metadata?.role as string | undefined

        if (jwtRole && ['admin', 'support', 'reseller', 'user'].includes(jwtRole)) {
            role = jwtRole as UserRole
        } else {
            // Priority 2: Check cache
            const cached = getCachedRole(user.id)
            if (cached) {
                role = cached as UserRole
            } else {
                // Priority 3: Fallback to DB query
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                if (!profileError && profile?.role) {
                    role = profile.role as UserRole
                    setCachedRole(user.id, role)
                }
            }
        }

        // Priority 4: Hardcoded admin email override (DISABLED)
        /* 
        if (user.email?.toLowerCase() === 'feitopepe510@gmail.com') {
            role = 'admin'
        }
        */

        const isAdmin = role === 'admin'
        const isStaff = role === 'admin' || role === 'support'

        return {
            user,
            role,
            isAdmin,
            isStaff,
            canManageProfiles: isStaff,
            error: null,
        }
    } catch (err) {
        console.error('Permission check error:', err)
        return { ...defaultResult, error: 'Error al verificar permisos' }
    }
}

// ─── Guard Functions ──────────────────────────────────────────────

/**
 * Require authentication. Throws if not authenticated.
 */
export async function requireAuth(): Promise<{ user: User; role: UserRole }> {
    const { user, role, error } = await checkUserPermissions()

    if (error || !user) {
        throw new Error('No autorizado')
    }

    return { user, role }
}

/**
 * Require admin role. Throws if not admin.
 */
export async function requireAdmin(): Promise<{ user: User; role: 'admin' }> {
    const { user, isAdmin, error } = await checkUserPermissions()

    if (error || !user || !isAdmin) {
        throw new Error('Permisos insuficientes - Se requiere rol de administrador')
    }

    return { user, role: 'admin' }
}

/**
 * Require a specific role. Throws if user doesn't have one of the allowed roles.
 */
export async function requireRole(...allowedRoles: UserRole[]): Promise<{ user: User; role: UserRole }> {
    const { user, role, error } = await checkUserPermissions()

    if (error || !user) {
        throw new Error('No autorizado')
    }

    if (!allowedRoles.includes(role)) {
        throw new Error(`Permisos insuficientes - Se requiere rol: ${allowedRoles.join(', ')}`)
    }

    return { user, role }
}

/**
 * Require a specific permission. Throws if user doesn't have the permission.
 */
export async function requirePermission(permission: string): Promise<{ user: User; role: UserRole }> {
    const { user, role, error } = await checkUserPermissions()

    if (error || !user) {
        throw new Error('No autorizado')
    }

    if (!hasPermission(role, permission)) {
        throw new Error(`Permisos insuficientes - Se requiere permiso: ${permission}`)
    }

    return { user, role }
}

/**
 * Require profile management capability. Throws if user can't manage profiles.
 */
export async function requireCanManageProfiles(): Promise<{ user: User; role: UserRole }> {
    const { user, role, canManageProfiles, error } = await checkUserPermissions()

    if (error || !user || !canManageProfiles) {
        throw new Error('Permisos insuficientes - Se requiere rol de administrador o soporte')
    }

    return { user, role }
}

/**
 * Creates a validated Supabase client (validates env vars).
 */
export async function createValidatedClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
        console.error('❌ Supabase environment variables not configured')
        throw new Error('Configuración de Supabase faltante')
    }

    return createClient()
}
