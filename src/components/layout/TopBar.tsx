'use client';

import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NotificationBell } from './NotificationBell';
import { usePermissions } from '@/hooks/usePermissions';

export function TopBar() {
  const [time, setTime] = useState('');
  const { can } = usePermissions();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 border-b border-white/10 flex items-center justify-between px-4 md:px-8 bg-black/20 backdrop-blur-md z-40 bg-hud-black/80 fixed top-0 w-full md:w-[calc(100%-180px)] left-0 md:left-[180px]">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 bg-primary rounded-sm animate-pulse"></div>
        <span className="font-mono text-xs tracking-[0.2em] text-gray-400 hidden sm:inline">SYSTEM // ETER_CORE</span>
      </div>

      <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
        <div className="bg-black/50 border border-primary/20 rounded px-4 py-1 shadow-[0_0_15px_rgba(200,138,4,0.15)] inset-0">
          <span className="font-mono text-xl text-white font-light tracking-widest text-shadow-glow">
            {time || '00:00:00'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <LanguageSwitcher />

        {/* Search — desktop only */}
        <div className="relative group hidden lg:block">
          <input
            className="bg-black/40 text-xs w-64 pl-4 pr-10 py-2 rounded border border-primary/30 focus:border-primary focus:ring-0 text-white placeholder-gray-600 font-mono tracking-wide transition-all outline-none"
            placeholder="SEARCH DATABASE..."
            type="text"
          />
          <Search className="absolute right-3 top-2 text-primary/50" size={14} />
        </div>

        {/* Notification Bell — conditionally rendered */}
        {can('view_notifications') && (
          <NotificationBell />
        )}
      </div>
    </header>
  );
}
