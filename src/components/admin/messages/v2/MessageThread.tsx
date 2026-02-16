'use client';

import { useEffect, useRef, useState, useOptimistic } from 'react';
import { createClient } from '@/utils/supabase/client';
import { MessageV2, Conversation } from '@/types/messaging';
import { getMessages, sendMessage, markAsRead } from '@/app/actions/messaging-v2';
import { Send, Image as ImageIcon, Check, CheckCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/auth-store';

interface MessageThreadProps {
    conversation: Conversation;
}

export function MessageThread({ conversation }: MessageThreadProps) {
    const { user } = useAuthStore();
    const [messages, setMessages] = useState<MessageV2[]>([]);
    const [loading, setLoading] = useState(true);
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    // Optimistic UI for sending
    const [optimisticMessages, addOptimisticMessage] = useOptimistic(
        messages,
        (state, newMessage: MessageV2) => [...state, newMessage]
    );

    useEffect(() => {
        const fetchMessages = async () => {
            setLoading(true);
            const { data } = await getMessages(conversation.id);
            if (data) setMessages(data);
            setLoading(false);
            markAsRead(conversation.id);
        };

        fetchMessages();

        // Subscribe to new messages
        const channel = supabase
            .channel(`thread-${conversation.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `conversation_id=eq.${conversation.id}`
            }, (payload) => {
                const newMsg = payload.new as MessageV2;
                setMessages((prev) => [...prev, newMsg]);
                if (newMsg.sender_id !== user?.id) {
                    markAsRead(conversation.id);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversation.id, supabase, user?.id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [optimisticMessages, loading]);

    const handleSend = async () => {
        if (!inputText.trim() || sending) return;

        const tempId = crypto.randomUUID();
        const optimisticMsg: MessageV2 = {
            id: tempId,
            conversation_id: conversation.id,
            sender_id: user?.id || '',
            content: inputText,
            created_at: new Date().toISOString(),
            type: 'text',
            metadata: {},
        };

        addOptimisticMessage(optimisticMsg);
        setInputText('');
        setSending(true);

        try {
            await sendMessage(conversation.id, optimisticMsg.content);
            // Real message comes via subscription or we could update state here
        } catch (error) {
            console.error('Failed to send message:', error);
            // Handle error (maybe toast or revert optimistic update locally)
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-black/40">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-3">
                    {(() => {
                        // Logic to find display participant
                        let displayParticipant = conversation.participants?.find((p: any) => p.email !== user?.email);
                        let displayName = displayParticipant?.full_name || displayParticipant?.email || 'Usuario';
                        let avatarUrl = displayParticipant?.avatar_url;
                        let fallbackInitials = displayParticipant?.email?.[0].toUpperCase() || '?';

                        if (!displayParticipant && conversation.participants?.length === 1) {
                            displayName = "Soporte Éter";
                            fallbackInitials = "S";
                        }

                        return (
                            <>
                                <Avatar className="h-10 w-10 border border-white/10">
                                    <AvatarImage src={avatarUrl || ''} />
                                    <AvatarFallback className="bg-primary/20 text-primary font-bold">
                                        {fallbackInitials}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-bold text-white text-sm">
                                        {displayName}
                                    </h3>
                                    <span className="text-xs text-green-400 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        En línea
                                    </span>
                                </div>
                            </>
                        );
                    })()}
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
            >
                {loading ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="animate-spin text-primary" />
                    </div>
                ) : (
                    optimisticMessages.map((msg) => {
                        const isMe = msg.sender_id === user?.id;
                        return (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex max-w-[80%]",
                                    isMe ? "ml-auto justify-end" : "mr-auto justify-start"
                                )}
                            >
                                <div
                                    className={cn(
                                        "rounded-2xl px-4 py-2 text-sm shadow-sm relative group",
                                        isMe
                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                            : "bg-white/10 text-white rounded-tl-none"
                                    )}
                                >
                                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                    <div className={cn(
                                        "text-[10px] mt-1 flex items-center justify-end gap-1 opacity-70",
                                        isMe ? "text-primary-foreground/80" : "text-gray-400"
                                    )}>
                                        {format(new Date(msg.created_at), 'HH:mm')}
                                        {isMe && (
                                            msg.id.length < 30 ? ( // Hacky check for real vs optimistic (uuid vs long string) doesn't apply here effectively
                                                msg.read_at ? <CheckCheck size={12} className="text-blue-200" /> :
                                                    msg.delivered_at ? <CheckCheck size={12} /> :
                                                        <Check size={12} />
                                            ) : <Loader2 size={10} className="animate-spin" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-black/20">
                <div className="flex items-end gap-2 bg-black/40 border border-white/10 rounded-xl p-2 focus-within:border-primary/50 transition-colors">
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                        <ImageIcon size={20} />
                    </button>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 bg-transparent border-none focus:outline-none text-white text-sm resize-none max-h-32 py-2"
                        rows={1}
                        style={{ minHeight: '40px' }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputText.trim() || sending}
                        className="p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
