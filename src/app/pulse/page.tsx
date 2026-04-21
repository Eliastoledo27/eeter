
'use client';

import { usePulseStore } from '@/store/pulse-store';
import { motion } from 'framer-motion';
import { ShoppingCart, Bike, Box, Activity, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PulseRegistryPage() {
    const events = usePulseStore(state => state.events);

    const getIcon = (channel: string) => {
        switch (channel) {
            case 'SALES': return <ShoppingCart className="text-[#00E5FF]" size={16} />;
            case 'LOCAL_DELIVERY': return <Bike className="text-[#8B5CF6]" size={16} />;
            case 'NATIONAL_SHIPMENT': return <Box className="text-[#00E5FF]" size={16} />;
            default: return <Activity className="text-white/40" size={16} />;
        }
    };

    const getDescription = (event: any) => {
        switch (event.channel) {
            case 'SALES': 
                return `Venta confirmada: ${event.model} en ${event.city}`;
            case 'LOCAL_DELIVERY': 
                return `Reparto en camino: ${event.model} (Mar del Plata)`;
            case 'NATIONAL_SHIPMENT': 
                return `Envío nacional despachado: ${event.model} destino ${event.city}`;
            default: return "Evento de sistema";
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-[#A0A0A0] font-mono p-4 md:p-8 selection:bg-[#8B5CF6]/30">
            {/* Header Area */}
            <div className="max-w-4xl mx-auto mb-12">
                <Link 
                    href="/" 
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 hover:text-[#00E5FF] transition-colors mb-8 group"
                >
                    <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Volver a la tienda
                </Link>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse shadow-[0_0_10px_#00E5FF]"></div>
                            <h1 className="text-white text-3xl font-black tracking-tighter uppercase">
                                Éter <span className="text-[#8B5CF6]">Pulse</span> V3
                            </h1>
                        </div>
                        <p className="text-xs text-white/40 max-w-md leading-relaxed uppercase tracking-wider">
                            Monitoreo en tiempo real de actividad logística, ventas y fulfillment global de la red Éter.
                        </p>
                    </div>

                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-white/20 uppercase tracking-widest mb-1">Status: Operational</span>
                        <div className="flex gap-1">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="w-1 h-3 bg-[#00E5FF]/20 rounded-full overflow-hidden">
                                    <motion.div 
                                        className="w-full bg-[#00E5FF]"
                                        initial={{ height: "20%" }}
                                        animate={{ height: ["20%", "100%", "40%", "80%", "20%"] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Log Area */}
            <div className="max-w-4xl mx-auto relative">
                {/* Visual lines for tech aesthetic */}
                <div className="absolute -left-4 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>
                
                <div className="space-y-1">
                    {events.length > 0 ? (
                        events.map((event, index) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.01 }}
                                className="group flex items-center gap-4 py-2 px-4 hover:bg-white/[0.02] border-l-2 border-transparent hover:border-[#8B5CF6] transition-all"
                            >
                                <span className="text-[10px] text-white/20 w-24 tabular-nums">
                                    {format(event.timestamp, 'HH:mm:ss', { locale: es })}
                                </span>
                                
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-[#00E5FF]/30 group-hover:bg-[#00E5FF]/5 transition-colors">
                                    {getIcon(event.channel)}
                                </div>

                                <div className="flex-grow overflow-hidden whitespace-nowrap">
                                    <span className="text-xs text-white/70 group-hover:text-white transition-colors">
                                        {getDescription(event)}
                                    </span>
                                </div>

                                <div className="hidden md:block flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[9px] uppercase tracking-tighter text-[#8B5CF6] px-2 py-1 rounded bg-[#8B5CF6]/10 border border-[#8B5CF6]/20">
                                        Verified
                                    </span>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center opacity-20">
                            <Activity size={48} className="mb-4 animate-pulse" />
                            <p className="text-sm uppercase tracking-widest">Esperando primer pulso...</p>
                        </div>
                    )}
                </div>

                {/* Footer decorations */}
                <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center text-[10px] uppercase tracking-widest text-white/20">
                    <span>Registry Limit: 100 Events</span>
                    <span>© 2026 ÉTER STORE LOGISTICS</span>
                    <span>Node: AR-MDQ-01</span>
                </div>
            </div>

            {/* Ambient Background Glow */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] overflow-hidden">
                <div className="absolute top-[20%] left-[10%] w-[40vw] h-[40vw] bg-[#8B5CF6]/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[10%] right-[5%] w-[30vw] h-[30vw] bg-[#00E5FF]/5 rounded-full blur-[120px]"></div>
            </div>
        </div>
    );
}
