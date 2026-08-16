'use client';

import * as React from 'react';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Eye } from 'lucide-react';
import { SceneContainer } from '@/components/landing/primitives/SceneContainer';
import { EterButton } from '@/components/landing/primitives/EterButton';
import { QuickPreviewModal } from '@/components/landing/QuickPreviewModal';
import { Product } from '@/domain/entities/Product';
import { LANDING_CONTENT } from '@/config/landing-content';

export interface Scene03_NewDropProps {
    products?: Product[];
    className?: string;
}

const fallbackHeroProducts: Product[] = [
    {
        id: 'drop-01',
        name: 'ADIDAS FORUM LOW PREMIUM',
        description: 'Silueta urbana clásica de alta rotación con terminación en cuero legítimo.',
        basePrice: 55000,
        brand: 'Adidas',
        images: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=700&h=700&fit=crop'],
        category: 'Sneakers',
        stockBySize: { '39': 4, '40': 6, '41': 8, '42': 5 },
        totalStock: 23,
        status: 'active',
        createdAt: new Date(),
    },
    {
        id: 'drop-02',
        name: 'AIR JORDAN 1 RETRO HIGH',
        description: 'Modelo de culto internacional. Edición de alta demanda para catálogo de reventa.',
        basePrice: 95000,
        brand: 'Jordan',
        images: ['https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=700&h=700&fit=crop'],
        category: 'Sneakers',
        stockBySize: { '40': 2, '41': 4, '42': 3 },
        totalStock: 9,
        status: 'active',
        createdAt: new Date(),
    },
    {
        id: 'drop-03',
        name: 'ADIDAS SAMBA OG CLASSIC',
        description: 'La silueta más viral de la temporada. Rotación garantizada en menos de 48 horas.',
        basePrice: 55000,
        brand: 'Adidas',
        images: ['https://images.unsplash.com/photo-1562183241-b937e95585b6?q=80&w=700&h=700&fit=crop'],
        category: 'Sneakers',
        stockBySize: { '38': 3, '39': 5, '40': 8, '41': 7, '42': 4 },
        totalStock: 27,
        status: 'active',
        createdAt: new Date(),
    },
];

/**
 * Scene03_NewDrop (Art Direction V2 — Editorial Product Gallery)
 * Presentación de calzado como Objetos de Deseo.
 * Se eliminan las tarjetas acrílicas pequeñas; el producto respira en escala editorial.
 */
export function Scene03_NewDrop({ products, className }: Scene03_NewDropProps) {
    const { newDrop } = LANDING_CONTENT;
    const sceneRef = useRef<HTMLElement | null>(null);
    const itemsGridRef = useRef<HTMLDivElement | null>(null);
    const bridgeRef = useRef<HTMLDivElement | null>(null);

    const displayProducts = products && products.length >= 3 ? products.slice(0, 3) : fallbackHeroProducts;

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const handleOpenPreview = (product: Product) => {
        setSelectedProduct(product);
        setIsPreviewOpen(true);
    };

    useEffect(() => {
        if (!sceneRef.current || !itemsGridRef.current) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        gsap.registerPlugin(ScrollTrigger);

        const items = itemsGridRef.current.querySelectorAll('.editorial-product-item');

        const ctx = gsap.context(() => {
            gsap.fromTo(
                items,
                { opacity: 0, y: 35 },
                {
                    opacity: 1,
                    y: 0,
                    stagger: 0.15,
                    duration: 0.7,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: itemsGridRef.current,
                        start: 'top 80%',
                        end: 'top 40%',
                        scrub: 0.6,
                    },
                }
            );
        }, sceneRef);

        return () => ctx.revert();
    }, []);

    return (
        <SceneContainer
            ref={sceneRef}
            id="new-drop"
            className={className}
            fullHeight={false}
            withTexture={true}
        >
            {/* Editorial Header */}
            <div className="mb-12 sm:mb-16 md:mb-20 flex flex-col items-start md:flex-row md:items-end md:justify-between gap-6 border-b border-white/10 pb-8">
                <div>
                    <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.25em] text-white/50">
                        // 03 — SELECCIÓN DE TEMPORADA
                    </div>
                    <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.92] text-white">
                        {newDrop.title} <br />
                        <span className="text-white/40 italic font-light">
                            {newDrop.highlightText}
                        </span>
                    </h2>
                </div>

                <div className="text-left md:text-right">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#00E5FF]">
                        STOCK FÍSICO MAR DEL PLATA
                    </span>
                    <p className="mt-1 text-xs text-[#D1D1D6] font-normal max-w-xs">
                        Despacho inmediato y verificación física de talles.
                    </p>
                </div>
            </div>

            {/* Editorial Products Gallery (Open Composition, No Nested Boxes) */}
            <div
                ref={itemsGridRef}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12"
            >
                {displayProducts.map((product, idx) => {
                    const availableSizesCount = Object.keys(product.stockBySize || {}).length;

                    return (
                        <div
                            key={product.id}
                            className="editorial-product-item group flex flex-col cursor-pointer"
                            onClick={() => handleOpenPreview(product)}
                        >
                            {/* Massive Sneaker Visual with Floor Shadow */}
                            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#0a0a0a] border border-white/5 flex items-center justify-center p-6 transition-colors group-hover:border-white/20">
                                
                                {/* Item Number Stamp */}
                                <span className="absolute left-4 top-4 text-[10px] font-mono font-bold text-white/30 tracking-widest">
                                    0{idx + 1}
                                </span>

                                <Image
                                    src={product.images?.[0] || fallbackHeroProducts[0].images[0]}
                                    alt={product.name}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                    className="object-contain p-4 transition-transform duration-700 ease-out group-hover:scale-105"
                                />

                                {/* Subtle Quick View Action Overlay */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                    <span className="inline-flex items-center gap-2 rounded-xl bg-white text-black px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-2xl">
                                        <Eye size={14} /> Inspeccionar
                                    </span>
                                </div>
                            </div>

                            {/* Clean Typographic Metadata */}
                            <div className="mt-4 space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] font-mono uppercase text-white/40 tracking-wider">
                                    <span>{product.brand || 'ÉTER'}</span>
                                    <span>{availableSizesCount > 0 ? `${availableSizesCount} TALLES` : 'STOCK ÚNICO'}</span>
                                </div>

                                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white group-hover:text-[#00E5FF] transition-colors line-clamp-1">
                                    {product.name}
                                </h3>

                                <div className="pt-1 text-lg font-mono font-bold text-white">
                                    ${product.basePrice.toLocaleString('es-AR')}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* MONUMENTAL ARCHITECTURAL BRIDGE TO CATALOG */}
            <div
                ref={bridgeRef}
                className="mt-16 sm:mt-24 border-t border-b border-white/10 py-10 sm:py-14 flex flex-col sm:flex-row items-center justify-between gap-6"
            >
                <div className="space-y-1 text-center sm:text-left">
                    <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/40">
                        COLECCIÓN COMPLETA
                    </span>
                    <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
                        Explorá todas las siluetas en stock
                    </h3>
                </div>

                <EterButton
                    href={newDrop.catalogBridgeCta.href}
                    variant="solid-cyan"
                    size="lg"
                    icon={ArrowRight}
                    iconPosition="right"
                    fullWidth={true}
                    className="sm:w-auto tracking-widest font-bold"
                >
                    {newDrop.catalogBridgeCta.label}
                </EterButton>
            </div>

            {/* QuickPreviewModal */}
            <QuickPreviewModal
                product={selectedProduct}
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
            />
        </SceneContainer>
    );
}
