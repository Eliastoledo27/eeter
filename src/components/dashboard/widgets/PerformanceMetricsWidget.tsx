'use client';

import { BentoItem } from '../bento/BentoGrid';
import { motion } from 'framer-motion';
import {
  Activity,
  Target,
  Zap,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Eye,
  Sparkles,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface MetricItemProps {
  label: string;
  value: number;
  target: number;
  icon: React.ElementType;
  color: 'blue' | 'emerald' | 'amber' | 'purple';
  delay?: number;
}

function MetricItem({ label, value, target, icon: Icon, color, delay = 0 }: MetricItemProps) {
  const [progress, setProgress] = useState(0);
  const percentage = Math.min((value / target) * 100, 100);
  const isOnTrack = value >= target;

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(percentage);
    }, delay);
    return () => clearTimeout(timer);
  }, [percentage, delay]);

  const colorClasses = {
    blue: {
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      progressBg: 'bg-blue-200/40',
      progressBar: 'from-blue-500 to-blue-600',
      glow: 'shadow-blue-500/20'
    },
    emerald: {
      gradient: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      progressBg: 'bg-emerald-200/40',
      progressBar: 'from-emerald-500 to-emerald-600',
      glow: 'shadow-emerald-500/20'
    },
    amber: {
      gradient: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      progressBg: 'bg-amber-200/40',
      progressBar: 'from-amber-500 to-amber-600',
      glow: 'shadow-amber-500/20'
    },
    purple: {
      gradient: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-700',
      progressBg: 'bg-purple-200/40',
      progressBar: 'from-purple-500 to-purple-600',
      glow: 'shadow-purple-500/20'
    }
  };

  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="group relative"
    >
      <div className="flex items-center gap-3 mb-2">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className={cn(
            "p-2 rounded-xl border",
            colors.bg,
            colors.border,
            "shadow-sm transition-all duration-300",
            colors.glow
          )}
        >
          <Icon size={16} className={cn("bg-gradient-to-br bg-clip-text text-transparent", colors.gradient)} strokeWidth={2.5} />
        </motion.div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-bold text-slate-700">{label}</p>
            <div className="flex items-center gap-1">
              {isOnTrack ? (
                <TrendingUp size={12} className="text-emerald-600" strokeWidth={2.5} />
              ) : (
                <TrendingDown size={12} className="text-rose-500" strokeWidth={2.5} />
              )}
              <span className={cn(
                "text-xs font-black",
                isOnTrack ? "text-emerald-600" : "text-rose-500"
              )}>
                {percentage.toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={cn("relative h-1.5 flex-1 rounded-full overflow-hidden", colors.progressBg)}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: delay + 0.2, ease: 'easeOut' }}
                className={cn("h-full bg-gradient-to-r rounded-full", colors.progressBar)}
              />
            </div>
            <p className="text-[10px] font-bold text-slate-500 min-w-[50px] text-right">
              {value}/{target}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export interface PerformanceMetric {
  label: string;
  value: number;
  target: number;
  trend: 'up' | 'down';
  trendValue: number;
}

import { generateDashboardInsights } from '@/app/actions/ai';

