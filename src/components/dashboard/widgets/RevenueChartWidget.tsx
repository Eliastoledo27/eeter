'use client';

import { BentoItem } from '../bento/BentoGrid';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RevenueData } from '@/app/actions/dashboard';
import { Loader2, TrendingUp, TrendingDown, BarChart3, Calendar } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Custom Tooltip Component
interface RevenueTooltipProps {
  active?: boolean;
  payload?: { payload: { date: string }; value: number }[];
}

function CustomTooltip({ active, payload }: RevenueTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-2xl px-4 py-3"
      >
        <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
          {data.payload.date}
        </p>
        <p className="text-xl font-black bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] bg-clip-text text-transparent">
          ${data.value?.toLocaleString()}
        </p>
      </motion.div>
    );
  }
  return null;
}

export function RevenueChartWidget({ data: chartData = [] }: { data: RevenueData[] }) {
  const loading = false;
  const [mounted, setMounted] = useState(false);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (chartData.length < 2) return { total: 0, change: 0, trend: 'up' as const };

    const total = chartData.reduce((sum, item) => sum + item.revenue, 0);
    const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2));
    const secondHalf = chartData.slice(Math.floor(chartData.length / 2));

    const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.revenue, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.revenue, 0) / secondHalf.length;

    const change = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    const trend = change >= 0 ? 'up' as const : 'down' as const;

    return { total, change: Math.abs(change), trend };
  }, [chartData]);

  if (!mounted) {
    return (
      <BentoItem colSpan={2} rowSpan={2} className="flex flex-col justify-between group bg-white/70 animate-pulse">
        <div className="h-full w-full"></div>
      </BentoItem>
    );
  }

  return (
    <BentoItem colSpan={2} rowSpan={2} className="flex flex-col justify-between group">
      {/* Header with metrics */}
      <div className="flex justify-between items-start mb-4 relative z-20">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] border border-[#3B82F6]/20">
              <BarChart3 size={14} className="text-[#1E40AF]" strokeWidth={2.5} />
            </div>
            <h3 className="text-[#0F172A] font-black text-lg tracking-tight uppercase">Ingresos</h3>

            {/* Trend Badge */}
            {chartData.length > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold border",
                  metrics.trend === 'up'
                    ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-700 border-rose-500/30"
                )}
              >
                {metrics.trend === 'up' ? (
                  <TrendingUp size={10} strokeWidth={3} />
                ) : (
                  <TrendingDown size={10} strokeWidth={3} />
                )}
                {metrics.change.toFixed(1)}%
              </motion.div>
            )}
          </div>

          <p className="text-[#64748B] text-[10px] font-medium pl-7">
            {chartData.length > 0
              ? `Total: $${metrics.total.toLocaleString()}`
              : 'Rendimiento de los últimos días'
            }
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1.5 bg-white/80 border border-[#E2E8F0] rounded-xl p-1 backdrop-blur-sm">
          <Calendar size={12} className="text-[#64748B] ml-1.5" />
          {['7d', '30d', '90d'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all duration-300",
                period === p
                  ? "bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] text-white shadow-md"
                  : "text-[#64748B] hover:text-[#1E40AF] hover:bg-slate-50"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-[220px] relative z-10">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="animate-spin text-[#1E40AF] w-6 h-6" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <BarChart3 size={32} className="text-slate-300" />
            </div>
            <p className="text-[#94A3B8] text-xs font-medium">No hay datos de ingresos suficientes</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(15,23,42,0.06)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }}
                tickFormatter={(value) => `$${value}`}
                dx={-5}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                activeDot={{
                  r: 6,
                  strokeWidth: 3,
                  stroke: '#fff',
                  fill: '#F59E0B',
                  filter: 'url(#glow)'
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </BentoItem>
  );
}
