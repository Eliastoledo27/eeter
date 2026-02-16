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

export interface RankingEntry {
    id: string
    user_id: string
    period: string
    total_sales: number
    total_orders: number
    total_profit: number
    position: number | null
    user_name?: string
    user_email?: string
    avatar_url?: string
}


export async function getRanking(period?: string) {
    const supabase = createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'Not authenticated' }

    const role = user.app_metadata?.role || 'user'
    // Only admin and reseller can view ranking
    if (role !== 'admin' && role !== 'reseller') {
        return { data: null, error: 'Unauthorized: insufficient permissions' }
    }

    const currentPeriod = period || new Date().toISOString().slice(0, 7) // '2026-02'

    const { data, error } = await supabase
        .from('ranking_entries')
        .select('*')
        .eq('period', currentPeriod)
        .order('total_sales', { ascending: false })

    if (error) return { data: null, error: error.message }

    // Enrich with profile data
    if (data && data.length > 0) {
        const userIds = data.map(r => r.user_id)
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', userIds)

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

        const enriched: RankingEntry[] = data.map((entry, idx) => {
            const profile = profileMap.get(entry.user_id)
            return {
                ...entry,
                position: idx + 1,
                user_name: profile?.full_name || 'Unknown',
                avatar_url: profile?.avatar_url,
            }
        })

        return { data: enriched, error: null }
    }

    return { data: data as RankingEntry[], error: null }
}

export async function getPersonalStats(userId?: string) {
    const supabase = createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'Not authenticated' }

    const role = user.app_metadata?.role || 'user'
    const targetId = userId || user.id

    // If requesting another user's stats, must be admin
    if (targetId !== user.id && role !== 'admin') {
        return { data: null, error: 'Unauthorized: cannot view other users stats' }
    }

    const currentPeriod = new Date().toISOString().slice(0, 7)

    const { data, error } = await supabase
        .from('ranking_entries')
        .select('*')
        .eq('user_id', targetId)
        .order('period', { ascending: false })
        .limit(6) // Last 6 months

    if (error) return { data: null, error: error.message }

    const current = data?.find(r => r.period === currentPeriod)
    const previous = data?.filter(r => r.period !== currentPeriod) || []

    return {
        data: {
            current: current || null,
            history: previous,
            trend: previous.length > 0 && current
                ? ((current.total_sales - previous[0].total_sales) / (previous[0].total_sales || 1)) * 100
                : 0,
        },
        error: null,
    }
}
