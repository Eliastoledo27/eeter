'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Search,
    ArrowLeft,
    SlidersHorizontal,
    CheckCircle2,
    ShoppingBag,
    MessageCircle,
    Eye,
    X,
    LayoutGrid,
    Grid2X2,
    ArrowUpDown,
    ArrowUpRight,
    Sparkles,
    Truck
} from 'lucide-react';
import { Product } from '@/domain/entities/Product';
import { PreviewHeader } from '@/components/landing/primitives/PreviewHeader';
import { PreviewFooter } from '@/components/landing/primitives/PreviewFooter';
import { WhatsAppFloatingButton } from '@/components/layout/WhatsAppFloatingButton';
import { useCartStore } from '@/store/cart-store';
import { cartNotify } from '@/components/cart/CartNotificationSystem';
import { ProductQuickViewModal } from '@/components/catalog/ProductQuickViewModal';

interface PreviewCatalogClientProps {
    initialProducts: Product[];
}

const BRAND_FILTERS = ['TODOS', 'NIKE', 'JORDAN', 'ADIDAS', 'NEW BALANCE', 'BRASIL SELECT'];
const SIZE_FILTERS = ['TODOS', '38', '39', '40', '41', '42', '43', '44'];

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

export function PreviewCatalogClient({ initialProducts }: PreviewCatalogClientProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('TODOS');
    const [selectedSize, setSelectedSize] = useState('TODOS');
    const [sortBy, setSortBy] = useState<SortOption>('featured');
    const [gridCols, setGridCols] = useState<'standard' | 'large'>('standard');
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

    // Cart store actions
    const addItem = useCartStore((state) => state.addItem);
    const setIsCartOpen = useCartStore((state) => state.setIsOpen);

    // Selected size per product card
    const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

    // Filter and Sort logic
    const filteredAndSortedProducts = useMemo(() => {
        let list = initialProducts.filter((product) => {
            const matchesSearch =
                searchQuery === '' ||
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesBrand =
                selectedBrand === 'TODOS' ||
                (selectedBrand === 'BRASIL SELECT'
                    ? !['NIKE', 'JORDAN', 'ADIDAS', 'NEW BALANCE'].includes(product.brand?.toUpperCase() || '')
                    : product.brand?.toUpperCase() === selectedBrand);

            const matchesSize =
                selectedSize === 'TODOS' ||
                (product.stockBySize && product.stockBySize[selectedSize] && product.stockBySize[selectedSize] > 0);

            return matchesSearch && matchesBrand && matchesSize;
        });

        // Apply Sorting
        return list.sort((a, b) => {
            if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
            if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
            if (sortBy === 'newest') {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            }
            return 0; // Default: featured order
        });
    }, [initialProducts, searchQuery, selectedBrand, selectedSize, sortBy]);

    const handleSelectSize = (productId: string, size: string) => {
        setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
    };

    const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();

        const availableSizes = Object.keys(product.stockBySize || {}).filter(
            (s) => (product.stockBySize?.[s] || 0) > 0
        );
        const chosenSize = selectedSizes[product.id] || availableSizes[0] || 'U';

        addItem(product as any, chosenSize, 1);

        cartNotify({
            type: 'added',
            title: 'Agregado al Carrito',
            message: `${product.name} (Talle AR ${chosenSize})`,
            productImage: product.images?.[0] || '/hero.webp',
        });

        setIsCartOpen(true);
    };

    const handleWhatsAppInquiry = (product: Product, size?: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const chosenSize = size || selectedSizes[product.id];
        const sizeText = chosenSize ? ` en talle ${chosenSize}` : '';
        const message = `Hola ÉTER Store, quisiera consultar disponibilidad del modelo ${product.name}${sizeText} ($${product.basePrice.toLocaleString('es-AR')}).`;
        window.open(`https://wa.me/5492236204002?text=${encodeURIComponent(message)}`, '_blank');
    };

    const hasActiveFilters = searchQuery !== '' || selectedBrand !== 'TODOS' || selectedSize !== 'TODOS';

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedBrand('TODOS');
        setSelectedSize('TODOS');
        setSortBy('featured');
    };

    return (
        <div className="relative min-h-screen w-full bg-[#050505] text-white selection:bg-[#39FF14] selection:text-black">
            {/* Ambient Subtle Background Glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-b from-[#00E5FF]/[0.03] to-transparent blur-3xl pointer-events-none z-0" />

            {/* Fixed Navigation Header */}
            <PreviewHeader />

            <main className="relative z-10 pt-20 sm:pt-28 pb-24 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto">
                {/* ── 1. MINIMALIST CATALOG TITLE ── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-none">
                            CALZADO URBANO<span className="text-[#39FF14]">.</span>
                        </h1>
                    </div>

                    <p className="text-xs sm:text-sm text-white/60 max-w-md font-normal leading-relaxed">
                        Curaduría exclusiva de sneakers importados de Brasil. Stock verificado par por par, despacho inmediato y garantía total.
                    </p>
                </div>

                {/* ── 3. SLEEK STICKY CONTROL & FILTER BAR ── */}
                <div className="sticky top-16 sm:top-20 z-30 mb-8 rounded-2xl bg-[#090909]/95 backdrop-blur-xl border border-white/10 p-3 sm:p-4 shadow-[0_10px_35px_rgba(0,0,0,0.85)] transition-all">
                    {/* Top Row: Search + Sort + Density Controls */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                            <input
                                type="text"
                                placeholder="Buscar modelo o marca (Nike, Jordan, Samba, Dunk)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl bg-[#121212] border border-white/10 pl-9 pr-8 py-2.5 text-xs font-mono text-white placeholder-white/40 focus:border-[#39FF14] focus:outline-none transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-2">
                            <div className="relative flex items-center">
                                <ArrowUpDown size={14} className="absolute left-3 text-white/40 pointer-events-none" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                                    className="appearance-none rounded-xl bg-[#121212] border border-white/10 pl-8 pr-8 py-2.5 text-xs font-mono font-bold text-white focus:border-[#39FF14] focus:outline-none cursor-pointer"
                                >
                                    <option value="featured">Recomendados</option>
                                    <option value="price-asc">Menor Precio</option>
                                    <option value="price-desc">Mayor Precio</option>
                                    <option value="newest">Novedades</option>
                                </select>
                            </div>

                            {/* Grid Density Switcher (Desktop) */}
                            <div className="hidden md:flex items-center rounded-xl bg-[#121212] border border-white/10 p-1">
                                <button
                                    onClick={() => setGridCols('standard')}
                                    title="Vista Grilla (4 columnas)"
                                    className={`p-1.5 rounded-lg transition-all ${
                                        gridCols === 'standard'
                                            ? 'bg-white/15 text-[#39FF14]'
                                            : 'text-white/40 hover:text-white'
                                    }`}
                                >
                                    <LayoutGrid size={15} />
                                </button>
                                <button
                                    onClick={() => setGridCols('large')}
                                    title="Vista Grande (2 columnas)"
                                    className={`p-1.5 rounded-lg transition-all ${
                                        gridCols === 'large'
                                            ? 'bg-white/15 text-[#39FF14]'
                                            : 'text-white/40 hover:text-white'
                                    }`}
                                >
                                    <Grid2X2 size={15} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row: Micro Brand & Size Chips */}
                    <div className="mt-3 pt-3 border-t border-white/5 flex flex-col gap-2">
                        {/* Brand Chips */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                            <span className="text-[9px] font-mono font-bold uppercase text-white/40 flex-shrink-0 flex items-center gap-1">
                                <SlidersHorizontal size={11} /> MARCA:
                            </span>
                            {BRAND_FILTERS.map((brand) => (
                                <button
                                    key={brand}
                                    onClick={() => setSelectedBrand(brand)}
                                    className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider flex-shrink-0 transition-all ${
                                        selectedBrand === brand
                                            ? 'bg-[#39FF14] text-black font-black shadow-[0_0_10px_rgba(57,255,20,0.3)]'
                                            : 'bg-[#141414] border border-white/10 text-white/60 hover:text-white hover:border-white/20'
                                    }`}
                                >
                                    {brand}
                                </button>
                            ))}
                        </div>

                        {/* Size Chips */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                            <span className="text-[9px] font-mono font-bold uppercase text-white/40 flex-shrink-0">
                                TALLE:
                            </span>
                            {SIZE_FILTERS.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider flex-shrink-0 transition-all ${
                                        selectedSize === size
                                            ? 'bg-white text-black font-black'
                                            : 'bg-[#141414] border border-white/10 text-white/50 hover:text-white hover:border-white/20'
                                    }`}
                                >
                                    {size === 'TODOS' ? 'TODOS' : `AR ${size}`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── 4. ACTIVE FILTERS & STATS SUMMARY ── */}
                <div className="flex items-center justify-between text-xs font-mono text-white/50 uppercase tracking-widest mb-6">
                    <div className="flex items-center gap-2">
                        <span>{filteredAndSortedProducts.length} MODELOS DISPONIBLES</span>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="inline-flex items-center gap-1 text-[10px] text-[#39FF14] hover:underline"
                            >
                                <X size={12} /> Limpiar filtros
                            </button>
                        )}
                    </div>
                </div>

                {/* ── 5. PRODUCT SHOWCASE GRID (HERO FOCUS) ── */}
                {filteredAndSortedProducts.length > 0 ? (
                    <div
                        className={`grid gap-5 sm:gap-6 ${
                            gridCols === 'large'
                                ? 'grid-cols-1 md:grid-cols-2'
                                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                        }`}
                    >
                        {filteredAndSortedProducts.map((product) => {
                            const availableSizes = Object.keys(product.stockBySize || {}).filter(
                                (s) => (product.stockBySize?.[s] || 0) > 0
                            );
                            const currentSelectedSize = selectedSizes[product.id] || availableSizes[0] || '';
                            const images = product.images && product.images.length > 0 ? product.images : ['/hero.webp'];
                            const cuotaPrice = Math.round(product.basePrice / 3);

                            return (
                                <div
                                    key={product.id}
                                    onClick={() => setQuickViewProduct(product)}
                                    className="group relative flex flex-col rounded-3xl bg-[#080808] border border-white/[0.08] overflow-hidden transition-all duration-500 hover:border-[#39FF14]/40 hover:bg-[#0c0c0c] hover:shadow-[0_15px_45px_rgba(0,0,0,0.9),0_0_20px_rgba(57,255,20,0.05)] cursor-pointer"
                                >
                                    {/* Stock Badge */}
                                    <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-1 text-[9px] font-mono font-bold text-[#39FF14] bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                                        <CheckCircle2 size={10} />
                                        <span>STOCK FÍSICO</span>
                                    </div>

                                    {/* Quick View Hover Trigger */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setQuickViewProduct(product);
                                        }}
                                        aria-label="Vista Rápida"
                                        className="absolute top-3.5 right-3.5 z-20 flex items-center gap-1 text-[10px] font-mono font-bold text-white bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#39FF14] hover:text-black"
                                    >
                                        <Eye size={12} />
                                        <span>VISTA RÁPIDA</span>
                                    </button>

                                    {/* ── Sneaker Image Hero Display ── */}
                                    <div
                                        className={`relative w-full bg-gradient-to-b from-[#101010] to-[#080808] overflow-hidden flex items-center justify-center p-6 ${
                                            gridCols === 'large' ? 'aspect-[4/3] sm:aspect-square' : 'aspect-square'
                                        }`}
                                    >
                                        {/* Primary Image */}
                                        <Image
                                            src={images[0]}
                                            alt={product.name}
                                            fill
                                            unoptimized
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                            className={`object-contain p-4 transition-all duration-700 ease-out drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)] ${
                                                images.length > 1
                                                    ? 'group-hover:opacity-0 group-hover:scale-105'
                                                    : 'group-hover:scale-110'
                                            }`}
                                        />

                                        {/* Secondary Image Crossfade on Hover (if available) */}
                                        {images.length > 1 && (
                                            <Image
                                                src={images[1]}
                                                alt={`${product.name} alternate view`}
                                                fill
                                                unoptimized
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                                className="object-contain p-4 transition-all duration-700 ease-out opacity-0 group-hover:opacity-100 scale-105 group-hover:scale-110 drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]"
                                            />
                                        )}

                                        {/* Subtle Floor Ambient Light */}
                                        <div className="absolute inset-x-4 bottom-2 h-1 bg-gradient-to-r from-transparent via-[#00E5FF]/20 to-transparent blur-[6px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </div>

                                    {/* ── Product Info & Actions ── */}
                                    <div className="flex flex-col gap-2 p-4 sm:p-5 pt-3 bg-[#080808] mt-auto border-t border-white/5">
                                        {/* Brand */}
                                        <div className="flex items-center justify-between text-[10px] font-mono text-white/40 uppercase tracking-widest">
                                            <span>{product.brand || 'ÉTER SELECT'}</span>
                                            <span className="text-[#39FF14]/80">
                                                {availableSizes.length > 0 ? `${availableSizes.length} talles` : 'Stock único'}
                                            </span>
                                        </div>

                                        {/* Product Name */}
                                        <h3 className="text-sm sm:text-base font-black uppercase text-white tracking-tight leading-snug line-clamp-1 group-hover:text-[#39FF14] transition-colors duration-300">
                                            {product.name}
                                        </h3>

                                        {/* Inline Size Selector Chips */}
                                        {availableSizes.length > 0 && (
                                            <div
                                                className="pt-1"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="flex flex-wrap gap-1">
                                                    {availableSizes.map((sz) => (
                                                        <button
                                                            key={sz}
                                                            onClick={() => handleSelectSize(product.id, sz)}
                                                            className={`h-6 px-2 rounded-md text-[9px] font-mono font-bold uppercase transition-all ${
                                                                currentSelectedSize === sz
                                                                    ? 'bg-[#39FF14] text-black font-black shadow-[0_0_8px_rgba(57,255,20,0.4)]'
                                                                    : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                                                            }`}
                                                        >
                                                            {sz}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Pricing & Installment Note */}
                                        <div className="flex items-baseline justify-between pt-2">
                                            <div className="text-base sm:text-lg font-black font-mono text-white">
                                                ${product.basePrice.toLocaleString('es-AR')}
                                            </div>
                                            <div className="text-[10px] font-mono text-white/50">
                                                3x ${cuotaPrice.toLocaleString('es-AR')}
                                            </div>
                                        </div>

                                        {/* Direct Dual Action CTAs */}
                                        <div
                                            className="grid grid-cols-4 gap-1.5 pt-2 border-t border-white/5"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {/* WhatsApp Inquiry Button */}
                                            <button
                                                onClick={(e) => handleWhatsAppInquiry(product, currentSelectedSize, e)}
                                                aria-label="Consultar por WhatsApp"
                                                title="Consultar por WhatsApp"
                                                className="col-span-1 flex h-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-[#39FF14] hover:bg-white/10 hover:border-[#39FF14]/40 transition-all"
                                            >
                                                <MessageCircle size={15} />
                                            </button>

                                            {/* Add to Cart Button */}
                                            <button
                                                onClick={(e) => handleAddToCart(product, e)}
                                                className="col-span-3 flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#39FF14] px-3 text-[10px] font-mono font-black uppercase tracking-wider text-black transition-all hover:bg-white hover:shadow-[0_0_15px_rgba(57,255,20,0.4)]"
                                            >
                                                <ShoppingBag size={13} />
                                                <span>AGREGAR</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* ── Empty State ── */
                    <div className="flex flex-col items-center justify-center py-20 border border-white/10 rounded-3xl bg-[#090909] text-center px-4">
                        <span className="text-3xl font-black text-white/20 mb-2">—</span>
                        <h3 className="text-lg font-black uppercase text-white">No encontramos modelos con ese criterio</h3>
                        <p className="text-xs text-white/50 max-w-sm mt-1">
                            Probá buscando con otro nombre o reiniciando los filtros de talle y marca.
                        </p>
                        <button
                            onClick={clearFilters}
                            className="mt-6 px-6 py-2.5 rounded-xl bg-[#39FF14] text-black font-mono text-xs font-black uppercase tracking-widest hover:bg-white transition-colors"
                        >
                            REINICIAR FILTROS
                        </button>
                    </div>
                )}

                {/* ── 6. WHOLESALE & RESELLER REVENUE STRIP ── */}
                <div className="mt-16 rounded-3xl border border-white/10 bg-gradient-to-r from-[#0d0d0d] via-[#090909] to-[#0d0d0d] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
                    <div className="space-y-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-[#39FF14] mb-1">
                            <Sparkles size={12} /> RED DE REVENDEDORES ÉTER
                        </div>
                        <div className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
                            ¿BUSCÁS COMPRAR POR MAYOR CON PRECIOS DIRECTOS DE BRASIL?
                        </div>
                        <p className="text-xs text-white/60 max-w-xl">
                            Accedé a listas mayoristas exclusivas, fotos de alta calidad para tus redes y stock físico asegurado en Mar del Plata.
                        </p>
                    </div>

                    <a
                        href="https://wa.me/5492236204002?text=Hola%20ÉTER,%20quisiera%20consultar%20la%20lista%20de%20precios%20mayoristas"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 inline-flex items-center gap-2 rounded-2xl bg-[#39FF14] px-6 py-3.5 text-xs font-mono font-black uppercase tracking-widest text-black transition-all hover:bg-white hover:scale-105 shadow-[0_0_20px_rgba(57,255,20,0.3)]"
                    >
                        CONSULTAR MAYORISTA <ArrowUpRight size={15} />
                    </a>
                </div>
            </main>

            {/* Quick View Modal */}
            <ProductQuickViewModal
                product={quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
            />

            {/* Footer & Floating WhatsApp */}
            <PreviewFooter />
            <WhatsAppFloatingButton />
        </div>
    );
}
