import { Message } from '@/types';
import { Profile } from '@/types/profiles';

interface GroupMessageDeps {
    messages: Message[];
    profiles: Profile[];
    tNewMessage: string;
    tRoleUser: string;
}

export interface Thread {
    userId: string;
    name: string;
    email: string;
    lastMessage: Message;
    unreadCount: number;
    messages: Message[];
}

const safeDate = (dateStr?: string) => {
    if (!dateStr) return new Date();
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
};

export const groupMessages = ({
    messages,
    profiles,
    tNewMessage,
    tRoleUser
}: GroupMessageDeps): Thread[] => {
    const threadMap = new Map<string, Thread>();

    try {
        messages.forEach(msg => {
            let threadKey = '';
            let threadName = '';
            let threadEmail = '';

            // If admin reply, the thread key is the receiver (the user)
            // If user message, thread key is sender
            if (msg.is_admin_reply) {
                threadKey = msg.receiver_id || 'unknown';
            } else {
                threadKey = msg.sender_id || 'anonymous';
                threadName = msg.name || 'Anónimo';
                threadEmail = msg.email || '';
            }

            // Fallback if threadKey is missing or anonymous
            if (threadKey === 'anonymous' || !threadKey) {
                threadKey = msg.email || `anon-${Math.random()}`;
            }

            if (!threadMap.has(threadKey)) {
                // Try to find profile details if threadKey is a valid UUID (likely a user ID)
                const userProfile = profiles.find(p => p.id === threadKey);

                threadMap.set(threadKey, {
                    userId: threadKey,
                    name: userProfile?.full_name || threadName || msg.name || tRoleUser,
                    email: userProfile?.email || threadEmail || msg.email || '',
                    lastMessage: msg,
                    unreadCount: 0,
                    messages: []
                });
            }

            const thread = threadMap.get(threadKey)!;
            thread.messages.push(msg);

            const msgDate = safeDate(msg.created_at);
            const lastMsgDate = safeDate(thread.lastMessage.created_at);

            // Update last message if this msg is newer
            if (msgDate > lastMsgDate) {
                thread.lastMessage = msg;
                // Update name only if it's from user and has valid name, AND no profile found
                const userProfile = profiles.find(p => p.id === threadKey);
                if (!userProfile && !msg.is_admin_reply && msg.name) {
                    thread.name = msg.name;
                    thread.email = msg.email || thread.email;
                }
            }

            // Count unread messages from user
            if (msg.status === 'unread' && !msg.is_admin_reply) {
                thread.unreadCount++;
            }
        });

        // Add threads for profiles that don't have messages yet
        profiles.forEach(profile => {
            if (!profile.id || threadMap.has(profile.id)) return;

            const fallbackMessage: Message = {
                id: `empty-${profile.id}`,
                sender_id: profile.id,
                receiver_id: undefined, // undefined or string? Message type check needed
                name: profile.full_name || profile.email || tRoleUser,
                email: profile.email || '',
                subject: tNewMessage,
                message: '',
                status: 'read',
                created_at: profile.created_at || new Date().toISOString(),
                is_admin_reply: true, // Mark as admin reply so it doesn't look like a user message? 
                // Actually logic says: if is_admin_reply, threadKey = receiver_id.
                // Here we want to start a thread with a user.
                // The component logic used: is_admin_reply: true
            };

            threadMap.set(profile.id, {
                userId: profile.id,
                name: profile.full_name || profile.email || tRoleUser,
                email: profile.email || '',
                lastMessage: fallbackMessage,
                unreadCount: 0,
                messages: [] // Start with empty messages array? 
                // Original logic didn't push fallbackMessage to messages array, 
                // but set it as lastMessage.
            });
        });
    } catch (e) {
        console.error("Error processing threads:", e);
        return [];
    }

    return Array.from(threadMap.values()).sort((a, b) =>
        safeDate(b.lastMessage.created_at).getTime() - safeDate(a.lastMessage.created_at).getTime()
    );
};
