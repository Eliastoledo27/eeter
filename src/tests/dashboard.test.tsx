import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UserProfile } from '@/components/dashboard/widgets/UserProfile';
import { NextIntlClientProvider } from 'next-intl';

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => ({
        user: { name: 'Test User', email: 'test@example.com', role: 'admin', id: '123' },
    })
}));

// Mock Lucide icons to avoid render issues in tests if any (usually fine)

const messages = {
    dashboard: {
        role: { admin: 'Administrator', user: 'User' }
    }
};

describe('UserProfile Widget', () => {
    it('renders user name correctly', () => {
        render(
            <NextIntlClientProvider locale="en" messages={messages}>
                <UserProfile />
            </NextIntlClientProvider>
        );
        expect(screen.getByText('Test User')).toBeDefined();
    });

    it('renders role correctly', () => {
        render(
            <NextIntlClientProvider locale="en" messages={messages}>
                <UserProfile />
            </NextIntlClientProvider>
        );
        // Role key "admin" maps to "Administrator"
        expect(screen.getByText('Administrator')).toBeDefined();
    });
});
