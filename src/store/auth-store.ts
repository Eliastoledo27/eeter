import { create } from 'zustand'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import { logoutAction } from '@/app/actions/auth-bypass'

interface Profile {
  id: string
  full_name: string
  email: string
  role: 'admin' | 'support' | 'reseller' | 'user'
  is_premium: boolean
  points: number
  streak_days: number
  avatar_url?: string
}

interface AuthState {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  checkSession: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  checkSession: async () => {
    set({ isLoading: true })
    const supabase = createClient()

    const mapRole = (role?: string, email?: string) => {
      if (email && email.toLowerCase() === 'feitopepe510@gmail.com') return 'admin'
      if (!role) return 'user'
      const r = role.toLowerCase()
      if (r === 'admin') return 'admin'
      if (r === 'support') return 'support'
      if (r === 'reseller') return 'reseller'
      return 'user'
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        set({ user: null, profile: null, isLoading: false })
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, role, is_premium, points, streak_days, avatar_url')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        // If profile fetch fails, we still have the user object but no role info
        // We apply the email override here if applicable
        const role = mapRole(undefined, user.email)
        const fallbackProfile: Profile = {
          id: user.id,
          full_name: user.email || 'Usuario',
          email: user.email || '',
          role: role as Profile['role'],
          is_premium: false,
          points: 0,
          streak_days: 0
        }
        set({ user, profile: fallbackProfile, isLoading: false })
        return
      }

      set({
        user,
        profile: {
          ...profile,
          email: user.email || '',
          role: mapRole(profile.role, user.email) as Profile['role']
        },
        isLoading: false
      })
    } catch (err) {
      console.error('Auth check error:', err)
      set({ user: null, profile: null, isLoading: false })
    }
  },
  signOut: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()

    try {
      await logoutAction()
    } catch {
      // ignore
    }

    set({ user: null, profile: null })
    window.location.href = '/login'
  },
}))
