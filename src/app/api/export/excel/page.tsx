'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FileDown, FileSpreadsheet, ArrowRight, Download, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function ExportPage() {
    return (
        <main className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#00E5FF] selection:text-black overflow-x-hidden">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 lg:px-12 flex flex-col items-center justify-center min-h-[70vh]">
                <div className="absolute inset-0 bg-radial-gradient from-[#00E5FF]/5 to-transparent blur-[120px] pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-4xl relative z-10"
                >
                    <span className="inline-block px-4 py-1 bg-[#00E5FF]/20 border border-[#00E5FF]/30 text-[#00E5FF] text-[10px] font-black tracking-[0.3em] uppercase rounded-full mb-8">
                        Data Export Protocol
                    </span>

                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 leading-none uppercase italic">
                        Cátalogo <span className="text-[#00E5FF]">Meta compatible</span>
                    </h1>

                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light">
                        Descarga el inventario completo optimizado para WhatsApp Business y Facebook Marketplace.
                        Incluye todos los metadatos obligatorios y links de imagen procesados.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                        {/* Excel Option */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="bg-[#111] border border-white/5 rounded-3xl p-8 text-left group hover:border-[#00E5FF]/50 transition-all cursor-pointer relative overflow-hidden"
                            onClick={() => window.location.href = '/api/export/excel/download?format=xlsx'}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/5 blur-[60px] group-hover:bg-[#00E5FF]/10 transition-all" />
                            <div className="size-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6 border border-emerald-500/20">
                                <FileSpreadsheet size={28} />
                            </div>
                            <h3 className="text-2xl font-black mb-2 uppercase italic tracking-tighter">Excel Document</h3>
                            <p className="text-gray-500 text-sm mb-8">Formato .xlsx nativo con estilos y cabeceras de guía visual incorporadas.</p>
                            <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase tracking-widest text-xs h-12 rounded-2xl gap-2">
                                <Download size={16} /> Descargar .XLSX
                            </Button>
                        </motion.div>

                        {/* CSV Option */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="bg-[#111] border border-white/5 rounded-3xl p-8 text-left group hover:border-[#00E5FF]/50 transition-all cursor-pointer relative overflow-hidden"
                            onClick={() => window.location.href = '/api/export/excel/download?format=csv'}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 blur-[60px] group-hover:bg-sky-500/10 transition-all" />
                            <div className="size-14 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-500 mb-6 border border-sky-500/20">
                                <FileDown size={28} />
                            </div>
                            <h3 className="text-2xl font-black mb-2 uppercase italic tracking-tighter">CSV Plain Text</h3>
                            <p className="text-gray-500 text-sm mb-8">Archivo de valores segregados por comas para integraciones crudas en Meta Business.</p>
                            <Button className="w-full bg-sky-500 hover:bg-sky-600 text-black font-black uppercase tracking-widest text-xs h-12 rounded-2xl gap-2">
                                <Download size={16} /> Descargar .CSV
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* Specs Section */}
            <section className="py-24 border-t border-white/5 bg-[#050505] px-6 lg:px-12">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row items-start gap-12">
                        <div className="md:sticky md:top-32 w-full md:w-1/3">
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">Especificaciones de Facebook</h2>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Este archivo ha sido generado siguiendo el protocolo estricto de Meta para anuncios dinámicos y tiendas de WhatsApp.
                            </p>
                        </div>
                        <div className="flex-1 space-y-8">
                            {[
                                { title: 'Identificadores Únicos (ID)', desc: 'Generados automáticamente combinando el SKU base con el talle para evitar colisiones.' },
                                { title: 'Mapeo de Categorías', desc: 'Pre-clasificado en la categoría Apparel & Accessories > Clothing de Google Taxonomies.' },
                                { title: 'Optimización de Imágenes', desc: 'Links procesados vía ÉTER Media Proxy (Punycode compatible) para evitar bloqueos.' },
                                { title: 'Variantes Automáticas', desc: 'Soporte nativo para Item Group ID, permitiendo mostrar múltiples talles en una sola publicación.' }
                            ].map((spec, i) => (
                                <div key={i} className="flex gap-6 items-start p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                                    <div className="text-[#00E5FF] shrink-0"><CheckCircle2 size={24} /></div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1 tracking-tight">{spec.title}</h4>
                                        <p className="text-gray-500 text-sm leading-relaxed">{spec.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
