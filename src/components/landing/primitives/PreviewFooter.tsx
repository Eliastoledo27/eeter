'use client';

import * as React from 'react';
import Link from 'next/link';

/**
 * PreviewFooter
 * Footer minimalista, limpio y profesional exactamente como la referencia.
 */
export function PreviewFooter() {
    return (
        <footer className="w-full bg-[#050505] text-white border-t border-white/10 pt-16 pb-12 select-none">
            <div className="mx-auto max-w-7xl px-4 sm:px-8 md:px-12">
                
                {/* 3-Column Main Footer Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-white/5">
                    
                    {/* Col 1: Brand & Bio (5 cols) */}
                    <div className="md:col-span-5 space-y-4">
                        <Link href="/" className="inline-flex items-center gap-2 group">
                            {/* Éter Flash Isotype */}
                            <svg className="h-6 w-6 fill-white transition-transform duration-300 group-hover:scale-110 group-hover:fill-[#39FF14]" viewBox="0 0 24 24">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                            </svg>
                            <span className="text-xl font-black italic tracking-tighter text-white group-hover:text-[#39FF14] transition-colors">
                                ÉTER<span className="text-[#39FF14]">.</span>
                            </span>
                        </Link>
                        
                        <p className="text-xs sm:text-sm text-white/50 max-w-sm leading-relaxed">
                            Curaduría exclusiva de calzado brasilero, logística automatizada y programa federal para revendedores.
                        </p>
                    </div>

                    {/* Col 2: Navegación (3 cols) */}
                    <div className="md:col-span-3 space-y-3">
                        <h4 className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-white/40">
                            NAVEGACIÓN
                        </h4>
                        <ul className="space-y-2.5 text-xs sm:text-sm text-white/70">
                            <li>
                                <Link href="/" className="hover:text-white transition-colors">
                                    Inicio
                                </Link>
                            </li>
                            <li>
                                <Link href="/catalog" className="hover:text-white transition-colors">
                                    Productos
                                </Link>
                            </li>
                            <li>
                                <Link href="/community" className="hover:text-white transition-colors">
                                    Comunidad
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="hover:text-white transition-colors">
                                    Sobre Éter
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-white transition-colors">
                                    Contacto
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Col 3: Contacto (4 cols) */}
                    <div className="md:col-span-4 space-y-3">
                        <h4 className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-white/40">
                            CONTACTO
                        </h4>
                        <ul className="space-y-2.5 text-xs sm:text-sm text-white/70">
                            <li>
                                <a
                                    href="https://wa.me/5492236204002"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-[#39FF14] transition-colors"
                                >
                                    WhatsApp — +54 9 223 620-4002
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://www.instagram.com/eter.mdq"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-[#39FF14] transition-colors"
                                >
                                    Instagram — @eter.mdq
                                </a>
                            </li>
                            <li className="text-white/40 text-[11px] font-mono">
                                Base Logística — Mar del Plata, Argentina
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Copyright Row */}
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono uppercase tracking-widest text-white/35">
                    <div>
                        © {new Date().getFullYear()} ÉTER STORE. TODOS LOS DERECHOS RESERVADOS.
                    </div>
                    <div className="flex items-center gap-2 text-[#39FF14]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#39FF14] animate-pulse" />
                        <span>STOCK FÍSICO Y DESPACHOS DIARIOS</span>
                    </div>
                </div>

            </div>
        </footer>
    );
}
