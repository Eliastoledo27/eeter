'use client';

import {
    ResponsiveContainer, ComposedChart, Bar, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

interface RevenueChartProps {
    data: { date: string; revenue: number; orders: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl">
            <p className="text-xs font-bold text-white mb-2">{label}</p>
            {payload.map((entry: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-gray-400">{entry.name}:</span>
                    <span className="text-white font-bold">
                        {entry.name === 'Ingresos' ? `$${entry.value.toLocaleString()}` : entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

export const RevenueChart = ({ data }: RevenueChartProps) => {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[300px] text-gray-500 text-sm font-medium">
                No hay datos de ingresos para este período
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C88A04" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#C88A04" stopOpacity={0.05} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 600 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    tickLine={false}
                />
                <YAxis
                    yAxisId="revenue"
                    tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
                />
                <YAxis
                    yAxisId="orders"
                    orientation="right"
                    tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    wrapperStyle={{ fontSize: 11, fontWeight: 700 }}
                    iconType="circle"
                    iconSize={8}
                />
                <Bar
                    yAxisId="revenue"
                    dataKey="revenue"
                    name="Ingresos"
                    fill="url(#revenueGrad)"
                    stroke="#C88A04"
                    strokeWidth={1}
                    radius={[6, 6, 0, 0]}
                    barSize={32}
                />
                <Line
                    yAxisId="orders"
                    dataKey="orders"
                    name="Pedidos"
                    stroke="#3B82F6"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#000' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    type="monotone"
                />
            </ComposedChart>
        </ResponsiveContainer>
    );
};
