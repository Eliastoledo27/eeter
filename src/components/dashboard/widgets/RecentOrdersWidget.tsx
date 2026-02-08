'use client';

import { BentoItem } from '../bento/BentoGrid';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Package, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Order } from '@/app/actions/dashboard';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const getStatusConfig = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completado':
      return {
        badge: <Badge variant="success" className="gap-1"><CheckCircle2 size={10} />Completado</Badge>,
        icon: <CheckCircle2 size={16} className="text-emerald-600" />,
        color: 'emerald'
      };
    case 'procesando':
      return {
        badge: <Badge variant="blue" className="gap-1"><Clock size={10} />Procesando</Badge>,
        icon: <Clock size={16} className="text-blue-600" />,
        color: 'blue'
      };
    case 'pendiente':
      return {
        badge: <Badge variant="warning" className="gap-1"><AlertCircle size={10} />Pendiente</Badge>,
        icon: <AlertCircle size={16} className="text-amber-600" />,
        color: 'amber'
      };
    case 'cancelado':
      return {
        badge: <Badge variant="destructive" className="gap-1"><XCircle size={10} />Cancelado</Badge>,
        icon: <XCircle size={16} className="text-rose-600" />,
        color: 'rose'
      };
    default:
      return {
        badge: <Badge variant="outline">{status}</Badge>,
        icon: <Package size={16} className="text-slate-600" />,
        color: 'slate'
      };
  }
};

// Generate avatar from customer name
const getAvatarUrl = (name: string) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    'bg-gradient-to-br from-blue-500 to-blue-600',
    'bg-gradient-to-br from-purple-500 to-purple-600',
    'bg-gradient-to-br from-pink-500 to-pink-600',
    'bg-gradient-to-br from-emerald-500 to-emerald-600',
    'bg-gradient-to-br from-amber-500 to-amber-600',
  ];

  const colorIndex = name.length % colors.length;

  return { initials, colorClass: colors[colorIndex] };
};

export function RecentOrdersWidget({ orders = [] }: { orders: Order[] }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <BentoItem colSpan={2} className="overflow-hidden group">
      <div className="flex justify-between items-center mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] border border-[#3B82F6]/20">
            <Package size={14} className="text-[#1E40AF]" strokeWidth={2.5} />
          </div>
          <h3 className="text-[#0F172A] font-black text-lg tracking-tight uppercase">Pedidos Recientes</h3>
        </div>
        <button className="h-8 w-8 flex items-center justify-center rounded-xl bg-white/80 hover:bg-white text-[#94A3B8] hover:text-[#1E40AF] hover:scale-105 transition-all border border-[#E2E8F0] hover:shadow-md">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="overflow-x-auto relative z-10 -mx-3 px-3">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Package size={32} className="text-slate-300" />
            </div>
            <p className="text-[#94A3B8] text-xs font-medium">No hay pedidos recientes</p>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((order, index) => {
              const statusConfig = getStatusConfig(order.status || 'pendiente');
              const avatar = getAvatarUrl(order.customer_name);

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "group/row relative p-3 rounded-xl transition-all duration-300 cursor-pointer",
                    "bg-white/40 hover:bg-white/80 border border-slate-200/50 hover:border-slate-300/80",
                    "hover:shadow-lg hover:scale-[1.01]"
                  )}
                >
                  {/* Background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent rounded-xl opacity-0 group-hover/row:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10 flex items-center gap-3">
                    {/* Customer Avatar */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-md",
                        avatar.colorClass
                      )}
                    >
                      {avatar.initials}
                    </motion.div>

                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-bold text-[#0F172A] group-hover/row:text-[#1E40AF] transition-colors truncate">
                          {order.customer_name}
                        </p>
                        <div className="px-1.5 py-0.5 rounded bg-slate-100 text-[9px] font-mono text-slate-600">
                          #{order.id.slice(0, 6)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-[#64748B]">
                        <Clock size={10} />
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right mr-2">
                      <p className="text-sm font-black text-[#0F172A] tracking-tight">
                        {formatCurrency(order.total_amount || 0)}
                      </p>
                      <p className="text-[9px] text-[#64748B] font-medium">
                        {order.items?.length || 0} items
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="transform group-hover/row:scale-105 transition-transform duration-300">
                      {statusConfig.badge}
                    </div>
                  </div>

                  {/* Action indicator */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                    <div className="w-1 h-8 bg-gradient-to-b from-[#3B82F6] to-[#1E40AF] rounded-full" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </BentoItem>
  );
}
