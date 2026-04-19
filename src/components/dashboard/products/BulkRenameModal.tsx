'use client';

import { useState } from 'react';
import { ProductType, bulkUpdateProducts } from '@/app/actions/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Save, X, Info, Sparkles, Hash, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
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
            toast.error('ACCESO_DENEGADO: Módulo AI sin credenciales.');
            return;
        }

        toast.info('INICIANDO_SCAN_MASIVO_IA...');
        for (const product of selectedProducts) {
            if (product.images?.[0]) {
                await handleAIAnalyze(product.id, product.images[0]);
            }
        }
        toast.success('SCAN_TERMINADO_EXITOSAMENTE');
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
                toast.info('NO_DELTA_DATA: Registro sin variaciones.');
                onClose();
                return;
            }

            const result = await bulkUpdateProducts(updates);

            if (result.success) {
                toast.success(`${result.successCount} NOMENCLATURAS_SINCRONIZADAS.`);
                onSuccess();
                onClose();
            } else {
                toast.error('ERR_SYNC: Error en la actualización.');
            }
        } catch (error) {
            console.error('Error in handleSave:', error);
            toast.error('ERR_SISTEMA: Fallo operativo.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-[30px]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-3xl bg-[#030303] rounded-[3.5rem] shadow-[0_0_120px_-20px_rgba(0,229,255,0.15)] border border-white/5 flex flex-col max-h-[88vh] overflow-hidden"
            >
                {/* Header */}
                <div className="p-10 pb-8 border-b border-white/5 bg-gradient-to-r from-white/[0.01] to-transparent flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="bg-[#00E5FF]/10 p-2 rounded-lg border border-[#00E5FF]/20">
                                <Layers size={16} className="text-[#00E5FF]" />
                            </div>
                            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
                                NOMENCLATURA_ <span className="text-[#00E5FF]">BATCH</span>
                            </h2>
                        </div>
                        <p className="text-white/20 text-[10px] font-black tracking-[0.4em] uppercase">
                            AUDITORÍA Y REESCRITURA DE {selectedProducts.length} ÍTEMS EXCLUSIVOS
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-5 bg-white/[0.03] hover:bg-white/[0.08] rounded-2xl transition-all text-white/20 hover:text-white border border-white/5 active:scale-90"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* AI Action Area */}
                <div className="px-10 py-8 bg-[#00E5FF]/5 border-b border-[#00E5FF]/10 flex flex-col lg:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-10 h-10 bg-[#00E5FF] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.3)]">
                            <Sparkles size={18} className="text-black" strokeWidth={3} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-[#00E5FF] uppercase tracking-[0.3em]">PROCESAMIENTO_VISUAL_IA</p>
                            <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.2em]">Analiza las imágenes para sugerir nombres comerciales premium.</p>
                        </div>
                    </div>
                    <Button
                        onClick={handleAnalyzeAll}
                        disabled={analyzingIds.size > 0}
                        className="w-full lg:w-auto bg-white text-black hover:bg-[#00E5FF] font-black text-[9px] tracking-[0.4em] uppercase h-16 px-10 rounded-2xl transition-all shadow-2xl active:scale-95 border-none"
                    >
                        {analyzingIds.size > 0 ? (
                            <>
                                <Loader2 size={16} className="mr-3 animate-spin" />
                                SCAN_IN_PROGRESS...
                            </>
                        ) : (
                            <>
                                <Sparkles size={16} className="mr-3" />
                                AUTO_RENAME_SYSTEM
                            </>
                        )}
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-10 space-y-4 custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(0,229,255,0.02),transparent_60%)]">
                    {selectedProducts.map((product) => (
                        <div
                            key={product.id}
                            className="group flex items-center gap-8 p-6 rounded-3xl border border-white/5 bg-white/[0.01] hover:border-[#00E5FF]/30 hover:bg-[#00E5FF]/5 transition-all duration-700"
                        >
                            <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-black border border-white/10 shrink-0 shadow-2xl group-hover:border-[#00E5FF]/40 transition-all duration-500">
                                <img
                                    src={product.images[0] || 'https://placehold.co/100x100?text=NO_EXT'}
                                    alt={product.name}
                                    className="w-full h-full object-contain p-2.5 transition-transform duration-1000 group-hover:scale-115"
                                />
                                {analyzingIds.has(product.id) && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                        <Loader2 size={24} className="text-[#00E5FF] animate-spin" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 space-y-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Hash size={10} className="text-white/20" />
                                        <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">
                                            ENTRY_POINT_ID
                                        </label>
                                    </div>
                                    <button
                                        onClick={() => handleAIAnalyze(product.id, product.images[0])}
                                        disabled={analyzingIds.has(product.id)}
                                        className="text-[#00E5FF]/40 hover:text-[#00E5FF] transition-all p-1.5 bg-white/[0.03] rounded-lg hover:bg-[#00E5FF]/10 active:scale-90"
                                        title="SCAN_INDIVIDUAL_NODE"
                                    >
                                        <Sparkles size={14} />
                                    </button>
                                </div>
                                <Input
                                    value={names[product.id] || ''}
                                    onChange={(e) => handleNameChange(product.id, e.target.value)}
                                    placeholder="ASIGNAR_NUEVA_DENOMINACIÓN..."
                                    className="bg-black/60 border-white/5 text-white font-black text-xs tracking-widest rounded-xl h-14 focus:border-[#00E5FF]/40 focus:ring-0 uppercase placeholder:text-white/5 transition-all"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-10 border-t border-white/5 bg-white/[0.01] flex items-center justify-between gap-6">
                    <div className="flex items-center gap-3 text-white/10">
                        <Info size={16} />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em]">LOS_DATOS_SOBREESCRIBIRÁN_LOS_REGISTROS_EXISTENTES</span>
                    </div>
                    <div className="flex gap-6">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="font-black text-[10px] tracking-[0.4em] text-white/20 hover:text-white uppercase px-8 h-16 rounded-2xl"
                        >
                            ANULAR_SYNC
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-white text-black hover:bg-[#00E5FF] px-12 h-16 rounded-2xl font-black text-[10px] tracking-[0.4em] uppercase shadow-2xl transition-all active:scale-95 flex items-center gap-4"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    SYNCING...
                                </>
                            ) : (
                                <>
                                    <Save className="h-5 w-5" strokeWidth={3} />
                                    CONFIRMAR_UPDATE
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
