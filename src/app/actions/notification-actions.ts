'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function createServerSupabase() {
    const cookieStore = cookies()
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        try { cookieStore.set(name, value, options) } catch { /* read-only in RSC */ }
                    })
                },
            },
        }
    )
}

export interface Notification {
    id: string
    user_id: string
    title: string
    message: string | null
    type: 'info' | 'success' | 'warning' | 'error' | 'order' | 'stock' | 'message'
    is_read: boolean
    action_url: string | null
    metadata: Record<string, unknown>
    created_at: string
}

export async function getNotifications(limit = 20) {
    const supabase = createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'Not authenticated' }

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

    return { data: data as Notification[] | null, error: error?.message }
}

export async function getUnreadCount() {
    const supabase = createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { count: 0, error: 'Not authenticated' }

    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

    return { count: count || 0, error: error?.message }
}

export async function markAsRead(notificationId: string) {
    const supabase = createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id)

    return { error: error?.message }
}

export async function markAllAsRead() {
    const supabase = createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

    return { error: error?.message }
}
