'use client'

import { useEffect, useState, useCallback } from 'react'
import { ClipboardList, Search, Filter, Loader2, Package, Truck, CheckCircle2, XCircle, Clock, ChevronDown } from 'lucide-react'
import { getOrders, getOrderStats, updateOrderStatus, type Order } from '@/app/actions/orders-actions'
import { usePermissions } from '@/hooks/usePermissions'
import { toast } from 'sonner'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType; bg: string }> = {
    pending: { label: 'Pendiente', color: 'text-amber-400', icon: Clock, bg: 'bg-amber-500/10 border-amber-500/20' },
    confirmed: { label: 'Confirmado', color: 'text-blue-400', icon: CheckCircle2, bg: 'bg-blue-500/10 border-blue-500/20' },
    processing: { label: 'Procesando', color: 'text-purple-400', icon: Package, bg: 'bg-purple-500/10 border-purple-500/20' },
    shipped: { label: 'Enviado', color: 'text-cyan-400', icon: Truck, bg: 'bg-cyan-500/10 border-cyan-500/20' },
    delivered: { label: 'Entregado', color: 'text-emerald-400', icon: CheckCircle2, bg: 'bg-emerald-500/10 border-emerald-500/20' },
    cancelled: { label: 'Cancelado', color: 'text-red-400', icon: XCircle, bg: 'bg-red-500/10 border-red-500/20' },
    returned: { label: 'Devuelto', color: 'text-orange-400', icon: XCircle, bg: 'bg-orange-500/10 border-orange-500/20' },
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [stats, setStats] = useState<Record<string, number> | null>(null)
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
    const { isStaff } = usePermissions()

    const loadData = useCallback(async () => {
        setLoading(true)
        const [ordersRes, statsRes] = await Promise.all([
            getOrders({ status: statusFilter, search: search || undefined }),
            getOrderStats(),
        ])
        if (ordersRes.data) setOrders(ordersRes.data)
        if (statsRes.data) setStats(statsRes.data)
        setLoading(false)
    }, [statusFilter, search])

    useEffect(() => { loadData() }, [loadData])

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        const res = await updateOrderStatus(orderId, newStatus)
        if (res.error) {
            toast.error('Error actualizando pedido', { description: res.error })
        } else {
            toast.success('Estado actualizado')
            loadData()
        }
    }

    return (
        <div className="animate-in fade-in duration-700 pb-20 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl border border-amber-500/20">
                        <ClipboardList className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Gestión de Pedidos</h1>
                        <p className="text-sm text-gray-500">Seguimiento completo de tus pedidos</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                        const count = stats[key] || 0
                        const StatusIcon = cfg.icon
                        return (
                            <button
                                key={key}
                                onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
                                className={`p-3 rounded-xl border transition-all duration-300 text-left group
                  ${statusFilter === key
                                        ? `${cfg.bg} ring-1 ring-white/10 scale-[1.02]`
                                        : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <StatusIcon className={`w-4 h-4 ${cfg.color}`} />
                                    <span className={`text-lg font-bold ${cfg.color}`}>{count}</span>
                                </div>
                                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-mono">{cfg.label}</span>
                            </button>
                        )
                    })}
                </div>
            )}

            {/* Search & Filter Bar */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/20 transition-all"
                    />
                </div>
                <button
                    onClick={() => { setStatusFilter('all'); setSearch('') }}
                    className="px-4 py-2.5 text-xs text-gray-400 hover:text-white bg-white/[0.03] border border-white/10 rounded-xl hover:border-white/20 transition-all flex items-center gap-2"
                >
                    <Filter className="w-3.5 h-3.5" />
                    Limpiar
                </button>
            </div>

            {/* Orders Table */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <ClipboardList className="w-12 h-12 mb-3 opacity-30" />
                        <p className="text-sm">No hay pedidos</p>
                        <p className="text-xs text-gray-600 mt-1">Los pedidos aparecerán aquí cuando se creen</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-3 text-[10px] uppercase tracking-wider text-gray-500 font-mono bg-white/[0.02]">
                            <span className="col-span-3">Cliente</span>
                            <span className="col-span-2">Estado</span>
                            <span className="col-span-2">Total</span>
                            <span className="col-span-2">Fecha</span>
                            <span className="col-span-2">Pago</span>
                            <span className="col-span-1"></span>
                        </div>

                        {/* Orders */}
                        {orders.map(order => {
                            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                            const StatusIcon = cfg.icon
                            const isExpanded = expandedOrder === order.id

                            return (
                                <div key={order.id} className="group">
                                    <div
                                        className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors cursor-pointer"
                                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                    >
                                        <div className="col-span-3">
                                            <p className="text-sm font-medium text-white truncate">{order.customer_name}</p>
                                            <p className="text-xs text-gray-500 truncate">{order.customer_phone || order.customer_email || '—'}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs ${cfg.bg} ${cfg.color}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {cfg.label}
                                            </span>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-sm font-semibold text-white">${Number(order.total).toLocaleString()}</p>
                                            {Number(order.discount) > 0 && (
                                                <p className="text-xs text-emerald-400">-${Number(order.discount).toLocaleString()}</p>
                                            )}
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('es-AR')}</p>
                                            <p className="text-[10px] text-gray-600">{new Date(order.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-xs text-gray-400 capitalize">{order.payment_method}</span>
                                        </div>
                                        <div className="col-span-1 flex justify-end">
                                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                        </div>
                                    </div>

                                    {/* Expanded Detail */}
                                    {isExpanded && (
                                        <div className="px-6 py-4 bg-white/[0.01] border-t border-white/5 animate-in slide-in-from-top-1 duration-200">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {/* Items */}
                                                <div className="space-y-2">
                                                    <h4 className="text-[10px] uppercase tracking-wider text-gray-500 font-mono mb-2">Productos</h4>
                                                    {(order.items as unknown as Array<{ product_name: string; size: string; quantity: number; unit_price: number }>)?.map((item, i) => (
                                                        <div key={i} className="flex justify-between text-xs">
                                                            <span className="text-gray-300">{item.product_name} <span className="text-gray-600">({item.size})</span> ×{item.quantity}</span>
                                                            <span className="text-white">${(item.unit_price * item.quantity).toLocaleString()}</span>
                                                        </div>
                                                    )) || <p className="text-xs text-gray-600">Sin detalles</p>}
                                                </div>

                                                {/* Shipping */}
                                                <div className="space-y-2">
                                                    <h4 className="text-[10px] uppercase tracking-wider text-gray-500 font-mono mb-2">Envío</h4>
                                                    <p className="text-xs text-gray-400">{order.shipping_address || 'Sin dirección'}</p>
                                                    {order.tracking_number && (
                                                        <p className="text-xs text-amber-400">Tracking: {order.tracking_number}</p>
                                                    )}
                                                    {order.notes && (
                                                        <p className="text-xs text-gray-500 italic mt-2">&quot;{order.notes}&quot;</p>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                {isStaff && (
                                                    <div className="space-y-2">
                                                        <h4 className="text-[10px] uppercase tracking-wider text-gray-500 font-mono mb-2">Cambiar Estado</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {Object.entries(STATUS_CONFIG).map(([key, cfg2]) => {
                                                                if (key === order.status) return null
                                                                return (
                                                                    <button
                                                                        key={key}
                                                                        onClick={() => handleStatusChange(order.id, key)}
                                                                        className={`px-3 py-1.5 rounded-lg border text-xs transition-all hover:scale-105 ${cfg2.bg} ${cfg2.color}`}
                                                                    >
                                                                        {cfg2.label}
                                                                    </button>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
