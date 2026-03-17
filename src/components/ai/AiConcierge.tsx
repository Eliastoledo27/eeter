'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, User, Bot, Truck, ArrowRight, UserCheck, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AiConcierge() {
    const [isOpen, setIsOpen] = useState(false);
    const [showTeaser, setShowTeaser] = useState(false);

    // Proactive behavior: Show teaser after 3 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isOpen) setShowTeaser(true);
        }, 3000);
        return () => clearTimeout(timer);
    }, [isOpen]);

    const { messages, input, setInput, handleInputChange, handleSubmit, isLoading, append } = useChat({
        api: '/api/chat',
        initialMessages: [
            {
                id: 'welcome',
                role: 'assistant',
                content: '¡Hola! Bienvenido a la nueva experiencia Gold de Éter Store. Soy tu Concierge Personal.\n\nContame, ¿ya tenés un modelo en mente o necesitás que te guíe entre lo último del catálogo? También recordá que tenemos beneficios exclusivos para Revendedores.'
            }
        ]
    });

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleQuickAction = (text: string) => {
        setIsOpen(true);
        setShowTeaser(false);
        append({
            role: 'user',
            content: text
        });
    };

    return (
        <div className="fixed bottom-8 right-8 z-[200] flex flex-col items-end gap-4">
            {/* Teaser Notification */}
            <AnimatePresence>
                {showTeaser && !isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20, x: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="bg-black/90 backdrop-blur-2xl border border-primary/30 p-5 rounded-2xl shadow-2xl max-w-[280px] ring-1 ring-white/10"
                    >
                        <button
                            onClick={() => setShowTeaser(false)}
                            className="absolute top-2 right-2 text-white/40 hover:text-white"
                        >
                            <X size={14} />
                        </button>
                        <div className="flex items-start gap-3">
                            <div className="size-8 rounded-full bg-primary flex items-center justify-center text-black shrink-0">
                                <Sparkles size={14} />
                            </div>
                            <div>
                                <p className="text-white text-xs font-medium leading-relaxed">
                                    ¿En qué puedo ayudarte hoy? ¿Buscás para vos o para reventa?
                                </p>
                                <div className="flex flex-col gap-2 mt-3">
                                    <button
                                        onClick={() => handleQuickAction("Soy cliente buscaba un par")}
                                        className="text-[10px] uppercase tracking-wider font-bold bg-primary/10 text-primary border border-primary/20 py-2 px-3 hover:bg-primary hover:text-black transition-all flex items-center justify-between group"
                                    >
                                        Buscaba un par <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <button
                                        onClick={() => handleQuickAction("Me interesa ser revendedor")}
                                        className="text-[10px] uppercase tracking-wider font-bold bg-white/5 text-white border border-white/10 py-2 px-3 hover:bg-white hover:text-black transition-all flex items-center justify-between group"
                                    >
                                        Quiero ser Revendedor <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-black/95 backdrop-blur-3xl border border-primary/20 w-[90vw] md:w-[450px] h-[600px] flex flex-col shadow-2xl overflow-hidden ring-1 ring-white/10 rounded-2xl"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-primary/10 to-transparent">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-full bg-primary flex items-center justify-center text-black shadow-gold-glow">
                                    <Sparkles size={18} />
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] leading-none">AI Concierge</h3>
                                    <span className="text-primary text-[9px] font-black uppercase tracking-[0.1em] mt-1.5 block flex items-center gap-1">
                                        <div className="size-1 bg-primary rounded-full animate-pulse" /> ONLINE
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/40 hover:text-white transition-colors p-2"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin overflow-x-hidden"
                        >
                            {messages.map((m) => (
                                <div
                                    key={m.id}
                                    className={cn(
                                        "flex gap-4 max-w-[85%]",
                                        m.role === 'user' ? "ml-auto flex-row-reverse" : ""
                                    )}
                                >
                                    <div className={cn(
                                        "size-8 shrink-0 rounded-full flex items-center justify-center",
                                        m.role === 'user' ? "bg-white/10 text-white" : "bg-primary/20 text-primary border border-primary/30"
                                    )}>
                                        {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                    </div>
                                    <div className={cn(
                                        "p-4 text-sm leading-relaxed rounded-2xl",
                                        m.role === 'user' ? "bg-white/5 text-white" : "text-gray-300 bg-white/[0.02] border border-white/5"
                                    )}>
                                        <div className="whitespace-pre-wrap">{m.content}</div>

                                        {/* Tool Visualization */}
                                        {m.toolInvocations?.map((toolInvocation: any) => {
                                            const { toolName, toolCallId, state } = toolInvocation;
                                            if (state === 'result') {
                                                if (toolName === 'calculateShipping') {
                                                    return (
                                                        <div key={toolCallId} className="mt-4 p-4 bg-primary/10 border border-primary/20 flex flex-col gap-2 rounded-xl">
                                                            <div className="flex items-center gap-2">
                                                                <Truck size={14} className="text-primary" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Logística Showroom</span>
                                                            </div>
                                                            <p className="text-xs text-white">
                                                                Envío a {toolInvocation.result.location}: <span className="text-primary font-bold">${toolInvocation.result.cost}</span>
                                                            </p>
                                                            <p className="text-[10px] text-white/40">Entrega estimada: {toolInvocation.result.estimatedDelivery}</p>
                                                        </div>
                                                    );
                                                }
                                            }
                                            return null;
                                        })}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-4 max-w-[85%]">
                                    <div className="size-8 rounded-full bg-primary/20 text-primary flex items-center justify-center animate-pulse">
                                        <Bot size={14} />
                                    </div>
                                    <div className="flex gap-1 items-center p-4">
                                        <div className="size-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="size-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="size-1.5 bg-primary/50 rounded-full animate-bounce" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Suggestions in chat if only welcome message */}
                        {messages.length === 1 && (
                            <div className="px-6 pb-4 flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleQuickAction("Soy cliente final")}
                                    className="text-[10px] bg-white/5 border border-white/10 px-3 py-2 rounded-full hover:bg-primary hover:text-black hover:border-primary transition-all flex items-center gap-2"
                                >
                                    <ShoppingBag size={12} /> Cliente Final
                                </button>
                                <button
                                    onClick={() => handleQuickAction("Me interesa el catálogo de reventa")}
                                    className="text-[10px] bg-white/5 border border-white/10 px-3 py-2 rounded-full hover:bg-primary hover:text-black hover:border-primary transition-all flex items-center gap-2"
                                >
                                    <UserCheck size={12} /> Emprender / Revendedor
                                </button>
                            </div>
                        )}

                        {/* Input */}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSubmit(e);
                            }}
                            className="p-6 border-t border-white/10 bg-white/[0.02]"
                        >
                            <div className="relative flex items-center gap-3">
                                <input
                                    value={input || ''}
                                    onChange={handleInputChange}
                                    placeholder="Escribí aquí..."
                                    className="flex-1 bg-white/5 border border-white/10 h-14 px-6 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors rounded-xl"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !input?.trim()}
                                    className="size-14 bg-primary text-black flex items-center justify-center group disabled:opacity-50 transition-all hover:scale-105 rounded-xl shrink-0"
                                >
                                    <Send size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                ) : (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                            setIsOpen(true);
                            setShowTeaser(false);
                        }}
                        className="size-16 rounded-full bg-primary text-black flex items-center justify-center shadow-gold-glow border-4 border-black group relative"
                    >
                        <MessageSquare size={24} className="group-hover:rotate-12 transition-transform" />
                        <span className="absolute -top-1 -right-1 bg-white text-black text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg border border-black group-hover:scale-110 transition-transform">
                            AI
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
