'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
    ChevronDown,
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
} from 'lucide-react'

type AudioContextType = {
    triggerAuraSound: () => void
    playAuraNotification: () => void
    isMuted: boolean
    toggleMute: () => void
    volume: number
    setVolume: (v: number) => void
}

type TrackMood = 'signature' | 'urbano' | 'jazz' | 'cinematic' | 'clasico'

type MusicTrack = {
    id: string
    title: string
    artist: string
    src: string
    mood: TrackMood
    routeHint?: 'index' | 'catalog'
}

const EterAudioContext = createContext<AudioContextType>({
    triggerAuraSound: () => {},
    playAuraNotification: () => {},
    isMuted: true,
    toggleMute: () => {},
    volume: 0.15,
    setVolume: () => {},
})

export const useAudio = () => useContext(EterAudioContext)

const MUSIC_LIBRARY: MusicTrack[] = [
    { id: 'barry-lindo', title: 'Barry Lindo', artist: 'El Kuelgue', src: '/audio/barry_lindo.mp3', mood: 'urbano', routeHint: 'index' },
    { id: 'clair-de-lune', title: 'Clair de Lune', artist: 'Claude Debussy', src: '/audio/clair_de_lune.mp3', mood: 'clasico' },
    { id: 'hiphop', title: 'Hiphop Session', artist: 'Eter Archive', src: '/audio/hiphop.mp3', mood: 'urbano', routeHint: 'catalog' },
    { id: 'hiphop-1', title: 'Hiphop Session II', artist: 'Eter Archive', src: '/audio/hiphop1.mp3', mood: 'urbano', routeHint: 'catalog' },
    { id: 'por-ahora', title: 'Por Ahora', artist: 'Eter Archive', src: '/audio/por_ahora.mp3', mood: 'signature' },
    { id: 'ruins', title: 'Ruins', artist: 'Eter Archive', src: '/audio/ruins.mp3', mood: 'cinematic' },
    { id: 'saxo', title: 'Saxo Noir', artist: 'Eter Archive', src: '/audio/saxo.mp3', mood: 'jazz', routeHint: 'index' },
    { id: 'saxo-1', title: 'Saxo Noir II', artist: 'Eter Archive', src: '/audio/saxo1.mp3', mood: 'jazz', routeHint: 'index' },
    { id: 'sentimental-mood', title: 'In a Sentimental Mood', artist: 'Eter Archive', src: '/audio/sentimental_mood.mp3', mood: 'jazz' },
    { id: 'tezeta', title: 'Tezeta', artist: 'Eter Archive', src: '/audio/tezeta.mp3', mood: 'signature' },
    { id: 'vos-y-la-mancha', title: 'Vos y la Mancha', artist: 'El Kuelgue', src: '/audio/vos_y_la_mancha.mp3', mood: 'signature' },
]

const MOOD_OPTIONS: Array<{ key: 'all' | TrackMood; label: string }> = [
    { key: 'signature', label: 'Firma' },
    { key: 'urbano', label: 'Urbano' },
    { key: 'jazz', label: 'Jazz' },
    { key: 'cinematic', label: 'Cine' },
    { key: 'clasico', label: 'Clasico' },
]

const AURA_SOUND = '/audio/aura-pop.mp3'

function routeCategory(pathname: string): 'index' | 'catalog' {
    return pathname.startsWith('/catalog') || pathname.startsWith('/c/') ? 'catalog' : 'index'
}

