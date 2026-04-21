'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, ChevronRight, ArrowUpRight, MessageCircle, RotateCcw } from 'lucide-react';
import Image from 'next/image';
import { useAudio } from '@/providers/AudioProvider';

type ProductSummary = { id: string; name: string; price: number; image: string; sizes?: string[] };

type Message = {
    id: string;
    role: 'assistant' | 'user';
    content: string;
    products?: ProductSummary[];
};

export function AiConcierge() {
    const [isOpen, setIsOpen] = useState(false);
    const [showTeaser, setShowTeaser] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: 'Soy **Aura**, tu curadora de estilo en ÉTER. Contame qué vibra buscás y tu talle — te armo el match perfecto.'
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<ProductSummary | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const { triggerAuraSound } = useAudio();

    // Aura Cache — auto-reset on 2nd page refresh
    useEffect(() => {
        const visitKey = 'aura-visit-count';
        const count = parseInt(sessionStorage.getItem(visitKey) || '0', 10) + 1;
        sessionStorage.setItem(visitKey, count.toString());

        if (count >= 2) {
            // 2nd refresh in this tab session → clear old chat
            localStorage.removeItem('aura-session');
            sessionStorage.setItem(visitKey, '1'); // reset counter
            return; // keep default welcome message
        }

        const saved = localStorage.getItem('aura-session');
        if (saved) {
            try { setMessages(JSON.parse(saved)); } catch { /* ignore corrupt data */ }
        }
    }, []);

    // Persist messages
    useEffect(() => {
        if (messages.length > 1) {
            localStorage.setItem('aura-session', JSON.stringify(messages));
        }
    }, [messages]);

    // Auto-scroll to bottom on new messages or loading state
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    // Scroll to bottom when chat opens
    useEffect(() => {
        if (isOpen && scrollRef.current) {
            // Use requestAnimationFrame to ensure DOM has rendered
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (scrollRef.current) {
                        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                    }
                });
            });
        }
    }, [isOpen]);

    // Teaser timer
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (!isOpen) {
            timer = setTimeout(() => setShowTeaser(true), 5000);
        } else {
            setShowTeaser(false);
        }
        return () => clearTimeout(timer);
    }, [isOpen]);

    // Auto-focus input on open
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    const resetChat = () => {
        setMessages([{
            id: 'welcome',
            role: 'assistant',
            content: 'Soy **Aura**, tu curadora de estilo en ÉTER. Contame qué vibra buscás y tu talle — te armo el match perfecto.'
        }]);
        localStorage.removeItem('aura-session');
        sessionStorage.setItem('aura-visit-count', '1');
        setShowResetConfirm(false);
        setSelectedProduct(null);
    };

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim() };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setUserInput('');
        setIsLoading(true);
        triggerAuraSound(); // Trigger SFX on user send

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: updatedMessages.map(m => ({ role: m.role, content: m.content }))
                })
            });

            const data = await response.json();

            if (data.text) {
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: data.text,
                    products: data.products
                }]);
                triggerAuraSound(); // Trigger SFX on assistant reply
            }
        } catch {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Señal inestable. Escribime al **2236204002** y te asisto al instante 📱'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(userInput);
        }
    };

    const formatContent = (text: string) => {
        const parts = text.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="text-[#00FFFF] font-bold">{part.slice(2, -2)}</strong>;
            }
            return <span key={i}>{part}</span>;
        });
    };

    const SUGGESTED = [
        "Mostrame zapatillas 🔥",
        "¿Tienen promos? 💰",
        "¿Cómo elijo mi talle? 📏",
        "¿Son originales? ✅",
    ];

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[200] flex flex-col items-end gap-3">

            {/* ═══ TEASER BUBBLE ═══ */}
            <AnimatePresence>
                {showTeaser && !isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.92 }}
                        transition={{ type: 'spring', damping: 20 }}
                        className="relative max-w-[260px]"
                    >
                        <div className="relative bg-[#0A0A0A]/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-4 shadow-[0_16px_48px_rgba(0,0,0,0.6)]">
                            {/* Top accent line */}
                            <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/50 to-transparent" />

                            <button onClick={() => setShowTeaser(false)} className="absolute top-2 right-2 text-white/15 hover:text-white/40 transition-colors">
                                <X size={12} />
                            </button>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#00FFFF] flex items-center justify-center">
                                    <Sparkles size={14} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-white/80 text-[13px] leading-relaxed">
                                        ¿Buscás algo <span className="text-[#00FFFF] font-semibold">exclusivo</span>? Te ayudo a encontrarlo.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => { setIsOpen(true); setShowTeaser(false); triggerAuraSound(); }}
                                className="mt-3 w-full py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[10px] font-bold uppercase tracking-[0.15em] text-white/50 hover:text-[#00FFFF] hover:border-[#00FFFF]/30 transition-all"
                            >
                                Hablar con Aura →
                            </button>
                        </div>

                        {/* Pointer triangle */}
                        <div className="absolute -bottom-1.5 right-8 w-3 h-3 bg-[#0A0A0A]/95 border-r border-b border-white/[0.08] rotate-45" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ MAIN CHAT PANEL ═══ */}
            <AnimatePresence mode="wait">
                {isOpen ? (
                    <motion.div
                        key="chat-panel"
                        initial={{ opacity: 0, scale: 0.92, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 30 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                        className="w-[92vw] sm:w-[420px] h-[min(80vh,700px)] flex flex-col bg-[#080808] border border-white/[0.06] rounded-3xl shadow-[0_40px_80px_-16px_rgba(0,0,0,0.8)] overflow-hidden relative"
                    >
                        {/* ── Ambient Background ── */}
                        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[#8B5CF6]/15 rounded-full blur-[120px]" />
                            <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] bg-[#00FFFF]/10 rounded-full blur-[100px]" />
                            {/* Subtle noise texture */}
                            <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noiseFilter%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.85%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noiseFilter)%27/%3E%3C/svg%3E")' }} />
                        </div>

                        {/* ── HEADER ── */}
                        <div className="flex items-center justify-between px-5 py-4 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/[0.04] relative z-10">
                            <div className="flex items-center gap-3">
                                {/* Avatar */}
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#00FFFF] p-[1.5px]">
                                        <div className="w-full h-full rounded-[10px] bg-[#0A0A0A] flex items-center justify-center">
                                            <Sparkles size={16} className="text-[#00FFFF]" />
                                        </div>
                                    </div>
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0A0A0A]" />
                                </div>

                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-white font-bold text-sm tracking-tight">Aura</h3>
                                        <span className="text-[8px] font-bold bg-gradient-to-r from-[#8B5CF6] to-[#00FFFF] text-transparent bg-clip-text uppercase tracking-widest">AI</span>
                                    </div>
                                    <span className="text-[10px] text-white/30 font-medium">Style Curator · En línea</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 relative">
                                {/* Reset button with confirmation */}
                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            if (showResetConfirm) {
                                                resetChat();
                                            } else {
                                                setShowResetConfirm(true);
                                                setTimeout(() => setShowResetConfirm(false), 3000);
                                            }
                                        }}
                                        className={`h-8 flex items-center justify-center rounded-lg transition-all ${
                                            showResetConfirm
                                                ? 'px-3 gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20'
                                                : 'w-8 text-white/20 hover:text-white/50 hover:bg-white/[0.04]'
                                        }`}
                                        title="Borrar chat"
                                    >
                                        <RotateCcw size={13} />
                                        {showResetConfirm && (
                                            <span className="text-[9px] font-bold uppercase tracking-wider">Borrar</span>
                                        )}
                                    </button>
                                </div>

                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-white/20 hover:text-white/50 hover:bg-white/[0.04] transition-all"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* ── MESSAGES ── */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-4 scrollbar-none relative z-10">
                            {messages.map((m) => (
                                <motion.div
                                    key={m.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex flex-col gap-2.5 max-w-[85%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>

                                        {/* Aura avatar for assistant messages */}
                                        {m.role === 'assistant' && (
                                            <div className="flex items-center gap-2 pl-1">
                                                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#8B5CF6]/60 to-[#00FFFF]/60 flex items-center justify-center">
                                                    <Sparkles size={10} className="text-white" />
                                                </div>
                                                <span className="text-[10px] font-semibold text-white/25 uppercase tracking-wider">Aura</span>
                                            </div>
                                        )}

                                        {/* Message Bubble */}
                                        <div
                                            className={`px-4 py-3 text-[14px] leading-[1.6] relative ${
                                                m.role === 'user'
                                                    ? 'bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] text-white rounded-2xl rounded-br-md shadow-[0_4px_20px_rgba(139,92,246,0.25)]'
                                                    : 'bg-white/[0.04] text-white/85 border border-white/[0.06] rounded-2xl rounded-tl-md'
                                            }`}
                                        >
                                            {m.role === 'assistant' && (
                                                <div className="absolute top-0 left-0 w-12 h-px bg-gradient-to-r from-[#00FFFF]/40 to-transparent" />
                                            )}
                                            <div className="whitespace-pre-wrap">{formatContent(m.content)}</div>
                                        </div>

                                        {/* ── THE VAULT — Selection Carousel ── */}
                                        {m.products && m.products.length > 0 && (
                                            <div className="w-full mt-1">
                                                <div className="flex items-center gap-2 mb-2.5 px-1">
                                                    <div className="h-px flex-1 bg-gradient-to-r from-[#8B5CF6]/30 via-[#00FFFF]/20 to-transparent" />
                                                    <span className="text-[8px] font-bold text-white/25 uppercase tracking-[0.2em]">
                                                        {m.products.length} match{m.products.length > 1 ? 'es' : ''}
                                                    </span>
                                                    <div className="h-px flex-1 bg-gradient-to-l from-[#8B5CF6]/30 via-[#00FFFF]/20 to-transparent" />
                                                </div>

                                                <div className="w-[85vw] sm:w-[370px] flex gap-2.5 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-1">
                                                    {m.products.map((p, idx) => (
                                                        <motion.div
                                                            key={p.id}
                                                            initial={{ opacity: 0, y: 16 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: idx * 0.08, type: 'spring', stiffness: 260, damping: 22 }}
                                                            whileHover={{ y: -3 }}
                                                            onClick={() => setSelectedProduct(p)}
                                                            className="shrink-0 snap-start w-[140px] bg-[#0C0C0C] rounded-xl overflow-hidden cursor-pointer group relative border border-white/[0.05] hover:border-[#00FFFF]/25 transition-all duration-400 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                                                        >
                                                            {/* Image */}
                                                            <div className="w-full aspect-[4/5] relative bg-[#070707] overflow-hidden">
                                                                <Image
                                                                    src={p.image}
                                                                    alt={p.name}
                                                                    fill
                                                                    className="object-cover group-hover:scale-105 transition-transform duration-600 ease-out"
                                                                />
                                                                <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0C] via-transparent to-transparent opacity-90" />

                                                                {/* Match indicator */}
                                                                <div className="absolute top-2 left-2 z-10">
                                                                    <div className="bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-md border border-white/[0.08] flex items-center gap-1">
                                                                        <div className="w-1 h-1 rounded-full bg-[#00FFFF] animate-pulse" />
                                                                        <span className="text-[7px] font-bold text-[#00FFFF]">MATCH</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Info */}
                                                            <div className="p-2.5">
                                                                <h4 className="text-white/80 text-[11px] font-semibold line-clamp-1 mb-1 group-hover:text-white transition-colors uppercase tracking-tight">{p.name}</h4>
                                                                
                                                                {/* Mini Sizes Indicator */}
                                                                <div className="flex flex-wrap gap-1 mb-2.5 opacity-60">
                                                                    {p.sizes?.slice(0, 3).map(s => (
                                                                        <span key={s} className="text-[7px] font-black tracking-tighter text-white/40">
                                                                            {s}
                                                                        </span>
                                                                    ))}
                                                                    {(p.sizes?.length || 0) > 3 && (
                                                                        <span className="text-[7px] text-white/20 font-black">+</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-[#00FFFF] text-[13px] font-bold">
                                                                        ${p.price.toLocaleString('es-AR')}
                                                                    </p>
                                                                    <div className="w-5 h-5 rounded-md bg-white/[0.04] flex items-center justify-center group-hover:bg-[#00FFFF] group-hover:text-black transition-all duration-300">
                                                                        <ChevronRight size={10} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {/* Loading indicator */}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-start"
                                >
                                    <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.05] rounded-2xl rounded-tl-md px-4 py-3">
                                        <div className="flex gap-1">
                                            {[0, 1, 2].map(i => (
                                                <motion.div
                                                    key={i}
                                                    className="w-1.5 h-1.5 rounded-full bg-[#00FFFF]/60"
                                                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                                                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-medium text-white/20">Analizando...</span>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* ── SUGGESTED PILLS ── */}
                        {!isLoading && messages.length < 6 && (
                            <div className="px-4 py-2 overflow-x-auto scrollbar-none relative z-20 border-t border-white/[0.03]">
                                <div className="flex gap-1.5">
                                    {SUGGESTED.map((q) => (
                                        <button
                                            key={q}
                                            onClick={() => sendMessage(q)}
                                            className="whitespace-nowrap px-3 py-1.5 bg-white/[0.03] border border-white/[0.05] hover:border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/[0.06] rounded-lg text-[11px] font-medium text-white/40 hover:text-white/70 transition-all shrink-0"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── INPUT ── */}
                        <div className="px-4 py-3 bg-[#0A0A0A]/90 backdrop-blur-xl border-t border-white/[0.04] relative z-20">
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 flex items-center focus-within:border-[#8B5CF6]/30 focus-within:bg-white/[0.04] transition-all">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Preguntale a Aura..."
                                        className="w-full bg-transparent text-white text-[14px] outline-none placeholder:text-white/15 font-medium"
                                        disabled={isLoading}
                                    />
                                </div>
                                <button
                                    onClick={() => sendMessage(userInput)}
                                    disabled={isLoading || !userInput.trim()}
                                    className="w-11 h-11 shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] text-white hover:shadow-[0_0_24px_rgba(139,92,246,0.4)] transition-all disabled:opacity-15 active:scale-95"
                                >
                                    <Send size={16} strokeWidth={2.5} />
                                </button>
                            </div>

                            {/* Powered by line */}
                            <div className="flex items-center justify-center mt-2 gap-1.5">
                                <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
                                <span className="text-[8px] font-medium text-white/15 uppercase tracking-widest">Powered by Gemini · ÉTER Store</span>
                            </div>
                        </div>

                        {/* ── PRODUCT PREVIEW MODAL ── */}
                        <AnimatePresence>
                            {selectedProduct && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end"
                                    onClick={() => setSelectedProduct(null)}
                                >
                                    <motion.div
                                        initial={{ y: '100%' }}
                                        animate={{ y: 0 }}
                                        exit={{ y: '100%' }}
                                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full bg-[#0C0C0C] border-t border-white/[0.08] rounded-t-3xl overflow-hidden"
                                    >
                                        {/* Product Image */}
                                        <div className="relative w-full h-[240px] bg-[#080808]">
                                            <Image src={selectedProduct.image} alt={selectedProduct.name} fill className="object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0C] via-[#0C0C0C]/20 to-transparent" />

                                            {/* Close button */}
                                            <button
                                                onClick={() => setSelectedProduct(null)}
                                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                                            >
                                                <X size={14} />
                                            </button>

                                            {/* Badge */}
                                            <div className="absolute top-4 left-4">
                                                <div className="bg-[#00FFFF]/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#00FFFF]/20">
                                                    <span className="text-[9px] font-bold text-[#00FFFF] uppercase tracking-wider">Aura Match</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Product Info */}
                                        <div className="px-5 pb-6 pt-4">
                                            <h2 className="text-lg font-bold text-white leading-tight mb-1">{selectedProduct.name}</h2>
                                            <div className="flex items-center gap-3 mb-6">
                                                <p className="text-2xl font-black text-[#00FFFF]">
                                                    ${selectedProduct.price.toLocaleString('es-AR')}
                                                </p>
                                                <span className="text-[10px] font-medium text-white/25 uppercase tracking-wider border-l border-white/10 pl-3">
                                                    Envío inmediato
                                                </span>
                                            </div>

                                            {/* Full Sizes View */}
                                            <div className="mb-8">
                                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-3">Talles Disponibles</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedProduct.sizes?.map(size => (
                                                        <div 
                                                            key={size}
                                                            className="w-10 h-10 rounded-lg border border-white/5 bg-white/[0.03] flex items-center justify-center text-xs font-bold text-white/60"
                                                        >
                                                            {size}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => window.open(`/catalog/${selectedProduct.id}`, '_self')}
                                                className="w-full py-4 bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white font-bold uppercase tracking-[0.15em] text-[12px] rounded-2xl hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                            >
                                                Comprar Ahora <ArrowUpRight size={14} />
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </motion.div>
                ) : (
                    /* ═══ FAB BUTTON ═══ */
                    <motion.button
                        key="fab"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => { setIsOpen(true); setShowTeaser(false); triggerAuraSound(); }}
                        className="relative w-[60px] h-[60px] group"
                    >
                        {/* Glow layers */}
                        <div className="absolute inset-[-4px] bg-gradient-to-br from-[#8B5CF6] to-[#00FFFF] rounded-full blur-[16px] opacity-40 group-hover:opacity-70 transition-opacity duration-500" />

                        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center shadow-[0_8px_32px_rgba(139,92,246,0.3)] border border-white/10 overflow-hidden">
                            {/* Inner shine */}
                            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.12] to-transparent rounded-t-full" />
                            <MessageCircle size={22} className="text-white relative z-10" strokeWidth={2.2} />
                        </div>

                        {/* Notification dot */}
                        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-[#00FFFF] rounded-full border-2 border-[#0A0A0A] shadow-[0_0_8px_#00FFFF]" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
