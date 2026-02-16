'use client';

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface OrdersStatusChartProps {
    data: { name: string; value: number; color: string }[];
}

const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const entry = payload[0];
    return (
        <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl">
            <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.payload.color }} />
                <span className="text-white font-bold">{entry.name}</span>
            </div>
            <p className="text-sm text-white font-black mt-1">{entry.value} pedidos</p>
        </div>
    );
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text
            x={x}
            y={y}
            fill="white"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fontWeight={800}
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export const OrdersStatusChart = ({ data }: OrdersStatusChartProps) => {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[280px] text-gray-500 text-sm font-medium">
                No hay datos de pedidos
            </div>
        );
    }

    const total = data.reduce((sum, d) => sum + d.value, 0);

    return (
        <div>
            <div className="text-center mb-2">
                <span className="text-3xl font-black text-white">{total}</span>
                <span className="text-xs text-gray-400 ml-2 font-semibold">pedidos totales</span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        label={renderCustomLabel}
                        labelLine={false}
                        stroke="transparent"
                    >
                        {data.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ fontSize: 11, fontWeight: 700 }}
                        iconType="circle"
                        iconSize={8}
                        formatter={(value: string) => (
                            <span className="text-gray-300 text-xs font-semibold">{value}</span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
