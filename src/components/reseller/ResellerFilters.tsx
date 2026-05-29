'use client';

import { Check, ChevronDown, Ruler, Search, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Props {
    search: string;
    setSearch: (value: string) => void;
    category: string;
    setCategory: (value: string) => void;
    categories: string[];
    stockFilter: 'all' | 'available' | 'low';
    setStockFilter: (value: 'all' | 'available' | 'low') => void;
    sortBy: 'name' | 'price_asc' | 'price_desc' | 'stock';
    setSortBy: (value: 'name' | 'price_asc' | 'price_desc' | 'stock') => void;
    sizeFilter: string;
    setSizeFilter: (value: string) => void;
    allSizes: string[];
    sizeStockMap: Record<string, number>;
    resultCount: number;
}

function naturalSizeSort(a: string, b: string): number {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    if (!Number.isNaN(numA) && !Number.isNaN(numB)) return numA - numB;

    const letterOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '2XL', '3XL'];
    const idxA = letterOrder.indexOf(a.toUpperCase());
    const idxB = letterOrder.indexOf(b.toUpperCase());
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
}

export function ResellerFilters({
    search,
    setSearch,
    category,
    setCategory,
    categories,
    stockFilter,
    setStockFilter,
    sortBy,
    setSortBy,
    sizeFilter,
    setSizeFilter,
    allSizes,
    sizeStockMap,
    resultCount,
}: Props) {
    const [showAllFilters, setShowAllFilters] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const sortRef = useRef<HTMLDivElement>(null);
    const sortedSizes = [...allSizes].sort(naturalSizeSort);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
                setShowSortDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
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
        { id: 'price_asc', label: 'Menor precio' },
        { id: 'price_desc', label: 'Mayor precio' },
        { id: 'stock', label: 'Mayor stock' },
    ] as const;

    const currentSortLabel = sortOptions.find((option) => option.id === sortBy)?.label || 'Ordenar';
    const uniqueCategories = ['Todos', ...categories].filter((value, index, array) => array.indexOf(value) === index);

    return (
        <div className="sticky top-0 z-40 -mx-3 max-w-[100vw] overflow-x-hidden rounded-b-[1.15rem] border-b border-white/[0.06] bg-[#070707]/[0.97] px-3 shadow-[0_18px_45px_rgba(0,0,0,0.34)] backdrop-blur-2xl sm:-mx-5 sm:px-5 md:-mx-10 md:max-w-none md:px-10">
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_42px_56px] items-center gap-1.5 pb-2.5 pt-2.5 sm:flex sm:gap-3 sm:pt-5">
                <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/25 sm:left-4" size={15} />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Buscar modelo, marca o categoria..."
                        className="h-10 w-full rounded-xl border border-white/[0.06] bg-white/[0.04] pl-9 pr-8 text-[11px] font-bold text-white outline-none transition-all duration-300 placeholder:text-white/25 focus:border-[#00E5FF]/40 focus:bg-white/[0.06] min-[380px]:text-[12px] sm:h-12 sm:pl-11 sm:text-[13px]"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 transition-colors hover:text-white/70">
                            <X size={14} />
                        </button>
                    )}
                </div>

                <button
                    onClick={() => setShowAllFilters((value) => !value)}
                    className={cn(
                        'relative flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border px-3 text-[10px] font-black uppercase tracking-widest transition-all duration-300 sm:h-12 sm:px-4',
                        showAllFilters
                            ? 'border-[#00E5FF]/30 bg-[#00E5FF]/10 text-[#00E5FF]'
                            : 'border-white/[0.06] bg-white/[0.04] text-white/45 hover:border-white/15 hover:text-white/65'
                    )}
                >
                    <SlidersHorizontal size={14} />
                    <span className="hidden sm:inline">Filtros</span>
                    {activeFilterCount > 0 && (
                        <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#00E5FF] text-[8px] font-black text-black shadow-[0_0_8px_#00E5FF]">
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                <div className="relative shrink-0" ref={sortRef}>
                    <button
                        onClick={() => setShowSortDropdown(!showSortDropdown)}
                        className="flex h-10 w-full min-w-0 items-center justify-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.04] px-2 text-[9px] font-black uppercase tracking-[0.08em] text-white/50 outline-none transition-all hover:border-white/15 sm:h-12 sm:w-auto sm:justify-start sm:gap-2 sm:px-4 sm:text-[10px] sm:tracking-widest"
                    >
                        <span className="max-w-[34px] truncate sm:max-w-none">{currentSortLabel}</span>
                        <ChevronDown size={12} className={cn('text-white/25 transition-transform duration-300', showSortDropdown && 'rotate-180')} />
                    </button>

                    <AnimatePresence>
                        {showSortDropdown && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                className="absolute right-0 top-full z-50 mt-2 w-48 max-w-[calc(100vw-24px)] overflow-hidden rounded-xl border border-white/[0.08] bg-[#121212] p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl"
                            >
                                {sortOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => {
                                            setSortBy(option.id);
                                            setShowSortDropdown(false);
                                        }}
                                        className={cn(
                                            'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all',
                                            sortBy === option.id ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'text-white/45 hover:bg-white/[0.04] hover:text-white'
                                        )}
                                    >
                                        {option.label}
                                        {sortBy === option.id && <Check size={12} />}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="hidden shrink-0 items-center gap-2 text-white/25 lg:flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{resultCount}</span>
                </div>
            </div>

            <div className="pb-2.5 sm:pb-4">
                <div className="mb-2 flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-white/35">
                        <Ruler size={12} />
                        <span className="text-[9px] font-black uppercase tracking-[0.15em]">Talle</span>
                    </div>
                    {sizeFilter !== 'all' && (
                        <button onClick={() => setSizeFilter('all')} className="flex items-center gap-1 text-[9px] font-bold text-[#00E5FF]/65 transition-colors hover:text-[#00E5FF]">
                            <X size={10} />
                            Limpiar
                        </button>
                    )}
                </div>
                <div className="-mx-3 flex max-w-[100vw] snap-x gap-1.5 overflow-x-auto px-3 pb-1 [scrollbar-width:none] sm:mx-0 sm:max-w-none sm:flex-wrap sm:gap-2 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
                    <button
                        onClick={() => setSizeFilter('all')}
                        className={cn(
                            'relative min-h-9 snap-start whitespace-nowrap rounded-xl border px-4 text-[10px] font-black uppercase tracking-wider transition-all duration-300 sm:min-h-10 sm:px-5 sm:text-[11px]',
                            sizeFilter === 'all'
                                ? 'border-[#00E5FF] bg-[#00E5FF] text-black shadow-[0_0_20px_rgba(0,229,255,0.3)]'
                                : 'border-white/[0.06] bg-white/[0.04] text-white/40 hover:border-white/15 hover:text-white/65'
                        )}
                    >
                        Todos
                    </button>

                    {sortedSizes.map((size) => {
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
                                    'relative flex min-h-9 min-w-[43px] snap-start items-center justify-center rounded-xl border px-3.5 text-center text-[11px] font-black transition-all duration-300 sm:min-h-10 sm:min-w-[48px] sm:px-4 sm:text-[12px]',
                                    isActive
                                        ? 'z-10 scale-[1.03] border-[#00E5FF] bg-[#00E5FF] text-black shadow-[0_0_20px_rgba(0,229,255,0.3)]'
                                        : isOutOfStock
                                          ? 'cursor-not-allowed border-white/[0.03] bg-white/[0.02] text-white/10 line-through'
                                          : 'border-white/[0.06] bg-white/[0.04] text-white/55 hover:border-[#00E5FF]/40 hover:bg-[#00E5FF]/[0.05] hover:text-white/85',
                                    isLong && 'px-6'
                                )}
                            >
                                <span className="relative z-10">{size}</span>
                                {isActive && (
                                    <span className="absolute -right-1.5 -top-1.5 z-20 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-[#00E5FF] bg-[#0a0a0a] px-1 text-[8px] font-black text-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                                        {stockCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className={cn('overflow-hidden transition-all duration-500 ease-out', showAllFilters ? 'max-h-[260px] overflow-y-auto pb-4 opacity-100 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden' : 'max-h-0 pb-0 opacity-0')}>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="mr-1 text-[9px] font-black uppercase tracking-[0.15em] text-white/25">Cat.</span>
                        {uniqueCategories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={cn(
                                    'rounded-lg border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all duration-300',
                                    category === cat
                                        ? 'border-white bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.1)]'
                                        : 'border-white/[0.06] bg-white/[0.04] text-white/35 hover:border-white/15 hover:text-white/55'
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="hidden h-6 w-px bg-white/[0.06] sm:block" />

                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="mr-1 text-[9px] font-black uppercase tracking-[0.15em] text-white/25">Stock</span>
                        {([
                            ['all', 'Todo'],
                            ['available', 'Disponible'],
                            ['low', 'Ultimas u.'],
                        ] as const).map(([value, label]) => (
                            <button
                                key={value}
                                onClick={() => setStockFilter(value)}
                                className={cn(
                                    'rounded-lg border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all duration-300',
                                    stockFilter === value
                                        ? 'border-[#C6FF00] bg-[#C6FF00] text-black shadow-[0_0_12px_rgba(198,255,0,0.15)]'
                                        : 'border-white/[0.06] bg-white/[0.04] text-white/35 hover:border-white/15 hover:text-white/55'
                                )}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {activeFilterCount > 0 && (
                        <button onClick={clearAll} className="flex items-center gap-1.5 rounded-lg border border-red-400/10 bg-red-400/[0.04] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-red-400/65 transition-all duration-300 hover:border-red-400/30 hover:text-red-400">
                            <X size={10} />
                            Limpiar todo
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
