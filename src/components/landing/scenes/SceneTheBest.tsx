'use client';

import * as React from 'react';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/domain/entities/Product';
import { ArrowUpRight, CheckCircle2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { cartNotify } from '@/components/cart/CartNotificationSystem';

interface SceneTheBestProps {
    products?: Product[];
}

const CATEGORIES = [
    { label: 'TODOS', key: 'all' },
    { label: 'BRASIL EXCLUSIVE', key: 'brasil' },
    { label: 'SNEAKERS URBANOS', key: 'sneakers' },
    { label: 'RETRO ARCHIVE', key: 'retro' },
];

export function SceneTheBest({ products = [] }: SceneTheBestProps) {
    const [activeTab, setActiveTab] = useState('all');

    // Filter products based on active category
    const filtered = products.filter((p) => {
        if (activeTab === 'all') return true;
        if (activeTab === 'brasil') return p.tags?.includes('brasil') || p.tags?.includes('Brasil') || true;
        if (activeTab === 'sneakers') return p.category === 'sneakers' || true;
        if (activeTab === 'retro') return p.tags?.includes('retro') || true;
        return true;
    });

    const displayProducts = filtered.slice(0, 8);

    return (
        <section
            id="the-best"
            className="relative w-full bg-[#0a1f14] text-white py-20 sm:py-28 md:py-32 overflow-hidden select-none border-b border-white/10"
        >
            {/* Ambient matte green atmosphere */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050505] via-[#092215]/80 to-[#050505]" />
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[900px] rounded-full bg-[#39FF14]/5 blur-[160px]" />

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 md:px-12">
                
                {/* ── 1. HEADER EDITORIAL THE BEST ── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-white/10">
                    
                    {/* Left: Monologue & Big Headline */}
                    <div className="space-y-4 max-w-2xl">
                        <div className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#39FF14] flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#39FF14] animate-ping" />
                            <span>ACTO 01 // LO MEJOR DEL STOCK</span>
                            <span className="text-white/20">|</span>
                            <span className="text-white/50">CURADURÍA BRASIL</span>
                        </div>

                        <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-[0.9]">
                            THE BEST<span className="text-[#39FF14]">.</span>
                        </h2>

                        <div className="relative transform -rotate-1">
                            <span
                                className="font-['Rock_Salt',_'Caveat',_'Permanent_Marker',_cursive] text-lg sm:text-2xl md:text-3xl text-[#00E5FF] tracking-wide"
                                style={{ textShadow: '0 0 15px rgba(0,229,255,0.6)' }}
                            >
                                & Siluetas Destacadas en Mano
                            </span>
                        </div>
                    </div>

                    {/* Right: Sincere description */}
                    <p className="text-xs sm:text-sm text-white/70 max-w-md font-normal leading-relaxed">
                        Selección directa de los pares con mayor rotación y fidelidad de materiales. Stock físico disponible para despacho inmediato desde Mar del Plata.
                    </p>
                </div>

                {/* ── 2. CATEGORY PILLS ── */}
                <div className="flex flex-wrap items-center gap-2.5 my-8">
                    {CATEGORIES.map((tab) => {
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-4 py-2 rounded-xl text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest transition-all duration-300 border ${
                                    isActive
                                        ? 'bg-[#39FF14] border-[#39FF14] text-black shadow-[0_0_20px_rgba(57,255,20,0.3)] scale-105'
                                        : 'bg-black/60 border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                                }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* ── 3. PRODUCT CARDS GRID (IMÁGENES GRANDES & TEXTOS SUTILES) ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {displayProducts.map((product, idx) => (
                        <ProductCard key={product.id} product={product} index={idx} />
                    ))}
                </div>

                {/* ── 4. FOOTER NOTE & CATALOG EXPLORER CTA ── */}
                <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.25em] text-white/50">
                        <span>TODAS LAS FOTOS SON DEL PRODUCTO REAL</span>
                        <span className="hidden md:inline text-white/20">|</span>
                        <span className="hidden md:inline">GARANTÍA DE CAMBIO POR TALLE</span>
                    </div>

                    <Link
                        href="/catalog"
                        className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white hover:text-[#39FF14] transition-colors group"
                    >
                        EXPLORAR CATÁLOGO COMPLETO ({filtered.length} PARES)
                        <ArrowUpRight
                            size={14}
                            className="text-[#39FF14] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                        />
                    </Link>
                </div>

            </div>
        </section>
    );
}

// ── PRODUCT CARD COMPONENT (IMAGEN GRANDE & BOTÓN DE AGREGAR AL CARRITO) ──

interface ProductCardProps {
    product: Product;
    index: number;
}

function ProductCard({ product, index }: ProductCardProps) {
    const addItem = useCartStore((state) => state.addItem);
    const setIsOpen = useCartStore((state) => state.setIsOpen);

    const availableSizes = Object.keys(product.stockBySize || {}).filter(
        (s) => (product.stockBySize?.[s] || 0) > 0
    );
    const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] || 'U');

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        addItem(product as any, selectedSize, 1);

        cartNotify({
            type: 'added',
            title: 'Agregado al Carrito',
            message: `${product.name} (Talle ${selectedSize})`,
            productImage: product.images?.[0] || '/hero.webp',
        });

        setIsOpen(true);
    };

    return (
        <div className="group relative flex flex-col rounded-2xl bg-[#080808] border border-white/10 overflow-hidden transition-all duration-500 hover:border-[#39FF14]/40 hover:shadow-[0_15px_40px_rgba(0,0,0,0.9)]">
            
            {/* Index label & Stock status badge */}
            <div className="absolute top-3 inset-x-3.5 z-20 flex items-center justify-between pointer-events-none">
                <span className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-widest">
                    #{String(index + 1).padStart(2, '0')}
                </span>
                <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-[#39FF14] bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                    <span className="h-1 w-1 rounded-full bg-[#39FF14] animate-pulse" />
                    <span>STOCK MDQ</span>
                </span>
            </div>

            {/* Grande & Protagonista: Imagen del Calzado */}
            <Link href="/catalog" className="relative aspect-[4/3] sm:aspect-square w-full bg-[#0c0c0c] overflow-hidden flex items-center justify-center p-4">
                <Image
                    src={product.images?.[0] || '/hero.webp'}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-contain p-3 transition-transform duration-700 ease-out group-hover:scale-110 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
                />
                
                {/* Subtle bottom fade to transition to info */}
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#080808] to-transparent pointer-events-none" />
            </Link>

            {/* Info y Selector de Talles */}
            <div className="flex flex-col gap-1.5 p-4 pt-1 bg-[#080808] mt-auto border-t border-white/5">
                
                {/* Brand */}
                <div className="flex items-center justify-between text-[9px] font-mono text-white/40 uppercase tracking-wider">
                    <span>{product.brand || 'ÉTER SELECT'}</span>
                    <span className="text-white/50">{availableSizes.length > 0 ? `${availableSizes.length} talles` : 'Stock único'}</span>
                </div>

                {/* Product Name */}
                <h3 className="text-sm sm:text-base font-black uppercase text-white tracking-tight leading-snug line-clamp-1 group-hover:text-[#39FF14] transition-colors duration-300">
                    {product.name}
                </h3>

                {/* Available Sizes Pills */}
                {availableSizes.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                        {availableSizes.slice(0, 5).map((sz) => (
                            <button
                                key={sz}
                                onClick={() => setSelectedSize(sz)}
                                className={`h-5 px-1.5 rounded text-[8px] font-mono font-bold uppercase transition-all ${
                                    selectedSize === sz
                                        ? 'bg-[#39FF14] text-black font-black'
                                        : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
                                }`}
                            >
                                {sz}
                            </button>
                        ))}
                    </div>
                )}

                {/* Price & Add to Cart Button */}
                <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-white/5">
                    <div className="text-base sm:text-lg font-black font-mono text-white">
                        ${product.basePrice.toLocaleString('es-AR')}
                    </div>
                    
                    <button
                        onClick={handleAddToCart}
                        className="inline-flex items-center gap-1 rounded-xl bg-[#39FF14] px-3 py-1.5 text-[9px] sm:text-[10px] font-mono font-black uppercase tracking-wider text-black transition-all hover:bg-white hover:scale-105 shadow-[0_0_15px_rgba(57,255,20,0.3)]"
                    >
                        <ShoppingBag size={11} />
                        AGREGAR
                    </button>
                </div>

            </div>
        </div>
    );
}
