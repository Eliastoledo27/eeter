import * as React from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EterButtonTone = 'cyan' | 'green' | 'violet' | 'ghost';

interface EterButtonProps extends ButtonProps {
  tone?: EterButtonTone;
}

const tones: Record<EterButtonTone, string> = {
  cyan: 'border-[#00E0FF]/40 bg-[#00E0FF] text-black shadow-[0_0_22px_rgba(0,224,255,0.22)] hover:bg-white',
  green: 'border-[#39FF14]/45 bg-[#39FF14] text-black shadow-[0_0_22px_rgba(57,255,20,0.22)] hover:bg-white',
  violet: 'border-[#A020F0]/45 bg-[#A020F0] text-white shadow-[0_0_22px_rgba(160,32,240,0.22)] hover:bg-white hover:text-black',
  ghost: 'border-white/15 bg-white/[0.04] text-white hover:border-[#00E0FF]/50 hover:text-[#00E0FF]',
};

export const EterButton = React.forwardRef<HTMLButtonElement, EterButtonProps>(
  ({ className, tone = 'cyan', variant = 'outline', ...props }, ref) => (
    <Button
      ref={ref}
      variant={variant}
      className={cn(
        'h-12 rounded-md border px-5 text-[10px] font-black uppercase tracking-[0.18em] transition-all duration-300 active:scale-[0.98]',
        tones[tone],
        className
      )}
      {...props}
    />
  )
);

EterButton.displayName = 'EterButton';
