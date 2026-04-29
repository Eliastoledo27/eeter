'use client';

import { cn } from '@/lib/utils';

interface StockMatrixBarProps {
    stockBySize: Record<string, number>;
}

export function StockMatrixBar({ stockBySize }: StockMatrixBarProps) {
    const sizes = Object.entries(stockBySize).sort((a, b) => {
        // Simple sort for sizes like S, M, L, XL or numbers
        const order: Record<string, number> = { 'XS': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5, 'XXL': 6 };
        return (order[a[0]] || 99) - (order[b[0]] || 99);
    });

    if (sizes.length === 0) {
        return <span className="text-rose-500 font-black text-[9px]">SIN DATOS_STOCK</span>;
    }

    return (
        <div className="flex gap-1.5 items-end h-6">
            {sizes.map(([size, qty]) => {
                const stock = Number(qty);
                const isLow = stock > 0 && stock <= 3;
                const isOut = stock === 0;

                return (
                    <div key={size} className="flex flex-col items-center gap-1 group relative">
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 px-2 py-1 bg-black border border-white/10 rounded text-[8px] font-black pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                            TALLE {size}: {stock} UDS
                        </div>
                        
                        <div 
                            className={cn(
                                "w-2 transition-all duration-500 rounded-t-sm",
                                isOut ? "h-1 bg-rose-500/20" : 
                                isLow ? "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.4)]" : 
                                "bg-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.2)]",
                                isLow ? "h-3" : stock > 10 ? "h-6" : "h-4"
                            )}
                        />
                        <span className={cn(
                            "text-[7px] font-black",
                            isOut ? "text-white/10" : "text-white/40"
                        )}>
                            {size}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
