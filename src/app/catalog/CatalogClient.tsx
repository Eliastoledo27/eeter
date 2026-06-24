'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/catalog/ProductCard';
import { CatalogHero } from '@/components/catalog/CatalogHero';
import { PulseTicker } from '@/components/pulse/PulseTicker';
import {
    Search,
    ChevronDown,
    LayoutGrid,
    List,
    RotateCcw,
    LayoutTemplate,
    ArrowUpRight,
    CircleDot,
    TrendingUp,
    Sparkles,
    X,
    SlidersHorizontal,
} from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useState, useMemo, useDeferredValue, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilterSidebar } from '@/components/catalog/FilterSidebar';
import { CatalogSkeleton } from '@/components/catalog/ProductSkeleton';
import { useAuraStore } from '@/hooks/useAuraStore';
import { AuraQuiz } from '@/components/catalog/AuraQuiz';
import { LiquidationCarousel } from '@/components/catalog/LiquidationCarousel';
import { LiquidationCardsSection } from '@/components/catalog/LiquidationCardsSection';
import { SidebarLiquidation } from '@/components/catalog/SidebarLiquidation';
import { SidebarFeaturedSale } from '@/components/catalog/SidebarFeaturedSale';
import { SidebarPremiumOffers } from '@/components/catalog/SidebarPremiumOffers';
import { rankCatalogProducts } from '@/lib/recommendation-engine';
import {
    getRecoExperimentMetrics,
    getRecoVariant,
    getSegmentPopularity,
    getRecoVisitorId,
    trackRecoClick,
    trackRecoImpression,
    RecoVariant,
} from '@/lib/recommendation-analytics';
import { mapProductTypeToProduct } from '@/lib/product-mapping';
import { ProductType } from '@/app/actions/products';
import { Product } from '@/types';

const easeOut = [0.16, 1, 0.3, 1] as const;

interface CatalogClientProps {
    initialProducts?: ProductType[];
    resellerCatalogLinks?: any[];
}

