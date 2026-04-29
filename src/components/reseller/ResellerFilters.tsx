'use client';

import { Search, SlidersHorizontal, Ruler, X, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    search: string; setSearch: (v: string) => void;
    category: string; setCategory: (v: string) => void;
    categories: string[];
    stockFilter: 'all' | 'available' | 'low'; setStockFilter: (v: 'all' | 'available' | 'low') => void;
    sortBy: 'name' | 'price_asc' | 'price_desc' | 'stock'; setSortBy: (v: 'name' | 'price_asc' | 'price_desc' | 'stock') => void;
    sizeFilter: string; setSizeFilter: (v: string) => void;
    allSizes: string[];
    sizeStockMap: Record<string, number>;
    resultCount: number;
}

function naturalSizeSort(a: string, b: string): number {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    const letterOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '2XL', '3XL'];
    const idxA = letterOrder.indexOf(a.toUpperCase());
    const idxB = letterOrder.indexOf(b.toUpperCase());
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
}

export function ResellerFilters({
    search, setSearch,
    category, setCategory,
    categories,
    stockFilter, setStockFilter,
    sortBy, setSortBy,
    sizeFilter, setSizeFilter,
    allSizes,
    sizeStockMap,
    resultCount
}: Props) {
    const [showAllFilters, setShowAllFilters] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const sortRef = useRef<HTMLDivElement>(null);
    const sortedSizes = [...allSizes].sort(naturalSizeSort);

    // Close sort dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
                setShowSortDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const activeFilterCount = [
        category !== 'Todos' ? 1 : 0,
        stockFilter !== 'all' ? 1 : 0,
        sizeFilter !== 'all' ? 1 : 0,
    ].reduce((a, b) => a + b, 0);

    const clearAll = () => {
        setSearch('');
        setCategory('Todos');
        setStockFilter('all');
        setSizeFilter('all');
        setSortBy('name');
    };

    const sortOptions = [
        { id: 'name', label: 'A-Z' },
        { id: 'price_asc', label: 'Menor Precio' },
        { id: 'price_desc', label: 'Mayor Precio' },
        { id: 'stock', label: 'Mayor Stock' },
    ] as const;

    const currentSortLabel = sortOptions.find(o => o.id === sortBy)?.label || 'Ordenar';

    return (
        <div className="sticky top-0 z-40 -mx-5 md:-mx-10 px-5 md:px-10 bg-[#0a0a0a]/90 backdrop-blur-2xl border-b border-white/[0.06]">

            {/* ═══════ ROW 1: Search + Quick Actions ═══════ */}
            <div className="flex items-center gap-3 pt-5 pb-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" size={16} />
                    <input
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar modelo, marca o categoría..."
                        className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl py-3 pl-11 pr-10 text-[13px] font-medium text-white outline-none focus:border-[#00E5FF]/40 focus:bg-white/[0.06] transition-all duration-300 placeholder:text-white/20"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors">
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Toggle extra filters */}
                <button
                    onClick={() => setShowAllFilters(v => !v)}
                    className={cn(
                        "relative flex items-center gap-2 px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all duration-300 shrink-0",
                        showAllFilters
                            ? "bg-[#00E5FF]/10 border-[#00E5FF]/30 text-[#00E5FF]"
                            : "bg-white/[0.04] border-white/[0.06] text-white/40 hover:border-white/15 hover:text-white/60"
                    )}
                >
                    <SlidersHorizontal size={14} />
                    <span className="hidden sm:inline">Filtros</span>
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#00E5FF] text-black rounded-full text-[8px] font-black flex items-center justify-center shadow-[0_0_8px_#00E5FF]">
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                {/* Custom Sort Dropdown */}
                <div className="relative shrink-0" ref={sortRef}>
                    <button 
                        onClick={() => setShowSortDropdown(!showSortDropdown)}
                        className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/40 outline-none hover:border-white/15 transition-all"
                    >
                        <span>{currentSortLabel}</span>
                        <ChevronDown size={12} className={cn("text-white/20 transition-transform duration-300", showSortDropdown && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                        {showSortDropdown && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                className="absolute right-0 top-full mt-2 w-48 bg-[#121212] border border-white/[0.08] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden p-1.5 backdrop-blur-xl z-50"
                            >
                                {sortOptions.map(opt => (
                                    <button 
                                        key={opt.id}
                                        onClick={() => { setSortBy(opt.id); setShowSortDropdown(false); }}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                            sortBy === opt.id 
                                                ? "bg-[#00E5FF]/10 text-[#00E5FF]" 
                                                : "text-white/40 hover:bg-white/[0.04] hover:text-white"
                                        )}
                                    >
                                        {opt.label}
                                        {sortBy === opt.id && <Check size={12} />}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Result Count */}
                <div className="hidden lg:flex items-center gap-2 text-white/20 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{resultCount}</span>
                </div>
            </div>

            {/* ═══════ ROW 2: SIZE SELECTOR ═══════ */}
            <div className="pb-4">
                <div className="flex items-center gap-3 mb-2.5">
                    <div className="flex items-center gap-1.5 text-white/30">
                        <Ruler size={12} />
                        <span className="text-[9px] font-black uppercase tracking-[0.15em]">Talle</span>
                    </div>
                    {sizeFilter !== 'all' && (
                        <button
                            onClick={() => setSizeFilter('all')}
                            className="flex items-center gap-1 text-[9px] font-bold text-[#00E5FF]/60 hover:text-[#00E5FF] transition-colors"
                        >
                            <X size={10} />
                            Limpiar
                        </button>
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSizeFilter('all')}
                        className={cn(
                            "relative px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 border",
                            sizeFilter === 'all'
                                ? "bg-[#00E5FF] text-black border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.3)]"
                                : "bg-white/[0.04] text-white/35 border-white/[0.06] hover:border-white/15 hover:text-white/60"
                        )}
                    >
                        Todos
                    </button>

                    {sortedSizes.map(size => {
                        const stockCount = sizeStockMap[size] || 0;
                        const isActive = sizeFilter === size;
                        const isOutOfStock = stockCount === 0;
                        const isLong = size.length > 3;

                        return (
                            <button
                                key={size}
                                onClick={() => setSizeFilter(isActive ? 'all' : size)}
                                disabled={isOutOfStock}
                                className={cn(
                                    "relative group px-4 py-2.5 rounded-xl text-[12px] font-black transition-all duration-300 border min-w-[48px] text-center flex items-center justify-center",
                                    isActive
                                        ? "bg-[#00E5FF] text-black border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.3)] scale-[1.05] z-10"
                                        : isOutOfStock
                                            ? "bg-white/[0.02] text-white/10 border-white/[0.03] cursor-not-allowed line-through"
                                            : "bg-white/[0.04] text-white/50 border-white/[0.06] hover:border-[#00E5FF]/40 hover:text-white/80 hover:bg-[#00E5FF]/[0.05]",
                                    isLong && "px-6"
                                )}
                            >
                                <span className="relative z-10">{size}</span>
                                
                                {!isOutOfStock && !isActive && (
                                    <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-1 bg-white/10 rounded-full text-[7px] font-bold text-white/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/5">
                                        {stockCount}
                                    </span>
                                )}
                                
                                {isActive && (
                                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-[#0a0a0a] rounded-full text-[8px] font-black text-[#00E5FF] flex items-center justify-center border border-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.2)] z-20">
                                        {stockCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ═══════ ROW 3: Expandable Category + Stock Filters ═══════ */}
            <div className={cn(
                "overflow-hidden transition-all duration-500 ease-out",
                showAllFilters ? "max-h-[200px] pb-4 opacity-100" : "max-h-0 pb-0 opacity-0"
            )}>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/20 mr-1">Cat.</span>
                        {['Todos', ...categories].filter((v, i, a) => a.indexOf(v) === i).map(cat => (
                            <button key={cat} onClick={() => setCategory(cat)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 border",
                                    category === cat
                                        ? "bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.1)]"
                                        : "bg-white/[0.04] text-white/30 border-white/[0.06] hover:border-white/15 hover:text-white/50"
                                )}
                            >{cat}</button>
                        ))}
                    </div>

                    <div className="w-px h-6 bg-white/[0.06]" />

                    <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/20 mr-1">Stock</span>
                        {([['all', 'Todo'], ['available', 'Disponible'], ['low', 'Últimas U.']] as const).map(([val, label]) => (
                            <button key={val} onClick={() => setStockFilter(val)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 border",
                                    stockFilter === val
                                        ? "bg-[#C6FF00] text-black border-[#C6FF00] shadow-[0_0_12px_rgba(198,255,0,0.15)]"
                                        : "bg-white/[0.04] text-white/30 border-white/[0.06] hover:border-white/15 hover:text-white/50"
                                )}
                            >{label}</button>
                        ))}
                    </div>

                    {activeFilterCount > 0 && (
                        <>
                            <div className="w-px h-6 bg-white/[0.06]" />
                            <button onClick={clearAll} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-red-400/60 hover:text-red-400 border border-red-400/10 hover:border-red-400/30 bg-red-400/[0.04] transition-all duration-300">
                                <X size={10} />
                                Limpiar todo
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
