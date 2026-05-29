import { cn } from '@/lib/utils';
import type { AvailableSize } from '@/lib/catalog-ui';
import { getSizeStockStatus } from '@/lib/catalog-ui';

interface SizeSelectorProps {
  sizes: AvailableSize[];
  selectedSize: string | null;
  onSelect: (size: string | null) => void;
  productId: string;
  compact?: boolean;
  className?: string;
}

export function SizeSelector({ sizes, selectedSize, onSelect, productId, compact = false, className }: SizeSelectorProps) {
  if (sizes.length === 0) {
    return <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-red-300/80">Sin talles disponibles</p>;
  }

  return (
    <div className={cn('grid gap-2', compact ? 'grid-cols-6' : 'grid-cols-5', className)}>
      {sizes.map(([size, stock]) => {
        const status = getSizeStockStatus(stock);
        const isSelected = selectedSize === size;

        return (
          <button
            key={size}
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (status !== 'out') onSelect(isSelected ? null : size);
            }}
            disabled={status === 'out'}
            className={cn(
              'relative flex aspect-square items-center justify-center rounded-md border text-[10px] font-black transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E0FF]/70',
              status === 'out'
                ? 'cursor-not-allowed border-white/5 text-white/10 grayscale'
                : isSelected
                  ? 'z-20 scale-105 border-white bg-white text-black shadow-[0_0_24px_rgba(255,255,255,0.26)]'
                  : 'border-white/10 bg-white/[0.025] text-white/55 hover:border-[#00E0FF]/45 hover:text-[#00E0FF]'
            )}
            aria-pressed={isSelected}
            aria-label={`Talle ${size}, stock ${stock}`}
            title={`Talle ${size} - ${stock} en stock`}
          >
            {size}
            {status === 'critical' && !isSelected && (
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_7px_rgba(239,68,68,0.85)]" />
            )}
            {isSelected && (
              <span className="absolute inset-0 rounded-md bg-[#00E0FF]/10 mix-blend-overlay" />
            )}
          </button>
        );
      })}
    </div>
  );
}
