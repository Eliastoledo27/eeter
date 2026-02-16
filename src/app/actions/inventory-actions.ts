'use server'

import { createClient } from '@/utils/supabase/server'
import { checkUserPermissions } from '@/utils/supabase/middleware-auth'


export interface InventoryItem {
    id: string
    name: string
    category: string
    price: number
    stock_by_size: Record<string, number>
    is_active: boolean
    images: string[]
    total_stock: number
}

export interface InventoryLog {
    id: string
    product_id: string
    size: string
    quantity_change: number
    reason: string
    previous_stock: number
    new_stock: number
    performed_by: string
    created_at: string
}


export async function getInventory() {
    const { user, isAdmin, isStaff } = await checkUserPermissions()

    if (!user || (!isAdmin && !isStaff)) {
        console.error('getInventory: Unauthorized access attempt')
        return { data: null, error: 'Unauthorized: insufficient permissions' }
    }

    const supabase = createClient()
    const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('name')

    if (error || !data) return { data: null, error: error?.message }

    const inventory: InventoryItem[] = data.map(p => {
        const stockBySize = (p.stock_by_size || {}) as Record<string, number>
        const totalStock = Object.values(stockBySize).reduce((sum, qty) => sum + qty, 0)
        return {
            ...p,
            is_active: p.status === 'activo',
            stock_by_size: stockBySize,
            total_stock: totalStock,
        }
    })

    return { data: inventory, error: null }
}

export async function adjustStock(productId: string, size: string, change: number, reason: string) {
    const { user, isAdmin, isStaff } = await checkUserPermissions()

    if (!user || (!isAdmin && !isStaff)) {
        return { data: null, error: 'Unauthorized: insufficient permissions' }
    }

    const supabase = createClient()

    // Get current product
    const { data: product, error: fetchErr } = await supabase
        .from('productos')
        .select('stock_by_size')
        .eq('id', productId)
        .single()

    if (fetchErr || !product) return { data: null, error: fetchErr?.message || 'Product not found' }

    const currentStock = (product.stock_by_size as Record<string, number>) || {}
    const previous = currentStock[size] || 0
    const newQty = Math.max(0, previous + change)

    const updatedStock = { ...currentStock, [size]: newQty }

    // Update product stock
    const { error: updateErr } = await supabase
        .from('productos')
        .update({ stock_by_size: updatedStock })
        .eq('id', productId)

    if (updateErr) return { data: null, error: updateErr.message }

    // Log the movement
    const { error: logErr } = await supabase
        .from('inventory_logs')
        .insert({
            product_id: productId,
            size,
            quantity_change: change,
            reason,
            previous_stock: previous,
            new_stock: newQty,
            performed_by: user.id,
        })

    if (logErr) console.error('Failed to log inventory:', logErr)

    return { data: { product_id: productId, size, previous, new_stock: newQty }, error: null }
}

export async function getStockAlerts(threshold = 5) {
    const { user, isAdmin, isStaff } = await checkUserPermissions()

    if (!user || (!isAdmin && !isStaff)) {
        return { data: null, error: 'Unauthorized' }
    }

    const supabase = createClient()
    const { data, error } = await supabase
        .from('productos')
        .select('id, name, stock_by_size, images')
        .eq('status', 'activo')

    if (error || !data) return { data: null, error: error?.message }

    const alerts = data
        .map(p => {
            const stock = (p.stock_by_size || {}) as Record<string, number>
            const lowSizes = Object.entries(stock).filter(([, qty]) => qty <= threshold)
            return lowSizes.length > 0 ? { ...p, low_sizes: lowSizes } : null
        })
        .filter(Boolean)

    return { data: alerts, error: null }
}

export async function getInventoryLogs(productId?: string) {
    const { user, isAdmin, isStaff } = await checkUserPermissions()

    if (!user || (!isAdmin && !isStaff)) {
        return { data: null, error: 'Unauthorized' }
    }

    const supabase = createClient()
    let query = supabase
        .from('inventory_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

    if (productId) {
        query = query.eq('product_id', productId)
    }

    const { data, error } = await query
    return { data: data as InventoryLog[] | null, error: error?.message }
}

export async function updateProductNames(updates: { id: string; name: string }[]) {
    const { user, isAdmin, isStaff } = await checkUserPermissions()

    if (!user || (!isAdmin && !isStaff)) {
        return { error: 'Unauthorized: insufficient permissions' }
    }

    const supabase = createClient()

    const errors: string[] = []

    // Since Supabase doesn't have a simple "update many with different values" without RPC,
    // we'll run these in parallel. For reasonable batch sizes (e.g., < 50), this is acceptable.
    // If we have hundreds, we should consider chunking or a custom SQL function.
    await Promise.all(
        updates.map(async (update) => {
            const { error } = await supabase
                .from('productos')
                .update({ name: update.name })
                .eq('id', update.id)

            if (error) {
                console.error(`Failed to update product ${update.id}:`, error)
                errors.push(`Error updating ID ${update.id}: ${error.message}`)
            }
        })
    )

    if (errors.length > 0) {
        return { error: `Completed with errors: ${errors.slice(0, 3).join(', ')}...` }
    }

    return { success: true }
}

