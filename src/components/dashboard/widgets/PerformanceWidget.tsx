'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { getRevenueData, RevenueData } from '@/app/actions/dashboard';
import { Loader2 } from 'lucide-react';

export function PerformanceWidget() {
    const t = useTranslations('dashboard');
    const [data, setData] = useState<RevenueData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const revenueData = await getRevenueData();
                setData(revenueData);
            } catch (error) {
                console.error('Failed to load performance data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) {
        return (
            <div className="bg-black/40 backdrop-blur-md border border-white/10 shadow-lg rounded-xl p-6 h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="bg-black/40 backdrop-blur-md border border-white/10 shadow-lg rounded-xl p-6 h-full flex flex-col">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 font-mono">{t('performance_metrics')}</h3>
            <div className="flex-1 min-h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#c88a04" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#c88a04" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="date"
                            stroke="#666"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#666"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => `$${val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val}`}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value: number | undefined) => [`$${value?.toLocaleString() ?? 0}`, 'Ingresos']}
                            labelStyle={{ color: '#9CA3AF' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#c88a04"
                            fillOpacity={1}
                            fill="url(#colorPv)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
