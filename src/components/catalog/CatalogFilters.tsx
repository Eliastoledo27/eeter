'use client';

import { Search, Filter } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCatalog } from '@/hooks/useCatalog';
import { Input } from '@/components/ui/input';

export function CatalogFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { categories } = useCatalog(); // Get dynamic categories
  
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'Todos';

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  const handleCategoryChange = (cat: string) => {
    const params = new URLSearchParams(searchParams);
    if (cat && cat !== 'Todos') {
      params.set('category', cat);
    } else {
      params.delete('category');
    }
    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input 
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar productos..." 
          className="pl-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>
      
      <div className="relative w-full md:w-[200px]">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <select 
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-md border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none shadow-sm transition-all"
        >
          {categories.map(c => (
            <option key={c} value={c} className="bg-white text-gray-900">
              {c}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
