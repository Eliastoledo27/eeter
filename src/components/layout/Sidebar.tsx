'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogOut, ChevronRight, Sparkles, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth-store'
import { useUIStore } from '@/store/ui-store'
import { getModulesForRole, UserRole } from '@/config/roles'

export function Sidebar() {
  const searchParams = useSearchParams()
  const { signOut, profile } = useAuthStore()
  const { isSidebarCollapsed, toggleSidebar } = useUIStore()
  
  const role = (profile?.role as UserRole) || 'user'
  const navItems = getModulesForRole(role)

  return (
    <aside 
      className={cn(
        "hidden md:flex flex-col h-screen fixed left-0 top-0 border-r border-[#E2E8F0] bg-white/80 backdrop-blur-2xl z-50 shadow-[0_20px_60px_rgba(15,23,42,0.12)] transition-all duration-300",
        isSidebarCollapsed ? "w-20" : "w-72"
      )}
    >
      <div className="absolute inset-0 bg-noise opacity-[0.06] pointer-events-none" />
      
      {/* Header Logo */}
      <div className={cn(
          "relative overflow-hidden transition-all duration-300 flex items-center",
          isSidebarCollapsed ? "p-4 justify-center" : "p-8 pb-6"
      )}>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#3B82F6]/10 to-transparent opacity-60 pointer-events-none" />
        
        {!isSidebarCollapsed ? (
             <div className="relative z-10 w-full">
                <div className="flex justify-between items-start">
                    <h1 className="text-3xl font-black tracking-tighter text-[#0F172A]">
                    ETER <span className="text-[#1E40AF]">STORE</span>
                    </h1>
                    <button 
                        onClick={toggleSidebar}
                        className="text-[#94A3B8] hover:text-[#0F172A] transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                </div>
                {profile?.role && (
                <div className="flex items-center gap-2 mt-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse motion-reduce:animate-none shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                    <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-[0.2em]">
                    {profile.role} ACCESS
                    </span>
                </div>
                )}
            </div>
        ) : (
            <div className="flex flex-col items-center gap-4">
                <h1 className="text-xl font-black text-[#1E40AF]">E</h1>
                <button 
                    onClick={toggleSidebar}
                    className="text-[#94A3B8] hover:text-[#0F172A] transition-colors"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-3 mt-4 overflow-y-auto custom-scrollbar relative z-10">
        {navItems.map((item) => {
          const isActive = item.id === 'dashboard' 
            ? (!searchParams.get('view') || searchParams.get('view') === 'dashboard')
            : searchParams.get('view') === item.id

          return (
            <Link key={item.id} href={item.href}>
              <div className="relative group perspective-1000">
                <motion.div
                  className={cn(
                    "relative flex items-center rounded-2xl transition-all duration-500 overflow-hidden",
                    isSidebarCollapsed ? "justify-center p-3" : "gap-4 px-4 py-4",
                    isActive 
                      ? "bg-[#1E40AF]/10 border border-[#1E40AF]/20 shadow-[0_10px_30px_rgba(30,64,175,0.15)]" 
                      : "hover:bg-[#F1F5F9] border border-transparent hover:border-[#E2E8F0]"
                  )}
                  whileHover={{ x: isSidebarCollapsed ? 0 : 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Active Indicator Line */}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-indicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#1E40AF] to-[#3B82F6] shadow-[0_0_12px_rgba(59,130,246,0.6)]"
                    />
                  )}

                  {/* Icon Container */}
                  <div className={cn(
                    "relative z-10 rounded-xl transition-all duration-500 flex items-center justify-center",
                    isSidebarCollapsed ? "p-2" : "p-2.5",
                    isActive 
                      ? "bg-[#1E40AF] text-white shadow-[0_10px_20px_rgba(30,64,175,0.35)] rotate-3" 
                      : "bg-white text-[#64748B] group-hover:text-[#1E40AF] group-hover:bg-[#EFF6FF] group-hover:-rotate-3 border border-[#E2E8F0]"
                  )}>
                    <item.icon size={isSidebarCollapsed ? 24 : 20} strokeWidth={isActive ? 2.5 : 2} />
                  </div>

                  {/* Text Content */}
                  {!isSidebarCollapsed && (
                      <div className="flex-1 relative z-10">
                        <span className={cn(
                          "block text-sm transition-all duration-300",
                          isActive 
                            ? "font-bold text-[#0F172A] tracking-wide" 
                            : "font-medium text-[#64748B] group-hover:text-[#0F172A]"
                        )}>
                          {item.label}
                        </span>
                        {isActive && (
                          <span className="text-[10px] text-[#F59E0B] font-medium animate-pulse motion-reduce:animate-none">
                            Activo ahora
                          </span>
                        )}
                      </div>
                  )}

                  {/* Right Chevron / Sparkle */}
                  {!isSidebarCollapsed && (
                    <div className={cn(
                        "text-[#94A3B8] transition-all duration-300 transform",
                        isActive ? "text-[#F59E0B] translate-x-0 opacity-100" : "opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0"
                    )}>
                        {isActive ? <Sparkles size={16} /> : <ChevronRight size={16} />}
                    </div>
                  )}

                  {/* Background Glow Effect on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#1E40AF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </motion.div>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 mt-auto">
        <button
          onClick={() => signOut()}
          className="group w-full relative overflow-hidden rounded-2xl p-[1px]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/40 to-amber-500/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className={cn(
              "relative bg-white group-hover:bg-white/90 rounded-2xl flex items-center transition-all border border-[#E2E8F0]",
              isSidebarCollapsed ? "justify-center p-3" : "px-4 py-4 gap-3"
          )}>
            <div className="p-2 rounded-lg bg-white text-[#64748B] group-hover:text-red-500 group-hover:bg-red-500/10 transition-colors border border-[#E2E8F0]">
               <LogOut size={18} />
            </div>
            {!isSidebarCollapsed && (
                <div className="flex flex-col items-start">
                <span className="text-sm font-bold text-[#0F172A] group-hover:text-[#0F172A] transition-colors">Cerrar Sesión</span>
                <span className="text-[10px] text-[#94A3B8] group-hover:text-red-500/80">Hasta pronto</span>
                </div>
            )}
          </div>
        </button>
        
        {!isSidebarCollapsed && (
            <p className="text-center text-[10px] text-[#94A3B8] mt-4 mb-2">
            &copy; 2024 Eter Store Inc.
            </p>
        )}
      </div>
    </aside>
  )
}
