'use client';

import { useState } from 'react';
import { ConversationList } from './ConversationList';
import { MessageThread } from './MessageThread';
import { Conversation } from '@/types/messaging';
import { MessageSquare } from 'lucide-react';

export function MessagesLayout() {
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

    return (
        <div className="flex h-[calc(100vh-theme(spacing.24))] bg-black/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl">
            <ConversationList
                onSelect={setSelectedConversation}
                selectedId={selectedConversation?.id}
            />

            <div className="flex-1 flex flex-col bg-black/30">
                {selectedConversation ? (
                    <MessageThread conversation={selectedConversation} />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare size={32} className="opacity-50" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Mensajería Segura</h3>
                        <p className="max-w-xs text-center text-sm">
                            Selecciona una conversación para ver el historial y enviar mensajes en tiempo real.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
