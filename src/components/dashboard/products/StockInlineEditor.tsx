'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Check, Loader2, X, Package } from 'lucide-react';
import { updateProductStockBySize } from '@/app/actions/inventory-actions';
import { toast } from 'sonner';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface StockInlineEditorProps {
    productId: string;
    productName?: string;
    productImage?: string;
    stockBySize: Record<string, number>;
    onSuccess?: () => void;
}

const ALL_SIZES = [
    'Unique', '28', '29', '30', '31', '32', '33', '34', '35',
    '36', '37', '38', '39', '40', '41', '42', '43',
    '44', '45', '46', '47'
];

export function StockInlineEditor({ productId, productName, productImage, stockBySize, onSuccess }: StockInlineEditorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedStock, setEditedStock] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(false);

    // Initialize/Sync editedStock
    useEffect(() => {
        if (!isEditing) {
            setEditedStock({ ...stockBySize });
        }
    }, [stockBySize, isEditing]);

    useEffect(() => {
        if (!isEditing) return;
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsEditing(false);
                setEditedStock({ ...stockBySize });
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isEditing, stockBySize]);

    const toggleSize = (size: string) => {
        setEditedStock(prev => {
            const current = prev[size] ?? 0;
            const next = { ...prev };
            if (current > 0) {
                delete next[size];
            } else {
                next[size] = 10;
            }
            return next;
        });
    };

    const setSizeQty = (size: string, qty: number) => {
        setEditedStock(prev => {
            const next = { ...prev };
            const normalized = Math.max(0, Math.trunc(qty || 0));
            if (normalized <= 0) {
                delete next[size];
            } else {
                next[size] = normalized;
            }
            return next;
        });
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const cleanStock: Record<string, number> = {};
            Object.entries(editedStock).forEach(([size, qty]) => {
                if (Number(qty) > 0) cleanStock[size] = Number(qty);
            });

            const res = await updateProductStockBySize(productId, cleanStock);

            if (res.success) {
                toast.success('Stock actualizado.');
                setIsEditing(false);
                if (onSuccess) onSuccess();
            } else {
                throw new Error(res.error || 'Error en el servidor');
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error al guardar stock';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const activeSizes = Object.entries(stockBySize)
        .filter(([_, qty]) => Number(qty) > 0)
        .sort((a, b) => {
            if (a[0] === 'Unique') return -1;
            if (b[0] === 'Unique') return 1;
            return (parseInt(a[0]) || 0) - (parseInt(b[0]) || 0);
        });

    const hasChanges = JSON.stringify(editedStock) !== JSON.stringify(stockBySize);

    return (
        <div className="relative">
            {/* Collapsed View */}
            <div
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                className="flex flex-wrap gap-1 items-center cursor-pointer group hover:bg-white/5 p-1 rounded-lg transition-all"
            >
                {activeSizes.length === 0 ? (
                    <span className="text-[8px] font-black text-rose-500/50 uppercase tracking-widest px-2">Sin stock</span>
                ) : (
                    activeSizes.slice(0, 6).map(([size, qty]) => (
                        <div key={size} className="flex flex-col items-center">
                            <span className="text-[7px] font-black text-white/20 uppercase mb-0.5">{size}</span>
                            <div className={cn(
                                "w-6 h-6 rounded flex items-center justify-center text-[9px] font-black transition-all",
                                Number(qty) <= 3 ? "bg-amber-500/20 text-amber-500" : "bg-white/5 text-white/60 group-hover:text-[#00E5FF]"
                            )}>
                                {qty}
                            </div>
                        </div>
                    ))
                )}
                {activeSizes.length > 6 && <span className="text-[7px] font-black text-white/10">+{activeSizes.length - 6}</span>}
            </div>

            {/* Expanded Editor */}
            <Dialog
                open={isEditing}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditedStock({ ...stockBySize });
                    }
                    setIsEditing(open);
                }}
            >
                <DialogContent className="w-[440px] max-w-[95vw] p-0 bg-[#060606] border border-white/10 rounded-[2rem] shadow-[0_32px_64px_rgba(0,0,0,0.8)] overflow-hidden text-white">
                    <div>
                            {/* Header */}
                            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-black border border-white/5 overflow-hidden shrink-0">
                                    {productImage ? (
                                        <Image src={productImage} alt="" width={64} height={64} className="object-contain w-full h-full p-1" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/10"><Package size={24} /></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest truncate">{productName}</h4>
                                    <p className="text-[8px] font-black text-[#00E5FF] uppercase tracking-[0.3em] mt-1">Stock Matrix Mode</p>
                                </div>
                                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-white/5 rounded-xl transition-all text-white/20 hover:text-white">
                                    <X size={18} />
                                </button>
                            </div>
                            <DialogTitle className="sr-only">Editor de talles</DialogTitle>

                            {/* Matrix */}
                            <div className="p-6">
                                <div className="grid grid-cols-7 gap-1.5">
                                    {ALL_SIZES.map(size => {
                                        const qty = editedStock[size] || 0;
                                        const isActive = qty > 0;
                                        return (
                                            <div
                                                key={size}
                                                className={cn(
                                                    "flex flex-col items-center gap-1 p-2 rounded-xl border transition-all",
                                                    isActive
                                                        ? "bg-[#00E5FF]/10 border-[#00E5FF]/40 text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.1)]"
                                                        : "bg-black border-white/5 text-white/10 hover:border-white/20"
                                                )}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSize(size)}
                                                    className="text-[8px] font-black uppercase tracking-tighter hover:text-white transition-colors"
                                                >
                                                    {size}
                                                </button>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    step={1}
                                                    value={qty}
                                                    onChange={(e) => setSizeQty(size, Number(e.target.value))}
                                                    className="h-5 w-10 rounded bg-black/40 text-center text-[10px] font-black text-white outline-none border border-white/10"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
                                <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                                    {Object.values(editedStock).filter(v => v > 0).length} talles activos
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isLoading || !hasChanges}
                                        className={cn(
                                            "px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                                            hasChanges 
                                                ? "bg-[#00E5FF] text-black hover:scale-105 shadow-[0_4px_20px_rgba(0,229,255,0.3)]" 
                                                : "bg-white/5 text-white/10 cursor-not-allowed"
                                        )}
                                    >
                                        {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                        Sincronizar
                                    </button>
                                </div>
                            </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
