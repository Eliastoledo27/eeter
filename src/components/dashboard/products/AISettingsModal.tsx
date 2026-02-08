'use client';

import { useState } from 'react';
import { useSettingsStore } from '@/store/settings-store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Eye, EyeOff, Save, Key } from 'lucide-react';
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
    toast.success('Configuración de AI guardada correctamente');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-purple-500" size={20} />
            Configuración de IA
          </DialogTitle>
          <DialogDescription>
            Ingresa tu API Key de Google Gemini para habilitar la generación automática de descripciones.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="api-key" className="text-sm font-medium flex items-center gap-2">
              <Key size={14} /> Gemini API Key
            </Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Pegar API Key aquí..."
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Tu clave se guarda localmente en tu navegador. Puedes obtener una en{' '}
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="text-purple-600 hover:underline font-medium"
              >
                Google AI Studio
              </a>.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
            <Save size={16} />
            Guardar Configuración
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
