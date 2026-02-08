'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getOrders, updateOrderStatus, OrderRecord } from '@/app/actions/orders';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfDay, endOfDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    Package,
    Clock,
    Truck,
    CheckCircle2,
    XCircle,
    MoreHorizontal,
    Eye,
    Search,
    RefreshCw,
    Download,
    User,
    DollarSign,
    ShoppingBag,
    Loader2,
    ChevronLeft,
    ChevronRight,
    MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import Image from 'next/image';

const statusConfig = {
    pendiente: { label: 'Pendiente', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Clock },
    procesando: { label: 'Procesando', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: Package },
    enviado: { label: 'Enviado', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20', icon: Truck },
    completado: { label: 'Completado', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 },
    cancelado: { label: 'Cancelado', color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: XCircle }
};

interface OrdersManagerProps {
    showNewOrderButton?: boolean;
}

type ExtendedOrderRecord = OrderRecord & {
    customer_phone?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    shippingDetails?: any;
};

export function OrdersManager({ }: OrdersManagerProps) {
    const [orders, setOrders] = useState<OrderRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

    // Pagination & Selection
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

    const loadOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getOrders({ status: statusFilter !== 'all' ? statusFilter : undefined });
            setOrders(data);
        } catch (error) {
            console.error('Error loading orders:', error);
            toast.error('Error al cargar los pedidos');
        } finally {
            setIsLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
        setSelectedOrders(new Set());
    }, [searchTerm, statusFilter, dateRange]);

    const handleStatusUpdate = async (orderId: string, newStatus: OrderRecord['status']) => {
        try {
            const result = await updateOrderStatus(orderId, newStatus);
            if (result.success) {
                toast.success('Estado actualizado');
                loadOrders();
                if (selectedOrder?.id === orderId) {
                    setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
                }
            } else {
                toast.error(result.message);
            }
        } catch {
            toast.error('Error al actualizar');
        }
    };

    const handleBulkStatusUpdate = async (newStatus: OrderRecord['status']) => {
        if (selectedOrders.size === 0) return;

        const confirmUpdate = window.confirm(`¿Estás seguro de cambiar el estado de ${selectedOrders.size} pedidos a "${newStatus}"?`);
        if (!confirmUpdate) return;

        try {
            let successCount = 0;
            for (const orderId of selectedOrders) {
                const result = await updateOrderStatus(orderId, newStatus);
                if (result.success) successCount++;
            }
            toast.success(`${successCount} pedidos actualizados`);
            loadOrders();
            setSelectedOrders(new Set());
        } catch {
            toast.error('Error en actualización masiva');
        }
    };

    const handleSendWhatsApp = () => {
        if (!selectedOrder) return;

        if (!selectedOrder) return;
        const order = selectedOrder as ExtendedOrderRecord;

        const phone = order.customer_phone || order.shippingDetails?.phone;
        if (!phone) {
            toast.error('No hay teléfono registrado para este cliente');
            return;
        }

        // Clean phone number (keep only digits)
        const cleanPhone = phone.replace(/\D/g, '');

        // Format items list
        const itemsList = selectedOrder.items?.map(i => `• ${i.quantity}x ${i.name}`).join('%0A') || '';
        const total = Number(selectedOrder.total_amount).toLocaleString('es-AR');
        const customerName = (order.customer_name || 'Cliente').split(' ')[0];

        const message = `Hola *${customerName}*! 👋%0A%0A` +
            `Te escribimos de *Eter Store* por tu pedido *#${selectedOrder.reference_code}*.%0A%0A` +
            `*Resumen del pedido:*%0A${itemsList}%0A%0A` +
            `*Total: $${total}*%0A` +
            `Estado actual: ${statusConfig[selectedOrder.status]?.label || selectedOrder.status}%0A%0A` +
            `¿Necesitas ayuda para finalizar tu compra o coordinar el envío?`;

        window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesSearch =
                order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.reference_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());

            let matchesDate = true;
            if (dateRange.start) {
                const orderDate = new Date(order.created_at);
                const startDate = startOfDay(parseISO(dateRange.start));
                if (orderDate < startDate) matchesDate = false;
            }
            if (dateRange.end && matchesDate) {
                const orderDate = new Date(order.created_at);
                const endDate = endOfDay(parseISO(dateRange.end));
                if (orderDate > endDate) matchesDate = false;
            }

            return matchesSearch && matchesDate;
        });
    }, [orders, searchTerm, dateRange]);

    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredOrders, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    const toggleSelectAll = () => {
        if (selectedOrders.size === paginatedOrders.length) {
            setSelectedOrders(new Set());
        } else {
            const newSelected = new Set(paginatedOrders.map(o => o.id));
            setSelectedOrders(newSelected);
        }
    };

    const toggleSelectOrder = (id: string) => {
        const newSelected = new Set(selectedOrders);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedOrders(newSelected);
    };

    const stats = {
        total: orders.length,
        pendiente: orders.filter(o => o.status === 'pendiente').length,
        completado: orders.filter(o => o.status === 'completado').length,
        revenue: orders.filter(o => o.status === 'completado').reduce((sum, o) => sum + o.total_amount, 0)
    };

    return (
        <div className="space-y-6">
            {/* Header Improved */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Pedidos</h1>
                    <p className="text-slate-500">Gestiona y supervisa todas las transacciones de tu tienda.</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={loadOrders}
                        variant="outline"
                        className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </Button>
                    <Button variant="outline" className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700">
                        <Download className="mr-2 h-4 w-4" />
                        Exportar
                    </Button>
                </div>
            </div>

            {/* Stats Cards Compact */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: stats.total, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Pendientes', value: stats.pendiente, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Completados', value: stats.completado, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Ingresos', value: <span suppressHydrationWarning>${stats.revenue.toLocaleString('es-AR')}</span>, icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50' }
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                            <stat.icon size={20} className={stat.color} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                            <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="flex flex-col md:flex-row gap-4 flex-1">
                        <div className="relative flex-1 max-w-md">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar pedido, cliente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>
                        <div className="flex gap-2 items-center">
                            <div className="relative">
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                    className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <span className="text-slate-400">-</span>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                    className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto">
                        {['all', 'pendiente', 'procesando', 'enviado', 'completado', 'cancelado'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide whitespace-nowrap transition-all ${statusFilter === status
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {status === 'all' ? 'Todos' : status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bulk Actions Toolbar */}
                <AnimatePresence>
                    {selectedOrders.size > 0 && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="flex items-center gap-4 pt-4 border-t border-slate-100 overflow-hidden"
                        >
                            <span className="text-sm font-medium text-slate-600">{selectedOrders.size} seleccionados</span>
                            <div className="h-4 w-px bg-slate-200" />
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate('procesando')} className="h-8 text-xs border-blue-200 text-blue-700 hover:bg-blue-50">
                                    Marcar Procesando
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate('enviado')} className="h-8 text-xs border-purple-200 text-purple-700 hover:bg-purple-50">
                                    Marcar Enviado
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate('completado')} className="h-8 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                                    Marcar Completado
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate('cancelado')} className="h-8 text-xs border-red-200 text-red-700 hover:bg-red-50">
                                    Cancelar
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                        <p className="text-slate-500 font-medium">Cargando pedidos...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                            <Search size={24} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">No se encontraron pedidos</h3>
                        <p className="text-slate-500 text-sm max-w-xs">
                            Intenta ajustar los filtros o la búsqueda.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-200">
                                        <th className="px-6 py-4 text-left w-12">
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                checked={selectedOrders.size === paginatedOrders.length && paginatedOrders.length > 0}
                                                onChange={toggleSelectAll}
                                            />
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Referencia</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {paginatedOrders.map((order) => {
                                        const StatusIcon = statusConfig[order.status]?.icon || Package;
                                        return (
                                            <tr
                                                key={order.id}
                                                className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${selectedOrders.has(order.id) ? 'bg-blue-50/30' : ''}`}
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                        checked={selectedOrders.has(order.id)}
                                                        onChange={() => toggleSelectOrder(order.id)}
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-mono text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">
                                                        {order.reference_code}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold">
                                                            {order.customer_name?.charAt(0).toUpperCase() || '?'}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-900">{order.customer_name}</p>
                                                            {order.customer_email && (
                                                                <p className="text-xs text-slate-500">{order.customer_email}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span suppressHydrationWarning className="text-sm font-bold text-slate-900">
                                                        ${Number(order.total_amount).toLocaleString('es-AR')}
                                                    </span>
                                                    <div className="text-xs text-slate-500 mt-0.5">{order.items?.length || 0} items</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig[order.status]?.color}`}>
                                                        <StatusIcon size={12} />
                                                        {statusConfig[order.status]?.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-slate-600">
                                                        {format(new Date(order.created_at), "d MMM, yy", { locale: es })}
                                                    </div>
                                                    <div className="text-xs text-slate-400">
                                                        {format(new Date(order.created_at), "HH:mm")}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700 rounded-lg">
                                                                <MoreHorizontal size={16} />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                                                                <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                                                            </DropdownMenuItem>
                                                            {order.status !== 'completado' && order.status !== 'cancelado' && (
                                                                <>
                                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'completado')}>
                                                                        <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> Completar
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'cancelado')}>
                                                                        <XCircle className="mr-2 h-4 w-4 text-red-500" /> Cancelar
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
                            <div className="text-sm text-slate-500">
                                Mostrando <span className="font-medium text-slate-900">{paginatedOrders.length}</span> de <span className="font-medium text-slate-900">{filteredOrders.length}</span> pedidos
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="h-8 px-2"
                                >
                                    <ChevronLeft size={16} />
                                </Button>
                                <div className="flex items-center px-2 text-sm font-medium text-slate-700">
                                    Página {currentPage} de {Math.max(1, totalPages)}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="h-8 px-2"
                                >
                                    <ChevronRight size={16} />
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Order Detail Modal */}
            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent className="max-w-2xl p-0 bg-white border-none rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
                    {selectedOrder && (
                        <>
                            {/* Modal Header */}
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Detalle del Pedido</p>
                                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                            {selectedOrder.reference_code}
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig[selectedOrder.status]?.color}`}>
                                                {statusConfig[selectedOrder.status]?.label}
                                            </span>
                                        </h2>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Realizado el {format(new Date(selectedOrder.created_at), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)}>
                                        <XCircle className="text-slate-400 hover:text-slate-700" />
                                    </Button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 overflow-y-auto flex-1 space-y-8">
                                {/* Customer Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                            <User size={16} /> Cliente
                                        </h3>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                                            <div>
                                                <p className="text-xs text-slate-500 font-medium">Nombre</p>
                                                <p className="text-sm font-bold text-slate-900">{(selectedOrder as ExtendedOrderRecord).customer_name}</p>
                                            </div>
                                            {(selectedOrder as ExtendedOrderRecord).customer_email && (
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium">Email</p>
                                                    <p className="text-sm font-medium text-slate-900">{(selectedOrder as ExtendedOrderRecord).customer_email}</p>
                                                </div>
                                            )}
                                            {((selectedOrder as ExtendedOrderRecord).customer_phone || (selectedOrder as ExtendedOrderRecord).shippingDetails?.phone) && (
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium">Teléfono</p>
                                                    <p className="text-sm font-medium text-slate-900">{(selectedOrder as ExtendedOrderRecord).customer_phone || (selectedOrder as ExtendedOrderRecord).shippingDetails?.phone}</p>
                                                </div>
                                            )}
                                            {(selectedOrder as ExtendedOrderRecord).shippingDetails?.dni && (
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium">DNI</p>
                                                    <p className="text-sm font-medium text-slate-900">{(selectedOrder as ExtendedOrderRecord).shippingDetails?.dni}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                            <Truck size={16} /> Envío
                                        </h3>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                                            {selectedOrder.shippingDetails?.address ? (
                                                <>
                                                    <div>
                                                        <p className="text-xs text-slate-500 font-medium">Dirección</p>
                                                        <p className="text-sm font-bold text-slate-900">{selectedOrder.shippingDetails.address}</p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <p className="text-xs text-slate-500 font-medium">Ciudad</p>
                                                            <p className="text-sm font-medium text-slate-900">{selectedOrder.shippingDetails.city || '-'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-slate-500 font-medium">Provincia</p>
                                                            <p className="text-sm font-medium text-slate-900">{selectedOrder.shippingDetails.province || '-'}</p>
                                                        </div>
                                                    </div>
                                                    {selectedOrder.shippingDetails.postalCode && (
                                                        <div>
                                                            <p className="text-xs text-slate-500 font-medium">Código Postal</p>
                                                            <p className="text-sm font-medium text-slate-900">{selectedOrder.shippingDetails.postalCode}</p>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="text-sm text-slate-500 italic">No hay información de envío disponible</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                        <Package size={16} /> Productos ({selectedOrder.items?.length || 0})
                                    </h3>
                                    <div className="border rounded-xl border-slate-200 overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50 border-b border-slate-200">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-medium text-slate-500">Producto</th>
                                                    <th className="px-4 py-3 text-center font-medium text-slate-500">Cant.</th>
                                                    <th className="px-4 py-3 text-right font-medium text-slate-500">Precio</th>
                                                    <th className="px-4 py-3 text-right font-medium text-slate-500">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {selectedOrder.items?.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-lg bg-slate-100 relative overflow-hidden flex-shrink-0">
                                                                    {item.image ? (
                                                                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                                                                    ) : (
                                                                        <div className="flex items-center justify-center w-full h-full text-slate-300">
                                                                            <Package size={16} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-slate-900">{item.name}</p>
                                                                    {item.size && <p className="text-xs text-slate-500">Talle: {item.size}</p>}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center text-slate-600">{item.quantity}</td>
                                                        <td className="px-4 py-3 text-right text-slate-600" suppressHydrationWarning>
                                                            ${Number(item.price).toLocaleString('es-AR')}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-bold text-slate-900" suppressHydrationWarning>
                                                            ${(Number(item.price) * item.quantity).toLocaleString('es-AR')}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-slate-50 border-t border-slate-200">
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-3 text-right font-bold text-slate-700">Total</td>
                                                    <td className="px-4 py-3 text-right font-black text-lg text-slate-900" suppressHydrationWarning>
                                                        ${Number(selectedOrder.total_amount).toLocaleString('es-AR')}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>

                                {selectedOrder.shippingDetails?.notes && (
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Notas del Pedido</h3>
                                        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm border border-yellow-100">
                                            {selectedOrder.shippingDetails.notes}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center gap-3">
                                <div>
                                    {((selectedOrder as ExtendedOrderRecord).customer_phone || (selectedOrder as ExtendedOrderRecord).shippingDetails?.phone) && (
                                        <Button
                                            variant="outline"
                                            className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 bg-white"
                                            onClick={handleSendWhatsApp}
                                        >
                                            <MessageCircle className="mr-2 h-4 w-4" /> Enviar WhatsApp
                                        </Button>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    {selectedOrder.status !== 'completado' && selectedOrder.status !== 'cancelado' && (
                                        <>
                                            <Button
                                                variant="outline"
                                                className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                                                onClick={() => {
                                                    if (confirm('¿Cancelar este pedido?')) handleStatusUpdate(selectedOrder.id, 'cancelado');
                                                }}
                                            >
                                                <XCircle className="mr-2 h-4 w-4" /> Cancelar Pedido
                                            </Button>
                                            <Button
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                onClick={() => handleStatusUpdate(selectedOrder.id, 'completado')}
                                            >
                                                <CheckCircle2 className="mr-2 h-4 w-4" /> Marcar Completado
                                            </Button>
                                        </>
                                    )}
                                    <Button variant="secondary" onClick={() => setSelectedOrder(null)}>
                                        Cerrar
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
