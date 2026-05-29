'use client';

import type { ReactNode } from 'react';
import { CircleDot, LayoutGrid, List, RotateCcw, Search, SlidersHorizontal, Sparkles, TrendingUp, PackageSearch } from 'lucide-react';
import { EterCard } from '@/components/eter/EterCard';
import { EterButton } from '@/components/eter/EterButton';
import { cn } from '@/lib/utils';
import type { StockStatus } from '@/lib/catalog-ui';

interface CatalogToolbarProps {
  activeCategory: string;
  activeBrand: string;
  stockStatus: StockStatus;
  resultCount: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onOpenAura: () => void;
  onReset: () => void;
  onOpenMobileFilters: () => void;
  showExperimentPanel?: boolean;
  experimentPanel?: ReactNode;
}

export function CatalogToolbar({
  activeCategory,
  activeBrand,
  stockStatus,
  resultCount,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onOpenAura,
  onReset,
  onOpenMobileFilters,
  showExperimentPanel = false,
  experimentPanel,
}: CatalogToolbarProps) {
  return (
    <EterCard className="mb-8 p-5 md:p-7">
      <div className="mb-5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <nav className="mb-2 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.22em] text-white/40">
            <span>ETER</span>
            <span className="text-white/20">/</span>
            <span>CATALOGO</span>
            <span className="text-white/20">/</span>
            <span className="text-[#00E0FF]">LIQUIDACION</span>
          </nav>
          <h1 className="text-3xl font-black uppercase tracking-normal text-white md:text-5xl">
            Catalogo <span className="text-tri-gradient">Liquidacion</span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="group relative min-w-0 flex-1 sm:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-[#00E0FF]" size={18} />
            <input
              type="text"
              placeholder="BUSCAR PRODUCTO..."
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              className="h-12 w-full rounded-md border border-white/15 bg-black/40 pl-11 pr-4 text-xs font-bold tracking-[0.14em] text-white placeholder:text-white/30 focus:border-[#00E0FF]/50 focus:outline-none sm:w-[280px]"
            />
          </div>
          <EterButton
            onClick={onOpenMobileFilters}
            tone="green"
            className="lg:hidden"
          >
            <SlidersHorizontal size={16} />
            Filtros
          </EterButton>
          <div className="hidden items-center rounded-md border border-white/15 bg-black/50 p-1 sm:flex">
            {(['grid', 'list'] as const).map((mode) => {
              const Icon = mode === 'grid' ? LayoutGrid : List;
              return (
                <button
                  key={mode}
                  onClick={() => onViewModeChange(mode)}
                  className={cn(
                    'rounded-md p-2.5 transition-all',
                    viewMode === mode ? 'bg-[#00E0FF] text-black' : 'text-white/40 hover:text-white'
                  )}
                  aria-label={mode === 'grid' ? 'Vista grilla' : 'Vista lista'}
                >
                  <Icon size={16} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-white/70">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#00E0FF]" />
          <span>{resultCount} modelos activos</span>
        </div>
        <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-white/70">
          <CircleDot size={14} className="text-[#39FF14]" />
          <span>Categoria: {activeCategory}</span>
        </div>
        {activeBrand !== 'Todas' && (
          <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-white/70">
            <TrendingUp size={14} className="text-[#A020F0]" />
            <span>Marca: {activeBrand}</span>
          </div>
        )}
        {stockStatus !== 'all' && (
          <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-white/70">
            <PackageSearch size={14} className="text-[#39FF14]" />
            <span>Stock: {stockStatus}</span>
          </div>
        )}
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenAura}
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#00E0FF] transition-all hover:brightness-125"
          >
            <Sparkles size={13} />
            Re-calibrar Aura
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/40 transition-colors hover:text-white"
          >
            <RotateCcw size={13} />
            Limpiar filtros
          </button>
        </div>
      </div>

      {showExperimentPanel && experimentPanel}
    </EterCard>
  );
}
