'use client';

import { useState } from 'react';
import { ProductType, bulkUpdateProducts } from '@/app/actions/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Save, X, Info, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { analyzeImageWithName } from '@/lib/ai-utils';
import { useSettingsStore } from '@/store/settings-store';

interface BulkRenameModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedProducts: ProductType[];
    onSuccess: () => void;
}

export function BulkRenameModal({ isOpen, onClose, selectedProducts, onSuccess }: BulkRenameModalProps) {
    const { geminiApiKey } = useSettingsStore();
    const [names, setNames] = useState<Record<string, string>>(
        selectedProducts.reduce((acc, p) => ({ ...acc, [p.id]: p.name }), {})
    );
    const [isSaving, setIsSaving] = useState(false);
    const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());

    const handleNameChange = (id: string, newName: string) => {
        setNames(prev => ({ ...prev, [id]: newName }));
    };

    const handleAIAnalyze = async (id: string, imageUrl: string) => {
        if (!imageUrl) return;
        setAnalyzingIds(prev => {
            const next = new Set(prev);
            next.add(id);
            return next;
        });
        try {
            const newName = await analyzeImageWithName(imageUrl, geminiApiKey);
            if (newName) {
                setNames(prev => ({ ...prev, [id]: newName }));
            }
        } finally {
            setAnalyzingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    const handleAnalyzeAll = async () => {
        if (!geminiApiKey) {
            toast.error('Configura tu API Key de Gemini primero.');
            return;
        }

        toast.info('Iniciando análisis masivo con IA...');
        for (const product of selectedProducts) {
            if (product.images?.[0]) {
                await handleAIAnalyze(product.id, product.images[0]);
            }
        }
        toast.success('Análisis masivo completado ✨');
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updates = selectedProducts.map(p => ({
                id: p.id,
                data: { name: names[p.id] }
            })).filter(u => {
                const originalProduct = selectedProducts.find(p => p.id === u.id);
                return originalProduct && originalProduct.name !== u.data.name;
            });

            if (updates.length === 0) {
                toast.info('No se detectaron cambios en los nombres.');
                onClose();
                return;
            }

            const result = await bulkUpdateProducts(updates);

            if (result.success) {
                toast.success(`${result.successCount} nombres actualizados correctamente.`);
                onSuccess();
                onClose();
            } else {
                toast.error('Ocurrió un error al actualizar los nombres.');
            }
        } catch (error) {
            console.error('Error in handleSave:', error);
            toast.error('Error al procesar la actualización masiva.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 40 }}
                transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                className="w-full max-w-2xl bg-[#0A0A0A] rounded-[3rem] shadow-[0_0_100px_-20px_rgba(200,138,4,0.15)] border border-white/10 flex flex-col max-h-[85vh] overflow-hidden"
            >
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex-1">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none mb-2">
                                    RENOMBRAR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C88A04] to-[#ECA413]">MASIVAMENTE</span>
                                </h2>
                                <p className="text-gray-500 text-[10px] font-black tracking-[0.2em] uppercase">
                                    Edición de {selectedProducts.length} registros exclusivos
                                </p>
                            </div>
                            <Button
                                onClick={handleAnalyzeAll}
                                disabled={analyzingIds.size > 0}
                                className="bg-[#C88A04]/10 hover:bg-[#C88A04]/20 text-[#C88A04] border border-[#C88A04]/20 rounded-2xl font-black text-[9px] tracking-[0.2em] uppercase h-12 px-6"
                            >
                                <Sparkles size={14} className="mr-2" />
                                {analyzingIds.size > 0 ? 'ANALIZANDO...' : 'RENOMBRAR TODO CON IA'}
                            </Button>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-gray-500 hover:text-white border border-white/5 ml-4"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Info Banner */}
                <div className="px-8 py-4 bg-[#C88A04]/5 border-b border-[#C88A04]/10 flex items-center gap-4">
                    <Info size={16} className="text-[#C88A04] shrink-0" />
                    <p className="text-[9px] font-black text-[#C88A04] uppercase tracking-[0.2em]">
                        Sincronización optimizada: Solo se procesarán los elementos modificados.
                    </p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(200,138,4,0.03),transparent_50%)]">
                    {selectedProducts.map((product) => (
                        <div
                            key={product.id}
                            className="group flex items-center gap-6 p-5 rounded-[2rem] border border-white/5 bg-white/[0.02] hover:border-[#C88A04]/30 hover:bg-white/[0.04] transition-all duration-500"
                        >
                            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black border border-white/10 shrink-0 shadow-2xl">
                                <img
                                    src={product.images[0] || 'https://placehold.co/100x100?text=Sin+Imagen'}
                                    alt={product.name}
                                    className="w-full h-full object-contain p-2 transition-transform duration-700 group-hover:scale-110"
                                />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-center pr-2">
                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] pl-1">
                                        Nomenclatura Actual
                                    </label>
                                    <button
                                        onClick={() => handleAIAnalyze(product.id, product.images[0])}
                                        disabled={analyzingIds.has(product.id)}
                                        className="text-[#C88A04] hover:text-[#ECA413] transition-colors p-1"
                                        title="Sugerir nombre con IA"
                                    >
                                        {analyzingIds.has(product.id) ? (
                                            <Loader2 size={12} className="animate-spin" />
                                        ) : (
                                            <Sparkles size={12} />
                                        )}
                                    </button>
                                </div>
                                <Input
                                    value={names[product.id] || ''}
                                    onChange={(e) => handleNameChange(product.id, e.target.value)}
                                    placeholder="NUEVO NOMBRE ÉTER..."
                                    className="bg-black/50 border-white/10 text-white font-black text-xs tracking-wider rounded-xl h-12 focus:border-[#C88A04] focus:ring-[#C88A04]/10"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-white/5 bg-white/[0.02] flex items-center justify-end gap-4">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="font-black text-[10px] tracking-[0.2em] text-gray-500 hover:text-white hover:bg-white/5 rounded-xl uppercase px-6"
                    >
                        Abortar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-[#C88A04] hover:bg-[#ECA413] text-black px-10 h-14 rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase shadow-[0_0_40px_-10px_rgba(200,138,4,0.5)] transition-all active:scale-95"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                PROCESANDO...
                            </>
                        ) : (
                            <>
                                <Save className="mr-3 h-5 w-5" />
                                GUARDAR CAMBIOS
                            </>
                        )}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
