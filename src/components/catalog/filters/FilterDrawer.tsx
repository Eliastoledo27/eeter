'use client';

import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FilterState } from '@/hooks/useCatalogFilters';
import { PriceRangeSlider } from './PriceRangeSlider';

interface FilterDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    filters: FilterState;
    setFilter: (key: keyof FilterState, value: any) => void;
    stats: {
        brands: Map<string, number>;
        categories: Map<string, number>;
        sizes: Map<string, number>;
        priceBounds: [number, number];
    };
    totalCount: number;
}

export function FilterDrawer({
    isOpen,
    onClose,
    filters,
    setFilter,
    stats,
    totalCount,
}: FilterDrawerProps) {
    const categories = Array.from(stats.categories.keys());
    const brands = Array.from(stats.brands.keys());
    const sizes = Array.from(stats.sizes.keys()).sort((a, b) => Number(a) - Number(b));

    const toggleArrayItem = (key: 'categories' | 'brands' | 'sizes', item: string) => {
        const current = filters[key];
        const newItems = current.includes(item)
            ? current.filter(i => i !== item)
            : [...current, item];
        setFilter(key, newItems);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    'fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300',
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div
                className={cn(
                    'fixed inset-y-0 right-0 z-[70] w-full max-w-sm transition-transform duration-300 ease-in-out transform flex flex-col',
                    'bg-[#111]/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl shadow-black/50',
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                    <h2 className="text-lg font-heading font-bold text-white tracking-tight">Filtros</h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-gray-500 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Price */}
                    <section>
                        <h3 className="text-xs font-bold text-[#ffd900] uppercase tracking-[0.15em] mb-4">Precio</h3>
                        <PriceRangeSlider
                            min={stats.priceBounds[0]}
                            max={stats.priceBounds[1]}
                            value={filters.priceRange}
                            onValueChange={(val) => setFilter('priceRange', val)}
                        />
                    </section>

                    {/* Categories */}
                    <section>
                        <h3 className="text-xs font-bold text-[#ffd900] uppercase tracking-[0.15em] mb-4">Categoría</h3>
                        <div className="space-y-1">
                            {categories.map(cat => (
                                <label
                                    key={cat}
                                    className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2.5 -mx-2 rounded-xl transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            'w-5 h-5 rounded border flex items-center justify-center transition-all',
                                            filters.categories.includes(cat)
                                                ? 'bg-[#ffd900] border-[#ffd900] text-black'
                                                : 'border-white/20 group-hover:border-white/40'
                                        )}>
                                            {filters.categories.includes(cat) && <Check size={12} />}
                                        </div>
                                        <span className="text-sm text-gray-300 font-medium group-hover:text-white">{cat}</span>
                                    </div>
                                    <span className="text-xs text-gray-600 font-mono">{stats.categories.get(cat)}</span>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={filters.categories.includes(cat)}
                                        onChange={() => toggleArrayItem('categories', cat)}
                                    />
                                </label>
                            ))}
                        </div>
                    </section>

                    {/* Sizes */}
                    <section>
                        <h3 className="text-xs font-bold text-[#ffd900] uppercase tracking-[0.15em] mb-4">Talle</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {sizes.map(size => (
                                <button
                                    key={size}
                                    onClick={() => toggleArrayItem('sizes', size)}
                                    className={cn(
                                        'h-10 rounded-xl text-sm font-bold border transition-all',
                                        filters.sizes.includes(size)
                                            ? 'bg-[#ffd900] text-black border-[#ffd900] shadow-[0_0_15px_rgba(255,217,0,0.2)]'
                                            : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20 hover:text-white'
                                    )}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Brands (if any) */}
                    {brands.length > 0 && (
                        <section>
                            <h3 className="text-xs font-bold text-[#ffd900] uppercase tracking-[0.15em] mb-4">Marca</h3>
                            <div className="space-y-1">
                                {brands.map(brand => (
                                    <label
                                        key={brand}
                                        className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2.5 -mx-2 rounded-xl transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                'w-5 h-5 rounded border flex items-center justify-center transition-all',
                                                filters.brands.includes(brand)
                                                    ? 'bg-[#ffd900] border-[#ffd900] text-black'
                                                    : 'border-white/20 group-hover:border-white/40'
                                            )}>
                                                {filters.brands.includes(brand) && <Check size={12} />}
                                            </div>
                                            <span className="text-sm text-gray-300 font-medium group-hover:text-white">{brand}</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={filters.brands.includes(brand)}
                                            onChange={() => toggleArrayItem('brands', brand)}
                                        />
                                    </label>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-black/40 backdrop-blur-sm space-y-3">
                    <button
                        onClick={onClose}
                        className="w-full py-3.5 bg-[#ffd900] text-black font-bold text-sm tracking-wider uppercase rounded-xl shadow-lg shadow-[#ffd900]/10 hover:bg-[#ffe033] hover:shadow-[#ffd900]/20 transition-all active:scale-[0.98]"
                    >
                        Ver {totalCount} Resultados
                    </button>
                </div>
            </div>
        </>
    );
}
