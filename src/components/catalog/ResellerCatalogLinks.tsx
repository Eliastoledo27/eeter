'use client';

import Link from 'next/link';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import type { ResellerCatalogLink } from '@/app/actions/reseller-catalog';

type Props = {
  links: ResellerCatalogLink[];
};

export function ResellerCatalogLinks({ links }: Props) {
  if (!links.length) return null;

  return (
    <section className="mb-10 border border-white/10 bg-black/35 p-5 md:p-6">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="mb-2 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#00E0FF]">
            <ShieldCheck size={14} />
            Acceso verificado
          </span>
          <h2 className="text-xl font-black uppercase tracking-tight text-white md:text-2xl">
            Links exclusivos para revendedores activos
          </h2>
        </div>
        <p className="max-w-md text-xs font-semibold uppercase tracking-[0.12em] text-white/45">
          Catálogos públicos habilitados solo para perfiles con rol revendedor y slug activo.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.id}
            href={link.href}
            className="group flex min-w-0 items-center justify-between gap-4 border border-white/10 bg-white/[0.03] px-4 py-4 transition-colors hover:border-[#00E0FF]/40 hover:bg-[#00E0FF]/10"
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-black uppercase tracking-[0.08em] text-white">{link.name}</span>
              <span className="mt-1 block truncate text-xs font-semibold text-[#00E0FF]">eter.store{link.href}</span>
            </span>
            <ArrowUpRight size={18} className="shrink-0 text-white/35 transition-colors group-hover:text-white" />
          </Link>
        ))}
      </div>
    </section>
  );
}
