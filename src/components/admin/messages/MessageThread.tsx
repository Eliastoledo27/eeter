'use client';

import { useState, useRef, useEffect } from 'react';
import { markMessageAsRead, replyMessage, sendAdminMessage } from '@/app/actions/messages';
import type { Message } from '@/types';
import { ArrowLeft, Send, CheckCheck, User, AlertCircle, Loader2, Smile, Paperclip, Mic, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';

interface MessageThreadProps {
    threadId: string;
    initialMessages: Message[];
    user: { name: string; email: string };
    onBack: () => void;
    onRefresh: () => void;
    isAdminView: boolean;
}

export const MessageThread = ({ threadId, initialMessages, user, onBack, onRefresh, isAdminView }: MessageThreadProps) => {
    const [replyText, setReplyText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    
    // Local state for messages to handle realtime updates
    const [messages, setMessages] = useState<Message[]>([]);

    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const supabase = createClient();

    // Initialize and sort messages
    useEffect(() => {
        const sorted = [...initialMessages].sort((a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        setMessages(sorted);
    }, [initialMessages]);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Mark unread as read
    useEffect(() => {
        const unreadIds = messages
            .filter(m => m.status === 'unread' && !m.is_admin_reply) // Assuming user messages are unread for admin
            // Logic fix: If I am admin, I read user messages. If I am user, I read admin messages?
            // The logic in actions suggests 'status' is general.
            // Let's stick to: if it's not MY reply, and it's unread, I read it.
            .filter(m => isAdminView ? !m.is_admin_reply : m.is_admin_reply)
            .map(m => m.id);

        if (unreadIds.length > 0) {
            unreadIds.forEach(id => {
                markMessageAsRead(id).catch(() => { });
            });
            // Update local state to show read? Or just wait for refresh
            // We can optimistic update
        }
    }, [messages, isAdminView]);


    // Supabase Realtime Subscription
    useEffect(() => {
        const channel = supabase
            .channel('messages-thread')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    // Filter is tricky with OR, so we filter in callback
                },
                (payload) => {
                    const newMsg = payload.new as Message;
                    
                    // Check if this message belongs to the current thread
                    // Thread ID is usually the User ID of the other person
                    // If Admin View: ThreadId is the User's ID. Message should be sender_id=ThreadId OR receiver_id=ThreadId
                    // If User View: ThreadId is... well, user view usually only sees their own messages.
                    
                    const belongsToThread = 
                        (newMsg.sender_id === threadId) || 
                        (newMsg.receiver_id === threadId);

                    if (belongsToThread) {
                        setMessages(prev => {
                            // Avoid duplicates
                            if (prev.some(m => m.id === newMsg.id)) return prev;
                            return [...prev, newMsg].sort((a, b) => 
                                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                            );
                        });
                        
                        // Play sound or notification?
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [threadId, supabase]);

    const handleSend = async () => {
        if (!replyText.trim()) return;

        setIsSending(true);
        try {
            const lastUserMsg = [...messages].reverse().find(m => !m.is_admin_reply);

            const result = lastUserMsg
                ? await replyMessage(lastUserMsg.id, replyText)
                : await sendAdminMessage(threadId, replyText);

            if (result.success) {
                setReplyText('');
                onRefresh();
                toast.success("Respuesta enviada");
            } else {
                toast.error(result.error || "Error al enviar");
            }
        } catch {
            toast.error("Error de conexión");
        } finally {
            setIsSending(false);
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [replyText]);

    // Get avatar color based on name
    const getAvatarColor = (name: string) => {
        const colors = [
            'from-blue-500 to-blue-600',
            'from-purple-500 to-purple-600',
            'from-pink-500 to-pink-600',
            'from-emerald-500 to-emerald-600',
            'from-amber-500 to-amber-600',
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const initials = user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-white to-slate-50/50 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 flex items-center gap-4 p-5 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm">
                <motion.button
                    onClick={onBack}
                    whileHover={{ scale: 1.05, x: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="md:hidden p-2.5 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                >
                    <ArrowLeft size={20} strokeWidth={2} />
                </motion.button>

                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="relative flex-shrink-0"
                >
                    <div className={cn(
                        "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-black text-lg shadow-lg",
                        getAvatarColor(user.name)
                    )}>
                        {initials}
                    </div>
                    {/* Online indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-md" />
                </motion.div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-black text-lg text-slate-900 truncate">{user.name}</h3>
                    <p className="text-xs text-slate-500 font-medium truncate flex items-center gap-1.5">
                        {user.email}
                        {isTyping && (
                            <span className="flex gap-0.5 ml-2">
                                <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </span>
                        )}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                    >
                        <ImageIcon size={18} strokeWidth={2} />
                    </motion.button>
                </div>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin relative z-10">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center h-full gap-4">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-blue-600/30"
                        >
                            <AlertCircle size={36} className="text-white" strokeWidth={2} />
                        </motion.div>
                        <div>
                            <h4 className="font-black text-slate-900 text-lg mb-1">Sin mensajes aún</h4>
                            <p className="text-sm text-slate-500 max-w-xs">Envía el primer mensaje para iniciar la conversación.</p>
                        </div>
                    </div>
                ) : (
                    <AnimatePresence>
                        {messages.map((msg, index) => {
                            const isMsgFromAdmin = msg.is_admin_reply;
                            const isMe = isMsgFromAdmin === isAdminView;

                            const showDate = index === 0 ||
                                new Date(msg.created_at).toDateString() !== new Date(messages[index - 1].created_at).toDateString();

                            return (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    {showDate && (
                                        <div className="flex justify-center mb-8">
                                            <span className="text-[11px] font-extrabold text-slate-500 bg-white px-4 py-2 rounded-full uppercase tracking-wider shadow-sm border border-slate-200/60">
                                                {format(new Date(msg.created_at), "d 'de' MMMM", { locale: es })}
                                            </span>
                                        </div>
                                    )}

                                    <div className={cn(
                                        "flex w-full mb-3",
                                        isMe ? "justify-end" : "justify-start"
                                    )}>
                                        <div className={cn(
                                            "max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-lg relative group transition-all duration-300 hover:shadow-xl",
                                            isMe
                                                ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-md"
                                                : "bg-white border border-slate-200/80 text-slate-700 rounded-tl-md backdrop-blur-sm"
                                        )}>
                                            {!isMe && (
                                                <div className="text-[11px] font-extrabold text-slate-500 mb-2 flex items-center gap-1.5">
                                                    <User size={11} strokeWidth={3} /> {isMsgFromAdmin ? 'Soporte Éter' : msg.name}
                                                </div>
                                            )}

                                            <div className="text-sm whitespace-pre-wrap leading-relaxed font-medium">
                                                {msg.message}
                                            </div>

                                            <div className={cn(
                                                "text-[10px] mt-3 flex items-center gap-1.5 font-bold",
                                                isMe ? "text-blue-200 justify-end" : "text-slate-400"
                                            )}>
                                                {format(new Date(msg.created_at), "HH:mm")}
                                                {isMe && <CheckCheck size={13} strokeWidth={2.5} />}
                                            </div>

                                            {/* Message tail */}
                                            <div className={cn(
                                                "absolute top-0 w-4 h-4",
                                                isMe
                                                    ? "right-0 translate-x-2 bg-gradient-to-br from-blue-600 to-blue-700"
                                                    : "left-0 -translate-x-2 bg-white border-l border-t border-slate-200/80",
                                                "rotate-45"
                                            )} style={{ borderRadius: isMe ? '0 4px 0 0' : '4px 0 0 0' }} />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}</AnimatePresence>
                )}
            </div>

            {/* Composer */}
            <div className="relative z-10 p-5 bg-white/90 backdrop-blur-xl border-t border-slate-200/60 shadow-lg">
                <div className="relative flex flex-col gap-3">
                    {/* Toolbar */}
                    <div className="flex items-center gap-2 px-1">
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                            title="Emoji"
                        >
                            <Smile size={18} strokeWidth={2} />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                            title="Adjuntar"
                        >
                            <Paperclip size={18} strokeWidth={2} />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Voz"
                        >
                            <Mic size={18} strokeWidth={2} />
                        </motion.button>
                        <div className="flex-1" />
                        <span className="text-xs text-slate-400 font-medium">
                            {replyText.length} / 1000
                        </span>
                    </div>

                    {/* Input Area */}
                    <div className="relative">
                        <Textarea
                            ref={textareaRef}
                            value={replyText}
                            onChange={(e) => {
                                setReplyText(e.target.value);
                                setIsTyping(true);
                                setTimeout(() => setIsTyping(false), 1000);
                            }}
                            placeholder="Escribe tu mensaje..."
                            maxLength={1000}
                            className="min-h-[80px] max-h-[200px] resize-none pr-14 bg-slate-50/80 border-slate-200 focus:ring-blue-500/30 focus:border-blue-500/50 rounded-2xl font-medium text-sm placeholder:text-slate-400 transition-all shadow-sm focus:shadow-md"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />

                        {/* Send Button - Floating */}
                        <motion.div
                            className="absolute bottom-3 right-3"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                onClick={handleSend}
                                disabled={!replyText.trim() || isSending}
                                size="icon"
                                className={cn(
                                    "w-10 h-10 rounded-xl transition-all duration-300 shadow-lg",
                                    replyText.trim()
                                        ? "bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-600/30"
                                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                )}
                            >
                                {isSending ? (
                                    <Loader2 className="animate-spin" size={18} strokeWidth={2.5} />
                                ) : (
                                    <Send size={18} strokeWidth={2.5} />
                                )}
                            </Button>
                        </motion.div>
                    </div>

                    {/* Helper Text */}
                    <div className="flex items-center justify-between px-2">
                        <p className="text-xs text-slate-500 font-medium">
                            <kbd className="font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[10px]">Shift</kbd>
                            {' + '}
                            <kbd className="font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[10px]">Enter</kbd>
                            {' '}para nueva línea
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
