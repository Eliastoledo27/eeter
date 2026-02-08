import { ArrowUpRight } from 'lucide-react';
import { BentoItem } from '../bento/BentoGrid';
import { getInitial } from '@/lib/dashboard-utils';
import Link from 'next/link';

interface RankingUser {
  id: string;
  name: string;
  points: number;
}

interface RankingWidgetProps {
  ranking: RankingUser[];
}

export const RankingWidget = ({ ranking }: RankingWidgetProps) => {
  return (
    <BentoItem colSpan={1} rowSpan={2} className="flex flex-col glass-hover relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="font-bold text-white flex items-center gap-2 text-glow">
            Top Sellers
        </h3>
        <Link href="/dashboard?view=ranking" className="text-xs text-accent-gold hover:text-amber-300 transition-colors flex items-center gap-1 font-medium tracking-wide">
            Ver todo <ArrowUpRight size={12} />
        </Link>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar relative z-10">
        {ranking.slice(0, 5).map((user, idx) => (
            <div key={user.id} className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group ${
                idx === 0 
                ? 'bg-gradient-to-r from-accent-gold/10 to-transparent border border-accent-gold/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                : 'hover:bg-white/5 border border-transparent hover:border-white/5'
            }`}>
                <span className={`text-xs font-black w-4 ${idx === 0 ? 'text-accent-gold' : 'text-slate-500'}`}>
                    #{idx + 1}
                </span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${
                    idx === 0 
                    ? 'bg-accent-gold text-black border-accent-gold shadow-lg shadow-amber-500/20' 
                    : 'bg-slate-800 text-slate-300 border-white/5'
                }`}>
                    {getInitial(user.name)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate transition-colors ${
                        idx === 0 ? 'text-white' : 'text-slate-200 group-hover:text-white'
                    }`}>
                        {user.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                        {user.points} pts
                    </p>
                </div>
            </div>
        ))}
      </div>
    </BentoItem>
  );
};
