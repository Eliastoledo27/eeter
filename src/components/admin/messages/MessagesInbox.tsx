import { useState, useEffect, useMemo, useRef } from 'react';
import { getMessages, sendAdminMessage, getConversation } from '@/app/actions/messages';
import { groupMessages } from '@/utils/message-utils';
import type { Message } from '@/types';
import { getAllProfiles } from '@/app/actions/profiles';
import type { Profile } from '@/types/profiles';
import { Search, Inbox, MoreHorizontal, User, Mail, Circle, Clock, Plus, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { MessageThread } from './MessageThread';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/utils/supabase/client';
import { useTranslations } from 'next-intl';

interface MessagesInboxProps {
    isAdmin: boolean;
    refreshToken?: number;
    currentUserId?: string;
}

export const MessagesInbox = ({ isAdmin, refreshToken, currentUserId }: MessagesInboxProps) => {
    const t = useTranslations('messages');
    const tCommon = useTranslations('common');
    const tDashboard = useTranslations('dashboard');

    const [messages, setMessages] = useState<Message[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isThreadLoading, setIsThreadLoading] = useState(false);
    const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
    const supabase = createClient();

    // New Message State
    const [isNewMsgOpen, setIsNewMsgOpen] = useState(false);
    const [newMsgSearch, setNewMsgSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
    const [newMsgText, setNewMsgText] = useState('');
    const [isSending, setIsSending] = useState(false);

    const hasLoadedRef = useRef(false);

    const fetchMessages = async () => {
        // Only show loading spinner on first load
        if (!hasLoadedRef.current) setIsLoading(true);
        try {
            const data = await getMessages(1, 100);
            if (data) {
                setMessages(prev => {
                    // Update recent messages and keep older loaded messages
                    const newIds = new Set(data.map(m => m.id));
                    const oldMessages = prev.filter(m => !newIds.has(m.id));
                    return [...data, ...oldMessages];
                });
            }
            hasLoadedRef.current = true;
        } catch (err) {
            console.error("Error fetching messages:", err);
            toast.error(tCommon('error'));
        } finally {
            setIsLoading(false);
        }
    };

    // Keep a ref to the latest fetchMessages to avoid re-subscribing when it changes
    const fetchMessagesRef = useRef(fetchMessages);
    useEffect(() => {
        fetchMessagesRef.current = fetchMessages;
    });

    // Debounced Fetch for Realtime
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const triggerFetch = () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchMessagesRef.current();
        }, 500);
    };

    // Realtime Subscription
    useEffect(() => {
        const channel = supabase
            .channel('realtime-messages')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'messages'
            }, (payload) => {
                // Determine if we should refresh based on admin status and message ownership
                if (isAdmin) {
                    // Admin sees all, so refresh (debounced)
                    triggerFetch();

                    if (payload.eventType === 'INSERT') {
                        const newMsg = payload.new as Message;
                        if (!newMsg.is_admin_reply) {
                            toast.info(`${t('new_message')} ${t('to')} ${newMsg.name || tDashboard('role.user')}`);
                        }
                    }
                } else {
                    // Regular user: only refresh if message involves them
                    const newMsg = payload.new as Message;
                    if (newMsg.sender_id === currentUserId || newMsg.receiver_id === currentUserId) {
                        fetchMessagesRef.current(); // Immediate for single user
                        if (payload.eventType === 'INSERT' && newMsg.receiver_id === currentUserId) {
                            toast.info(t('new_message'));
                        }
                    }
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [isAdmin, currentUserId, supabase]);

    useEffect(() => {
        fetchMessages();
    }, [refreshToken]);

    useEffect(() => {
        if (!isAdmin) return;
        const loadProfiles = async () => {
            try {
                const { data, error } = await getAllProfiles();
                if (error) {
                    // toast.error(error); // Suppress errors if API fails casually
                    return;
                }
                setProfiles((data || []).filter(profile => profile.id !== currentUserId));
            } catch (e) {
                console.error("Error loading profiles", e);
            }
        };
        loadProfiles();
    }, [isAdmin, currentUserId]);

    // Helper for safe dates
    const safeDate = (dateStr?: string) => {
        if (!dateStr) return new Date();
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? new Date() : d;
    };

    // Fetch full conversation when thread is selected
    useEffect(() => {
        const loadConversation = async () => {
            if (!selectedThreadId) return;

            setIsThreadLoading(true);
            const fullConversation = await getConversation(selectedThreadId);

            if (fullConversation && fullConversation.length > 0) {
                setMessages(prev => {
                    // Merge new messages with existing ones, avoiding duplicates
                    const existingIds = new Set(prev.map(m => m.id));
                    const newMessages = fullConversation.filter(m => !existingIds.has(m.id));

                    if (newMessages.length === 0) return prev;

                    return [...prev, ...newMessages];
                });
            }
            setIsThreadLoading(false);
        };

        loadConversation();
    }, [selectedThreadId]);

    // Group messages by thread
    const threads = useMemo(() => {
        return groupMessages({
            messages,
            profiles,
            tNewMessage: t('new_message'),
            tRoleUser: tDashboard('role.user')
        });
    }, [messages, profiles, t, tDashboard]);



    // Filter threads safely
    const filteredThreads = useMemo(() => {
        return threads.filter(thread => {
            const tName = (thread.name || '').toLowerCase();
            const tEmail = (thread.email || '').toLowerCase();
            const s = search.toLowerCase();

            const matchesSearch = tName.includes(s) || tEmail.includes(s);

            if (filter === 'unread') return matchesSearch && thread.unreadCount > 0;
            return matchesSearch;
        });
    }, [threads, search, filter]);

    const activeThread = selectedThreadId
        ? threads.find(t => t.userId === selectedThreadId)
        : null;

    // Get avatar color safely
    const getAvatarColor = (name: string) => {
        if (!name) return 'from-blue-500 to-blue-600';
        const colors = [
            'from-blue-500 to-blue-600',
            'from-purple-500 to-purple-600',
            'from-pink-500 to-pink-600',
            'from-emerald-500 to-emerald-600',
            'from-amber-500 to-amber-600',
            'from-rose-500 to-rose-600',
            'from-indigo-500 to-indigo-600',
            'from-cyan-500 to-cyan-600',
        ];
        try {
            const index = name.charCodeAt(0) % colors.length;
            return colors[isNaN(index) ? 0 : index];
        } catch {
            return colors[0];
        }
    };

    const handleSendNewMessage = async () => {
        if (!selectedUser || !newMsgText.trim()) return;

        setIsSending(true);
        const result = await sendAdminMessage(selectedUser.id, newMsgText.trim());
        setIsSending(false);

        if (result.success) {
            toast.success(t('sending'));
            setIsNewMsgOpen(false);
            setNewMsgText('');
            setSelectedUser(null);
            fetchMessages();
            // Automatically select the thread
            setSelectedThreadId(selectedUser.id);
        } else {
            toast.error(result.error || tCommon('error'));
        }
    };

    const usersForSelection = profiles.filter(p =>
        p.full_name?.toLowerCase().includes(newMsgSearch.toLowerCase()) ||
        p.email?.toLowerCase().includes(newMsgSearch.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-140px)] min-h-[600px] bg-gradient-to-br from-slate-50 via-white to-slate-50 rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xl shadow-slate-900/5 backdrop-blur-xl">

            {/* Sidebar - Thread List */}
            <div className={cn(
                "w-full md:w-[420px] flex flex-col bg-white/40 backdrop-blur-xl border-r border-slate-200/60",
                selectedThreadId ? "hidden md:flex" : "flex"
            )}>
                {/* Sidebar Header */}
                <div className="p-6 border-b border-slate-200/60 space-y-4 bg-gradient-to-b from-white/80 to-white/40 backdrop-blur-xl">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/30">
                                <Inbox size={20} className="text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="font-black text-xl text-slate-900 tracking-tight">{t('title')}</h2>
                                <p className="text-xs text-slate-500 font-medium">{t('subtitle', { count: filteredThreads.length })}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsNewMsgOpen(true)}
                                className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-600/20 transition-all"
                                title={t('new_conversation')}
                            >
                                <Plus size={20} strokeWidth={2.5} />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-all duration-300 hover:shadow-md"
                            >
                                <MoreHorizontal size={20} strokeWidth={2} />
                            </motion.button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} strokeWidth={2} />
                        <input
                            type="text"
                            placeholder={t('search_placeholder')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white/80 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all shadow-sm focus:shadow-md placeholder:text-slate-400"
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 p-1 bg-slate-100/80 rounded-xl backdrop-blur-sm">
                        <button
                            onClick={() => setFilter('all')}
                            className={cn(
                                "flex-1 px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2",
                                filter === 'all'
                                    ? "bg-white text-slate-900 shadow-md shadow-slate-900/10"
                                    : "text-slate-600 hover:text-slate-900"
                            )}
                        >
                            <Mail size={14} />
                            {t('all')}
                            <span className={cn(
                                "px-1.5 py-0.5 rounded-full text-[10px] font-extrabold",
                                filter === 'all' ? "bg-slate-100 text-slate-700" : "bg-slate-200/50 text-slate-500"
                            )}>
                                {threads.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={cn(
                                "flex-1 px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2",
                                filter === 'unread'
                                    ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30"
                                    : "text-slate-600 hover:text-slate-900"
                            )}
                        >
                            <Circle size={14} className={filter === 'unread' ? 'fill-white' : ''} />
                            {t('unread')}
                            {threads.filter(t => t.unreadCount > 0).length > 0 && (
                                <span className={cn(
                                    "px-1.5 py-0.5 rounded-full text-[10px] font-extrabold",
                                    filter === 'unread' ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700"
                                )}>
                                    {threads.filter(t => t.unreadCount > 0).length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Thread List */}
                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    {isLoading ? (
                        <div className="p-12 flex flex-col items-center justify-center space-y-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center animate-pulse">
                                <Inbox size={32} className="text-white" />
                            </div>
                            <p className="text-sm font-medium text-slate-500">{tCommon('loading')}</p>
                        </div>
                    ) : filteredThreads.length === 0 ? (
                        <div className="p-12 flex flex-col items-center text-center space-y-4">
                            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center">
                                <Inbox size={40} className="text-slate-300" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-700 mb-1">{t('no_conversations')}</p>
                                <p className="text-xs text-slate-500">{t('no_conversations_sub')}</p>
                            </div>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {filteredThreads.map((thread, index) => {
                                const avatarColor = getAvatarColor(thread.name);
                                const initials = (thread.name || 'U')
                                    .split(' ')
                                    .map(n => n[0])
                                    .join('')
                                    .toUpperCase()
                                    .slice(0, 2);

                                return (
                                    <motion.div
                                        key={thread.userId}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ delay: Math.min(index * 0.03, 0.5) }} // Cap delay
                                        onClick={() => setSelectedThreadId(thread.userId)}
                                        className={cn(
                                            "relative mx-2 mb-2 p-4 cursor-pointer rounded-xl transition-all duration-300 group",
                                            selectedThreadId === thread.userId
                                                ? "bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 shadow-lg shadow-blue-900/10"
                                                : "bg-white/60 hover:bg-white border-2 border-transparent hover:border-slate-200/80 hover:shadow-md backdrop-blur-sm"
                                        )}
                                    >
                                        {/* Unread indicator stripe */}
                                        {thread.unreadCount > 0 && (
                                            <div className="absolute left-0 top-4 bottom-4 w-1 bg-gradient-to-b from-blue-600 to-blue-700 rounded-r-full" />
                                        )}

                                        <div className="flex gap-3">
                                            {/* Avatar */}
                                            <div className="relative flex-shrink-0">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-black text-sm shadow-lg transition-all duration-300",
                                                    avatarColor,
                                                    "group-hover:scale-110 group-hover:rotate-3"
                                                )}>
                                                    {initials}
                                                </div>
                                                {thread.unreadCount > 0 && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-[10px] font-extrabold shadow-lg shadow-blue-600/50 ring-2 ring-white"
                                                    >
                                                        {thread.unreadCount}
                                                    </motion.div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-1">
                                                    <h3 className={cn(
                                                        "font-bold text-sm truncate pr-2 transition-colors",
                                                        thread.unreadCount > 0 ? "text-slate-900" : "text-slate-700 group-hover:text-slate-900"
                                                    )}>
                                                        {thread.name || thread.email}
                                                    </h3>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 whitespace-nowrap">
                                                        <Clock size={10} />
                                                        <span className="font-medium">
                                                            {thread.messages.length > 0 && thread.lastMessage.created_at
                                                                ? formatDistanceToNow(safeDate(thread.lastMessage.created_at), { locale: es, addSuffix: false })
                                                                : 'Nuevo'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <p className={cn(
                                                    "text-xs line-clamp-2 mb-2 leading-relaxed",
                                                    thread.unreadCount > 0 ? "text-slate-700 font-medium" : "text-slate-500"
                                                )}>
                                                    {thread.messages.length > 0 ? (
                                                        <>
                                                            {thread.lastMessage.is_admin_reply && (
                                                                <span className="text-blue-600 font-bold mr-1">Tú:</span>
                                                            )}
                                                            {thread.lastMessage.message || 'Sin mensajes aún'}
                                                        </>
                                                    ) : t('start_conversation')}
                                                </p>

                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 bg-slate-100/80 px-2 py-1 rounded-md backdrop-blur-sm">
                                                        <Mail size={10} />
                                                        <span className="truncate max-w-[140px] font-medium">{thread.email}</span>
                                                    </div>
                                                    {thread.messages.length > 0 && (
                                                        <div className="text-[10px] text-slate-400 bg-slate-100/60 px-2 py-1 rounded-md font-medium">
                                                            {thread.messages.length} {thread.messages.length === 1 ? 'mensaje' : 'mensajes'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </div>
            </div>

            {/* Main Content - Chat Area */}
            <div className={cn(
                "flex-1 flex flex-col bg-gradient-to-br from-slate-50/50 to-white/50 backdrop-blur-xl",
                !selectedThreadId ? "hidden md:flex" : "flex"
            )}>
                {activeThread ? (
                    <MessageThread
                        threadId={activeThread.userId}
                        initialMessages={activeThread.messages}
                        user={{ name: activeThread.name, email: activeThread.email }}
                        onBack={() => setSelectedThreadId(null)}
                        onRefresh={fetchMessages}
                        isAdminView={isAdmin}
                    />
                ) : (
                    // ... existing imports ...
                    // We need to keep the imports and structure
                    // I'll use read and replace for the specific section

                    // Replacing the "Main Content - Chat Area" empty state
                    // Lines 484-503
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-6 flex flex-col items-center"
                        >
                            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-blue-600/30 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-white/10 backdrop-blur-xl group-hover:bg-white/20 transition-all" />
                                <User size={64} className="text-white relative z-10" strokeWidth={1.5} />
                                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/50 to-transparent" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">{t('select_conversation')}</h3>
                                <p className="text-sm text-slate-500 max-w-md font-medium leading-relaxed mb-6">
                                    {t('select_conversation_sub')}
                                </p>
                                <Button
                                    onClick={() => setIsNewMsgOpen(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-6 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all transform hover:-translate-y-1"
                                >
                                    <Plus className="mr-2" size={20} />
                                    {t('new_conversation')}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                    // ... rest of the file
                )}
            </div>

            {/* New Message Dialog */}
            <Dialog open={isNewMsgOpen} onOpenChange={setIsNewMsgOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('new_conversation')}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 pt-2">
                        {!selectedUser ? (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">{t('search_user')}</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <Input
                                        placeholder={t('search_placeholder')}
                                        value={newMsgSearch}
                                        onChange={(e) => setNewMsgSearch(e.target.value)}
                                        className="pl-9"
                                        autoFocus
                                    />
                                </div>
                                <div className="border border-slate-100 rounded-lg max-h-[200px] overflow-y-auto mt-2 divide-y divide-slate-50">
                                    {usersForSelection.length === 0 ? (
                                        <div className="p-4 text-center text-xs text-slate-400">
                                            {t('no_users_found')}
                                        </div>
                                    ) : (
                                        usersForSelection.map(user => (
                                            <div
                                                key={user.id}
                                                onClick={() => setSelectedUser(user)}
                                                className="p-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition-colors"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                    {(user.full_name || 'U')[0].toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-900 truncate">{user.full_name || 'Sin nombre'}</p>
                                                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                                </div>
                                                <div className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded capitalize">
                                                    {user.role}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between bg-blue-50 p-3 rounded-xl border border-blue-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                                            {(selectedUser.full_name || 'U')[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">
                                                {t('to')}: {selectedUser.full_name || selectedUser.email}
                                            </p>
                                            <p className="text-xs text-blue-600/80">{selectedUser.email}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedUser(null)}
                                        className="text-slate-400 hover:text-slate-600"
                                    >
                                        {tCommon('edit')}
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">{t('initial_message')}</label>
                                    <Textarea
                                        placeholder={t('type_message')}
                                        value={newMsgText}
                                        onChange={(e) => setNewMsgText(e.target.value)}
                                        className="min-h-[100px] resize-none"
                                        autoFocus
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <Button variant="ghost" onClick={() => setIsNewMsgOpen(false)}>{tCommon('cancel')}</Button>
                                    <Button
                                        onClick={handleSendNewMessage}
                                        disabled={!newMsgText.trim() || isSending}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {isSending ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ repeat: Infinity, duration: 1 }}
                                                className="mr-2"
                                            >
                                                <Clock size={16} />
                                            </motion.div>
                                        ) : (
                                            <Send size={16} className="mr-2" />
                                        )}
                                        {t('send')}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
