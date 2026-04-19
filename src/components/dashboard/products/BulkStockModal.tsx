'use client';

import { useState } from 'react';
import { ProductType, bulkUpdateProducts } from '@/app/actions/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Save, X, Info, Sparkles, AlertCircle, ArrowDown, Database, Cpu } from 'lucide-react';
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
            toast.error('ACCESO_DENEGADO: Configura tu API Key de Gemini en el Módulo de Configuración.');
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

            if (!response.ok) throw new Error('ERR_CON_IA: Fallo de enlace neurónico.');

            const data = await response.json();
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

            const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('ERR_FORMATO: Estructura no reconocida.');

            const parsedStock = JSON.parse(jsonMatch[0]);

            const newStocks = { ...stocks };
            selectedProducts.forEach(p => {
                newStocks[p.id] = {
                    ...newStocks[p.id],
                    ...parsedStock
                };
            });

            setStocks(newStocks);
            setHasUsedAI(true);
            toast.success('MATRIZ_IA_CONFIGURADA: Valores proyectados en la grilla.');
            setAiInput('');

            document.getElementById('stock-preview-grid')?.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('AI Stock Error:', error);
            toast.error('INS_FALLIDA: Intente: "10 unidades del 38 al 44"');
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
                toast.info('NO_DELTA_DETECTED: Registro sin cambios.');
                onClose();
                return;
            }

            const result = await bulkUpdateProducts(updates);

            if (result.success) {
                toast.success(`${result.successCount} REGISTROS_SINCRONIZADOS.`);
                onSuccess();
                onClose();
            } else {
                toast.error('ERR_DB: Fallo en la persistencia.');
            }
        } catch (error) {
            toast.error('ERR_SISTEMA: Proceso interrumpido.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-[40px]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-7xl bg-[#030303] rounded-[3.5rem] shadow-[0_0_150px_-30px_rgba(0,229,255,0.2)] border border-white/5 flex flex-col max-h-[92vh] overflow-hidden"
            >
                {/* 1. Header */}
                <div className="p-10 pb-6 flex items-center justify-between border-b border-white/5">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="bg-[#00E5FF]/10 p-2 rounded-lg border border-[#00E5FF]/20">
                                <Database size={16} className="text-[#00E5FF]" />
                            </div>
                            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
                                GESTIÓN_ <span className="text-[#00E5FF]">MATRIZ_STOCK</span>
                            </h2>
                        </div>
                        <p className="text-white/20 text-[10px] font-black tracking-[0.4em] uppercase">
                            SISTEMA DE ASIGNACIÓN MASIVA MEDIANTE PROCESAMIENTO NEURONAL
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-5 bg-white/[0.03] hover:bg-white/[0.08] rounded-2xl transition-all text-white/20 hover:text-white border border-white/5 active:scale-90"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* 2. AI INPUT */}
                <div className="p-10 pt-8 bg-gradient-to-b from-white/[0.01] to-transparent">
                    <div className="bg-[#00E5FF]/5 border border-[#00E5FF]/10 rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden group shadow-2xl">
                        <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#00E5FF]/5 blur-[120px] rounded-full group-hover:bg-[#00E5FF]/10 transition-all duration-1000" />

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#00E5FF] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,229,255,0.3)]">
                                <Cpu size={24} className="text-black" strokeWidth={3} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.4em] text-[#00E5FF]">INTELIGENCIA_OPERATIVA</span>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-6">
                            <div className="relative flex-1">
                                <Input
                                    autoFocus
                                    placeholder='ORDEN_SISTEMA: "Asignar 15 unidades del talle 38 al 44 a todos los modelos."'
                                    value={aiInput}
                                    onChange={(e) => setAiInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAIProcess()}
                                    className="h-24 bg-black/80 border-white/5 text-white font-black text-xl px-10 rounded-[1.5rem] focus:border-[#00E5FF]/40 focus:ring-0 transition-all placeholder:text-white/5 shadow-inner"
                                />
                                {isProcessingAI && (
                                    <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-4 bg-black py-3 px-6 rounded-2xl border border-[#00E5FF]/20 shadow-2xl animate-pulse">
                                        <Loader2 className="animate-spin text-[#00E5FF]" size={20} />
                                        <span className="text-[10px] font-black text-[#00E5FF] tracking-[0.3em] uppercase">SYNC_NEURAL...</span>
                                    </div>
                                )}
                            </div>
                            <Button
                                onClick={handleAIProcess}
                                disabled={isProcessingAI || !aiInput.trim()}
                                className="h-24 px-16 bg-white text-black hover:bg-[#00E5FF] font-black text-[10px] tracking-[0.4em] uppercase rounded-[1.5rem] transition-all shadow-2xl active:scale-95 flex items-center gap-4"
                            >
                                <Sparkles size={18} /> PROCESAR_IA
                            </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-8 px-2">
                            <span className="text-[9px] text-white/10 font-black uppercase tracking-[0.4em]">FRAGMENTOS_RÁPIDOS:</span>
                            {[
                                "Set 10 del 28 al 47",
                                "Solo 5 de talle 40",
                                "Limpiar todo el stock"
                            ].map(text => (
                                <button 
                                    key={text}
                                    onClick={() => setAiInput(text === "Limpiar todo el stock" ? "Poner 0 de stock en todos" : text)} 
                                    className="text-[10px] text-white/30 hover:text-[#00E5FF] transition-all border-b border-white/5 hover:border-[#00E5FF]/40 pb-1 font-black tracking-widest uppercase cursor-pointer"
                                >
                                    "{text}"
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-center -my-6 relative z-10">
                    <div className="bg-[#030303] p-3 rounded-full border border-white/10 shadow-3xl">
                        <ArrowDown className={`text-[#00E5FF] ${isProcessingAI ? 'animate-bounce' : ''}`} size={28} strokeWidth={3} />
                    </div>
                </div>

                {/* 4. VERIFICATION GRID */}
                <div id="stock-preview-grid" className="flex-1 flex flex-col min-h-0">
                    <div className="px-10 mt-12 mb-4">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">AUDITORÍA_DE_RESULTADOS / AJUSTE_MANUAL</span>
                            {hasUsedAI && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 text-emerald-500 bg-emerald-500/5 px-4 py-2 rounded-xl border border-emerald-500/10">
                                    <Sparkles size={14} />
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em]">IA_OVERRIDE_ACTIVE</span>
                                </motion.div>
                            )}
                        </div>

                        <div className="grid grid-cols-[1fr,repeat(20,55px)] gap-4 pb-6 border-b border-white/5 overflow-x-auto custom-scrollbar">
                            <div className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em] min-w-[200px]">IDENTIFICADOR_MODELO</div>
                            {allSizes.map(size => (
                                <div key={size} className="text-[10px] font-black text-center text-[#00E5FF]/40 uppercase tracking-widest">{size}</div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-10 pb-10 space-y-4 custom-scrollbar">
                        {selectedProducts.map((product) => (
                            <div
                                key={product.id}
                                className={`group grid grid-cols-[1fr,repeat(20,55px)] gap-4 items-center p-5 rounded-3xl border transition-all duration-700 ${hasUsedAI ? 'bg-[#00E5FF]/5 border-[#00E5FF]/10' : 'bg-white/[0.02] border-white/5 hover:border-[#00E5FF]/10'}`}
                            >
                                <div className="flex items-center gap-5 min-w-[200px] overflow-hidden">
                                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-black border border-white/10 relative group-hover:border-[#00E5FF]/40 transition-all duration-500 shrink-0">
                                        <img
                                            src={product.images[0] || 'https://placehold.co/100x100'}
                                            alt={product.name}
                                            className="w-full h-full object-contain p-1.5"
                                        />
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="text-[11px] font-black text-white uppercase truncate tracking-widest">{product.name}</h4>
                                        <span className="text-[8px] text-white/20 font-black uppercase tracking-[0.3em]">{product.category || 'MÓDULO_G'}</span>
                                    </div>
                                </div>

                                {allSizes.map(size => (
                                    <Input
                                        key={size}
                                        type="number"
                                        min="0"
                                        value={stocks[product.id][size] ?? ''}
                                        onChange={(e) => handleStockChange(product.id, size, e.target.value)}
                                        className={`h-12 bg-black/60 border-white/5 text-white font-black text-center text-xs p-0 rounded-xl transition-all ${hasUsedAI ? 'border-[#00E5FF]/30 text-[#00E5FF]' : 'focus:border-[#00E5FF]/50 border-white/5'}`}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 5. Footer */}
                <div className="p-10 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white/20">
                        <Info size={16} />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em]">VERIFICAR INTEGRIDAD ANTES DE LA PERSISTENCIA FINAL</span>
                    </div>
                    <div className="flex gap-6">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="font-black text-[10px] tracking-[0.4em] text-white/30 hover:text-white uppercase px-10 transition-all h-20 rounded-[1.5rem]"
                        >
                            ANULAR_PROCESO
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-white text-black hover:bg-[#00E5FF] px-16 h-20 rounded-[2rem] font-black text-[11px] tracking-[0.4em] uppercase shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all active:scale-95 flex items-center gap-4 border-none"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} strokeWidth={3} />}
                            INYECTAR_REGISTRO_CRÍTICO
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
