'use client';

import { Eye, MoreHorizontal, CheckCircle, Clock, XCircle, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Order } from '@/app/actions/dashboard';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface OrdersTableProps {
  orders: Order[];
}

export const OrdersTable = ({ orders }: OrdersTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completado': case 'pagado': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pendiente': case 'procesando': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cancelado': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completado': return <CheckCircle size={14} className="mr-1" />;
      case 'pendiente': return <Clock size={14} className="mr-1" />;
      case 'cancelado': return <XCircle size={14} className="mr-1" />;
      default: return null;
    }
  };

  if (orders.length === 0) {
      return (
          <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/60 p-12 text-center shadow-lg shadow-slate-900/5">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-slate-100 to-transparent rounded-full blur-3xl" />
              <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Clock className="text-slate-400" size={40} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">No hay pedidos recientes</h3>
                  <p className="text-slate-500 font-medium">Cuando recibas ventas, aparecerán aquí en tiempo real.</p>
              </div>
          </div>
      );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/60 shadow-lg shadow-slate-900/5">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-slate-50 to-white p-6 border-b border-slate-200/60">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-2xl" />
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Pedidos Recientes</h3>
            <p className="text-slate-500 text-sm font-medium">Gestiona las últimas transacciones</p>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                      type="text" 
                      placeholder="Buscar pedido..." 
                      className="bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 w-[200px] transition-all shadow-sm focus:shadow-md"
                  />
              </div>
              <Button variant="outline" size="icon" className="border-slate-200 bg-white hover:bg-slate-50 rounded-xl shadow-sm hover:shadow-md transition-all">
                  <Filter size={16} className="text-slate-600" />
              </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200/60 bg-slate-50/50">
              <th className="text-left py-4 px-6 text-xs font-black text-slate-600 uppercase tracking-wider">ID Pedido</th>
              <th className="text-left py-4 px-6 text-xs font-black text-slate-600 uppercase tracking-wider">Cliente</th>
              <th className="text-left py-4 px-6 text-xs font-black text-slate-600 uppercase tracking-wider">Fecha</th>
              <th className="text-left py-4 px-6 text-xs font-black text-slate-600 uppercase tracking-wider">Total</th>
              <th className="text-left py-4 px-6 text-xs font-black text-slate-600 uppercase tracking-wider">Estado</th>
              <th className="text-right py-4 px-6 text-xs font-black text-slate-600 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="py-4 px-6 text-sm font-bold text-slate-900">
                  #{order.id.toString().padStart(4, '0')}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-sm font-black text-white shadow-lg shadow-blue-600/30 group-hover:scale-110 transition-transform">
                      {order.customer_name.charAt(0)}
                    </div>
                    <div>
                        <div className="text-sm text-slate-900 font-bold">{order.customer_name}</div>
                        <div className="text-xs text-slate-500 font-medium">{order.customer_email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-slate-600 font-medium">
                  {order.created_at ? format(new Date(order.created_at), "d MMM, yyyy", { locale: es }) : '-'}
                </td>
                <td className="py-4 px-6 text-sm font-black text-slate-900">
                  ${Number(order.total_amount).toLocaleString('es-AR')}
                </td>
                <td className="py-4 px-6">
                  <Badge variant="outline" className={`border ${getStatusColor(order.status)} flex w-fit items-center px-3 py-1 capitalize font-bold text-xs`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </Badge>
                </td>
                <td className="py-4 px-6 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border-slate-200 text-slate-900">
                      <DropdownMenuItem className="hover:bg-slate-100 cursor-pointer">
                        <Eye className="mr-2 h-4 w-4" /> Ver detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-slate-100 cursor-pointer text-emerald-600">
                        Marcar completado
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
