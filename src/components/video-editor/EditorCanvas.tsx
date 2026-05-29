'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useVideoEditorStore, EditorElement } from '@/stores/useVideoEditorStore';
import { useDraggable } from '@dnd-kit/core';

// A single element on the canvas
const CanvasElement = ({ el }: { el: EditorElement }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: el.id,
        data: { type: 'canvas-element', id: el.id }
    });
    
    const setActiveElement = useVideoEditorStore(s => s.setActiveElement);
    const activeElementId = useVideoEditorStore(s => s.activeElementId);
    
    const isSelected = activeElementId === el.id;

    // Apply dnd transform
    const style: React.CSSProperties = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        position: 'absolute',
        left: el.x,
        top: el.y,
        width: el.width,
        height: el.height,
        color: el.style.color || '#fff',
        fontSize: el.style.fontSize || 32,
        fontFamily: el.style.fontFamily || 'Inter, sans-serif',
        fontWeight: el.style.fontWeight || 'bold',
        opacity: el.style.opacity || 1,
        textAlign: el.style.textAlign || 'center',
        zIndex: isSelected ? 10 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: isSelected ? '2px dashed #00E5FF' : '2px solid transparent',
        cursor: isDragging ? 'grabbing' : 'grab',
    };

    return (
        <div 
            ref={setNodeRef}
            style={style} 
            {...listeners} 
            {...attributes}
            onClick={(e) => {
                e.stopPropagation();
                setActiveElement(el.id);
            }}
            className={`transition-shadow ${isSelected ? 'shadow-[0_0_15px_rgba(0,229,255,0.4)]' : ''}`}
        >
            {el.type === 'text' && <div>{el.content}</div>}
            {el.type === 'image' && <img src={el.content} alt="Element" className="w-full h-full object-cover" />}
            {el.type === 'shape' && <div className="w-full h-full bg-current" />}
        </div>
    );
};

export const EditorCanvas = () => {
    const elements = useVideoEditorStore(s => s.elements);
    const setActiveElement = useVideoEditorStore(s => s.setActiveElement);
    const currentTime = useVideoEditorStore(s => s.currentTime);

    // Droppable area representing the 1080x1920 video
    const { setNodeRef } = useDroppable({
        id: 'video-canvas',
        data: { type: 'canvas' }
    });

    // Only show elements that are active at the currentTime
    const visibleElements = elements.filter(
        el => currentTime >= el.startFrame && currentTime <= el.endFrame
    );

    return (
        <div className="flex-1 h-full relative flex items-center justify-center p-8 overflow-hidden bg-black/60">
            {/* The 9:16 Canvas Simulator. We scale it down to fit the container. */}
            <div 
                ref={setNodeRef}
                onClick={() => setActiveElement(null)}
                className="relative bg-zinc-950 border border-white/10 shadow-2xl overflow-hidden"
                style={{
                    width: '360px',
                    height: '640px',
                    // This creates a 9:16 aspect ratio workspace. 
                    // To act perfectly like 1080x1920 we would use transform scale, but for simplicity of drag coordinates we use CSS dimensions mimicking mobile viewport.
                }}
            >
                {/* Grid overlay for aesthetic */}
                <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
                
                {/* Render Elements */}
                {visibleElements.map(el => (
                    <CanvasElement key={el.id} el={el} />
                ))}
            </div>
            
            <div className="absolute bottom-4 left-4 flex gap-2">
                <span className="text-xs font-mono text-zinc-500 bg-black/50 px-2 py-1 rounded border border-white/5">9:16</span>
                <span className="text-xs font-mono text-zinc-500 bg-black/50 px-2 py-1 rounded border border-white/5">1080x1920</span>
            </div>
        </div>
    );
};
