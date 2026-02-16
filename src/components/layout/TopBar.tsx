import { ChevronLeft, ChevronRight, Menu, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NotificationBell } from './NotificationBell';
import { usePermissions } from '@/hooks/usePermissions';
import { cn } from '@/lib/utils';

interface TopBarProps {
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  mobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export function TopBar({
  isSidebarCollapsed = false,
  onToggleSidebar,
  mobileMenuOpen = false,
  onToggleMobileMenu
}: TopBarProps) {
  const [time, setTime] = useState('');
  const { can } = usePermissions();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className={cn(
      "h-16 border-b border-white/10 flex items-center justify-between px-4 md:px-8 bg-black/20 backdrop-blur-md z-40 bg-hud-black/80 fixed top-0 transition-all duration-300 ease-in-out",
      "w-full",
      isSidebarCollapsed ? "md:w-[calc(100%-70px)] md:left-[70px]" : "md:w-[calc(100%-180px)] md:left-[180px]"
    )}>
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button
          onClick={onToggleMobileMenu}
          className="p-2 -ml-2 text-gray-400 hover:text-white md:hidden"
        >
          <Menu size={20} />
        </button>

        {/* Desktop sidebar toggle */}
        <button
          onClick={onToggleSidebar}
          className="hidden md:flex items-center justify-center w-8 h-8 rounded border border-white/10 hover:border-primary/50 text-gray-400 hover:text-primary transition-colors bg-white/5"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-primary rounded-sm animate-pulse"></div>
          <span className="font-mono text-[10px] tracking-[0.2em] text-gray-400 hidden sm:inline uppercase">
            SYSTEM // {isSidebarCollapsed ? 'MIN' : 'ETHER_CORE'}
          </span>
        </div>
      </div>

      <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
        <div className="bg-black/50 border border-primary/20 rounded px-4 py-1 shadow-[0_0_15px_rgba(200,138,4,0.15)]">
          <span className="font-mono text-xl text-white font-light tracking-widest text-shadow-glow">
            {time || '00:00:00'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="hidden xs:block">
          <LanguageSwitcher />
        </div>

        {/* Search — desktop only */}
        <div className="relative group hidden lg:block">
          <input
            className="bg-black/40 text-xs w-48 xl:w-64 pl-4 pr-10 py-2 rounded border border-primary/30 focus:border-primary focus:ring-0 text-white placeholder-gray-600 font-mono tracking-wide transition-all outline-none"
            placeholder="SEARCH..."
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

