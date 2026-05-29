import * as React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EterCardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const EterCard = React.forwardRef<HTMLDivElement, EterCardProps>(
  ({ className, interactive = false, ...props }, ref) => (
    <Card
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-lg border-white/10 bg-[#070707]/80 text-white shadow-[0_18px_50px_rgba(0,0,0,0.34)] backdrop-blur-xl',
        interactive && 'transition-all duration-300 hover:-translate-y-0.5 hover:border-[#00E0FF]/35 hover:bg-[#0b0b0b]',
        className
      )}
      {...props}
    />
  )
);

EterCard.displayName = 'EterCard';
