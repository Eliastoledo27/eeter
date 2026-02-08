'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Crown, Play, Download, MessageCircle, Lock, Search, Filter } from 'lucide-react';
import { GlassCard, Badge } from './GlassCard';
import { toast } from 'sonner';

interface AcademyItem {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'audio';
  is_vip: boolean;
  description?: string | null;
  url?: string | null;
}

interface DashboardAcademyProps {
  isPremium: boolean;
  items: AcademyItem[]; // Initial items
}

export const DashboardAcademy = ({ isPremium: initialPremium, items: initialItems }: DashboardAcademyProps) => {
  const [items, setItems] = useState<AcademyItem[]>(initialItems);
  const [isPremium, setIsPremium] = useState(initialPremium);
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [showVipOnly, setShowVipOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    try {
        const params = new URLSearchParams();
        if (filterType !== 'all') params.append('type', filterType);
        if (showVipOnly) params.append('vip', 'true');
        if (searchQuery) params.append('q', searchQuery);

        const res = await fetch(`/api/academy?${params.toString()}`);
        if (!res.ok) throw new Error('Error al cargar contenido');
        
        const data = await res.json();
        setItems(data.items);
        setIsPremium(data.isPremium); // Sync premium status
    } catch {
        // console.error(error);
        toast.error('No se pudo actualizar el catálogo');
    } finally {
        setIsLoading(false);
    }
  }, [filterType, showVipOnly, searchQuery]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
        fetchContent();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchContent]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Academia Éter Store</h1>
          <p className="text-slate-400 mt-1">Capacitate y desbloqueá nuevos niveles de ganancias.</p>
        </div>
        {!isPremium && (
          <button className="bg-amber-500 text-amber-950 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform">
            <Crown size={18} /> Ser Premium
          </button>
        )}
      </header>

      {/* Filters Bar */}
      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
                type="text" 
                placeholder="Buscar contenido..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors"
            />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-purple-500/50"
            >
                <option value="all">Todos los formatos</option>
                <option value="video">Videos</option>
                <option value="pdf">Guías PDF</option>
                <option value="audio">Audios</option>
            </select>

            <button 
                onClick={() => setShowVipOnly(!showVipOnly)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
                    showVipOnly 
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-500' 
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white'
                }`}
            >
                <Crown size={16} />
                {showVipOnly ? 'Solo VIP' : 'Ver VIP'}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative min-h-[200px]">
        {isLoading && (
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm z-20 flex items-center justify-center rounded-3xl">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )}

        {items.length === 0 ? (
           <div className="col-span-full py-12 text-center text-slate-500">
             <Filter size={48} className="mx-auto mb-4 opacity-20" />
             <p>No se encontró contenido con estos filtros.</p>
           </div>
        ) : (
            items.map((item) => (
            <GlassCard key={item.id} className="relative group overflow-hidden border-white/5 hover:border-purple-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 flex flex-col">
                <div className={`p-6 flex flex-col h-full ${item.is_vip && !isPremium ? 'blur-[2px] opacity-60 select-none grayscale-[0.5]' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                        item.type === 'video' ? 'bg-sky-500/10 text-sky-400 group-hover:bg-sky-500 group-hover:text-white' : 
                        item.type === 'pdf' ? 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white' :
                        'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white'
                    }`}>
                        {item.type === 'video' ? <Play size={24} className="ml-1" /> : item.type === 'pdf' ? <Download size={24} /> : <MessageCircle size={24} />}
                    </div>
                    {item.is_vip && (
                        <Badge variant="gold" className="text-[10px] px-2 py-0.5">VIP</Badge>
                    )}
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-purple-300 transition-colors">{item.title}</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6 flex-1">{item.description || 'Contenido exclusivo para potenciar tus ventas.'}</p>
                
                <button 
                    disabled={item.is_vip && !isPremium}
                    className="w-full py-3 border border-slate-700 rounded-xl text-xs font-bold hover:bg-white hover:text-slate-950 transition-all text-white mt-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-white"
                >
                    {item.type === 'video' ? 'Ver Video' : item.type === 'pdf' ? 'Descargar PDF' : 'Escuchar Audio'}
                </button>
                </div>
                
                {item.is_vip && !isPremium && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-slate-950/60 backdrop-blur-sm">
                    <div className="bg-amber-500/20 p-4 rounded-full mb-4 animate-pulse">
                    <Lock className="text-amber-500" size={32} />
                    </div>
                    <h4 className="text-white font-bold text-lg">Contenido Exclusivo</h4>
                    <p className="text-xs text-slate-300 mt-2 max-w-[200px]">Desbloqueá este material convirtiéndote en socio Premium.</p>
                </div>
                )}
            </GlassCard>
            ))
        )}
      </div>
    </motion.div>
  );
};
