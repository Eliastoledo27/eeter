'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter, useSearchParams, type ReadonlyURLSearchParams } from 'next/navigation';
import { X, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ProductType } from '@/app/actions/products';
import { CatalogFilters, type CatalogFilterState } from '@/components/layout/CatalogFilters';
import { ProductGrid } from '@/components/home/ProductGrid';


const DEFAULT_FILTERS: CatalogFilterState = {
  query: '',
  category: 'Todos',
  brand: 'Todas',
  availability: 'all',
  minPrice: '',
  maxPrice: '',
  sort: 'relevance',
};

const PAGE_SIZE = 16;

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const getBrandFromName = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Eter';
  let candidate = parts[0];
  if (/^\d/.test(candidate) && parts[1]) {
    candidate = parts[1];
  }
  return candidate.replace(/[^a-zA-Z0-9&.-]/g, '') || 'Eter';
};

const getTotalStock = (stockBySize: Record<string, number>) =>
  Object.values(stockBySize || {}).reduce((sum, value) => sum + Number(value || 0), 0);

const parseFilters = (params: ReadonlyURLSearchParams): CatalogFilterState => {
  const availability = params.get('availability');
  const sort = params.get('sort');

  return {
    query: params.get('q') || '',
    category: params.get('category') || 'Todos',
    brand: params.get('brand') || 'Todas',
    availability: availability === 'in_stock' || availability === 'out_of_stock' ? availability : 'all',
    minPrice: params.get('min') || '',
    maxPrice: params.get('max') || '',
    sort: sort === 'price_asc' || sort === 'price_desc' || sort === 'newest' ? sort : 'relevance',
  };
};

const buildQueryString = (filters: CatalogFilterState) => {
  const params = new URLSearchParams();

  if (filters.query) params.set('q', filters.query);
  if (filters.category && filters.category !== 'Todos') params.set('category', filters.category);
  if (filters.brand && filters.brand !== 'Todas') params.set('brand', filters.brand);
  if (filters.availability !== 'all') params.set('availability', filters.availability);
  if (filters.minPrice) params.set('min', filters.minPrice);
  if (filters.maxPrice) params.set('max', filters.maxPrice);
  if (filters.sort !== 'relevance') params.set('sort', filters.sort);

  return params.toString();
};

