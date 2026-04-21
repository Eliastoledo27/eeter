'use client'

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX, SlidersHorizontal } from 'lucide-react'

type AudioContextType = {
    triggerAuraSound: () => void
    isMuted: boolean
    toggleMute: () => void
    volume: number
    setVolume: (v: number) => void
}

const AudioContext = createContext<AudioContextType>({
    triggerAuraSound: () => {},
    isMuted: true,
    toggleMute: () => {},
    volume: 0.15,
    setVolume: () => {}
})

export const useAudio = () => useContext(AudioContext)

const TRACKS = {
    index: ['/audio/saxo.mp3', '/audio/saxo1.mp3'],
    catalog: ['/audio/hiphop.mp3', '/audio/hiphop1.mp3'],
    aura: '/audio/aura-pop.mp3'
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [isMuted, setIsMuted] = useState(true)
    const [volume, setVolume] = useState(0.15) // Elevator music style (low bg)
    const [hasInteracted, setHasInteracted] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [showSlider, setShowSlider] = useState(false)
    
    // Web Audio API refs
    const audioCtxRef = useRef<AudioContext | any>(null)
    const gainNodeRef = useRef<GainNode | null>(null)
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null)
    const buffersRef = useRef<Record<string, AudioBuffer>>({})
    const auraGainNodeRef = useRef<GainNode | null>(null)
    const currentCategoryRef = useRef<'index' | 'catalog' | null>(null)

    const initAudio = useCallback(async () => {
        if (audioCtxRef.current) return;
        
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContextClass();
            audioCtxRef.current = ctx;

            const mainGain = ctx.createGain();
            mainGain.connect(ctx.destination);
            gainNodeRef.current = mainGain;
            mainGain.gain.value = 0; 

            const auraGain = ctx.createGain();
            auraGain.connect(ctx.destination);
            auraGainNodeRef.current = auraGain;
            auraGain.gain.value = 0.6; 

            loadBuffer(TRACKS.aura);
        } catch (error) {
            console.error('[AudioProvider] AudioContext initialization failed:', error);
        }
    }, []);

    const loadBuffer = async (url: string) => {
        if (!audioCtxRef.current) return null;
        if (buffersRef.current[url]) return buffersRef.current[url];
        
        try {
            const response = await fetch(url);
            if (!response.ok) return null;
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioCtxRef.current.decodeAudioData(arrayBuffer);
            buffersRef.current[url] = audioBuffer;
            return audioBuffer;
        } catch (error) {
            return null;
        }
    }

    const stopAll = useCallback(() => {
        if (sourceNodeRef.current) {
            try { sourceNodeRef.current.onended = null; sourceNodeRef.current.stop(); } catch(e){}
            sourceNodeRef.current.disconnect();
            sourceNodeRef.current = null;
        }
        if (gainNodeRef.current && audioCtxRef.current) {
            gainNodeRef.current.gain.cancelScheduledValues(audioCtxRef.current.currentTime);
        }
        setIsPlaying(false);
    }, []);

    const playCategory = async (category: 'index' | 'catalog', fadeDuration = 2) => {
        if (!audioCtxRef.current || !gainNodeRef.current || isMuted) return;
        
        const ctx = audioCtxRef.current;
        const tracks = TRACKS[category];
        const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];

        // Force stop ANY previous playback before starting loading
        stopAll();

        const buffer = await loadBuffer(randomTrack);
        if (!buffer || isMuted) return;

        // Ensure we didn't start another playback while loading
        if (sourceNodeRef.current) return;

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(gainNodeRef.current);
        
        source.onended = () => {
            if (!isMuted && currentCategoryRef.current === category) {
                playCategory(category, 3);
            }
        };

        sourceNodeRef.current = source;
        source.start(0);
        setIsPlaying(true);
        
        gainNodeRef.current.gain.setValueAtTime(0, ctx.currentTime);
        gainNodeRef.current.gain.linearRampToValueAtTime(volume, ctx.currentTime + fadeDuration);
    }

    // Interactions
    useEffect(() => {
        const handleInteraction = async () => {
            if (!hasInteracted) {
                await initAudio();
                setHasInteracted(true);
                setIsMuted(false);
                window.removeEventListener('click', handleInteraction);
                window.removeEventListener('scroll', handleInteraction);
            }
        }
        window.addEventListener('click', handleInteraction);
        window.addEventListener('scroll', handleInteraction);
        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('scroll', handleInteraction);
        }
    }, [hasInteracted, initAudio]);

    // Combined Route & Mute Logic to prevent race conditions
    useEffect(() => {
        if (!hasInteracted) return;
        
        const isCatalog = pathname.startsWith('/catalog');
        const nextCategory = isCatalog ? 'catalog' : 'index';
        
        if (isMuted) {
            stopAll();
            currentCategoryRef.current = null; // Reset category so it plays again on unmute
        } else {
            if (currentCategoryRef.current !== nextCategory || !isPlaying) {
                currentCategoryRef.current = nextCategory;
                playCategory(nextCategory, 2.5);
            }
        }
    }, [pathname, isMuted, hasInteracted, isPlaying, stopAll]);

    // Volume Adjustment Fade
    useEffect(() => {
        if (!isMuted && gainNodeRef.current && audioCtxRef.current) {
            const ctx = audioCtxRef.current;
            gainNodeRef.current.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.5);
        }
    }, [volume, isMuted]);

    // Volume Adjustment Fade
    useEffect(() => {
        if (!isMuted && gainNodeRef.current && audioCtxRef.current) {
            const ctx = audioCtxRef.current;
            gainNodeRef.current.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.5);
        }
    }, [volume, isMuted]);

    const triggerAuraSound = useCallback(async () => {
        if (isMuted || !hasInteracted || !audioCtxRef.current || !auraGainNodeRef.current) return;
        const buffer = await loadBuffer(TRACKS.aura);
        if (!buffer) return;
        const source = audioCtxRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(auraGainNodeRef.current);
        source.start(0);
    }, [isMuted, hasInteracted]);

    const toggleMute = () => {
        if(!hasInteracted) {
             initAudio().then(() => { setHasInteracted(true); setIsMuted(false); });
             return;
        }
        setIsMuted(prev => !prev);
    }

    return (
        <AudioContext.Provider value={{ triggerAuraSound, isMuted, toggleMute, volume, setVolume }}>
            {children}
            
            {/* Center Right Vertical Tab UI */}
            <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[9999] flex flex-row-reverse items-center gap-1 group">
                <motion.button
                    onMouseEnter={() => setShowSlider(true)}
                    onMouseLeave={() => setShowSlider(false)}
                    onClick={toggleMute}
                    className="bg-[#020202]/60 backdrop-blur-2xl border-l border-y border-[#8B5CF6]/40 p-3 pr-2 pl-4 rounded-l-3xl shadow-[-10px_0_30px_rgba(139,92,246,0.1)] hover:bg-[#020202]/90 hover:border-[#00E5FF]/50 transition-all flex flex-col items-center gap-4 group/btn"
                >
                    <div className="relative">
                        {isMuted ? (
                            <VolumeX size={16} className="text-white/40 group-hover/btn:text-white transition-colors" />
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <Volume2 size={16} className="text-[#00E5FF]" />
                                {isPlaying && (
                                    <div className="flex flex-col items-center gap-[3px] w-3 h-10">
                                        <motion.div animate={{ width: [4, 12, 4] }} transition={{ duration: 0.8, repeat: Infinity }} className="h-1 bg-[#8B5CF6] rounded-full" />
                                        <motion.div animate={{ width: [10, 4, 10] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }} className="h-1 bg-[#00E5FF] rounded-full" />
                                        <motion.div animate={{ width: [6, 14, 6] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }} className="h-1 bg-[#8B5CF6] rounded-full" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.button>

                {/* Hover Slider */}
                <AnimatePresence>
                    {showSlider && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onMouseEnter={() => setShowSlider(true)}
                            onMouseLeave={() => setShowSlider(false)}
                            className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 p-3 rounded-2xl shadow-2xl flex flex-col items-center gap-2 mr-2"
                        >
                            <input 
                                type="range" 
                                min="0" 
                                max="0.5" 
                                step="0.01" 
                                value={volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="h-24 appearance-none bg-white/10 rounded-lg cursor-pointer accent-[#00E5FF] [writing-mode:bt-lr] orientation-vertical"
                                style={{ WebkitAppearance: 'slider-vertical' } as any}
                            />
                            <span className="text-[9px] font-bold text-white/20 uppercase">VOL</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AudioContext.Provider>
    )
}
