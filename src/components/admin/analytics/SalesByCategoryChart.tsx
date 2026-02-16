'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface SalesByCategoryChartProps {
    data: { name: string; value: number; color: string }[];
}

const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const entry = payload[0];
    return (
        <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl">
            <p className="text-xs text-gray-400 mb-1">{entry.payload.name}</p>
            <p className="text-sm text-white font-black">{entry.value} unidades vendidas</p>
        </div>
    );
};

export const SalesByCategoryChart = ({ data }: SalesByCategoryChartProps) => {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[280px] text-gray-500 text-sm font-medium">
                No hay datos de categorías
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={280}>
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
            >
                <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    width={100}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar
                    dataKey="value"
                    radius={[0, 8, 8, 0]}
                    barSize={24}
                >
                    {data.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};
