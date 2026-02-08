'use client';

import { DollarSign, Package, TrendingUp, Users } from 'lucide-react';
import { DashboardStats } from '@/app/actions/dashboard';

interface InventoryStatsProps {
  stats: DashboardStats;
}

export const InventoryStats = ({ stats }: InventoryStatsProps) => {
  // Use real data from stats
  const totalRevenue = stats.totalRevenue;
  const totalOrders = stats.totalOrders;
  const activeProducts = stats.totalProducts;
  const activeCustomers = stats.activeCustomers;

  const cards = [
    {
      title: 'Ingresos Totales',
      value: `$${totalRevenue.toLocaleString('es-AR')}`,
      change: `+${stats.revenueGrowth}% vs mes anterior`,
      icon: DollarSign,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20'
    },
    {
      title: 'Pedidos del Mes',
      value: totalOrders.toString(),
      change: `+${stats.ordersGrowth}% vs mes anterior`,
      icon: Package,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      title: 'Productos Activos',
      value: activeProducts.toString(),
      change: 'Inventario actual',
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      title: 'Clientes Activos',
      value: activeCustomers.toString(),
      change: 'Total registrados',
      icon: Users,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div 
          key={index}
          className="relative overflow-hidden group"
        >
          {/* Card Background with Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50 rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-900/5" />
          
          {/* Hover Glow Effect */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Content */}
          <div className="relative p-6">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${
                index === 0 ? 'from-emerald-500 to-emerald-600' :
                index === 1 ? 'from-blue-500 to-blue-600' :
                index === 2 ? 'from-purple-500 to-purple-600' :
                'from-amber-500 to-amber-600'
              } shadow-lg shadow-${
                index === 0 ? 'emerald' :
                index === 1 ? 'blue' :
                index === 2 ? 'purple' :
                'amber'
              }-600/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <card.icon size={24} className="text-white" strokeWidth={2.5} />
              </div>
              <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 border border-emerald-100">
                <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{card.title}</h3>
              <div className="text-3xl font-black text-slate-900 tracking-tight mb-1">{card.value}</div>
              <p className="text-slate-400 text-xs font-medium">{card.change}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
