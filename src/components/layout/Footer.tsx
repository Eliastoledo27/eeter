'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Send, Mail, MapPin, ArrowUpRight } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-white/5 bg-[#050505] pt-16 pb-8">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_auto_auto_1.2fr]">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <div className="relative h-10 w-32">
                <Image
                  src="/texto.png"
                  alt="ETER"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-white/50">
              La marca de calzado urbano premium de Mar del Plata.
              Vos vendés. Nosotros nos encargamos del resto.
            </p>
            <div className="flex gap-4">
              <Link
                href="https://instagram.com/eter.style"
                target="_blank"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:border-[#00E5FF] hover:text-[#00E5FF]"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </Link>
              <Link
                href="https://t.me/eter_revendedores"
                target="_blank"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:border-[#00E5FF] hover:text-[#00E5FF]"
                aria-label="Telegram"
              >
                <Send size={20} />
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-6">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Plataforma</h4>
            <ul className="space-y-3">
              {[
                { name: 'Inicio', href: '/' },
                { name: 'Catálogo', href: '/catalog' },
                { name: 'Comunidad', href: '/comunidad' },
                { name: 'Sobre ÉTER', href: '/about' },
                { name: 'Contacto', href: '/contacto' }
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/45 transition-colors hover:text-[#00E5FF]"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-[#00E5FF]" />
                <span className="text-sm text-white/45 tracking-tight">equiporeveter@gmail.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[#00E5FF]" />
                <span className="text-sm text-white/45">Mar del Plata, Argentina</span>
              </li>
            </ul>
          </div>

          {/* Newsletter/CTA */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-8">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#00E5FF]/10 blur-3xl opacity-20" />
            <h4 className="relative z-10 text-xl font-black uppercase text-white">Unite al 1% de revendedores.</h4>
            <p className="relative z-10 mt-3 text-sm text-white/50">Recibí alertas de lanzamientos exclusivos y drops limitados.</p>
            <form className="relative z-10 mt-6 flex gap-2">
              <input
                type="email"
                placeholder="tu@email.com"
                className="h-12 flex-1 rounded-md border border-white/10 bg-black/40 px-4 text-sm text-white outline-none focus:border-[#00E5FF] transition-colors"
                required
              />
              <button
                type="submit"
                className="flex h-12 w-12 items-center justify-center rounded-md bg-[#00E5FF] text-black transition-transform hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                aria-label="Registrarse"
              >
                <ArrowUpRight size={22} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col gap-6 border-t border-white/5 pt-8 text-[11px] font-medium text-white/45 md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} ÉTER Store. Todos los derechos reservados.</p>
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
