'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ArrowUpRight, CheckCircle2, SlidersHorizontal, ArrowLeft, MessageCircle, ShoppingBag, Plus } from 'lucide-react';
import { Product } from '@/domain/entities/Product';
import { PreviewHeader } from '@/components/landing/primitives/PreviewHeader';
import { PreviewFooter } from '@/components/landing/primitives/PreviewFooter';
import { WhatsAppFloatingButton } from '@/components/layout/WhatsAppFloatingButton';
import { useCartStore } from '@/store/cart-store';
import { cartNotify } from '@/components/cart/CartNotificationSystem';

interface PreviewCatalogClientProps {
    initialProducts: Product[];
}

const BRAND_FILTERS = ['TODOS', 'NIKE', 'JORDAN', 'ADIDAS', 'NEW BALANCE', 'BRASIL SELECT'];
const SIZE_FILTERS = ['TODOS', '38', '39', '40', '41', '42', '43', '44'];

export function PreviewCatalogClient({ initialProducts }: PreviewCatalogClientProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('TODOS');
    const [selectedSize, setSelectedSize] = useState('TODOS');

    // Cart store actions
    const addItem = useCartStore((state) => state.addItem);
    const setIsOpen = useCartStore((state) => state.setIsOpen);

    // Selected size per product card
    const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

    // Filter logic
    const filteredProducts = useMemo(() => {
        return initialProducts.filter((product) => {
            const matchesSearch =
                searchQuery === '' ||
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase()));

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
    }, [initialProducts, searchQuery, selectedBrand, selectedSize]);

    const handleSelectSize = (productId: string, size: string) => {
        setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
    };

    const handleAddToCart = (product: Product) => {
        const availableSizes = Object.keys(product.stockBySize || {}).filter(
            (s) => (product.stockBySize?.[s] || 0) > 0
        );
        const chosenSize = selectedSizes[product.id] || availableSizes[0] || 'U';

        // Add to cart
        addItem(product as any, chosenSize, 1);

        // Trigger notification
        cartNotify({
            type: 'added',
            title: 'Agregado al Carrito',
            message: `${product.name} (Talle ${chosenSize})`,
            productImage: product.images?.[0] || '/hero.webp',
        });

        // Open cart drawer
        setIsOpen(true);
    };

    const handleWhatsAppInquiry = (productName: string, price: number, size?: string) => {
        const sizeText = size ? ` en talle ${size}` : '';
        const message = `Hola ÉTER, quisiera consultar disponibilidad del modelo ${productName}${sizeText} ($${price.toLocaleString('es-AR')}).`;
        window.open(`https://wa.me/5492236204002?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="relative min-h-screen w-full bg-[#050505] text-white selection:bg-[#39FF14] selection:text-black">
            
            {/* Lateral Neon Green Lines */}
            <div className="fixed top-0 bottom-0 left-0 w-[1.5px] bg-[#39FF14] shadow-[0_0_8px_#39FF14] z-40 pointer-events-none" />
            <div className="fixed top-0 bottom-0 right-0 w-[1.5px] bg-[#39FF14] shadow-[0_0_8px_#39FF14] z-40 pointer-events-none" />

            {/* Fixed Header */}
            <PreviewHeader />

            <main className="pt-28 sm:pt-36 pb-20 px-4 sm:px-8 md:px-12 max-w-7xl mx-auto">
                
                {/* Back to Home & Breadcrumb */}
                <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-10">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-white/60 hover:text-[#39FF14] transition-colors"
                    >
                        <ArrowLeft size={15} /> VOLVER AL INICIO
                    </Link>

                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#39FF14]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#39FF14] animate-pulse" />
                        <span>STOCK FÍSICO EN TIEMPO REAL</span>
                    </div>
                </div>

                {/* ── 1. CATALOG EDITORIAL HERO ── */}
                <div className="mb-12 sm:mb-16">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#39FF14] mb-3 flex items-center gap-2">
                        <span>ACTO 01 // ARCHIVO GENERAL</span>
                        <span className="text-white/20">|</span>
                        <span className="text-white/50">CURADURÍA BRASIL</span>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-[0.9]">
                                CATÁLOGO OFICIAL<span className="text-[#39FF14]">.</span>
                            </h1>
                            
                            <div className="relative mt-2 transform -rotate-1">
                                <span
                                    className="font-['Rock_Salt',_'Caveat',_'Permanent_Marker',_cursive] text-lg sm:text-2xl md:text-3xl text-[#00E5FF] tracking-wide"
                                    style={{ textShadow: '0 0 15px rgba(0,229,255,0.6)' }}
                                >
                                    & Siluetas Urbanas Disponibles
                                </span>
                            </div>
                        </div>

                        <p className="text-xs sm:text-sm text-white/70 max-w-md font-normal leading-relaxed">
                            Calzado urbano verificado par por par en Mar del Plata. Elegí tu talle, agregalo al carrito o pedilo directo por WhatsApp con despacho en 24/48hs.
                        </p>
                    </div>
                </div>

                {/* ── 2. SEARCH & FILTER CONTROLS ── */}
                <div className="rounded-3xl bg-[#090909] border border-white/10 p-5 sm:p-7 mb-10 shadow-[0_15px_40px_rgba(0,0,0,0.7)] space-y-6">
                    
                    {/* Search Input */}
                    <div className="relative w-full">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                            type="text"
                            placeholder="Buscar modelo o marca (ej. Nike Dunk, Jordan 4, Samba)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-2xl bg-[#121212] border border-white/10 pl-11 pr-4 py-3.5 text-xs sm:text-sm font-mono text-white placeholder-white/40 focus:border-[#39FF14] focus:outline-none focus:ring-1 focus:ring-[#39FF14] transition-all"
                        />
                    </div>

                    {/* Brand Filter Chips */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <span className="text-[10px] font-mono uppercase text-white/40 tracking-wider flex items-center gap-1">
                            <SlidersHorizontal size={12} /> MARCA:
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {BRAND_FILTERS.map((brand) => (
                                <button
                                    key={brand}
                                    onClick={() => setSelectedBrand(brand)}
                                    className={`px-3.5 py-1.5 rounded-xl text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest transition-all duration-300 border ${
                                        selectedBrand === brand
                                            ? 'bg-[#39FF14] border-[#39FF14] text-black shadow-[0_0_15px_rgba(57,255,20,0.3)]'
                                            : 'bg-[#141414] border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                                    }`}
                                >
                                    {brand}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Size Filter Chips */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2 border-t border-white/5">
                        <span className="text-[10px] font-mono uppercase text-white/40 tracking-wider">
                            TALLES EN STOCK:
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {SIZE_FILTERS.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-300 border ${
                                        selectedSize === size
                                            ? 'bg-white border-white text-black font-black'
                                            : 'bg-[#141414] border-white/10 text-white/50 hover:border-white/30 hover:text-white'
                                    }`}
                                >
                                    {size === 'TODOS' ? 'TODOS' : `AR ${size}`}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>

                {/* ── 3. PRODUCT SHOWCASE GRID ── */}
                <div className="flex items-center justify-between text-xs font-mono text-white/40 uppercase tracking-widest mb-6">
                    <span>MOSTRANDO {filteredProducts.length} MODELOS DISPONIBLES</span>
                    {selectedBrand !== 'TODOS' && <span>FILTRO: {selectedBrand}</span>}
                </div>

                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product, idx) => {
                            const availableSizes = Object.keys(product.stockBySize || {}).filter(
                                (s) => (product.stockBySize?.[s] || 0) > 0
                            );
                            const currentSelectedSize = selectedSizes[product.id] || availableSizes[0] || 'U';

                            return (
                                <div
                                    key={product.id}
                                    className="group relative flex flex-col rounded-3xl bg-[#090909] border border-white/10 overflow-hidden transition-all duration-500 hover:border-[#39FF14]/50 hover:bg-[#0c0c0c] hover:shadow-[0_15px_40px_rgba(0,0,0,0.85),0_0_20px_rgba(57,255,20,0.06)]"
                                >
                                    {/* Index & Stock Badge */}
                                    <div className="absolute top-3.5 inset-x-3.5 z-20 flex items-center justify-between pointer-events-none">
                                        <span className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-widest">
                                            #{String(idx + 1).padStart(2, '0')}
                                        </span>
                                        <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-[#39FF14] bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                                            <CheckCircle2 size={10} />
                                            <span>STOCK FÍSICO</span>
                                        </span>
                                    </div>

                                    {/* Sneaker Image Frame */}
                                    <div className="relative aspect-square w-full bg-[#0d0d0d] overflow-hidden flex items-center justify-center p-5">
                                        <Image
                                            src={product.images?.[0] || '/hero.webp'}
                                            alt={product.name}
                                            fill
                                            unoptimized
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                            className="object-contain p-4 transition-transform duration-700 ease-out group-hover:scale-110 drop-shadow-[0_12px_25px_rgba(0,0,0,0.9)]"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#090909] to-transparent pointer-events-none" />
                                    </div>

                                    {/* Product Details & Action Buttons */}
                                    <div className="flex flex-col gap-2 p-5 pt-2 bg-[#090909] mt-auto border-t border-white/5">
                                        
                                        {/* Brand & Sizes indicator */}
                                        <div className="flex items-center justify-between text-[9px] font-mono text-white/40 uppercase tracking-wider">
                                            <span>{product.brand || 'ÉTER SELECT'}</span>
                                            <span className="text-white/60">
                                                {availableSizes.length > 0 ? `${availableSizes.length} talles disp.` : 'Stock único'}
                                            </span>
                                        </div>

                                        {/* Product Name */}
                                        <h3 className="text-sm sm:text-base font-black uppercase text-white tracking-tight leading-snug line-clamp-1 group-hover:text-[#39FF14] transition-colors duration-300">
                                            {product.name}
                                        </h3>

                                        {/* Size Selector Buttons */}
                                        {availableSizes.length > 0 && (
                                            <div className="pt-1">
                                                <div className="text-[9px] font-mono uppercase text-white/40 mb-1">Seleccionar Talle:</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {availableSizes.map((sz) => (
                                                        <button
                                                            key={sz}
                                                            onClick={() => handleSelectSize(product.id, sz)}
                                                            className={`h-6 px-2 rounded-md text-[9px] font-mono font-bold uppercase transition-all ${
                                                                currentSelectedSize === sz
                                                                    ? 'bg-[#39FF14] text-black font-black'
                                                                    : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                                                            }`}
                                                        >
                                                            {sz}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Price & Dual Action CTAs: Add to Cart & WhatsApp */}
                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                            <div className="text-base sm:text-lg font-black font-mono text-white">
                                                ${product.basePrice.toLocaleString('es-AR')}
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                {/* WhatsApp Inquiry Button */}
                                                <button
                                                    onClick={() => handleWhatsAppInquiry(product.name, product.basePrice, currentSelectedSize)}
                                                    aria-label="Consultar por WhatsApp"
                                                    title="Consultar por WhatsApp"
                                                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-[#39FF14] hover:bg-white/10 hover:border-[#39FF14]/40 transition-all"
                                                >
                                                    <MessageCircle size={14} />
                                                </button>

                                                {/* Add to Cart Button */}
                                                <button
                                                    onClick={() => handleAddToCart(product)}
                                                    className="inline-flex items-center gap-1 rounded-xl bg-[#39FF14] px-3 py-1.5 text-[10px] font-mono font-black uppercase tracking-wider text-black transition-all hover:bg-white hover:scale-105 shadow-[0_0_15px_rgba(57,255,20,0.3)]"
                                                >
                                                    <ShoppingBag size={12} />
                                                    CARRITO
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 border border-white/10 rounded-3xl bg-[#090909] text-center px-4">
                        <span className="text-4xl font-black text-white/20 mb-2">—</span>
                        <h3 className="text-lg font-black uppercase text-white">No encontramos modelos con ese criterio</h3>
                        <p className="text-xs text-white/50 max-w-sm mt-1">
                            Probá buscando con otro nombre o limpiando los filtros de talle y marca.
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedBrand('TODOS');
                                setSelectedSize('TODOS');
                            }}
                            className="mt-6 px-5 py-2 rounded-xl bg-white text-black font-mono text-xs font-bold uppercase tracking-widest hover:bg-[#39FF14] transition-colors"
                        >
                            REINICIAR FILTROS
                        </button>
                    </div>
                )}

                {/* Assurance Bottom Strip */}
                <div className="mt-16 rounded-3xl border border-white/10 bg-gradient-to-r from-white/[0.03] to-transparent p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="space-y-1 text-center sm:text-left">
                        <div className="text-sm sm:text-base font-black uppercase tracking-tight text-white">
                            ¿QUERÉS PRECIO MAYORISTA POR CANTIDAD?
                        </div>
                        <p className="text-xs text-white/60">
                            Escribinos directo a WhatsApp para acceder a listas de precios de revendedor con margen 100% libre.
                        </p>
                    </div>

                    <a
                        href="https://wa.me/5492236204002?text=Hola%20ÉTER,%20quisiera%20consultar%20la%20lista%20de%20precios%20mayoristas"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#39FF14] px-6 py-3 text-xs font-mono font-black uppercase tracking-widest text-black transition-all hover:bg-white hover:scale-105"
                    >
                        CONSULTAR MAYORISTA <ArrowUpRight size={14} />
                    </a>
                </div>

            </main>

            {/* Footer & WhatsApp Floating */}
            <PreviewFooter />
            <WhatsAppFloatingButton />
        </div>
    );
}
