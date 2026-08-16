'use client';

import * as React from 'react';
import Image from 'next/image';

const WHATSAPP_NUMBER = '5492236204002';
const DEFAULT_MESSAGE = 'Hola ÉTER, quisiera consultar sobre los modelos de calzado y la oportunidad de reventa.';

/**
 * WhatsAppFloatingButton
 * Botón flotante que muestra limpiamente la imagen oficial de WhatsApp sin fondos añadidos.
 */
export function WhatsAppFloatingButton() {
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

    return (
        <aside aria-label="Contacto directo por WhatsApp" className="fixed bottom-6 right-6 z-50">
            <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contactar a ÉTER Store por WhatsApp"
                className="group relative flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)]"
            >
                {/* WhatsApp Official Image (Enlarged & Prominent) */}
                <Image
                    src="/images/eter-whatsapp-badge.png"
                    alt="WhatsApp Éter"
                    width={80}
                    height={80}
                    className="h-16 w-16 sm:h-20 sm:w-20 object-contain transition-transform duration-300 group-hover:rotate-6 drop-shadow-[0_12px_30px_rgba(37,211,102,0.6)]"
                />

                {/* Tooltip on Hover */}
                <span className="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-black/90 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-widest text-white opacity-0 shadow-xl backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100 border border-white/10">
                    WhatsApp Éter
                </span>
            </a>
        </aside>
    );
}
