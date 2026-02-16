import { describe, it, expect } from 'vitest';
import { groupMessages } from '../utils/message-utils';
import { Message } from '@/types';
import { Profile } from '@/types/profiles';

// Mock data
const mockMessages: Message[] = [
    {
        id: '1',
        sender_id: 'user1',
        receiver_id: 'admin',
        message: 'Hello',
        created_at: '2023-01-01T10:00:00Z',
        is_admin_reply: false,
        status: 'unread',
        name: 'User One',
        email: 'user1@example.com',
        subject: 'General Inquiry'
    },
    {
        id: '2',
        sender_id: 'admin',
        receiver_id: 'user1',
        message: 'Hi there',
        created_at: '2023-01-01T10:05:00Z',
        is_admin_reply: true,
        status: 'read',
        name: 'Admin',
        email: 'admin@example.com',
        subject: 'Re: General Inquiry'
    },
    {
        id: '3',
        sender_id: 'user2',
        receiver_id: 'admin',
        message: 'Help',
        created_at: '2023-01-02T10:00:00Z',
        is_admin_reply: false,
        status: 'unread',
        name: 'User Two',
        email: 'user2@example.com',
        subject: 'Help Needed'
    }
];

const mockProfiles: Profile[] = [
    {
        id: 'user1',
        full_name: 'User One Profile',
        email: 'user1@example.com',
        role: 'user',
        created_at: '2023-01-01T00:00:00Z'
    } as unknown as Profile
];

describe('groupMessages', () => {
    it('should group messages by user and sort by last message date', () => {
        const threads = groupMessages({
            messages: mockMessages,
            profiles: mockProfiles,
            tNewMessage: 'New Message',
            tRoleUser: 'User'
        });

        // Expect 2 threads: user1 and user2
        expect(threads).toHaveLength(2);

        // Sort order: user2 (Jan 2) should be first, user1 (Jan 1) second
        expect(threads[0].userId).toBe('user2');
        expect(threads[1].userId).toBe('user1');

        // Check user1 thread details
        const thread1 = threads[1];
        expect(thread1.messages).toHaveLength(2); // Hello, Hi there
        expect(thread1.lastMessage.message).toBe('Hi there'); // Latest message
        expect(thread1.name).toBe('User One Profile'); // From profile
        expect(thread1.unreadCount).toBe(1); // One unread message from user
    });

    it('should handle anonymous users (no profile, no sender_id)', () => {
        const anonMsg: Message = {
            id: '4',
            sender_id: undefined,
            email: 'anon@example.com',
            message: 'Anon',
            created_at: '2023-01-03T10:00:00Z',
            is_admin_reply: false,
            status: 'unread',
            name: 'Anonymous',
            subject: 'Unknown'
        };

        const threads = groupMessages({
            messages: [anonMsg],
            profiles: [],
            tNewMessage: 'New Message',
            tRoleUser: 'User'
        });

        expect(threads).toHaveLength(1);
        expect(threads[0].email).toBe('anon@example.com');
        // thread key should be email
    });
});
