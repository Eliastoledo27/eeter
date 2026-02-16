'use client';

import { usePermissions } from '@/hooks/usePermissions';
import type { UserRole } from '@/config/roles';

interface RoleGateProps {
    /** Allowed roles. If provided, user must have one of these roles. */
    roles?: UserRole[];
    /** Required permission. If provided, user must have this permission. */
    permission?: string;
    /** Content to show when user has access. */
    children: React.ReactNode;
    /** Fallback content when user lacks access (defaults to null). */
    fallback?: React.ReactNode;
}

/**
 * RoleGate — Conditionally renders children based on role or permission.
 * 
 * Usage:
 * ```tsx
 * <RoleGate roles={['admin', 'support']}>
 *   <AdminPanel />
 * </RoleGate>
 * 
 * <RoleGate permission="manage_products" fallback={<AccessDenied />}>
 *   <ProductEditor />
 * </RoleGate>
 * ```
 */
export function RoleGate({ roles, permission, children, fallback = null }: RoleGateProps) {
    const { role, can } = usePermissions();

    // If roles specified, check role membership
    if (roles && !roles.includes(role)) {
        return <>{fallback}</>;
    }

    // If permission specified, check permission
    if (permission && !can(permission)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
