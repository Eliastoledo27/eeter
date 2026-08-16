'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Truck, Package, X, CheckCircle2 } from 'lucide-react';
import { useEterPulse } from '@/hooks/useEterPulse';
import { PulseEvent } from '@/types/pulse';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function PulseManager() {
    const pathname = usePathname();
    const [activeNotification, setActiveNotification] = useState<PulseEvent | null>(null);

    const handleNewEvent = useCallback((event: PulseEvent) => {
        setActiveNotification(event);
        // Auto-dismiss after 6.5 seconds
        setTimeout(() => {
            setActiveNotification(prev => (prev?.id === event.id ? null : prev));
        }, 6500);
    }, []);

    useEterPulse(handleNewEvent);

    // No mostrar en el portal del revendedor ni en checkout
    if (pathname?.startsWith('/reseller') || pathname?.startsWith('/checkout')) return null;

    return (
        <div className="pointer-events-none fixed bottom-6 left-4 sm:left-6 z-[95] max-w-[360px] sm:max-w-md">
            <AnimatePresence mode="wait">
                {activeNotification && (
                    <motion.div
                        key={activeNotification.id}
                        initial={{ x: -80, opacity: 0, scale: 0.95 }}
                        animate={{ x: 0, opacity: 1, scale: 1 }}
                        exit={{ x: -60, opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
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

function PulseToast({ event, onClose }: { event: PulseEvent; onClose: () => void }) {
    const getIcon = () => {
        switch (event.channel) {
            case 'SALES':
                return <ShoppingBag className="text-[#39FF14]" size={18} />;
            case 'LOCAL_DELIVERY':
                return <Truck className="text-[#00E5FF]" size={18} />;
            case 'NATIONAL_SHIPMENT':
                return <Package className="text-[#39FF14]" size={18} />;
        }
    };

    const getTag = () => {
        switch (event.channel) {
            case 'SALES':
                return 'VENTA CONFIRMADA';
            case 'LOCAL_DELIVERY':
                return 'ENTREGA LOCAL MDQ';
            case 'NATIONAL_SHIPMENT':
                return 'DESPACHO ANDREANI 24HS';
        }
    };

    const getMessage = () => {
        switch (event.channel) {
            case 'SALES':
                return (
                    <p className="text-xs text-white/80 leading-snug">
                        Alguien en <span className="font-bold text-white">{event.city}</span> acaba de pedir unas{' '}
                        <span className="font-black text-[#39FF14]">{event.model}</span>.
                    </p>
                );
            case 'LOCAL_DELIVERY':
                return (
                    <p className="text-xs text-white/80 leading-snug">
                        Reparto en camino en <span className="font-bold text-white">Mar del Plata</span>: entregando unas{' '}
                        <span className="font-black text-[#00E5FF]">{event.model}</span>.
                    </p>
                );
            case 'NATIONAL_SHIPMENT':
                return (
                    <p className="text-xs text-white/80 leading-snug">
                        Despacho prioritario de <span className="font-black text-[#39FF14]">{event.model}</span> con destino a{' '}
                        <span className="font-bold text-white">{event.city}</span>.
                    </p>
                );
        }
    };

    const linkHref = event.channel === 'SALES' && event.model
        ? `/catalog?q=${encodeURIComponent(event.model)}`
        : '/catalog';

    return (
        <div className="relative group select-none">
            
            {/* Subtle glow border effect */}
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#39FF14]/20 via-[#00E5FF]/20 to-transparent blur-sm opacity-50 group-hover:opacity-100 transition duration-500 pointer-events-none" />

            <Link
                href={linkHref}
                className="relative flex items-center gap-3.5 bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 p-3.5 sm:p-4 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.9),0_0_20px_rgba(57,255,20,0.06)] hover:border-[#39FF14]/40 hover:bg-[#0f0f0f] transition-all"
            >
                {/* Icon Box */}
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                    {getIcon()}
                </div>

                {/* Content Box */}
                <div className="flex-grow min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-widest text-[#39FF14]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#39FF14] animate-pulse" />
                        <span>{getTag()}</span>
                        <span className="text-white/20">·</span>
                        <span className="text-white/40">AHORA</span>
                    </div>

                    {getMessage()}
                </div>

                {/* Close Button */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onClose();
                    }}
                    className="flex-shrink-0 p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Cerrar notificación"
                >
                    <X size={13} />
                </button>
            </Link>
        </div>
    );
}
