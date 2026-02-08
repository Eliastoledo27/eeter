'use client';

import { ChevronDown, Search, SlidersHorizontal, X, ArrowUpRight, Check } from 'lucide-react';
import { useId, useMemo, useState, useRef, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export type CatalogFilterState = {
    query: string;
    category: string;
    brand: string;
    availability: 'all' | 'in_stock' | 'out_of_stock';
    minPrice: string;
    maxPrice: string;
    sort: 'relevance' | 'price_asc' | 'price_desc' | 'newest';
};

interface CatalogFiltersProps {
    filters: CatalogFilterState;
    categories: string[];
    brands: string[];
    priceRange: { min: number; max: number };
    suggestions: string[];
    onChange: (next: CatalogFilterState) => void;
    onReset: () => void;
}

export function CatalogFilters({
    filters,
    categories,
    brands,
    priceRange,
    suggestions,
    onChange,
    onReset,
}: CatalogFiltersProps) {
    const searchId = useId();
    const listId = useId();
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Smart suggestions: Filter suggestions based on input
    const filteredSuggestions = useMemo(() => {
        if (!filters.query || filters.query.length < 2) return [];
        return suggestions
            .filter(s => s.toLowerCase().includes(filters.query.toLowerCase()))
            .slice(0, 5);
    }, [suggestions, filters.query]);

    const showSuggestions = isFocused && filteredSuggestions.length > 0;

    const handleUpdate = (partial: Partial<CatalogFilterState>) => {
        onChange({ ...filters, ...partial });
    };

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.category !== 'Todos') count++;
        if (filters.brand !== 'Todas') count++;
        if (filters.availability !== 'all') count++;
        if (filters.minPrice) count++;
        if (filters.maxPrice) count++;
        return count;
    }, [filters]);

    const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions) return;

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex((current) => Math.min(current + 1, filteredSuggestions.length - 1));
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((current) => Math.max(current - 1, 0));
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            if (activeIndex >= 0) {
                handleUpdate({ query: filteredSuggestions[activeIndex] });
                inputRef.current?.blur();
            } else {
                // Just submit current query
                inputRef.current?.blur();
            }
            setActiveIndex(-1);
            setIsFocused(false);
        }

        if (event.key === 'Escape') {
            setIsFocused(false);
        }
    };

    const availabilityOptions = [
        { value: 'all', label: 'Todos' },
        { value: 'in_stock', label: 'En stock' },
        { value: 'out_of_stock', label: 'Sin stock' },
    ];

    const sortOptions = [
        { value: 'relevance', label: 'Relevancia' },
        { value: 'newest', label: 'Novedades' },
        { value: 'price_asc', label: 'Precio: Menor' },
        { value: 'price_desc', label: 'Precio: Mayor' },
    ];

    return (
        <div className="w-full max-w-5xl mx-auto font-body">
            {/* Main Search Bar & Toggle */}
            <div className={cn(
                "relative z-30 flex flex-col md:flex-row items-center gap-3 p-2 bg-white/40 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_32px_80px_rgba(0,0,0,0.08)] border border-white/60 transition-all duration-500",
                isFocused ? "ring-[6px] ring-accent/5 border-accent/20" : "hover:border-black/5"
            )}>

                {/* Search Input */}
                <div className="relative flex-1 w-full">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/50">
                        <Search size={18} />
                    </div>
                    <input
                        ref={inputRef}
                        id={searchId}
                        value={filters.query}
                        onChange={(e) => {
                            handleUpdate({ query: e.target.value });
                            setActiveIndex(-1);
                        }}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                        onKeyDown={handleSearchKeyDown}
                        placeholder="Modelos, marcas o estilos premium..."
                        className="w-full h-14 pl-14 pr-12 bg-transparent border-none outline-none text-base text-foreground placeholder:text-muted-foreground/40 font-medium rounded-full"
                        autoComplete="off"
                        role="combobox"
                        aria-autocomplete="list"
                        aria-expanded={showSuggestions}
                        aria-controls={listId}
                    />
                    {filters.query && (
                        <button
                            onClick={() => handleUpdate({ query: '' })}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-black/5 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}

                    {/* Smart Autocomplete Dropdown */}
                    <AnimatePresence>
                        {showSuggestions && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full left-0 right-0 mt-4 bg-white/80 backdrop-blur-3xl rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.12)] border border-white/60 overflow-hidden py-4"
                            >
                                <div className="px-6 py-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">Sugerencias VIP</div>
                                {filteredSuggestions.map((suggestion, index) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => {
                                            handleUpdate({ query: suggestion });
                                            setIsFocused(false);
                                        }}
                                        className={cn(
                                            "w-full px-6 py-3.5 text-left text-sm font-medium flex items-center justify-between group transition-all",
                                            activeIndex === index ? "bg-accent/5 text-accent" : "text-foreground hover:bg-black/[0.02]"
                                        )}
                                    >
                                        <span className="flex items-center gap-3">
                                            <Search size={14} className={activeIndex === index ? "text-accent" : "text-muted-foreground/40"} />
                                            {suggestion}
                                        </span>
                                        <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 text-accent transition-all" />
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="h-10 w-px bg-black/[0.03] hidden md:block" />

                {/* Sort & Filter Toggles */}
                <div className="flex items-center gap-2 w-full md:w-auto px-2">
                    <div className="relative flex-1 md:flex-none">
                        <select
                            value={filters.sort}
                            onChange={(e) => handleUpdate({ sort: e.target.value as CatalogFilterState['sort'] })}
                            className="w-full md:w-44 h-12 pl-6 pr-12 appearance-none bg-black/[0.02] hover:bg-black/[0.04] border border-transparent rounded-full text-[11px] font-bold uppercase tracking-widest text-foreground outline-none cursor-pointer transition-all"
                        >
                            {sortOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label.toUpperCase()}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none" />
                    </div>

                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={cn(
                            "h-12 px-8 rounded-full flex items-center gap-3 font-bold text-[11px] uppercase tracking-[0.2em] transition-all duration-500 shadow-sm border",
                            isExpanded || activeFilterCount > 0
                                ? "bg-primary text-white border-primary shadow-xl shadow-primary/20"
                                : "bg-white/60 text-foreground border-white/80 hover:border-accent/30 hover:shadow-lg active:scale-95 cursor-pointer"
                        )}
                    >
                        <SlidersHorizontal size={16} />
                        <span className="hidden sm:inline">Filtrar</span>
                        {activeFilterCount > 0 && (
                            <span className="bg-accent text-white text-[9px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Expanded Filters Panel */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        transition={{ duration: 0.3, ease: "circOut" }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white/40 backdrop-blur-3xl rounded-[2.5rem] p-10 border border-white/60 shadow-[0_40px_100px_rgba(0,0,0,0.06)] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -z-10" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

                                {/* Categories */}
                                <div className="space-y-5">
                                    <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">Categoría</label>
                                    <div className="flex flex-wrap gap-2.5">
                                        {categories.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => handleUpdate({ category: cat })}
                                                className={cn(
                                                    "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all",
                                                    filters.category === cat
                                                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                                        : "bg-white/60 text-muted-foreground border-white/80 hover:border-accent/30"
                                                )}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Brands */}
                                <div className="space-y-5">
                                    <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">Marca de Lujo</label>
                                    <div className="relative">
                                        <select
                                            value={filters.brand}
                                            onChange={(e) => handleUpdate({ brand: e.target.value })}
                                            className="w-full p-4 bg-white/60 border border-white/80 rounded-2xl text-[11px] font-bold uppercase tracking-widest outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent/30 appearance-none transition-all"
                                        >
                                            {brands.map(brand => (
                                                <option key={brand} value={brand}>{brand.toUpperCase()}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Price Range */}
                                <div className="space-y-5">
                                    <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">Rango de Inversión</label>
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex-1">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 text-[10px] font-bold">$</span>
                                            <input
                                                type="number"
                                                value={filters.minPrice}
                                                onChange={(e) => handleUpdate({ minPrice: e.target.value })}
                                                placeholder={priceRange.min.toString()}
                                                className="w-full pl-8 pr-4 py-4 bg-white/60 border border-white/80 rounded-2xl text-[11px] font-bold outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent/30 transition-all placeholder:text-muted-foreground/20"
                                            />
                                        </div>
                                        <span className="text-muted-foreground/20 font-light">/</span>
                                        <div className="relative flex-1">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 text-[10px] font-bold">$</span>
                                            <input
                                                type="number"
                                                value={filters.maxPrice}
                                                onChange={(e) => handleUpdate({ maxPrice: e.target.value })}
                                                placeholder={priceRange.max.toString()}
                                                className="w-full pl-8 pr-4 py-4 bg-white/60 border border-white/80 rounded-2xl text-[11px] font-bold outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent/30 transition-all placeholder:text-muted-foreground/20"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Availability */}
                                <div className="space-y-5">
                                    <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">Disponibilidad</label>
                                    <div className="flex flex-col gap-3">
                                        {availabilityOptions.map(opt => (
                                            <label key={opt.value} className="flex items-center gap-4 cursor-pointer group">
                                                <div className={cn(
                                                    "w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-300",
                                                    filters.availability === opt.value
                                                        ? "bg-accent border-accent text-white shadow-lg shadow-accent/20 scale-110"
                                                        : "bg-white/60 border-white/80 group-hover:border-accent/40"
                                                )}>
                                                    {filters.availability === opt.value && <Check size={14} strokeWidth={3} />}
                                                </div>
                                                <input
                                                    type="radio"
                                                    name="availability"
                                                    value={opt.value}
                                                    checked={filters.availability === opt.value}
                                                    onChange={() => handleUpdate({ availability: opt.value as CatalogFilterState['availability'] })}
                                                    className="sr-only"
                                                />
                                                <span className="text-[11px] font-bold uppercase tracking-widest text-foreground/70 group-hover:text-foreground transition-colors">{opt.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Active Filters Badges */}
                            {activeFilterCount > 0 && (
                                <div className="mt-10 pt-8 border-t border-black/[0.03] flex flex-wrap items-center gap-3">
                                    <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.25em] mr-2">Configuración Actual:</span>

                                    {filters.category !== 'Todos' && (
                                        <Badge label={filters.category} onRemove={() => handleUpdate({ category: 'Todos' })} />
                                    )}
                                    {filters.brand !== 'Todas' && (
                                        <Badge label={filters.brand} onRemove={() => handleUpdate({ brand: 'Todas' })} />
                                    )}
                                    {filters.minPrice && (
                                        <Badge label={`Desde $${filters.minPrice}`} onRemove={() => handleUpdate({ minPrice: '' })} />
                                    )}
                                    {filters.maxPrice && (
                                        <Badge label={`Hasta $${filters.maxPrice}`} onRemove={() => handleUpdate({ maxPrice: '' })} />
                                    )}
                                    {filters.availability !== 'all' && (
                                        <Badge
                                            label={filters.availability === 'in_stock' ? 'En Stock' : 'Sin Stock'}
                                            onRemove={() => handleUpdate({ availability: 'all' })}
                                        />
                                    )}

                                    <button
                                        onClick={onReset}
                                        className="ml-auto text-[10px] font-bold text-accent uppercase tracking-widest hover:text-primary transition-all underline underline-offset-4"
                                    >
                                        Resetear Curaduría
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function Badge({ label, onRemove }: { label: string, onRemove: () => void }) {
    return (
        <span className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/60 backdrop-blur-md text-foreground rounded-full text-[9px] font-bold uppercase tracking-[0.15em] border border-white/80 shadow-sm hover:border-accent/30 transition-all group scale-95 opacity-90 hover:scale-100 hover:opacity-100">
            {label}
            <button onClick={onRemove} className="hover:text-rose-500 transition-colors p-0.5 ml-1">
                <X size={12} strokeWidth={3} />
            </button>
        </span>
    );
}
