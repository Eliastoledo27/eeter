'use client';

import { useState } from 'react';
import { ProductType, bulkUpdateProducts } from '@/app/actions/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Save, X, Info, Sparkles, AlertCircle, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/store/settings-store';

interface BulkStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedProducts: ProductType[];
    onSuccess: () => void;
}

export function BulkStockModal({ isOpen, onClose, selectedProducts, onSuccess }: BulkStockModalProps) {
    const { geminiApiKey } = useSettingsStore();
    const [stocks, setStocks] = useState<Record<string, Record<string, number>>>(
        selectedProducts.reduce((acc, p) => ({
            ...acc,
            [p.id]: p.stock_by_size || {}
        }), {})
    );
    const [aiInput, setAiInput] = useState('');
    const [isProcessingAI, setIsProcessingAI] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasUsedAI, setHasUsedAI] = useState(false);

    const allSizes = [
        '28', '29', '30', '31', '32', '33', '34', '35',
        '36', '37', '38', '39', '40', '41', '42', '43',
        '44', '45', '46', '47'
    ];

    const handleStockChange = (productId: string, size: string, value: string) => {
        const numValue = parseInt(value);
        setStocks(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [size]: isNaN(numValue) ? 0 : numValue
            }
        }));
    };

    const handleAIProcess = async () => {
        if (!aiInput.trim()) return;
        if (!geminiApiKey) {
            toast.error('Configura tu API Key de Gemini primero en Configuración.');
            return;
        }

        setIsProcessingAI(true);
        try {
            const prompt = `Analizá el siguiente texto y extraé las cantidades de stock por talle de calzado.
            Texto: "${aiInput}"
            
            Debes devolver ÚNICAMENTE un objeto JSON donde las claves sean los números de talle (strings de 2 dígitos como "38") y los valores sean la cantidad (numbers).
            
            REGLAS CRÍTICAS:
            1. Si dice "del 38 al 42", incluí 38, 39, 40, 41 y 42.
            2. Si dice "hay 10", asigná 10 a cada talle mencionado.
            3. Si el texto es general ("10 de cada una"), aplicá 10 a todos los talles del 28 al 47.
            
            Ejemplo de respuesta: {"38": 10, "39": 10, "40": 10}
            Responder solo el JSON limpio.`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (!response.ok) throw new Error('Error en la comunicación con la IA');

            const data = await response.json();
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

            const jsonMatch = textResponse.match(/\{.*\}/s);
            if (!jsonMatch) throw new Error('La IA no pudo interpretar el formato');

            const parsedStock = JSON.parse(jsonMatch[0]);

            // Create new stocks state applying the same parsed stock to all selected items
            const newStocks = { ...stocks };
            selectedProducts.forEach(p => {
                newStocks[p.id] = {
                    ...newStocks[p.id],
                    ...parsedStock
                };
            });

            setStocks(newStocks);
            setHasUsedAI(true);
            toast.success('¡IA procesada! Los valores se han cargado en la tabla inferior.');
            setAiInput('');

            // Auto-scroll to preview
            document.getElementById('stock-preview-grid')?.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('AI Stock Error:', error);
            toast.error('No pude interpretar la instrucción. Intentá algo como: "Hay 10 del 38 al 44"');
        } finally {
            setIsProcessingAI(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updates = selectedProducts.map(p => ({
                id: p.id,
                data: { stock_by_size: stocks[p.id] }
            })).filter(u => {
                const originalProduct = selectedProducts.find(p => p.id === u.id);
                return JSON.stringify(originalProduct?.stock_by_size) !== JSON.stringify(u.data.stock_by_size);
            });

            if (updates.length === 0) {
                toast.info('No hay cambios detectados para guardar.');
                onClose();
                return;
            }

            const result = await bulkUpdateProducts(updates);

            if (result.success) {
                toast.success(`${result.successCount} modelos actualizados.`);
                onSuccess();
                onClose();
            } else {
                toast.error('Error al guardar los cambios.');
            }
        } catch (error) {
            toast.error('Error al procesar la actualización.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 40 }}
                transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                className="w-full max-w-6xl bg-[#0A0A0A] rounded-[3rem] shadow-[0_0_120px_-20px_rgba(200,138,4,0.4)] border border-white/10 flex flex-col max-h-[90vh] overflow-hidden"
            >
                {/* 1. Header & Close */}
                <div className="p-8 pb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
                            STOCK <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C88A04] to-[#ECA413]">INTELIGENTE</span>
                        </h2>
                        <p className="text-gray-500 text-[10px] font-black tracking-[0.2em] uppercase mt-2">
                            Paso 1: Da una instrucción en lenguaje natural
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-gray-500 hover:text-white border border-white/5"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* 2. AI INPUT (THE HERO SECTION) */}
                <div className="p-8 pt-2">
                    <div className="bg-[#C88A04]/5 border border-[#C88A04]/20 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden group">
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#C88A04]/10 blur-[100px] rounded-full group-hover:bg-[#C88A04]/20 transition-all duration-1000" />

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#C88A04] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(200,138,4,0.4)]">
                                <Sparkles size={20} className="text-black" />
                            </div>
                            <span className="text-sm font-black uppercase tracking-widest text-[#C88A04]">¿Qué quieres hacer con el stock?</span>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Input
                                    autoFocus
                                    placeholder='Escribe algo como: "Poné 12 unidades de cada una del 38 al 45"'
                                    value={aiInput}
                                    onChange={(e) => setAiInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAIProcess()}
                                    className="h-20 bg-black/60 border-white/10 text-white font-bold text-lg px-8 rounded-2xl focus:border-[#C88A04] focus:ring-[#C88A04]/20 transition-all placeholder:text-gray-700 shadow-inner"
                                />
                                {isProcessingAI && (
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3 bg-black py-2 px-4 rounded-xl border border-[#C88A04]/20">
                                        <Loader2 className="animate-spin text-[#C88A04]" size={20} />
                                        <span className="text-[10px] font-black text-[#C88A04] tracking-widest uppercase">Procesando...</span>
                                    </div>
                                )}
                            </div>
                            <Button
                                onClick={handleAIProcess}
                                disabled={isProcessingAI || !aiInput.trim()}
                                className="h-20 px-12 bg-[#C88A04] hover:bg-[#ECA413] text-black font-black text-xs tracking-widest uppercase rounded-2xl transition-all shadow-[0_0_40px_-10px_rgba(200,138,4,0.5)] active:scale-95"
                            >
                                ACTUALIZAR CON IA
                            </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 px-1">
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Atajos rápidos:</span>
                            <button onClick={() => setAiInput("Hay 10 de cada una del 28 al 45")} className="text-[10px] text-gray-400 hover:text-[#C88A04] transition-colors border-b border-gray-800 hover:border-[#C88A04] pb-1 cursor-pointer">"10 cada una del 28-45"</button>
                            <button onClick={() => setAiInput("Llegaron 5 solo del talle 40")} className="text-[10px] text-gray-400 hover:text-[#C88A04] transition-colors border-b border-gray-800 hover:border-[#C88A04] pb-1 cursor-pointer">"5 solo del talle 40"</button>
                            <button onClick={() => setAiInput("Poner 0 de stock en todos")} className="text-[10px] text-gray-400 hover:text-red-500 transition-colors border-b border-gray-800 hover:border-red-500 pb-1 cursor-pointer">"Vaciar todo el stock"</button>
                        </div>
                    </div>
                </div>

                {/* 3. TRANSITION ARROW */}
                <div className="flex justify-center -my-4 relative z-10">
                    <div className="bg-[#0A0A0A] p-2 rounded-full border border-white/10 shadow-xl">
                        <ArrowDown className={`text-[#C88A04] ${isProcessingAI ? 'animate-bounce' : ''}`} size={24} />
                    </div>
                </div>

                {/* 4. VERIFICATION GRID (STEP 2) */}
                <div id="stock-preview-grid" className="flex-1 flex flex-col min-h-0">
                    <div className="px-8 mt-6 mb-2">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Paso 2: Verificá y Ajustá las Cantidades</span>
                            {hasUsedAI && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-emerald-500">
                                    <Sparkles size={12} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Valores cargados por IA</span>
                                </motion.div>
                            )}
                        </div>

                        <div className="grid grid-cols-[1fr,repeat(20,60px)] gap-4 pb-4 border-b border-white/5 opacity-50">
                            <div className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">Modelo / Diseñado en Brasil</div>
                            {allSizes.map(size => (
                                <div key={size} className="text-[9px] font-black text-center text-[#C88A04] uppercase tracking-[0.3em]">T{size}</div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-4 custom-scrollbar">
                        {selectedProducts.map((product) => (
                            <div
                                key={product.id}
                                className={`group grid grid-cols-[1fr,repeat(20,60px)] gap-4 items-center p-4 rounded-2xl border transition-all duration-700 ${hasUsedAI ? 'bg-[#C88A04]/5 border-[#C88A04]/20' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-black border border-white/10 relative group-hover:scale-110 transition-transform">
                                        <img
                                            src={product.images[0] || 'https://placehold.co/100x100'}
                                            alt={product.name}
                                            className="w-full h-full object-contain p-1"
                                        />
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="text-[10px] font-black text-white uppercase truncate tracking-tight">{product.name}</h4>
                                        <span className="text-[7px] text-gray-600 font-bold uppercase tracking-widest">{product.category}</span>
                                    </div>
                                </div>

                                {allSizes.map(size => (
                                    <Input
                                        key={size}
                                        type="number"
                                        min="0"
                                        value={stocks[product.id][size] ?? ''}
                                        onChange={(e) => handleStockChange(product.id, size, e.target.value)}
                                        className={`h-11 bg-black/60 border-white/5 text-white font-black text-center text-xs p-0 rounded-xl transition-all ${hasUsedAI ? 'border-[#C88A04]/30 text-[#C88A04] focus:border-[#C88A04]' : 'focus:border-[#C88A04]/50'}`}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 5. Footer */}
                <div className="p-8 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-500/40">
                        <AlertCircle size={14} />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em]">Los cambios se aplicarán a los modelos seleccionados</span>
                    </div>
                    <div className="flex gap-4">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="font-black text-[10px] tracking-[0.2em] text-gray-500 hover:text-white uppercase px-8"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-white text-black hover:bg-gray-200 px-12 h-16 rounded-[1.5rem] font-black text-[11px] tracking-[0.2em] uppercase shadow-2xl transition-all active:scale-95 flex items-center gap-3"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            INYECTAR STOCK FINAL
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
