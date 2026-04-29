'use client';

import Link from 'next/link';
import Image from 'next/image';

export function MinimalFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-white/5 bg-[#050505] py-8">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="flex flex-col gap-6 text-[11px] font-medium text-white/45 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-block">
              <div className="relative h-5 w-16">
                <Image
                  src="/texto.png"
                  alt="ETER"
                  fill
                  className="object-contain object-left opacity-50"
                />
              </div>
            </Link>
            <p className="max-w-xs text-[10px] uppercase tracking-wider leading-relaxed text-white/30">
              © {currentYear} ÉTER Store. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-2 text-white/40">
              <div className="h-1 w-1 rounded-full bg-[#00E5FF]" />
              <span className="text-[10px] uppercase tracking-widest">equiporeveter@gmail.com</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="#" className="transition-colors hover:text-[#00E5FF]">Privacidad</Link>
            <Link href="#" className="transition-colors hover:text-[#00E5FF]">Soporte</Link>
            <Link href="/register" className="transition-colors hover:text-[#00E5FF]">Programa de revendedores</Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#00E5FF]/20 bg-[#00E5FF]/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#00E5FF]">
              <div className="relative h-3 w-3">
                <Image src="/logo.png" alt="" fill className="object-contain" />
              </div>
              ÉTER Certified
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
