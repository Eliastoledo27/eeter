'use client';

import React, { useState } from 'react';
import { 
    DndContext, 
    DragEndEvent, 
    MouseSensor, 
    TouchSensor, 
    useSensor, 
    useSensors, 
    DragStartEvent, 
    DragOverlay 
} from '@dnd-kit/core';
import { useVideoEditorStore, ElementType } from '@/stores/useVideoEditorStore';
import { EditorSidebar } from '@/components/video-editor/EditorSidebar';
import { EditorCanvas } from '@/components/video-editor/EditorCanvas';
import { EditorTimeline } from '@/components/video-editor/EditorTimeline';
import { EditorProperties } from '@/components/video-editor/EditorProperties';
import { Sparkles, Save, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function EterVideosEditorPage() {
    const { elements, addElement, updateElement, activeElementId, setActiveElement } = useVideoEditorStore();
    const [activeDragType, setActiveDragType] = useState<string | null>(null);

    // Sensors for DND
    const mouseSensor = useSensor(MouseSensor, {
        activationConstraint: { distance: 10 },
    });
    const touchSensor = useSensor(TouchSensor, {
        activationConstraint: { delay: 250, tolerance: 5 },
    });
    const sensors = useSensors(mouseSensor, touchSensor);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveElement(null); // Deselect on new drag
        
        if (active.data.current?.type === 'sidebar-preset') {
            setActiveDragType('preset');
        } else if (active.data.current?.type === 'canvas-element') {
            setActiveDragType('canvas-element');
            setActiveElement(active.id as string);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveDragType(null);
        const { active, over, delta } = event;

        if (!over) return;

        // 1. Dragging from sidebar to canvas
        if (active.data.current?.type === 'sidebar-preset' && over.id === 'video-canvas') {
            const presetType = active.data.current.presetType as ElementType;
            
            // Default element properties
            addElement({
                type: presetType,
                x: 50, // Default drop center-ish x
                y: 50, // Default drop center-ish y
                width: 200,
                height: presetType === 'text' ? 60 : 200,
                startFrame: 0,
                endFrame: 150,
                content: presetType === 'text' ? 'NUEVO TEXTO' : (presetType === 'image' ? 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' : ''),
                style: {
                    color: '#ffffff',
                    fontSize: 32,
                    opacity: 1
                }
            });
            toast.success('Elemento añadido al lienzo');
            return;
        }

        // 2. Dragging existing element within canvas
        if (active.data.current?.type === 'canvas-element' && over.id === 'video-canvas') {
            const elementId = active.id as string;
            const element = elements.find(e => e.id === elementId);
            if (element) {
                updateElement(elementId, {
                    x: element.x + delta.x,
                    y: element.y + delta.y
                });
            }
        }
    };

    const exportAction = () => {
        // Here we would ideally trigger the HyperFrames action
        toast.info('Generando Payload para Remotion...', {
            description: 'En un entorno real, esto lanzaría npx remotion render o invocaría una API de Vercel.',
            icon: <Sparkles className="w-4 h-4 text-[#00E5FF]" />
        });
        
        const payload = JSON.stringify(elements, null, 2);
        console.log("HyperFrames Render Payload:", payload);
    };

    return (
        <div className="flex flex-col h-screen bg-black text-white overflow-hidden selection:bg-[#00E5FF]/30">
            {/* Top Navigation Bar */}
            <div className="h-14 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-6 z-30">
                <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-[#00E5FF]" />
                    <h1 className="text-sm font-black tracking-widest uppercase font-mono">
                        ÉTER <span className="text-zinc-500">REEL EDITOR</span>
                    </h1>
                </div>
                
                <div className="flex items-center gap-3">
                    <button className="px-4 py-1.5 rounded-lg border border-white/10 text-xs font-mono font-bold hover:bg-white/5 transition-colors flex items-center gap-2">
                        <Save className="w-3.5 h-3.5" /> Guardar Proyecto
                    </button>
                    <button 
                        onClick={exportAction}
                        className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#00E5FF] to-blue-500 text-black text-xs font-mono font-bold hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(0,229,255,0.4)] flex items-center gap-2"
                    >
                        <Download className="w-3.5 h-3.5" /> Exportar a MP4
                    </button>
                </div>
            </div>

            {/* Main Workspace Workspace */}
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="flex flex-1 overflow-hidden relative">
                    {/* Background decorations */}
                    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#00E5FF]/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
                    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

                    <EditorSidebar />
                    
                    <div className="flex flex-col flex-1 relative z-10">
                        <EditorCanvas />
                        <EditorTimeline />
                    </div>

                    <EditorProperties />
                </div>

                <DragOverlay>
                    {activeDragType === 'preset' ? (
                        <div className="p-3 bg-zinc-800 border border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.5)] rounded-xl opacity-80 cursor-grabbing text-xs font-mono text-white">
                            Soltar en el lienzo...
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
