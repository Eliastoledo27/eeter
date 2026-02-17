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

export default function CatalogPage() {
    const { loading, categories, products } = useCatalog();
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState('newest');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedQuickView, setSelectedQuickView] = useState<any>(null);
    const [visibleCount, setVisibleCount] = useState(20);

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
                const productSizes = p.stockBySize ? Object.keys(p.stockBySize) : [];
                return selectedSizes.some(size => productSizes.includes(size));
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

    // Progressive Loading (Virtual Scroll Simulation)
    const displayedProducts = useMemo(() => {
        return filteredProducts.slice(0, visibleCount);
    }, [filteredProducts, visibleCount]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1000) {
                if (visibleCount < filteredProducts.length) {
                    setVisibleCount(prev => prev + 20);
                }
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [visibleCount, filteredProducts.length]);

    // Reset visibility on filter change
    useEffect(() => {
        setVisibleCount(20);
    }, [searchQuery, activeCategory, priceRange, selectedSizes, sortBy]);

    const resetFilters = () => {
        setActiveCategory('Todos');
        setSearchQuery('');
        setPriceRange([0, 1000000]);
        setSelectedSizes([]);
        setSortBy('newest');
    };

    return (
        <div className="min-h-screen bg-[#050505] font-sans text-white selection:bg-[#C88A04] selection:text-black overflow-x-hidden">
            {/* Background Ambience & Grid */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#C88A04]/10 rounded-full blur-[150px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#C88A04]/5 rounded-full blur-[120px]" />

                {/* Visual Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(200,138,4,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(200,138,4,0.03)_1px,transparent_1px)] bg-[size:100px_100px] opacity-40" />

                {/* Noise Texture */}
                <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }} />
            </div>

            <Navbar />

            <div className="container mx-auto px-6 pt-40 pb-32 relative z-10">
                {/* Header Section */}
                <div className="mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                    >
                        <span className="text-[#C88A04] font-mono text-sm tracking-[0.4em] uppercase mb-4 block text-center lg:text-left">
                            ARCHIVO 2026
                        </span>
                        <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20 uppercase text-center lg:text-left">
                            Catálogo <span className="text-[#C88A04]">Éter</span>
                        </h1>
                    </motion.div>
                </div>

                {/* Controls Bar: Search & Filter Toggle */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6 pb-12 border-b border-white/5">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className={`flex items-center gap-3 h-12 px-8 rounded-full border transition-all duration-500 uppercase text-[10px] font-bold tracking-widest ${isSidebarOpen
                                ? 'bg-[#C88A04] text-black border-[#C88A04] shadow-[0_0_20px_rgba(200,138,4,0.3)]'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                                }`}
                        >
                            <Filter size={14} />
                            {isSidebarOpen ? 'Cerrar Filtros' : 'Filtros'}
                            {(searchQuery || selectedSizes.length > 0 || priceRange[0] > 0 || priceRange[1] < 1000000) && (
                                <span className="w-1.5 h-1.5 bg-current rounded-full ml-1" />
                            )}
                        </button>
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
                            className={`h-10 px-6 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 border ${activeCategory === 'Todos'
                                ? 'bg-white text-black border-white'
                                : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/30 hover:text-white'
                                }`}
                        >
                            Todos
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`h-10 px-6 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 border ${activeCategory === cat
                                    ? 'bg-[#C88A04] text-black border-[#C88A04] shadow-[0_0_20px_rgba(200,138,4,0.2)]'
                                    : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/30 hover:text-white'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="relative flex flex-col lg:flex-row gap-12">

                    {/* Retractable Sidebar */}
                    <AnimatePresence initial={false}>
                        {isSidebarOpen && (
                            <motion.div
                                initial={{ opacity: 0, width: 0, marginRight: 0 }}
                                animate={{ opacity: 1, width: '320px', marginRight: 0 }}
                                exit={{ opacity: 0, width: 0, marginRight: 0 }}
                                transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                                className="overflow-hidden sticky top-32 h-fit hidden lg:block"
                            >
                                <div className="w-[320px] pr-12">
                                    <FilterSidebar
                                        categories={categories}
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
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Mobile Sidebar - Full Screen Overlay */}
                    <AnimatePresence>
                        {isSidebarOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/80 backdrop-blur-md z-[120] lg:hidden"
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <motion.div
                                    initial={{ x: '-100%' }}
                                    animate={{ x: 0 }}
                                    exit={{ x: '-100%' }}
                                    transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                                    className="absolute inset-y-0 left-0 w-4/5 bg-[#0A0A0A] p-8 border-r border-white/10 overflow-y-auto"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex justify-between items-center mb-10">
                                        <h2 className="text-2xl font-black uppercase tracking-tighter">Filtros</h2>
                                        <button onClick={() => setIsSidebarOpen(false)} className="p-2">
                                            <X size={24} />
                                        </button>
                                    </div>
                                    <FilterSidebar
                                        categories={categories}
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
                            <div className="min-h-[500px] flex flex-col items-center justify-center gap-6">
                                <div className="relative">
                                    <div className="w-16 h-16 border-2 border-[#C88A04]/20 rounded-full animate-ping absolute inset-0" />
                                    <Loader2 className="animate-spin text-[#C88A04]" size={64} />
                                </div>
                                <p className="text-gray-500 font-mono text-sm tracking-[0.3em] uppercase animate-pulse">Sincronizando Archivo...</p>
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <>
                                <motion.div
                                    layout
                                    className={`grid grid-cols-2 sm:grid-cols-2 ${isSidebarOpen ? 'xl:grid-cols-3' : 'xl:grid-cols-4'} gap-x-4 md:gap-x-8 gap-y-8 md:gap-y-16 transition-all duration-700 ease-[0.19,1,0.22,1]`}
                                >
                                    <AnimatePresence mode="popLayout" initial={false}>
                                        {displayedProducts.map((product, idx) => (
                                            <motion.div
                                                key={product.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                                transition={{
                                                    duration: 0.5,
                                                    delay: (idx % 20) * 0.02,
                                                    ease: [0.19, 1, 0.22, 1]
                                                }}
                                            >
                                                <ProductCard
                                                    product={product}
                                                    onQuickView={() => setSelectedQuickView(product)}
                                                />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </motion.div>

                                {visibleCount < filteredProducts.length && (
                                    <div className="mt-20 py-12 flex flex-col items-center gap-6 border-t border-white/5">
                                        <div className="relative">
                                            <div className="w-12 h-12 border-2 border-[#C88A04]/20 rounded-full" />
                                            <div className="w-12 h-12 border-t-2 border-[#C88A04] rounded-full animate-spin absolute inset-0" />
                                        </div>
                                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.4em] animate-pulse">Sincronizando más modelos...</span>
                                    </div>
                                )}
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
