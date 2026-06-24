'use client';

import { CheckCircle2 } from 'lucide-react';

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
            <div className="inline-block">
              <span className="text-lg font-black tracking-tighter text-white/50 uppercase">
                {resellerName || 'TIENDA AUTORIZADA'}
              </span>
            </div>
            <p className="max-w-xs text-xs leading-relaxed text-white/30">
              Showroom oficial de {resellerName || 'Revendedor Autorizado'}.
              Calidad y originalidad certificadas.
            </p>
          </div>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 rounded-full border border-[#00E5FF]/20 bg-[#00E5FF]/5 px-3 py-1.5">
              <CheckCircle2 size={12} className="text-[#00E5FF]" />
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#00E5FF]">Tienda Verificada</span>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/5 pt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-[10px] font-medium uppercase tracking-[0.1em] text-white/20">
          <p>© {currentYear} Showroom Personalizado. Creado por Éter.</p>
          <div className="text-[9px] text-white/10 font-mono">
            Ecosistema de Ventas Descentralizado
          </div>
        </div>
      </div>
    </footer>
  );
}
