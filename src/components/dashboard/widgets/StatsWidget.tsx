'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Users, Package, DollarSign, Loader2 } from 'lucide-react';
import { getDashboardStats, DashboardStats } from '@/app/actions/dashboard';

export function StatsWidget() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (err) {
                console.error('Error fetching stats:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const formatCurrency = (value: number) => {
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
        return `$${value.toLocaleString()}`;
    };

    const displayStats = stats
        ? [
            {
                label: 'Total Pedidos',
                value: stats.totalOrders.toLocaleString(),
                change: stats.ordersGrowth > 0 ? `+${stats.ordersGrowth}%` : `${stats.ordersGrowth}%`,
                icon: Package,
                color: 'text-blue-500'
            },
            {
                label: 'Ingresos',
                value: formatCurrency(stats.totalRevenue),
                change: stats.revenueGrowth > 0 ? `+${stats.revenueGrowth}%` : `${stats.revenueGrowth}%`,
                icon: DollarSign,
                color: 'text-green-500'
            },
            {
                label: 'Productos',
                value: stats.totalProducts.toLocaleString(),
                change: '',
                icon: TrendingUp,
                color: 'text-purple-500'
            },
            {
                label: 'Clientes Activos',
                value: stats.activeCustomers.toLocaleString(),
                change: '',
                icon: Users,
                color: 'text-orange-500'
            },
        ]
        : [];

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-center justify-center h-[88px]"
                    >
                        <Loader2 size={20} className="text-gray-500 animate-spin" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {displayStats.map((stat, idx) => (
                <div key={idx} className="bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-center justify-between group hover:border-primary/50 transition-colors">
                    <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wider font-mono">{stat.label}</p>
                        <h4 className="text-2xl font-bold text-white mt-1">{stat.value}</h4>
                        {stat.change && (
                            <span className="text-xs text-green-400 font-mono">{stat.change}</span>
                        )}
                    </div>
                    <div className={`p-3 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors ${stat.color}`}>
                        <stat.icon size={24} />
                    </div>
                </div>
            ))}
        </div>
    );
}
