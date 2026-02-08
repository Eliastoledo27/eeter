import { cn } from "@/lib/utils";

interface GlassCardProps {
  children?: React.ReactNode;
  className?: string;
}

export const GlassCard = ({ children, className }: GlassCardProps) => (
  <div className={cn("bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden", className)}>
    {children}
  </div>
);

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "gold" | "blue" | "orange";
  className?: string;
}

export const Badge = ({ children, variant = "default", className }: BadgeProps) => {
  const styles = {
    default: "bg-slate-800 text-slate-300",
    gold: "bg-amber-500/20 text-amber-500 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]",
    blue: "bg-sky-500/20 text-sky-500 border border-sky-500/30 shadow-[0_0_10px_rgba(14,165,233,0.2)]",
    orange: "bg-orange-500/20 text-orange-500 border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.2)]",
  };
  return (
    <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 cursor-default", styles[variant], className)}>
      {children}
    </span>
  );
};
