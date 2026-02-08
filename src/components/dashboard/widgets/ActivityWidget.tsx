'use client';

import { BentoItem } from '../bento/BentoGrid';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Package,
    ShoppingCart,
    Users,
    DollarSign,
    MessageCircle,
    Activity
} from 'lucide-react';

// Remove ActivityItem interface if imported from actions or re-define if necessary
import { ActivityItem } from '@/app/actions/dashboard';

export function ActivityWidget({ activities = [] }: { activities?: ActivityItem[] }) {
    return (
        <BentoItem colSpan={1} rowSpan={2} className="overflow-hidden">
            <div className="flex items-center gap-2 mb-4 relative z-20">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] border border-[#3B82F6]/20">
                    <Activity size={14} className="text-[#1E40AF]" strokeWidth={2.5} />
                </div>
                <h3 className="text-[#0F172A] font-black text-lg tracking-tight uppercase">Actividad</h3>
            </div>

            <div className="space-y-2 relative z-10 overflow-y-auto max-h-[340px] -mr-3 pr-3 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                {activities.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">
                        No hay actividad reciente
                    </div>
                ) : (
                    activities.map((activity, index) => {
                        const colors = getActivityColor(activity.type);

                        return (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.08 }}
                                className={cn(
                                    "group relative p-2.5 rounded-xl transition-all duration-300 cursor-pointer",
                                    "bg-white/40 hover:bg-white/80 border border-slate-200/50 hover:border-slate-300/80",
                                    "hover:shadow-md hover:scale-[1.02]"
                                )}
                            >
                                {/* Hover gradient */}
                                <div className={cn(
                                    "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                                    `bg-gradient-to-r ${colors.bgSoft} to-transparent`
                                )} />

                                <div className="relative z-10 flex items-start gap-2.5">
                                    {/* Icon */}
                                    <div className={cn(
                                        "w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-md flex-shrink-0",
                                        "group-hover:scale-110 transition-transform duration-300",
                                        colors.bg,
                                        `ring-2 ${colors.ring}`
                                    )}>
                                        {getActivityIcon(activity.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-0.5">
                                            <p className="text-xs font-bold text-[#0F172A] group-hover:text-[#1E40AF] transition-colors line-clamp-1">
                                                {activity.title}
                                            </p>
                                            {activity.value && (
                                                <span className={cn(
                                                    "text-[9px] font-extrabold px-1.5 py-0.5 rounded-md whitespace-nowrap",
                                                    colors.text,
                                                    colors.bgSoft
                                                )}>
                                                    {activity.value}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-[10px] text-[#64748B] mb-1 line-clamp-1">
                                            {activity.description}
                                        </p>

                                        <div className="flex items-center gap-1 text-[9px] text-[#94A3B8]">
                                            <div className="w-1 h-1 rounded-full bg-[#94A3B8]" />
                                            <span>
                                                {new Date(activity.timestamp).toLocaleDateString('es-ES', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    day: '2-digit',
                                                    month: 'short'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Connection line to next item */}
                                {index < activities.length - 1 && (
                                    <div className="absolute left-[22px] top-[46px] w-[1px] h-[8px] bg-gradient-to-b from-slate-300 to-transparent" />
                                )}
                            </motion.div>
                        );
                    })
                )}
            </div>
        </BentoItem>
    );
}

const getActivityIcon = (type: string) => {
    switch (type) {
        case 'order': return <ShoppingCart size={14} />;
        case 'customer': return <Users size={14} />;
        case 'revenue': return <DollarSign size={14} />;
        case 'product': return <Package size={14} />;
        case 'message': return <MessageCircle size={14} />;
        default: return <Activity size={14} />;
    }
};

const getActivityColor = (type: string) => {
    switch (type) {
        case 'order': return { bg: 'bg-blue-600', bgSoft: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-100' };
        case 'customer': return { bg: 'bg-purple-600', bgSoft: 'bg-purple-50', text: 'text-purple-700', ring: 'ring-purple-100' };
        case 'revenue': return { bg: 'bg-emerald-600', bgSoft: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-100' };
        case 'product': return { bg: 'bg-amber-600', bgSoft: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-100' };
        case 'message': return { bg: 'bg-indigo-600', bgSoft: 'bg-indigo-50', text: 'text-indigo-700', ring: 'ring-indigo-100' };
        default: return { bg: 'bg-slate-600', bgSoft: 'bg-slate-50', text: 'text-slate-700', ring: 'ring-slate-100' };
    }
};
