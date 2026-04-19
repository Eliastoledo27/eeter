'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, User, Truck, ArrowRight, UserCheck, ShoppingBag, Zap, ShieldCheck, MapPin, Ruler, MessageCircle, HelpCircle, ChevronLeft, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

type Category = 'MAIN' | 'RESELLER' | 'CLIENT';

type Message = {
    id: string;
    role: 'assistant' | 'user';
    content: string;
};

const PRESETS: Record<Category, any[]> = {
    MAIN: [
        { label: "Cliente VIP", icon: User, category: 'CLIENT' },
        { label: "Revendedor VIP", icon: UserCheck, category: 'RESELLER' },
    ],
    CLIENT: [
        { label: "Consultar Stock", icon: Zap, content: "Quiero consultar stock de un modelo" },
        { label: "¿Dónde están?", icon: MapPin, content: "¿Dónde están ubicados?" },
        { label: "Ver Catálogo", icon: ShoppingBag, content: "Quiero ver el catálogo y talles" },
        { label: "Hablar con Asesor", icon: MessageCircle, content: "Hablar con un asesor por WhatsApp" },
    ],
    RESELLER: [
        { label: "Quiero ser revendedor", icon: Sparkles, content: "Quiero ser revendedor de Éter" },
        { label: "Beneficios VIP", icon: ShieldCheck, content: "Beneficios de ser revendedor" },
        { label: "Catálogo Mayorista", icon: ShoppingBag, content: "Quiero ver el catálogo mayorista" },
    ]
};

