import { cn } from '@/lib/utils';
import type { StockStatus } from '@/lib/catalog-ui';

type ConcreteStockStatus = Exclude<StockStatus, 'all'>;

const stockCopy: Record<ConcreteStockStatus, string> = {
  available: 'Disponible',
  low: 'Ultimas unidades',
  out: 'Agotado',
};

const stockClasses: Record<ConcreteStockStatus, string> = {
  available: 'border-[#39FF14]/30 bg-[#39FF14]/10 text-[#39FF14]',
  low: 'border-[#00E0FF]/35 bg-[#00E0FF]/10 text-[#00E0FF]',
  out: 'border-red-500/35 bg-red-500/10 text-red-300',
};

interface StockBadgeProps {
  status: ConcreteStockStatus;
  total?: number;
  className?: string;
}

export function StockBadge({ status, total, className }: StockBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.16em]',
        stockClasses[status],
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_10px_currentColor]" />
      {stockCopy[status]}
      {typeof total === 'number' && <span className="text-current/70">({total})</span>}
    </span>
  );
}
