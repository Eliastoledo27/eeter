'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/catalog/ProductCard';
import { Filter, Search, Loader2, X } from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilterSidebar } from '@/components/catalog/FilterSidebar';
import { ProductQuickView } from '@/components/catalog/ProductQuickView';
import { useAuth } from '@/hooks/useAuth';
import { CatalogSkeleton } from '@/components/catalog/ProductSkeleton';
import { useCartStore } from '@/store/cart-store';

export default function CatalogPage() {
    const { loading, categories, products } = useCatalog();
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState('newest');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedQuickView, setSelectedQuickView] = useState<any>(null);

    const filteredProducts = useMemo(() => {
        if (!products) return [];

        let result = [...products];

        // Optimized Search Matcher
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(q) ||
                (p.category && p.category.toLowerCase().includes(q))
            );
        }

        // Optimized Filter Logic
        if (activeCategory !== 'Todos') {
            result = result.filter(p => p.category === activeCategory);
        }

        if (priceRange[0] > 0 || priceRange[1] < 1000000) {
            result = result.filter(p => p.basePrice >= priceRange[0] && p.basePrice <= priceRange[1]);
        }

        if (selectedSizes.length > 0) {
            result = result.filter(p => {
                if (!p.stockBySize) return false;
                const availableSizes = Object.entries(p.stockBySize)
                    .filter(([, qty]) => Number(qty) > 0)
                    .map(([size]) => size);
                return selectedSizes.some(size => availableSizes.includes(size));
            });
        }

        // Fast Sort
        if (sortBy === 'price-asc') {
            result.sort((a, b) => a.basePrice - b.basePrice);
        } else if (sortBy === 'price-desc') {
            result.sort((a, b) => b.basePrice - a.basePrice);
        } else {
            result.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            });
        }

        return result;
    }, [products, searchQuery, activeCategory, priceRange, selectedSizes, sortBy]);

    const resetFilters = () => {
        setActiveCategory('Todos');
        setSearchQuery('');
        setPriceRange([0, 1000000]);
        setSelectedSizes([]);
        setSortBy('newest');
    };

    return (
        <div className="min-h-screen bg-[#050505] font-sans text-white selection:bg-[#C88A04] selection:text-black overflow-x-hidden">
            {/* Simple Background */}
            <div className="fixed inset-0 z-0 bg-[#050505] pointer-events-none">
                <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-[#C88A04]/5 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(200,138,4,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            <Navbar />

            <div className="container mx-auto px-6 pt-40 pb-32 relative z-10">
                {/* Header Section */}
                <div className="mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                        className="flex flex-col lg:flex-row lg:items-end justify-between gap-8"
                    >
                        <div>
                            <span className="text-[#C88A04] font-mono text-sm tracking-[0.4em] uppercase mb-4 block text-center lg:text-left">
                                ARCHIVO 2026
                            </span>
                            <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20 uppercase text-center lg:text-left leading-[0.8]">
                                Catálogo <br /> <span className="text-[#C88A04]">Éter</span>
                            </h1>
                        </div>


                    </motion.div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6 pb-6 border-b border-white/5">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="lg:hidden flex items-center gap-3 h-10 px-6 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-widest"
                        >
                            <Filter size={14} />
                            Filtros
                        </button>
                        <div className="hidden lg:flex items-center gap-3 text-white text-xs font-bold uppercase tracking-widest opacity-60">
                            Filtros de búsqueda
                        </div>
                    </div>

                    <div className="relative group w-full md:w-96">
                        <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-[#C88A04] transition-colors" />
                        <input
                            type="text"
                            placeholder="BUSCAR EN EL ARCHIVO..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/[0.02] border border-white/5 rounded-full py-3.5 pl-14 pr-6 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-[#C88A04]/30 transition-all uppercase placeholder:text-gray-800"
                        />
                    </div>
                </div>

                {/* Category Quick Links */}
                <div className="mb-16 -mx-6 px-6 overflow-x-auto no-scrollbar scroll-smooth">
                    <div className="flex items-center gap-3 min-w-max pb-2">
                        <button
                            onClick={() => setActiveCategory('Todos')}
                            className={`h-10 px-6 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${activeCategory === 'Todos'
                                ? 'bg-white text-black border-white'
                                : 'bg-white/5 border-white/10 text-gray-400'
                                }`}
                        >
                            Todos
                        </button>
                        {categories.filter(cat => cat !== 'Todos').map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`h-10 px-6 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${activeCategory === cat
                                    ? 'bg-[#C88A04] text-black border-[#C88A04]'
                                    : 'bg-white/5 border-white/10 text-gray-500'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="relative flex flex-col lg:flex-row gap-12">

                    {/* Fixed Sidebar for Desktop */}
                    <div className="hidden lg:block w-[280px] shrink-0 sticky top-32 h-fit mb-10">
                        <div className="pr-6">
                            <FilterSidebar
                                categories={categories.filter(cat => cat !== 'Todos')}
                                activeCategory={activeCategory}
                                onCategoryChange={setActiveCategory}
                                priceRange={priceRange}
                                onPriceChange={setPriceRange}
                                selectedSizes={selectedSizes}
                                onSizesChange={setSelectedSizes}
                                sortBy={sortBy}
                                onSortChange={setSortBy}
                                onReset={resetFilters}
                            />
                        </div>
                    </div>

                    {/* Mobile Sidebar - Full Screen Overlay */}
                    <AnimatePresence>
                        {isSidebarOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/90 backdrop-blur-md z-[120] lg:hidden"
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <motion.div
                                    initial={{ y: '100%' }}
                                    animate={{ y: 0 }}
                                    exit={{ y: '100%' }}
                                    transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                                    className="absolute inset-x-0 bottom-0 h-[92vh] bg-[#0A0A0A] rounded-t-[2.5rem] border-t border-white/10 flex flex-col"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Handle bar for drawer feel */}
                                    <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-4 mb-2 shrink-0" />

                                    <div className="flex justify-between items-center px-8 py-6 border-b border-white/5 shrink-0">
                                        <div>
                                            <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Filtros</h2>
                                            <p className="text-[10px] text-[#C88A04] font-bold uppercase tracking-widest mt-1">Refina tu búsqueda</p>
                                        </div>
                                        <button
                                            onClick={() => setIsSidebarOpen(false)}
                                            className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto px-8 py-6">
                                        <FilterSidebar
                                            categories={categories.filter(cat => cat !== 'Todos')}
                                            activeCategory={activeCategory}
                                            onCategoryChange={setActiveCategory}
                                            priceRange={priceRange}
                                            onPriceChange={setPriceRange}
                                            selectedSizes={selectedSizes}
                                            onSizesChange={setSelectedSizes}
                                            sortBy={sortBy}
                                            onSortChange={setSortBy}
                                            onReset={resetFilters}
                                        />
                                    </div>

                                    {/* Fixed Action Button for Mobile */}
                                    <div className="p-6 bg-gradient-to-t from-black to-transparent border-t border-white/5 shrink-0">
                                        <button
                                            onClick={() => setIsSidebarOpen(false)}
                                            className="w-full bg-[#C88A04] text-black h-16 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(200,138,4,0.3)]"
                                        >
                                            Mostrar {filteredProducts.length} Resultados
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Products Grid */}
                    <motion.div
                        layout
                        className="flex-1"
                    >
                        <div className="flex justify-between items-center mb-10 px-2 pb-6 border-b border-white/5">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.3em]">
                                    Archivo Sincronizado
                                </span>
                                <span className="text-xl font-black uppercase tracking-tighter">
                                    {filteredProducts.length} <span className="text-gray-600 font-light text-sm">Modelos Detectados</span>
                                </span>
                            </div>

                            <AnimatePresence>
                                {(searchQuery || activeCategory !== 'Todos' || selectedSizes.length > 0 || priceRange[0] > 0 || priceRange[1] < 1000000) && (
                                    <motion.button
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        onClick={resetFilters}
                                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#C88A04] hover:text-white transition-colors group"
                                    >
                                        <X size={14} className="group-hover:rotate-90 transition-transform" />
                                        Limpiar Todo
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>

                        {loading ? (
                            <CatalogSkeleton />
                        ) : filteredProducts.length > 0 ? (
                            <>
                                <div
                                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                                >
                                    {filteredProducts.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                        />
                                    ))}
                                </div>


                            </>
                        ) : (
                            <div className="min-h-[500px] flex flex-col items-center justify-center text-center p-20 border border-white/5 rounded-[4rem] bg-white/[0.02] backdrop-blur-3xl">
                                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10">
                                    <Filter className="text-gray-700" size={40} />
                                </div>
                                <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter">Sin coincidencias</h3>
                                <p className="text-gray-500 mb-12 max-w-sm mx-auto">Tu búsqueda no arrojó resultados en el catálogo actual. Intentá con otros términos o categorías.</p>
                                <button
                                    onClick={resetFilters}
                                    className="px-10 py-4 border border-[#C88A04] text-[#C88A04] rounded-full hover:bg-[#C88A04] hover:text-black transition-all font-bold uppercase tracking-widest text-xs"
                                >
                                    Reiniciar Búsqueda
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            <AnimatePresence>
                {selectedQuickView && (
                    <ProductQuickView
                        product={{
                            ...selectedQuickView,
                            base_price: selectedQuickView.basePrice,
                            stock_by_size: selectedQuickView.stockBySize,
                        } as any}
                        onClose={() => setSelectedQuickView(null)}
                    />
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
}
