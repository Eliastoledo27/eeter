'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';

interface FAQ {
    q: string;
    a: string;
}

const FAQS: FAQ[] = [
    {
        q: '¿Necesito invertir dinero para empezar?',
        a: 'No. El modelo de ÉTER es 100% sin inversión inicial. Te registrás gratis, accedés al catálogo, compartís en tus redes y solo pagás cuando hacés una venta. No hay stock mínimo ni comisiones de ingreso.',
    },
    {
        q: '¿Cómo me pagan las comisiones?',
        a: 'Las ganancias se acreditan directamente en tu cuenta ÉTER dentro de las 48hs de que el cliente recibe su pedido. Podés retirar a cualquier banco, billetera virtual (Mercado Pago, Modo, Uala) o CBU.',
    },
    {
        q: '¿Las zapatillas son originales?',
        a: 'Sí, todos los pares son originales y pasan por nuestro proceso ÉTER Certified de 3 etapas: verificación de origen con proveedores certificados en Brasil, control de calidad físico e inspección de materiales, y certificado digital con QR único por par.',
    },
    {
        q: '¿Qué pasa si un cliente quiere devolver?',
        a: 'ÉTER gestiona las devoluciones. Vos no tenés que hacer nada. Si el cliente tiene un problema con su par, nuestro equipo de soporte lo resuelve directamente. Tu ganancia está protegida en casos de devolución por error nuestro.',
    },
    {
        q: '¿Cuánto tiempo tarda la entrega?',
        a: 'Los envíos se realizan dentro de las 24-48hs de confirmado el pago. Los tiempos de entrega varían según la provincia: AMBA 2-3 días hábiles, Interior del país 4-7 días hábiles. Todos los envíos incluyen tracking en tiempo real.',
    },
    {
        q: '¿Puedo vender desde cualquier provincia?',
        a: 'Sí. ÉTER opera en todo el país. Ya sea que estés en Buenos Aires, Mendoza, Córdoba, Tucumán o Patagonia, podés vender y tus clientes recibirán sus pares con la misma calidad y velocidad.',
    },
];

export function FAQSection() {
    const [openIdx, setOpenIdx] = useState<number | null>(null);

    return (
        <section className="py-32 bg-black relative border-t border-white/[0.04]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(212,175,55,0.03)_0%,_transparent_60%)]" />

            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Left — sticky title */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="lg:col-span-4 lg:sticky lg:top-24 self-start"
                >
                    <span className="text-[#00E5FF] text-[10px] font-black tracking-[0.5em] uppercase block mb-4">
                        Preguntas Frecuentes
                    </span>
                    <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white uppercase leading-none">
                        Todo<br />
                        lo que<br />
                        <span className="text-[#00E5FF]">Necesitás<br />Saber.</span>
                    </h2>
                    <p className="text-gray-500 text-sm mt-8 max-w-xs leading-relaxed">
                        Si tenés más dudas, nuestro equipo está disponible por WhatsApp de 9 a 21hs.
                    </p>
                    <a
                        href="https://wa.me/5491112345678"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 mt-6 text-[11px] font-black tracking-[0.25em] uppercase text-[#00E5FF] hover:text-white transition-colors group"
                    >
                        Hablar con soporte
                        <span className="w-6 h-px bg-[#00E5FF] group-hover:w-12 transition-all duration-500" />
                    </a>
                </motion.div>

                {/* Right — accordion */}
                <div className="lg:col-span-8 space-y-0">
                    {FAQS.map((faq, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: idx * 0.08 }}
                            viewport={{ once: true }}
                            className="border-b border-white/[0.06]"
                        >
                            <button
                                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                                aria-expanded={openIdx === idx}
                                className="w-full flex items-center justify-between py-7 text-left group"
                            >
                                <span className={`text-base font-bold tracking-tight transition-colors ${
                                    openIdx === idx ? 'text-[#00E5FF]' : 'text-white group-hover:text-[#00E5FF]'
                                }`}>
                                    {faq.q}
                                </span>
                                <div className={`ml-6 shrink-0 w-8 h-8 border transition-all duration-300 flex items-center justify-center ${
                                    openIdx === idx
                                        ? 'border-[#00E5FF] bg-[#00E5FF] text-black rotate-0'
                                        : 'border-white/20 text-white group-hover:border-[#00E5FF] group-hover:text-[#00E5FF]'
                                }`}>
                                    {openIdx === idx ? <X size={14} /> : <Plus size={14} />}
                                </div>
                            </button>

                            <AnimatePresence>
                                {openIdx === idx && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
                                        className="overflow-hidden"
                                    >
                                        <p className="pb-7 text-gray-400 leading-relaxed text-sm max-w-2xl">
                                            {faq.a}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
