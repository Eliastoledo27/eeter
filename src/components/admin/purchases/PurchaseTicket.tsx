'use client';

import { motion } from 'framer-motion';
import { Download, X, CheckCircle2, ShoppingBag, MapPin, Calendar, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PurchaseTicketProps {
    order: {
        id: string;
        referenceCode: string;
        created_at: string;
        customer_name: string;
        total_amount: number;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        items: any[];
    };
    onClose: () => void;
}

export function PurchaseTicket({ order, onClose }: PurchaseTicketProps) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md mx-auto bg-white rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.15)] overflow-hidden border border-white/40"
            id="purchase-ticket"
        >
            {/* Header / Branding */}
            <div className="bg-primary p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                <div className="relative z-10">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
                        <ShoppingBag className="text-white" size={32} />
                    </div>
                    <h2 className="text-white font-heading text-3xl tracking-tight">ETER STORE</h2>
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.3em]">Official Purchase Receipt</p>
                </div>
            </div>

            {/* Ticket Content */}
            <div className="p-8 pt-10 space-y-8">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] mb-1">Código de Referencia</p>
                        <p className="text-lg font-black text-foreground tracking-widest">{order.referenceCode}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] mb-1">Fecha</p>
                        <p className="text-sm font-bold text-foreground">
                            {format(new Date(order.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl border border-black/[0.03]">
                        <CheckCircle2 className="text-emerald-500" size={20} />
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Estado</p>
                            <p className="text-xs font-black text-foreground uppercase">Comprobante Válido</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl border border-black/[0.03]">
                        <Hash className="text-primary" size={20} />
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">ID Interno</p>
                            <p className="text-xs font-bold text-muted-foreground">#{order.id.slice(0, 8)}</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-dashed border-black/10 pt-8 mt-8">
                    <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] mb-4 text-center">Detalle de la Operación</p>

                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground font-medium">Revendedor:</span>
                            <span className="text-foreground font-bold">{order.customer_name}</span>
                        </div>

                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm py-4 border-y border-black/[0.03]">
                                <div className="space-y-1">
                                    <p className="text-foreground font-bold">{item.name}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Talle: {item.size || 'N/A'} | Cant: {item.quantity}</p>
                                </div>
                                <p className="text-foreground font-black">${Number(item.price).toLocaleString('es-AR')}</p>
                            </div>
                        ))}

                        <div className="flex justify-between items-center pt-4">
                            <span className="text-foreground font-black uppercase text-xs tracking-widest">Inversión Total</span>
                            <span className="text-3xl font-black text-accent font-heading">${Number(order.total_amount).toLocaleString('es-AR')}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Icons */}
                <div className="flex justify-center gap-12 pt-8 text-muted-foreground/20">
                    <MapPin size={24} />
                    <Calendar size={24} />
                    <ShoppingBag size={24} />
                </div>
            </div>

            {/* Actions Bar */}
            <div className="p-8 bg-muted/20 border-t border-black/[0.03] flex gap-4 no-print">
                <Button
                    onClick={handlePrint}
                    className="flex-1 bg-primary text-white hover:bg-primary/90 h-12 rounded-xl font-bold uppercase tracking-widest text-[11px]"
                >
                    <Download className="mr-2 h-4 w-4" /> Descargar Ticket
                </Button>
                <Button
                    variant="outline"
                    onClick={onClose}
                    className="h-12 w-12 rounded-xl flex items-center justify-center p-0 border-black/10 hover:bg-black/5"
                >
                    <X size={20} className="text-muted-foreground" />
                </Button>
            </div>
        </motion.div>
    );
}
