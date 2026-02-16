import { create } from 'zustand'
import { createClient } from '@/utils/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import { ROLE_PERMISSIONS, hasPermission as checkPermission, canAccessRoute as checkRoute, type UserRole } from '@/config/roles'

// ─── Types ─────────────────────────────────────────────────────────
export interface AuthProfile {
  id: string
  full_name: string
  email: string
  role: UserRole
  is_premium: boolean
  points: number
  streak_days: number
  avatar_url?: string
}

interface AuthState {
  // State
  user: User | null
  session: Session | null
  profile: AuthProfile | null
  role: UserRole
  permissions: string[]
  isLoading: boolean
  isInitialized: boolean
  isAuthenticated: boolean

  // Actions
  initialize: () => Promise<() => void>
  checkSession: () => Promise<void>
  signOut: () => Promise<void>

  // Permission helpers
  hasPermission: (permission: string) => boolean
  hasRole: (...roles: UserRole[]) => boolean
  canAccessRoute: (pathname: string) => boolean
}

// ─── Role Mapping ──────────────────────────────────────────────────
function resolveRole(profileRole?: string | null, email?: string | null, appMetadata?: Record<string, unknown>): UserRole {
  // Priority 1: app_metadata from JWT (already synced by trigger)
  if (appMetadata?.role) {
    const r = (appMetadata.role as string).toLowerCase()
    if (['admin', 'support', 'reseller', 'user'].includes(r)) return r as UserRole
  }

  // Priority 2: Hardcoded admin email override
  if (email && email.toLowerCase() === 'feitopepe510@gmail.com') return 'admin'

  // Priority 3: Profile role from DB
  if (profileRole) {
    const r = profileRole.toLowerCase()
    if (['admin', 'support', 'reseller', 'user'].includes(r)) return r as UserRole
  }

  return 'user'
}

// ─── Store ─────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  session: null,
  profile: null,
  role: 'user',
  permissions: ROLE_PERMISSIONS['user'],
  isLoading: true,
  isInitialized: false,
  isAuthenticated: false,

  // Initialize auth: check session + subscribe to changes
  initialize: async () => {
    const supabase = createClient()

    // 1. Get current session
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        await get().checkSession()
      } else {
        set({
          user: null,
          session: null,
          profile: null,
          role: 'user',
          permissions: ROLE_PERMISSIONS['user'],
          isLoading: false,
          isInitialized: true,
          isAuthenticated: false,
        })
      }
    } catch (err) {
      console.error('Auth initialization error:', err)
      set({
        user: null,
        session: null,
        profile: null,
        role: 'user',
        permissions: ROLE_PERMISSIONS['user'],
        isLoading: false,
        isInitialized: true,
        isAuthenticated: false,
      })
    }

    // 2. Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            // Re-fetch profile on sign-in or token refresh
            await get().checkSession()
          }
        } else if (event === 'SIGNED_OUT') {
          set({
            user: null,
            session: null,
            profile: null,
            role: 'user',
            permissions: ROLE_PERMISSIONS['user'],
            isLoading: false,
            isAuthenticated: false,
          })
        }
      }
    )

    // Return unsubscribe function
    return () => subscription.unsubscribe()
  },

  // Check session and fetch profile
  checkSession: async () => {
    set({ isLoading: true })
    const supabase = createClient()

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        set({
          user: null,
          session: null,
          profile: null,
          role: 'user',
          permissions: ROLE_PERMISSIONS['user'],
          isLoading: false,
          isInitialized: true,
          isAuthenticated: false,
        })
        return
      }

      // Fetch profile from DB
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, role, is_premium, points, streak_days, avatar_url')
        .eq('id', user.id)
        .single()

      // Resolve role from multiple sources
      const role = resolveRole(
        profile?.role,
        user.email,
        user.app_metadata
      )

      const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS['user']

      if (profileError || !profile) {
        // Fallback: user exists but no profile row yet
        const fallbackProfile: AuthProfile = {
          id: user.id,
          full_name: user.email || 'Usuario',
          email: user.email || '',
          role,
          is_premium: false,
          points: 0,
          streak_days: 0,
        }
        set({
          user,
          profile: fallbackProfile,
          role,
          permissions,
          isLoading: false,
          isInitialized: true,
          isAuthenticated: true,
        })
        return
      }

      set({
        user,
        profile: {
          ...profile,
          email: user.email || '',
          role,
        },
        role,
        permissions,
        isLoading: false,
        isInitialized: true,
        isAuthenticated: true,
      })
    } catch (err) {
      console.error('Session check error:', err)
      set({
        user: null,
        session: null,
        profile: null,
        role: 'user',
        permissions: ROLE_PERMISSIONS['user'],
        isLoading: false,
        isInitialized: true,
        isAuthenticated: false,
      })
    }
  },

  // Sign out
  signOut: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()

    set({
      user: null,
      session: null,
      profile: null,
      role: 'user',
      permissions: ROLE_PERMISSIONS['user'],
      isLoading: false,
      isAuthenticated: false,
    })

    window.location.href = '/login'
  },

  // Permission helpers
  hasPermission: (permission: string) => {
    return checkPermission(get().role, permission)
  },

  hasRole: (...roles: UserRole[]) => {
    return roles.includes(get().role)
  },

  canAccessRoute: (pathname: string) => {
    return checkRoute(get().role, pathname)
  },
}))
