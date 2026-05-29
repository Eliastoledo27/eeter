'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Plus, Minus, RotateCcw, ShoppingBag, Heart, Check, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import { useFavoritesStore } from '@/store/favorites-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Product } from '@/domain/entities/Product';
import { FadeInImage } from '@/components/ui/FadeInImage';

interface QuickPreviewModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}

export function QuickPreviewModal({ product, isOpen, onClose }: QuickPreviewModalProps) {
    const { addItem, setIsOpen: setIsCartOpen } = useCartStore();
    const { toggle, has } = useFavoritesStore();

    // Image navigation & zoom state
    const [selectedImage, setSelectedImage] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const imageContainerRef = useRef<HTMLDivElement>(null);

    // Product specification state
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [isAdding, setIsAdding] = useState(false);
    const isFavorite = product ? has(product.id) : false;

    // Reset state on open/product change
    useEffect(() => {
        if (product) {
            setSelectedImage(0);
            setZoom(1);
            setPan({ x: 0, y: 0 });
            
            // Get first available size
            const available = Object.entries(product.stockBySize || {})
                .filter(([, qty]) => Number(qty) > 0)
                .sort(([a], [b]) => {
                    const numA = parseInt(a);
                    const numB = parseInt(b);
                    return isNaN(numA) || isNaN(numB) ? a.localeCompare(b) : numA - numB;
                });
            
            setSelectedSize(available?.[0]?.[0] || 'Unique');
        }
    }, [product, isOpen]);

    // Zoom Handlers
    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 0.5, 4));
    };

    const handleZoomOut = () => {
        setZoom(prev => {
            const nextZoom = Math.max(prev - 0.5, 1);
            if (nextZoom === 1) {
                setPan({ x: 0, y: 0 });
            }
            return nextZoom;
        });
    };

    const handleZoomReset = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    // Pan Handlers for click-and-drag & touch
    const handleMouseDown = (e: React.MouseEvent) => {
        if (zoom <= 1) return;
        e.preventDefault();
        setIsDragging(true);
        dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || zoom <= 1) return;
        e.preventDefault();
        
        // Calculate bounded panning
        const maxPan = (zoom - 1) * 150; // simple boundary
        const newX = e.clientX - dragStart.current.x;
        const newY = e.clientY - dragStart.current.y;
        
        setPan({
            x: Math.max(-maxPan, Math.min(maxPan, newX)),
            y: Math.max(-maxPan, Math.min(maxPan, newY))
        });
    };

    const handleMouseUpOrLeave = () => {
        setIsDragging(false);
    };

    // Touch Support for mobile zoom/pan
    const handleTouchStart = (e: React.TouchEvent) => {
        if (zoom <= 1 || e.touches.length !== 1) return;
        const touch = e.touches[0];
        setIsDragging(true);
        dragStart.current = { x: touch.clientX - pan.x, y: touch.clientY - pan.y };
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || zoom <= 1 || e.touches.length !== 1) return;
        const touch = e.touches[0];
        const maxPan = (zoom - 1) * 150;
        const newX = touch.clientX - dragStart.current.x;
        const newY = touch.clientY - dragStart.current.y;

        setPan({
            x: Math.max(-maxPan, Math.min(maxPan, newX)),
            y: Math.max(-maxPan, Math.min(maxPan, newY))
        });
    };

    // Keyboard Zoom Support
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === '=' || e.key === '+') {
            handleZoomIn();
        } else if (e.key === '-') {
            handleZoomOut();
        } else if (e.key === '0') {
            handleZoomReset();
        }
    };

    const handleAddToCart = () => {
        if (!product) return;

        setIsAdding(true);
        
        setTimeout(() => {
            addItem(product, selectedSize, 1);
            setIsAdding(false);
            setIsCartOpen(true);
            
            toast.success(`Añadido al Arsenal`, {
                description: `${product.name} (Talle ${selectedSize}) se agregó al carrito con éxito.`,
                style: {
                    background: '#020202',
                    color: '#fff',
                    border: '1px solid rgba(0, 229, 255, 0.2)'
                }
            });
            onClose();
        }, 600);
    };

    if (!product) return null;

    const availableSizes = Object.entries(product.stockBySize || {})
        .filter(([, qty]) => Number(qty) > 0)
        .sort(([a], [b]) => {
            const numA = parseInt(a);
            const numB = parseInt(b);
            return isNaN(numA) || isNaN(numB) ? a.localeCompare(b) : numA - numB;
        });

    const isAvailable = availableSizes.length > 0;
    const currentPrice = product.liquidationActive && product.liquidationPrice
        ? product.liquidationPrice
        : product.basePrice;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent 
                className="max-w-5xl p-0 overflow-hidden bg-[#020202] border-white/10 rounded-[2rem] gap-0 text-white shadow-[0_0_80px_rgba(0,229,255,0.12)] focus:outline-none"
                onKeyDown={handleKeyDown}
            >
                <div className="flex flex-col lg:flex-row min-h-[500px] max-h-[90vh] lg:max-h-[85vh] overflow-y-auto lg:overflow-hidden no-scrollbar">
                    
                    {/* LEFT SECTION: Advanced Interactive Image & Zoom */}
                    <div className="w-full lg:w-[55%] bg-[#080808] border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col relative h-[380px] sm:h-[480px] lg:h-auto select-none">
                        
                        {/* Canvas Image Container */}
                        <div 
                            ref={imageContainerRef}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUpOrLeave}
                            onMouseLeave={handleMouseUpOrLeave}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleMouseUpOrLeave}
                            className={cn(
                                "flex-1 relative overflow-hidden flex items-center justify-center cursor-all-scroll bg-radial-gradient",
                                zoom > 1 ? "cursor-grabbing" : "cursor-grab"
                            )}
                        >
                            <div
                                style={{
                                    transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                                    transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                }}
                                className="relative w-full h-full p-8 sm:p-12 flex items-center justify-center"
                            >
                                <FadeInImage
                                    src={product.images?.[selectedImage] || '/placeholder-shoe.png'}
                                    alt={`Imagen de ${product.name}`}
                                    fill
                                    priority
                                    containerClassName="bg-transparent"
                                    className="object-contain max-h-[80%]"
                                />
                            </div>

                            {/* Floating Neon Scan Effect */}
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-transparent via-[#00E5FF]/5 to-transparent animate-pulse" />

                            {/* Badges */}
                            <div className="absolute top-6 left-6 flex flex-col gap-2 z-20">
                                <span className="bg-black/60 backdrop-blur-xl text-[#00E5FF] px-4 py-1 text-[8px] font-black uppercase tracking-widest border border-[#00E5FF]/20 rounded-md">
                                    {product.brand} • ORIGINAL
                                </span>
                                {product.liquidationActive && (
                                    <span className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-1 text-[8px] font-black uppercase tracking-widest rounded-md shadow-lg shadow-red-500/20">
                                        LIQUIDACIÓN -{product.liquidationDiscountPercent}%
                                    </span>
                                )}
                            </div>

                            {/* Controlled Zoom Widget */}
                            <div className="absolute bottom-6 right-6 flex items-center gap-1.5 bg-black/75 backdrop-blur-xl border border-white/10 rounded-xl p-1.5 z-20">
                                <button
                                    onClick={handleZoomOut}
                                    disabled={zoom <= 1}
                                    aria-label="Alejar"
                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
                                >
                                    <Minus size={14} />
                                </button>
                                <span className="text-[10px] font-black font-mono w-12 text-center text-[#00E5FF]">
                                    {Math.round(zoom * 100)}%
                                </span>
                                <button
                                    onClick={handleZoomIn}
                                    disabled={zoom >= 4}
                                    aria-label="Acercar"
                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
                                >
                                    <Plus size={14} />
                                </button>
                                {zoom > 1 && (
                                    <button
                                        onClick={handleZoomReset}
                                        aria-label="Restablecer vista"
                                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] transition-all"
                                    >
                                        <RotateCcw size={12} />
                                    </button>
                                )}
                            </div>

                            {/* Carousel Navigation (Desktop and touch ready) */}
                            {product.images && product.images.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedImage(prev => (prev === 0 ? product.images.length - 1 : prev - 1));
                                            handleZoomReset();
                                        }}
                                        aria-label="Imagen anterior"
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 hover:border-[#00E5FF]/50 text-white hover:text-[#00E5FF] flex items-center justify-center transition-all z-20"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedImage(prev => (prev === product.images.length - 1 ? 0 : prev + 1));
                                            handleZoomReset();
                                        }}
                                        aria-label="Imagen siguiente"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 hover:border-[#00E5FF]/50 text-white hover:text-[#00E5FF] flex items-center justify-center transition-all z-20"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Gallery Thumbnails */}
                        {product.images && product.images.length > 1 && (
                            <div className="p-4 bg-black/30 border-t border-white/5 flex gap-2 overflow-x-auto no-scrollbar justify-center">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setSelectedImage(idx);
                                            handleZoomReset();
                                        }}
                                        aria-label={`Ver imagen ${idx + 1}`}
                                        className={cn(
                                            "relative w-16 h-16 rounded-xl overflow-hidden border-2 bg-[#050505] transition-all shrink-0 p-1",
                                            selectedImage === idx 
                                                ? "border-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.25)]" 
                                                : "border-white/5 opacity-50 hover:opacity-100"
                                        )}
                                    >
                                        <FadeInImage src={img} alt={`${product.name} vista ${idx + 1}`} fill sizes="60px" containerClassName="rounded-lg" className="object-contain" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT SECTION: Info & Purchasing */}
                    <div className="w-full lg:w-[45%] p-8 sm:p-10 lg:p-12 flex flex-col justify-between overflow-y-auto no-scrollbar">
                        <div>
                            {/* Category Metadata */}
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black text-[#00E5FF] uppercase tracking-[0.3em]">
                                    {product.category}
                                </span>
                                <DialogDescription className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">
                                    ID: #{product.id.substring(0, 8)}
                                </DialogDescription>
                            </div>

                            {/* Product Title */}
                            <DialogTitle className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase leading-none mb-6">
                                {product.name}
                            </DialogTitle>

                            {/* Investment Pricing */}
                            <div className="flex items-baseline gap-3 mb-6 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest mb-1">Precio Revendedor</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-[#00E5FF] font-black text-lg">$</span>
                                        <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tighter">
                                            {Number(currentPrice).toLocaleString('es-AR')}
                                        </span>
                                    </div>
                                </div>
                                {product.liquidationActive && product.liquidationPrice && (
                                    <div className="flex flex-col opacity-50 line-through pl-4 border-l border-white/10">
                                        <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest mb-1">Regular</span>
                                        <span className="text-lg font-black text-white font-mono">
                                            ${Number(product.basePrice).toLocaleString('es-AR')}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Decoupled Description */}
                            <div className="space-y-4 mb-8">
                                <h4 className="text-[9px] font-black uppercase tracking-widest text-[#00E5FF]/60">Detalles de Ingeniería</h4>
                                <p className="text-neutral-400 text-sm leading-relaxed italic uppercase font-mono border-l-2 border-white/10 pl-4">
                                    {product.description || 'CONSTRUCCIÓN PREMIUM ADAPTABLE AL RITMO URBANO. MÁXIMA DURABILIDAD Y ALTA ROTACIÓN COMERCIAL.'}
                                </p>
                            </div>

                            {/* Premium Size Scale Grid */}
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-[#00E5FF]/60">Talles Disponibles</span>
                                    <span className="text-[9px] font-semibold text-neutral-500">
                                        {isAvailable ? `${availableSizes.length} talles en stock` : 'Agotado'}
                                    </span>
                                </div>
                                
                                {isAvailable ? (
                                    <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Seleccionar talle de calzado">
                                        {availableSizes.map(([size, qty]) => {
                                            const isSelected = selectedSize === size;
                                            const isLow = Number(qty) <= 2;
                                            
                                            return (
                                                <button
                                                    key={size}
                                                    type="button"
                                                    role="radio"
                                                    aria-checked={isSelected}
                                                    onClick={() => setSelectedSize(size)}
                                                    className={cn(
                                                        "h-12 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center border relative",
                                                        isSelected
                                                            ? "bg-[#00E5FF] border-[#00E5FF] text-black shadow-[0_0_20px_rgba(0,229,255,0.35)] scale-[1.03]"
                                                            : "bg-white/5 border-white/5 text-neutral-400 hover:border-[#00E5FF]/30 hover:text-white"
                                                    )}
                                                >
                                                    <span>{size}</span>
                                                    {isLow && (
                                                        <span className={cn(
                                                            "absolute bottom-0.5 text-[7px] font-bold uppercase",
                                                            isSelected ? "text-black/60" : "text-cyan-400/70"
                                                        )}>
                                                            Últimos
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="border border-red-500/20 bg-red-500/5 p-4 rounded-xl flex items-center gap-3 text-red-400">
                                        <HelpCircle size={18} />
                                        <span className="text-xs font-black uppercase tracking-widest">Agotado temporalmente en catálogo</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* PURCHASE ACTION CONTROLLER */}
                        <div className="pt-6 border-t border-white/5 mt-auto flex flex-col gap-4">
                            <div className="flex gap-3">
                                {/* Favorites Toggle Action */}
                                <button
                                    onClick={() => toggle(product.id)}
                                    aria-pressed={isFavorite}
                                    aria-label={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
                                    className={cn(
                                        "w-14 h-14 rounded-xl flex items-center justify-center border transition-all duration-300",
                                        isFavorite
                                            ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
                                            : "bg-white/5 border-white/5 text-neutral-400 hover:text-white hover:border-white/20"
                                    )}
                                >
                                    <Heart size={20} className={cn(isFavorite && "fill-rose-500")} />
                                </button>

                                {/* Main Add To Cart Action */}
                                <Button
                                    className={cn(
                                        "flex-1 h-14 font-black uppercase tracking-widest text-xs rounded-xl shadow-xl transition-all duration-500 flex items-center justify-center gap-3",
                                        isAvailable
                                            ? "bg-[#00E5FF] text-black hover:bg-white shadow-[#00E5FF]/10 hover:shadow-white/5"
                                            : "bg-neutral-800 text-neutral-600 cursor-not-allowed"
                                    )}
                                    onClick={handleAddToCart}
                                    disabled={isAdding || !isAvailable}
                                >
                                    {isAdding ? (
                                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    ) : isAvailable ? (
                                        <>
                                            <ShoppingBag size={16} />
                                            <span>AGREGAR AL ARSENAL</span>
                                        </>
                                    ) : (
                                        <span>AGOTADO</span>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
