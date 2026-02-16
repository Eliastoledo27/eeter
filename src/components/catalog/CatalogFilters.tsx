'use client';

import { cn } from '@/lib/utils';
import { List, LayoutGrid } from 'lucide-react';

interface CatalogFiltersProps {
  categories: string[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  totalCount: number;
}

export function CatalogFilters({
  categories,
  selectedCategory,
  onCategorySelect,
  viewMode,
  onViewModeChange,
  totalCount,
}: CatalogFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 flex-1">
        <button
          onClick={() => onCategorySelect(null)}
          className={cn(
            'shrink-0 px-5 py-2.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all duration-300 border',
            !selectedCategory
              ? 'bg-[#ffd900] text-black border-[#ffd900] shadow-[0_0_20px_rgba(255,217,0,0.2)]'
              : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'
          )}
        >
          Todos ({totalCount})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() =>
              onCategorySelect(selectedCategory === cat ? null : cat)
            }
            className={cn(
              'shrink-0 px-5 py-2.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all duration-300 border',
              selectedCategory === cat
                ? 'bg-[#ffd900] text-black border-[#ffd900] shadow-[0_0_20px_rgba(255,217,0,0.2)]'
                : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* View Mode Toggle */}
      <div className="hidden sm:flex items-center gap-1 bg-white/5 rounded-xl border border-white/10 p-1">
        <button
          onClick={() => onViewModeChange('grid')}
          className={cn(
            'p-2 rounded-lg transition-all duration-200',
            viewMode === 'grid'
              ? 'bg-[#ffd900] text-black'
              : 'text-gray-500 hover:text-white'
          )}
          title="Vista grilla"
        >
          <LayoutGrid size={16} />
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          className={cn(
            'p-2 rounded-lg transition-all duration-200',
            viewMode === 'list'
              ? 'bg-[#ffd900] text-black'
              : 'text-gray-500 hover:text-white'
          )}
          title="Vista lista"
        >
          <List size={16} />
        </button>
      </div>
    </div>
  );
}
