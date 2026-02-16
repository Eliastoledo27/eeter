'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MoreHorizontal, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { getDashboardStats, DashboardStats } from '@/app/actions/dashboard';
import { toast } from 'sonner';

export function GlobalPortfolio() {
    const t = useTranslations('dashboard');
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to load portfolio stats:', error);
                toast.error('Error al cargar datos del portafolio');
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const formatShortCurrency = (value: number) => {
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
        return `$${value.toLocaleString()}`;
    };

    if (loading) {
        return (
            <div className="bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] rounded-xl p-6 h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const revenue = stats?.totalRevenue || 0;
    const growth = stats?.revenueGrowth || 0;
    const isPositive = growth >= 0;

    return (
        <div className="bg-black/40 backdrop-blur-md border border-primary/30 shadow-[0_4px_30px_rgba(0,0,0,0.5)] rounded-xl p-6 relative flex flex-col justify-between overflow-hidden group h-full">
            <div className="flex justify-between items-start z-10 w-full">
                <div>
                    <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase font-mono">{t('global_portfolio')}</h2>
                    <div className="mt-1 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] text-green-500 tracking-wider font-mono">{t('live_updates')}</span>
                    </div>
                </div>
                <button className="text-primary/50 hover:text-primary transition-colors">
                    <MoreHorizontal size={16} />
                </button>
            </div>

            {/* Center Gauge */}
            <div className="absolute inset-0 flex items-center justify-center z-0 opacity-20 pointer-events-none">
                <div className="w-64 h-64 border border-white/5 rounded-full animate-[spin_10s_linear_infinite]"></div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                <div className="relative w-48 h-48 flex items-center justify-center mb-4">
                    <div className="absolute inset-0 rounded-full border border-primary/20 shadow-[0_0_30px_rgba(200,138,4,0.1)]"></div>
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="96" cy="96" fill="none" r="88" stroke="rgba(255,255,255,0.05)" strokeWidth="4"></circle>
                        <circle
                            className="drop-shadow-[0_0_4px_#c88a04]"
                            cx="96" cy="96" fill="none" r="88"
                            stroke="#c88a04"
                            strokeDasharray="552"
                            strokeDashoffset="138" // Fixed static for now, could be dynamic based on target
                            strokeWidth="2"
                            strokeLinecap="round"
                        ></circle>
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-bold text-white tracking-tight drop-shadow-[0_0_10px_rgba(200,138,4,0.5)]">
                            {formatShortCurrency(revenue)}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono mt-1">{t('total_assets')}</span>
                    </div>
                </div>

                <div className="text-center">
                    <div className="text-4xl font-light text-white font-mono tracking-tighter mb-1">
                        {formatCurrency(revenue)}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs">
                        <span className={`font-semibold px-2 py-0.5 rounded border text-[10px] font-mono flex items-center gap-1 ${isPositive
                                ? 'text-green-400 bg-green-400/10 border-green-400/20'
                                : 'text-red-400 bg-red-400/10 border-red-400/20'
                            }`}>
                            {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            {growth > 0 ? '+' : ''}{growth}%
                        </span>
                        <span className="text-gray-500 uppercase tracking-wide text-[10px] font-mono">{t('this_week')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
