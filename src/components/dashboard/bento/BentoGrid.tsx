import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

interface BentoItemProps {
  children: ReactNode;
  className?: string;
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2;
}

export const BentoGrid = ({ children, className }: BentoGridProps) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(140px,auto)] gap-3",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoItem = ({ 
  children, 
  className, 
  colSpan = 1, 
  rowSpan = 1 
}: BentoItemProps) => {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white/70 p-3 backdrop-blur-xl transition-all duration-300",
        "hover:border-[#3B82F6]/40 hover:bg-white/80 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]",
        
        // Responsive Col Spans
        colSpan === 1 && "md:col-span-1",
        colSpan === 2 && "md:col-span-2",
        colSpan === 3 && "md:col-span-3",
        colSpan === 4 && "md:col-span-2 lg:col-span-4", // Full width on desktop

        // Row Spans
        rowSpan === 2 && "row-span-2",
        
        className
      )}
    >
      {/* Background Gradients & Noise */}
      <div className="absolute inset-0 bg-noise opacity-[0.04] pointer-events-none mix-blend-soft-light" />
      
      {/* Dynamic Glow Effect */}
      <div className="absolute -top-[150px] -right-[150px] w-[300px] h-[300px] bg-[#F59E0B]/12 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out pointer-events-none" />
      <div className="absolute -bottom-[150px] -left-[150px] w-[300px] h-[300px] bg-[#3B82F6]/12 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out pointer-events-none" />
      
      {/* Glassmorphism Borders & Highlights */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-transparent opacity-50 pointer-events-none group-hover:opacity-70 transition-opacity duration-500" />
      <div className="absolute inset-0 bg-gradient-to-tl from-[#1E40AF]/10 via-transparent to-transparent opacity-40 pointer-events-none" />
      
      {/* Border Highlight Animation */}
      <div className="absolute inset-0 rounded-3xl border border-black/5 group-hover:border-[#3B82F6]/30 transition-colors duration-300 pointer-events-none" />
      <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/5 group-hover:ring-[#3B82F6]/20 transition-all duration-300 pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};
