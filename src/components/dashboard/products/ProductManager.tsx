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
import { AIDescriptionModal } from './AIDescriptionModal';
import { AISettingsModal } from './AISettingsModal';
import { initializeProductSizes } from '@/app/actions/migrations';
import { useSettingsStore } from '@/store/settings-store';
import {
  Plus, Search, Loader2, FileSpreadsheet, Image as ImageIcon,
  LayoutGrid, List, Filter, PackageOpen, Sparkles, ArrowUpDown, SlidersHorizontal, X, Ruler, Download, Key, Activity
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
  const [showAIModal, setShowAIModal] = useState(false);
  const [isExportingMeta, setIsExportingMeta] = useState(false);
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
    (isAdmin && statusFilter !== 'inactive') || // Default it shows active, so checking if anything else is on
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

  const { geminiApiKey } = useSettingsStore();

  const handleMetaCatalogExport = useCallback(async () => {
    if (isExportingMeta) return;
    setIsExportingMeta(true);
    try {
      const response = await fetch('/api/meta-catalog-export', {
        headers: {
          'x-gemini-key': geminiApiKey || ''
        }
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(err.error || 'Error al generar catálogo Meta');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const disposition = response.headers.get('Content-Disposition');
      let filename = `catalog_products_${new Date().toISOString().replace(/T/, ' ').replace(/:/g, '_').split('.')[0]}.xlsx`;
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match) filename = match[1];
      }

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Catálogo Meta exportado correctamente');
    } catch (err: unknown) {
      console.error('Meta catalog export error:', err);
      toast.error(err instanceof Error ? err.message : 'Error al exportar catálogo Meta');
    } finally {
      setIsExportingMeta(false);
    }
  }, [isExportingMeta, geminiApiKey]);

  return (
    <div className="space-y-10 pb-32 relative min-h-screen bg-[#020202] text-white selection:bg-[#00E5FF] selection:text-black rounded-[3rem] p-6 md:p-12 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00E5FF]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Section */}
      <div className="relative z-10 flex flex-col xl:flex-row xl:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse shadow-[0_0_10px_#00E5FF]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#00E5FF]/50">Protocolo de Inventario</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
            CENTRAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#0EA5E9]">PRODUCTOS</span>
          </h1>
          <p className="text-white/30 text-lg max-w-xl font-medium uppercase tracking-widest text-[11px]">
            Sincronización en tiempo real del archivo maestro <span className="text-white">ÉTER</span>.
          </p>
          
          <div className="flex flex-wrap items-center gap-3 mt-8">
            <div className="px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase border border-white/5 bg-white/[0.02] text-white/40">
              {visibleProducts.length} ÍTEMS REGISTRADOS
            </div>
            {isAdmin && (
              <div className="px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase border border-[#00E5FF]/20 bg-[#00E5FF]/5 text-[#00E5FF]">
                {stats.activeCount} ACTIVOS
              </div>
            )}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase bg-white/5 text-white hover:bg-white/10 transition-all border border-white/10"
              >
                <X size={12} /> REINICIAR FILTROS
              </button>
            )}
          </div>
        </div>

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1 max-w-4xl">
          {[
            { label: 'Unidades Totales', value: stats.totalProducts, color: 'white' },
            { label: 'Alerta Stock', value: stats.lowStock, color: stats.lowStock > 0 ? '#F59E0B' : '#10B981', alert: stats.lowStock > 0 },
            { label: 'Sin Existencia', value: stats.outOfStock, color: stats.outOfStock > 0 ? '#EF4444' : '#10B981', alert: stats.outOfStock > 0 },
            { label: 'Valor Residual', value: `$${stats.totalValue.toLocaleString()}`, color: '#00E5FF' }
          ].map((stat, i) => (
            <div key={i} className="bg-white/[0.03] p-6 rounded-[2rem] border border-white/5 backdrop-blur-3xl group hover:border-white/10 transition-all">
              <span className="text-white/20 text-[9px] font-black uppercase tracking-widest mb-3 block">{stat.label}</span>
              <span className="text-3xl font-black tabular-nums" style={{ color: stat.color }}>{stat.value}</span>
              {stat.alert && <div className="mt-3 w-full h-[1px] bg-red-500/20" />}
            </div>
          ))}
        </div>
      </div>

      {/* Primary Actions Deck */}
      <div className="relative z-10 flex flex-wrap items-center gap-3">
        {isAdmin && (
          <>
            <button
              onClick={() => { setEditingProduct(undefined); setShowForm(true); }}
              className="flex-1 md:flex-none px-10 py-5 rounded-2xl font-black text-[10px] text-black bg-[#00E5FF] hover:bg-white transition-all shadow-[0_20px_50px_rgba(0,229,255,0.2)] flex items-center justify-center gap-3 uppercase tracking-[0.2em]"
            >
              <Plus size={18} strokeWidth={3} /> Añadir Ítem
            </button>
            
            <div className="h-10 w-[1px] bg-white/5 mx-2" />

            {[
              { icon: ImageIcon, label: 'Carga Masiva', action: () => setShowImageUploadModal(true) },
              { icon: FileSpreadsheet, label: 'Importar CSV', action: () => setShowImportModal(true) },
              { icon: Download, label: 'Exportar', action: handleExportView }
            ].map((btn, i) => (
              <button
                key={i}
                onClick={btn.action}
                className="px-6 py-5 rounded-2xl font-black text-[10px] text-white/60 bg-white/[0.03] border border-white/10 hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-3 uppercase tracking-widest backdrop-blur-sm"
              >
                <btn.icon size={16} /> {btn.label}
              </button>
            ))}

            <button
              onClick={handleMetaCatalogExport}
              disabled={isExportingMeta}
              className="px-6 py-5 rounded-2xl font-black text-[10px] text-[#0668E1] bg-[#0668E1]/10 border border-[#0668E1]/20 hover:bg-[#0668E1]/20 transition-all flex items-center justify-center gap-3 uppercase tracking-widest backdrop-blur-sm disabled:opacity-50"
            >
              {isExportingMeta ? <Loader2 size={16} className="animate-spin" /> : <Activity size={16} />}
              Meta Sync
            </button>

            <div className="flex-1" />

            <button
              onClick={() => setShowAISettingsModal(true)}
              className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-white/40 hover:text-[#00E5FF] hover:border-[#00E5FF]/40 transition-all"
              title="Configuración de IA"
            >
              <Sparkles size={20} />
            </button>
          </>
        )}
      </div>

      {/* Intelligent Search & Filtering Hub */}
      <div className="sticky top-6 z-30 bg-[#0A0A0A]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-5 shadow-2xl">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col lg:flex-row items-center gap-4">
            {/* Search Module */}
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00E5FF] transition-colors" size={18} />
              <input
                type="text"
                placeholder="Rastrear producto en nodo central..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-5 pl-16 pr-14 text-sm font-medium text-white placeholder:text-white/10 focus:bg-white/5 focus:border-[#00E5FF]/30 outline-none transition-all"
              />
              {search.trim() && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Logical Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {/* Category */}
              <div className="relative flex-1 lg:min-w-[180px]">
                <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full appearance-none bg-white/[0.02] border border-white/5 rounded-2xl py-5 pl-12 pr-10 text-[10px] font-black text-white/60 tracking-widest focus:bg-white/5 outline-none cursor-pointer transition-all uppercase"
                >
                  <option value="all" className="bg-[#0A0A0A]">Sectores: Todos</option>
                  {categories.map(cat => (
                    cat !== 'all' && <option key={cat} value={cat} className="bg-[#0A0A0A]">{cat}</option>
                  ))}
                </select>
              </div>

              {/* Sorting */}
              <div className="relative flex-1 lg:min-w-[180px]">
                <ArrowUpDown className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="w-full appearance-none bg-white/[0.02] border border-white/5 rounded-2xl py-5 pl-12 pr-10 text-[10px] font-black text-white/60 tracking-widest focus:bg-white/5 outline-none cursor-pointer transition-all uppercase"
                >
                  <option value="newest" className="bg-[#0A0A0A]">Orden: Recientes</option>
                  <option value="price_asc" className="bg-[#0A0A0A]">Precio: Asc</option>
                  <option value="price_desc" className="bg-[#0A0A0A]">Precio: Desc</option>
                  <option value="stock_desc" className="bg-[#0A0A0A]">Stock: Max</option>
                </select>
              </div>

              {/* View Toggle Deck */}
              <div className="flex items-center bg-white/[0.02] border border-white/5 p-1.5 rounded-2xl">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-black shadow-xl shadow-white/5' : 'text-white/20 hover:text-white'}`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-3.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white text-black shadow-xl shadow-white/5' : 'text-white/20 hover:text-white'}`}
                >
                  <List size={18} />
                </button>
              </div>

              <button
                onClick={() => setShowAdvancedFilters((prev) => !prev)}
                className={`p-5 rounded-2xl flex items-center gap-2 transition-all border ${showAdvancedFilters ? 'bg-[#00E5FF]/10 border-[#00E5FF]/30 text-[#00E5FF]' : 'bg-white/[0.02] border-white/5 text-white/20 hover:text-white'}`}
              >
                <SlidersHorizontal size={18} />
              </button>
            </div>
          </div>

          {/* Selection Toolbar */}
          <AnimatePresence>
            {selectedIds.size > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-6 px-8 py-4 bg-[#00E5FF]/5 border border-[#00E5FF]/20 rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-[#00E5FF] rounded-full animate-ping" />
                  <span className="text-[10px] font-black tracking-[0.2em] text-[#00E5FF] uppercase">{selectedIds.size} Ítems Bloqueados</span>
                </div>
                
                <div className="flex items-center gap-4 ml-auto">
                    <button
                        onClick={() => setShowStockModal(true)}
                        className="text-[9px] font-black text-white hover:text-[#00E5FF] transition-colors uppercase tracking-widest border border-white/10 px-4 py-2 rounded-xl bg-white/5"
                    >
                        Actualizar Stock
                    </button>
                    <button
                        onClick={handleSelectAll}
                        className="text-[9px] font-black text-white/40 hover:text-white transition-colors uppercase tracking-widest"
                    >
                        {selectedIds.size === visibleProducts.length ? 'Deseleccionar' : 'Todo'}
                    </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Advanced Adjustment Deck */}
          <AnimatePresence>
            {showAdvancedFilters && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-white/5">
                        <select
                            value={stockFilter}
                            onChange={(e) => setStockFilter(e.target.value as typeof stockFilter)}
                            className="bg-white/[0.02] border border-white/10 rounded-xl py-4 px-5 text-[10px] font-bold tracking-widest text-white/60 focus:bg-white/5 outline-none cursor-pointer uppercase"
                        >
                            <option value="all" className="bg-[#0A0A0A]">Stock: Todos</option>
                            <option value="out" className="bg-[#0A0A0A]">Stock: Agotados</option>
                            <option value="low" className="bg-[#0A0A0A]">Stock: Crítico</option>
                            <option value="healthy" className="bg-[#0A0A0A]">Stock: Óptimo</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                            disabled={!isAdmin}
                            className="bg-white/[0.02] border border-white/10 rounded-xl py-4 px-5 text-[10px] font-bold tracking-widest text-white/60 focus:bg-white/5 outline-none cursor-pointer disabled:opacity-30 uppercase"
                        >
                            <option value="active" className="bg-[#0A0A0A]">Estado: Activos</option>
                            <option value="inactive" className="bg-[#0A0A0A]">Estado: Offline</option>
                            <option value="all" className="bg-[#0A0A0A]">Estado: Todos</option>
                        </select>

                        <div className="flex gap-2">
                             <input
                                type="number"
                                placeholder="Min $"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="flex-1 bg-white/[0.02] border border-white/10 rounded-xl py-4 px-5 text-[10px] font-bold text-white placeholder:text-white/10 outline-none focus:bg-white/5 transition-all"
                            />
                            <input
                                type="number"
                                placeholder="Max $"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="flex-1 bg-white/[0.02] border border-white/10 rounded-xl py-4 px-5 text-[10px] font-bold text-white placeholder:text-white/10 outline-none focus:bg-white/5 transition-all"
                            />
                        </div>

                        <div className="relative group flex items-center bg-white/[0.02] border border-white/10 rounded-xl px-5">
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mr-4">Límite Crítico</span>
                            <input
                                type="number"
                                min={1}
                                value={lowStockThreshold}
                                onChange={(e) => setLowStockThreshold(Number(e.target.value) || 1)}
                                className="flex-1 bg-transparent py-4 text-[10px] font-black text-[#00E5FF] outline-none"
                            />
                        </div>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Registry Display */}
      <div className="relative z-10">
        {isLoading ? (
            <div className="flex flex-col items-center justify-center py-48">
                <div className="relative w-20 h-20 mb-10">
                    <div className="absolute inset-0 border-4 border-[#00E5FF]/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-[#00E5FF] rounded-full border-t-transparent animate-spin" />
                </div>
                <p className="text-[#00E5FF] font-black text-[10px] uppercase tracking-[0.8em] animate-pulse">Sincronizando Nodo Central</p>
            </div>
        ) : visibleProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 text-center border border-dashed border-white/10 rounded-[4rem] bg-white/[0.01]">
                <div className="w-32 h-32 bg-white/[0.03] rounded-full flex items-center justify-center mb-10 border border-white/5 shadow-inner">
                    <PackageOpen className="text-white/10" size={60} strokeWidth={1} />
                </div>
                <h3 className="text-5xl font-black text-white mb-6 tracking-tighter uppercase italic">Archivo Vacío</h3>
                <p className="text-white/30 max-w-sm mx-auto mb-12 font-medium text-xs uppercase tracking-widest leading-loose">
                    No se han encontrado registros correspondientes al protocolo de búsqueda actual.
                </p>
                {isAdmin && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="text-[#00E5FF] hover:text-white font-black text-[10px] uppercase tracking-[0.4em] transition-all bg-[#00E5FF]/5 px-10 py-5 rounded-2xl border border-[#00E5FF]/20 shadow-[0_0_50px_rgba(0,229,255,0.05)]"
                    >
                        Inicializar Nueva Entrada
                    </button>
                )}
            </div>
        ) : (
            <div className="space-y-12">
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                <AnimatePresence mode='popLayout'>
                    {visibleProducts.map((product, index) => (
                    <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{
                            delay: Math.min(index * 0.03, 0.5),
                            duration: 0.8,
                            ease: [0.16, 1, 0.3, 1]
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
                <div className="bg-white/[0.01] border border-white/5 rounded-[3rem] overflow-hidden backdrop-blur-3xl">
                    <ProductTable
                        products={visibleProducts}
                        selectedIds={selectedIds}
                        onToggleSelect={handleToggleSelect}
                        onSelectAll={handleSelectAll}
                        onEdit={isAdmin ? (p) => { setEditingProduct(p); setShowForm(true); } : undefined}
                        onDelete={isAdmin ? handleDelete : undefined}
                    />
                </div>
            )}
            </div>
        )}
      </div>

      {/* Persistence Modals Layer */}
      <AnimatePresence>
        {showForm && (
          <ProductForm
            product={editingProduct}
            onClose={() => { setShowForm(false); setEditingProduct(undefined); }}
            onSuccess={handleSuccess}
          />
        )}

        {showImportModal && (
          <BulkImportModal
            onClose={() => setShowImportModal(false)}
            onSuccess={handleSuccess}
          />
        )}

        {showImageUploadModal && (
          <BulkImageUploadModal
            onClose={() => setShowImageUploadModal(false)}
            onSuccess={handleSuccess}
          />
        )}

        {showAISettingsModal && (
          <AISettingsModal
            onClose={() => setShowAISettingsModal(false)}
          />
        )}

        {showRenameModal && (
          <BulkRenameModal
            onClose={() => setShowRenameModal(false)}
            selectedIds={Array.from(selectedIds)}
            onSuccess={handleSuccess}
          />
        )}

        {showStockModal && (
          <BulkStockModal
            onClose={() => setShowStockModal(false)}
            selectedIds={Array.from(selectedIds)}
            onSuccess={handleSuccess}
          />
        )}

        {showAIModal && (
            <AIDescriptionModal
                onClose={() => setShowAIModal(false)}
            />
        )}
      </AnimatePresence>
    </div>
  );
};
