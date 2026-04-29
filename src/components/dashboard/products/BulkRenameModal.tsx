import React, { useEffect } from 'react';
import { X, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { ProductType } from '@/app/actions/products';
import { motion, AnimatePresence } from 'framer-motion';

interface BulkRenameModalProps {
  selectedProducts: ProductType[];
  renameMap: Record<string, string>;
  setRenameMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onClose: () => void;
  onSave: () => Promise<void>;
  isProcessing: boolean;
}

export default function BulkRenameModal({
  selectedProducts,
  renameMap,
  setRenameMap,
  onClose,
  onSave,
  isProcessing,
}: BulkRenameModalProps) {
  useEffect(() => {
    const initial: Record<string, string> = {};
    selectedProducts.forEach(p => {
      if (!(p.id in renameMap)) {
        initial[p.id] = p.name;
      }
    });
    if (Object.keys(initial).length) {
      setRenameMap(prev => ({ ...prev, ...initial }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProducts]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-xl"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl bg-[#0A0A0A]/90 border border-white/10 rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Neon Top Border */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent opacity-50" />

          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 flex items-center justify-center border border-[#00E5FF]/20 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                <Sparkles size={20} className="text-[#00E5FF]" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Renombrado Masivo</h2>
                <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mt-1">Editing {selectedProducts.length} Assets</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90"
            >
              <X size={20} />
            </button>
          </div>

          {/* Product List */}
          <div className="flex-1 overflow-y-auto p-8 space-y-4 no-scrollbar">
            {selectedProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group flex items-center gap-6 p-4 bg-white/[0.03] border border-white/10 rounded-2xl hover:border-[#00E5FF]/30 transition-all"
              >
                <div className="w-20 h-20 relative rounded-xl border border-white/5 bg-black overflow-hidden flex-shrink-0">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10">
                      <ImageIcon size={24} />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-1">Nuevo Nombre</label>
                  <input
                    type="text"
                    value={renameMap[product.id] ?? ''}
                    onChange={e =>
                      setRenameMap(prev => ({ ...prev, [product.id]: e.target.value }))
                    }
                    placeholder="Escribí el nombre..."
                    className="w-full bg-white/[0.03] border border-white/10 text-white rounded-xl px-5 py-3.5 text-sm font-bold placeholder:text-white/10 focus:outline-none focus:border-[#00E5FF]/40 focus:bg-white/[0.05] transition-all selection:bg-[#00E5FF] selection:text-black"
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="p-8 border-t border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-6 py-3 text-xs font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors"
            >
              Descartar
            </button>
            <div className="flex items-center gap-4">
              <button
                onClick={onSave}
                disabled={isProcessing}
                className="px-8 py-3.5 bg-white text-black text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#00E5FF] transition-all active:scale-95 flex items-center gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)] disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    PROCESANDO
                  </>
                ) : (
                  <>
                    GUARDAR CAMBIOS
                    <Sparkles size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