export function CatalogView({ products }: { products: ProductType[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<CatalogFilterState>(() => parseFilters(searchParams));
  const [debouncedQuery, setDebouncedQuery] = useState(filters.query);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isPending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef(filters);
  const lastSyncedQueryRef = useRef(searchParams.toString());

  const categoryOptions = useMemo(() => {
    const unique = Array.from(
      new Set(
        products
          .map((product) => product.category)
          .filter((category): category is string => Boolean(category))
      )
    );
    return ['Todos', ...unique];
  }, [products]);

  const brandOptions = useMemo(() => {
    const unique = Array.from(new Set(products.map((product) => getBrandFromName(product.name))));
    return ['Todas', ...unique];
  }, [products]);

  const priceRange = useMemo(() => {
    const prices = products
      .map((product) => product.base_price)
      .filter((value) => Number.isFinite(value));
    if (prices.length === 0) {
      return { min: 0, max: 0 };
    }
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [products]);

  useEffect(() => {
    setFilters((prev) => {
      const nextCategory = categoryOptions.includes(prev.category) ? prev.category : 'Todos';
      const nextBrand = brandOptions.includes(prev.brand) ? prev.brand : 'Todas';

      if (nextCategory === prev.category && nextBrand === prev.brand) {
        return prev;
      }

      return {
        ...prev,
        category: nextCategory,
        brand: nextBrand,
      };
    });
  }, [categoryOptions, brandOptions]);

  const suggestionsPool = useMemo(() => {
    const names = products.map((product) => product.name).filter(Boolean);
    const categories = categoryOptions.filter((category) => category !== 'Todos');
    const brands = brandOptions.filter((brand) => brand !== 'Todas');
    return Array.from(new Set([...brands, ...categories, ...names]));
  }, [products, categoryOptions, brandOptions]);

  const suggestions = useMemo(() => {
    if (!filters.query || filters.query.length < 2) return [];
    const normalizedQuery = normalize(filters.query);
    return suggestionsPool
      .filter((item) => normalize(item).includes(normalizedQuery))
      .slice(0, 6);
  }, [filters.query, suggestionsPool]);

  const filteredProducts = useMemo(() => {
    const query = normalize(filters.query);
    const min = Number(filters.minPrice);
    const max = Number(filters.maxPrice);
    const hasMin = Number.isFinite(min) && filters.minPrice !== '';
    const hasMax = Number.isFinite(max) && filters.maxPrice !== '';

    const matches = products.filter((product) => {
      const brand = getBrandFromName(product.name);
      const totalStock = getTotalStock(product.stock_by_size || {});
      const isAvailable = Boolean(product.is_active) && totalStock > 0;

      const matchesQuery =
        !query ||
        normalize(product.name).includes(query) ||
        normalize(product.description || '').includes(query) ||
        normalize(brand).includes(query);

      const matchesCategory = filters.category === 'Todos' || product.category === filters.category;
      const matchesBrand = filters.brand === 'Todas' || brand === filters.brand;
      const matchesAvailability =
        filters.availability === 'all' ||
        (filters.availability === 'in_stock' ? isAvailable : !isAvailable);

      const matchesMin = !hasMin || product.base_price >= min;
      const matchesMax = !hasMax || product.base_price <= max;

      return matchesQuery && matchesCategory && matchesBrand && matchesAvailability && matchesMin && matchesMax;
    });

    const sorted = [...matches];
    if (filters.sort === 'price_asc') {
      sorted.sort((a, b) => a.base_price - b.base_price);
    } else if (filters.sort === 'price_desc') {
      sorted.sort((a, b) => b.base_price - a.base_price);
    } else if (filters.sort === 'newest') {
      sorted.sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA;
      });
    }

    return sorted;
  }, [products, filters]);

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount]
  );

  const hasMore = visibleCount < filteredProducts.length;

  const loadMore = useCallback(() => {
    setVisibleCount((current) => Math.min(current + PAGE_SIZE, filteredProducts.length));
  }, [filteredProducts.length]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters]);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(filters.query), 300);
    return () => clearTimeout(timeout);
  }, [filters.query]);

  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '240px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  useEffect(() => {
    const queryString = buildQueryString({ ...filters, query: debouncedQuery });
    if (queryString === lastSyncedQueryRef.current) return;

    lastSyncedQueryRef.current = queryString;
    startTransition(() => {
      router.replace(queryString ? `/catalog?${queryString}` : '/catalog', { scroll: false });
    });
  }, [filters, debouncedQuery, router]);

  useEffect(() => {
    const queryString = searchParams.toString();
    lastSyncedQueryRef.current = queryString;

    const nextFilters = parseFilters(searchParams);
    const current = buildQueryString(filtersRef.current);
    const next = buildQueryString(nextFilters);

    if (current !== next) {
      setFilters(nextFilters);
      setDebouncedQuery(nextFilters.query);
    }
  }, [searchParams]);

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const activeFilterChips = useMemo(() => {
    const chips: { label: string; onRemove: () => void }[] = [];

    if (filters.query) {
      chips.push({
        label: `Busqueda: ${filters.query}`,
        onRemove: () => setFilters((prev) => ({ ...prev, query: '' })),
      });
    }

    if (filters.category !== 'Todos') {
      chips.push({
        label: `Categoria: ${filters.category}`,
        onRemove: () => setFilters((prev) => ({ ...prev, category: 'Todos' })),
      });
    }

    if (filters.brand !== 'Todas') {
      chips.push({
        label: `Marca: ${filters.brand}`,
        onRemove: () => setFilters((prev) => ({ ...prev, brand: 'Todas' })),
      });
    }

    if (filters.availability !== 'all') {
      chips.push({
        label: filters.availability === 'in_stock' ? 'En stock' : 'Sin stock',
        onRemove: () => setFilters((prev) => ({ ...prev, availability: 'all' })),
      });
    }

    if (filters.minPrice || filters.maxPrice) {
      const label = `Precio: ${filters.minPrice || priceRange.min} - ${filters.maxPrice || priceRange.max}`;
      chips.push({
        label,
        onRemove: () => setFilters((prev) => ({ ...prev, minPrice: '', maxPrice: '' })),
      });
    }

    if (filters.sort !== 'relevance') {
      const label =
        filters.sort === 'price_asc'
          ? 'Precio: menor a mayor'
          : filters.sort === 'price_desc'
            ? 'Precio: mayor a menor'
            : 'Novedades';
      chips.push({
        label,
        onRemove: () => setFilters((prev) => ({ ...prev, sort: 'relevance' })),
      });
    }

    return chips;
  }, [filters, priceRange.min, priceRange.max]);

  return (
    <div className="relative min-h-screen bg-background font-body">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 pb-32">
        <div className="sticky top-24 z-30 py-4">
          <CatalogFilters
            filters={filters}
            categories={categoryOptions}
            brands={brandOptions}
            priceRange={priceRange}
            suggestions={suggestions}
            onChange={setFilters}
            onReset={handleReset}
          />
        </div>

        <div className="mt-8 flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/5 pb-6">
            <div className="flex items-center gap-3" aria-live="polite">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                    {i}
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900 leading-none">{filteredProducts.length}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Productos</span>
                </div>
                {isPending && <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-1">Sincronizando...</span>}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {activeFilterChips.length > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="group flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 hover:bg-rose-50 transition-all"
                >
                  <X size={14} className="group-hover:rotate-90 transition-transform" />
                  Limpiar Filtros
                </button>
              )}
            </div>
          </div>

          {activeFilterChips.length > 0 && (
            <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-500">
              {activeFilterChips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={chip.onRemove}
                  className="inline-flex items-center gap-3 rounded-2xl border border-white/80 bg-white/40 backdrop-blur-md px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 hover:border-amber-500/40 hover:text-amber-600 transition-all shadow-sm hover:shadow-md group"
                >
                  {chip.label}
                  <X size={14} className="text-slate-400 group-hover:text-amber-600" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12">
          {filteredProducts.length > 0 ? (
            <ProductGrid products={visibleProducts} />
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-[3rem] border-2 border-dashed border-black/5 bg-white/40 backdrop-blur-md p-20 text-center flex flex-col items-center"
            >
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-6">
                <Search size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">No encontramos resultados</h3>
              <p className="mt-2 text-slate-500 font-medium max-w-sm mx-auto">
                Probá ajustando los filtros o buscando con otros términos para encontrar lo que necesitás.
              </p>
              <button
                onClick={handleReset}
                className="mt-8 px-8 py-3.5 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-[0.25em] shadow-xl shadow-slate-900/10 hover:bg-black transition-all"
              >
                Ver todo el catálogo
              </button>
            </motion.div>
          )}
        </div>

        {hasMore && (
          <div className="mt-20 flex flex-col items-center gap-6" ref={sentinelRef}>
            <button
              type="button"
              onClick={loadMore}
              className="relative group overflow-hidden rounded-full bg-slate-900 px-10 py-5 text-xs font-black uppercase tracking-[0.35em] text-white shadow-[0_24px_50px_rgba(0,0,0,0.15)] hover:shadow-[0_24px_60px_rgba(0,0,0,0.25)] transition-all active:scale-95"
            >
              <span className="relative z-10">Cargar más Piezas</span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>
            <div className="flex flex-col items-center gap-2">
              <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-amber-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(visibleProducts.length / filteredProducts.length) * 100}%` }}
                />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                Visualizando {visibleProducts.length} de {filteredProducts.length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
