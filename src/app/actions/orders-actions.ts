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

export interface OrderItem {
    product_id: string
    product_name: string
    size: string
    quantity: number
    unit_price: number
}

export interface Order {
    id: string
    user_id: string
    reseller_id: string | null
    customer_name: string
    customer_phone: string | null
    customer_email: string | null
    items: OrderItem[]
    subtotal: number
    discount: number
    total: number
    status: string
    payment_method: string
    shipping_address: string | null
    tracking_number: string | null
    notes: string | null
    created_at: string
    updated_at: string
}

export async function getOrders(filters?: {
    status?: string
    search?: string
    limit?: number
    offset?: number
}) {
    const supabase = createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'Not authenticated' }

    let query = supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

    if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
    }
    if (filters?.search) {
        query = query.ilike('customer_name', `%${filters.search}%`)
    }
    if (filters?.limit) {
        query = query.limit(filters.limit)
    }
    if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1)
    }

    const { data, error, count } = await query
    return { data: data as Order[] | null, error: error?.message, count }
}

export async function getOrderById(orderId: string) {
    const supabase = createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'Not authenticated' }

    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

    return { data: data as Order | null, error: error?.message }
}

export async function createOrder(order: {
    customer_name: string
    customer_phone?: string
    customer_email?: string
    items: OrderItem[]
    subtotal: number
    discount?: number
    total: number
    payment_method?: string
    shipping_address?: string
    notes?: string
}) {
    const supabase = createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'Not authenticated' }

    const { data, error } = await supabase
        .from('orders')
        .insert({
            ...order,
            user_id: user.id,
            reseller_id: user.id,
            status: 'pending',
        })
        .select()
        .single()

    return { data: data as Order | null, error: error?.message }
}

export async function updateOrderStatus(orderId: string, status: string) {
    const supabase = createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'Not authenticated' }

    const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single()

    return { data: data as Order | null, error: error?.message }
}

export async function getOrderStats() {
    const supabase = createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'Not authenticated' }

    const { data, error } = await supabase
        .from('orders')
        .select('status, total')

    if (error || !data) return { data: null, error: error?.message }

    const stats = {
        total: data.length,
        pending: data.filter(o => o.status === 'pending').length,
        confirmed: data.filter(o => o.status === 'confirmed').length,
        processing: data.filter(o => o.status === 'processing').length,
        shipped: data.filter(o => o.status === 'shipped').length,
        delivered: data.filter(o => o.status === 'delivered').length,
        cancelled: data.filter(o => o.status === 'cancelled').length,
        revenue: data.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + Number(o.total), 0),
    }

    return { data: stats, error: null }
}
