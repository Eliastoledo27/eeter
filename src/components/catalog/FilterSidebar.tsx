'use client';

import { RotateCcw } from 'lucide-react';

interface FilterSidebarProps {
    categories: string[];
    activeCategory: string;
    onCategoryChange: (category: string) => void;
    priceRange: [number, number];
    onPriceChange: (range: [number, number]) => void;
    selectedSizes: string[];
    onSizesChange: (sizes: string[]) => void;
    sortBy: string;
    onSortChange: (sort: string) => void;
    onReset: () => void;
}

export function FilterSidebar({
    categories,
    activeCategory,
    onCategoryChange,
    priceRange,
    onPriceChange,
    selectedSizes,
    onSizesChange,
    sortBy,
    onSortChange,
    onReset
}: FilterSidebarProps) {
    const sizes = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];

    const toggleSize = (size: string) => {
        const newSizes = selectedSizes.includes(size)
            ? selectedSizes.filter(s => s !== size)
            : [...selectedSizes, size];
        onSizesChange(newSizes);
    };

    const hasFilters = activeCategory !== 'Todos' || selectedSizes.length > 0 || priceRange[0] > 0 || priceRange[1] < 1000000;

    return (
        <aside className="w-full space-y-6 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">Filtros</h2>
                {hasFilters && (
                    <button
                        onClick={onReset}
                        className="text-[10px] font-semibold text-[#00E5FF] hover:text-white transition-colors flex items-center gap-1.5"
                    >
                        <RotateCcw size={10} />
                        Reset
                    </button>
                )}
            </div>

            {/* Categories */}
            <div className="space-y-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Categoría</span>
                <div className="flex flex-col gap-1">
                    <button
                        onClick={() => onCategoryChange('Todos')}
                        className={`text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                            activeCategory === 'Todos'
                                ? 'bg-white text-black'
                                : 'text-white/40 hover:bg-white/[0.04] hover:text-white/70'
                        }`}
                    >
                        Todos
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => onCategoryChange(category)}
                            className={`text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                                activeCategory === category
                                    ? 'bg-[#00E5FF] text-black'
                                    : 'text-white/40 hover:bg-white/[0.04] hover:text-white/70'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Precio</span>
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-white/20">$</span>
                        <input
                            type="number"
                            placeholder="Min"
                            value={priceRange[0] || ''}
                            onChange={(e) => onPriceChange([Math.max(0, Number(e.target.value)), priceRange[1]])}
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg py-2.5 pl-7 pr-2 text-xs font-semibold text-white focus:outline-none focus:border-[#00E5FF]/40 transition-all placeholder:text-white/15"
                        />
                    </div>
                    <span className="text-white/15 text-xs">—</span>
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-white/20">$</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={priceRange[1] === 1000000 ? '' : priceRange[1]}
                            onChange={(e) => onPriceChange([priceRange[0], e.target.value ? Number(e.target.value) : 1000000])}
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg py-2.5 pl-7 pr-2 text-xs font-semibold text-white focus:outline-none focus:border-[#00E5FF]/40 transition-all placeholder:text-white/15"
                        />
                    </div>
                </div>
            </div>

            {/* Sizes */}
            <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Talle</span>
                    {selectedSizes.length > 0 && (
                        <button onClick={() => onSizesChange([])} className="text-[9px] font-semibold text-[#00E5FF]">Clear</button>
                    )}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                    {sizes.map((size) => (
                        <button
                            key={size}
                            onClick={() => toggleSize(size)}
                            className={`h-9 rounded-lg text-xs font-semibold transition-all ${
                                selectedSizes.includes(size)
                                    ? 'bg-[#00E5FF] text-black shadow-[0_2px_10px_rgba(0,229,255,0.25)]'
                                    : 'bg-white/[0.03] border border-white/[0.06] text-white/35 hover:text-white/60 hover:border-white/15'
                            }`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sort */}
            <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Ordenar</span>
                <div className="flex flex-col gap-1">
                    {[
                        { label: 'Más Recientes', value: 'newest' },
                        { label: 'Menor Precio', value: 'price-asc' },
                        { label: 'Mayor Precio', value: 'price-desc' }
                    ].map((option) => (
                        <button
                            key={option.value}
                            onClick={() => onSortChange(option.value)}
                            className={`text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                                sortBy === option.value
                                    ? 'text-[#00E5FF] bg-[#00E5FF]/[0.06]'
                                    : 'text-white/35 hover:bg-white/[0.04] hover:text-white/60'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
        </aside>
    );
}
