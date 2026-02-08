'use client';

import { BentoItem } from '../bento/BentoGrid';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  XCircle,
  X,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

type NotificationType = 'success' | 'warning' | 'info' | 'error';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  onToggleRead: (id: string) => void;
  index: number;
}

function NotificationItem({ notification, onDismiss, onToggleRead, index }: NotificationItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const typeConfig = {
    success: {
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      dotColor: 'bg-emerald-500'
    },
    warning: {
      icon: AlertCircle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      dotColor: 'bg-amber-500'
    },
    info: {
      icon: Info,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      dotColor: 'bg-blue-500'
    },
    error: {
      icon: XCircle,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      dotColor: 'bg-rose-500'
    }
  };

  const config = typeConfig[notification.type];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative"
    >
      <div
        onClick={() => onToggleRead(notification.id)}
        className={cn(
          "relative group cursor-pointer p-3 rounded-xl border transition-all duration-300",
          config.bgColor,
          config.borderColor,
          notification.read ? 'opacity-60 hover:opacity-100' : '',
          "hover:shadow-md"
        )}
      >
        {/* Unread indicator */}
        {!notification.read && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              "absolute top-2 left-2 w-2 h-2 rounded-full",
              config.dotColor
            )}
          >
            <motion.div
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={cn("absolute inset-0 rounded-full opacity-50", config.dotColor)}
            />
          </motion.div>
        )}

        {/* Dismiss button */}
        <AnimatePresence>
          {isHovered && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(notification.id);
              }}
              className="absolute top-2 right-2 p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors z-10"
            >
              <X size={12} className="text-slate-500" />
            </motion.button>
          )}
        </AnimatePresence>

        <div className="flex items-start gap-3 pl-4">
          <motion.div
            animate={{ rotate: isHovered ? 5 : 0 }}
            className={cn(
              "p-1.5 rounded-lg border bg-white shadow-sm mt-0.5",
              config.borderColor
            )}
          >
            <Icon size={14} className={config.color} strokeWidth={2.5} />
          </motion.div>

          <div className="flex-1 min-w-0">
            <h4 className={cn(
              "text-xs font-black mb-0.5 truncate",
              config.color.replace('600', '700')
            )}>
              {notification.title}
            </h4>
            <p className="text-[10px] text-slate-600 font-medium leading-tight mb-1.5">
              {notification.message}
            </p>
            <p className="text-[9px] text-slate-400 font-medium">
              {formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: es })}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Import Notification type from actions if needed or redefine compatible one
// Assuming incoming notifications might not have 'type', we'll handle it.

export interface DashboardNotification {
  id: string;
  type?: NotificationType; // Make optional
  title: string;
  message: string;
  timestamp: Date | string; // Handle string from JSON/DB
  read: boolean;
  created_at?: string; // DB field
}

interface RawNotification {
  id: string;
  type?: NotificationType;
  title?: string;
  content?: string;
  message?: string;
  created_at?: string;
  read?: boolean;
}

export function NotificationsWidget({
  initialNotifications = []
}: {
  initialNotifications?: RawNotification[]
}) {
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const mapped = initialNotifications.map(n => ({
      id: n.id,
      type: n.type || 'info', // Default to info if no type
      title: n.title || 'Notificación',
      message: n.content || n.message || '',
      timestamp: n.created_at ? new Date(n.created_at) : new Date(),
      read: n.read || false
    }));
    setNotifications(mapped);
    setMounted(true);
  }, [initialNotifications]); // Update if props change

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    // In a real app, call server action to delete/dismiss
  };

  const handleToggleRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: !n.read } : n)
    );
    // In a real app, call server action to mark as read
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    // In a real app, call server action
  };

  const displayedNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => !n.read);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!mounted) {
    return (
      <BentoItem colSpan={1} rowSpan={2} className="animate-pulse">
        <div className="h-full w-full" />
      </BentoItem>
    );
  }

  return (
    <BentoItem colSpan={1} rowSpan={2} className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-purple-100/40 to-transparent rounded-full blur-3xl" />

      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 0.5, delay: 2, repeat: Infinity, repeatDelay: 5 }}
                className="p-1.5 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200"
              >
                <Bell size={14} className="text-purple-600" strokeWidth={2.5} />
              </motion.div>
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center"
                >
                  <span className="text-[8px] font-black text-white">{unreadCount}</span>
                </motion.div>
              )}
            </div>
            <h3 className="text-slate-900 font-black text-lg tracking-tight uppercase">Alertas</h3>
          </div>

          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className={cn(
              "text-[9px] font-bold px-2 py-1 rounded-lg transition-all",
              unreadCount > 0
                ? "text-purple-600 hover:bg-purple-50"
                : "text-slate-400 cursor-not-allowed"
            )}
          >
            Marcar todas
          </button>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1 p-1 bg-white/80 border border-slate-200 rounded-xl backdrop-blur-sm shadow-sm mb-3">
          {[
            { id: 'all', label: `Todas (${notifications.length})` },
            { id: 'unread', label: `No leídas (${unreadCount})` }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as 'all' | 'unread')}
              className={cn(
                "flex-1 px-2 py-1 text-[10px] font-bold rounded-lg transition-all duration-300",
                filter === f.id
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
                  : "text-slate-600 hover:text-purple-600 hover:bg-slate-50"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {displayedNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <Bell size={32} className="text-slate-300" />
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  {filter === 'unread' ? 'No hay notificaciones nuevas' : 'No hay notificaciones'}
                </p>
              </motion.div>
            ) : (
              <div className="space-y-2">
                {displayedNotifications.map((notification, index) => (
                  <NotificationItem
                    key={notification.id}
                    // Adapt notification to component props
                    notification={{
                      id: notification.id,
                      type: notification.type || 'info',
                      title: notification.title,
                      message: notification.message,
                      timestamp: new Date(notification.timestamp),
                      read: notification.read
                    }}
                    onDismiss={handleDismiss}
                    onToggleRead={handleToggleRead}
                    index={index}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-3 pt-3 border-t border-slate-200"
          >
            <button className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 text-[10px] font-bold transition-all duration-300 flex items-center justify-center gap-1.5">
              <MoreHorizontal size={12} strokeWidth={2.5} />
              Ver Todas las Notificaciones
            </button>
          </motion.div>
        )}
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
