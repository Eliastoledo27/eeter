'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Type, Image as ImageIcon, Box, Sparkles } from 'lucide-react';

const DraggableItem = ({ id, type, label, icon: Icon }: { id: string, type: string, label: string, icon: any }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id,
        data: { type: 'sidebar-preset', presetType: type }
    });

    return (
        <div 
            ref={setNodeRef} 
            {...listeners} 
            {...attributes}
            className={`
                flex items-center gap-3 p-3 bg-zinc-900 border border-white/5 rounded-xl cursor-grab transition-colors
                ${isDragging ? 'opacity-50 border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.3)]' : 'hover:border-white/20 hover:bg-zinc-800'}
            `}
        >
            <div className="p-2 bg-black/50 rounded-lg text-zinc-400">
                <Icon className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono text-zinc-300 font-semibold">{label}</span>
        </div>
    );
};

export const EditorSidebar = () => {
    return (
        <div className="w-72 h-full bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col z-20">
            <div className="p-4 border-b border-white/5">
                <h2 className="text-xs font-mono font-bold text-[#00E5FF] uppercase flex items-center gap-2 tracking-widest">
                    <Sparkles className="w-4 h-4" />
                    Biblioteca
                </h2>
                <p className="text-[10px] text-zinc-500 font-mono mt-1">Arrastra elementos al lienzo</p>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto space-y-6">
                
                {/* Text Presets */}
                <div className="space-y-3">
                    <h3 className="text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-widest">Títulos</h3>
                    <div className="space-y-2">
                        <DraggableItem id="preset-title" type="text" label="Añadir Título Neón" icon={Type} />
                        <DraggableItem id="preset-subtitle" type="text" label="Añadir Subtítulo" icon={Type} />
                    </div>
                </div>

                {/* Media Presets */}
                <div className="space-y-3">
                    <h3 className="text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-widest">Medios</h3>
                    <div className="space-y-2">
                        <DraggableItem id="preset-image" type="image" label="Añadir Imagen" icon={ImageIcon} />
                        <DraggableItem id="preset-shape" type="shape" label="Añadir Forma" icon={Box} />
                    </div>
                </div>
            </div>
        </div>
    );
};
