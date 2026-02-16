'use client';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield } from 'lucide-react';

export function UserProfile() {
    const { user } = useAuth();
    const t = useTranslations('dashboard');

    if (!user) return null;

    const initials = user.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
        : user.email?.substring(0, 2).toUpperCase();

    const roleKey = user.role || 'user';

    return (
        <div className="bg-black/40 backdrop-blur-md border border-primary/30 shadow-[0_4px_30px_rgba(0,0,0,0.5)] rounded-xl p-6 flex items-center gap-6 h-full">
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <Avatar className="h-20 w-20 border-2 border-black relative">
                    <AvatarImage src={user.avatar_url || ''} alt={user.name || 'User'} />
                    <AvatarFallback className="bg-zinc-800 text-yellow-500 font-bold text-xl">
                        {initials}
                    </AvatarFallback>
                </Avatar>
            </div>

            <div className="flex flex-col">
                <h3 className="text-xl font-bold text-white font-heading">
                    {user.name || user.email}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                    <Shield size={14} className="text-primary" />
                    <span className="text-sm text-primary uppercase font-mono tracking-wider">
                        {t(`role.${roleKey}`, { fallback: roleKey })}
                    </span>
                </div>
                <div className="mt-2 text-xs text-gray-400 font-mono bg-white/5 py-1 px-2 rounded w-fit">
                    ID: {user.id.substring(0, 8)}...
                </div>
            </div>
        </div>
    );
}
