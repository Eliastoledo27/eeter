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
    const [expandedSections, setExpandedSections] = useState<string[]>(['categories', 'price', 'sizes', 'sort']);

    const sizes = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];

    const toggleSection = (section: string) => {
        setExpandedSections(prev =>
            prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
        );
    };

    const toggleSize = (size: string) => {
        if (selectedSizes.includes(size)) {
            onSizesChange(selectedSizes.filter(s => s !== size));
        } else {
            onSizesChange([...selectedSizes, size]);
        }
    };

    return (
        <aside className="w-full space-y-10">
            {/* Categories */}
            <div className="space-y-4">
                <button
                    onClick={() => toggleSection('categories')}
                    className="flex items-center justify-between w-full group"
                >
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-700 group-hover:text-[#CA8A04] transition-colors">Categorías</span>
                    <ChevronDown size={14} className={`text-gray-800 transition-transform duration-500 ${expandedSections.includes('categories') ? '' : '-rotate-90'}`} />
                </button>

                <AnimatePresence>
                    {expandedSections.includes('categories') && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-1 overflow-hidden"
                        >
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => onCategoryChange(category)}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-bold transition-all duration-300 ${activeCategory === category
                                            ? 'text-[#CA8A04] bg-[#CA8A04]/5'
                                            : 'text-gray-600 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {category.toUpperCase()}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Price Range */}
            <div className="space-y-4">
                <button
                    onClick={() => toggleSection('price')}
                    className="flex items-center justify-between w-full group"
                >
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-700 group-hover:text-[#CA8A04] transition-colors">Rango de Precio</span>
                    <ChevronDown size={14} className={`text-gray-800 transition-transform duration-500 ${expandedSections.includes('price') ? '' : '-rotate-90'}`} />
                </button>

                <AnimatePresence>
                    {expandedSections.includes('price') && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-2 overflow-hidden"
                        >
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] text-gray-700">$</span>
                                        <input
                                            type="number"
                                            placeholder="MIN"
                                            value={priceRange[0] || ''}
                                            onChange={(e) => onPriceChange([Number(e.target.value), priceRange[1]])}
                                            className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-2 pl-7 pr-3 text-[10px] font-mono focus:outline-none focus:border-[#CA8A04]/30 transition-colors uppercase placeholder:text-gray-800"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] text-gray-700">$</span>
                                        <input
                                            type="number"
                                            placeholder="MAX"
                                            value={priceRange[1] || ''}
                                            onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value)])}
                                            className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-2 pl-7 pr-3 text-[10px] font-mono focus:outline-none focus:border-[#CA8A04]/30 transition-colors uppercase placeholder:text-gray-800"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Sizes */}
            <div className="space-y-4">
                <button
                    onClick={() => toggleSection('sizes')}
                    className="flex items-center justify-between w-full group"
                >
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-700 group-hover:text-[#CA8A04] transition-colors">Talles</span>
                    <ChevronDown size={14} className={`text-gray-800 transition-transform duration-500 ${expandedSections.includes('sizes') ? '' : '-rotate-90'}`} />
                </button>

                <AnimatePresence>
                    {expandedSections.includes('sizes') && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-2 overflow-hidden"
                        >
                            <div className="grid grid-cols-4 gap-1.5">
                                {sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => toggleSize(size)}
                                        className={`h-9 rounded-lg text-[9px] font-mono font-bold transition-all duration-300 border ${selectedSizes.includes(size)
                                                ? 'bg-[#CA8A04] text-black border-[#CA8A04]'
                                                : 'bg-white/[0.02] border-white/5 text-gray-700 hover:border-white/20 hover:text-white'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Sort */}
            <div className="space-y-4">
                <button
                    onClick={() => toggleSection('sort')}
                    className="flex items-center justify-between w-full group"
                >
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-700 group-hover:text-[#CA8A04] transition-colors">Ordenar</span>
                    <ChevronDown size={14} className={`text-gray-800 transition-transform duration-500 ${expandedSections.includes('sort') ? '' : '-rotate-90'}`} />
                </button>

                <AnimatePresence>
                    {expandedSections.includes('sort') && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-1 overflow-hidden"
                        >
                            {[
                                { label: 'Más Recientes', value: 'newest' },
                                { label: 'Precio: Menor', value: 'price-asc' },
                                { label: 'Precio: Mayor', value: 'price-desc' }
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => onSortChange(option.value)}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-[9px] font-bold transition-all duration-300 ${sortBy === option.value
                                            ? 'text-white bg-white/5'
                                            : 'text-gray-600 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {option.label.toUpperCase()}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Reset Button (Sutil) */}
            <div className="pt-6 border-t border-white/5">
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-gray-700 hover:text-[#CA8A04] transition-colors group"
                >
                    <RotateCcw size={12} className="group-hover:rotate-[-45deg] transition-transform" />
                    Resetear Archivo
                </button>
            </div>
        </aside>
    );
}
