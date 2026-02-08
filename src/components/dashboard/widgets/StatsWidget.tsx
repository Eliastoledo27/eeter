'use client';

import { BentoItem } from '../bento/BentoGrid';
import { DollarSign, ShoppingBag, Users, TrendingUp, TrendingDown, CreditCard, LucideIcon, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { DashboardStats } from '@/app/actions/dashboard';
import { useEffect, useState } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: LucideIcon;
  delay?: number;
  loading?: boolean;
  color?: 'blue' | 'purple' | 'amber' | 'emerald';
}

function StatCard({ title, value, trend, trendUp, icon: Icon, delay = 0, loading, color = 'blue' }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const colorClasses = {
    blue: {
      icon: 'from-[#3B82F6] to-[#1E40AF]',
      iconBg: 'bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE]',
      iconShadow: 'shadow-[0_8px_16px_rgba(59,130,246,0.25)]',
      iconHover: 'group-hover:shadow-[0_12px_24px_rgba(59,130,246,0.35)]',
      glow: 'group-hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]',
      border: 'group-hover:border-[#3B82F6]/30'
    },
    purple: {
      icon: 'from-[#A855F7] to-[#7C3AED]',
      iconBg: 'bg-gradient-to-br from-[#FAF5FF] to-[#F3E8FF]',
      iconShadow: 'shadow-[0_8px_16px_rgba(168,85,247,0.25)]',
      iconHover: 'group-hover:shadow-[0_12px_24px_rgba(168,85,247,0.35)]',
      glow: 'group-hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]',
      border: 'group-hover:border-[#A855F7]/30'
    },
    amber: {
      icon: 'from-[#F59E0B] to-[#D97706]',
      iconBg: 'bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7]',
      iconShadow: 'shadow-[0_8px_16px_rgba(245,158,11,0.25)]',
      iconHover: 'group-hover:shadow-[0_12px_24px_rgba(245,158,11,0.35)]',
      glow: 'group-hover:shadow-[0_0_40px_rgba(245,158,11,0.15)]',
      border: 'group-hover:border-[#F59E0B]/30'
    },
    emerald: {
      icon: 'from-[#10B981] to-[#059669]',
      iconBg: 'bg-gradient-to-br from-[#ECFDF5] to-[#D1FAE5]',
      iconShadow: 'shadow-[0_8px_16px_rgba(16,185,129,0.25)]',
      iconHover: 'group-hover:shadow-[0_12px_24px_rgba(16,185,129,0.35)]',
      glow: 'group-hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]',
      border: 'group-hover:border-[#10B981]/30'
    }
  };

  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col h-full justify-between relative group cursor-pointer"
    >
      {/* Floating glow effect */}
      <div className={cn(
        "absolute -inset-0.5 rounded-2xl opacity-0 blur-xl transition-all duration-500",
        colors.glow
      )} />

      <div className="flex justify-between items-start mb-3 relative">
        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "p-2.5 rounded-xl border border-white/60 transition-all duration-300 relative overflow-hidden",
            colors.iconBg,
            colors.iconShadow,
            colors.iconHover
          )}
        >
          {/* Icon gradient overlay */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-10",
            colors.icon
          )} />
          <Icon size={20} strokeWidth={2.5} className={cn("relative z-10 bg-gradient-to-br bg-clip-text text-transparent", colors.icon)} />
        </motion.div>

        {!loading && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: delay + 0.2 }}
            className={cn(
              "flex items-center text-[10px] font-extrabold px-2.5 py-1 rounded-full border backdrop-blur-md transition-all",
              trendUp
                ? "text-emerald-700 bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.12)]"
                : "text-rose-700 bg-rose-500/10 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.12)]"
            )}
          >
            {trendUp ? <TrendingUp size={11} className="mr-1" strokeWidth={3} /> : <TrendingDown size={11} className="mr-1" strokeWidth={3} />}
            {trend}
          </motion.span>
        )}
      </div>

      <div className="relative">
        <h3 className="text-[#64748B] text-[10px] font-bold mb-1 tracking-widest uppercase">{title}</h3>
        {loading ? (
          <div className="h-9 w-28 bg-slate-200/60 animate-pulse rounded-lg" />
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              "text-3xl font-black tracking-tighter transition-all duration-300",
              "bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] bg-clip-text text-transparent",
              colors.border.replace('border', 'group-hover:from')
            )}
          >
            {displayValue}
          </motion.p>
        )}
      </div>

      {/* Animated decorative line */}
      <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#1E40AF] via-[#F59E0B] to-[#1E40AF] group-hover:w-full transition-all duration-700" />
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#E2E8F0] to-transparent" />
    </motion.div>
  );
}

