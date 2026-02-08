'use client';

import { BentoItem } from '../bento/BentoGrid';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { TrendingUp, Package, DollarSign } from 'lucide-react';

// Custom Bar Tooltip
interface CustomBarTooltipProps {
  active?: boolean;
  payload?: { value: number; payload: { month: string } }[];
  label?: string;
}

const CustomBarTooltip = ({ active, payload, label }: CustomBarTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-3 rounded-xl shadow-xl">
        <p className="font-bold text-slate-800 mb-1">{label}</p>
        <div className="space-y-1">
          <p className="text-xs text-blue-600 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Ventas: <span className="font-bold">{payload[0].value}</span>
          </p>
          <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
            Objetivo: <span className="font-bold">{payload[1]?.value || 0}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// Custom Pie Tooltip
interface CustomPieTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; payload: { color: string } }[];
}

const CustomPieTooltip = ({ active, payload }: CustomPieTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-2 rounded-lg shadow-xl">
        <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.payload.color }}></span>
          {data.name}: <span className="font-black ml-auto pl-2">{data.value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export function AdvancedAnalyticsWidget({
  salesByCategory = [],
  monthlyData = []
}: {
  salesByCategory?: { name: string; value: number; color: string }[];
  monthlyData?: { month: string; ventas: number; objetivo: number }[];
}) {
  const [mounted, setMounted] = useState(false);
  const [activeChart, setActiveChart] = useState<'bar' | 'pie'>('bar');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use props data or empty defaults if not provided
  const chartSalesByCategory = salesByCategory.length > 0 ? salesByCategory : [
    { name: 'Sin datos', value: 1, color: '#E2E8F0' }
  ];

  const chartMonthlyData = monthlyData.length > 0 ? monthlyData : [];

  const totalSales = salesByCategory.reduce((sum, item) => sum + item.value, 0);
  const topCategory = salesByCategory.length > 0
    ? salesByCategory.reduce((prev, current) => prev.value > current.value ? prev : current)
    : { name: 'N/A', value: 0 };

  // Use averageSales to avoid unused var
  const averageSales = salesByCategory.length > 0
    ? Math.round(totalSales / salesByCategory.length)
    : 0;

  if (!mounted) {
    return (
      <BentoItem colSpan={2} rowSpan={2} className="animate-pulse">
        <div className="h-full w-full" />
      </BentoItem>
    );
  }

  return (
    <BentoItem colSpan={2} rowSpan={2} className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100/30 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-100/30 to-transparent rounded-full blur-3xl" />

      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{
                rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              }}
              className="p-1.5 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200"
            >
              <TrendingUp size={14} className="text-blue-600" strokeWidth={2.5} />
            </motion.div>
            <h3 className="text-slate-900 font-black text-lg tracking-tight uppercase">Análisis</h3>
          </div>

          {/* Chart Type Switcher */}
          <div className="flex items-center gap-1 p-1 bg-white/80 border border-slate-200 rounded-xl backdrop-blur-sm shadow-sm">
            {[
              { id: 'bar', label: 'Barras' },
              { id: 'pie', label: 'Circular' }
            ].map((chart) => (
              <button
                key={chart.id}
                onClick={() => setActiveChart(chart.id as 'bar' | 'pie')}
                className={cn(
                  "px-3 py-1 text-[10px] font-bold rounded-lg transition-all duration-300",
                  activeChart === chart.id
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                    : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                )}
              >
                {chart.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-200 shadow-sm"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Package size={12} className="text-blue-600" strokeWidth={2.5} />
              <p className="text-[9px] font-bold text-blue-600 uppercase">Total</p>
            </div>
            <p className="text-xl font-black text-blue-700">{totalSales}</p>
            <p className="text-[9px] text-slate-500 font-medium">unidades</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 shadow-sm"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp size={12} className="text-emerald-600" strokeWidth={2.5} />
              <p className="text-[9px] font-bold text-emerald-600 uppercase">Top</p>
            </div>
            <p className="text-sm font-black text-emerald-700 truncate">{topCategory.name}</p>
            <p className="text-[9px] text-slate-500 font-medium">{topCategory.value} uds</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-2.5 rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-200 shadow-sm"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign size={12} className="text-amber-600" strokeWidth={2.5} />
              <p className="text-[9px] font-bold text-amber-600 uppercase">Promedio</p>
            </div>
            <p className="text-xl font-black text-amber-700">{averageSales}</p>
            <p className="text-[9px] text-slate-500 font-medium">por categoría</p>
          </motion.div>
        </div>

        {/* Chart Area */}
        <div className="flex-1 min-h-0">
          <motion.div
            key={activeChart}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {activeChart === 'bar' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartMonthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar
                    dataKey="ventas"
                    fill="#3B82F6"
                    radius={[8, 8, 0, 0]}
                    animationDuration={1000}
                  />
                  <Bar
                    dataKey="objetivo"
                    fill="#E2E8F0"
                    radius={[8, 8, 0, 0]}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartSalesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {chartSalesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </div>

        {/* Legend */}
        {activeChart === 'pie' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-3 pt-3 border-t border-slate-200"
          >
            <div className="grid grid-cols-2 gap-2">
              {chartSalesByCategory.map((category) => (
                <div key={category.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-[10px] font-medium text-slate-600">{category.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeChart === 'bar' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-center gap-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-[10px] font-medium text-slate-600">Ventas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-slate-300" />
              <span className="text-[10px] font-medium text-slate-600">Objetivo</span>
            </div>
          </motion.div>
        )}
      </div>
    </BentoItem>
  );
}