export function AiConcierge() {
    const [isOpen, setIsOpen] = useState(false);
    const [showTeaser, setShowTeaser] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<Category>('MAIN');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: 'Bienvenido al Neural Core de ÉTER Cyan Neon Edition: Elite Access.\n\nPara brindarte una experiencia de conectividad absoluta, mi sistema debe escanear tu perfil. ¿Estás buscando asegurar un sneaker de colección como Cliente VIP, o te interesa acceder a nuestro backend y forjar tu imperio de ventas como Revendedor?'
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInputEnabled, setIsInputEnabled] = useState(false);
    const [userInput, setUserInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logic
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Proactive behavior: Show teaser after 3 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isOpen) setShowTeaser(true);
        }, 3000);
        return () => clearTimeout(timer);
    }, [isOpen]);

    const append = async (text: string) => {
        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);
        setIsInputEnabled(false); // Disable after sending

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMsg] })
            });

            const data = await response.json();
            
            if (data.text) {
                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        id: (Date.now() + 1).toString(),
                        role: 'assistant',
                        content: data.text
                    }]);
                    setIsLoading(false);
                    
                    // Enable input if the response asks for details
                    if (data.text.includes('pasame estos datos') || data.text.includes('confirmame') || data.text.includes('¿En qué zona')) {
                        setIsInputEnabled(true);
                    }
                }, 800);
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Sincronización interrumpida. Por favor, utilizá el botón de WhatsApp para soporte directo."
            }]);
            setIsLoading(false);
        }
    };

    const handleSend = () => {
        if (!userInput.trim() || !isInputEnabled) return;

        const originalInput = userInput;
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: originalInput }]);
        setUserInput('');
        setIsInputEnabled(false);

        // Deterministic Smart Simulation
        setTimeout(() => {
            let response = 'Recibido. Un asesor humano analizará esta consulta específica para brindarte soporte a medida. ¿Puedo ayudarte con información sobre envíos, ingresos o certificaciones de calidad?';
            const lowerInput = originalInput.toLowerCase();
            
            if (lowerInput.includes('envío') || lowerInput.includes('envio') || lowerInput.includes('logística') || lowerInput.includes('logistica')) {
                response = 'Nuestra logística abarca todo el país con protección de paquetes. Realizamos despachos en 24hs horas hábiles y nos encargamos de todo el proceso. ¿Querías consultar zonas específicas?';
            } else if (lowerInput.includes('precio') || lowerInput.includes('costo') || lowerInput.includes('cuanto') || lowerInput.includes('margin') || lowerInput.includes('margen')) {
                response = 'Nuestros socios activos generan márgenes promedio entre 30% a 50%. Encontrarás la tabla de precios directos en el Catálogo. No requerimos compra mínima. ¿Buscás precios por mayor o un primer par de prueba?';
            } else if (lowerInput.includes('revendedor') || lowerInput.includes('empezar') || lowerInput.includes('alta') || lowerInput.includes('negocio') || lowerInput.includes('ingreso')) {
                response = 'Excelente salto cualitativo. Para habilitar tu Dashboard y operar, necesitas registrarte. Te brindamos todo: logística, catálogo sin marca y soporte. ¡Sumate a los +500 revendedores!';
            } else if (lowerInput.includes('autenticidad') || lowerInput.includes('original') || lowerInput.includes('calidad') || lowerInput.includes('replica') || lowerInput.includes('brasil')) {
                response = 'Calidad innegociable. Trabajamos calzado origen Brasilero, clasificado Super Premium. Garantizamos materiales retail, tecnología de confort y el sello ÉTER CERTIFIED.';
            } else if (lowerInput.includes('hola') || lowerInput.includes('buenas') || lowerInput.includes('dia') || lowerInput.includes('tarde')) {
                response = '¡Hola! Bienvenido al núcleo operativo ÉTER. Contame tus dudas, estoy diseñado para optimizar tu experiencia y acelerar tus ventas.';
            }

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response
            }]);

            setIsInputEnabled(true);
        }, 1200);
    };

    const handleAction = (label: string, content?: string, category?: Category) => {
        if (category) {
            setCurrentCategory(category);
            return;
        }
        if (content) {
            append(content);
        }
    };

    // handleSend integrado arriba

    const resetMenu = () => {
        setCurrentCategory('MAIN');
        setIsInputEnabled(false);
    };

    return (
        <div className="fixed bottom-8 right-8 z-[200] flex flex-col items-end gap-5">
            {/* Extreme Gold Teaser */}
            <AnimatePresence>
                {showTeaser && !isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 30 }}
                        className="bg-[#050505] border border-white/5 p-6 rounded-2xl shadow-2xl max-w-[320px] overflow-hidden relative"
                    >
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00E5FF]/50 to-transparent" />
                        <button onClick={() => setShowTeaser(false)} className="absolute top-3 right-3 text-[#00E5FF]/30 hover:text-[#00E5FF] transition-colors hover:drop-shadow-[0_0_5px_#00E5FF80]"><X size={16} /></button>
                        <div className="flex items-start gap-4">
                            <div className="size-10 rounded-xl bg-[#00E5FF]/5 flex items-center justify-center text-[#00E5FF] border border-[#00E5FF]/20 shrink-0 shadow-[inset_0_0_10px_rgba(0,229,255,0.1)]"><Zap size={18} className="drop-shadow-[0_0_5px_#00E5FF80]" /></div>
                            <div>
                                <h4 className="text-[#00E5FF] text-[9px] font-bold tracking-[0.25em] uppercase mb-1 drop-shadow-[0_0_2px_#00E5FF50]">ÉTER Concierge</h4>
                                <p className="text-white/60 text-[13px] font-normal leading-relaxed">Sincronizá tu perfil para acceso prioritario.</p>
                                <button onClick={() => { setIsOpen(true); setShowTeaser(false); }} className="mt-4 text-[9px] uppercase tracking-[0.15em] font-bold bg-[#00E5FF] text-black py-2.5 px-4 hover:bg-white hover:text-black transition-colors flex items-center justify-between group rounded-lg w-full shadow-[0_0_15px_#00E5FF40]">SOLICITAR ACCESO <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" /></button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 40 }}
                        className="bg-[#050505] border border-white/5 w-[95vw] sm:w-[500px] h-[720px] flex flex-col shadow-[0_30px_60px_-15px_rgba(0,0,0,1)] overflow-hidden rounded-[2rem]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between relative bg-black/40">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-xl bg-[#00E5FF]/5 border border-[#00E5FF]/20 flex items-center justify-center text-[#00E5FF] relative shadow-[inset_0_0_15px_rgba(0,229,255,0.1)]">
                                    <Sparkles size={20} className="drop-shadow-[0_0_5px_#00E5FF80]" />
                                    <div className="absolute top-0 right-0 size-2 bg-white rounded-full shadow-[0_0_5px_white]" />
                                </div>
                                <div>
                                    <h3 className="text-[#00E5FF] font-bold text-xs uppercase tracking-[0.3em] mt-1 mb-1 drop-shadow-[0_0_2px_#00E5FF40]">ÉTER CONCIERGE</h3>
                                    <span className="text-[#00E5FF]/60 text-[9px] font-medium tracking-[0.2em] relative"><span className="absolute -left-3 inset-y-1 w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse"></span> Neural Intelligence</span>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-white/20 hover:text-white p-2 hover:bg-white/5 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        {/* Messages Area */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-none">
                            <div className="text-center pb-6 opacity-40 select-none">
                                <span className="text-[9px] uppercase font-bold tracking-[0.4em] text-white/50">Encrypted Session</span>
                            </div>
                            {messages.map((m) => (
                                <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("flex gap-4 max-w-[95%]", m.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
                                    <div className={cn("size-8 shrink-0 rounded-lg flex items-center justify-center border transition-all duration-500", m.role === 'user' ? "bg-white/10 text-white border-transparent" : "bg-black text-[#00E5FF] border-[#00E5FF]/20 shadow-[inset_0_0_10px_rgba(0,229,255,0.1)]")}>
                                        {m.role === 'user' ? <User size={14} /> : <Zap size={14} className="drop-shadow-[0_0_3px_#00E5FF80]" />}
                                    </div>
                                    <div className={cn("p-4 text-[13px] font-normal leading-[1.6] rounded-2xl relative", m.role === 'user' ? "bg-white/10 text-white rounded-tr-sm" : "text-[#00E5FF]/90 bg-black border border-[#00E5FF]/20 rounded-tl-sm shadow-[0_0_15px_rgba(0,229,255,0.05)]")}>
                                        <div className="whitespace-pre-wrap">{m.content}</div>
                                        {m.role === 'assistant' && (
                                            <div className="absolute -bottom-5 right-1 opacity-50 flex gap-1 items-center">
                                                <ShieldCheck size={10} className="text-[#00E5FF]" /><span className="text-[8px] font-medium uppercase tracking-widest text-[#00E5FF]/70">Verified_Node</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-4 max-w-[85%]">
                                    <div className="size-8 rounded-lg bg-black text-white/50 flex items-center justify-center border border-white/10"><Sparkles size={14} className="animate-pulse" /></div>
                                    <div className="flex gap-1.5 items-center p-4 bg-black rounded-2xl border border-white/5 rounded-tl-sm">
                                        <div className="size-1.5 bg-white/20 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="size-1.5 bg-white/20 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="size-1.5 bg-white/20 rounded-full animate-bounce" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Presets Navigation */}
                        {!isLoading && (
                            <div className="px-6 pb-4 bg-[#050505]">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[9px] uppercase font-medium tracking-[0.2em] text-white/40">
                                        {currentCategory === 'MAIN' ? 'Módulos Disponibles' : 'Opciones'}
                                    </span>
                                    {currentCategory !== 'MAIN' && (
                                        <button onClick={resetMenu} className="flex items-center gap-1 text-[9px] font-medium text-white/50 hover:text-white transition-colors uppercase tracking-[0.1em]"><ChevronLeft size={10} /> Volver</button>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {PRESETS[currentCategory].map((opt: any) => (
                                        <button
                                            key={opt.label}
                                            onClick={() => handleAction(opt.label, opt.content, opt.category)}
                                            className="text-[10px] uppercase font-bold tracking-[0.1em] bg-[#0A0A0A] border border-[#00E5FF]/10 py-3 px-3 rounded-xl hover:bg-[#00E5FF]/10 hover:border-[#00E5FF]/50 transition-all flex flex-col items-center justify-center gap-2 text-center text-[#00E5FF]/80 group hover:shadow-[0_0_15px_rgba(0,229,255,0.15)]"
                                        >
                                            {opt.icon && <opt.icon size={14} className="text-[#00E5FF] opacity-80 group-hover:opacity-100 group-hover:-translate-y-0.5 transition-all drop-shadow-[0_0_5px_rgba(0,229,255,0.5)]" />}
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-6 border-t border-white/5 bg-[#050505] flex items-center gap-3">
                            <div className={cn("flex-1 bg-[#0A0A0A] border h-12 px-4 flex items-center rounded-lg relative transition-all", isInputEnabled ? "border-white/20 focus-within:border-white/50" : "border-white/5")}>
                                {isInputEnabled ? (
                                    <input
                                        type="text"
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="Escribí aquí..."
                                        className="w-full bg-transparent text-white text-[13px] font-normal outline-none placeholder:text-white/20"
                                        autoFocus
                                    />
                                ) : (
                                    <>
                                        <Sparkles size={12} className="mr-2 text-white/20" />
                                        <span className="text-[10px] font-light uppercase tracking-widest text-white/30 select-none">
                                            Por favor seleccioná una opción
                                        </span>
                                    </>
                                )}
                            </div>
                            <button 
                                onClick={handleSend}
                                disabled={!isInputEnabled}
                                className={cn(
                                    "size-12 flex items-center justify-center rounded-lg transition-all",
                                    isInputEnabled 
                                        ? "bg-[#00E5FF] text-black hover:bg-white hover:text-black active:scale-95 shadow-[0_0_15px_rgba(0,229,255,0.3)]" 
                                        : "bg-white/5 text-white/10 cursor-not-allowed"
                                )}
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.05 }} onClick={() => { setIsOpen(true); setShowTeaser(false); }} className="size-16 rounded-full bg-[#00E5FF] text-black flex items-center justify-center shadow-[0_0_25px_rgba(0,229,255,0.5)] relative group hover:bg-white transition-colors duration-500">
                        <Zap size={20} className="group-hover:scale-110 transition-transform fill-black drop-shadow-[0_0_5px_black]" />
                        <span className="absolute -top-1 -right-1 bg-black text-[#00E5FF] text-[9px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-[1.5px] border-[#00E5FF]">AI</span>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
