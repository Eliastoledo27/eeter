'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getProducts, ProductType } from '@/app/actions/products';
import { ProductCard } from './ProductCard';
import { ProductTable } from './ProductTable';
import { ProductForm } from './ProductForm';
import { BulkImportModal } from './BulkImportModal';
import { BulkImageUploadModal } from './BulkImageUploadModal';
import { BulkEditToolbar } from './BulkEditToolbar';
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
    <div className="space-y-8 pb-20 relative min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-3">
            Gestión de <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">Catálogo</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-xl font-medium">
            Administra tu inventario de forma visual e intuitiva.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
              {visibleProducts.length} resultados
            </span>
            {isAdmin && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                {stats.activeCount} activos
              </span>
            )}
            {isAdmin && stats.inactiveCount > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                {stats.inactiveCount} inactivos
              </span>
            )}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
              >
                <X size={12} /> Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 max-w-4xl">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Productos</span>
            <span className="text-2xl font-black text-slate-900">{stats.totalProducts}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Bajo Stock</span>
            <span className={`text-2xl font-black ${stats.lowStock > 0 ? 'text-amber-600' : 'text-emerald-500'}`}>
              {stats.lowStock}
            </span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Sin Stock</span>
            <span className={`text-2xl font-black ${stats.outOfStock > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              {stats.outOfStock}
            </span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Valor Inventario</span>
            <span className="text-2xl font-black text-slate-900">${stats.totalValue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {isAdmin && (
          <>
            <button
              onClick={() => { setEditingProduct(undefined); setShowForm(true); }}
              className="flex-1 md:flex-none px-6 py-3.5 rounded-2xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Nuevo Producto
            </button>
            <button
              onClick={() => setShowImageUploadModal(true)}
              className="px-6 py-3.5 rounded-2xl font-bold text-sm text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <ImageIcon size={18} /> Carga Masiva
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="px-6 py-3.5 rounded-2xl font-bold text-sm text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <FileSpreadsheet size={18} /> Importar CSV
            </button>
            <button
              onClick={handleExportView}
              className="px-6 py-3.5 rounded-2xl font-bold text-sm text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <ArrowUpDown size={18} /> Exportar vista
            </button>
            <button
              onClick={() => setShowAISettingsModal(true)}
              className="px-3 py-3.5 rounded-2xl font-bold text-sm text-purple-600 bg-purple-50 border border-purple-100 hover:bg-purple-100 transition-all flex items-center justify-center gap-2"
              title="Configuración de IA"
            >
              <Sparkles size={18} />
            </button>
            <button
              onClick={handleInitializeSizes}
              className="px-3 py-3.5 rounded-2xl font-bold text-sm text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
              title="Inicializar Talles (Migración)"
            >
              <Ruler size={18} />
            </button>
          </>
        )}
      </div>

      {/* Filters & View Toggle */}
      <div className="sticky top-4 z-30 bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50/50 border-none rounded-xl py-3 pl-12 pr-10 text-base text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
              />
              {search.trim() && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="relative min-w-[190px] w-full md:w-auto">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full appearance-none bg-slate-50/50 border-none rounded-xl py-3 pl-10 pr-8 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-orange-100 outline-none cursor-pointer"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(cat => (
                  cat !== 'all' && <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="relative min-w-[190px] w-full md:w-auto">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full appearance-none bg-slate-50/50 border-none rounded-xl py-3 pl-10 pr-8 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-orange-100 outline-none cursor-pointer"
              >
                <option value="newest">Más recientes</option>
                <option value="name_asc">Nombre (A-Z)</option>
                <option value="name_desc">Nombre (Z-A)</option>
                <option value="price_asc">Precio (menor)</option>
                <option value="price_desc">Precio (mayor)</option>
                <option value="stock_desc">Stock (mayor)</option>
                <option value="stock_asc">Stock (menor)</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List size={20} />
              </button>
            </div>

            <button
              onClick={() => setShowAdvancedFilters((prev) => !prev)}
              className={`px-4 py-2 text-sm font-bold rounded-xl flex items-center gap-2 transition-colors ${showAdvancedFilters ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600 hover:text-orange-600'}`}
            >
              <SlidersHorizontal size={16} /> Filtros
            </button>

            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-sm font-bold border border-orange-100 animate-pulse">
                <span>{selectedIds.size} seleccionados</span>
              </div>
            )}

            {visibleProducts.length > 0 && (
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
              >
                {selectedIds.size === visibleProducts.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
              </button>
            )}
          </div>

          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="relative">
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value as typeof stockFilter)}
                  className="w-full appearance-none bg-slate-50/50 border-none rounded-xl py-3 px-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-orange-100 outline-none cursor-pointer"
                >
                  <option value="all">Stock: Todos</option>
                  <option value="out">Stock: Sin stock</option>
                  <option value="low">Stock: Bajo</option>
                  <option value="healthy">Stock: Saludable</option>
                </select>
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  disabled={!isAdmin}
                  className="w-full appearance-none bg-slate-50/50 border-none rounded-xl py-3 px-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-orange-100 outline-none cursor-pointer disabled:opacity-60"
                >
                  <option value="active">Estado: Activos</option>
                  <option value="inactive">Estado: Inactivos</option>
                  <option value="all">Estado: Todos</option>
                </select>
              </div>

              <input
                type="number"
                min={1}
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value) || 1)}
                className="w-full bg-slate-50/50 border-none rounded-xl py-3 px-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-orange-100 outline-none"
                placeholder="Umbral bajo stock"
              />

              <input
                type="number"
                min={0}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-slate-50/50 border-none rounded-xl py-3 px-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-orange-100 outline-none"
                placeholder="Precio min"
              />

              <input
                type="number"
                min={0}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-slate-50/50 border-none rounded-xl py-3 px-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-orange-100 outline-none"
                placeholder="Precio max"
              />
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-50">
          <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
          <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">Cargando inventario...</p>
        </div>
      ) : visibleProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-orange-100 border border-orange-50">
            <PackageOpen className="text-orange-400" size={48} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">No se encontraron productos</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            Intenta ajustar tu búsqueda o crea un nuevo producto para comenzar.
          </p>
          {isAdmin && (
            <button
              onClick={() => setShowForm(true)}
              className="text-orange-600 hover:text-orange-700 font-bold text-sm uppercase tracking-wider hover:underline"
            >
              Crear producto ahora
            </button>
          )}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="mt-4 text-slate-600 hover:text-orange-600 font-bold text-sm uppercase tracking-wider"
            >
              Limpiar filtros y reintentar
            </button>
          )}
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode='popLayout'>
                {visibleProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl"
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
        />
      )}
    </div>
  );
};
