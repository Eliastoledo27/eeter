'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import {
  DollarSign, ShoppingBag, TrendingUp, Users,
  ArrowUpRight, ArrowDownRight, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDetailedAnalytics, AnalyticsData } from '@/app/actions/analytics';

import { subDays } from 'date-fns';
export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({
    start: subDays(new Date(), 30).toISOString(),
    end: new Date().toISOString()
  });
  const [periodLabel, setPeriodLabel] = useState('Últimos 30 días');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getDetailedAnalytics(dateRange);
      setData(result);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadData();
  }, [loadData, dateRange]);

  const handlePeriodChange = (days: number, label: string) => {
    const end = new Date();
    const start = subDays(end, days);
    setDateRange({ start: start.toISOString(), end: end.toISOString() });
    setPeriodLabel(label);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Ingresos Totales',
      value: data?.summary.totalRevenue.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }),
      icon: DollarSign,
      color: 'blue',
      trend: '+12.5%' // Mocked trend
    },
    {
      label: 'Pedidos Totales',
      value: data?.summary.totalOrders,
      icon: ShoppingBag,
      color: 'emerald',
      trend: '+5.2%'
    },
    {
      label: 'Ticket Promedio',
      value: data?.summary.averageOrderValue.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }),
      icon: TrendingUp,
      color: 'amber',
      trend: '+2.1%'
    },
    {
      label: 'Conversión',
      value: `${data?.summary.conversionRate}%`,
      icon: Users,
      color: 'purple',
      trend: '-0.5%'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            Análisis <span className="text-blue-600">Avanzado</span>
          </h1>
          <p className="text-slate-600">
            Visualiza el rendimiento de tu negocio en tiempo real.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="bg-white border border-slate-200 rounded-lg p-1 flex items-center">
            {[
              { label: '7D', days: 7, text: 'Últimos 7 días' },
              { label: '30D', days: 30, text: 'Últimos 30 días' },
              { label: '90D', days: 90, text: 'Últimos 3 meses' },
              { label: 'YTD', days: 365, text: 'Este año' } // Simplified YTD
            ].map((period) => (
              <button
                key={period.label}
                onClick={() => handlePeriodChange(period.days, period.text)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${periodLabel === period.text
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                {period.label}
              </button>
            ))}
          </div>
          <Button variant="outline" className="gap-2">
            <Download size={16} /> Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}>
                {stat.trend.startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.trend}
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Chart (Main) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 text-lg">Evolución de Ingresos</h3>
            <div className="text-sm text-slate-500 font-medium bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
              {periodLabel}
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.revenueOverTime}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [value?.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }), 'Ingresos']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 text-lg mb-6">Ventas por Categoría</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.salesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data?.salesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [`${value} uds`, 'Ventas']}
                  contentStyle={{ borderRadius: '12px' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 text-lg mb-6">Estado de Pedidos</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.ordersByStatus} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
                  width={80}
                />
                <Tooltip
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ borderRadius: '8px' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {data?.ordersByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 text-lg mb-4">Productos Más Vendidos</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Producto</th>
                  <th className="px-4 py-3 text-right">Ventas</th>
                  <th className="px-4 py-3 text-right rounded-r-lg">Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {data?.topProducts.map((product, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {product.name}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-blue-600">
                      {product.sales}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-600">
                      {product.revenue.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
