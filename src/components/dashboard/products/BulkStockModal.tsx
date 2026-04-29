'use client';

import { useState } from 'react';
import { ProductType } from '@/app/actions/products';
import { updateProductStockBySize } from '@/app/actions/inventory-actions';
import { Loader2, Save, X, Sparkles, ChevronRight, Hash, Box, Check } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useSettingsStore } from '@/store/settings-store';
import { cn } from '@/lib/utils';

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

    const allSizes = [
        'Unique', '28', '29', '30', '31', '32', '33', '34', '35',
        '36', '37', '38', '39', '40', '41', '42', '43',
        '44', '45', '46', '47'
    ];

    const toggleSize = (productId: string, size: string) => {
        setStocks(prev => {
            const currentStock = prev[productId][size] || 0;
            const newStock = currentStock > 0 ? 0 : 10;
            return {
                ...prev,
                [productId]: {
                    ...prev[productId],
                    [size]: newStock
                }
            };
        });
    };

    const setSizeQty = (productId: string, size: string, qty: number) => {
        setStocks(prev => {
            const next = { ...prev };
            const normalized = Math.max(0, Math.trunc(qty || 0));
            next[productId] = { ...(next[productId] || {}) };
            if (normalized <= 0) {
                delete next[productId][size];
            } else {
                next[productId][size] = normalized;
            }
            return next;
        });
    };

    const toggleSizeForAll = (size: string) => {
        setStocks(prev => {
            const firstProduct = selectedProducts[0]?.id;
            const isCurrentlySelected = prev[firstProduct]?.[size] > 0;
            const newStock = isCurrentlySelected ? 0 : 10;
            
            const nextStocks = { ...prev };
            selectedProducts.forEach(p => {
                nextStocks[p.id] = { ...nextStocks[p.id], [size]: newStock };
            });
            return nextStocks;
        });
    };

    const setSizeQtyForAll = (size: string, qty: number) => {
        const normalized = Math.max(0, Math.trunc(qty || 0));
        setStocks(prev => {
            const next = { ...prev };
            selectedProducts.forEach(p => {
                next[p.id] = { ...(next[p.id] || {}) };
                if (normalized <= 0) delete next[p.id][size];
                else next[p.id][size] = normalized;
            });
            return next;
        });
    };

    const handleAIProcess = async () => {
        if (!aiInput.trim()) return;
        if (!geminiApiKey) {
            toast.error('Configura tu API Key en ajustes.');
            return;
        }

        setIsProcessingAI(true);
        try {
            const prompt = `Extraer stock por talle de: "${aiInput}". Responder solo JSON: {"talle": cantidad}.`;
            const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            if (!response.ok) throw new Error('AI_ERROR');
            const data = await response.json();
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
            const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('FORMAT_ERROR');

            const parsedStock = JSON.parse(jsonMatch[0]);
            const newStocks = { ...stocks };
            selectedProducts.forEach(p => {
                newStocks[p.id] = { ...newStocks[p.id], ...parsedStock };
            });
            setStocks(newStocks);
            setAiInput('');
            toast.success('Stock actualizado mediante IA.');
        } catch (error) {
            toast.error('No se pudo procesar el comando.');
        } finally {
            setIsProcessingAI(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const results = await Promise.all(
                selectedProducts.map((p) => updateProductStockBySize(p.id, stocks[p.id] || {}))
            );
            const failed = results.filter((r) => !r.success);
            if (failed.length === 0) {
                toast.success('Cambios sincronizados.');
                onSuccess();
                onClose();
            } else {
                toast.error(`Error al sincronizar ${failed.length} producto(s).`);
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error de red al guardar.';
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    const [globalQtyBySize, setGlobalQtyBySize] = useState<Record<string, number>>({});

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="w-full max-w-6xl bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] flex flex-col max-h-[90vh] overflow-hidden shadow-2xl"
            >
                {/* Header Simple */}
                <div className="p-8 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                            <Box size={18} className="text-[#00E5FF]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-widest text-white">Stock <span className="text-[#00E5FF]">Matrix</span></h2>
                            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Toque para alternar stock (Base 10un)</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-xl transition-all text-white/20 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Quick Master Controls */}
                <div className="px-8 py-4 border-b border-white/5 bg-white/[0.01] flex items-center gap-4 overflow-x-auto custom-scrollbar">
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest shrink-0">Carga Rápida Global:</span>
                    {allSizes.map(size => {
                        const isSelected = selectedProducts.every(p => stocks[p.id][size] > 0);
                        return (
                            <div key={`master-${size}`} className="flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 shrink-0">
                                <button
                                    onClick={() => toggleSizeForAll(size)}
                                    className={cn(
                                        "rounded px-1.5 py-1 text-[9px] font-black transition-all",
                                        isSelected ? "bg-[#00E5FF] text-black" : "bg-white/5 text-white/60 hover:text-white"
                                    )}
                                >
                                    {size}
                                </button>
                                <input
                                    type="number"
                                    min={0}
                                    step={1}
                                    value={globalQtyBySize[size] ?? ''}
                                    onChange={(e) => {
                                        const value = Number(e.target.value || 0);
                                        setGlobalQtyBySize((prev) => ({ ...prev, [size]: value }));
                                        setSizeQtyForAll(size, value);
                                    }}
                                    className="w-12 rounded bg-black/60 px-1 py-1 text-center text-[10px] font-black text-white outline-none border border-white/10"
                                />
                            </div>
                        );
                    })}
                </div>

                {/* AI Command Bar */}
                <div className="p-8 border-b border-white/5 bg-white/[0.01]">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-[#00E5FF]/5 blur-xl rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                        <div className="relative flex gap-3">
                            <div className="relative flex-1">
                                <Sparkles className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                <input 
                                    value={aiInput}
                                    onChange={(e) => setAiInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAIProcess()}
                                    placeholder="Comando IA: '20 unidades del 38 al 42'..."
                                    className="w-full bg-black border border-white/5 rounded-2xl py-5 pl-16 pr-6 text-sm font-medium text-white outline-none focus:border-[#00E5FF]/30 transition-all placeholder:text-white/10"
                                />
                            </div>
                            <button 
                                onClick={handleAIProcess}
                                disabled={isProcessingAI || !aiInput.trim()}
                                className="px-8 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#00E5FF] transition-all disabled:opacity-20 flex items-center gap-2"
                            >
                                {isProcessingAI ? <Loader2 size={14} className="animate-spin" /> : <ChevronRight size={14} />}
                                Ejecutar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Matrix Grid - Toggles */}
                <div className="flex-1 overflow-auto p-8 space-y-3 custom-scrollbar">
                    {selectedProducts.map((product) => (
                        <div key={product.id} className="group flex items-center gap-6 p-4 bg-white/[0.01] hover:bg-white/[0.03] rounded-2xl transition-all border border-white/5">
                            <div className="flex items-center gap-4 w-64 shrink-0">
                                <div className="w-12 h-12 bg-black border border-white/5 rounded-xl overflow-hidden p-1 shrink-0">
                                    <img src={product.images[0]} alt="" className="w-full h-full object-contain" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-[10px] font-black text-white truncate uppercase tracking-widest">{product.name}</h4>
                                    <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">{product.category}</span>
                                </div>
                            </div>

                            <div className="flex gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
                                {allSizes.map(size => {
                                    const qty = stocks[product.id][size] || 0;
                                    const isActive = qty > 0;
                                    return (
                                        <div
                                            key={size}
                                            className={cn(
                                                "flex flex-col items-center gap-1 min-w-[42px] p-2 rounded-xl transition-all border",
                                                isActive 
                                                    ? "bg-[#00E5FF]/10 border-[#00E5FF]/30 text-[#00E5FF]" 
                                                    : "bg-black border-white/5 text-white/10 hover:border-white/20"
                                            )}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => toggleSize(product.id, size)}
                                                className="text-[8px] font-black uppercase hover:text-white transition-colors"
                                            >
                                                {size}
                                            </button>
                                            <input
                                                type="number"
                                                min={0}
                                                step={1}
                                                value={qty}
                                                onChange={(e) => setSizeQty(product.id, size, Number(e.target.value))}
                                                className="h-5 w-10 rounded bg-black/60 border border-white/10 text-center text-[10px] font-black text-white outline-none"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Simple */}
                <div className="p-8 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/10">
                        <Hash size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{selectedProducts.length} Ítems seleccionados</span>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all">Cancelar</button>
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-10 py-4 bg-[#00E5FF] text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-[#00E5FF]/20 flex items-center gap-2"
                        >
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Inyectar Stock
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
