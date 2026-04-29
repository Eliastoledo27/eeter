'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Send, Mail, CheckCircle2 } from 'lucide-react';

interface ResellerFooterProps {
  resellerSlug?: string;
  resellerName?: string;
}

export function ResellerFooter({ resellerSlug, resellerName }: ResellerFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-white/5 bg-[#050505] py-10">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <div className="relative h-8 w-24">
                <Image
                  src="/texto.png"
                  alt="ÉTER"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="max-w-xs text-xs leading-relaxed text-white/40">
              Transformando el negocio de reventa en Argentina.
              Parte del ecosistema oficial de ÉTER Store.
            </p>
          </div>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <Link href="#" className="text-white/45 transition-colors hover:text-[#00E5FF]">
                <Instagram size={18} aria-label="Instagram" />
              </Link>
              <Link href="#" className="text-white/45 transition-colors hover:text-[#00E5FF]">
                <Send size={18} aria-label="Telegram" />
              </Link>
              <Link href="mailto:ventas@eter.com.ar" className="text-white/45 transition-colors hover:text-[#00E5FF]">
                <Mail size={18} aria-label="Email" />
              </Link>
            </div>
            
            <div className="flex items-center gap-2 rounded-full border border-[#C6FF00]/20 bg-[#C6FF00]/5 px-3 py-1.5">
              <CheckCircle2 size={12} className="text-[#C6FF00]" />
              <span className="text-[10px] font-black uppercase tracking-[0.1em] text-[#C6FF00]">Tienda Verificada ÉTER</span>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/5 pt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-[10px] font-medium uppercase tracking-[0.1em] text-white/30">
          <p>© {currentYear} ÉTER Core. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-white transition-colors">Términos</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacidad</Link>
            <Link href="/support" className="hover:text-white transition-colors">Ayuda</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
