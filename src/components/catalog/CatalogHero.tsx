'use client';

import { motion } from 'framer-motion';
import { PackageCheck, ShieldCheck, Truck, Headphones, LucideIcon } from 'lucide-react';
import Image from 'next/image';

const easeOut = [0.16, 1, 0.3, 1] as const;

interface FeatureItemProps {
    icon: LucideIcon;
    title: string;
    description: string;
}

function FeatureItem({ icon: Icon, title, description }: FeatureItemProps) {
    return (
        <div className="group flex items-center gap-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#C6FF00]/20 bg-[#C6FF00]/5 shadow-[0_0_20px_rgba(198,255,0,0.1)] transition-all group-hover:scale-110 group-hover:border-[#C6FF00]/40 group-hover:bg-[#C6FF00]/10">
                <Icon size={28} className="text-[#C6FF00]" />
            </div>
            <div className="space-y-1">
                <h4 className="text-[12px] font-black uppercase tracking-[0.2em] text-white transition-colors group-hover:text-[#C6FF00]">{title}</h4>
                <p className="text-[10px] font-medium uppercase tracking-widest text-white/40">{description}</p>
            </div>
        </div>
    );
}

export function CatalogHero() {
    return (
        <section className="relative w-full overflow-hidden bg-[#050505] pt-36 pb-16">
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_44%_32%,rgba(198,255,0,.15),transparent_35%),radial-gradient(circle_at_82%_44%,rgba(122,0,255,.16),transparent_35%),radial-gradient(circle_at_20%_80%,rgba(0,229,255,.12),transparent_30%)]" />
                <div className="absolute top-0 right-0 h-[800px] w-[800px] -translate-y-1/2 translate-x-1/4 rounded-full bg-[#7A00FF]/10 blur-[150px]" />
                <div className="absolute bottom-0 left-0 h-[600px] w-[600px] -translate-x-1/4 translate-y-1/2 rounded-full bg-[#C6FF00]/5 blur-[120px]" />
                <div className="absolute top-10 right-10 hidden h-[700px] w-[700px] opacity-20 md:block">
                    <Image
                        src="/design/grafiti violeta.png"
                        alt="E decor"
                        fill
                        className="scale-110 rotate-12 object-contain"
                    />
                </div>
            </div>

            <div className="container relative z-10 mx-auto px-6">
                <div className="mb-20 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: easeOut }}
                        className="mb-8 flex items-center gap-3"
                    >
                        <div className="h-2 w-2 animate-pulse rounded-full bg-[#7A00FF]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#7A00FF]">Catalogo ETER</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: easeOut, delay: 0.1 }}
                        className="mb-8 text-[56px] font-black italic uppercase leading-[0.84] tracking-tighter text-white md:text-[88px]"
                    >
                        Stock Inmediato.
                        <br />
                        <span className="text-[#00E5FF]">Envío Prioritario.</span>
                        <br />
                        <span className="text-[#C6FF00] drop-shadow-[0_0_30px_rgba(198,255,0,0.3)]">Vende Hoy.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: easeOut, delay: 0.2 }}
                        className="max-w-2xl text-lg font-medium leading-relaxed text-white/60 md:text-xl"
                    >
                        Productos 100% originales, verificados, con alto margen y salida rapida en todo el pais.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: easeOut, delay: 0.3 }}
                    className="grid grid-cols-1 gap-12 rounded-[40px] border-t border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent px-12 py-16 md:grid-cols-4"
                >
                    <FeatureItem icon={ShieldCheck} title="100% originales" description="Productos verificados" />
                    <FeatureItem icon={Truck} title="Entrega incluida" description="A todo el pais" />
                    <FeatureItem icon={PackageCheck} title="Sin compra minima" description="Vende desde 1 par" />
                    <FeatureItem icon={Headphones} title="Soporte 24/7" description="Siempre activos" />
                </motion.div>
            </div>

            <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </section>
    );
}
