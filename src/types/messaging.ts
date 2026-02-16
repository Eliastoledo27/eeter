/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Conversation {
    id: string;
    created_at: string;
    updated_at: string;
    status: 'active' | 'archived';
    last_message_at: string;
    metadata: Record<string, any>;
    participants?: Profile[]; // Joined
    unread_count?: number; // Computed
    last_message?: MessageV2; // Computed
}

export interface MessageV2 {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    created_at: string;
    type: 'text' | 'image' | 'system';
    metadata: Record<string, any>;
    read_at?: string;
    delivered_at?: string;
    sender?: Profile; // Joined
}

export interface AppSetting {
    key: string;
    value: any;
    category: 'general' | 'security' | 'notifications' | 'appearance' | 'billing';
    description?: string;
    is_public: boolean;
    updated_at: string;
    updated_by?: string;
}

export interface SettingsHistory {
    id: string;
    key: string;
    old_value: any;
    new_value: any;
    changed_by: string;
    changed_reason: string;
    created_at: string;
    changer?: Profile; // Joined
}

import type { Profile } from '@/types/profiles';
