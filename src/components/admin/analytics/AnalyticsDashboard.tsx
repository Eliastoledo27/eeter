'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDetailedAnalytics, AnalyticsData } from '@/app/actions/analytics';
import { getPerformanceMetrics, PerformanceMetric } from '@/app/actions/dashboard';
import { useAuthStore } from '@/store/auth-store';
import { RevenueChart } from './RevenueChart';
import { OrdersStatusChart } from './OrdersStatusChart';
import { SalesByCategoryChart } from './SalesByCategoryChart';
import { TopProductsTable } from './TopProductsTable';
import {
    TrendingUp, DollarSign, ShoppingCart, BarChart3,
    Download, Calendar, Loader2, RefreshCw, Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type DatePreset = '7d' | '30d' | '90d' | 'all';

export const AnalyticsDashboard = () => {
    const { profile, checkSession } = useAuthStore();
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [datePreset, setDatePreset] = useState<DatePreset>('30d');
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    const getDateRange = useCallback((preset: DatePreset) => {
        const now = new Date();
        switch (preset) {
            case '7d':
                return { start: new Date(now.getTime() - 7 * 86400000).toISOString() };
            case '30d':
                return { start: new Date(now.getTime() - 30 * 86400000).toISOString() };
            case '90d':
                return { start: new Date(now.getTime() - 90 * 86400000).toISOString() };
            default:
                return {};
        }
    }, []);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const range = getDateRange(datePreset);
            const [analyticsData, metricsData] = await Promise.all([
                getDetailedAnalytics(range),
                getPerformanceMetrics()
            ]);
            setAnalytics(analyticsData);
            setMetrics(metricsData);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            toast.error('Error al cargar los datos de analytics');
        } finally {
            setIsLoading(false);
        }
    }, [datePreset, getDateRange]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleExportCSV = async () => {
        if (!analytics) return;
        setIsExporting(true);
        try {
            const Papa = (await import('papaparse')).default;

            const rows = analytics.revenueOverTime.map(r => ({
                Fecha: r.date,
                Ingresos: r.revenue,
                Pedidos: r.orders
            }));

            const csv = Papa.unparse(rows);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics_${datePreset}_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Reporte exportado exitosamente');
        } catch {
            toast.error('Error al exportar');
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportPDF = async () => {
        if (!analytics) return;
        setIsExporting(true);
        try {
            const { jsPDF } = await import('jspdf');
            const { default: autoTable } = await import('jspdf-autotable');

            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text('Reporte de Analytics - Éter', 14, 22);
            doc.setFontSize(10);
            doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')} | Período: ${datePreset}`, 14, 30);

            // Summary
            doc.setFontSize(12);
            doc.text('Resumen', 14, 42);
            autoTable(doc, {
                startY: 46,
                head: [['Métrica', 'Valor']],
                body: [
                    ['Ingresos Totales', `$${analytics.summary.totalRevenue.toLocaleString()}`],
                    ['Total de Pedidos', analytics.summary.totalOrders.toString()],
                    ['Valor Promedio', `$${analytics.summary.averageOrderValue.toLocaleString()}`],
                ],
                theme: 'striped',
            });

            // Top Products
            doc.text('Top Productos', 14, (doc as any).lastAutoTable.finalY + 12);
            autoTable(doc, {
                startY: (doc as any).lastAutoTable.finalY + 16,
                head: [['Producto', 'Ventas', 'Ingresos']],
                body: analytics.topProducts.map(p => [
                    p.name,
                    p.sales.toString(),
                    `$${p.revenue.toLocaleString()}`
                ]),
                theme: 'striped',
            });

            doc.save(`analytics_${datePreset}_${new Date().toISOString().slice(0, 10)}.pdf`);
            toast.success('PDF exportado exitosamente');
        } catch {
            toast.error('Error al exportar PDF');
        } finally {
            setIsExporting(false);
        }
    };

    const formatCurrency = (value: number) => {
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
        return `$${value.toLocaleString()}`;
    };

    const kpiCards = analytics ? [
        {
            label: 'Ingresos Totales',
            value: formatCurrency(analytics.summary.totalRevenue),
            icon: DollarSign,
            color: 'from-emerald-500 to-emerald-600',
            bg: 'bg-emerald-500/10',
            textColor: 'text-emerald-400'
        },
        {
            label: 'Total Pedidos',
            value: analytics.summary.totalOrders.toLocaleString(),
            icon: ShoppingCart,
            color: 'from-blue-500 to-blue-600',
            bg: 'bg-blue-500/10',
            textColor: 'text-blue-400'
        },
        {
            label: 'Valor Promedio',
            value: formatCurrency(analytics.summary.averageOrderValue),
            icon: TrendingUp,
            color: 'from-purple-500 to-purple-600',
            bg: 'bg-purple-500/10',
            textColor: 'text-purple-400'
        },
        {
            label: 'Tasa Conversión',
            value: `${analytics.summary.conversionRate}%`,
            icon: Target,
            color: 'from-amber-500 to-amber-600',
            bg: 'bg-amber-500/10',
            textColor: 'text-amber-400'
        }
    ] : [];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                >
                    <Loader2 size={48} className="text-primary" />
                </motion.div>
                <p className="text-gray-400 font-mono text-sm tracking-wider">CARGANDO ANALYTICS...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 relative">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
                        Analytics
                    </h1>
                    <p className="text-gray-400 text-sm font-medium max-w-md">
                        Métricas en tiempo real de tu negocio con datos directos de Supabase.
                    </p>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-gray-400">
                        Rol: {profile?.role || 'cargando'}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Date Presets */}
                    <div className="flex gap-1 p-1 bg-black/40 border border-white/10 rounded-xl backdrop-blur-sm">
                        {([
                            { key: '7d', label: '7 días' },
                            { key: '30d', label: '30 días' },
                            { key: '90d', label: '90 días' },
                            { key: 'all', label: 'Todo' },
                        ] as { key: DatePreset; label: string }[]).map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setDatePreset(key)}
                                className={cn(
                                    'px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300',
                                    datePreset === key
                                        ? 'bg-primary/20 text-primary border border-primary/30 shadow-lg shadow-primary/10'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                )}
                            >
                                <Calendar size={12} className="inline mr-1.5" />
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={fetchData}
                            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all"
                            title="Refrescar"
                        >
                            <RefreshCw size={16} />
                        </button>
                        <button
                            onClick={handleExportCSV}
                            disabled={isExporting}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-all disabled:opacity-50"
                        >
                            <Download size={14} />
                            CSV
                        </button>
                        <button
                            onClick={handleExportPDF}
                            disabled={isExporting}
                            className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-xl text-xs font-bold text-primary transition-all disabled:opacity-50"
                        >
                            <Download size={14} />
                            PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((kpi, idx) => (
                    <motion.div
                        key={kpi.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 group hover:border-primary/30 transition-all duration-300"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={cn('p-3 rounded-xl', kpi.bg)}>
                                <kpi.icon size={20} className={kpi.textColor} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-white mb-1">{kpi.value}</h3>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{kpi.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Performance Metrics Row */}
            {metrics.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {metrics.map((metric, idx) => {
                        const progress = Math.min((metric.value / metric.target) * 100, 100);
                        return (
                            <motion.div
                                key={metric.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + idx * 0.1 }}
                                className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-5"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{metric.label}</p>
                                    <span className={cn(
                                        'text-[10px] font-bold px-2 py-0.5 rounded-full',
                                        metric.trend === 'up'
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : 'bg-red-500/20 text-red-400'
                                    )}>
                                        {metric.trend === 'up' ? '↑' : '↓'} {metric.trendValue.toFixed(1)}%
                                    </span>
                                </div>
                                <p className="text-2xl font-black text-white mb-3">
                                    {typeof metric.value === 'number' && metric.value > 1000
                                        ? formatCurrency(metric.value)
                                        : metric.value}
                                </p>
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                                        className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1.5 font-medium">
                                    Objetivo: {typeof metric.target === 'number' && metric.target > 1000
                                        ? formatCurrency(metric.target)
                                        : metric.target}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Charts Grid */}
            {analytics && (
                <div className="grid grid-cols-12 gap-6">
                    {/* Revenue Chart - Large */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="col-span-12 lg:col-span-8 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6"
                    >
                        <h3 className="text-lg font-black text-white mb-1">Ingresos por Período</h3>
                        <p className="text-xs text-gray-400 font-medium mb-6">Evolución de ingresos y pedidos</p>
                        <RevenueChart data={analytics.revenueOverTime} />
                    </motion.div>

                    {/* Orders Status - Small */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="col-span-12 lg:col-span-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6"
                    >
                        <h3 className="text-lg font-black text-white mb-1">Estado de Pedidos</h3>
                        <p className="text-xs text-gray-400 font-medium mb-6">Distribución actual</p>
                        <OrdersStatusChart data={analytics.ordersByStatus} />
                    </motion.div>

                    {/* Sales by Category */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="col-span-12 lg:col-span-5 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6"
                    >
                        <h3 className="text-lg font-black text-white mb-1">Ventas por Categoría</h3>
                        <p className="text-xs text-gray-400 font-medium mb-6">Desglose de productos vendidos</p>
                        <SalesByCategoryChart data={analytics.salesByCategory} />
                    </motion.div>

                    {/* Top Products */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        className="col-span-12 lg:col-span-7 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6"
                    >
                        <h3 className="text-lg font-black text-white mb-1">Top Productos</h3>
                        <p className="text-xs text-gray-400 font-medium mb-6">Productos más vendidos</p>
                        <TopProductsTable data={analytics.topProducts} />
                    </motion.div>
                </div>
            )}
        </div>
    );
};
