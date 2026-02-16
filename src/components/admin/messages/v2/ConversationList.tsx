'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Conversation } from '@/types/messaging';
import { createConversation, getConversations } from '@/app/actions/messaging-v2';
import { Search, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuthStore } from '@/store/auth-store';

interface ConversationListProps {
    onSelect: (conversation: Conversation) => void;
    selectedId?: string;
}

export function ConversationList({ onSelect, selectedId }: ConversationListProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const supabase = createClient();
    const { user } = useAuthStore(); // Get user from store

    const userEmail = user?.email; // Get email for filtering

    const handleCreateConversation = async () => {
        // Find if we already have an empty conversation (just me)
        const existing = conversations.find(c => c.participants && c.participants.length === 1 && c.participants[0].email === userEmail);
        if (existing) {
            onSelect(existing);
            return;
        }

        setLoading(true);
        // Create conversation with just me (Admins will see it)
        const res = await createConversation([]);
        if (res.data) {
            // Fetch again to get full object or just add partially
            // Ideally we re-fetch.
            const data = await getConversations();
            if (data) setConversations(data);

            // Auto select the new one
            const newConv = data?.find((c: any) => c.id === res.data.id);
            if (newConv) onSelect(newConv);
        }
        setLoading(false);
    };

    useEffect(() => {
        const fetchConversations = async () => {
            const data = await getConversations();
            if (data) setConversations(data);
            setLoading(false);
        };

        fetchConversations();

        // Subscribe to new conversations
        const channel = supabase
            .channel('conversations-list')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
                fetchConversations(); // Refresh list on change
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const filtered = conversations.filter(c => {
        const participants = c.participants?.map(p => p.full_name || p.email).join(' ').toLowerCase() || '';
        return participants.includes(search.toLowerCase());
    });

    return (
        <div className="flex flex-col h-full border-r border-white/10 w-80 bg-black/20">
            <div className="p-4 border-b border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">Mensajes</h2>
                    <button
                        onClick={handleCreateConversation}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Contactar Soporte"
                    >
                        <Plus size={20} className="text-primary" />
                    </button>
                </div>
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 placeholder:text-gray-600"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="p-4 text-center text-gray-500 text-sm">Cargando conversaciones...</div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500 text-sm">
                        <p className="mb-4">No hay conversaciones</p>
                        <button
                            onClick={handleCreateConversation}
                            className="bg-primary hover:bg-primary/90 text-black font-bold py-2 px-4 rounded text-xs transition-colors"
                        >
                            Contactar Soporte
                        </button>
                    </div>
                ) : (
                    filtered.map((conv) => {
                        // Logic: If I am the only participant, display "Soporte (Esperando)"
                        // If there are others, display the other person.
                        let displayParticipant = conv.participants?.find((p: any) => p.email !== userEmail);
                        let displayName = displayParticipant?.full_name || displayParticipant?.email || 'Usuario';
                        let avatarUrl = displayParticipant?.avatar_url;
                        let fallbackInitials = displayParticipant?.email?.[0].toUpperCase() || '?';

                        if (!displayParticipant && conv.participants?.length === 1) {
                            // Only me in the conversation -> I'm waiting for support
                            displayName = "Soporte Éter";
                            fallbackInitials = "S";
                            // Only show "Soporte" if I am NOT admin (Admins seeing a 1-person chat should see the User, not "Soporte")
                            // Check if I am admin? We don't have role here easily unless we fetch it.
                            // But usually Admins don't use this "Contact Support" flow for themselves in this context.
                            // However, if an ADMIN looks at this conversation, 'userEmail' is Admin's email.
                            // The participant IS the User. So 'displayParticipant' (p.email !== adminEmail) WILL find the User.
                            // So this block only executes if I AM the sole participant.
                            // Which means I created it. So showing "Soporte" to ME is correct.
                        }

                        const isActive = selectedId === conv.id;

                        return (
                            <button
                                key={conv.id}
                                onClick={() => onSelect(conv)}
                                className={cn(
                                    "w-full p-4 flex items-start gap-3 hover:bg-white/5 transition-colors text-left border-b border-white/5",
                                    isActive && "bg-primary/10 border-l-2 border-l-primary"
                                )}
                            >
                                <Avatar className="w-10 h-10 border border-white/10">
                                    <AvatarImage src={avatarUrl || ''} />
                                    <AvatarFallback className="bg-primary/20 text-primary font-bold">
                                        {fallbackInitials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-semibold text-white truncate text-sm">
                                            {displayName}
                                        </span>
                                        {conv.last_message_at && (
                                            <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">
                                                {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true, locale: es })}
                                            </span>
                                        )}
                                    </div>
                                    <p className={cn(
                                        "text-xs truncate",
                                        isActive ? "text-primary/80" : "text-gray-400"
                                    )}>
                                        {conv.last_message?.content || 'Nueva conversación'}
                                    </p>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}

