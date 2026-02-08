import { Crown } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { getInitial } from '@/lib/dashboard-utils';

interface RankingUser {
  id: string;
  name: string;
  points: number;
  streak: number;
}

interface DashboardRankingProps {
  ranking: RankingUser[];
  currentUserId: string;
}

export const DashboardRanking = ({ ranking, currentUserId }: DashboardRankingProps) => {
  return (
    <GlassCard className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Crown size={20} className="text-amber-500" /> Top de la Semana
        </h2>
        <button className="text-sky-400 text-xs font-bold hover:underline">Ver todo</button>
      </div>
      <div className="space-y-4">
        {ranking.map((user, idx) => {
          const initial = getInitial(user.name)
          return (
            <div
              key={user.id}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                user.id === currentUserId ? 'bg-sky-500/10 border border-sky-500/30' : 'bg-slate-800/30'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`w-6 font-black text-center ${idx === 0 ? 'text-amber-500' : 'text-slate-500'}`}>
                  {idx + 1}
                </span>
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white uppercase shadow-inner">
                  {initial}
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-100">{user.name}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">{user.streak} días de racha</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-sky-400">{user.points} <span className="text-[10px]">pts</span></p>
              </div>
            </div>
          )
        })}
      </div>
    </GlassCard>
  );
};
