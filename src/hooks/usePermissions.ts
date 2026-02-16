'use client';

import { useAuthStore } from '@/store/auth-store';
import { hasPermission, canAccessRoute, type UserRole } from '@/config/roles';

/**
 * Client-side hook for checking permissions and role-based access.
 * Uses the Zustand auth store to get the current user's role.
 */
export function usePermissions() {
    const { role, isAuthenticated, isInitialized } = useAuthStore();

    return {
        /** Current user role */
        role,

        /** Whether user is authenticated */
        isAuthenticated,

        /** Whether auth state has been initialized */
        isInitialized,

        /** Check if current user has a specific permission */
        can: (permission: string) => hasPermission(role, permission),

        /** Check if current user can access a specific route */
        canAccessRoute: (path: string) => canAccessRoute(role, path),

        /** Role shorthand checks */
        isAdmin: role === 'admin',
        isSupport: role === 'support',
        isReseller: role === 'reseller',
        isUser: role === 'user',

        /** Check if current user has any of the given roles */
        hasRole: (...roles: UserRole[]) => roles.includes(role),

        /** Check if current user is admin or support (staff) */
        isStaff: role === 'admin' || role === 'support',
    };
}
