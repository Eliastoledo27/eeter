'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Bell, Check, CheckCheck, Loader2, MessageSquare, AlertTriangle, Info, ShoppingBag, Database } from 'lucide-react'
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, type Notification } from '@/app/actions/notification-actions'
import { createClient } from '@/utils/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { toast } from 'sonner'

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
    info: { icon: Info, color: 'text-blue-400' },
    success: { icon: Check, color: 'text-emerald-400' },
    warning: { icon: AlertTriangle, color: 'text-amber-400' },
    error: { icon: AlertTriangle, color: 'text-red-400' },
    order: { icon: ShoppingBag, color: 'text-purple-400' },
    stock: { icon: Database, color: 'text-orange-400' },
    message: { icon: MessageSquare, color: 'text-cyan-400' },
}

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unread, setUnread] = useState(0)
    const [loading, setLoading] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const { user } = useAuthStore()

    const loadNotifications = useCallback(async () => {
        setLoading(true)
        const [notifRes, countRes] = await Promise.all([
            getNotifications(15),
            getUnreadCount(),
        ])
        if (notifRes.data) setNotifications(notifRes.data)
        setUnread(countRes.count)
        setLoading(false)
    }, [])

    // Load on mount
    useEffect(() => { loadNotifications() }, [loadNotifications])

    // Real-time subscription
    useEffect(() => {
        if (!user) return
        const supabase = createClient()
        const channel = supabase
            .channel('notifications-bell')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
                (payload) => {
                    const newNotif = payload.new as Notification
                    setNotifications(prev => [newNotif, ...prev.slice(0, 14)])
                    setUnread(prev => prev + 1)
                    toast.info(newNotif.title, { description: newNotif.message || undefined })
                }
            )
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [user])

    // Close on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const handleMarkAsRead = async (id: string) => {
        await markAsRead(id)
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
        setUnread(prev => Math.max(0, prev - 1))
    }

    const handleMarkAllAsRead = async () => {
        await markAllAsRead()
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnread(0)
    }

    const timeAgo = (date: string) => {
        const now = new Date()
        const d = new Date(date)
        const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
        if (diff < 60) return 'ahora'
        if (diff < 3600) return `${Math.floor(diff / 60)}m`
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`
        return `${Math.floor(diff / 86400)}d`
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => { setIsOpen(!isOpen); if (!isOpen) loadNotifications() }}
                className="relative p-2 rounded-lg hover:bg-white/5 transition-colors group"
            >
                <Bell className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-red-500 text-[10px] font-bold text-white rounded-full shadow-[0_0_8px_rgba(239,68,68,0.4)] animate-in zoom-in duration-200">
                        {unread > 99 ? '99+' : unread}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-[#111] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-in slide-in-from-top-2 duration-200 z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                        <span className="text-sm font-semibold text-white">Notificaciones</span>
                        {unread > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-[10px] text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
                            >
                                <CheckCheck className="w-3 h-3" />
                                Marcar todo leído
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                <Bell className="w-8 h-8 mb-2 opacity-30" />
                                <p className="text-xs">Sin notificaciones</p>
                            </div>
                        ) : (
                            notifications.map(notif => {
                                const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info
                                const Icon = cfg.icon
                                return (
                                    <div
                                        key={notif.id}
                                        onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                                        className={`px-4 py-3 border-b border-white/5 last:border-0 cursor-pointer transition-colors hover:bg-white/[0.03] ${!notif.is_read ? 'bg-white/[0.02]' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`p-1.5 rounded-lg ${!notif.is_read ? 'bg-white/5' : 'bg-transparent'}`}>
                                                <Icon className={`w-4 h-4 ${cfg.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className={`text-xs font-medium truncate ${!notif.is_read ? 'text-white' : 'text-gray-400'}`}>
                                                        {notif.title}
                                                    </p>
                                                    <span className="text-[10px] text-gray-600 flex-shrink-0">{timeAgo(notif.created_at)}</span>
                                                </div>
                                                {notif.message && (
                                                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                                )}
                                            </div>
                                            {!notif.is_read && (
                                                <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0 mt-1" />
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
