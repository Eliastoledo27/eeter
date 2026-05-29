'use client';

import React, { useEffect, useRef } from 'react';
import { useVideoEditorStore } from '@/stores/useVideoEditorStore';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

export const EditorTimeline = () => {
    const { 
        currentTime, duration, isPlaying, elements, activeElementId,
        setCurrentTime, setIsPlaying, setActiveElement, updateElement 
    } = useVideoEditorStore();

    const requestRef = useRef<number>();
    const previousTimeRef = useRef<number>();

    const play = () => {
        if (currentTime >= duration) setCurrentTime(0);
        setIsPlaying(true);
    };

    const pause = () => setIsPlaying(false);

    // Playback loop
    useEffect(() => {
        const animate = (time: number) => {
            if (previousTimeRef.current != undefined) {
                if (isPlaying) {
                    useVideoEditorStore.setState((state) => {
                        let nextTime = state.currentTime + 1; // 1 frame per tick approximation
                        // Alternatively, we could calculate precise frames based on delta time
                        if (nextTime > state.duration) {
                            nextTime = 0;
                            state.setIsPlaying(false);
                            return { currentTime: nextTime, isPlaying: false };
                        }
                        return { currentTime: nextTime };
                    });
                }
            }
            previousTimeRef.current = time;
            requestRef.current = requestAnimationFrame(animate);
        };

        if (isPlaying) {
            requestRef.current = requestAnimationFrame(animate);
        } else {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        }

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isPlaying, duration]);

    return (
        <div className="h-64 border-t border-white/5 bg-black/60 backdrop-blur-xl flex flex-col z-20">
            {/* Toolbar */}
            <div className="h-12 border-b border-white/5 flex items-center px-4 gap-4 bg-zinc-950/50">
                <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentTime(0)} className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-white/5">
                        <SkipBack className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={isPlaying ? pause : play} 
                        className="p-1.5 text-black bg-[#00E5FF] hover:bg-cyan-400 rounded transition-colors shadow-[0_0_10px_rgba(0,229,255,0.4)]"
                    >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setCurrentTime(duration)} className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-white/5">
                        <SkipForward className="w-4 h-4" />
                    </button>
                </div>

                <div className="text-[10px] font-mono text-[#00E5FF] tracking-widest font-bold">
                    FRAME: {Math.floor(currentTime)} / {duration}
                </div>
            </div>

            {/* Timeline Tracks */}
            <div className="flex-1 overflow-auto relative">
                {/* Time ruler */}
                <div className="h-6 border-b border-white/5 flex relative bg-zinc-950">
                    {/* Tick marks could go here */}
                    {/* Playhead indicator */}
                    <div 
                        className="absolute top-0 bottom-0 w-px bg-red-500 z-50 h-[1000px] pointer-events-none"
                        style={{ left: `${(currentTime / duration) * 100}%` }}
                    >
                        <div className="absolute top-0 -translate-x-1/2 w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    </div>
                </div>

                {/* Scrubber overlay */}
                <input 
                    type="range"
                    min={0}
                    max={duration}
                    value={currentTime}
                    onChange={(e) => {
                        pause();
                        setCurrentTime(Number(e.target.value));
                    }}
                    className="absolute top-0 left-0 w-full h-6 opacity-0 cursor-ew-resize z-40"
                />

                {/* Tracks */}
                <div className="p-4 space-y-2">
                    {elements.length === 0 ? (
                        <div className="text-[10px] font-mono text-zinc-600 text-center py-4 uppercase">
                            No hay elementos en la línea de tiempo
                        </div>
                    ) : (
                        elements.map(el => {
                            const left = (el.startFrame / duration) * 100;
                            const width = ((el.endFrame - el.startFrame) / duration) * 100;
                            const isSelected = activeElementId === el.id;

                            return (
                                <div key={el.id} className="h-8 bg-zinc-900 border border-white/5 rounded-md relative flex items-center group">
                                    <div className="w-24 shrink-0 px-2 text-[10px] font-mono text-zinc-400 truncate border-r border-white/5">
                                        {el.type}: {el.content.substring(0, 8)}
                                    </div>
                                    <div className="flex-1 relative h-full">
                                        <div 
                                            onClick={() => setActiveElement(el.id)}
                                            className={`absolute top-1 bottom-1 rounded shadow-sm flex items-center px-2 cursor-pointer transition-colors
                                                ${isSelected ? 'bg-[#00E5FF]/20 border border-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.2)]' : 'bg-purple-500/20 border border-purple-500/50 hover:bg-purple-500/30'}
                                            `}
                                            style={{ left: `${left}%`, width: `${width}%` }}
                                        >
                                            <span className="text-[9px] font-mono font-bold text-white truncate">
                                                {el.content}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
