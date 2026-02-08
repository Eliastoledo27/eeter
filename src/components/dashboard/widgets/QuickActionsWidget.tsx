'use client';

import { BentoItem } from '../bento/BentoGrid';
import { motion } from 'framer-motion';
import {
  Plus,
  Upload,
  FileText,
  Share2,
  Settings,
  TrendingUp,
  Users,
  Package,
  Bell,
  Download,
  ShoppingCart,
  MessageCircle,
  Store,
  ShoppingBag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import Link from 'next/link';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  href: string;
  badge?: string;
}

const actions: QuickAction[] = [
  {
    id: 'new-product',
    label: 'Nuevo Producto',
    description: 'Agregar producto al catálogo',
    icon: Plus,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    href: '/dashboard?view=products&action=new'
  },
  {
    id: 'upload-catalog',
    label: 'Subir Catálogo',
    description: 'Importar productos en lote',
    icon: Upload,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    href: '/dashboard?view=products&action=import'
  },
  {
    id: 'new-order',
    label: 'Nuevo Pedido',
    description: 'Crear pedido manualmente',
    icon: FileText,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    href: '/dashboard?view=orders&action=new'
  },
  {
    id: 'share-catalog',
    label: 'Compartir Catálogo',
    description: 'Enviar catálogo a clientes',
    icon: Share2,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    href: '/dashboard?view=catalog'
  },
  {
    id: 'manage-clients',
    label: 'Clientes',
    description: 'Ver y gestionar clientes',
    icon: Users,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    href: '/dashboard?view=customers',
    badge: '3'
  },
  {
    id: 'inventory',
    label: 'Inventario',
    description: 'Actualizar stock',
    icon: Package,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    href: '/dashboard?view=products&tab=inventory'
  },
  {
    id: 'reports',
    label: 'Reportes',
    description: 'Descargar estadísticas',
    icon: Download,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    href: '/dashboard?view=reports'
  },
  {
    id: 'settings',
    label: 'Configuración',
    description: 'Ajustes del sistema',
    icon: Settings,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    href: '/dashboard?view=settings'
  }
];

interface ActionCardProps {
  action: QuickAction;
  index: number;
}

function ActionCard({ action, index }: ActionCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link href={action.href}>
        <motion.div
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "relative group cursor-pointer p-3 rounded-xl border transition-all duration-300 overflow-hidden",
            action.bgColor,
            action.borderColor,
            "hover:shadow-lg"
          )}
        >
          {/* Background glow on hover */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className={cn(
              "absolute inset-0 opacity-20",
              action.bgColor.replace('50', '100')
            )}
          />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-2">
              <motion.div
                animate={{ rotate: isHovered ? 5 : 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "p-2 rounded-lg border bg-white shadow-sm",
                  action.borderColor
                )}
              >
                <action.icon size={18} className={action.color} strokeWidth={2.5} />
              </motion.div>

              {action.badge && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black"
                >
                  {action.badge}
                </motion.div>
              )}
            </div>

            <h4 className={cn("text-xs font-black mb-0.5", action.color.replace('600', '700'))}>
              {action.label}
            </h4>
            <p className="text-[10px] text-slate-500 font-medium leading-tight">
              {action.description}
            </p>
          </div>

          {/* Hover indicator */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: isHovered ? '100%' : 0 }}
            className={cn("absolute bottom-0 left-0 h-0.5", action.color.replace('text-', 'bg-'))}
          />
        </motion.div>
      </Link>
    </motion.div>
  );
}

export function QuickActionsWidget({
  customerCount = 0,
  unreadNotifications = 0,
  role = 'admin'
}: {
  customerCount?: number;
  unreadNotifications?: number;
  role?: 'admin' | 'reseller' | 'user';
}) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'frequent'>('all');

  // Reseller specific actions
  const resellerActions: QuickAction[] = [
    {
      id: 'new-order',
      label: 'Nuevo Pedido',
      description: 'Explorar catálogo completo',
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      href: '/dashboard?view=catalog'
    },
    {
      id: 'my-orders',
      label: 'Mis Pedidos',
      description: 'Ver historial de compras',
      icon: Package,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      href: '/dashboard?view=orders'
    },
    {
      id: 'cart',
      label: 'Mi Carrito',
      description: 'Ver productos pendientes',
      icon: ShoppingCart,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      href: '/cart' // Assuming /cart exists or handled by sidebar
    },
    {
      id: 'support',
      label: 'Soporte',
      description: 'Contactar ayuda',
      icon: MessageCircle,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      href: '/dashboard?view=support' // Or mailto link
    }
  ];

  // User specific actions (similar to reseller but simplified)
  const userActions: QuickAction[] = [
    {
      id: 'catalog',
      label: 'Ver Productos',
      description: 'Explorar tienda',
      icon: Store,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      href: '/'
    },
    {
      id: 'my-orders',
      label: 'Mis Compras',
      description: 'Ver historial',
      icon: Package,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      href: '/dashboard?view=orders'
    }
  ];

  // Select actions based on role
  let currentActions = actions;
  if (role === 'reseller') {
    currentActions = resellerActions;
  } else if (role === 'user') {
    currentActions = userActions;
  }

  // Update actions with dynamic data (only for admin actions that use it)
  const dynamicActions = currentActions.map(action => {
    if (action.id === 'manage-clients') {
      return { ...action, badge: customerCount > 0 ? customerCount.toString() : undefined };
    }
    return action;
  });

  const frequentActions = role === 'admin' 
    ? ['new-product', 'upload-catalog', 'share-catalog', 'manage-clients']
    : role === 'reseller'
      ? ['new-order', 'my-orders', 'cart']
      : ['catalog', 'my-orders'];

  const displayedActions = activeFilter === 'all'
    ? dynamicActions
    : dynamicActions.filter(a => frequentActions.includes(a.id));

  return (
    <BentoItem colSpan={2} rowSpan={2} className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-100/30 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-100/30 to-transparent rounded-full blur-3xl" />

      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(59, 130, 246, 0)',
                  '0 0 0 8px rgba(59, 130, 246, 0)',
                ]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="p-1.5 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200"
            >
              <TrendingUp size={14} className="text-blue-600" strokeWidth={2.5} />
            </motion.div>
            <h3 className="text-slate-900 font-black text-lg tracking-tight uppercase">Acciones Rápidas</h3>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-white/80 border border-slate-200 rounded-xl backdrop-blur-sm shadow-sm">
            {[
              { id: 'all', label: 'Todas' },
              { id: 'frequent', label: 'Frecuentes' }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id as 'all' | 'frequent')}
                className={cn(
                  "px-3 py-1 text-[10px] font-bold rounded-lg transition-all duration-300",
                  activeFilter === filter.id
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                    : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions Grid */}
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-4 gap-2.5"
          >
            {displayedActions.map((action, index) => (
              <ActionCard key={action.id} action={action} index={index} />
            ))}
          </motion.div>
        </div>

        {/* Footer Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-4"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-medium text-slate-500">
              Sistema operativo
            </span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <Bell size={12} className={unreadNotifications > 0 ? "text-rose-500" : "text-slate-400"} />
            <span className={cn(
              "text-[10px] font-bold",
              unreadNotifications > 0 ? "text-rose-600" : "text-slate-500"
            )}>
              {unreadNotifications > 0 ? `${unreadNotifications} notificaciones nuevas` : 'Sin notificaciones nuevas'}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }
      `}</style>
    </BentoItem>
  );
}
