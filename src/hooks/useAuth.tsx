'use client';

import { useAuthStore, type AuthProfile } from '@/store/auth-store';
import type { UserRole } from '@/config/roles';

// ─── Backward-compatible types ─────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
}

// ─── Hook ──────────────────────────────────────────────────────────
/**
 * Backward-compatible useAuth hook.
 * Delegates everything to the Zustand auth store.
 * No Context Provider needed — Zustand is global.
 */
export function useAuth() {
  const store = useAuthStore();

  const mapProfileToUser = (profile: AuthProfile | null): AuthUser | null => {
    if (!profile) return null;
    return {
      id: profile.id,
      email: profile.email,
      name: profile.full_name,
      role: profile.role,
      avatar_url: profile.avatar_url,
    };
  };

  return {
    user: mapProfileToUser(store.profile),
    profile: store.profile,
    loading: store.isLoading,
    isAuthenticated: store.isAuthenticated,
    isInitialized: store.isInitialized,
    role: store.role,
    permissions: store.permissions,
    logout: store.signOut,
    signOut: store.signOut,
    hasPermission: store.hasPermission,
    hasRole: store.hasRole,
    canAccessRoute: store.canAccessRoute,
    checkSession: store.checkSession,
  };
}