function formatMood(mood: TrackMood) {
    return MOOD_OPTIONS.find((option) => option.key === mood)?.label || mood
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [isMuted, setIsMuted] = useState(true)
    const [volume, setVolume] = useState(0.16)
    const [hasInteracted, setHasInteracted] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [isGalleryOpen, setIsGalleryOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [moodFilter, setMoodFilter] = useState<'all' | TrackMood>('signature')
    const [currentTrackId, setCurrentTrackId] = useState(MUSIC_LIBRARY[0].id)
    const [manualSelection, setManualSelection] = useState(false)
    const [loadError, setLoadError] = useState<string | null>(null)

    const audioRef = useRef<HTMLAudioElement | null>(null)
    const audioCtxRef = useRef<globalThis.AudioContext | null>(null)
    const auraGainNodeRef = useRef<GainNode | null>(null)
    const auraBuffersRef = useRef<Record<string, AudioBuffer>>({})

    const currentTrack = useMemo(
        () => MUSIC_LIBRARY.find((track) => track.id === currentTrackId) || MUSIC_LIBRARY[0],
        [currentTrackId]
    )

    const filteredTracks = useMemo(() => {
        const normalized = query.trim().toLowerCase()

        return MUSIC_LIBRARY.filter((track) => {
            const matchesMood = moodFilter === 'all' || track.mood === moodFilter
            const matchesQuery = !normalized || `${track.title} ${track.artist} ${track.mood}`.toLowerCase().includes(normalized)
            return matchesMood && matchesQuery
        })
    }, [moodFilter, query])

    const ensureAudioElement = useCallback(() => {
        if (audioRef.current) return audioRef.current

        const audio = new Audio()
        audio.preload = 'metadata'
        audio.loop = false
        audio.volume = volume
        audio.addEventListener('ended', () => {
            setIsPlaying(false)
            playRelativeTrackRef.current?.(1, true)
        })
        audio.addEventListener('error', () => {
            setLoadError('No se pudo cargar esta pista')
            setIsPlaying(false)
        })
        audioRef.current = audio
        return audio
    }, [volume])

    const initAuraAudio = useCallback(async () => {
        if (audioCtxRef.current) return

        try {
            const AudioContextClass = window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext?: typeof globalThis.AudioContext }).webkitAudioContext
            const ctx = new AudioContextClass()
            const auraGain = ctx.createGain()
            auraGain.gain.value = 0.55
            auraGain.connect(ctx.destination)
            audioCtxRef.current = ctx
            auraGainNodeRef.current = auraGain
        } catch (error) {
            console.error('[AudioProvider] AudioContext initialization failed:', error)
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

    const playTrack = useCallback(async (track: MusicTrack, markManual = true) => {
        const audio = ensureAudioElement()
        setHasInteracted(true)
        setLoadError(null)
        setCurrentTrackId(track.id)
        if (markManual) setManualSelection(true)

        if (audio.src !== new URL(track.src, window.location.origin).href) {
            audio.src = track.src
        }

        try {
            audio.muted = false
            audio.volume = volume
            await audio.play()
            setIsMuted(false)
            setIsPlaying(true)
        } catch {
            setLoadError('Toca reproducir nuevamente para activar el audio')
            setIsPlaying(false)
        }
    }, [ensureAudioElement, volume])

    const playRelativeTrackRef = useRef<((direction: 1 | -1, autoplay?: boolean) => void) | null>(null)

    const playRelativeTrack = useCallback((direction: 1 | -1, autoplay = true) => {
        const list = filteredTracks.length ? filteredTracks : MUSIC_LIBRARY
        const currentIndex = list.findIndex((track) => track.id === currentTrackId)
        const safeIndex = currentIndex >= 0 ? currentIndex : 0
        const nextIndex = (safeIndex + direction + list.length) % list.length
        const nextTrack = list[nextIndex]

        if (autoplay && hasInteracted && !isMuted) {
            playTrack(nextTrack)
        } else {
            setCurrentTrackId(nextTrack.id)
            setManualSelection(true)
        }
    }, [currentTrackId, filteredTracks, hasInteracted, isMuted, playTrack])

    useEffect(() => {
        playRelativeTrackRef.current = playRelativeTrack
    }, [playRelativeTrack])

    const toggleMute = useCallback(() => {
        const audio = ensureAudioElement()

        if (!hasInteracted) {
            playTrack(currentTrack)
            return
        }

        if (isMuted) {
            if (!audio.src) {
                playTrack(currentTrack, false)
                return
            }

            setIsMuted(false)
            audio.muted = false
            audio.volume = volume
            audio.play().then(() => setIsPlaying(true)).catch(() => setLoadError('Toca reproducir para activar el audio'))
            return
        }

        audio.pause()
        audio.muted = true
        audio.volume = 0
        setIsMuted(true)
        setIsPlaying(false)
    }, [currentTrack, ensureAudioElement, hasInteracted, isMuted, playTrack, volume])

    const togglePlay = useCallback(() => {
        const audio = ensureAudioElement()
        setHasInteracted(true)

        if (isPlaying) {
            audio.pause()
            setIsPlaying(false)
            return
        }

        playTrack(currentTrack, false)
    }, [currentTrack, ensureAudioElement, isPlaying, playTrack])

    useEffect(() => {
        const audio = ensureAudioElement()
        audio.volume = isMuted ? 0 : volume
        audio.muted = isMuted
    }, [ensureAudioElement, isMuted, volume])

    useEffect(() => {
        if (manualSelection || !hasInteracted || isMuted) return

        const category = routeCategory(pathname)
        const preferredTrack = MUSIC_LIBRARY.find((track) => track.routeHint === category) || MUSIC_LIBRARY[0]
        if (preferredTrack.id !== currentTrackId) {
            playTrack(preferredTrack, false)
        }
    }, [currentTrackId, hasInteracted, isMuted, manualSelection, pathname, playTrack])

    useEffect(() => {
        const handleFirstInteraction = async () => {
            if (hasInteracted) return
            await initAuraAudio()
            setHasInteracted(true)
        }

        window.addEventListener('pointerdown', handleFirstInteraction, { once: true })
        window.addEventListener('keydown', handleFirstInteraction, { once: true })
        return () => {
            window.removeEventListener('pointerdown', handleFirstInteraction)
            window.removeEventListener('keydown', handleFirstInteraction)
        }
    }, [hasInteracted, initAuraAudio])

    const triggerAuraSound = useCallback(async () => {
        if (isMuted || !hasInteracted) return
        await initAuraAudio()
        if (!audioCtxRef.current || !auraGainNodeRef.current) return

        const buffer = await loadAuraBuffer(AURA_SOUND)
        if (!buffer) return

        const source = audioCtxRef.current.createBufferSource()
        source.buffer = buffer
        source.connect(auraGainNodeRef.current)
        source.start(0)
    }, [hasInteracted, initAuraAudio, isMuted, loadAuraBuffer])

    const activeTrackIndex = MUSIC_LIBRARY.findIndex((track) => track.id === currentTrack.id) + 1
    const contextValue = useMemo(
        () => ({ triggerAuraSound, playAuraNotification: triggerAuraSound, isMuted, toggleMute, volume, setVolume }),
        [isMuted, toggleMute, triggerAuraSound, volume]
    )

    return (
        <EterAudioContext.Provider value={contextValue}>
            {children}

            <div className="fixed right-3 top-1/2 z-[9999] flex -translate-y-1/2 flex-row-reverse items-center gap-2 md:right-5 max-sm:bottom-4 max-sm:top-auto max-sm:translate-y-0">
                <motion.button
                    type="button"
                    aria-label={isPanelOpen ? 'Cerrar reproductor' : 'Abrir reproductor'}
                    onClick={() => setIsPanelOpen((value) => !value)}
                    whileTap={{ scale: 0.94 }}
                    className={`group relative flex h-14 items-center gap-2 overflow-hidden rounded-full border bg-[#020202]/86 text-white shadow-[0_18px_45px_rgba(0,0,0,0.65),0_0_24px_rgba(0,229,255,0.12)] backdrop-blur-3xl transition-all duration-300 hover:shadow-[0_18px_55px_rgba(0,0,0,0.75),0_0_32px_rgba(0,229,255,0.25)] ${
                        isPanelOpen
                            ? 'w-[8.5rem] border-[#00E5FF]/45 pl-2 pr-3'
                            : 'w-14 justify-center border-white/10 hover:w-[8.5rem] hover:justify-start hover:border-[#00E5FF]/45 hover:pl-2 hover:pr-3'
                    }`}
                >
                    {!isMuted && isPlaying && (
                        <span className="absolute -inset-1 rounded-full bg-[conic-gradient(from_120deg,rgba(0,229,255,0.35),rgba(198,255,0,0.22),transparent,rgba(0,229,255,0.35))] opacity-80 blur-sm" />
                    )}
                    <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/10 bg-black/60">
                        {isMuted ? (
                            <VolumeX size={18} className="text-white/45" />
                        ) : isPlaying ? (
                            <span className="flex h-5 items-end justify-center gap-[3px]">
                                {[0, 1, 2, 3].map((bar) => (
                                    <motion.span
                                        key={bar}
                                        animate={{ height: [5, 18 - bar * 2, 6] }}
                                        transition={{ duration: 0.8 + bar * 0.12, repeat: Infinity, ease: 'easeInOut', delay: bar * 0.08 }}
                                        className="w-[2.5px] rounded-full bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.75)]"
                                    />
                                ))}
                            </span>
                        ) : (
                            <Music2 size={18} className="text-[#00E5FF]" />
                        )}
                    </span>
                    <span className={`relative min-w-0 overflow-hidden transition-all duration-300 ${isPanelOpen ? 'w-[4.75rem] opacity-100' : 'w-0 opacity-0 group-hover:w-[4.75rem] group-hover:opacity-100'}`}>
                        <span className="block truncate text-[9px] font-black uppercase tracking-[0.18em] text-[#00E5FF]">Player</span>
                        <span className="mt-0.5 flex items-center gap-1 text-[10px] font-black uppercase text-white/70">
                            {isPanelOpen ? 'Cerrar' : 'Abrir'}
                            <motion.span animate={{ rotate: isPanelOpen ? 90 : -90 }} transition={{ duration: 0.2 }} className="grid h-4 w-4 place-items-center rounded-full bg-white/8">
                                <ChevronDown size={12} />
                            </motion.span>
                        </span>
                    </span>
                </motion.button>

                <AnimatePresence>
                    {isPanelOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: 16, scale: 0.97, filter: 'blur(8px)' }}
                            animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, x: 16, scale: 0.97, filter: 'blur(8px)' }}
                            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                            className="mr-1 w-[min(20rem,calc(100vw-5.5rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#050506]/92 text-white shadow-[0_24px_80px_rgba(0,0,0,0.82),0_0_35px_rgba(0,229,255,0.08)] backdrop-blur-3xl max-sm:fixed max-sm:bottom-20 max-sm:left-3 max-sm:right-3 max-sm:mr-0 max-sm:w-auto"
                        >
                            <div className="bg-[linear-gradient(135deg,rgba(0,229,255,0.1),rgba(255,255,255,0.025)_48%,rgba(255,0,122,0.06))] p-3.5">
                                <div className="flex items-center gap-3">
                                    <button type="button" onClick={togglePlay} className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#00E5FF] text-black shadow-[0_0_28px_rgba(0,229,255,0.35)] transition hover:brightness-110 active:scale-95" aria-label={isPlaying ? 'Pausar' : 'Reproducir'}>
                                        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                                    </button>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.18em] text-[#00E5FF]">
                                            <Music2 size={12} />
                                            Eter Player
                                        </div>
                                        <h2 className="mt-1 truncate text-sm font-black uppercase tracking-normal text-white">{currentTrack.title}</h2>
                                        <p className="truncate text-[11px] text-white/45">{currentTrack.artist} / {activeTrackIndex} de {MUSIC_LIBRARY.length}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsPanelOpen(false)
                                            setIsGalleryOpen(false)
                                        }}
                                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 bg-black/35 text-white/45 transition hover:border-white/25 hover:text-white"
                                        aria-label="Contraer reproductor"
                                    >
                                        <ChevronDown size={15} />
                                    </button>
                                </div>

                                <div className="mt-3 flex items-center justify-between gap-2">
                                    <button type="button" onClick={() => playRelativeTrack(-1)} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/65 transition hover:border-[#00E5FF]/35 hover:text-white" aria-label="Cancion anterior">
                                        <SkipBack size={17} />
                                    </button>
                                    <button type="button" onClick={() => playRelativeTrack(1)} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/65 transition hover:border-[#00E5FF]/35 hover:text-white" aria-label="Siguiente cancion">
                                        <SkipForward size={17} />
                                    </button>
                                    <button type="button" onClick={toggleMute} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/65 transition hover:border-[#00E5FF]/35 hover:text-white" aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}>
                                        {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsGalleryOpen((value) => !value)}
                                        className={`grid h-10 w-10 place-items-center rounded-full border transition ${isGalleryOpen ? 'border-[#00E5FF] bg-[#00E5FF] text-black' : 'border-white/10 bg-white/[0.04] text-white/65 hover:border-[#00E5FF]/35 hover:text-white'}`}
                                        aria-label={isGalleryOpen ? 'Cerrar galeria de canciones' : 'Abrir galeria de canciones'}
                                    >
                                        <ListMusic size={17} />
                                    </button>
                                </div>

                                <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                                    <SlidersHorizontal size={14} className="text-white/35" />
                                    <input
                                        type="range"
                                        min="0"
                                        max="0.65"
                                        step="0.01"
                                        value={volume}
                                        onChange={(event) => setVolume(parseFloat(event.target.value))}
                                        className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-[#00E5FF]"
                                        aria-label="Volumen"
                                    />
                                    <span className="w-8 text-right text-[10px] font-black text-white/40">{Math.round(volume * 100)}</span>
                                </div>
                                {loadError && <p className="mt-3 text-[11px] font-semibold text-[#FF007A]">{loadError}</p>}
                            </div>

                            <AnimatePresence initial={false}>
                                {isGalleryOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                                        className="overflow-hidden border-t border-white/10"
                                    >
                                        <div className="p-3">
                                            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/35 px-3 py-2">
                                                <Search size={14} className="text-white/35" />
                                                <input
                                                    value={query}
                                                    onChange={(event) => setQuery(event.target.value)}
                                                    placeholder="Buscar cancion, artista o clima"
                                                    className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/28"
                                                />
                                                {query && (
                                                    <button type="button" onClick={() => setQuery('')} className="text-white/35 transition hover:text-white" aria-label="Limpiar busqueda">
                                                        <X size={14} />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                                {MOOD_OPTIONS.map((option) => (
                                                    <button
                                                        key={option.key}
                                                        type="button"
                                                        onClick={() => setMoodFilter(option.key)}
                                                        className={`shrink-0 rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] transition ${
                                                            moodFilter === option.key
                                                                ? 'border-[#00E5FF] bg-[#00E5FF] text-black'
                                                                : 'border-white/10 bg-white/[0.03] text-white/42 hover:text-white'
                                                        }`}
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="mt-3 flex items-center justify-between px-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/32">
                                                <span>Galeria</span>
                                                <span>{filteredTracks.length} pistas</span>
                                            </div>

                                            <div className="mt-2 max-h-[14.5rem] space-y-1 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(0,229,255,0.35)_transparent] max-sm:max-h-[34dvh]">
                                                {filteredTracks.length ? (
                                                    filteredTracks.map((track) => {
                                                        const active = track.id === currentTrack.id
                                                        return (
                                                            <button
                                                                key={track.id}
                                                                type="button"
                                                                onClick={() => playTrack(track)}
                                                                className={`group flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition ${
                                                                    active
                                                                        ? 'border-[#00E5FF]/45 bg-[#00E5FF]/10'
                                                                        : 'border-transparent bg-white/[0.025] hover:border-white/10 hover:bg-white/[0.055]'
                                                                }`}
                                                            >
                                                                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border ${active ? 'border-[#00E5FF]/40 bg-[#00E5FF]/15 text-[#00E5FF]' : 'border-white/10 bg-black/25 text-white/35 group-hover:text-white'}`}>
                                                                    {active && isPlaying ? <Pause size={13} /> : <Music2 size={13} />}
                                                                </span>
                                                                <span className="min-w-0 flex-1">
                                                                    <span className="block truncate text-[13px] font-black uppercase tracking-normal text-white">{track.title}</span>
                                                                    <span className="mt-0.5 block truncate text-[10px] text-white/38">{track.artist} / {formatMood(track.mood)}</span>
                                                                </span>
                                                            </button>
                                                        )
                                                    })
                                                ) : (
                                                    <div className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-6 text-center text-xs text-white/42">
                                                        No hay canciones para ese filtro.
                                                    </div>
                                                )}
                                            </div>
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
