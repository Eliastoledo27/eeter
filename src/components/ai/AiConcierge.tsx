'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, Sparkles, Truck, CreditCard, Star, ArrowRight, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type ProductSummary = { id: string; name: string; price: number; image: string };

type Message = {
    id: string;
    role: 'assistant' | 'user';
    content: string;
    products?: ProductSummary[];
};

const QUICK_ACTIONS = [
    { label: '¿Qué zapatillas tenés?', icon: ShoppingBag },
    { label: 'Quiero ojotas', icon: Star },
    { label: '¿Hacen envíos?', icon: Truck },
    { label: '¿Cuotas sin interés?', icon: CreditCard },
];

export function AiConcierge() {
    const [isOpen, setIsOpen] = useState(false);
    const [showTeaser, setShowTeaser] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: '¡Hola! 👋 Soy tu asesor personal de ÉTER. Contame qué estilo buscás y te recomiendo el par perfecto de nuestro catálogo 🔥'
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [userInput, setUserInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (!isOpen) {
            timer = setTimeout(() => setShowTeaser(true), 5000);
        } else {
            setShowTeaser(false);
        }
        return () => clearTimeout(timer);
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;
        
        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim() };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setUserInput('');
        setIsLoading(true);

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
            }
        } catch {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Error de conexión. Escribinos por WhatsApp al 2236204002 📱'
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

    // Format message content with bold and links
    const formatContent = (text: string) => {
        const parts = text.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
            }
            // Convert plain urls
            if (part.includes('http')) {
                const words = part.split(' ');
                return <span key={i}>{words.map((w, j) => 
                    w.startsWith('http') ? <a key={j} href={w} target="_blank" rel="noreferrer" className="text-[#00E5FF] hover:underline break-all">{w} </a> : <span key={j}>{w} </span>
                )}</span>;
            }
            return <span key={i}>{part}</span>;
        });
    };

    return (
        <div className="fixed bottom-6 right-6 z-[200] flex flex-col items-end gap-3">
            {/* Teaser Bubble */}
            <AnimatePresence>
                {showTeaser && !isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="relative max-w-[280px]"
                    >
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl rounded-br-sm p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                            <button onClick={() => setShowTeaser(false)} className="absolute top-2 right-2 text-white/20 hover:text-white/50 transition-colors">
                                <X size={12} />
                            </button>
                            <p className="text-white/70 text-[13px] leading-relaxed mb-3">
                                ¿Necesitás ayuda para elegir? Te asesoro con IA 🔥
                            </p>
                            <button
                                onClick={() => { setIsOpen(true); setShowTeaser(false); }}
                                className="text-[9px] font-black uppercase tracking-[0.2em] text-[#00E5FF] hover:text-white transition-colors flex items-center gap-1.5"
                            >
                                Chatear ahora <ArrowRight size={10} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {isOpen ? (
                    <motion.div
                        key="chat"
                        initial={{ opacity: 0, scale: 0.92, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 30 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="w-[92vw] sm:w-[420px] h-[min(85vh,700px)] flex flex-col bg-[#080808] border border-white/[0.06] rounded-[1.5rem] shadow-[0_30px_80px_-10px_rgba(0,0,0,0.95)] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04] bg-[#060606]">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00E5FF]/20 to-[#00E5FF]/5 flex items-center justify-center border border-[#00E5FF]/20">
                                        <Sparkles size={16} className="text-[#00E5FF]" />
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#060606]" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm tracking-tight">ÉTER AI</h3>
                                    <span className="text-[9px] text-emerald-400/80 font-medium tracking-wider uppercase">En línea · Asesor</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-white/20 hover:text-white/60 hover:bg-white/5 transition-all"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-5 scrollbar-none">
                            {messages.map((m) => (
                                <motion.div
                                    key={m.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    {m.role === 'assistant' && (
                                        <div className="w-7 h-7 shrink-0 rounded-lg bg-[#00E5FF]/10 flex items-center justify-center mt-0.5">
                                            <Sparkles size={12} className="text-[#00E5FF]" />
                                        </div>
                                    )}
                                    <div className={`flex flex-col gap-2 max-w-[85%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div
                                            className={`px-4 py-3 text-[13px] leading-[1.6] ${
                                                m.role === 'user'
                                                    ? 'bg-[#00E5FF] text-black font-medium rounded-2xl rounded-tr-sm shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                                                    : 'bg-white/[0.04] text-white/80 rounded-2xl rounded-tl-sm border border-white/[0.04]'
                                            }`}
                                        >
                                            <div className="whitespace-pre-wrap">{formatContent(m.content)}</div>
                                        </div>

                                        {/* Product Carousel */}
                                        {m.products && m.products.length > 0 && (
                                            <div className="w-[85vw] sm:w-[350px] flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none py-2 -ml-2 pl-2">
                                                {m.products.map(p => (
                                                    <Link key={p.id} href={`/catalog/${p.id}`} className="shrink-0 snap-start bg-[#0A0A0A] border border-white/5 rounded-xl overflow-hidden group hover:border-[#00E5FF]/30 transition-colors shadow-lg">
                                                        <div className="w-[140px] h-[140px] relative bg-white/5">
                                                            <Image src={p.image} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                                        </div>
                                                        <div className="p-3 w-[140px]">
                                                            <h4 className="text-white text-[11px] font-bold line-clamp-1 mb-1">{p.name}</h4>
                                                            <p className="text-[#00E5FF] text-[12px] font-black">${p.price.toLocaleString('es-AR')}</p>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-2.5"
                                >
                                    <div className="w-7 h-7 shrink-0 rounded-lg bg-[#00E5FF]/10 flex items-center justify-center">
                                        <Sparkles size={12} className="text-[#00E5FF] animate-pulse" />
                                    </div>
                                    <div className="bg-white/[0.04] border border-white/[0.04] rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5 items-center">
                                        <div className="w-1.5 h-1.5 bg-[#00E5FF]/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-1.5 h-1.5 bg-[#00E5FF]/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-1.5 h-1.5 bg-[#00E5FF]/40 rounded-full animate-bounce" />
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Quick Actions (only show at start) */}
                        {messages.length <= 1 && !isLoading && (
                            <div className="px-4 pb-2">
                                <div className="flex flex-wrap gap-1.5">
                                    {QUICK_ACTIONS.map((action) => (
                                        <button
                                            key={action.label}
                                            onClick={() => sendMessage(action.label)}
                                            className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-xl text-[11px] font-medium text-white/50 hover:text-[#00E5FF] hover:border-[#00E5FF]/20 hover:bg-[#00E5FF]/5 transition-all"
                                        >
                                            <action.icon size={11} />
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="px-4 py-3 border-t border-white/[0.04] bg-[#060606]">
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 flex items-center focus-within:border-[#00E5FF]/30 transition-colors">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Preguntame lo que quieras..."
                                        className="w-full bg-transparent text-white text-[13px] outline-none placeholder:text-white/20"
                                        disabled={isLoading}
                                    />
                                </div>
                                <button
                                    onClick={() => sendMessage(userInput)}
                                    disabled={isLoading || !userInput.trim()}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#00E5FF] text-black hover:bg-[#50EFFF] transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                                >
                                    <Send size={15} />
                                </button>
                            </div>
                            <p className="text-center text-[8px] text-white/15 mt-2 tracking-wider uppercase">Powered by Gemini · ÉTER AI v2.0</p>
                        </div>
                    </motion.div>
                ) : (
                    /* Floating Button */
                    <motion.button
                        key="fab"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setIsOpen(true); setShowTeaser(false); }}
                        className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#00E5FF] to-[#00B3FF] text-black flex items-center justify-center shadow-[0_0_30px_rgba(0,229,255,0.4)] hover:shadow-[0_0_45px_rgba(0,229,255,0.5)] transition-shadow"
                    >
                        <MessageCircle size={22} fill="black" strokeWidth={0} />
                        {/* Pulse ring */}
                        <span className="absolute inset-0 rounded-full border-2 border-[#00E5FF] animate-ping opacity-20" />
                        {/* AI badge */}
                        <span className="absolute -top-1 -right-1 bg-[#050505] text-[#00E5FF] text-[7px] font-black w-5 h-5 flex items-center justify-center rounded-full border border-[#00E5FF]/50 tracking-wider">AI</span>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
