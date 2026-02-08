'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, X, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth-store'
import { useUIStore } from '@/store/ui-store'
import { getModulesForRole, UserRole } from '@/config/roles'
import { useEffect } from 'react'

export function MobileSidebar() {
  const searchParams = useSearchParams()
  const { profile, signOut } = useAuthStore()
  const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore()
  
  const role = (profile?.role as UserRole) || 'user'
  const navItems = getModulesForRole(role) // Showing all items now

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [searchParams, setMobileMenuOpen])

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
          />
          
          {/* Sidebar Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="md:hidden fixed left-0 top-0 h-full w-72 bg-white border-r border-[#E2E8F0] z-50 flex flex-col shadow-[0_20px_60px_rgba(15,23,42,0.18)]"
          >
             {/* Background Noise/Gradient */}
             <div className="absolute inset-0 bg-noise opacity-[0.06] pointer-events-none" />
             
             {/* Header */}
             <div className="p-6 pb-4 flex justify-between items-center relative z-10">
                 <div>
                 <h1 className="text-2xl font-black tracking-tighter text-[#0F172A]">
                        ETER <span className="text-[#1E40AF]">STORE</span>
                    </h1>
                </div>
                <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-full hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#0F172A] transition-colors"
                 >
                    <X size={20} />
                 </button>
              </div>

             {/* User Profile Card */}
             {profile && (
                <div className="px-6 mb-6 relative z-10">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#3B82F6]/15 to-[#1E40AF]/10 flex items-center justify-center text-[#1E40AF] font-bold border border-[#3B82F6]/20">
                            {profile.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-bold text-[#0F172A] truncate">{profile.full_name}</span>
                            <span className="text-[10px] text-[#1E40AF] font-medium uppercase tracking-wider">{role}</span>
                        </div>
                    </div>
                </div>
              )}

             {/* Navigation */}
             <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar relative z-10">
                {navItems.map((item) => {
                     const isActive = item.id === 'dashboard' 
                        ? (!searchParams.get('view') || searchParams.get('view') === 'dashboard')
                        : searchParams.get('view') === item.id
                    
                    return (
                        <Link key={item.id} href={item.href}>
                            <div className={cn(
                                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden group",
                                isActive 
                                  ? "bg-[#1E40AF]/10 border border-[#1E40AF]/20" 
                                  : "hover:bg-[#F1F5F9] border border-transparent"
                            )}>
                                {/* Active Indicator */}
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1E40AF]" />
                                )}

                                <div className={cn(
                                    "relative z-10 p-2 rounded-lg transition-colors",
                                    isActive ? "bg-[#1E40AF] text-white" : "bg-white text-[#64748B] group-hover:text-[#1E40AF] group-hover:bg-[#EFF6FF] border border-[#E2E8F0]"
                                )}>
                                    <item.icon size={18} />
                                </div>
                                <span className={cn(
                                    "relative z-10 font-medium transition-colors", 
                                    isActive ? "text-[#0F172A] font-bold" : "text-[#64748B] group-hover:text-[#0F172A]"
                                )}>
                                    {item.label}
                                </span>
                                {isActive && <Sparkles size={16} className="ml-auto text-[#F59E0B] relative z-10" />}
                            </div>
                        </Link>
                    )
                })}
             </nav>

             {/* Footer */}
             <div className="p-4 mt-auto border-t border-[#E2E8F0] relative z-10 bg-white/70 backdrop-blur-xl">
                <button
                    onClick={() => signOut()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-all border border-red-500/20"
                >
                    <LogOut size={18} />
                    <span className="font-medium text-sm">Cerrar Sesión</span>
                </button>
                <p className="text-center text-[10px] text-[#94A3B8] mt-4">
                    &copy; 2024 Eter Store Inc.
                </p>
              </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
