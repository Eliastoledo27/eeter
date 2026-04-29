'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
    { q: '¿Cómo funciona el sistema de reventa?', a: 'Consultás stock, cerrás la venta con tu cliente al precio que vos definas, nos pasás el pedido y nosotros nos encargamos del empaque y envío. Tu ganancia es la diferencia entre tu precio de venta y el costo ÉTER.' },
    { q: '¿Necesito comprar stock por adelantado?', a: 'No. Trabajamos sin inversión previa. Vendés primero, comprás después. Solo pagás cuando tenés la venta cerrada.' },
    { q: '¿Cómo se manejan los envíos?', a: 'ÉTER gestiona toda la logística. El paquete sale con etiqueta neutra para que tu cliente no vea nuestros datos. Vos sos la marca.' },
    { q: '¿Puedo usar las fotos del catálogo para publicar?', a: 'Sí. Todo el material visual está optimizado para redes sociales. Podés copiar la info de cada producto directo a WhatsApp con un solo click.' },
    { q: '¿Qué margen puedo generar?', a: 'El margen lo definís vos. Recomendamos entre 30% y 50% sobre el costo ÉTER. Usá la calculadora integrada para simular distintos escenarios.' },
    { q: '¿Qué pasa si mi cliente quiere cambiar el talle?', a: 'ÉTER ofrece un cambio sin costo dentro de los 7 días. Tu cliente contacta directamente con nosotros y nosotros resolvemos.' },
];

function FAQItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-white/5 last:border-0">
            <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left group">
                <span className="text-xs font-black text-white/60 group-hover:text-white transition-colors uppercase tracking-wider pr-4">{q}</span>
                <ChevronDown size={16} className={cn("text-white/20 transition-transform shrink-0", open && "rotate-180")} />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <p className="text-sm text-white/30 pb-5 leading-relaxed">{a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function ResellerFAQ() {
    return (
        <section className="mt-24">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                    <HelpCircle size={14} className="text-[#00E5FF]" />
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-widest">Preguntas <span className="text-[#00E5FF]">Frecuentes</span></h2>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl px-8">
                {faqs.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
            </div>
        </section>
    );
}
