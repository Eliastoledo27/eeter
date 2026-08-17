'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
    ListMusic,
    Music2,
    Pause,
    Play,
    Search,
    SkipBack,
    SkipForward,
    SlidersHorizontal,
    Volume2,
    VolumeX,
    X,
    Disc3,
    Sparkles,
    Radio,
    Shuffle,
    Headphones,
    Volume1
} from 'lucide-react'

type AudioContextType = {
    triggerAuraSound: () => void
    playAuraNotification: () => void
    isMuted: boolean
    toggleMute: () => void
    volume: number
    setVolume: (v: number) => void
    isPlaying: boolean
    togglePlay: () => void
    currentTrack: MusicTrack
}

export type MusicTrack = {
    id: string
    title: string
    artist: string
    src: string
    category: 'primary' | 'archive'
    mood?: string
}

// ── 9 Canciones Principales (Rotación Exclusiva por Defecto) ──
const PRIMARY_TRACKS: MusicTrack[] = [
    { id: 'benjamins-deli', title: 'Benjamins Deli', artist: 'ÉTER Sound', src: '/audio/benjamins_deli.mp3', category: 'primary', mood: 'Urbano' },
    { id: 'comfort-chain', title: 'Comfort Chain', artist: 'Instupendo', src: '/audio/comfort_chain.mp3', category: 'primary', mood: 'Vibes' },
    { id: 'golden-hour', title: 'Golden Hour (Remix)', artist: 'JVKE, Seven Kayne', src: '/audio/golden_hour.mp3', category: 'primary', mood: 'Signature' },
    { id: 'in-this-shirt', title: 'In This Shirt', artist: 'The Irrepressibles', src: '/audio/in_this_shirt.mp3', category: 'primary', mood: 'Cinematic' },
    { id: 'monaco', title: 'MONACO', artist: 'Bad Bunny', src: '/audio/monaco.mp3', category: 'primary', mood: 'Urbano' },
    { id: 'my-addiction', title: 'My Addiction', artist: 'Alex Warren', src: '/audio/my_addiction.mp3', category: 'primary', mood: 'Atmospheric' },
    { id: 'shut-up-my-moms-calling', title: "Shut Up My Mom's Calling", artist: 'Hotel Ugly', src: '/audio/shut_up_my_moms_calling.mp3', category: 'primary', mood: 'Indie' },
    { id: 'skyfall', title: 'Skyfall', artist: 'Adele (Éter Edit)', src: '/audio/skyfall.mp3', category: 'primary', mood: 'Cinematic' },
    { id: 'untitled-13', title: 'Untitled #13 (Super Slowed)', artist: 'Glwzbll', src: '/audio/untitled_13.mp3', category: 'primary', mood: 'Phonk/Dark' },
]

// ── Canciones Anteriores (Archivo disponible en la galería) ──
const ARCHIVE_TRACKS: MusicTrack[] = [
    { id: 'barry-lindo', title: 'Barry Lindo', artist: 'El Kuelgue', src: '/audio/barry_lindo.mp3', category: 'archive', mood: 'Urbano' },
    { id: 'clair-de-lune', title: 'Clair de Lune', artist: 'Claude Debussy', src: '/audio/clair_de_lune.mp3', category: 'archive', mood: 'Clásico' },
    { id: 'hiphop', title: 'Hiphop Session', artist: 'Éter Archive', src: '/audio/hiphop.mp3', category: 'archive', mood: 'Urbano' },
    { id: 'hiphop-1', title: 'Hiphop Session II', artist: 'Éter Archive', src: '/audio/hiphop1.mp3', category: 'archive', mood: 'Urbano' },
    { id: 'por-ahora', title: 'Por Ahora', artist: 'Éter Archive', src: '/audio/por_ahora.mp3', category: 'archive', mood: 'Signature' },
    { id: 'ruins', title: 'Ruins', artist: 'Éter Archive', src: '/audio/ruins.mp3', category: 'archive', mood: 'Cinematic' },
    { id: 'saxo', title: 'Saxo Noir', artist: 'Éter Archive', src: '/audio/saxo.mp3', category: 'archive', mood: 'Jazz' },
    { id: 'saxo-1', title: 'Saxo Noir II', artist: 'Éter Archive', src: '/audio/saxo1.mp3', category: 'archive', mood: 'Jazz' },
    { id: 'sentimental-mood', title: 'In a Sentimental Mood', artist: 'Éter Archive', src: '/audio/sentimental_mood.mp3', category: 'archive', mood: 'Jazz' },
    { id: 'tezeta', title: 'Tezeta', artist: 'Éter Archive', src: '/audio/tezeta.mp3', category: 'archive', mood: 'Signature' },
    { id: 'vos-y-la-mancha', title: 'Vos y la Mancha', artist: 'El Kuelgue', src: '/audio/vos_y_la_mancha.mp3', category: 'archive', mood: 'Signature' },
]

