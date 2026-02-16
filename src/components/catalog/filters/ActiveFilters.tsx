'use client';

import { X } from 'lucide-react';
import { FilterState } from '@/hooks/useCatalogFilters';

interface ActiveFiltersProps {
    filters: FilterState;
    setFilter: (key: keyof FilterState, value: any) => void;
    resetFilters: () => void;
}

export function ActiveFilters({ filters, setFilter, resetFilters }: ActiveFiltersProps) {
    const chips: { label: string; onRemove: () => void }[] = [];

    filters.categories.forEach(cat => {
        chips.push({
            label: cat,
            onRemove: () => setFilter('categories', filters.categories.filter(c => c !== cat))
        });
    });

    filters.brands.forEach(brand => {
        chips.push({
            label: brand,
            onRemove: () => setFilter('brands', filters.brands.filter(b => b !== brand))
        });
    });

    filters.sizes.forEach(size => {
        chips.push({
            label: `Talle ${size}`,
            onRemove: () => setFilter('sizes', filters.sizes.filter(s => s !== size))
        });
    });

    if (chips.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-2">
            {chips.map((chip, idx) => (
                <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ffd900]/10 border border-[#ffd900]/20 text-[#ffd900] text-xs font-semibold"
                >
                    {chip.label}
                    <button
                        onClick={chip.onRemove}
                        className="hover:bg-[#ffd900]/20 rounded-full p-0.5 transition-colors"
                    >
                        <X size={12} />
                    </button>
                </span>
            ))}

            <button
                onClick={resetFilters}
                className="text-xs text-gray-500 hover:text-white font-medium transition-colors px-2"
            >
                Limpiar todo
            </button>
        </div>
    );
}
