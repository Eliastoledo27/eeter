'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MessageSquare, ShoppingCart, UserPlus, Settings, AlertCircle, Loader2 } from 'lucide-react';
import { getRecentActivity, ActivityItem } from '@/app/actions/dashboard';

export function ActivityTimeline() {
    const t = useTranslations('dashboard');
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const data = await getRecentActivity();
                setActivities(data);
            } catch (error) {
                console.error('Failed to load activity', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchActivity();
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'order': return { icon: ShoppingCart, color: 'bg-green-500' };
            case 'customer': return { icon: UserPlus, color: 'bg-blue-500' };
            case 'product': return { icon: AlertCircle, color: 'bg-red-500' }; // Stock alert
            case 'message': return { icon: MessageSquare, color: 'bg-purple-500' };
            default: return { icon: Settings, color: 'bg-gray-500' };
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

            if (diffInSeconds < 60) return 'hace un momento';
            if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} min`;
            if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} h`;
            return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        } catch {
            return '';
        }
    };

    if (isLoading) {
        return (
            <div className="bg-black/40 backdrop-blur-md border border-white/10 shadow-lg rounded-xl p-6 h-full flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="bg-black/40 backdrop-blur-md border border-white/10 shadow-lg rounded-xl p-6 h-full flex flex-col">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 font-mono">
                    {t('activity_timeline') || 'Actividad Reciente'}
                </h3>
                <div className="flex-1 flex items-center justify-center text-sm text-gray-500 italic">
                    No hay actividad reciente
                </div>
            </div>
        );
    }

    return (
        <div className="bg-black/40 backdrop-blur-md border border-white/10 shadow-lg rounded-xl p-6 h-full flex flex-col">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 font-mono">
                {t('activity_timeline') || 'Actividad Reciente'}
            </h3>
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[300px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {activities.map((item, idx) => {
                    const { color } = getIcon(item.type);
                    return (
                        <div key={item.id} className="flex gap-3 group">
                            <div className="relative pt-1">
                                <div className={`w-2 h-2 rounded-full ${color} ring-4 ring-black/40 relative z-10 shadow-[0_0_10px_rgba(255,255,255,0.2)]`}></div>
                                {idx !== activities.length - 1 && <div className="absolute top-2 left-1 w-px h-full bg-white/10 ml-[3px]"></div>}
                            </div>
                            <div className="pb-4 border-b border-white/5 w-full group-last:border-0 group-last:pb-0">
                                <p className="text-sm text-gray-200 font-medium">{item.title}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                                <span className="text-[10px] text-gray-500 font-mono mt-1 block">
                                    {formatDate(item.timestamp)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
