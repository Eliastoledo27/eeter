'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { 
    Film, Sparkles, Copy, Check, Sliders, Palette, ShoppingBag, 
    Play, Info, RefreshCw, Terminal, Eye, Download 
} from 'lucide-react';
import { toast } from 'sonner';

// Dynamically import player wrapper with SSR disabled to prevent hydration errors
const RemotionPlayerWrapper = dynamic(
    () => import('@/components/video/RemotionPlayerWrapper'),
    { ssr: false }
);

interface ProductPreset {
    id: string;
    name: string;
    price: string;
    image: string;
    description: string;
}

const PRODUCT_PRESETS: ProductPreset[] = [
    {
        id: '1',
        name: 'ÉTER CYBER OVERSIZED T-SHIRT',
        price: '$28,500',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
        description: 'Algodón pesado premium con estampado reflectante de neón.'
    },
    {
        id: '2',
        name: 'AURA GLASS NEON SNEAKERS',
        price: '$64,200',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        description: 'Suela con cámara de luz reactiva y malla translucida.'
    },
    {
        id: '3',
        name: 'CHRONOS MATRIX SMARTWATCH',
        price: '$42,100',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
        description: 'Pantalla holográfica y chasis de carbono de aviación.'
    },
    {
        id: '4',
        name: 'VOID TECHNICAL CARGO PANTS',
        price: '$31,800',
        image: 'https://images.unsplash.com/photo-1517423568366-8b83523034fd?w=800',
        description: 'Nailon balístico impermeable con herrajes magnéticos fidlock.'
    }
];

const COLOR_PRESETS = [
    { name: 'Cyan Éter', value: '#00E5FF', glow: 'shadow-[#00E5FF]/20' },
    { name: 'Hyper Violet', value: '#9D4EDD', glow: 'shadow-[#9D4EDD]/20' },
    { name: 'Lime Matrix', value: '#39FF14', glow: 'shadow-[#39FF14]/20' },
    { name: 'Solar Orange', value: '#FF9E00', glow: 'shadow-[#FF9E00]/20' },
    { name: 'Ruby Cyber', value: '#FF0055', glow: 'shadow-[#FF0055]/20' }
];

