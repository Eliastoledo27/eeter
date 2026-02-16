'use client';

import { Navbar } from '@/components/layout/Navbar';
import { ProductCard } from '@/components/catalog/ProductCard';
import { Filter, Search, Loader2 } from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { FilterSidebar } from '@/components/catalog/FilterSidebar';

export default function CatalogPage() {
    const { loading, categories, products } = useCatalog();
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState('newest');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const filteredProducts = useMemo(() => {
        let result = [...products];

        // 1. Search Query
        if (searchQuery) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // 2. Category
        if (activeCategory !== 'Todos') {
            result = result.filter(p => p.category === activeCategory);
        }

        // 3. Price
        result = result.filter(p => p.basePrice >= priceRange[0] && p.basePrice <= priceRange[1]);

        // 4. Sizes
        if (selectedSizes.length > 0) {
            result = result.filter(p => {
                const productSizes = Object.keys(p.stockBySize || {});
                return selectedSizes.some(size => productSizes.includes(size));
            });
        }

        // 5. Sorting
        result.sort((a, b) => {
            if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
            if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
            // newest (default)
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });

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
        <div className="min-h-screen bg-[#050505] font-sans text-white selection:bg-[#CA8A04] selection:text-black overflow-x-hidden">
            {/* Background Ambience & Grid */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#CA8A04]/10 rounded-full blur-[150px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#CA8A04]/5 rounded-full blur-[120px]" />

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
                        <span className="text-[#CA8A04] font-mono text-sm tracking-[0.4em] uppercase mb-4 block text-center lg:text-left">
                            Colección 2026
                        </span>
                        <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20 uppercase text-center lg:text-left">
                            Catálogo <span className="text-[#CA8A04]">Éter</span>
                        </h1>
                    </motion.div>
                </div>

                {/* Controls Bar: Search & Filter Toggle */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6 pb-12 border-b border-white/5">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className={`flex items-center gap-3 h-12 px-8 rounded-full border transition-all duration-500 uppercase text-[10px] font-bold tracking-widest ${isSidebarOpen
                                ? 'bg-[#CA8A04] text-black border-[#CA8A04] shadow-[0_0_20px_rgba(202,138,4,0.3)]'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                                }`}
                        >
                            <Filter size={14} />
                            {isSidebarOpen ? 'Cerrar Filtros' : 'Filtros'}
                            {(activeCategory !== 'Todos' || searchQuery || selectedSizes.length > 0) && (
                                <span className="w-1.5 h-1.5 bg-current rounded-full ml-1" />
                            )}
                        </button>
                    </div>

                    <div className="relative group w-full md:w-96">
                        <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-[#CA8A04] transition-colors" />
                        <input
                            type="text"
                            placeholder="BUSCAR EN EL ARCHIVO..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/[0.02] border border-white/5 rounded-full py-3.5 pl-14 pr-6 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-[#CA8A04]/30 transition-all uppercase placeholder:text-gray-800"
                        />
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="relative flex flex-col lg:flex-row gap-12">

                    {/* Retractable Sidebar */}
                    <AnimatePresence>
                        {isSidebarOpen && (
                            <motion.div
                                initial={{ opacity: 0, x: -20, width: 0 }}
                                animate={{ opacity: 1, x: 0, width: '280px' }}
                                exit={{ opacity: 0, x: -20, width: 0 }}
                                transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                                className="overflow-hidden sticky top-32 h-fit"
                            >
                                <div className="w-[280px] pr-8">
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

                    {/* Products Grid */}
                    <motion.div
                        layout
                        className="flex-1"
                    >
                        {loading ? (
                            <div className="min-h-[500px] flex flex-col items-center justify-center gap-6">
                                <div className="relative">
                                    <div className="w-16 h-16 border-2 border-[#CA8A04]/20 rounded-full animate-ping absolute inset-0" />
                                    <Loader2 className="animate-spin text-[#CA8A04]" size={64} />
                                </div>
                                <p className="text-gray-500 font-mono text-sm tracking-[0.3em] uppercase animate-pulse">Sincronizando Archivo...</p>
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`grid grid-cols-1 sm:grid-cols-2 ${isSidebarOpen ? 'xl:grid-cols-3' : 'xl:grid-cols-4'} gap-x-8 gap-y-16 transition-all duration-500`}
                            >
                                <AnimatePresence mode='popLayout'>
                                    {filteredProducts.map((product, idx) => (
                                        <motion.div
                                            key={product.id}
                                            layout
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.8, delay: idx * 0.05, ease: [0.19, 1, 0.22, 1] }}
                                        >
                                            <ProductCard product={product} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        ) : (
                            <div className="min-h-[500px] flex flex-col items-center justify-center text-center p-20 border border-white/5 rounded-[4rem] bg-white/[0.02] backdrop-blur-3xl">
                                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10">
                                    <Filter className="text-gray-700" size={40} />
                                </div>
                                <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter">Sin coincidencias</h3>
                                <p className="text-gray-500 mb-12 max-w-sm mx-auto">Tu búsqueda no arrojó resultados en el catálogo actual. Intentá con otros términos o categorías.</p>
                                <button
                                    onClick={resetFilters}
                                    className="px-10 py-4 border border-[#CA8A04] text-[#CA8A04] rounded-full hover:bg-[#CA8A04] hover:text-black transition-all font-bold uppercase tracking-widest text-xs"
                                >
                                    Reiniciar Búsqueda
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
