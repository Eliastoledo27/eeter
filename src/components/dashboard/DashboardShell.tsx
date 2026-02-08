'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getProfile } from '@/app/actions/profiles';
import type { Profile } from '@/types/profiles';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  Search,
  Store,
  GraduationCap,
  UserCog
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { NotificationsPopover } from '@/components/notifications/NotificationsPopover';

interface DashboardShellProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', active: true },
  { label: 'Productos', icon: Package, href: '/dashboard/products', active: false },
  { label: 'Pedidos', icon: ShoppingCart, href: '/dashboard/orders', active: false },
  { label: 'Clientes', icon: Users, href: '/dashboard/customers', active: false },
  { label: 'Perfiles', icon: UserCog, href: '/dashboard?view=profiles', active: false },
  { label: 'Academia VIP', icon: GraduationCap, href: '/academy', active: false },
  { label: 'Configuración', icon: Settings, href: '/dashboard/settings', active: false },
];

export function DashboardShell({ children }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  // Load user profile from Supabase
  useEffect(() => {
    const loadProfile = async () => {
      if (user?.id) {
        const { data } = await getProfile(user.id);
        if (data) {
          setProfile(data);
        }
      }
    };
    loadProfile();
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E3A8A] font-sans selection:bg-[#F59E0B]/20">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 border-r border-[#E2E8F0] bg-white/80 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center px-6 border-b border-[#E2E8F0]">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-[#0F172A]">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E40AF] text-white">
                É
              </div>
              <span>ÉTER STORE</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  item.active
                    ? "bg-[#1E40AF]/10 text-[#1E40AF]"
                    : "text-[#475569] hover:bg-[#E2E8F0]/60 hover:text-[#0F172A]"
                )}
              >
                <item.icon size={20} className={item.active ? "text-[#1E40AF]" : "text-[#64748B] group-hover:text-[#0F172A]"} />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User & Logout */}
          <div className="border-t border-[#E2E8F0] p-4 space-y-2">
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start text-[#475569] hover:text-[#0F172A] gap-3">
                <Store size={20} /> Ver Tienda
              </Button>
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut size={20} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col lg:pl-64 min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E2E8F0] bg-white/70 px-4 backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-[#64748B] hover:text-[#0F172A] lg:hidden"
            >
              <Menu size={24} />
            </button>

            {/* Global Search (Command K trigger in future) */}
            <div className="relative hidden md:block w-64 lg:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar (Ctrl+K)..."
                className="w-full h-9 pl-9 pr-4 rounded-lg border border-[#E2E8F0] bg-white/80 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/30 focus:border-[#1E40AF]/40 placeholder:text-[#94A3B8] transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationsPopover className="text-[#64748B] hover:text-[#0F172A] hover:bg-transparent" />
            <div className="h-8 w-px bg-[#E2E8F0] mx-2 hidden md:block" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-[#0F172A]">
                  {profile?.full_name || user?.name || user?.email || 'Usuario'}
                </p>
                <p className="text-xs text-[#64748B] capitalize">
                  {profile?.role === 'admin' ? 'Administrador' :
                    profile?.role === 'support' ? 'Soporte' :
                      profile?.role === 'reseller' ? 'Revendedor' :
                        'Usuario'}
                </p>
              </div>
              <div className="h-9 w-9 rounded-full bg-[#1E40AF]/10 border border-[#1E40AF]/20 flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <Image src={profile.avatar_url} alt={profile.full_name || 'Avatar'} width={36} height={36} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#1E40AF] font-bold">
                    {profile?.full_name?.charAt(0) || user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
