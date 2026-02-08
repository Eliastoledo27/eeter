'use client';

import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Truck } from 'lucide-react';

export function CatalogHero() {
    return (
        <section className="relative w-full overflow-hidden pt-28 pb-20 md:pt-40 md:pb-32 font-body">
            {/* Liquid Background */}
            <div className="absolute inset-0 -z-10 bg-background">
                <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[60%] bg-accent/10 rounded-full blur-[120px] animate-morph" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[60%] bg-secondary/10 rounded-full blur-[120px] animate-morph" style={{ animationDirection: 'reverse', animationDuration: '15s' }} />
                <div className="absolute inset-0 bg-noise opacity-[0.03]" />
            </div>

            <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative">
                <div className="flex flex-col items-center text-center">
                    {/* Floating Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass border-white/20 shadow-sm mb-8"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                        </span>
                        <span className="text-[11px] uppercase tracking-[0.4em] font-bold text-foreground/80">Mar del Plata · Sneaker Resell</span>
                    </motion.div>

                    {/* Main Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="font-heading text-5xl md:text-8xl font-medium tracking-tight text-foreground mb-6 leading-[1.1] balance"
                    >
                        Colección Premium <br />
                        <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-accent via-amber-600 to-primary">Exclusive Stock</span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="max-w-2xl text-lg md:text-xl text-foreground/70 font-light leading-relaxed mb-12 balance"
                    >
                        El catálogo definitivo para revendedores premium. Sneakers de colección, stock real en Mar del Plata y logística inteligente para toda Argentina.
                    </motion.p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-8">
                        {[
                            {
                                icon: <Sparkles className="w-5 h-5" />,
                                label: "Curaduría",
                                title: "Selección Éter",
                                desc: "Modelos con alta rotación.",
                                color: "bg-amber-500",
                                delay: 0.3
                            },
                            {
                                icon: <ShieldCheck className="w-5 h-5" />,
                                label: "Confianza",
                                title: "Mayorista Verificado",
                                desc: "Precio real para revender.",
                                color: "bg-blue-500",
                                delay: 0.4
                            },
                            {
                                icon: <Truck className="w-5 h-5" />,
                                label: "Logística",
                                title: "Envío 48-72 hs",
                                desc: "Despacho ágil nacional.",
                                color: "bg-emerald-500",
                                delay: 0.5
                            }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: item.delay, ease: [0.16, 1, 0.3, 1] }}
                                className="group relative"
                            >
                                <div className="absolute inset-0 bg-white/40 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative glass p-6 rounded-[32px] border-white/40 shadow-xl shadow-black/[0.03] hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-500 flex flex-col items-start gap-4 cursor-default overflow-hidden group">
                                    {/* Animated background on hover */}
                                    <div className={`absolute -right-8 -top-8 w-24 h-24 ${item.color} opacity-[0.03] group-hover:opacity-[0.08] rounded-full transition-all duration-500 group-hover:scale-[2]`} />

                                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-black/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                                        {item.icon}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] items-center gap-1.5 font-bold uppercase tracking-[0.3em] text-slate-500/80 mb-1">
                                            {item.label}
                                        </p>
                                        <h4 className="text-lg font-bold text-slate-950 mb-1">{item.title}</h4>
                                        <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Footer Info */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="mt-20 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-[10px] uppercase tracking-[0.4em] font-bold text-slate-400"
                    >
                        <div className="flex items-center gap-2 group cursor-default">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-amber-400 transition-colors" />
                            EXPLORAR CATÁLOGO
                        </div>
                        <div className="flex items-center gap-2 group cursor-default">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-amber-400 transition-colors" />
                            ACTUALIZADO DIARIO
                        </div>
                        <div className="flex items-center gap-2 group cursor-default">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-amber-400 transition-colors" />
                            STOCK EN TIEMPO REAL
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Bottom Border */}
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-black/5 to-transparent shadow-[0_-1px_0_rgba(255,255,255,0.8)]" />
        </section>
    );
}
