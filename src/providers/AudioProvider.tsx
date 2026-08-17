'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
    Disc3,
    ListMusic,
    Pause,
    Play,
    Radio,
    Search,
    Shuffle,
    SkipBack,
    SkipForward,
    SlidersHorizontal,
    Sparkles,
    Volume2,
    VolumeX,
    X,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

export type MusicTrack = {
    id: string
    title: string
    artist: string
    src: string
    category: 'primary' | 'archive'
    mood?: string
}

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

// ─── Track Library ────────────────────────────────────────────────────────────

const PRIMARY_TRACKS: MusicTrack[] = [
    { id: 'benjamins-deli',        title: 'Benjamins Deli',              artist: 'ÉTER Sound',          src: '/audio/benjamins_deli.mp3',         category: 'primary', mood: 'Urbano' },
    { id: 'comfort-chain',         title: 'Comfort Chain',               artist: 'Instupendo',           src: '/audio/comfort_chain.mp3',          category: 'primary', mood: 'Vibes' },
    { id: 'golden-hour',           title: 'Golden Hour (Remix)',         artist: 'JVKE, Seven Kayne',    src: '/audio/golden_hour.mp3',            category: 'primary', mood: 'Signature' },
    { id: 'in-this-shirt',         title: 'In This Shirt',               artist: 'The Irrepressibles',  src: '/audio/in_this_shirt.mp3',          category: 'primary', mood: 'Cinematic' },
    { id: 'monaco',                title: 'MONACO',                      artist: 'Bad Bunny',            src: '/audio/monaco.mp3',                 category: 'primary', mood: 'Urbano' },
    { id: 'my-addiction',          title: 'My Addiction',                artist: 'Alex Warren',          src: '/audio/my_addiction.mp3',           category: 'primary', mood: 'Atmospheric' },
    { id: 'shut-up-my-moms-calling', title: "Shut Up My Mom's Calling", artist: 'Hotel Ugly',           src: '/audio/shut_up_my_moms_calling.mp3',category: 'primary', mood: 'Indie' },
    { id: 'skyfall',               title: 'Skyfall',                     artist: 'Adele (Éter Edit)',    src: '/audio/skyfall.mp3',                category: 'primary', mood: 'Cinematic' },
    { id: 'untitled-13',           title: 'Untitled #13 (Super Slowed)', artist: 'Glwzbll',             src: '/audio/untitled_13.mp3',            category: 'primary', mood: 'Phonk/Dark' },
]

const ARCHIVE_TRACKS: MusicTrack[] = [
    { id: 'barry-lindo',      title: 'Barry Lindo',             artist: 'El Kuelgue',    src: '/audio/barry_lindo.mp3',        category: 'archive', mood: 'Urbano' },
    { id: 'clair-de-lune',    title: 'Clair de Lune',           artist: 'C. Debussy',    src: '/audio/clair_de_lune.mp3',      category: 'archive', mood: 'Clásico' },
    { id: 'hiphop',           title: 'Hiphop Session',          artist: 'Éter Archive',  src: '/audio/hiphop.mp3',             category: 'archive', mood: 'Urbano' },
    { id: 'hiphop-1',         title: 'Hiphop Session II',       artist: 'Éter Archive',  src: '/audio/hiphop1.mp3',            category: 'archive', mood: 'Urbano' },
    { id: 'por-ahora',        title: 'Por Ahora',               artist: 'Éter Archive',  src: '/audio/por_ahora.mp3',          category: 'archive', mood: 'Signature' },
    { id: 'ruins',            title: 'Ruins',                   artist: 'Éter Archive',  src: '/audio/ruins.mp3',              category: 'archive', mood: 'Cinematic' },
    { id: 'saxo',             title: 'Saxo Noir',               artist: 'Éter Archive',  src: '/audio/saxo.mp3',               category: 'archive', mood: 'Jazz' },
    { id: 'saxo-1',           title: 'Saxo Noir II',            artist: 'Éter Archive',  src: '/audio/saxo1.mp3',              category: 'archive', mood: 'Jazz' },
    { id: 'sentimental-mood', title: 'In a Sentimental Mood',   artist: 'Éter Archive',  src: '/audio/sentimental_mood.mp3',   category: 'archive', mood: 'Jazz' },
    { id: 'tezeta',           title: 'Tezeta',                  artist: 'Éter Archive',  src: '/audio/tezeta.mp3',             category: 'archive', mood: 'Signature' },
    { id: 'vos-y-la-mancha',  title: 'Vos y la Mancha',         artist: 'El Kuelgue',    src: '/audio/vos_y_la_mancha.mp3',    category: 'archive', mood: 'Signature' },
]

