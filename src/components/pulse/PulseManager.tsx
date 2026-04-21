
'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Bike, Box, X } from 'lucide-react';
import { useEterPulse } from '@/hooks/useEterPulse';
import { PulseEvent } from '@/types/pulse';
import Link from 'next/link';

export function PulseManager() {
    const [activeNotification, setActiveNotification] = useState<PulseEvent | null>(null);

    const handleNewEvent = useCallback((event: PulseEvent) => {
        setActiveNotification(event);
        // Auto-dismiss after 8 seconds
        setTimeout(() => {
            setActiveNotification(prev => prev?.id === event.id ? null : prev);
        }, 8000);
    }, []);

    useEterPulse(handleNewEvent);

    return (
        <div className="fixed bottom-6 left-6 z-[100] pointer-events-none">
            <AnimatePresence mode="wait">
                {activeNotification && (
                    <motion.div
                        key={activeNotification.id}
                        initial={{ x: -100, opacity: 0, scale: 0.9 }}
                        animate={{ x: 0, opacity: 1, scale: 1 }}
                        exit={{ x: -20, opacity: 0, scale: 0.95 }}
                        className="pointer-events-auto"
                    >
                        <PulseToast 
                            event={activeNotification} 
                            onClose={() => setActiveNotification(null)} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function PulseToast({ event, onClose }: { event: PulseEvent, onClose: () => void }) {
    const getIcon = () => {
        switch (event.channel) {
            case 'SALES': return <ShoppingCart className="text-[#00E5FF]" size={20} />;
            case 'LOCAL_DELIVERY': return <Bike className="text-[#8B5CF6]" size={20} />;
            case 'NATIONAL_SHIPMENT': return <Box className="text-[#00E5FF]" size={20} />;
        }
    };

    const getMessage = () => {
        switch (event.channel) {
            case 'SALES': 
                return (
                    <>
                        <span className="text-white/60">🔥 ¡Venta confirmada! Alguien en </span>
                        <span className="text-white font-bold">{event.city}</span>
                        <span className="text-white/60"> acaba de llevarse unas </span>
                        <span className="text-[#00E5FF] font-black">{event.model}</span>
                        <span className="text-white/60">.</span>
                    </>
                );
            case 'LOCAL_DELIVERY': 
                return (
                    <>
                        <span className="text-white/60">🛵 ¡Reparto en camino! Uno de nuestros 8 repartidores está entregando unas </span>
                        <span className="text-[#8B5CF6] font-black">{event.model}</span>
                        <span className="text-white/60"> en </span>
                        <span className="text-white font-bold">Mar del Plata</span>
                        <span className="text-white/60">.</span>
                    </>
                );
            case 'NATIONAL_SHIPMENT': 
                return (
                    <>
                        <span className="text-white/60">📦 ¡Envío despachado! Un par de </span>
                        <span className="text-[#00E5FF] font-black">{event.model}</span>
                        <span className="text-white/60"> va en camino a </span>
                        <span className="text-white font-bold">{event.city}</span>
                        <span className="text-white/60"> vía correo prioritario.</span>
                    </>
                );
        }
    };

    return (
        <div className="relative group pointer-events-auto">
            {/* Glow Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#8B5CF6] to-[#00E5FF] rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            
            <Link 
                href="/pulse"
                className="flex items-center gap-4 bg-[#0A0A0A]/80 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-2xl max-w-sm hover:bg-[#0A0A0A]/90 transition-all cursor-pointer"
            >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                    {getIcon()}
                </div>
                
                <div className="flex-grow text-xs leading-relaxed">
                    {getMessage()}
                </div>

                <div 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onClose();
                    }}
                    className="flex-shrink-0 p-1 hover:bg-white/5 rounded-md transition-colors text-white/20 hover:text-white pointer-events-auto cursor-pointer"
                >
                    <X size={14} />
                </div>
            </Link>
        </div>
    );
}