export function StatsWidget({ stats, mode = 'admin' }: { stats: DashboardStats | null, mode?: 'admin' | 'reseller' | 'user' }) {
  const loading = !stats;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(amount);
  };

  const avgTicket = stats?.totalOrders ? stats.totalRevenue / stats.totalOrders : 0;

  // Configuration based on mode
  const config = {
    admin: {
      card1: { title: "Ingresos Totales", value: stats ? formatCurrency(stats.totalRevenue) : "$0", icon: DollarSign, color: "emerald" as const },
      card2: { title: "Pedidos", value: stats ? stats.totalOrders.toString() : "0", icon: ShoppingBag, color: "blue" as const },
      card3: { title: "Clientes Activos", value: stats ? stats.activeCustomers.toString() : "0", icon: Users, color: "purple" as const },
      card4: { title: "Ticket Promedio", value: formatCurrency(avgTicket), icon: CreditCard, color: "amber" as const }
    },
    reseller: {
      card1: { title: "Total Comprado", value: stats ? formatCurrency(stats.totalRevenue) : "$0", icon: DollarSign, color: "emerald" as const },
      card2: { title: "Mis Pedidos", value: stats ? stats.totalOrders.toString() : "0", icon: ShoppingBag, color: "blue" as const },
      card3: { title: "Pedidos Activos", value: stats ? stats.revenueGrowth.toString() : "0", icon: Package, color: "purple" as const }, // reusing revenueGrowth for active orders count
      card4: { title: "Gasto Promedio", value: formatCurrency(avgTicket), icon: CreditCard, color: "amber" as const }
    },
    user: {
      card1: { title: "Total Gastado", value: stats ? formatCurrency(stats.totalRevenue) : "$0", icon: DollarSign, color: "emerald" as const },
      card2: { title: "Mis Compras", value: stats ? stats.totalOrders.toString() : "0", icon: ShoppingBag, color: "blue" as const },
      card3: { title: "En Proceso", value: stats ? stats.revenueGrowth.toString() : "0", icon: Package, color: "purple" as const },
      card4: { title: "Promedio", value: formatCurrency(avgTicket), icon: CreditCard, color: "amber" as const }
    }
  };

  const currentConfig = config[mode];

  return (
    <>
      <BentoItem colSpan={1}>
        <StatCard
          title={currentConfig.card1.title}
          value={currentConfig.card1.value}
          trend={stats ? `${stats.revenueGrowth}%` : "0%"}
          trendUp={stats ? stats.revenueGrowth >= 0 : true}
          icon={currentConfig.card1.icon}
          delay={0.1}
          loading={loading}
          color={currentConfig.card1.color}
        />
      </BentoItem>
      <BentoItem colSpan={1}>
        <StatCard
          title={currentConfig.card2.title}
          value={currentConfig.card2.value}
          trend={stats ? `${stats.ordersGrowth}%` : "0%"}
          trendUp={stats ? stats.ordersGrowth >= 0 : true}
          icon={currentConfig.card2.icon}
          delay={0.2}
          loading={loading}
          color={currentConfig.card2.color}
        />
      </BentoItem>
      <BentoItem colSpan={1}>
        <StatCard
          title={currentConfig.card3.title}
          value={currentConfig.card3.value}
          trend="+0%" // We don't have growth for customers yet
          trendUp={true}
          icon={currentConfig.card3.icon}
          delay={0.3}
          loading={loading}
          color={currentConfig.card3.color}
        />
      </BentoItem>
      <BentoItem colSpan={1}>
        <StatCard
          title={currentConfig.card4.title}
          value={currentConfig.card4.value}
          trend="0%"
          trendUp={true}
          icon={currentConfig.card4.icon}
          delay={0.4}
          loading={loading}
          color={currentConfig.card4.color}
        />
      </BentoItem>
    </>
  );
}
