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

type PedidoRow = {
    id: string
    customer_name?: string | null
    customer_email?: string | null
    total_amount?: number | string | null
    status?: string | null
    items?: OrderItem[] | null
    discount_amount?: number | string | null
    created_at: string
}

function mapPedido(row: PedidoRow): Order {
    return {
        id: row.id,
        user_id: '',
        reseller_id: null,
        customer_name: row.customer_name || 'Cliente sin nombre',
        customer_phone: null,
        customer_email: row.customer_email || null,
        items: Array.isArray(row.items) ? row.items : [],
        subtotal: Number(row.total_amount || 0),
        discount: Number(row.discount_amount || 0),
        total: Number(row.total_amount || 0),
        status: row.status || 'pendiente',
        payment_method: '',
        shipping_address: null,
        tracking_number: null,
        notes: null,
        created_at: row.created_at,
        updated_at: row.created_at,
    }
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
        .from('pedidos')
        .select('id,customer_name,customer_email,total_amount,status,items,created_at,discount_amount,applied_coupon_id', { count: 'exact' })
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
    return { data: data?.map(mapPedido) || null, error: error?.message, count }
}

export async function getOrderById(orderId: string) {
    const supabase = createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'Not authenticated' }

    const { data, error } = await supabase
        .from('pedidos')
        .select('id,customer_name,customer_email,total_amount,status,items,created_at,discount_amount,applied_coupon_id')
        .eq('id', orderId)
        .single()

    return { data: data ? mapPedido(data) : null, error: error?.message }
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
        .from('pedidos')
        .insert({
            customer_name: order.customer_name,
            customer_email: order.customer_email || null,
            items: order.items,
            total_amount: order.total,
            discount_amount: order.discount || 0,
            status: 'pendiente',
        })
        .select()
        .single()

    return { data: data ? mapPedido(data) : null, error: error?.message }
}

export async function updateOrderStatus(orderId: string, status: string) {
    const supabase = createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'Not authenticated' }

    const { data, error } = await supabase
        .from('pedidos')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single()

    return { data: data ? mapPedido(data) : null, error: error?.message }
}

export async function getOrderStats() {
    const supabase = createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'Not authenticated' }

    const { data, error } = await supabase
        .from('pedidos')
        .select('status, total_amount')

    if (error || !data) return { data: null, error: error?.message }

    const stats = {
        total: data.length,
        pending: data.filter(o => o.status === 'pendiente').length,
        confirmed: data.filter(o => o.status === 'confirmado').length,
        processing: data.filter(o => o.status === 'procesando').length,
        shipped: data.filter(o => o.status === 'enviado').length,
        delivered: data.filter(o => o.status === 'completado').length,
        cancelled: data.filter(o => o.status === 'cancelado').length,
        revenue: data.filter(o => o.status !== 'cancelado').reduce((sum, o) => sum + Number(o.total_amount), 0),
    }

    return { data: stats, error: null }
}
