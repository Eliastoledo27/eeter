'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { useState } from 'react';

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
        <aside className="w-full space-y-12 pb-20">
            {/* Header / Reset */}
            <div className="flex flex-col gap-4 pb-8 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black uppercase tracking-widest text-white">Filtrar Por:</h2>
                    {hasFilters && (
                        <button
                            onClick={onReset}
                            className="text-xs font-bold text-[#C88A04] hover:text-white transition-colors flex items-center gap-2 bg-[#C88A04]/10 px-3 py-1.5 rounded-full"
                        >
                            <RotateCcw size={12} />
                            LIMPIAR TODO
                        </button>
                    )}
                </div>
                {!hasFilters && (
                    <p className="text-sm text-gray-500 font-medium italic">Selecciona opciones para refinar tu búsqueda.</p>
                )}
            </div>

            {/* Categories */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-[#C88A04] rounded-full" />
                    <span className="text-sm font-black uppercase tracking-widest text-gray-300">Colecciones</span>
                </div>

                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => onCategoryChange('Todos')}
                        className={`text-left px-5 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 border-2 ${activeCategory === 'Todos'
                            ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                            : 'text-gray-400 border-white/5 bg-white/5 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        VER TODO EL CATÁLOGO
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => onCategoryChange(category)}
                            className={`text-left px-5 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 border-2 ${activeCategory === category
                                ? 'bg-[#C88A04] text-black border-[#C88A04] shadow-[0_0_20px_rgba(200,138,4,0.2)]'
                                : 'text-gray-500 border-white/5 bg-white/5 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {category.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="space-y-6 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="w-2 h-2 bg-[#C88A04] rounded-full" />
                        <span className="text-sm font-black uppercase tracking-widest text-gray-300">Rango de Precio</span>
                    </div>
                </div>

                <div className="flex flex-col gap-4 pt-2">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                            <input
                                type="number"
                                placeholder="Mínimo"
                                value={priceRange[0] || ''}
                                onChange={(e) => onPriceChange([Math.max(0, Number(e.target.value)), priceRange[1]])}
                                className="w-full bg-[#111] border-2 border-white/10 rounded-xl py-3.5 pl-8 pr-4 text-base font-bold text-white focus:outline-none focus:border-[#C88A04] transition-colors placeholder:text-gray-700"
                            />
                        </div>
                        <div className="text-gray-600 font-bold">—</div>
                        <div className="relative flex-1">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                            <input
                                type="number"
                                placeholder="Máximo"
                                value={priceRange[1] === 1000000 ? '' : priceRange[1]}
                                onChange={(e) => onPriceChange([priceRange[0], e.target.value ? Number(e.target.value) : 1000000])}
                                className="w-full bg-[#111] border-2 border-white/10 rounded-xl py-3.5 pl-8 pr-4 text-base font-bold text-white focus:outline-none focus:border-[#C88A04] transition-colors placeholder:text-gray-700"
                            />
                        </div>
                    </div>
                    {(priceRange[0] > 0 || priceRange[1] < 1000000) && (
                        <button
                            onClick={() => onPriceChange([0, 1000000])}
                            className="text-xs text-[#C88A04] underline underline-offset-4 font-bold uppercase hover:text-white transition-colors text-center"
                        >
                            Restablecer límites de precio
                        </button>
                    )}
                </div>
            </div>

            {/* Sizes */}
            <div className="space-y-6 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="w-2 h-2 bg-[#C88A04] rounded-full" />
                        <span className="text-sm font-black uppercase tracking-widest text-gray-300">Talles Disponibles</span>
                    </div>
                    {selectedSizes.length > 0 && (
                        <button onClick={() => onSizesChange([])} className="text-xs text-[#C88A04] uppercase font-bold bg-[#C88A04]/10 px-3 py-1 rounded-lg">Borrar</button>
                    )}
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 gap-3 pt-2">
                    {sizes.map((size) => (
                        <button
                            key={size}
                            onClick={() => toggleSize(size)}
                            className={`h-16 lg:h-14 rounded-xl text-xl lg:text-lg font-black transition-all duration-300 border-2 flex items-center justify-center ${selectedSizes.includes(size)
                                ? 'bg-white text-black border-white shadow-[0_5px_15px_rgba(255,255,255,0.2)]'
                                : 'bg-[#111] border-white/10 text-white hover:border-[#C88A04]'
                                }`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest text-center">Puedes seleccionar varios talles</p>
            </div>

            {/* Sort */}
            <div className="space-y-6 pt-6 border-t border-white/10">
                <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-[#C88A04] rounded-full" />
                    <span className="text-sm font-black uppercase tracking-widest text-gray-300">Ordenar Por</span>
                </div>
                <div className="grid grid-cols-1 gap-2 pt-2">
                    {[
                        { label: 'LO MÁS NUEVO', value: 'newest' },
                        { label: 'PRECIO: MENOR A MAYOR', value: 'price-asc' },
                        { label: 'PRECIO: MAYOR A MENOR', value: 'price-desc' }
                    ].map((option) => (
                        <button
                            key={option.value}
                            onClick={() => onSortChange(option.value)}
                            className={`w-full text-left px-5 py-4 rounded-xl text-xs font-black transition-all duration-300 border-2 ${sortBy === option.value
                                ? 'text-white border-[#C88A04] bg-[#C88A04]/20'
                                : 'text-gray-500 border-white/5 bg-white/5 hover:border-white/20 hover:text-white'
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
