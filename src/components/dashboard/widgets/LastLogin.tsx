'use client';
import { useAuthStore } from '@/store/auth-store';
import { useTranslations } from 'next-intl';
import { Clock, Monitor, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';

export function LastLogin() {
    const { user } = useAuthStore();
    const t = useTranslations('dashboard');
    const [deviceType, setDeviceType] = useState<'desktop' | 'mobile'>('desktop');

    // Simulate getting last login from metadata or session
    const lastSignIn = user?.last_sign_in_at ? new Date(user.last_sign_in_at) : new Date();

    useEffect(() => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        setDeviceType(isMobile ? 'mobile' : 'desktop');
    }, []);

    return (
        <div className="bg-black/40 backdrop-blur-md border border-white/10 shadow-lg rounded-xl p-6 h-full flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock size={20} className="text-primary" />
                </div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest font-mono">
                    {t('last_login', { date: '' }).replace(':', '')}
                </h3>
            </div>

            <div className="text-2xl font-mono text-white mt-1">
                {lastSignIn.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
            <div className="text-sm text-gray-500 font-mono mb-4">
                {lastSignIn.toLocaleTimeString()}
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 p-2 rounded border border-white/5 w-fit">
                {deviceType === 'desktop' ? <Monitor size={14} /> : <Smartphone size={14} />}
                <span className="uppercase font-mono tracking-wider">{deviceType} Session</span>
            </div>
        </div>
    );
}
