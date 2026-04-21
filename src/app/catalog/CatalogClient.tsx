'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/catalog/ProductCard';
import { CatalogHero } from '@/components/catalog/CatalogHero';
import { Filter, Search, Loader2, X, ShoppingCart, SlidersHorizontal, ChevronDown, LayoutGrid, List } from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';
import { useState, useMemo, useDeferredValue } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilterSidebar } from '@/components/catalog/FilterSidebar';
import { CatalogSkeleton } from '@/components/catalog/ProductSkeleton';
import { useCartStore } from '@/store/cart-store';

export default function CatalogPage() {
    const { loading, categories, products } = useCatalog();
    const { items, setIsOpen: setIsCartOpen } = useCartStore();
    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [activeOccasion, setActiveOccasion] = useState('Todos');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState('newest');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const deferredSearchQuery = useDeferredValue(searchQuery);

    const occasions = ['Streetwear', 'Gym', 'Performance', 'Gala'];

    const filteredProducts = useMemo(() => {
        if (!products) return [];
        let result = [...products];

        if (deferredSearchQuery) {
            const q = deferredSearchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(q) ||
                (p.category && p.category.toLowerCase().includes(q))
            );
        }
        if (activeCategory !== 'Todos') {
            result = result.filter(p => p.category === activeCategory);
        }
        if (activeOccasion !== 'Todos') {
            // Simulating occasion filtering based on description or category mapping
            result = result.filter(p => {
                const searchStr = `${p.name} ${p.category} ${p.description || ''}`.toLowerCase();
                return searchStr.includes(activeOccasion.toLowerCase());
            });
        }
        if (priceRange[0] > 0 || priceRange[1] < 1000000) {
            result = result.filter(p => p.basePrice >= priceRange[0] && p.basePrice <= priceRange[1]);
        }
        if (selectedSizes.length > 0) {
            result = result.filter(p => {
                if (!p.stockBySize) return false;
                const avail = Object.entries(p.stockBySize)
                    .filter(([, qty]) => Number(qty) > 0)
                    .map(([size]) => size);
                return selectedSizes.some(s => avail.includes(s));
            });
        }
        if (sortBy === 'price-asc') result.sort((a, b) => a.basePrice - b.basePrice);
        else if (sortBy === 'price-desc') result.sort((a, b) => b.basePrice - a.basePrice);
        else result.sort((a, b) => {
            const dA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dB - dA;
        });

        return result;
    }, [products, deferredSearchQuery, activeCategory, activeOccasion, priceRange, selectedSizes, sortBy]);

    const resetFilters = () => {
        setActiveCategory('Todos');
        setActiveOccasion('Todos');
        setSearchQuery('');
        setPriceRange([0, 1000000]);
        setSelectedSizes([]);
        setSortBy('newest');
    };

    const hasActiveFilters = activeCategory !== 'Todos' || activeOccasion !== 'Todos' || selectedSizes.length > 0 || priceRange[0] > 0 || priceRange[1] < 1000000;

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-[#00E5FF] selection:text-black overflow-x-hidden font-sans">
            <Navbar />
            <CatalogHero />

            <div className="container mx-auto px-4 md:px-6 pb-24 relative z-10">
                {/* ── High Impact Floating Toolbar ────────────────── */}
                <div className="sticky top-[70px] md:top-[90px] z-40 -mx-2 px-2 pt-2 pb-4 pointer-events-none">
                    <div className="bg-[#0A0A0A]/80 backdrop-blur-3xl border border-white/10 rounded-2xl md:rounded-3xl p-3 md:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                {/* Enhanced Search */}
                                <div className="flex-1 relative group">
                                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00E5FF] transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por marca o modelo..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full h-12 bg-white/[0.03] border border-white/[0.06] rounded-xl md:rounded-2xl pl-12 pr-10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#00E5FF]/30 transition-all font-medium"
                                    />
                                    {searchQuery && (
                                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-xl hover:bg-white/10 transition-colors">
                                            <X size={16} className="text-white/40" />
                                        </button>
                                    )}
                                </div>

                                {/* Desktop View Switcher */}
                                <div className="hidden md:flex bg-white/[0.03] border border-white/[0.06] rounded-2xl p-1 gap-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                                            viewMode === 'grid' 
                                                ? 'bg-[#00E5FF] text-black shadow-[0_0_20px_rgba(0,229,255,0.2)]' 
                                                : 'text-white/20 hover:text-white/40'
                                        }`}
                                    >
                                        <LayoutGrid size={18} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                                            viewMode === 'list' 
                                                ? 'bg-[#00E5FF] text-black shadow-[0_0_20px_rgba(0,229,255,0.2)]' 
                                                : 'text-white/20 hover:text-white/40'
                                        }`}
                                    >
                                        <List size={18} />
                                    </button>
                                </div>

                                {/* Filter Toggle */}
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="relative h-12 px-4 md:px-6 flex items-center justify-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-xl md:rounded-2xl hover:border-[#00E5FF]/30 transition-all group"
                                >
                                    <SlidersHorizontal size={16} className="text-white/40 group-hover:text-[#00E5FF] transition-colors" />
                                    <span className="hidden md:block text-[11px] font-black uppercase tracking-[0.2em] text-white/50 group-hover:text-white transition-colors">Filtros Avanzados</span>
                                    {hasActiveFilters && (
                                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF] border-2 border-[#0A0A0A]" />
                                    )}
                                </button>
                            </div>

                            {/* Horizontal Category Scroll */}
                            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
                                {['Todos', ...categories.filter(c => c !== 'Todos')].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 shrink-0 border ${
                                            activeCategory === cat
                                                ? 'bg-[#00E5FF]/10 border-[#00E5FF]/40 text-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.1)]'
                                                : 'bg-white/[0.02] border-white/[0.05] text-white/30 hover:text-white/60 hover:border-white/10'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                                {hasActiveFilters && (
                                    <button
                                        onClick={resetFilters}
                                        className="whitespace-nowrap px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500/80 hover:bg-rose-500/10 transition-all shrink-0 border border-transparent"
                                    >
                                        Limpiar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Main Content ────────────────── */}
                <div className="flex gap-8 mt-8">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-64 shrink-0">
                        <div className="sticky top-[190px] max-h-[calc(100vh-220px)] overflow-y-auto no-scrollbar rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6">
                            <FilterSidebar
                                categories={categories.filter(cat => cat !== 'Todos')}
                                activeCategory={activeCategory}
                                onCategoryChange={setActiveCategory}
                                occasions={occasions}
                                activeOccasion={activeOccasion}
                                onOccasionChange={setActiveOccasion}
                                priceRange={priceRange}
                                onPriceChange={setPriceRange}
                                selectedSizes={selectedSizes}
                                onSizesChange={setSelectedSizes}
                                sortBy={sortBy}
                                onSortChange={setSortBy}
                                onReset={resetFilters}
                            />
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-1 min-w-0">
                        {/* Results count bar */}
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-xs text-white/30 font-medium">
                                {loading ? 'Cargando...' : (
                                    <><span className="text-white/60 font-bold">{filteredProducts.length}</span> productos encontrados</>
                                )}
                            </p>
                            {/* Mobile sort */}
                            <div className="relative sm:hidden">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="h-9 appearance-none bg-white/[0.04] border border-white/[0.08] rounded-lg pl-3 pr-7 text-[11px] font-semibold text-white/50 uppercase tracking-wider cursor-pointer focus:outline-none"
                                >
                                    <option value="newest" className="bg-[#111]">Recientes</option>
                                    <option value="price-asc" className="bg-[#111]">$ Menor</option>
                                    <option value="price-desc" className="bg-[#111]">$ Mayor</option>
                                </select>
                                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                            </div>
                        </div>

                        {loading ? (
                            <CatalogSkeleton />
                        ) : filteredProducts.length > 0 ? (
                            <motion.div
                                layout
                                className={
                                    viewMode === 'grid' 
                                        ? "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6"
                                        : "flex flex-col gap-4"
                                }
                            >
                                <AnimatePresence mode="popLayout">
                                    {filteredProducts.map((product) => (
                                        <motion.div
                                            key={product.id}
                                            layout
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                                        >
                                            <ProductCard product={product} viewMode={viewMode} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        ) : (
                            /* Empty state */
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mb-6">
                                    <Search className="text-white/15" size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white/80 mb-2">Sin resultados</h3>
                                <p className="text-sm text-white/30 max-w-xs mb-6">
                                    Probá ajustar los filtros o el término de búsqueda.
                                </p>
                                <button
                                    onClick={resetFilters}
                                    className="px-6 py-3 bg-[#00E5FF] text-black rounded-xl text-xs font-bold uppercase tracking-wider hover:shadow-[0_0_25px_rgba(0,229,255,0.3)] transition-all active:scale-95"
                                >
                                    Limpiar filtros
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Mobile Filter Drawer ────────────────── */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150] lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                            className="absolute inset-x-0 bottom-0 max-h-[88vh] bg-[#0A0A0A] rounded-t-3xl border-t border-white/10 flex flex-col overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Drawer handle */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] shrink-0">
                                <div>
                                    <h2 className="text-lg font-bold">Filtros</h2>
                                    <p className="text-[11px] text-white/30 mt-0.5">{filteredProducts.length} productos</p>
                                </div>
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
                                <FilterSidebar
                                    categories={categories.filter(cat => cat !== 'Todos')}
                                    activeCategory={activeCategory}
                                    onCategoryChange={setActiveCategory}
                                    occasions={occasions}
                                    activeOccasion={activeOccasion}
                                    onOccasionChange={setActiveOccasion}
                                    priceRange={priceRange}
                                    onPriceChange={setPriceRange}
                                    selectedSizes={selectedSizes}
                                    onSizesChange={setSelectedSizes}
                                    sortBy={sortBy}
                                    onSortChange={setSortBy}
                                    onReset={resetFilters}
                                />
                            </div>

                            <div className="px-6 py-4 border-t border-white/[0.06] shrink-0">
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="w-full h-12 bg-[#00E5FF] text-black rounded-xl font-bold text-sm uppercase tracking-wider shadow-[0_8px_30px_rgba(0,229,255,0.25)] active:scale-[0.98] transition-all"
                                >
                                    Ver {filteredProducts.length} resultados
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />

            {/* Floating Cart Button */}
            {cartCount > 0 && (
                <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setIsCartOpen(true)}
                    className="fixed bottom-24 right-7 z-[150] h-14 w-14 rounded-2xl bg-white text-black flex items-center justify-center shadow-[0_15px_35px_rgba(0,0,0,0.5)] hover:bg-[#00E5FF] transition-all active:scale-90"
                >
                    <ShoppingCart size={22} strokeWidth={2.5} />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#00E5FF] text-black flex items-center justify-center text-[11px] font-black shadow-[0_0_15px_rgba(0,229,255,0.6)] border-2 border-[#050505]">
                        {cartCount}
                    </span>
                </motion.button>
            )}
        </div>
    );
}