const ALL_TRACKS = [...PRIMARY_TRACKS, ...ARCHIVE_TRACKS]
const AURA_SOUND  = '/audio/aura-pop.mp3'

function pickRandom(excludeId?: string): MusicTrack {
    const pool = excludeId ? PRIMARY_TRACKS.filter(t => t.id !== excludeId) : PRIMARY_TRACKS
    return (pool.length > 0 ? pool : PRIMARY_TRACKS)[Math.floor(Math.random() * (pool.length || PRIMARY_TRACKS.length))]
}

// ─── Context ──────────────────────────────────────────────────────────────────

const EterAudioCtx = createContext<AudioContextType>({
    triggerAuraSound: () => {},
    playAuraNotification: () => {},
    isMuted: true,
    toggleMute: () => {},
    volume: 0.22,
    setVolume: () => {},
    isPlaying: false,
    togglePlay: () => {},
    currentTrack: PRIMARY_TRACKS[0],
})

export const useAudio = () => useContext(EterAudioCtx)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AudioProvider({ children }: { children: React.ReactNode }) {
    // State
    const [currentTrackId, setCurrentTrackId] = useState(PRIMARY_TRACKS[0].id)
    const [isPlaying,      setIsPlaying]      = useState(false)
    const [isMuted,        setIsMuted]        = useState(true)   // silenciado hasta primer gesto
    const [volume,         setVolumeState]    = useState(0.22)
    const [isPanelOpen,    setIsPanelOpen]    = useState(false)
    const [isGalleryOpen,  setIsGalleryOpen]  = useState(false)
    const [activeTab,      setActiveTab]      = useState<'primary' | 'archive'>('primary')
    const [query,          setQuery]          = useState('')
    const [ready,          setReady]          = useState(false)  // true después de useEffect inicial
  // Debug: indicate when AudioProvider mounts
  console.log('[AudioProvider] mounting, ready initially', false);

    // El audio element se crea IMPERATIVAMENTE en JS para evitar problemas de timing con refs
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const auraCtxRef   = useRef<AudioContext | null>(null)
    const auraGainRef  = useRef<GainNode | null>(null)
    const auraBuffers  = useRef<Record<string, AudioBuffer>>({})

    const currentTrack = useMemo(
        () => ALL_TRACKS.find(t => t.id === currentTrackId) ?? PRIMARY_TRACKS[0],
        [currentTrackId]
    )

    // ── INIT: crear Audio element, elegir pista aleatoria, arrancar en mute ──
    useEffect(() => {
        // Crear el elemento audio imperativamente
        const audio = new Audio()
        audio.preload = 'auto'
        audio.volume  = 0.22
        audio.muted   = true   // arranca silenciado — los navegadores siempre lo permiten
        audioRef.current = audio

        // Elegir pista aleatoria evitando repetir la última
        let trackId = PRIMARY_TRACKS[0].id
        try {
            const last = sessionStorage.getItem('eter_last_track') ?? undefined
            const pick = pickRandom(last)
            trackId = pick.id
            sessionStorage.setItem('eter_last_track', pick.id)
        } catch {
            trackId = pickRandom().id
        }
        setCurrentTrackId(trackId)

        const track = ALL_TRACKS.find(t => t.id === trackId) ?? PRIMARY_TRACKS[0]
        audio.src = track.src

        // Eventos del audio nativo
        audio.addEventListener('play',  () => setIsPlaying(true))
        audio.addEventListener('pause', () => setIsPlaying(false))
        audio.addEventListener('ended', () => {
            const next = pickRandom(trackId)
            setCurrentTrackId(next.id)
            try { sessionStorage.setItem('eter_last_track', next.id) } catch {}
            audio.src = next.src
            audio.load()
            audio.muted  = audioRef.current?.muted ?? false
            audio.volume = 0.22
            audio.play().catch(() => {})
        })

        // Intentar reproducir en silencio inmediatamente
        audio.play().catch(() => {})

        setReady(true)

        return () => {
            audio.pause()
            audio.src = ''
            audioRef.current = null
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // solo una vez al montar

    // ── UNLOCK: desmutar y reproducir al primer gesto o scroll del usuario ──
    useEffect(() => {
        if (!ready) return

        let isUnlocked = false

        const UNLOCK_EVENTS = [
            'pointerdown',
            'touchstart',
            'touchend',
            'mousedown',
            'click',
            'scroll',
            'wheel',
            'touchmove',
            'keydown',
        ] as const

        const cleanup = () => {
            UNLOCK_EVENTS.forEach(ev => {
                window.removeEventListener(ev, unlock, true)
                document.removeEventListener(ev, unlock, true)
            })
        }

        const unlock = () => {
            if (isUnlocked) return
            const audio = audioRef.current
            if (!audio) return

            audio.muted = false
            audio.volume = 0.22

            const playPromise = audio.play()
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        isUnlocked = true
                        setIsPlaying(true)
                        setIsMuted(false)
                        cleanup()
                    })
                    .catch(() => {
                        // Si este gesto específico no tuvo permiso de audio todavía (ej: scroll en algunos navegadores),
                        // no removemos los listeners para que el click/touch lo active inmediatamente.
                    })
            }
        }

        UNLOCK_EVENTS.forEach(ev => {
            window.addEventListener(ev, unlock, { capture: true, passive: true })
            document.addEventListener(ev, unlock, { capture: true, passive: true })
        })

        // Intentar desbloquear de inmediato por si el navegador ya permite autoplay en este dominio
        unlock()

        return () => {
            cleanup()
        }
    }, [ready])

    // ── Cambiar pista ──────────────────────────────────────────────────────────
    const playTrack = useCallback((track: MusicTrack) => {
        const audio = audioRef.current
        if (!audio) return

        setCurrentTrackId(track.id)
        try { sessionStorage.setItem('eter_last_track', track.id) } catch {}

        const wasPlaying = !audio.paused
        audio.src = track.src
        audio.load()
        audio.volume = 0.22
        audio.muted  = false          // al elegir una pista explícitamente, desmutar siempre
        setIsMuted(false)

        audio.play()
            .then(() => setIsPlaying(true))
            .catch(() => {})
    }, [])

    const playRelativeTrack = useCallback((dir: 1 | -1, random = false) => {
        if (random) { playTrack(pickRandom(currentTrackId)); return }
        const idx  = PRIMARY_TRACKS.findIndex(t => t.id === currentTrackId)
        const next = PRIMARY_TRACKS[(idx + dir + PRIMARY_TRACKS.length) % PRIMARY_TRACKS.length]
        playTrack(next)
    }, [currentTrackId, playTrack])

    const togglePlay = useCallback(() => {
        const audio = audioRef.current
        if (!audio) return
        if (audio.paused) {
            audio.muted  = false
            audio.volume = 0.22
            setIsMuted(false)
            audio.play()
                .then(() => setIsPlaying(true))
                .catch(() => {})
        } else {
            audio.pause()
            setIsPlaying(false)
        }
    }, [])

    const toggleMute = useCallback(() => {
        const audio = audioRef.current
        if (!audio) return
        if (isMuted) {
            audio.muted  = false
            audio.volume = 0.22
            setIsMuted(false)
            if (audio.paused) audio.play().catch(() => {})
        } else {
            audio.muted = true
            setIsMuted(true)
        }
    }, [isMuted])

    const setVolume = useCallback((v: number) => {
        setVolumeState(v)
        if (audioRef.current) audioRef.current.volume = v
    }, [])

    // ── Aura sound (AudioContext) ──────────────────────────────────────────────
    const initAura = useCallback(async () => {
        if (auraCtxRef.current) return
        try {
            const Ctx = window.AudioContext || (window as any).webkitAudioContext
            const ctx = new Ctx()
            const gain = ctx.createGain()
            gain.gain.value = 0.5
            gain.connect(ctx.destination)
            auraCtxRef.current = ctx
            auraGainRef.current = gain
        } catch {}
    }, [])

    const triggerAuraSound = useCallback(async () => {
        if (isMuted) return
        await initAura()
        if (!auraCtxRef.current || !auraGainRef.current) return
        if (auraBuffers.current[AURA_SOUND]) {
            const src = auraCtxRef.current.createBufferSource()
            src.buffer = auraBuffers.current[AURA_SOUND]
            src.connect(auraGainRef.current)
            src.start(0)
            return
        }
        try {
            const res = await fetch(AURA_SOUND)
            if (!res.ok) return
            const buf = await auraCtxRef.current.decodeAudioData(await res.arrayBuffer())
            auraBuffers.current[AURA_SOUND] = buf
            const src = auraCtxRef.current.createBufferSource()
            src.buffer = buf
            src.connect(auraGainRef.current)
            src.start(0)
        } catch {}
    }, [initAura, isMuted])

    // ── Context value ──────────────────────────────────────────────────────────
    const ctxValue = useMemo<AudioContextType>(() => ({
        triggerAuraSound,
        playAuraNotification: triggerAuraSound,
        isMuted, toggleMute,
        volume, setVolume,
        isPlaying, togglePlay,
        currentTrack,
    }), [currentTrack, isMuted, isPlaying, setVolume, toggleMute, togglePlay, triggerAuraSound, volume])

    // ── Filtered tracks for gallery ────────────────────────────────────────────
    const filteredTracks = useMemo(() => {
        const q = query.trim().toLowerCase()
        const pool = activeTab === 'primary' ? PRIMARY_TRACKS : ARCHIVE_TRACKS
        return q ? pool.filter(t => `${t.title} ${t.artist} ${t.mood ?? ''}`.toLowerCase().includes(q)) : pool
    }, [activeTab, query])

    const trackIndex = PRIMARY_TRACKS.findIndex(t => t.id === currentTrack.id)
    const activeTrackIndex = trackIndex >= 0 ? trackIndex + 1 : '—'

    // ─── JSX ──────────────────────────────────────────────────────────────────
    return (
        <EterAudioCtx.Provider value={ctxValue}>
            {children}

            {/* ── Floating Audio Widget — z-[9999] siempre encima de todo ── */}
            <div
                className="fixed bottom-24 right-5 sm:bottom-28 sm:right-6 flex flex-col items-end gap-3"
                style={{ zIndex: 9999, isolation: 'isolate' }}
            >
                {/* ── Mini Player Capsule ── */}
                <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.85, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 24, stiffness: 280 }}
                >
                    <div
                        onClick={() => setIsPanelOpen(p => !p)}
                        className={`group relative flex cursor-pointer items-center gap-3 rounded-full border bg-[#080808]/92 p-1.5 pr-4 text-white shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_20px_rgba(57,255,20,0.06)] backdrop-blur-2xl transition-all duration-300 hover:border-[#39FF14]/50 hover:shadow-[0_16px_50px_rgba(0,0,0,0.9),0_0_25px_rgba(57,255,20,0.2)] ${
                            isPanelOpen ? 'border-[#39FF14]/60 bg-[#0c0c0c]' : 'border-white/10'
                        }`}
                    >
                        {/* Spinning Disc */}
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#141414] shadow-inner">
                            <motion.div
                                animate={isPlaying && !isMuted ? { rotate: 360 } : { rotate: 0 }}
                                transition={isPlaying && !isMuted ? { duration: 4, repeat: Infinity, ease: 'linear' } : { duration: 0.3 }}
                                className="relative flex h-full w-full items-center justify-center"
                            >
                                <Disc3 size={24} className={isPlaying && !isMuted ? 'text-[#39FF14]' : 'text-white/40'} />
                                <span className={`absolute h-2 w-2 rounded-full ${isPlaying && !isMuted ? 'animate-pulse bg-[#39FF14] shadow-[0_0_8px_rgba(57,255,20,0.9)]' : 'bg-white/30'}`} />
                            </motion.div>
                        </div>

                        {/* Track info */}
                        <div className="flex min-w-[85px] max-w-[125px] flex-col items-start overflow-hidden leading-tight sm:max-w-[155px]">
                            <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-wider text-[#39FF14]">
                                <Radio size={10} className={isPlaying && !isMuted ? 'animate-pulse' : ''} />
                                <span>{isMuted ? 'SILENCIADO' : 'ÉTER SOUND'}</span>
                            </div>
                            <span className="mt-0.5 truncate text-xs font-bold text-white transition-colors group-hover:text-[#39FF14]">
                                {currentTrack.title}
                            </span>
                        </div>

                        {/* Soundwave bars */}
                        <div className="flex h-4 items-end gap-[2.5px] px-1">
                            {[0, 1, 2, 3].map(bar => (
                                <motion.span
                                    key={bar}
                                    animate={isPlaying && !isMuted ? { height: [4, 14 - bar * 2, 5] } : { height: 3 }}
                                    transition={isPlaying && !isMuted
                                        ? { duration: 0.7 + bar * 0.1, repeat: Infinity, ease: 'easeInOut', delay: bar * 0.08 }
                                        : { duration: 0.2 }
                                    }
                                    className={`w-[2px] rounded-full transition-colors ${isPlaying && !isMuted ? 'bg-[#39FF14] shadow-[0_0_6px_rgba(57,255,20,0.8)]' : 'bg-white/20'}`}
                                />
                            ))}
                        </div>

                        {/* Play/Pause button */}
                        <button
                            type="button"
                            onClick={e => { e.stopPropagation(); togglePlay() }}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all hover:bg-[#39FF14] hover:text-black"
                            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                        >
                            {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" className="ml-0.5" />}
                        </button>
                    </div>
                </motion.div>

                {/* ── Expanded Studio Panel ── */}
                <AnimatePresence>
                    {isPanelOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: 15 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="w-[min(22rem,calc(100vw-2.5rem))] overflow-hidden rounded-3xl border border-white/10 bg-[#080808]/95 text-white shadow-[0_24px_80px_rgba(0,0,0,0.9),0_0_35px_rgba(57,255,20,0.08)] backdrop-blur-2xl"
                        >
                            {/* Header */}
                            <div className="border-b border-white/5 bg-gradient-to-b from-white/[0.04] to-transparent p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#39FF14]">
                                        <Sparkles size={12} />
                                        <span>STUDIO PLAYLIST ({activeTrackIndex}/9)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button type="button" onClick={() => playRelativeTrack(1, true)}
                                            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-white/50 transition-all hover:bg-white/10 hover:text-[#39FF14]">
                                            <Shuffle size={12} />
                                        </button>
                                        <button type="button" onClick={() => setIsPanelOpen(false)}
                                            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-white/50 transition-all hover:bg-white/10 hover:text-white">
                                            <X size={13} />
                                        </button>
                                    </div>
                                </div>

                                {/* Current Track Hero */}
                                <div className="my-2 flex items-center gap-3.5">
                                    <button type="button" onClick={togglePlay}
                                        className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#39FF14] text-black shadow-[0_0_20px_rgba(57,255,20,0.4)] transition hover:bg-white active:scale-95"
                                        aria-label={isPlaying ? 'Pausar' : 'Reproducir'}>
                                        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                                    </button>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate text-sm font-black uppercase leading-tight text-white">{currentTrack.title}</h3>
                                        <p className="mt-0.5 truncate text-[11px] font-mono text-white/50">
                                            {currentTrack.artist}{currentTrack.mood ? ` · ${currentTrack.mood}` : ''}
                                        </p>
                                    </div>
                                </div>

                                {/* Controls row */}
                                <div className="mt-4 flex items-center justify-between gap-2">
                                    {[
                                        { icon: <SkipBack size={15} />, label: 'Anterior', action: () => playRelativeTrack(-1) },
                                        { icon: <SkipForward size={15} />, label: 'Siguiente', action: () => playRelativeTrack(1) },
                                        { icon: isMuted ? <VolumeX size={15} className="text-[#FF3A5C]" /> : <Volume2 size={15} />, label: isMuted ? 'Activar' : 'Silenciar', action: toggleMute },
                                        { icon: <ListMusic size={15} />, label: 'Explorar', action: () => setIsGalleryOpen(g => !g), active: isGalleryOpen },
                                    ].map(btn => (
                                        <button key={btn.label} type="button" onClick={btn.action}
                                            className={`grid h-9 w-9 place-items-center rounded-xl border transition ${
                                                btn.active
                                                    ? 'border-[#39FF14] bg-[#39FF14] font-bold text-black'
                                                    : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                                            }`}
                                            aria-label={btn.label}>
                                            {btn.icon}
                                        </button>
                                    ))}
                                </div>

                                {/* Volume */}
                                <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-white/5 bg-black/40 px-3 py-2">
                                    <SlidersHorizontal size={13} className="text-white/40" />
                                    <input type="range" min="0" max="0.60" step="0.01" value={volume}
                                        onChange={e => setVolume(parseFloat(e.target.value))}
                                        className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-[#39FF14]"
                                        aria-label="Volumen" />
                                    <span className="w-7 text-right text-[10px] font-mono font-bold text-white/40">
                                        {Math.round(volume * 100)}%
                                    </span>
                                </div>
                            </div>

                            {/* Gallery Drawer */}
                            <AnimatePresence initial={false}>
                                {isGalleryOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.22 }}
                                        className="border-t border-white/10 bg-[#0a0a0a] p-3.5"
                                    >
                                        {/* Tabs */}
                                        <div className="mb-3 grid grid-cols-2 gap-1.5 rounded-xl border border-white/5 bg-[#121212] p-1 font-mono text-[10px] font-bold">
                                            {(['primary', 'archive'] as const).map(tab => (
                                                <button key={tab} onClick={() => setActiveTab(tab)}
                                                    className={`rounded-lg py-1.5 uppercase transition-all ${
                                                        activeTab === tab
                                                            ? tab === 'primary' ? 'bg-[#39FF14] font-black text-black shadow-sm' : 'bg-white font-black text-black shadow-sm'
                                                            : 'text-white/50 hover:text-white'
                                                    }`}>
                                                    {tab === 'primary' ? `Nuevas (${PRIMARY_TRACKS.length})` : `Archivo (${ARCHIVE_TRACKS.length})`}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Search */}
                                        <div className="relative mb-2.5">
                                            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                                            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                                                placeholder="Buscar pista..."
                                                className="w-full rounded-lg border border-white/10 bg-[#141414] py-1.5 pl-8 pr-3 text-xs font-mono text-white placeholder-white/40 focus:border-[#39FF14] focus:outline-none" />
                                        </div>

                                        {/* Track list */}
                                        <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
                                            {filteredTracks.map((track, idx) => {
                                                const active = track.id === currentTrack.id
                                                return (
                                                    <button key={track.id} type="button" onClick={() => playTrack(track)}
                                                        className={`flex w-full items-center justify-between rounded-xl p-2 text-left transition-all ${
                                                            active
                                                                ? 'border border-[#39FF14]/40 bg-[#39FF14]/15 text-white'
                                                                : 'border border-transparent bg-white/[0.02] text-white/70 hover:bg-white/5 hover:text-white'
                                                        }`}>
                                                        <div className="flex min-w-0 items-center gap-2.5 pr-2">
                                                            <span className="w-4 text-[10px] font-mono text-white/30">{String(idx + 1).padStart(2, '0')}</span>
                                                            <div className="min-w-0">
                                                                <span className="block truncate text-xs font-bold leading-tight">{track.title}</span>
                                                                <span className="block truncate text-[10px] font-mono text-white/40">{track.artist}</span>
                                                            </div>
                                                        </div>
                                                        {active && isPlaying ? (
                                                            <span className="flex h-3 items-end gap-0.5">
                                                                <span className="h-3 w-1 animate-bounce rounded-full bg-[#39FF14]" />
                                                                <span className="h-2 w-1 animate-bounce rounded-full bg-[#39FF14] delay-75" />
                                                                <span className="h-2.5 w-1 animate-bounce rounded-full bg-[#39FF14] delay-150" />
                                                            </span>
                                                        ) : (
                                                            <Play size={12} className="opacity-40" />
                                                        )}
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
        </EterAudioCtx.Provider>
    )
}
