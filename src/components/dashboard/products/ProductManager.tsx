'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getProducts, ProductType } from '@/app/actions/products';
import { ProductCard } from './ProductCard';
import { ProductTable } from './ProductTable';
import { ProductForm } from './ProductForm';
import { BulkImportModal } from './BulkImportModal';
import { BulkImageUploadModal } from './BulkImageUploadModal';
import { BulkEditToolbar } from './BulkEditToolbar';
import { BulkRenameModal } from './BulkRenameModal';
import { BulkStockModal } from './BulkStockModal';
import { AISettingsModal } from './AISettingsModal';
import { initializeProductSizes } from '@/app/actions/migrations';
import {
  Plus, Search, Loader2, FileSpreadsheet, Image as ImageIcon,
  LayoutGrid, List, Filter, PackageOpen, Sparkles, ArrowUpDown, SlidersHorizontal, X, Ruler
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export const ProductManager = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [showAISettingsModal, setShowAISettingsModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductType | undefined>(undefined);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('active');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out' | 'healthy'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'stock_asc' | 'stock_desc'>('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Sync search with URL params
  const querySearch = searchParams.get('search');
  useEffect(() => {
    if (querySearch) {
      setSearch(querySearch);
    }
  }, [querySearch]);

  useEffect(() => {
    const storedView = window.localStorage.getItem('catalogViewMode');
    if (storedView === 'grid' || storedView === 'table') {
      setViewMode(storedView);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('catalogViewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const effectiveStatus = isAdmin ? statusFilter : 'active';
      const data = await getProducts(debouncedSearch, undefined, effectiveStatus);
      setProducts(data || []);
    } catch (err) {
      console.error('Fetch products error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, statusFilter, isAdmin]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (!isAdmin && statusFilter !== 'active') {
      setStatusFilter('active');
    }
  }, [isAdmin, statusFilter]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const currentIds = new Set(products.map((p) => p.id));
      return new Set([...prev].filter((id) => currentIds.has(id)));
    });
  }, [products]);

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === visibleProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visibleProducts.map(p => p.id)));
    }
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingProduct(undefined);
    fetchProducts();
  };

  const handleDelete = () => {
    fetchProducts();
  };

  const getTotalStock = useCallback((product: ProductType) => {
    return product.stock_by_size
      ? Object.values(product.stock_by_size).reduce((a, b) => Number(a) + Number(b), 0)
      : 0;
  }, []);

  // Derived state for stats and filtering
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }

    if (isAdmin && statusFilter !== 'all') {
      const shouldBeActive = statusFilter === 'active';
      filtered = filtered.filter((p) => p.is_active === shouldBeActive);
    }

    if (stockFilter !== 'all') {
      filtered = filtered.filter((p) => {
        const totalStock = getTotalStock(p);
        if (stockFilter === 'out') return totalStock === 0;
        if (stockFilter === 'low') return totalStock > 0 && totalStock <= lowStockThreshold;
        if (stockFilter === 'healthy') return totalStock > lowStockThreshold;
        return true;
      });
    }

    const min = minPrice ? Number(minPrice) : undefined;
    const max = maxPrice ? Number(maxPrice) : undefined;

    if (min !== undefined && !Number.isNaN(min)) {
      filtered = filtered.filter((p) => Number(p.base_price) >= min);
    }

    if (max !== undefined && !Number.isNaN(max)) {
      filtered = filtered.filter((p) => Number(p.base_price) <= max);
    }

    return filtered;
  }, [products, categoryFilter, statusFilter, stockFilter, minPrice, maxPrice, lowStockThreshold, isAdmin, getTotalStock]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];

    switch (sortBy) {
      case 'name_asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price_asc':
        sorted.sort((a, b) => Number(a.base_price) - Number(b.base_price));
        break;
      case 'price_desc':
        sorted.sort((a, b) => Number(b.base_price) - Number(a.base_price));
        break;
      case 'stock_asc':
        sorted.sort((a, b) => getTotalStock(a) - getTotalStock(b));
        break;
      case 'stock_desc':
        sorted.sort((a, b) => getTotalStock(b) - getTotalStock(a));
        break;
      default:
        sorted.sort((a, b) => {
          const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
          return bDate - aDate;
        });
        break;
    }

    return sorted;
  }, [filteredProducts, sortBy, getTotalStock]);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter((c): c is string => Boolean(c)));
    return ['all', ...Array.from(cats)];
  }, [products]);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const activeCount = products.filter((p) => p.is_active).length;
    const inactiveCount = totalProducts - activeCount;
    const outOfStock = products.filter((p) => getTotalStock(p) === 0).length;
    const lowStock = products.filter((p) => {
      const total = getTotalStock(p);
      return total > 0 && total <= lowStockThreshold;
    }).length;
    const totalValue = products.reduce((acc, p) => {
      const stock = getTotalStock(p);
      return acc + (Number(p.base_price) * stock);
    }, 0);
    return { totalProducts, lowStock, outOfStock, totalValue, activeCount, inactiveCount };
  }, [products, lowStockThreshold, getTotalStock]);

  const visibleProducts = sortedProducts;

  const handleInitializeSizes = async () => {
    const promise = initializeProductSizes();
    toast.promise(promise, {
      loading: 'Inicializando talles...',
      success: (data) => {
        fetchProducts();
        return `Se actualizaron ${data.count} productos con talles por defecto.`;
      },
      error: 'Error al inicializar talles'
    });
  };

  const hasActiveFilters =
    categoryFilter !== 'all' ||
    stockFilter !== 'all' ||
    (isAdmin && statusFilter !== 'active') ||
    minPrice !== '' ||
    maxPrice !== '' ||
    lowStockThreshold !== 5 ||
    sortBy !== 'newest' ||
    search.trim() !== '';

  const resetFilters = () => {
    setSearch('');
    setCategoryFilter('all');
    setStockFilter('all');
    setSortBy('newest');
    setMinPrice('');
    setMaxPrice('');
    setLowStockThreshold(5);
    if (isAdmin) {
      setStatusFilter('active');
    }
  };

  const handleExportView = useCallback(() => {
    if (visibleProducts.length === 0) return;

    const headers = ['ID', 'Nombre', 'Categoría', 'Precio', 'Stock', 'Estado', 'Descripción'];
    const csvContent = [
      headers.join(','),
      ...visibleProducts.map((p) => {
        const stock = getTotalStock(p);
        return [
          p.id,
          `"${p.name.replace(/"/g, '""')}"`,
          p.category || '',
          p.base_price,
          stock,
          p.is_active ? 'Activo' : 'Inactivo',
          `"${(p.description || '').replace(/"/g, '""')}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `catalogo_filtrado_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [visibleProducts, getTotalStock]);

  return (
    <div className="space-y-8 pb-20 relative min-h-screen bg-[#0A0A0A] text-white selection:bg-[#C88A04] selection:text-black rounded-[2rem] p-4 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 leading-none">
            GESTIÓN DE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C88A04] to-[#ECA413]">CATÁLOGO</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl font-light">
            Administra tu inventario con estética <span className="text-white font-medium">ÉTER Original</span>.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-6">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-white/10 bg-white/5 text-gray-400">
              {visibleProducts.length} resultados
            </span>
            {isAdmin && (
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-[#C88A04]/30 bg-[#C88A04]/5 text-[#C88A04]">
                {stats.activeCount} activos
              </span>
            )}
            {isAdmin && stats.inactiveCount > 0 && (
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-white/10 bg-white/5 text-gray-300">
                {stats.inactiveCount} inactivos
              </span>
            )}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#C88A04]/10 text-[#C88A04] hover:bg-[#C88A04]/20 transition-all border border-[#C88A04]/20"
              >
                <X size={12} /> Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 max-w-4xl">
          <div className="bg-[#111] p-5 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C88A04]/30 to-transparent" />
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 block">Total Productos</span>
            <span className="text-3xl font-black text-white">{stats.totalProducts}</span>
          </div>
          <div className="bg-[#111] p-5 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-full h-[1px] ${stats.lowStock > 0 ? 'bg-amber-500/30' : 'bg-emerald-500/30'}`} />
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 block">Bajo Stock</span>
            <span className={`text-3xl font-black ${stats.lowStock > 0 ? 'text-amber-500' : 'text-emerald-400'}`}>
              {stats.lowStock}
            </span>
          </div>
          <div className="bg-[#111] p-5 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-full h-[1px] ${stats.outOfStock > 0 ? 'bg-red-500/30' : 'bg-emerald-500/30'}`} />
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 block">Sin Stock</span>
            <span className={`text-3xl font-black ${stats.outOfStock > 0 ? 'text-red-500' : 'text-emerald-400'}`}>
              {stats.outOfStock}
            </span>
          </div>
          <div className="bg-[#111] p-5 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C88A04]/30 to-transparent" />
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 block">Valor Inventario</span>
            <span className="text-2xl font-black text-white">${stats.totalValue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {isAdmin && (
          <>
            <button
              onClick={() => { setEditingProduct(undefined); setShowForm(true); }}
              className="flex-1 md:flex-none px-8 py-4 rounded-2xl font-bold text-sm text-black bg-[#C88A04] hover:bg-[#ECA413] transition-all shadow-[0_0_30px_-5px_rgba(200,138,4,0.3)] flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              <Plus size={18} /> Nuevo Producto
            </button>
            <button
              onClick={() => setShowImageUploadModal(true)}
              className="px-6 py-4 rounded-2xl font-bold text-sm text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2 uppercase tracking-widest backdrop-blur-sm"
            >
              <ImageIcon size={18} /> Carga Masiva
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="px-6 py-4 rounded-2xl font-bold text-sm text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2 uppercase tracking-widest backdrop-blur-sm"
            >
              <FileSpreadsheet size={18} /> Importar CSV
            </button>
            <button
              onClick={handleExportView}
              className="px-6 py-4 rounded-2xl font-bold text-sm text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2 uppercase tracking-widest backdrop-blur-sm"
            >
              <ArrowUpDown size={18} /> Exportar
            </button>
            <button
              onClick={() => setShowStockModal(true)}
              disabled={selectedIds.size === 0}
              className={`px-6 py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 uppercase tracking-widest backdrop-blur-sm ${selectedIds.size > 0 ? 'text-[#C88A04] bg-[#C88A04]/10 border border-[#C88A04]/20 hover:bg-[#C88A04]/20' : 'text-gray-500 bg-white/5 border border-white/10 opacity-50 cursor-not-allowed'}`}
              title="Editar Stock Masivamente"
            >
              <Ruler size={18} /> Editar Stock
            </button>
            <button
              onClick={() => setShowAISettingsModal(true)}
              className="px-4 py-4 rounded-2xl font-bold text-sm text-[#C88A04] bg-[#C88A04]/10 border border-[#C88A04]/20 hover:bg-[#C88A04]/20 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
              title="Configuración de IA"
            >
              <Sparkles size={18} />
            </button>
            <button
              onClick={handleInitializeSizes}
              className="px-4 py-4 rounded-2xl font-bold text-sm text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
              title="Inicializar Talles (Migración)"
            >
              <Ruler size={18} />
            </button>
          </>
        )}
      </div>

      {/* Filters & View Toggle */}
      <div className="sticky top-4 z-30 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 shadow-2xl">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Buscar en el catálogo ÉTER..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-14 pr-12 text-base text-white placeholder:text-gray-600 focus:bg-white/10 focus:ring-2 focus:ring-[#C88A04]/20 outline-none transition-all"
              />
              {search.trim() && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="relative min-w-[200px] w-full md:w-auto">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full appearance-none bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-10 text-sm font-bold text-gray-300 focus:bg-white/10 outline-none cursor-pointer transition-all"
              >
                <option value="all" className="bg-[#111]">CATEGORÍAS</option>
                {categories.map(cat => (
                  cat !== 'all' && <option key={cat} value={cat} className="bg-[#111]">{cat.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="relative min-w-[200px] w-full md:w-auto">
              <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full appearance-none bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-10 text-sm font-bold text-gray-300 focus:bg-white/10 outline-none cursor-pointer transition-all"
              >
                <option value="newest" className="bg-[#111]">RECIENTES</option>
                <option value="name_asc" className="bg-[#111]">A - Z</option>
                <option value="name_desc" className="bg-[#111]">Z - A</option>
                <option value="price_asc" className="bg-[#111]">MENOR PRECIO</option>
                <option value="price_desc" className="bg-[#111]">MAYOR PRECIO</option>
                <option value="stock_desc" className="bg-[#111]">MAYOR STOCK</option>
                <option value="stock_asc" className="bg-[#111]">MENOR STOCK</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-white/5 border border-white/5 p-1 rounded-2xl backdrop-blur-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-[#C88A04] text-black shadow-lg shadow-[#C88A04]/20' : 'text-gray-500 hover:text-white'}`}
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'table' ? 'bg-[#C88A04] text-black shadow-lg shadow-[#C88A04]/20' : 'text-gray-500 hover:text-white'}`}
              >
                <List size={20} />
              </button>
            </div>

            <button
              onClick={() => setShowAdvancedFilters((prev) => !prev)}
              className={`p-4 rounded-2xl flex items-center gap-2 transition-all border ${showAdvancedFilters ? 'bg-[#C88A04]/20 border-[#C88A04]/40 text-[#C88A04]' : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'}`}
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-4 px-6 py-3 bg-[#C88A04]/10 border border-[#C88A04]/20 rounded-2xl text-xs font-black tracking-widest text-[#C88A04] uppercase">
              <div className="flex items-center gap-2 animate-pulse">
                <div className="w-2 h-2 bg-[#C88A04] rounded-full" />
                <span>{selectedIds.size} seleccionados</span>
              </div>
              <button
                onClick={handleSelectAll}
                className="ml-auto text-white hover:text-[#C88A04] transition-colors"
              >
                {selectedIds.size === visibleProducts.length ? 'DESELECCIONAR TODO' : 'SELECCIONAR TODO'}
              </button>
            </div>
          )}

          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2 animate-in fade-in slide-in-from-top-4 duration-300">
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as typeof stockFilter)}
                className="w-full appearance-none bg-white/5 border border-white/5 rounded-2xl py-4 px-5 text-sm font-bold text-gray-300 focus:bg-white/10 outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#111]">STOCK: TODOS</option>
                <option value="out" className="bg-[#111]">STOCK: SIN STOCK</option>
                <option value="low" className="bg-[#111]">STOCK: BAJO</option>
                <option value="healthy" className="bg-[#111]">STOCK: SALUDABLE</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                disabled={!isAdmin}
                className="w-full appearance-none bg-white/5 border border-white/5 rounded-2xl py-4 px-5 text-sm font-bold text-gray-300 focus:bg-white/10 outline-none cursor-pointer disabled:opacity-30"
              >
                <option value="active" className="bg-[#111]">ESTADO: ACTIVOS</option>
                <option value="inactive" className="bg-[#111]">ESTADO: INACTIVOS</option>
                <option value="all" className="bg-[#111]">ESTADO: TODOS</option>
              </select>

              <input
                type="number"
                min={1}
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value) || 1)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-5 text-sm font-bold text-white placeholder:text-gray-600 outline-none focus:bg-white/10 transition-all"
                placeholder="UMBRAL BAJO STOCK"
              />

              <input
                type="number"
                min={0}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-5 text-sm font-bold text-white placeholder:text-gray-600 outline-none focus:bg-white/10 transition-all"
                placeholder="PRECIO MÍN"
              />

              <input
                type="number"
                min={0}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-5 text-sm font-bold text-white placeholder:text-gray-600 outline-none focus:bg-white/10 transition-all"
                placeholder="PRECIO MÁX"
              />
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <Loader2 className="animate-spin text-[#C88A04] mb-6" size={60} />
          <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.5em] animate-pulse">Sincronizando Archivos ÉTER...</p>
        </div>
      ) : visibleProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.02]">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 shadow-2xl border border-white/5">
            <PackageOpen className="text-gray-600" size={48} />
          </div>
          <h3 className="text-3xl font-black text-white mb-4 tracking-tight uppercase">Vacío Total</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-10 font-light text-lg">
            No encontramos coincidencias en nuestros registros exclusivos.
          </p>
          {isAdmin && (
            <button
              onClick={() => setShowForm(true)}
              className="text-[#C88A04] hover:text-[#ECA413] font-black text-[12px] uppercase tracking-[0.3em] hover:scale-110 transition-transform"
            >
              Comenzar nueva edición
            </button>
          )}
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              <AnimatePresence mode='popLayout'>
                {visibleProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      delay: index * 0.05,
                      duration: 0.8,
                      ease: [0.19, 1, 0.22, 1]
                    }}
                  >
                    <ProductCard
                      product={product}
                      onDelete={isAdmin ? () => handleDelete() : undefined}
                      onEdit={isAdmin ? () => { setEditingProduct(product); setShowForm(true); } : undefined}
                      isSelected={selectedIds.has(product.id)}
                      onToggleSelect={() => handleToggleSelect(product.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <ProductTable
              products={visibleProducts}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onEdit={isAdmin ? (p) => { setEditingProduct(p); setShowForm(true); } : undefined}
              onDelete={isAdmin ? handleDelete : undefined}
            />
          )}
        </>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
              className="w-full max-w-5xl max-h-[95vh] overflow-y-auto bg-[#0A0A0A] rounded-[3rem] shadow-[0_0_100px_-20px_rgba(200,138,4,0.15)] border border-white/10"
            >
              <ProductForm
                product={editingProduct}
                onSuccess={handleSuccess}
                onCancel={() => { setShowForm(false); setEditingProduct(undefined); }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showImportModal && (
        <BulkImportModal
          onClose={() => setShowImportModal(false)}
          onSuccess={fetchProducts}
        />
      )}

      {showImageUploadModal && (
        <BulkImageUploadModal
          onClose={() => setShowImageUploadModal(false)}
          onSuccess={fetchProducts}
        />
      )}

      <AISettingsModal
        isOpen={showAISettingsModal}
        onClose={() => setShowAISettingsModal(false)}
      />

      {/* Bulk Edit Toolbar */}
      {selectedIds.size > 0 && isAdmin && (
        <BulkEditToolbar
          selectedIds={Array.from(selectedIds)}
          products={products}
          onClearSelection={() => setSelectedIds(new Set())}
          onSuccess={fetchProducts}
          onRename={() => setShowRenameModal(true)}
          onStockEdit={() => setShowStockModal(true)}
        />
      )}

      {showRenameModal && isAdmin && (
        <BulkRenameModal
          isOpen={showRenameModal}
          onClose={() => setShowRenameModal(false)}
          selectedProducts={visibleProducts.filter(p => selectedIds.has(p.id))}
          onSuccess={() => {
            fetchProducts();
            setSelectedIds(new Set());
          }}
        />
      )}

      {showStockModal && isAdmin && (
        <BulkStockModal
          isOpen={showStockModal}
          onClose={() => setShowStockModal(false)}
          selectedProducts={visibleProducts.filter(p => selectedIds.has(p.id))}
          onSuccess={() => {
            fetchProducts();
            setSelectedIds(new Set());
          }}
        />
      )}
    </div>
  );
};
