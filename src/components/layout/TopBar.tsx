'use client';

import Link from 'next/link';
import { Search, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationsPopover } from '@/components/notifications/NotificationsPopover';

export function TopBar() {
  const { profile, signOut } = useAuthStore();
  const { toggleMobileMenu } = useUIStore();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#E2E8F0] bg-white/80 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        {/* Mobile Brand Icon - "É" */}
        <div className="md:hidden flex items-center justify-center -mr-2">
            <div className="relative flex items-center justify-center h-8 w-8 rounded-lg bg-white border border-[#E2E8F0] shadow-[0_8px_20px_rgba(15,23,42,0.12)] overflow-hidden group hover:border-[#3B82F6]/40 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/10 to-transparent opacity-60" />
                <span className="relative text-lg font-black text-[#1E40AF] pt-0.5">É</span>
            </div>
        </div>

        {/* Mobile Menu Trigger - Hidden on desktop since Sidebar is permanent */}
        <Button variant="ghost" size="icon" className="md:hidden text-[#64748B]" onClick={toggleMobileMenu}>
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search Bar */}
        <div className="relative hidden md:block w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Buscar productos, pedidos..."
            className="w-full h-9 pl-9 pr-4 rounded-full border border-[#E2E8F0] bg-white/80 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/40 focus:border-[#3B82F6]/40 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <NotificationsPopover />

        <div className="h-6 w-px bg-[#E2E8F0] hidden md:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-[#E2E8F0] hover:ring-[#3B82F6]/30 p-0 overflow-hidden">
              <Avatar className="h-9 w-9">
                <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
                <AvatarFallback className="bg-[#1E40AF]/10 text-[#1E40AF] font-bold">
                  {profile?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white border-[#E2E8F0] text-[#0F172A]" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-[#0F172A]">{profile?.full_name}</p>
                <p className="text-xs leading-none text-[#64748B]">{profile?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#E2E8F0]" />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="w-full cursor-pointer focus:bg-[#F1F5F9] focus:text-[#0F172A]">
                Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="w-full cursor-pointer focus:bg-[#F1F5F9] focus:text-[#0F172A]">
                Configuración
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#E2E8F0]" />
            <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-500/10 cursor-pointer" onClick={() => signOut()}>
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
