'use client';

import { useState } from 'react';
import { ProductType, bulkUpdateProducts } from '@/app/actions/products';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Wand2, Check, AlertCircle, Bot, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useSettingsStore } from '@/store/settings-store';
import { motion, AnimatePresence } from 'framer-motion';

interface AIDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: ProductType[];
  onSuccess: () => void;
}

export function AIDescriptionModal({ isOpen, onClose, selectedProducts, onSuccess }: AIDescriptionModalProps) {
  const { geminiApiKey } = useSettingsStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [generatedResults, setGeneratedResults] = useState<{ id: string, name: string, description: string }[]>([]);

  const handleGenerate = async () => {
    if (!geminiApiKey) {
      toast.error('ACCESO_DENEGADO: Módulo AI sin credenciales en Configuración.');
      return;
    }

    setIsGenerating(true);
    const estimatedSeconds = selectedProducts.length * 13;
    toast.info(`INICIANDO_OPTIMIZACIÓN: Generando ${selectedProducts.length} registros neurónicos...`);
    
    try {
      const response = await fetch('/api/ai/optimize-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: selectedProducts.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            description: p.description,
            price: p.base_price,
            stock_by_size: p.stock_by_size
          })),
          apiKey: geminiApiKey
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'ERR_AI_CLUSTER: Error en el procesado masivo.');
      }

      const data = await response.json();
      
      const resultsWithNames = data.products.map((res: any) => ({
        ...res,
        name: selectedProducts.find(p => p.id === res.id)?.name || 'NODO_DESCONOCIDO'
      }));

      setGeneratedResults(resultsWithNames);
      const errorCount = data.products.filter((p: any) => p.error).length;
      if (errorCount > 0) {
        toast.warning(`OPTIMIZACIÓN_PARCIAL: ${data.products.length - errorCount} OK, ${errorCount} ERR.`);
      } else {
        toast.success('MALLA_TEXTUAL_SINTETIZADA: Todas las descripciones están listas.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = async () => {
    setIsApplying(true);
    try {
      const updates = generatedResults.map(res => ({
        id: res.id,
        data: { description: res.description }
      }));

      const result = await bulkUpdateProducts(updates);

      if (result.success) {
        toast.success(`${result.successCount} METADATOS_ACTUALIZADOS.`);
        onSuccess();
        onClose();
        setGeneratedResults([]);
      } else {
        toast.error('ERR_DB_PERSISTENCE: Error al inyectar cambios.');
      }
    } catch (err) {
      toast.error('ERR_CRITICAL_PROCESS: Fallo en la secuencia de aplicación.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-hidden flex flex-col bg-[#030303] border-white/5 text-white rounded-[3rem] shadow-[0_0_150px_-30px_rgba(0,229,255,0.2)]">
        <DialogHeader className="p-8 pb-4">
          <DialogTitle className="flex items-center gap-4 text-3xl font-black tracking-tighter uppercase">
            <div className="bg-[#00E5FF]/10 p-2 rounded-xl border border-[#00E5FF]/20">
                <Bot className="text-[#00E5FF]" size={28} strokeWidth={3} />
            </div>
            SÍNTESIS_ <span className="text-[#00E5FF]">DNA_ÉTER</span>
          </DialogTitle>
          <DialogDescription className="text-white/20 font-black tracking-[0.3em] uppercase text-[9px] mt-4">
            PROCESAMIENTO DE {selectedProducts.length} NODOS MEDIANTE EL NÚCLEO GEMINI_SYNAPSE
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-8 space-y-8 px-8 custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(0,229,255,0.03),transparent_60%)]">
          {generatedResults.length === 0 ? (
            <div className="space-y-6">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/10">COLA_DE_PROCESO:</span>
              <div className="grid grid-cols-1 gap-3">
                {selectedProducts.map(p => (
                  <div key={p.id} className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 flex items-center justify-between hover:border-[#00E5FF]/20 transition-all duration-500">
                    <span className="text-xs font-black tracking-widest uppercase text-white/60">{p.name}</span>
                    <span className="text-[8px] text-white/20 font-black uppercase tracking-[0.4em] bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/5">
                        {p.category || 'ARCHIVO_G'}
                    </span>
                  </div>
                ))}
              </div>
              {!geminiApiKey && (
                <div className="p-6 rounded-[1.5rem] bg-rose-500/5 border border-rose-500/10 flex items-start gap-5 mt-6 shadow-2xl">
                  <AlertCircle className="text-rose-500 shrink-0 mt-1" size={20} strokeWidth={3} />
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.4em]">ERR_TOKEN_MISSING</p>
                    <p className="text-[11px] text-rose-500/60 font-black tracking-widest leading-relaxed uppercase">
                      NO SE DETECTÓ NINGUNA API_KEY VÁLIDA. REQUIERE CONFIGURACIÓN PARA ACCEDER AL CLÚSTER DE IA.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#00E5FF]/40">VISTA_PREVIA_GENERADA:</span>
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-emerald-500 bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/10 animate-pulse">
                    AI_SUCCESS
                </span>
              </div>
              <AnimatePresence>
                {generatedResults.map((res, index) => (
                    <motion.div 
                    key={res.id}
                    initial={{ opacity: 0, scale: 0.98, x: -10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.5 }}
                    className="space-y-3 p-6 rounded-[2rem] bg-black/60 border border-white/5 group hover:border-[#00E5FF]/30 transition-all duration-700 shadow-2xl"
                    >
                    <div className="flex items-center justify-between gap-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 group-hover:text-[#00E5FF] transition-colors">{res.name}</h4>
                        <div className="bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/20">
                            <Check className="text-emerald-500" size={12} strokeWidth={4} />
                        </div>
                    </div>
                    <p className="text-[13px] text-white/60 font-medium leading-relaxed uppercase tracking-wider italic">
                        {res.description}
                    </p>
                    </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <DialogFooter className="p-8 border-t border-white/5 bg-white/[0.01]">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="text-white/20 hover:text-white hover:bg-white/5 rounded-2xl uppercase text-[10px] font-black tracking-[0.4em] h-16 px-10 transition-all"
          >
            ANULAR_SYNC
          </Button>
          
          {generatedResults.length === 0 ? (
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !geminiApiKey}
              className="bg-white text-black hover:bg-[#00E5FF] rounded-[1.5rem] px-12 h-16 uppercase text-[10px] font-black tracking-[0.4em] gap-4 shadow-3xl transition-all active:scale-95 border-none"
            >
              {isGenerating ? (
                <><Loader2 className="animate-spin" size={18} strokeWidth={3} /> SINTETIZANDO_NOMENCLATURA...</>
              ) : (
                <><Zap size={18} strokeWidth={3} /> OPTIMIZAR_CON_GEMINI</>
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleApply}
              disabled={isApplying}
              className="bg-emerald-600 text-white hover:bg-emerald-500 rounded-[1.5rem] px-12 h-16 uppercase text-[10px] font-black tracking-[0.4em] gap-4 shadow-[0_0_40px_-5px_rgba(16,185,129,0.3)] transition-all active:scale-95 border-none"
            >
              {isApplying ? (
                <><Loader2 className="animate-spin" size={18} strokeWidth={3} /> INYECTANDO_DNA...</>
              ) : (
                <><Check size={18} strokeWidth={3} /> CONFIRMAR_CAMBIOS</>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
