'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowUpDown,
    CircleDollarSign,
    RotateCcw,
    Ruler,
    SlidersHorizontal,
    Sparkles,
    Tags,
    ChevronRight,
    ArrowRight,
    TrendingUp,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface FilterSidebarProps {
    categories: string[];
    activeCategory: string;
    onCategoryChange: (category: string) => void;
    occasions: string[];
    activeOccasion: string;
    onOccasionChange: (occasion: string) => void;
    priceRange: [number, number];
    onPriceChange: (range: [number, number]) => void;
    selectedSizes: string[];
    onSizesChange: (sizes: string[]) => void;
    sortBy: string;
    onSortChange: (sort: string) => void;
    onReset: () => void;
    brands: string[];
    activeBrand: string;
    onBrandChange: (brand: string) => void;
}

const sizes = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];

const sectionVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
};

function FilterBlock({
    icon: Icon,
    title,
    children,
    badge,
}: {
    icon: LucideIcon;
    title: string;
    children: ReactNode;
    badge?: string | number;
}) {
    return (
        <motion.section
            variants={sectionVariants}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl transition-all duration-500 hover:border-[#00E5FF]/30 hover:bg-white/[0.03]"
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#00E5FF]/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-all duration-500 group-hover:border-[#00E5FF]/40 group-hover:bg-[#00E5FF]/10 group-hover:shadow-[0_0_20px_rgba(0,229,255,0.15)]">
                        <Icon size={16} className="text-white/60 transition-colors duration-500 group-hover:text-[#00E5FF]" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 transition-colors group-hover:text-white">{title}</span>
                </div>
                {badge && (
                    <span className="rounded-full border border-[#00E5FF]/30 bg-[#00E5FF]/10 px-2.5 py-1 text-[9px] font-black tracking-widest text-[#00E5FF]">
                        {badge}
                    </span>
                )}
            </div>
            <div className="space-y-3">{children}</div>
        </motion.section>
    );
}

export function FilterSidebar({
    categories,
    activeCategory,
    onCategoryChange,
    occasions,
    activeOccasion,
    onOccasionChange,
    priceRange,
    onPriceChange,
    selectedSizes,
    onSizesChange,
    sortBy,
    onSortChange,
    onReset,
    brands,
    activeBrand,
    onBrandChange,
}: FilterSidebarProps) {
    void occasions;
    void activeOccasion;
    void onOccasionChange;
    void onPriceChange;

    const toggleSize = (size: string) => {
        const nextSizes = selectedSizes.includes(size) ? selectedSizes.filter((s) => s !== size) : [...selectedSizes, size];
        onSizesChange(nextSizes);
    };

    const hasFilters =
        activeCategory !== 'Todos' ||
        activeBrand !== 'Todas' ||
        selectedSizes.length > 0 ||
        priceRange[0] > 0 ||
        priceRange[1] < 1000000;

    const sortOptions = [
        { label: 'Mas vendidos', value: 'popular', hint: 'POP' },
        { label: 'Menor precio', value: 'price_asc', hint: 'LOW' },
        { label: 'Mayor precio', value: 'price_desc', hint: 'TOP' },
        { label: 'Lo nuevo', value: 'news', hint: 'NEW' },
        { label: 'Ranking aura', value: 'aura', hint: 'AURA' },
    ];

    return (
        <motion.aside
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="relative w-full space-y-6 px-1 pb-20"
        >
            <motion.div
                variants={sectionVariants}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#050505] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
            >
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#00E5FF]/10 blur-[60px]" />
                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 shadow-[0_0_20px_rgba(0,229,255,0.15)]">
                            <SlidersHorizontal size={20} />
                        </div>
                        <h2 className="text-base font-black uppercase tracking-[0.2em] text-white">Filtros</h2>
                    </div>
                    {hasFilters && (
                        <button
                            onClick={onReset}
                            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] transition-all hover:border-[#00E5FF]/50 hover:bg-[#00E5FF]/10 hover:text-[#00E5FF] active:scale-95 text-white/50"
                            title="Resetear filtros"
                        >
                            <RotateCcw size={16} />
                        </button>
                    )}
                </div>
            </motion.div>

            <FilterBlock icon={Tags} title="Categorias">
                <div className="grid gap-2">
                    {['Todos', ...categories].map((category) => {
                        const isActive = activeCategory === category;
                        return (
                            <button
                                key={category}
                                onClick={() => onCategoryChange(category)}
                                className={`group flex w-full items-center justify-between rounded-2xl border px-5 py-3.5 text-left transition-all duration-300 ${
                                    isActive ? 'border-[#00E5FF]/40 bg-[#00E5FF]/10 text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.05)]' : 'border-white/5 bg-white/[0.02] text-white/50 hover:border-white/20 hover:text-white'
                                }`}
                            >
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{category}</span>
                                <ChevronRight size={16} className={`transition-all duration-300 ${isActive ? 'rotate-90 text-[#00E5FF]' : 'opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-40'}`} />
                            </button>
                        );
                    })}
                </div>
            </FilterBlock>

            <FilterBlock icon={Sparkles} title="Marcas" badge={activeBrand !== 'Todas' ? 1 : undefined}>
                <div className="flex flex-wrap gap-2.5">
                    {['Todas', ...brands].map((brand) => {
                        const isSelected = activeBrand === brand;
                        return (
                            <button
                                key={brand}
                                onClick={() => onBrandChange(brand)}
                                className={`rounded-xl border px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.16em] transition-all duration-300 ${
                                    isSelected
                                        ? 'border-[#00E5FF]/40 bg-[#00E5FF]/10 text-[#00E5FF] shadow-[0_5px_15px_rgba(0,229,255,0.1)]'
                                        : 'border-white/5 bg-white/[0.02] text-white/50 hover:border-white/20 hover:text-white'
                                }`}
                            >
                                {brand}
                            </button>
                        );
                    })}
                </div>
            </FilterBlock>

            <FilterBlock icon={CircleDollarSign} title="Rango de precios">
                <div className="px-3 pb-3 pt-5">
                    <div className="relative h-1.5 w-full rounded-full bg-white/10">
                        <div className="absolute left-[10%] right-[58%] h-full rounded-full bg-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.4)]" />
                        <div className="absolute left-[10%] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-[3px] border-[#00E5FF] bg-black cursor-pointer hover:scale-110 transition-transform" />
                        <div className="absolute left-[42%] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-[3px] border-[#00E5FF] bg-black cursor-pointer hover:scale-110 transition-transform" />
                    </div>
                </div>
            </FilterBlock>

            <FilterBlock icon={Ruler} title="Talles">
                <div className="grid grid-cols-4 gap-2">
                    {sizes.map((size) => {
                        const isActive = selectedSizes.includes(size);
                        return (
                            <button
                                key={size}
                                onClick={() => toggleSize(size)}
                                className={`h-11 rounded-xl border text-[10px] font-black transition-all duration-300 ${
                                    isActive ? 'border-[#00E5FF] bg-[#00E5FF] text-black shadow-[0_0_15px_rgba(0,229,255,0.3)]' : 'border-white/5 bg-white/[0.02] text-white/50 hover:border-white/20 hover:text-white'
                                }`}
                            >
                                {size}
                            </button>
                        );
                    })}
                </div>
            </FilterBlock>

            <FilterBlock icon={ArrowUpDown} title="Ordenar">
                <div className="space-y-2">
                    {sortOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => onSortChange(option.value)}
                            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 transition-all duration-300 ${
                                sortBy === option.value
                                    ? 'border-[#00E5FF]/40 bg-[#00E5FF]/10 text-[#00E5FF]'
                                    : 'border-white/5 bg-white/[0.02] text-white/50 hover:border-white/20 hover:text-white'
                            }`}
                        >
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">{option.label}</span>
                            <span className={`rounded-md px-2 py-1 text-[8px] font-black tracking-widest transition-colors ${
                                sortBy === option.value ? 'bg-[#00E5FF]/20 text-[#00E5FF]' : 'bg-white/5 text-white/30'
                            }`}>{option.hint}</span>
                        </button>
                    ))}
                </div>
            </FilterBlock>
            
            <FilterBlock icon={TrendingUp} title="Envío & Logística">
                <div className="space-y-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                    <div className="flex items-start gap-3">
                        <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                            Envíos a todo el país vía Correo Argentino / Andreani.
                        </p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                            Retiro GRATIS en nuestro depósito de Mar del Plata.
                        </p>
                    </div>
                </div>
            </FilterBlock>

            <FilterBlock icon={Sparkles} title="Garantía Éter">
                <div className="space-y-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                    <div className="flex items-start gap-3">
                        <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C6FF00] shadow-[0_0_8px_rgba(198,255,0,0.6)]" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                            Cambios por talle garantizados dentro de las 48hs.
                        </p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C6FF00] shadow-[0_0_8px_rgba(198,255,0,0.6)]" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                            Autenticidad comprobada en cada par despachado.
                        </p>
                    </div>
                </div>
            </FilterBlock>

            <FilterBlock icon={Tags} title="Venta Mayorista">
                <div className="rounded-2xl border border-[#00E5FF]/20 bg-[#00E5FF]/5 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white mb-2">Precios Especiales</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 leading-relaxed">
                        Si sos revendedor o queres comprar por curva, consulta nuestros beneficios exclusivos para el canal mayorista.
                    </p>
                </div>
            </FilterBlock>


            <motion.div
                variants={sectionVariants}
                className="group relative overflow-hidden rounded-3xl border border-dashed border-white/20 bg-white/[0.02] p-6 backdrop-blur-xl transition-all duration-500 hover:border-[#00E5FF]/40 hover:bg-[#00E5FF]/5"
            >
                <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-[#00E5FF]/5 blur-[40px] transition-all duration-500 group-hover:bg-[#00E5FF]/20" />
                <h3 className="mb-2 relative z-10 text-[13px] font-black uppercase tracking-widest text-white">No encontras tu modelo?</h3>
                <p className="mb-6 relative z-10 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                    Pedilo y lo conseguimos para vos.
                </p>
                <button className="relative z-10 flex h-12 w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 text-[10px] font-black uppercase tracking-[0.2em] text-black transition-all hover:bg-[#00E5FF] hover:shadow-[0_10px_20px_rgba(0,229,255,0.2)]">
                    Solicitar pedido <ArrowRight size={16} />
                </button>
            </motion.div>
        </motion.aside>
    );
}