export default function CatalogPage({ initialProducts, resellerCatalogLinks }: CatalogClientProps) {
    const { loading: catalogLoading, categories: dbCategories, products: dbProducts } = useCatalog();
    const viewedIds = useAuraStore((s) => s.viewedIds);
    const purchasedIds = useAuraStore((s) => s.purchasedIds);
    const sessionServedIds = useAuraStore((s) => s.sessionServedIds);
    const exposureByProduct = useAuraStore((s) => s.exposureByProduct);
    const hasCompletedQuiz = useAuraStore((s) => s.hasCompletedQuiz);
    const profile = useAuraStore((s) => s.profile);
    const markServed = useAuraStore((s) => s.markServed);
    const addExposure = useAuraStore((s) => s.addExposure);
    const openQuiz = useAuraStore((s) => s.openQuiz);

    const [activeCategory, setActiveCategory] = useState('Todos');
    const [activeBrand, setActiveBrand] = useState('Todas');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState('popular');
    const [visibleCount, setVisibleCount] = useState(12);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const loaderRef = useRef<HTMLDivElement | null>(null);

    // Hydration management
    const mappedInitial = useMemo(() => initialProducts?.map(mapProductTypeToProduct) || [], [initialProducts]);
    const products = useMemo(() =>
        dbProducts?.length ? dbProducts : mappedInitial,
    [dbProducts, mappedInitial]);

    const categories = useMemo(() =>
        dbCategories?.length > 1 ? dbCategories : (products.length ? ['Todos', ...Array.from(new Set(products.map(p => p.category)))] : ['Todos']),
    [dbCategories, products]);

    const cleanCategories = useMemo(() => {
        const list = categories.filter(c => c !== 'Todos');
        return ['Todos', ...list];
    }, [categories]);

    const loading = catalogLoading && products.length === 0;

    // Client-only state initialized after mount to prevent hydration mismatch
    const [mounted, setMounted] = useState(false);
    const [recoVariant, setRecoVariant] = useState<RecoVariant | null>(null);
    const [visitorSeed, setVisitorSeed] = useState<string | null>(null);
    const [experimentMetrics, setExperimentMetrics] = useState<ReturnType<typeof getRecoExperimentMetrics> | null>(null);

    const deferredSearchQuery = useDeferredValue(searchQuery);
    const segmentKey = [profile?.occasion, profile?.style, profile?.budget, profile?.ageRange].filter(Boolean).join('|') || 'anonymous';

    useEffect(() => {
        setMounted(true);
        // Initialize client-side specific values after mount
        setRecoVariant(getRecoVariant());
        setVisitorSeed(getRecoVisitorId());
        setExperimentMetrics(getRecoExperimentMetrics());

        if (hasCompletedQuiz) {
            setSortBy('aura');
        }
    }, [hasCompletedQuiz]);

    const resetFilters = useCallback(() => {
        setActiveCategory('Todos');
        setActiveBrand('Todas');
        setSearchQuery('');
        setPriceRange([0, 1000000]);
        setSelectedSizes([]);
        setSortBy(hasCompletedQuiz ? 'aura' : 'popular');
    }, [hasCompletedQuiz]);

    const filteredAndSortedProducts = useMemo(() => {
        const result = products.filter((product) => {
            const matchesCategory = activeCategory === 'Todos' || product.category === activeCategory;
            const matchesBrand = activeBrand === 'Todas' || product.brand === activeBrand;
            const matchesSearch = product.name.toLowerCase().includes(deferredSearchQuery.toLowerCase());
            const matchesPrice = product.basePrice >= priceRange[0] && product.basePrice <= priceRange[1];
            const matchesSize = selectedSizes.length === 0 || selectedSizes.some((size) => product.stockBySize?.[size] > 0);
            return matchesCategory && matchesBrand && matchesSearch && matchesPrice && matchesSize && product.status === 'active';
        });

        if (!mounted || !recoVariant || !visitorSeed) return result;

        switch (sortBy) {
            case 'aura':
                return rankCatalogProducts(result, {
                    viewedIds,
                    purchasedIds,
                    sessionServedIds,
                    exposureByProduct,
                    profile,
                    seed: `${visitorSeed}:${activeCategory}:${activeBrand}:${deferredSearchQuery}`,
                    variant: recoVariant || 'control',
                    segmentPopularity: getSegmentPopularity(segmentKey),
                });
            case 'popular': {
                const popularity = getSegmentPopularity(segmentKey);
                result.sort((a, b) => {
                    const brandA = (a.brand || '').toLowerCase();
                    const brandB = (b.brand || '').toLowerCase();
                    const categoryA = (a.category || '').toLowerCase();
                    const categoryB = (b.category || '').toLowerCase();
                    const scoreA =
                        (popularity.byProductId[a.id] || 0) * 3 +
                        (popularity.byBrand[brandA] || 0) * 2 +
                        (popularity.byCategory[categoryA] || 0);
                    const scoreB =
                        (popularity.byProductId[b.id] || 0) * 3 +
                        (popularity.byBrand[brandB] || 0) * 2 +
                        (popularity.byCategory[categoryB] || 0);
                    return scoreB - scoreA;
                });
                break;
            }
            case 'price_asc':
                result.sort((a, b) => a.basePrice - b.basePrice);
                break;
            case 'price_desc':
                result.sort((a, b) => b.basePrice - a.basePrice);
                break;
            case 'news':
                result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            default:
                break;
        }

        return result;
    }, [
        products,
        activeCategory,
        activeBrand,
        deferredSearchQuery,
        priceRange,
        selectedSizes,
        sortBy,
        viewedIds,
        purchasedIds,
        profile,
        visitorSeed,
        recoVariant,
        segmentKey,
        mounted
    ]);

    const displayProducts = useMemo(() =>
        filteredAndSortedProducts.slice(0, visibleCount),
    [filteredAndSortedProducts, visibleCount]);
    const hasMore = visibleCount < filteredAndSortedProducts.length;

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting && hasMore && !isFetchingMore && !loading) {
                    setIsFetchingMore(true);
                    setTimeout(() => {
                        setVisibleCount((prev) => prev + 12);
                        setIsFetchingMore(false);
                    }, 800); // 800ms natural latency for premium feel
                }
            },
            {
                rootMargin: '200px', // Trigger loading before user reaches the bottom
            }
        );

        const currentLoader = loaderRef.current;
        if (currentLoader) {
            observer.observe(currentLoader);
        }

        return () => {
            if (currentLoader) {
                observer.unobserve(currentLoader);
            }
        };
    }, [hasMore, isFetchingMore, loading]);

    const lastServedIdsRef = useRef<string>('');

    useEffect(() => {
        if (displayProducts.length === 0 || !recoVariant) return;
        const productIds = displayProducts.map((product) => product.id);
        const currentIdsHash = productIds.join(',');

        // Prevent update loop if products haven't actually changed
        if (lastServedIdsRef.current === currentIdsHash) return;
        lastServedIdsRef.current = currentIdsHash;

        markServed(productIds);
        addExposure(productIds);
        trackRecoImpression({
            variant: recoVariant,
            productIds,
            viewedIds,
            segment: segmentKey,
            productsMeta: displayProducts.map((product) => ({
                id: product.id,
                category: product.category,
                brand: product.brand,
            })),
            catalogSize: filteredAndSortedProducts.length,
        });
        setExperimentMetrics(getRecoExperimentMetrics());
    }, [
        addExposure,
        displayProducts,
        filteredAndSortedProducts.length,
        markServed,
        recoVariant || 'control',
        segmentKey,
        viewedIds,
    ]);

    const handleProductClick = useCallback(
        (product: (typeof displayProducts)[number]) => {
            if (!recoVariant) return;
            trackRecoClick({
                variant: recoVariant,
                productId: product.id,
                viewedIds,
                segment: segmentKey,
                category: product.category,
                brand: product.brand,
            });
            setExperimentMetrics(getRecoExperimentMetrics());
        },
        [recoVariant, segmentKey, viewedIds]
    );

    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
        e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
    };

    return (
        <main
            onMouseMove={handleMouseMove}
            className="flex flex-col min-h-screen overflow-x-hidden font-sans text-white selection:bg-[#00E5FF]/30 selection:text-white"
        >
            <Navbar />

            {/* Eliminated global fixed backdrop to match clean Index aesthetic */}

            <div className="relative z-[2] flex-1">
                <div className="hidden md:block">
                    <CatalogHero />
                </div>
                <div className="hidden md:block">
                    <LiquidationCarousel products={products} />
                </div>

                {/* Mobile Search & Filter Button */}
                <div className="block md:hidden px-4 pt-28 pb-4 bg-[#050505]">
                    <div className="flex items-center gap-3">
                        <div className="group relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-[#00E5FF]" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar en catálogo..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-12 w-full rounded-full border border-white/15 bg-black/45 pl-11 pr-4 text-xs font-bold tracking-[0.14em] text-white placeholder:text-white/30 focus:border-[#00E5FF]/50 focus:outline-none"
                            />
                        </div>
                        <button
                            onClick={() => setIsMobileFilterOpen(true)}
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#C6FF00] text-black hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(198,255,0,0.25)]"
                            aria-label="Abrir filtros"
                        >
                            <SlidersHorizontal size={18} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {/* Mobile Promo Banner Card */}
                <div className="block md:hidden px-4 py-3 bg-[#050505]">
                    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0A0A0A] via-black to-[#050505] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
                        {/* Background glow and subtle graphic */}
                        <div className="absolute right-0 bottom-0 h-40 w-40 rounded-full bg-[#00E5FF]/10 blur-3xl pointer-events-none" />
                        <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-35 pointer-events-none">
                            <div className="relative w-full h-full">
                                <Image
                                    src="/zapa_cat.png"
                                    alt="Zapatillas Éter"
                                    fill
                                    className="object-contain object-right-bottom scale-110 rotate-[-10deg]"
                                />
                            </div>
                        </div>

                        <div className="relative z-10 max-w-[65%] space-y-3">
                            <div className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#C6FF00] animate-pulse" />
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#C6FF00]">
                                    ÉTER EXPERIENCE
                                </span>
                            </div>
                            <h2 className="text-xl font-black uppercase leading-tight tracking-tight text-white font-sans">
                                STOCK URBANO. <br />
                                COMPRA RÁPIDA. <br />
                                <span className="text-[#C6FF00]">VENDE HOY.</span>
                            </h2>
                            <p className="text-[9px] font-medium leading-relaxed text-white/50">
                                Encuentra lo mejor del streetwear urbano. Compra rápido, vende rápido.
                            </p>
                            <button
                                onClick={() => {
                                    document.getElementById('catalog-grid-section')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="inline-flex items-center gap-2 rounded-full bg-[#C6FF00] px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.15em] text-black shadow-[0_5px_15px_rgba(198,255,0,0.25)] transition-all hover:scale-105"
                            >
                                VER STOCK <ArrowUpRight size={12} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Categories Selector */}
                <div className="block md:hidden px-4 py-4 bg-[#050505] space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-wider text-white font-sans">Categorías</h3>
                        <button
                            onClick={() => setActiveCategory('Todos')}
                            className="text-[10px] font-black uppercase tracking-wider text-[#C6FF00] hover:brightness-110 flex items-center gap-1"
                        >
                            Ver todas <ChevronDown size={12} className="-rotate-95" />
                        </button>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none scroll-smooth">
                        {cleanCategories.map((cat) => {
                            const isActive = activeCategory === cat;
                            const getIcon = (category: string) => {
                                switch(category.toLowerCase()) {
                                    case 'todos': return '🔥';
                                    case 'remeras': return '👕';
                                    case 'hoodies': return '🧥';
                                    case 'pantalones': return '👖';
                                    case 'zapatillas': return '👟';
                                    case 'accesorios': return '🎒';
                                    default: return '🏷️';
                                }
                            };
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={cn(
                                        "flex items-center gap-2 shrink-0 rounded-full px-5 py-3 text-xs font-bold border transition-all duration-300",
                                        isActive
                                            ? "bg-black text-[#C6FF00] border-[#C6FF00] shadow-[0_0_15px_rgba(198,255,0,0.15)]"
                                            : "bg-white/[0.03] text-white/60 border-white/5 hover:border-white/20"
                                    )}
                                >
                                    <span>{getIcon(cat)}</span>
                                    <span className="uppercase tracking-[0.12em] text-[10px] font-black">{cat}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Mobile Product Section Header */}
                <div id="catalog-grid-section" className="block md:hidden px-4 pt-4 pb-2 bg-[#050505] flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-wider text-white font-sans">
                        {activeCategory === 'Todos' ? 'Nuevos en ÉTER' : activeCategory}
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-wider text-white/40">
                        {filteredAndSortedProducts.length} Modelos
                    </span>
                </div>

                <section className="relative z-0 border-t-0 md:border-t border-white/10 bg-[#050505] px-4 py-8 lg:px-6">
                    <div className="paint-splatter splat-green -left-14 top-10 hidden md:block" />
                    <div className="paint-splatter splat-purple -right-10 bottom-20 hidden opacity-40 md:block" />
                    <div className="mx-auto max-w-[1600px] relative z-10">
                        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
                            <div className="min-w-0 order-2 lg:order-1">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, ease: easeOut }}
                                    className="eter-card mb-8 p-6 md:p-8 hidden md:block"
                                >
                                    <div className="mb-5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                                        <div>
                                            <nav className="mb-2 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.22em] text-white/40">
                                                <span>ETER</span>
                                                <span className="text-white/20">/</span>
                                                <span>CATALOGO</span>
                                                <span className="text-white/20">/</span>
                                                <span className="text-[#00E5FF]">LIQUIDACION</span>
                                            </nav>
                                            <h1 className="text-4xl font-black uppercase tracking-tight text-white md:text-5xl">
                                                Catalogo <span className="text-tri-gradient">Liquidacion</span>
                                            </h1>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className="group relative">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-[#00E5FF]" size={18} />
                                                <input
                                                    type="text"
                                                    placeholder="BUSCAR PRODUCTO..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="h-12 w-[280px] rounded-full border border-white/15 bg-black/40 pl-11 pr-4 text-xs font-bold tracking-[0.14em] text-white placeholder:text-white/30 focus:border-[#00E5FF]/50 focus:outline-none"
                                                />
                                            </div>
                                            <div className="flex items-center rounded-full border border-white/15 bg-black/50 p-1">
                                                <button
                                                    onClick={() => setViewMode('grid')}
                                                    className={`rounded-full p-2.5 transition-all ${viewMode === 'grid' ? 'bg-[#00E5FF] text-black' : 'text-white/40 hover:text-white'}`}
                                                >
                                                    <LayoutGrid size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setViewMode('list')}
                                                    className={`rounded-full p-2.5 transition-all ${viewMode === 'list' ? 'bg-[#00E5FF] text-black' : 'text-white/40 hover:text-white'}`}
                                                >
                                                    <List size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-5">
                                        <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-white/70">
                                            <span className="h-2 w-2 animate-pulse rounded-full bg-[#00E5FF]" />
                                            <span>{filteredAndSortedProducts.length} modelos activos</span>
                                        </div>
                                        <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-white/70">
                                            <CircleDot size={14} className="text-[#C6FF00]" />
                                            <span>Categoria: {activeCategory}</span>
                                        </div>
                                        {activeBrand !== 'Todas' && (
                                            <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-white/70">
                                                <TrendingUp size={14} className="text-[#7A00FF]" />
                                                <span>Marca: {activeBrand}</span>
                                            </div>
                                        )}
                                        <div className="ml-auto flex items-center gap-4">
                                            <button
                                                onClick={openQuiz}
                                                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#00E5FF] transition-all hover:brightness-125"
                                            >
                                                <Sparkles size={13} />
                                                Re-calibrar Aura
                                            </button>
                                            <button
                                                onClick={resetFilters}
                                                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/40 transition-colors hover:text-white"
                                            >
                                                <RotateCcw size={13} />
                                                Limpiar filtros
                                            </button>
                                        </div>
                                    </div>

                                    {mounted && recoVariant && experimentMetrics && (
                                        <>
                                            <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-black/35 p-4 md:grid-cols-2 xl:grid-cols-4">
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/40">Variante activa</p>
                                                    <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-[#00E5FF]">
                                                        {recoVariant === 'personalized_diverse' ? 'Personalized Diverse' : 'Control'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/40">Cobertura catalogo</p>
                                                    <p className="mt-1 text-sm font-black text-white">
                                                        {((experimentMetrics.metricsByVariant.find((m) => m.variant === recoVariant)?.coverage || 0) * 100).toFixed(1)}%
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/40">Descubrimiento</p>
                                                    <p className="mt-1 text-sm font-black text-white">
                                                        {((experimentMetrics.metricsByVariant.find((m) => m.variant === recoVariant)?.discoveryRate || 0) * 100).toFixed(1)}%
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/40">Lift CTR / RPV</p>
                                                    <p className="mt-1 text-sm font-black text-white">
                                                        {(experimentMetrics.delta.ctrLift * 100).toFixed(1)}% / {(experimentMetrics.delta.revenuePerVisitorLift * 100).toFixed(1)}%
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-3 flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-[0.14em]">
                                                <span className={`${experimentMetrics.significance.ctr.significant ? 'text-[#C6FF00]' : 'text-white/45'}`}>
                                                    CTR p={experimentMetrics.significance.ctr.pValue.toFixed(4)}
                                                </span>
                                                <span className={`${experimentMetrics.significance.revenuePerVisitor.significant ? 'text-[#C6FF00]' : 'text-white/45'}`}>
                                                    RPV p={experimentMetrics.significance.revenuePerVisitor.pValue.toFixed(4)}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                                <div className="hidden md:block">
                                    <LiquidationCardsSection products={products} title="Productos en Liquidación" />
                                </div>

                                <AnimatePresence mode="wait">
                                     {loading ? (
                                         <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                             <CatalogSkeleton />
                                         </motion.div>
                                     ) : displayProducts.length > 0 ? (
                                         <motion.div
                                             key="grid"
                                             initial={{ opacity: 0, y: 24 }}
                                             animate={{ opacity: 1, y: 0 }}
                                             exit={{ opacity: 0, y: 24 }}
                                             transition={{ duration: 0.55, ease: easeOut }}
                                             className={`grid gap-3 md:gap-6 ${
                                                 viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' : 'grid-cols-1'
                                             }`}
                                         >
                                             {displayProducts.map((product, idx) => (
                                                 <motion.div
                                                     key={product.id}
                                                     initial={{ opacity: 0, y: 26, scale: 0.98 }}
                                                     whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                                     viewport={{ once: true, margin: '-40px' }}
                                                     transition={{ duration: 0.55, ease: easeOut, delay: (idx % 12) * 0.04 }}
                                                 >
                                                     <ProductCard
                                                         product={product}
                                                         viewMode={viewMode}
                                                         index={idx}
                                                         onProductClick={handleProductClick}
                                                     />
                                                 </motion.div>
                                             ))}
                                         </motion.div>
                                     ) : (
                                         <motion.div
                                             key="empty"
                                             initial={{ opacity: 0 }}
                                             animate={{ opacity: 1 }}
                                             className="flex flex-col items-center justify-center border border-dashed border-white/15 bg-black/35 px-6 py-24 text-center"
                                         >
                                             <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/5">
                                                  <LayoutTemplate size={34} className="text-white/30" />
                                             </div>
                                             <h3 className="mb-2 text-2xl font-black uppercase tracking-tight text-white">No hay resultados</h3>
                                             <p className="mb-7 text-sm font-bold uppercase tracking-[0.12em] text-white/45">Proba ajustando filtros para ver mas pares</p>
                                             <button
                                                 onClick={resetFilters}
                                                 className="rounded-full bg-[#00E5FF] px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-black transition-all hover:scale-105 hover:bg-white"
                                             >
                                                 Resetear busqueda
                                             </button>
                                         </motion.div>
                                     )}
                                </AnimatePresence>

                                {/* Target for Infinite Scroll */}
                                <div ref={loaderRef} className="h-10 w-full" />

                                {/* Premium Loading Spinner Indicator */}
                                {isFetchingMore && (
                                     <div className="mt-8 flex flex-col items-center justify-center gap-3 py-6">
                                         <div className="relative h-10 w-10">
                                             <div className="absolute inset-0 rounded-full border-2 border-[#00E5FF]/20" />
                                             <div className="absolute inset-0 rounded-full border-t-2 border-[#00E5FF] animate-spin" />
                                         </div>
                                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00E5FF]/80 animate-pulse">
                                             Cargando stock de lujo...
                                         </span>
                                     </div>
                                 )}
                            </div>

                            <aside className="hidden lg:block lg:order-2 lg:pl-10 lg:border-l lg:border-white/5 relative h-full space-y-12">
                                <div className="absolute -left-[1px] top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#00E5FF]/20 via-[#00E5FF]/5 to-transparent hidden lg:block" />

                                <FilterSidebar
                                    categories={categories}
                                    activeCategory={activeCategory}
                                    onCategoryChange={setActiveCategory}
                                    occasions={['Casual', 'Deporte', 'Streetwear']}
                                    activeOccasion="Todos"
                                    onOccasionChange={() => {}}
                                    priceRange={priceRange}
                                    onPriceChange={setPriceRange}
                                    selectedSizes={selectedSizes}
                                    onSizesChange={setSelectedSizes}
                                    sortBy={sortBy}
                                    onSortChange={setSortBy}
                                    onReset={resetFilters}
                                    brands={['Nike', 'Jordan', 'Adidas', 'Yeezy', 'New Balance']}
                                    activeBrand={activeBrand}
                                    onBrandChange={setActiveBrand}
                                />
                                 <SidebarLiquidation products={products} />
                            </aside>
                        </div>
                    </div>
                </section>

                <section className="relative overflow-hidden border-t border-white/10 py-20">
                    <div className="paint-splatter splat-cyan -right-24 top-0 hidden opacity-20 lg:block" />
                    <div className="brush-stroke brush-tricolor left-[10%] top-16 hidden opacity-40 lg:block" />
                    <div className="mx-auto max-w-6xl px-6 text-center">
                        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#00E5FF]/35 bg-[#00E5FF]/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#00E5FF]">
                            Oferta activa
                        </span>
                        <h2 className="mb-5 text-5xl font-black uppercase leading-none tracking-tight text-white md:text-7xl">
                            Listo para vender <br /> <span className="text-tri-gradient">en automatico</span>
                        </h2>
                        <p className="mx-auto mb-9 max-w-2xl text-base text-white/60">
                            Sumate al canal mayorista, publica hoy y aprovecha los tramos de liquidacion para aumentar conversion.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <button className="inline-flex items-center gap-3 rounded-full bg-[#00E5FF] px-9 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-black transition-all hover:scale-105 hover:bg-white">
                                Registrarme ahora
                                <ArrowUpRight size={16} />
                            </button>
                            <button className="rounded-full border border-white/20 bg-white/[0.03] px-9 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all hover:border-[#C6FF00]/50 hover:text-[#C6FF00]">
                                Hablar con asesor
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            {/* Mobile Filter Drawer */}
            <AnimatePresence>
                {isMobileFilterOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileFilterOpen(false)}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md block md:hidden"
                    >
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-0 bottom-0 w-[85%] max-w-[400px] bg-[#050505] border-l border-white/10 p-6 overflow-y-auto flex flex-col text-white"
                        >
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                                <h3 className="text-sm font-black uppercase tracking-wider text-white">Filtros</h3>
                                <button
                                    onClick={() => setIsMobileFilterOpen(false)}
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white hover:text-[#C6FF00] hover:border-[#C6FF00]/40 transition-all"
                                    aria-label="Cerrar filtros"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 space-y-6">
                                <FilterSidebar
                                    categories={categories}
                                    activeCategory={activeCategory}
                                    onCategoryChange={setActiveCategory}
                                    occasions={['Casual', 'Deporte', 'Streetwear']}
                                    activeOccasion="Todos"
                                    onOccasionChange={() => {}}
                                    priceRange={priceRange}
                                    onPriceChange={setPriceRange}
                                    selectedSizes={selectedSizes}
                                    onSizesChange={setSelectedSizes}
                                    sortBy={sortBy}
                                    onSortChange={setSortBy}
                                    onReset={resetFilters}
                                    brands={['Nike', 'Jordan', 'Adidas', 'Yeezy', 'New Balance']}
                                    activeBrand={activeBrand}
                                    onBrandChange={setActiveBrand}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AuraQuiz />
            <PulseTicker />
            <Footer />
        </main>
    );
}