export default function VideoGeneratorPage() {
    // Customization state
    const [selectedProductId, setSelectedProductId] = useState<string>('1');
    const [customProductName, setCustomProductName] = useState<string>('');
    const [customProductPrice, setCustomProductPrice] = useState<string>('');
    const [customProductImage, setCustomProductImage] = useState<string>('');
    
    const [resellerName, setResellerName] = useState<string>('AURA STORE');
    const [slogan, setSlogan] = useState<string>('EXCLUSIVE RESELLER COLLECTION');
    const [brandAccent, setBrandAccent] = useState<string>('#00E5FF');
    const [showScanlines, setShowScanlines] = useState<boolean>(true);
    const [glowIntensity, setGlowIntensity] = useState<number>(3);
    
    const [activeTab, setActiveTab] = useState<'product' | 'brand' | 'rendering'>('product');
    const [copiedCommand, setCopiedCommand] = useState<boolean>(false);

    // Get current active product details
    const activeProduct = useMemo(() => {
        if (selectedProductId === 'custom') {
            return {
                name: customProductName || 'PRODUCTO PERSONALIZADO',
                price: customProductPrice || '$0,00',
                image: customProductImage || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'
            };
        }
        return PRODUCT_PRESETS.find(p => p.id === selectedProductId) || PRODUCT_PRESETS[0];
    }, [selectedProductId, customProductName, customProductPrice, customProductImage]);

    // Handle preset selection
    const handleSelectPreset = (id: string) => {
        setSelectedProductId(id);
        if (id !== 'custom') {
            const preset = PRODUCT_PRESETS.find(p => p.id === id);
            if (preset) {
                setCustomProductName(preset.name);
                setCustomProductPrice(preset.price);
                setCustomProductImage(preset.image);
            }
        }
    };

    // Build JSON props for copyable render command
    const renderPropsJSON = useMemo(() => {
        return JSON.stringify({
            productName: activeProduct.name,
            productPrice: activeProduct.price,
            productImage: activeProduct.image,
            brandAccent,
            resellerName,
            slogan,
            showScanlines,
            glowIntensity
        });
    }, [activeProduct, brandAccent, resellerName, slogan, showScanlines, glowIntensity]);

    // Generate copyable CLI Render Command
    const cliCommand = useMemo(() => {
        // Escaping double quotes for powershell/bash compatible JSON string
        const escapedProps = renderPropsJSON.replace(/"/g, '\\"');
        return `npx remotion render src/remotion/Root.tsx ProductPromo public/promos/video-output.mp4 --props="${escapedProps}"`;
    }, [renderPropsJSON]);

    const handleCopyCommand = () => {
        navigator.clipboard.writeText(cliCommand);
        setCopiedCommand(true);
        toast.success('¡Comando CLI copiado al portapapeles!');
        setTimeout(() => setCopiedCommand(false), 2000);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header section with cyber decorations */}
            <div className="relative border border-white/5 bg-black/40 backdrop-blur-md rounded-2xl p-6 md:p-8 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#00E5FF]/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-[#00E5FF] animate-pulse" />
                            <span className="text-xs font-mono text-[#00E5FF] uppercase tracking-widest font-semibold">Media Engine V2.6</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase flex items-center gap-3">
                            <Film className="w-8 h-8 text-[#00E5FF] drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]" />
                            Generador de Video Promocional
                        </h1>
                        <p className="text-sm text-zinc-400 max-w-2xl font-normal leading-relaxed">
                            Diseña e interactúa con reels de ultra-lujo para tus productos en tiempo real mediante <strong className="text-zinc-200">Remotion</strong>. Configura transiciones fluidas, neones dinámicos y genera el código para renderizar contenido MP4 con calidad de estudio.
                        </p>
                    </div>
                </div>
            </div>

            {/* Dashboard Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT COL: Live Video Player Preview (4 Cols) */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-6 flex flex-col items-center">
                    <div className="w-full border border-white/5 bg-black/30 backdrop-blur-md rounded-2xl p-6 relative flex flex-col items-center">
                        <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-white/10 text-[10px] font-mono text-zinc-400">
                            <Eye className="w-3.5 h-3.5 text-[#00E5FF] animate-pulse" />
                            PREVISUALIZACIÓN EN VIVO
                        </div>

                        <div className="py-8 w-full flex justify-center">
                            <RemotionPlayerWrapper
                                productName={activeProduct.name}
                                productPrice={activeProduct.price}
                                productImage={activeProduct.image}
                                brandAccent={brandAccent}
                                resellerName={resellerName}
                                slogan={slogan}
                                showScanlines={showScanlines}
                                glowIntensity={glowIntensity}
                            />
                        </div>

                        {/* Player statistics badge */}
                        <div className="w-full flex justify-between items-center bg-zinc-950/80 border border-white/5 rounded-xl px-4 py-2.5 text-xs font-mono text-zinc-500">
                            <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
                                Resolution: 1080×1920 (9:16)
                            </span>
                            <span>30 FPS • 5s (150f)</span>
                        </div>
                    </div>

                    {/* Fast info tip */}
                    <div className="w-full border border-zinc-800/50 bg-zinc-950/40 rounded-xl p-4 flex gap-3 text-xs text-zinc-400 leading-normal font-normal">
                        <Info className="w-5 h-5 text-[#00E5FF] shrink-0" />
                        <div>
                            El reproductor utiliza WebGL y aceleración por hardware. Mueve la barra de reproducción inferior o arrastra con el cursor para inspeccionar frames individuales y transiciones elásticas.
                        </div>
                    </div>
                </div>

                {/* RIGHT COL: Customizer Workspace (8 Cols) */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                    
                    {/* Navigation Tabs */}
                    <div className="flex border-b border-white/5 bg-black/20 p-1.5 rounded-xl gap-2">
                        <button
                            onClick={() => setActiveTab('product')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase font-mono transition-all ${
                                activeTab === 'product'
                                    ? 'bg-gradient-to-r from-[#00E5FF]/10 to-blue-500/10 border border-[#00E5FF]/30 text-white shadow-[0_0_15px_rgba(0,229,255,0.1)]'
                                    : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                        >
                            <ShoppingBag className="w-4 h-4 text-[#00E5FF]" />
                            1. Producto
                        </button>
                        <button
                            onClick={() => setActiveTab('brand')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase font-mono transition-all ${
                                activeTab === 'brand'
                                    ? 'bg-gradient-to-r from-[#00E5FF]/10 to-blue-500/10 border border-[#00E5FF]/30 text-white shadow-[0_0_15px_rgba(0,229,255,0.1)]'
                                    : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                        >
                            <Palette className="w-4 h-4 text-purple-400" />
                            2. Identidad
                        </button>
                        <button
                            onClick={() => setActiveTab('rendering')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase font-mono transition-all ${
                                activeTab === 'rendering'
                                    ? 'bg-gradient-to-r from-[#00E5FF]/10 to-blue-500/10 border border-[#00E5FF]/30 text-white shadow-[0_0_15px_rgba(0,229,255,0.1)]'
                                    : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                        >
                            <Terminal className="w-4 h-4 text-emerald-400" />
                            3. Exportar (CLI)
                        </button>
                    </div>

                    {/* TAB 1 CONTENT: PRODUCT SELECTION */}
                    {activeTab === 'product' && (
                        <div className="border border-white/5 bg-black/40 backdrop-blur-md rounded-2xl p-6 space-y-6">
                            <div className="space-y-1">
                                <h3 className="text-sm font-mono tracking-widest text-[#00E5FF] uppercase font-bold flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4" />
                                    SELECCIÓN DE PRODUCTO
                                </h3>
                                <p className="text-xs text-zinc-400">Escoge un artículo prediseñado de tu catálogo o añade uno personalizado a continuación.</p>
                            </div>

                            {/* Presets Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {PRODUCT_PRESETS.map((preset) => {
                                    const isSelected = selectedProductId === preset.id;
                                    return (
                                        <button
                                            key={preset.id}
                                            onClick={() => handleSelectPreset(preset.id)}
                                            className={`text-left p-4 rounded-xl border transition-all flex gap-3 group relative overflow-hidden ${
                                                isSelected 
                                                    ? 'bg-zinc-900 border-[#00E5FF]/50 shadow-[0_0_20px_rgba(0,229,255,0.08)]' 
                                                    : 'bg-zinc-950/50 border-white/5 hover:border-white/15'
                                            }`}
                                        >
                                            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-zinc-900 border border-white/10 relative">
                                                <img 
                                                    src={preset.image} 
                                                    alt={preset.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                                                />
                                            </div>
                                            <div className="space-y-1 min-w-0">
                                                <h4 className="text-xs font-bold text-white truncate font-mono tracking-wider">{preset.name}</h4>
                                                <p className="text-xs font-semibold text-[#00E5FF] font-mono">{preset.price}</p>
                                                <p className="text-[10px] text-zinc-500 line-clamp-2 leading-snug">{preset.description}</p>
                                            </div>

                                            {isSelected && (
                                                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#00E5FF]" />
                                            )}
                                        </button>
                                    );
                                })}

                                {/* Custom Option Trigger */}
                                <button
                                    onClick={() => handleSelectPreset('custom')}
                                    className={`text-left p-4 rounded-xl border transition-all flex items-center justify-center gap-2 group relative overflow-hidden h-full ${
                                        selectedProductId === 'custom' 
                                            ? 'bg-zinc-900 border-[#00E5FF]/50 shadow-[0_0_20px_rgba(0,229,255,0.08)]' 
                                            : 'bg-zinc-950/50 border-white/5 hover:border-white/15 border-dashed'
                                    }`}
                                >
                                    <Sliders className="w-5 h-5 text-zinc-500 group-hover:text-[#00E5FF] transition-colors" />
                                    <div className="flex flex-col items-center">
                                        <span className="text-xs font-bold text-white font-mono tracking-wider">CREAR PERSONALIZADO</span>
                                        <span className="text-[9px] text-zinc-500 font-mono">Modificar datos a mano</span>
                                    </div>
                                    {selectedProductId === 'custom' && (
                                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#00E5FF]" />
                                    )}
                                </button>
                            </div>

                            {/* Conditional Custom Product Inputs */}
                            {selectedProductId === 'custom' && (
                                <div className="p-5 border border-[#00E5FF]/20 bg-black/60 rounded-xl space-y-4 animate-in slide-in-from-top-4 duration-300">
                                    <h4 className="text-xs font-mono font-bold text-[#00E5FF] uppercase tracking-wider">DATOS MANUALES DEL PRODUCTO</h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-semibold">Nombre del Artículo</label>
                                            <input 
                                                type="text" 
                                                placeholder="e.g. ÉTER CYBER OVERSIZED T-SHIRT"
                                                value={customProductName}
                                                onChange={(e) => setCustomProductName(e.target.value)}
                                                className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00E5FF] transition-colors"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-semibold">Precio / Etiqueta</label>
                                            <input 
                                                type="text" 
                                                placeholder="e.g. $28,500"
                                                value={customProductPrice}
                                                onChange={(e) => setCustomProductPrice(e.target.value)}
                                                className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00E5FF] transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-semibold">URL de Imagen del Producto</label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                placeholder="https://images.unsplash.com/..."
                                                value={customProductImage}
                                                onChange={(e) => setCustomProductImage(e.target.value)}
                                                className="flex-1 bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00E5FF] transition-colors"
                                            />
                                            <button
                                                onClick={() => {
                                                    setCustomProductImage('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800');
                                                    toast.success('¡Imagen de prueba añadida!');
                                                }}
                                                className="bg-zinc-900 border border-white/10 rounded-lg px-3 hover:bg-zinc-800 transition-colors text-[10px] font-mono font-bold uppercase"
                                            >
                                                Prueba
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2 CONTENT: BRAND & IDENTITIES */}
                    {activeTab === 'brand' && (
                        <div className="border border-white/5 bg-black/40 backdrop-blur-md rounded-2xl p-6 space-y-6">
                            <div className="space-y-1">
                                <h3 className="text-sm font-mono tracking-widest text-purple-400 uppercase font-bold flex items-center gap-1.5">
                                    <Palette className="w-4 h-4" />
                                    AJUSTES DE IDENTIDAD
                                </h3>
                                <p className="text-xs text-zinc-400">Establece la marca del revendedor, textos publicitarios y colores neón que darán vida al video.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-semibold">Nombre de la Tienda (Revendedor)</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. AURA STORE"
                                        value={resellerName}
                                        onChange={(e) => setResellerName(e.target.value)}
                                        className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500 transition-colors"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-semibold">Slogan / Llamada a Acción</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. EXCLUSIVE RESELLER COLLECTION"
                                        value={slogan}
                                        onChange={(e) => setSlogan(e.target.value)}
                                        className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Neon Accent Preset Picker */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-semibold block">Color Neón de Acento (Cyber Accent)</label>
                                <div className="flex flex-wrap gap-3">
                                    {COLOR_PRESETS.map((color) => {
                                        const isSelected = brandAccent.toLowerCase() === color.value.toLowerCase();
                                        return (
                                            <button
                                                key={color.name}
                                                onClick={() => setBrandAccent(color.value)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                                                    isSelected 
                                                        ? 'bg-zinc-900 border-white/20 text-white' 
                                                        : 'bg-zinc-950 border-white/5 text-zinc-400 hover:border-white/10'
                                                }`}
                                            >
                                                <span 
                                                    className={`w-3.5 h-3.5 rounded-full inline-block ${color.glow} shadow-[0_0_10px_2px_rgba(255,255,255,0.1)]`} 
                                                    style={{ backgroundColor: color.value }}
                                                />
                                                {color.name}
                                            </button>
                                        );
                                    })}
                                    
                                    {/* Custom Color Selector */}
                                    <div className="flex items-center gap-2 border border-white/5 bg-zinc-950 px-3 py-1 rounded-lg">
                                        <input 
                                            type="color" 
                                            value={brandAccent}
                                            onChange={(e) => setBrandAccent(e.target.value)}
                                            className="w-6 h-6 border-0 bg-transparent rounded-md cursor-pointer"
                                        />
                                        <span className="text-xs font-mono uppercase text-zinc-400">{brandAccent}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Technical Visuals */}
                            <div className="p-4 bg-zinc-950/60 border border-white/5 rounded-xl space-y-4">
                                <h4 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">EFECTOS VISUALES RETRO-FUTURISTAS</h4>
                                
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="checkbox" 
                                            id="scanlines"
                                            checked={showScanlines}
                                            onChange={(e) => setShowScanlines(e.target.checked)}
                                            className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-[#00E5FF] focus:ring-[#00E5FF]"
                                        />
                                        <label htmlFor="scanlines" className="text-xs font-mono text-zinc-300 cursor-pointer select-none">
                                            Activar Líneas de Escaneo CRT (Scanlines)
                                        </label>
                                    </div>

                                    <div className="flex items-center gap-3 flex-1 max-w-xs justify-end">
                                        <label className="text-[10px] font-mono text-zinc-400 uppercase font-semibold shrink-0">Intensidad del Brillo:</label>
                                        <input 
                                            type="range" 
                                            min="1" 
                                            max="5" 
                                            value={glowIntensity}
                                            onChange={(e) => setGlowIntensity(Number(e.target.value))}
                                            className="w-full h-1 bg-zinc-800 accent-purple-500 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <span className="text-xs font-mono font-bold text-white w-4 text-right">{glowIntensity}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3 CONTENT: EXPORT / RENDERING (CLI) */}
                    {activeTab === 'rendering' && (
                        <div className="border border-white/5 bg-black/40 backdrop-blur-md rounded-2xl p-6 space-y-6">
                            <div className="space-y-1">
                                <h3 className="text-sm font-mono tracking-widest text-emerald-400 uppercase font-bold flex items-center gap-1.5">
                                    <Terminal className="w-4 h-4" />
                                    RENDERIZACIÓN PROFESIONAL (CLI)
                                </h3>
                                <p className="text-xs text-zinc-400">Genera archivos de video reales de forma local. Copia el siguiente comando y ejecútalo en la terminal de tu sistema.</p>
                            </div>

                            {/* CLI Explanation */}
                            <div className="p-4 bg-zinc-950/80 border border-white/5 rounded-xl space-y-3">
                                <div className="flex gap-2 items-start">
                                    <Terminal className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">COMANDO DE EXPORTACIÓN</h4>
                                        <p className="text-[11px] text-zinc-400 font-normal leading-normal">
                                            Este comando toma los metadatos de configuración que elegiste arriba, los empaqueta como argumentos props y ejecuta el compilador Chromium embebido de Remotion para escupir un video MP4 nativo perfecto listo para subir.
                                        </p>
                                    </div>
                                </div>

                                {/* Live Preview Command Box */}
                                <div className="relative mt-2 rounded-lg overflow-hidden bg-black/90 border border-white/10 group">
                                    <pre className="p-4 overflow-x-auto text-[10px] font-mono text-zinc-300 leading-normal whitespace-pre-wrap break-all pr-12 max-h-48 custom-scrollbar">
                                        {cliCommand}
                                    </pre>
                                    <button
                                        onClick={handleCopyCommand}
                                        className="absolute top-3 right-3 p-2 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white transition-all shadow-md flex items-center gap-1.5"
                                        title="Copiar Comando"
                                    >
                                        {copiedCommand ? (
                                            <>
                                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                <span className="text-[10px] font-mono font-bold text-emerald-400">Copiado</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-mono font-bold">Copiar</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Step-by-Step Render Guide */}
                            <div className="space-y-3 font-normal text-xs text-zinc-400">
                                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">PASOS PARA EXPORTAR TU VIDEO:</h4>
                                <ul className="space-y-2 list-none pl-0">
                                    <li className="flex gap-2.5">
                                        <span className="flex h-5 w-5 rounded-full bg-zinc-900 border border-white/10 font-mono text-[10px] font-bold items-center justify-center shrink-0 text-zinc-300">1</span>
                                        <span>Asegúrate de que estás en el directorio raíz de la aplicación Éter CRM en tu terminal.</span>
                                    </li>
                                    <li className="flex gap-2.5">
                                        <span className="flex h-5 w-5 rounded-full bg-zinc-900 border border-white/10 font-mono text-[10px] font-bold items-center justify-center shrink-0 text-zinc-300">2</span>
                                        <span>Pega el comando copiado arriba en tu terminal de comandos y presiona Enter.</span>
                                    </li>
                                    <li className="flex gap-2.5">
                                        <span className="flex h-5 w-5 rounded-full bg-zinc-900 border border-white/10 font-mono text-[10px] font-bold items-center justify-center shrink-0 text-zinc-300">3</span>
                                        <span>El motor de renderizado de Remotion compilará las animaciones frame por frame y guardará el video en <code className="text-zinc-200 font-mono bg-zinc-900 px-1 py-0.5 rounded border border-white/5">public/promos/video-output.mp4</code>. ¡Listo!</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