const ALL_MUSIC_LIBRARY: MusicTrack[] = [...PRIMARY_TRACKS, ...ARCHIVE_TRACKS]
const AURA_SOUND = '/audio/aura-pop.mp3'

// Selector de canción aleatoria evitando repetir la anterior
function pickRandomTrack(excludeId?: string): MusicTrack {
    const pool = excludeId
        ? PRIMARY_TRACKS.filter((t) => t.id !== excludeId)
        : PRIMARY_TRACKS
    const validPool = pool.length > 0 ? pool : PRIMARY_TRACKS
    const index = Math.floor(Math.random() * validPool.length)
    return validPool[index]
}

const EterAudioContext = createContext<AudioContextType>({
    triggerAuraSound: () => {},
    playAuraNotification: () => {},
    isMuted: false,
    toggleMute: () => {},
    volume: 0.22,
    setVolume: () => {},
    isPlaying: false,
    togglePlay: () => {},
    currentTrack: PRIMARY_TRACKS[0],
})

export const useAudio = () => useContext(EterAudioContext)

export function AudioProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [isMuted, setIsMuted] = useState(false)
    const [volume, setVolume] = useState(0.22)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [isGalleryOpen, setIsGalleryOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<'primary' | 'archive'>('primary')
    const [query, setQuery] = useState('')

    // Track ID determinista para evitar hydration mismatch en SSR
    const [currentTrackId, setCurrentTrackId] = useState<string>(PRIMARY_TRACKS[0].id)
    const [isInitialized, setIsInitialized] = useState(false)

    const audioRef = useRef<HTMLAudioElement | null>(null)
    const audioCtxRef = useRef<globalThis.AudioContext | null>(null)
    const auraGainNodeRef = useRef<GainNode | null>(null)
    const auraBuffersRef = useRef<Record<string, AudioBuffer>>({})
    const autoClickButtonRef = useRef<HTMLButtonElement | null>(null)

    // Track actual
    const currentTrack = useMemo(
        () => ALL_MUSIC_LIBRARY.find((t) => t.id === currentTrackId) || PRIMARY_TRACKS[0],
        [currentTrackId]
    )

    // Selección aleatoria al iniciar en el cliente
    useEffect(() => {
        try {
            const lastTrack = sessionStorage.getItem('eter_last_track') || undefined
            const selected = pickRandomTrack(lastTrack)
            setCurrentTrackId(selected.id)
            sessionStorage.setItem('eter_last_track', selected.id)
        } catch {
            const selected = pickRandomTrack()
            setCurrentTrackId(selected.id)
        }
        setIsInitialized(true)
    }, [])

    const filteredTracks = useMemo(() => {
        const normalized = query.trim().toLowerCase()
        const pool = activeTab === 'primary' ? PRIMARY_TRACKS : ARCHIVE_TRACKS

        return pool.filter((track) => {
            if (!normalized) return true
            return `${track.title} ${track.artist} ${track.mood || ''}`.toLowerCase().includes(normalized)
        })
    }, [activeTab, query])

    const initAuraAudio = useCallback(async () => {
        if (audioCtxRef.current) return
        try {
            const AudioContextClass =
                window.AudioContext ||
                (window as Window & typeof globalThis & { webkitAudioContext?: typeof globalThis.AudioContext })
                    .webkitAudioContext
            const ctx = new AudioContextClass()
            const auraGain = ctx.createGain()
            auraGain.gain.value = 0.5
            auraGain.connect(ctx.destination)
            audioCtxRef.current = ctx
            auraGainNodeRef.current = auraGain
        } catch (error) {
            console.error('[AudioProvider] AudioContext init failed:', error)
        }
    }, [])

    const loadAuraBuffer = useCallback(async (url: string) => {
        if (!audioCtxRef.current) return null
        if (auraBuffersRef.current[url]) return auraBuffersRef.current[url]

        try {
            const response = await fetch(url)
            if (!response.ok) return null
            const arrayBuffer = await response.arrayBuffer()
            const audioBuffer = await audioCtxRef.current.decodeAudioData(arrayBuffer)
            auraBuffersRef.current[url] = audioBuffer
            return audioBuffer
        } catch {
            return null
        }
    }, [])

    // Reproducir una pista específica
    const playTrack = useCallback((track: MusicTrack) => {
        setCurrentTrackId(track.id)
        try { sessionStorage.setItem('eter_last_track', track.id) } catch {}

        if (audioRef.current) {
            audioRef.current.src = track.src
            audioRef.current.load()
            audioRef.current.volume = volume
            audioRef.current.muted = false
            audioRef.current
                .play()
                .then(() => {
                    setIsPlaying(true)
                    setIsMuted(false)
                })
                .catch((err) => {
                    console.warn('[AudioProvider] Playback error:', err)
                })
        }
    }, [volume])

    // Cambiar a siguiente/anterior
    const playRelativeTrack = useCallback((direction: 1 | -1, randomNext = false) => {
        if (randomNext) {
            const nextRandom = pickRandomTrack(currentTrackId)
            playTrack(nextRandom)
            return
        }

        const list = PRIMARY_TRACKS
        const currentIndex = list.findIndex((track) => track.id === currentTrackId)
        const safeIndex = currentIndex >= 0 ? currentIndex : 0
        const nextIndex = (safeIndex + direction + list.length) % list.length
        const nextTrack = list[nextIndex]

        playTrack(nextTrack)
    }, [currentTrackId, playTrack])

    const togglePlay = useCallback(() => {
        if (!audioRef.current) return

        if (isPlaying) {
            audioRef.current.pause()
            setIsPlaying(false)
        } else {
            audioRef.current.src = currentTrack.src
            audioRef.current.volume = volume
            audioRef.current.muted = false
            audioRef.current
                .play()
                .then(() => {
                    setIsPlaying(true)
                    setIsMuted(false)
                })
                .catch(() => {})
        }
    }, [currentTrack.src, isPlaying, volume])

    const toggleMute = useCallback(() => {
        if (!audioRef.current) return

        if (isMuted) {
            audioRef.current.muted = false
            audioRef.current.volume = volume
            setIsMuted(false)
            if (!isPlaying) {
                audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
            }
        } else {
            audioRef.current.muted = true
            setIsMuted(true)
        }
    }, [isMuted, isPlaying, volume])

    // Sincronizar audio.src cada vez que currentTrack cambia
    useEffect(() => {
        if (audioRef.current && isInitialized) {
            const fullTarget = new URL(currentTrack.src, window.location.origin).href
            if (audioRef.current.src !== fullTarget) {
                audioRef.current.src = currentTrack.src
                audioRef.current.load()
                if (isPlaying) {
                    audioRef.current.play().catch(() => {})
                }
            }
        }
    }, [currentTrack, isInitialized, isPlaying])

    // Sincronizar volumen
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume
        }
    }, [volume])

    // ── Auto-activación inmediata: Click automático sintético + Listener de captura global ──
    useEffect(() => {
        if (!isInitialized) return

        const audio = audioRef.current
        if (!audio) return

        let unmuted = false

        const triggerPlayback = () => {
            if (unmuted || !audioRef.current) return
            unmuted = true

            initAuraAudio()
            audioRef.current.muted = false
            audioRef.current.volume = volume

            audioRef.current
                .play()
                .then(() => {
                    setIsPlaying(true)
                    setIsMuted(false)
                })
                .catch(() => {})

            removeListeners()
        }

        // 1. Intento directo con el botón sintético de auto-click
        if (autoClickButtonRef.current) {
            try {
                autoClickButtonRef.current.click()
            } catch {}
        }

        // 2. Intento directo sobre el audio
        audio.src = currentTrack.src
        audio.volume = volume
        audio.muted = false

        audio
            .play()
            .then(() => {
                unmuted = true
                setIsPlaying(true)
                setIsMuted(false)
            })
            .catch(() => {
                // Si el navegador bloquea autoplay, los eventos de captura lo activan al instante
            })

        // 3. Receptores globales de máxima prioridad
        const events = ['pointerdown', 'touchstart', 'touchend', 'mousedown', 'keydown', 'click', 'focus'] as const
        const removeListeners = () => {
            events.forEach((ev) => {
                window.removeEventListener(ev, triggerPlayback, true)
                document.removeEventListener(ev, triggerPlayback, true)
            })
        }

        events.forEach((ev) => {
            window.addEventListener(ev, triggerPlayback, { capture: true, once: true, passive: true })
            document.addEventListener(ev, triggerPlayback, { capture: true, once: true, passive: true })
        })

        return () => {
            removeListeners()
        }
    }, [currentTrack, initAuraAudio, isInitialized, volume])

    const triggerAuraSound = useCallback(async () => {
        if (isMuted) return
        await initAuraAudio()
        if (!audioCtxRef.current || !auraGainNodeRef.current) return

        const buffer = await loadAuraBuffer(AURA_SOUND)
        if (!buffer) return

        const source = audioCtxRef.current.createBufferSource()
        source.buffer = buffer
        source.connect(auraGainNodeRef.current)
        source.start(0)
    }, [initAuraAudio, isMuted, loadAuraBuffer])

    const contextValue = useMemo(
        () => ({
            triggerAuraSound,
            playAuraNotification: triggerAuraSound,
            isMuted,
            toggleMute,
            volume,
            setVolume,
            isPlaying,
            togglePlay,
            currentTrack,
        }),
        [currentTrack, isMuted, isPlaying, toggleMute, togglePlay, triggerAuraSound, volume]
    )

    const activeTrackIndex =
        PRIMARY_TRACKS.findIndex((t) => t.id === currentTrack.id) >= 0
            ? PRIMARY_TRACKS.findIndex((t) => t.id === currentTrack.id) + 1
            : '—'

    return (
        <EterAudioContext.Provider value={contextValue}>
            {/* Botón oculto para auto-click al montar la página */}
            <button
                ref={autoClickButtonRef}
                type="button"
                onClick={togglePlay}
                tabIndex={-1}
                aria-hidden="true"
                className="sr-only opacity-0 pointer-events-none"
            />

            {/* Elemento HTML Audio dedicado con eventos nativos */}
            <audio
                ref={audioRef}
                src={currentTrack.src}
                preload="auto"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => playRelativeTrack(1, true)}
                onError={(e) => console.warn('[Audio] Source error:', e)}
            />

            {children}

            {/* ── Floating Audio Widget (Cleanly positioned ABOVE WhatsApp button) ── */}
            <div className="fixed bottom-24 right-5 sm:bottom-28 sm:right-6 z-[160] flex flex-col items-end gap-3">
                {/* ── Collapsed / Idle Mini Player Capsule ── */}
                <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.85, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 24, stiffness: 280 }}
                    className="relative"
                >
                    <div
                        onClick={() => setIsPanelOpen(!isPanelOpen)}
                        className={`group relative flex items-center gap-3 p-1.5 pr-4 rounded-full border bg-[#080808]/92 text-white shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_20px_rgba(57,255,20,0.06)] backdrop-blur-2xl transition-all duration-300 cursor-pointer hover:border-[#39FF14]/50 hover:shadow-[0_16px_50px_rgba(0,0,0,0.9),0_0_25px_rgba(57,255,20,0.2)] ${
                            isPanelOpen
                                ? 'border-[#39FF14]/60 bg-[#0c0c0c]'
                                : 'border-white/10'
                        }`}
                    >
                        {/* Spinning Turntable / Disc */}
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#141414] border border-white/10 overflow-hidden shadow-inner">
                            <motion.div
                                animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                                transition={isPlaying ? { duration: 4, repeat: Infinity, ease: 'linear' } : { duration: 0.3 }}
                                className="relative flex items-center justify-center w-full h-full"
                            >
                                <Disc3 size={24} className={isPlaying ? 'text-[#39FF14]' : 'text-white/40'} />
                                {/* Center spindle glow */}
                                <span
                                    className={`absolute h-2 w-2 rounded-full ${
                                        isPlaying ? 'bg-[#39FF14] shadow-[0_0_8px_rgba(57,255,20,0.9)] animate-pulse' : 'bg-white/30'
                                    }`}
                                />
                            </motion.div>
                        </div>

                        {/* Track Info Marquee & Equalizer */}
                        <div className="flex flex-col items-start min-w-[85px] max-w-[125px] sm:max-w-[155px] overflow-hidden leading-tight">
                            <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase text-[#39FF14] tracking-wider">
                                <Radio size={10} className={isPlaying ? 'animate-pulse' : ''} />
                                <span>ÉTER SOUND</span>
                            </div>
                            <span className="truncate text-xs font-bold text-white group-hover:text-[#39FF14] transition-colors mt-0.5">
                                {currentTrack.title}
                            </span>
                        </div>

                        {/* Mini Soundwave Indicator */}
                        <div className="flex items-end gap-[2.5px] h-4 px-1">
                            {[0, 1, 2, 3].map((bar) => (
                                <motion.span
                                    key={bar}
                                    animate={isPlaying ? { height: [4, 14 - bar * 2, 5] } : { height: 3 }}
                                    transition={
                                        isPlaying
                                            ? { duration: 0.7 + bar * 0.1, repeat: Infinity, ease: 'easeInOut', delay: bar * 0.08 }
                                            : { duration: 0.2 }
                                    }
                                    className={`w-[2px] rounded-full transition-colors ${
                                        isPlaying ? 'bg-[#39FF14] shadow-[0_0_6px_rgba(57,255,20,0.8)]' : 'bg-white/20'
                                    }`}
                                />
                            ))}
                        </div>

                        {/* Direct Play/Pause trigger button */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                togglePlay()
                            }}
                            className="h-8 w-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-[#39FF14] hover:text-black transition-all"
                            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                        >
                            {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" className="ml-0.5" />}
                        </button>
                    </div>
                </motion.div>

                {/* ── Expanded Sound Studio Panel ── */}
                <AnimatePresence>
                    {isPanelOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: 15 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="w-[min(22rem,calc(100vw-2.5rem))] overflow-hidden rounded-3xl border border-white/10 bg-[#080808]/95 text-white shadow-[0_24px_80px_rgba(0,0,0,0.9),0_0_35px_rgba(57,255,20,0.08)] backdrop-blur-2xl"
                        >
                            {/* Panel Header */}
                            <div className="p-4 border-b border-white/5 bg-gradient-to-b from-white/[0.04] to-transparent">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#39FF14]">
                                        <Sparkles size={12} />
                                        <span>STUDIO PLAYLIST ({activeTrackIndex}/9)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => playRelativeTrack(1, true)}
                                            className="h-7 w-7 rounded-full flex items-center justify-center bg-white/5 text-white/50 hover:text-[#39FF14] hover:bg-white/10 transition-all"
                                            title="Pista aleatoria"
                                        >
                                            <Shuffle size={12} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsPanelOpen(false)}
                                            className="h-7 w-7 rounded-full flex items-center justify-center bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all"
                                        >
                                            <X size={13} />
                                        </button>
                                    </div>
                                </div>

                                {/* Current Playing Hero */}
                                <div className="flex items-center gap-3.5 my-2">
                                    <button
                                        type="button"
                                        onClick={togglePlay}
                                        className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#39FF14] text-black shadow-[0_0_20px_rgba(57,255,20,0.4)] transition hover:bg-white active:scale-95"
                                        aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                                    >
                                        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                                    </button>

                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate text-sm font-black uppercase text-white leading-tight">
                                            {currentTrack.title}
                                        </h3>
                                        <p className="truncate text-[11px] font-mono text-white/50 mt-0.5">
                                            {currentTrack.artist} {currentTrack.mood ? `· ${currentTrack.mood}` : ''}
                                        </p>
                                    </div>
                                </div>

                                {/* Controls: Prev, Next, Mute, Library Drawer */}
                                <div className="mt-4 flex items-center justify-between gap-2">
                                    <button
                                        type="button"
                                        onClick={() => playRelativeTrack(-1)}
                                        className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition"
                                        aria-label="Canción anterior"
                                    >
                                        <SkipBack size={15} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => playRelativeTrack(1)}
                                        className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition"
                                        aria-label="Siguiente canción"
                                    >
                                        <SkipForward size={15} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={toggleMute}
                                        className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition"
                                        aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
                                    >
                                        {isMuted ? <VolumeX size={15} className="text-[#FF3A5C]" /> : <Volume2 size={15} />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsGalleryOpen(!isGalleryOpen)}
                                        className={`grid h-9 w-9 place-items-center rounded-xl border transition ${
                                            isGalleryOpen
                                                ? 'border-[#39FF14] bg-[#39FF14] text-black font-bold'
                                                : 'border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
                                        }`}
                                        aria-label="Explorar canciones"
                                    >
                                        <ListMusic size={15} />
                                    </button>
                                </div>

                                {/* Volume Slider */}
                                <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-black/40 border border-white/5 px-3 py-2">
                                    <SlidersHorizontal size={13} className="text-white/40" />
                                    <input
                                        type="range"
                                        min="0"
                                        max="0.60"
                                        step="0.01"
                                        value={volume}
                                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                                        className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-[#39FF14]"
                                        aria-label="Volumen"
                                    />
                                    <span className="w-7 text-right text-[10px] font-mono font-bold text-white/40">
                                        {Math.round(volume * 100)}%
                                    </span>
                                </div>
                            </div>

                            {/* Track Selector Gallery Drawer */}
                            <AnimatePresence initial={false}>
                                {isGalleryOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.22 }}
                                        className="border-t border-white/10 p-3.5 bg-[#0a0a0a]"
                                    >
                                        {/* Tabs: Principales (9) / Archivo (11) */}
                                        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#121212] border border-white/5 mb-3 font-mono text-[10px] font-bold">
                                            <button
                                                onClick={() => setActiveTab('primary')}
                                                className={`py-1.5 rounded-lg transition-all uppercase ${
                                                    activeTab === 'primary'
                                                        ? 'bg-[#39FF14] text-black font-black shadow-sm'
                                                        : 'text-white/50 hover:text-white'
                                                }`}
                                            >
                                                Nuevas (9)
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('archive')}
                                                className={`py-1.5 rounded-lg transition-all uppercase ${
                                                    activeTab === 'archive'
                                                        ? 'bg-white text-black font-black shadow-sm'
                                                        : 'text-white/50 hover:text-white'
                                                }`}
                                            >
                                                Archivo ({ARCHIVE_TRACKS.length})
                                            </button>
                                        </div>

                                        {/* Search Filter */}
                                        <div className="relative mb-2.5">
                                            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                                            <input
                                                type="text"
                                                value={query}
                                                onChange={(e) => setQuery(e.target.value)}
                                                placeholder="Buscar pista..."
                                                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#141414] border border-white/10 text-xs font-mono text-white placeholder-white/40 focus:border-[#39FF14] focus:outline-none"
                                            />
                                        </div>

                                        {/* Tracks List */}
                                        <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                            {filteredTracks.map((track, idx) => {
                                                const isActive = track.id === currentTrack.id
                                                return (
                                                    <button
                                                        key={track.id}
                                                        type="button"
                                                        onClick={() => playTrack(track)}
                                                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                                                            isActive
                                                                ? 'bg-[#39FF14]/15 border border-[#39FF14]/40 text-white'
                                                                : 'bg-white/[0.02] border border-transparent hover:bg-white/5 text-white/70 hover:text-white'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                                            <span className="text-[10px] font-mono text-white/30 w-4">
                                                                {String(idx + 1).padStart(2, '0')}
                                                            </span>
                                                            <div className="min-w-0">
                                                                <span className="block truncate text-xs font-bold leading-tight">
                                                                    {track.title}
                                                                </span>
                                                                <span className="block truncate text-[10px] font-mono text-white/40">
                                                                    {track.artist}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            {isActive && isPlaying ? (
                                                                <span className="flex items-end gap-0.5 h-3">
                                                                    <span className="w-1 h-3 bg-[#39FF14] rounded-full animate-bounce" />
                                                                    <span className="w-1 h-2 bg-[#39FF14] rounded-full animate-bounce delay-75" />
                                                                    <span className="w-1 h-2.5 bg-[#39FF14] rounded-full animate-bounce delay-150" />
                                                                </span>
                                                            ) : (
                                                                <Play size={12} className="opacity-40 group-hover:opacity-100" />
                                                            )}
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </EterAudioContext.Provider>
    )
}
