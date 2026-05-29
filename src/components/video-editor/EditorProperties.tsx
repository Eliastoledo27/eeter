'use client';

import React from 'react';
import { useVideoEditorStore, ElementType } from '@/stores/useVideoEditorStore';
import { Settings, Type, Layout, Trash2, Clock } from 'lucide-react';

export const EditorProperties = () => {
    const { elements, activeElementId, updateElement, removeElement } = useVideoEditorStore();
    
    const activeElement = elements.find(el => el.id === activeElementId);

    if (!activeElement) {
        return (
            <div className="w-80 h-full bg-black/40 backdrop-blur-xl border-l border-white/5 flex flex-col items-center justify-center p-6 text-center z-20">
                <Settings className="w-8 h-8 text-zinc-600 mb-3" />
                <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">Sin Selección</h3>
                <p className="text-[10px] text-zinc-500 font-mono mt-2">Haz clic en un elemento del lienzo o la línea de tiempo para editar sus propiedades.</p>
            </div>
        );
    }

    return (
        <div className="w-80 h-full bg-black/40 backdrop-blur-xl border-l border-white/5 flex flex-col z-20">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-zinc-950/30">
                <h2 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2 tracking-widest">
                    <Settings className="w-4 h-4 text-purple-400" />
                    Propiedades
                </h2>
                <span className="text-[9px] font-mono bg-zinc-900 px-2 py-0.5 rounded border border-white/10 text-zinc-400 uppercase">
                    {activeElement.type}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-8">
                
                {/* Content Editor */}
                {activeElement.type === 'text' && (
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-mono font-bold text-[#00E5FF] uppercase tracking-widest flex items-center gap-2">
                            <Type className="w-3.5 h-3.5" /> Texto
                        </h3>
                        <textarea
                            value={activeElement.content}
                            onChange={(e) => updateElement(activeElement.id, { content: e.target.value })}
                            className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs font-mono text-white focus:border-[#00E5FF] focus:outline-none min-h-[80px] resize-none"
                        />
                    </div>
                )}

                {activeElement.type === 'image' && (
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-mono font-bold text-[#00E5FF] uppercase tracking-widest flex items-center gap-2">
                            <Layout className="w-3.5 h-3.5" /> URL de la Imagen
                        </h3>
                        <input
                            type="text"
                            value={activeElement.content}
                            onChange={(e) => updateElement(activeElement.id, { content: e.target.value })}
                            className="w-full bg-zinc-950 border border-white/10 rounded-lg p-2.5 text-xs font-mono text-white focus:border-[#00E5FF] focus:outline-none"
                        />
                    </div>
                )}

                {/* Timing */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" /> Tiempo (Frames)
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-mono text-zinc-500 uppercase">Inicio</label>
                            <input
                                type="number"
                                min={0}
                                value={activeElement.startFrame}
                                onChange={(e) => updateElement(activeElement.id, { startFrame: Number(e.target.value) })}
                                className="w-full bg-zinc-900 border border-white/5 rounded-lg p-2 text-xs font-mono text-white focus:border-emerald-400 focus:outline-none text-center"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-mono text-zinc-500 uppercase">Fin</label>
                            <input
                                type="number"
                                min={0}
                                value={activeElement.endFrame}
                                onChange={(e) => updateElement(activeElement.id, { endFrame: Number(e.target.value) })}
                                className="w-full bg-zinc-900 border border-white/5 rounded-lg p-2 text-xs font-mono text-white focus:border-emerald-400 focus:outline-none text-center"
                            />
                        </div>
                    </div>
                </div>

                {/* Style Customization */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-mono font-bold text-pink-400 uppercase tracking-widest flex items-center gap-2">
                        <Layout className="w-3.5 h-3.5" /> Estilo Visual
                    </h3>
                    
                    <div className="space-y-3">
                        {/* Opacity */}
                        <div className="flex items-center justify-between gap-4">
                            <label className="text-[10px] font-mono text-zinc-400 uppercase shrink-0">Opacidad</label>
                            <input
                                type="range"
                                min="0" max="1" step="0.1"
                                value={activeElement.style.opacity ?? 1}
                                onChange={(e) => updateElement(activeElement.id, { style: { ...activeElement.style, opacity: Number(e.target.value) } })}
                                className="w-full h-1 bg-zinc-800 accent-pink-500 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Color */}
                        {(activeElement.type === 'text' || activeElement.type === 'shape') && (
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-mono text-zinc-400 uppercase">Color</label>
                                <input
                                    type="color"
                                    value={activeElement.style.color ?? '#ffffff'}
                                    onChange={(e) => updateElement(activeElement.id, { style: { ...activeElement.style, color: e.target.value } })}
                                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                                />
                            </div>
                        )}

                        {/* Font Size */}
                        {activeElement.type === 'text' && (
                            <div className="flex items-center justify-between gap-4">
                                <label className="text-[10px] font-mono text-zinc-400 uppercase shrink-0">Tamaño</label>
                                <input
                                    type="number"
                                    value={activeElement.style.fontSize ?? 32}
                                    onChange={(e) => updateElement(activeElement.id, { style: { ...activeElement.style, fontSize: Number(e.target.value) } })}
                                    className="w-16 bg-zinc-900 border border-white/5 rounded-lg p-1.5 text-xs font-mono text-white focus:border-pink-400 text-center"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Transforms */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-mono font-bold text-yellow-400 uppercase tracking-widest flex items-center gap-2">
                        <Layout className="w-3.5 h-3.5" /> Geometría
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-mono text-zinc-500 uppercase">X</label>
                            <input
                                type="number"
                                value={Math.round(activeElement.x)}
                                onChange={(e) => updateElement(activeElement.id, { x: Number(e.target.value) })}
                                className="w-full bg-zinc-900 border border-white/5 rounded-lg p-2 text-xs font-mono text-white focus:border-yellow-400 focus:outline-none text-center"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-mono text-zinc-500 uppercase">Y</label>
                            <input
                                type="number"
                                value={Math.round(activeElement.y)}
                                onChange={(e) => updateElement(activeElement.id, { y: Number(e.target.value) })}
                                className="w-full bg-zinc-900 border border-white/5 rounded-lg p-2 text-xs font-mono text-white focus:border-yellow-400 focus:outline-none text-center"
                            />
                        </div>
                    </div>
                </div>

            </div>

            {/* Actions Footer */}
            <div className="p-4 border-t border-white/5 bg-zinc-950/30">
                <button 
                    onClick={() => removeElement(activeElement.id)}
                    className="w-full py-2.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition-colors flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase tracking-widest"
                >
                    <Trash2 className="w-4 h-4" /> Eliminar Elemento
                </button>
            </div>
        </div>
    );
};
