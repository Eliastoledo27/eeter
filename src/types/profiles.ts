// Types for user profiles and role management

export type UserRole = 'admin' | 'support' | 'reseller' | 'user';

export interface Profile {
    id: string;
    full_name: string | null;
    email: string | null;
    role: UserRole;
    reseller_slug: string | null;
    whatsapp_number: string | null;
    commission_rate: number;
    is_premium: boolean;
    points: number;
    streak_days: number;
    last_activity: string | null;
    avatar_url: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface ProfileUpdateData {
    full_name?: string;
    whatsapp_number?: string;
    reseller_slug?: string;
    avatar_url?: string;
}

export interface AdminProfileUpdateData extends ProfileUpdateData {
    role?: UserRole;
    commission_rate?: number;
    is_premium?: boolean;
}

export interface ResellerStats {
    total_orders: number;
    total_revenue: number;
    total_profit: number;
    active_customers: number;
    conversion_rate: number;
}
