'use client';

import { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface MobileFilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function MobileFilterDrawer({ open, onOpenChange, children }: MobileFilterDrawerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bottom-0 left-0 top-auto flex h-[86vh] w-full max-w-none translate-x-0 translate-y-0 flex-col overflow-hidden rounded-t-lg border-white/10 bg-[#050505] p-0 text-white sm:rounded-t-lg lg:hidden">
        <DialogHeader className="border-b border-white/10 px-5 py-4 text-left">
          <DialogTitle className="text-sm font-black uppercase tracking-[0.22em] text-white">Filtros del catalogo</DialogTitle>
          <DialogDescription className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
            Ajusta talles, stock, marca y orden sin salir del catalogo.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
