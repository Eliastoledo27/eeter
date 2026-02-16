'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSettings, updateSetting, rollbackSetting } from '@/app/actions/settings';
import { AppSetting, SettingsHistory as HistoryType } from '@/types/messaging';
import { Loader2, History, RotateCcw, Save, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { format } from 'date-fns';

interface SettingsFormProps {
    category: string;
}

export function SettingsForm({ category }: SettingsFormProps) {
    const [settings, setSettings] = useState<AppSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<Record<string, boolean>>({});

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        const result = await getSettings(category);
        // Transform object back to array for rendering or use metadata if available
        if (result.metadata) {
            setSettings(result.metadata as AppSetting[]);
        }
        setLoading(false);
    }, [category]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleChange = async (key: string, value: any) => {
        setSaving(prev => ({ ...prev, [key]: true }));

        // Optimistic update locally
        setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));

        try {
            await updateSetting(key, value);
            toast.success('Configuración guardada automáticamnete');
        } catch (error) {
            console.error('Failed to save setting:', error);
            toast.error('Error al guardar configuración');
            fetchSettings(); // Revert on failure
        } finally {
            setTimeout(() => {
                setSaving(prev => ({ ...prev, [key]: false }));
            }, 500);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            {settings.map((setting) => (
                <div key={setting.key} className="bg-black/40 border border-white/10 rounded-xl p-6 relative group hover:border-white/20 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-white text-lg">{setting.key.replace(/_/g, ' ').toUpperCase()}</h3>
                            <p className="text-sm text-gray-400 mt-1">{setting.description || 'Sin descripción'}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            {saving[setting.key] ? (
                                <span className="text-xs text-primary flex items-center gap-1 animate-pulse">
                                    <Save size={14} /> Guardando...
                                </span>
                            ) : (
                                <span className="text-xs text-green-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Check size={14} /> Al día
                                </span>
                            )}

                            <HistoryButton settingKey={setting.key} onRollback={fetchSettings} />
                        </div>
                    </div>

                    <div className="mt-4">
                        {typeof setting.value === 'boolean' ? (
                            <label className="flex items-center cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={setting.value}
                                        onChange={(e) => handleChange(setting.key, e.target.checked)}
                                    />
                                    <div className={cn("block w-14 h-8 rounded-full transition-colors", setting.value ? 'bg-primary' : 'bg-gray-600')}></div>
                                    <div className={cn("dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform", setting.value ? 'translate-x-6' : '')}></div>
                                </div>
                                <div className="ml-3 text-sm font-medium text-gray-300">
                                    {setting.value ? 'Activado' : 'Desactivado'}
                                </div>
                            </label>
                        ) : (
                            <input
                                type="text"
                                value={setting.value}
                                onChange={(e) => handleChange(setting.key, e.target.value)} // Need debounce here for text input really
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                            />
                        )}
                    </div>

                    <div className="text-[10px] text-gray-600 mt-4 flex justify-between">
                        <span>Última actualización: {setting.updated_at ? format(new Date(setting.updated_at), 'dd/MM/yyyy HH:mm') : 'Nunca'}</span>
                        <span>Por: {setting.updated_by || 'Sistema'}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

function HistoryButton({ settingKey, onRollback }: { settingKey: string; onRollback: () => void }) {
    // Logic to fetch history would be here or passed down. For simplicity, mocking fetch inside dialog.
    // In a real app complexity, this would be its own component with SWR/react-query
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="Ver historial">
                    <History size={18} />
                </button>
            </DialogTrigger>
            <DialogContent className="bg-black/90 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Historial de Cambios: {settingKey}</DialogTitle>
                </DialogHeader>
                <div className="py-4 text-center text-gray-500 text-sm">
                    Funcionalidad de historial disponible próximamente.
                    {/* Here we would list history items and rollback buttons */}
                    <button onClick={() => toast.info('Rollback simulado')} className="mt-4 flex items-center gap-2 mx-auto text-primary px-4 py-2 border border-primary/30 rounded-lg hover:bg-primary/10">
                        <RotateCcw size={16} /> Restaurar versión anterior
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