export function PerformanceMetricsWidget({ metrics }: { metrics?: PerformanceMetric[] }) {
  const [mounted, setMounted] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGenerateInsights = async () => {
    if (!metrics || metrics.length === 0) return;
    setLoadingInsights(true);
    try {
      const result = await generateDashboardInsights(metrics);
      if (result.success && result.text) {
        setInsights(result.text);
      }
    } finally {
      setLoadingInsights(false);
    }
  };

  // ... rest of the component


  // Use props or fallback to empty state
  const displayMetrics = metrics || [];

  // Calculate score based on metrics (avg progress)
  const score = displayMetrics.length > 0
    ? Math.round(displayMetrics.reduce((acc, m) => acc + Math.min((m.value / m.target) * 100, 100), 0) / displayMetrics.length)
    : 0;

  const getIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('ventas')) return ShoppingCart;
    if (l.includes('conversión') || l.includes('conversion')) return Target;
    if (l.includes('clientes')) return Users;
    if (l.includes('objetivo')) return DollarSign;
    return Activity;
  };

  const getColor = (index: number) => {
    const colors = ['blue', 'emerald', 'purple', 'amber'] as const;
    return colors[index % colors.length];
  };

  if (!mounted) {
    return (
      <BentoItem colSpan={1} rowSpan={2} className="animate-pulse">
        <div className="h-full w-full" />
      </BentoItem>
    );
  }

  return (
    <BentoItem colSpan={1} rowSpan={2} className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-100/50 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-100/50 to-transparent rounded-full blur-3xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
            <Activity size={14} className="text-blue-600" strokeWidth={2.5} />
          </div>
          <h3 className="text-slate-900 font-black text-lg tracking-tight uppercase">Métricas</h3>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="ml-auto"
          >
            <Zap size={16} className="text-amber-500" fill="currentColor" />
          </motion.div>
        </div>

        {/* Overall Performance Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mb-6 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-lg overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-200/30 to-transparent rounded-full blur-2xl" />

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Performance Score</p>
              <div className="flex items-center gap-2">
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  {score}
                </motion.p>
                {/* Trend of the first metric as a proxy for overall trend */}
                {displayMetrics[0] && (
                  <div className="flex flex-col">
                    <div className="flex items-center gap-0.5">
                      {displayMetrics[0].trend === 'up' ? (
                        <TrendingUp size={12} className="text-emerald-600" strokeWidth={2.5} />
                      ) : (
                        <TrendingDown size={12} className="text-rose-500" strokeWidth={2.5} />
                      )}
                      <span className={cn(
                        "text-xs font-black",
                        displayMetrics[0].trend === 'up' ? "text-emerald-600" : "text-rose-600"
                      )}>
                        {displayMetrics[0].trend === 'up' ? '+' : '-'}{displayMetrics[0].trendValue.toFixed(0)}%
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-medium">vs. ayer</span>
                  </div>
                )}
              </div>
            </div>

            <motion.div
              initial={{ rotate: -90 }}
              animate={{ rotate: 270 }} // Just a visual rotation effect
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="relative w-16 h-16"
            >
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 251.2" }}
                  animate={{ strokeDasharray: `${(score / 100) * 251.2} 251.2` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#A855F7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Target size={20} className="text-blue-600" strokeWidth={2} />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Metrics List */}
        <div className="space-y-3">
          {displayMetrics.map((metric, index) => (
            <MetricItem
              key={metric.label}
              label={metric.label}
              value={metric.value}
              target={metric.target}
              icon={getIcon(metric.label)}
              color={getColor(index)}
              delay={index * 0.1}
            />
          ))}
          {displayMetrics.length === 0 && (
            <div className="text-center py-4 text-xs text-slate-400">
              No hay métricas disponibles
            </div>
          )}
        </div>

        {/* AI Insights Section */}
        {insights && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-900 text-xs"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={12} className="text-orange-500" />
              <span className="font-bold uppercase tracking-wider">Éter AI Insights</span>
            </div>
            <p className="whitespace-pre-line leading-relaxed font-medium">
              {insights}
            </p>
          </motion.div>
        )}

        {/* Footer Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-4 pt-4 border-t border-slate-200 flex flex-col gap-2"
        >
          <button
            onClick={handleGenerateInsights}
            disabled={loadingInsights}
            className="w-full py-2 px-4 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-blue-700 text-[10px] font-bold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loadingInsights ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Sparkles size={12} strokeWidth={2.5} />
            )}
            {loadingInsights ? 'Analizando...' : 'Generar Insights con IA'}
          </button>

          <button className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-bold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-300 flex items-center justify-center gap-2">
            <Eye size={14} strokeWidth={2.5} />
            Ver Detalles Completos
          </button>
        </motion.div>
      </div>
    </BentoItem>
  );
}
