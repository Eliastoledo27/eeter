'use client';

import { Trophy, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopProductsTableProps {
    data: { name: string; sales: number; revenue: number }[];
}

export const TopProductsTable = ({ data }: TopProductsTableProps) => {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[280px] text-gray-500 text-sm font-medium">
                No hay datos de productos
            </div>
        );
    }

    const maxSales = Math.max(...data.map(d => d.sales));

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-white/10">
                        <th className="text-left text-[10px] text-gray-500 font-bold uppercase tracking-wider py-3 px-2">#</th>
                        <th className="text-left text-[10px] text-gray-500 font-bold uppercase tracking-wider py-3 px-2">Producto</th>
                        <th className="text-right text-[10px] text-gray-500 font-bold uppercase tracking-wider py-3 px-2">Ventas</th>
                        <th className="text-right text-[10px] text-gray-500 font-bold uppercase tracking-wider py-3 px-2">Ingresos</th>
                        <th className="text-left text-[10px] text-gray-500 font-bold uppercase tracking-wider py-3 px-2 hidden sm:table-cell">Barra</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((product, idx) => {
                        const barWidth = maxSales > 0 ? (product.sales / maxSales) * 100 : 0;
                        return (
                            <tr
                                key={idx}
                                className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                            >
                                <td className="py-3 px-2">
                                    <div className={cn(
                                        'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black',
                                        idx === 0 ? 'bg-amber-500/20 text-amber-400' :
                                            idx === 1 ? 'bg-gray-400/20 text-gray-300' :
                                                idx === 2 ? 'bg-orange-500/20 text-orange-400' :
                                                    'bg-white/5 text-gray-500'
                                    )}>
                                        {idx < 3 ? <Trophy size={14} /> : idx + 1}
                                    </div>
                                </td>
                                <td className="py-3 px-2">
                                    <p className="text-sm font-bold text-white truncate max-w-[200px] group-hover:text-primary transition-colors">
                                        {product.name}
                                    </p>
                                </td>
                                <td className="py-3 px-2 text-right">
                                    <span className="text-sm font-black text-white">{product.sales}</span>
                                    <span className="text-[10px] text-gray-500 ml-1">uds</span>
                                </td>
                                <td className="py-3 px-2 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <TrendingUp size={12} className="text-emerald-400" />
                                        <span className="text-sm font-bold text-emerald-400">
                                            ${product.revenue.toLocaleString()}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-3 px-2 hidden sm:table-cell">
                                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full transition-all duration-700"
                                            style={{ width: `${barWidth}%` }}
                                        />
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
