'use client';

import { useState } from 'react';
import { useSettingsStore } from '@/store/settings-store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Eye, EyeOff, Save, Key, Cpu, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AISettingsModal({ isOpen, onClose }: AISettingsModalProps) {
  const { geminiApiKey, setGeminiApiKey } = useSettingsStore();
  const [apiKey, setApiKey] = useState(geminiApiKey);
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    setGeminiApiKey(apiKey);
    toast.success('PROTOCOLO_AI_SINCROMIZADO: Configuración persistida en memoria local.');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#030303] border-white/5 text-white rounded-[2.5rem] shadow-[0_0_100px_-20px_rgba(0,229,255,0.15)] p-0 overflow-hidden">
        <div className="p-8 pb-4">
            <DialogHeader>
            <DialogTitle className="flex items-center gap-4 text-2xl font-black tracking-tighter uppercase">
                <div className="bg-[#00E5FF]/10 p-2 rounded-xl border border-[#00E5FF]/20">
                    <Cpu className="text-[#00E5FF]" size={20} />
                </div>
                NÚCLEO_ <span className="text-[#00E5FF]">IA</span>
            </DialogTitle>
            <DialogDescription className="text-white/20 font-black tracking-[0.3em] uppercase text-[8px] mt-4">
                CONFIGURACIÓN INTERNA DEL MOTOR DE PROCESAMIENTO GEMINI_SYNAPSE
            </DialogDescription>
            </DialogHeader>
        </div>

        <div className="px-8 py-6 space-y-8 bg-white/[0.01]">
          <div className="space-y-4">
            <Label htmlFor="api-key" className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 flex items-center gap-3">
              <Key size={14} className="text-[#00E5FF]/40" /> CREDENCIAL_ACCESO_API
            </Label>
            <div className="relative group">
              <div className="absolute inset-0 bg-[#00E5FF]/5 rounded-xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <Input
                id="api-key"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="PEGAR_TOKEN_AQUÍ..."
                className="relative bg-black/60 border-white/5 text-white font-black text-xs tracking-widest rounded-xl h-14 focus:border-[#00E5FF]/40 focus:ring-0 uppercase placeholder:text-white/5 transition-all pr-14"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-[#00E5FF] transition-colors z-10"
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="flex items-start gap-3 p-4 bg-[#00E5FF]/5 rounded-2xl border border-[#00E5FF]/10">
                <ShieldCheck size={14} className="text-[#00E5FF]/40 shrink-0 mt-0.5" />
                <p className="text-[9px] text-white/30 font-black tracking-widest uppercase leading-loose">
                    LOS DATOS SE ALMACENAN EN LA CACHÉ LOCAL DEL DISPOSITIVO. PUEDES OBTENER UNA CLAVE EN{' '}
                    <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[#00E5FF] hover:underline"
                    >
                        AI_STUDIO_TERMINAL
                    </a>.
                </p>
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 bg-white/[0.02] gap-4">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="font-black text-[9px] tracking-[0.4em] text-white/20 hover:text-white uppercase px-6 h-14 rounded-xl"
          >
            ANULAR
          </Button>
          <Button 
            onClick={handleSave} 
            className="flex-1 bg-white text-black hover:bg-[#00E5FF] font-black text-[9px] tracking-[0.4em] uppercase h-14 rounded-xl transition-all active:scale-95 shadow-2xl border-none"
          >
            <Save size={16} className="mr-3" />
            GUARDAR_NÚCLEO
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
