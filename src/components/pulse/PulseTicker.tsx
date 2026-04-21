
'use client';

import { usePulseStore } from '@/store/pulse-store';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Bike, Box, Activity } from 'lucide-react';
import Link from 'next/link';

export function PulseTicker() {
    const events = usePulseStore(state => state.events);
    const latestEvents = events.slice(0, 3); // Only show top 3 for the ticker

    const getIcon = (channel: string) => {
        switch (channel) {
            case 'SALES': return <ShoppingCart className="text-[#00E5FF]" size={12} />;
            case 'LOCAL_DELIVERY': return <Bike className="text-[#8B5CF6]" size={12} />;
            case 'NATIONAL_SHIPMENT': return <Box className="text-[#00E5FF]" size={12} />;
            default: return <Activity className="text-white/40" size={12} />;
        }
    };

    const getShortDescription = (event: any) => {
        switch (event.channel) {
            case 'SALES': return `Venta: ${event.model} en ${event.city}`;
            case 'LOCAL_DELIVERY': return `Reparto: ${event.model} (MDQ)`;
            case 'NATIONAL_SHIPMENT': return `Envío: ${event.model} a ${event.city}`;
            default: return "Actividad de sistema";
        }
    };

    if (events.length === 0) return null;

    return (
        <div className="w-full bg-[#050505]/50 backdrop-blur-md border-y border-white/[0.03] py-2 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 flex items-center gap-3 sm:gap-6">
                <div className="flex items-center gap-2 shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
                    <span className="hidden xs:inline text-[10px] font-bold text-white/40 uppercase tracking-widest">Live Activity</span>
                </div>

                <div className="flex-grow flex items-center gap-4 sm:gap-8 overflow-hidden whitespace-nowrap">
                    <AnimatePresence mode="popLayout">
                        {latestEvents.map((event) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-3 shrink-0"
                            >
                                <div className="p-1.5 rounded-md bg-white/5 border border-white/5">
                                    {getIcon(event.channel)}
                                </div>
                                <span className="text-[11px] text-white/60 font-mono tracking-tight">
                                    {getShortDescription(event)}
                                </span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <Link 
                    href="/pulse"
                    className="shrink-0 text-[10px] font-bold text-[#8B5CF6] hover:text-[#00E5FF] transition-colors uppercase tracking-widest border-l border-white/10 pl-6"
                >
                    View Network →
                </Link>
            </div>
        </div>
    );
}
