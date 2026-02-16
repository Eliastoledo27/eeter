'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { usePermissions } from '@/hooks/usePermissions'
import { useTranslations } from 'next-intl'
import { getModulesForRole } from '@/config/roles'

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { role } = usePermissions()
  const t = useTranslations('nav')
  const tDashboard = useTranslations('dashboard')

  // Get role-filtered nav modules
  const modules = getModulesForRole(role)

  // Map role to display label
  const roleLabels: Record<string, string> = {
    admin: tDashboard('role.admin'),
    support: 'SOPORTE',
    reseller: 'REVENDEDOR',
    user: 'USUARIO',
  }

  // Role badge colors
  const roleColors: Record<string, string> = {
    admin: 'text-[#C88A04]',
    support: 'text-blue-400',
    reseller: 'text-emerald-400',
    user: 'text-gray-400',
  }

  return (
    <aside className="w-[180px] h-full fixed left-0 top-0 border-r border-white/5 flex flex-col justify-between bg-black/40 backdrop-blur-sm z-50">
      {/* Logo Area */}
      <div className="p-6 flex justify-center">
        <Link href="/dashboard">
          <div className="w-12 h-12 bg-transparent border border-primary flex items-center justify-center relative shadow-[0_0_15px_rgba(200,138,4,0.15)] rounded-lg group cursor-pointer hover:bg-primary/10 transition-colors">
            <span className="text-3xl font-bold text-primary group-hover:text-shadow transition-all font-heading">É</span>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          </div>
        </Link>
      </div>

      {/* Navigation — filtered by role */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
        {modules.map((module) => {
          const isActive = pathname === module.href ||
            (module.href !== '/dashboard' && pathname.startsWith(module.href))
          const Icon = module.icon
          return (
            <Link
              key={module.id}
              href={module.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-all group relative",
                isActive
                  ? "bg-primary/10 border border-primary/30 text-primary"
                  : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
              )}
            >
              <Icon size={20} className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-semibold tracking-wider font-mono uppercase">{module.label}</span>
              {module.id === 'messages' && (
                <span className="absolute right-2 top-3 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Profile / Logout */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 group">

          <Link href="/dashboard/profile" className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-black border border-primary/50 overflow-hidden relative flex-shrink-0">
              <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-[10px] text-white heading-font">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className={cn("text-[10px] font-bold tracking-wide truncate", roleColors[role] || 'text-gray-400')}>
                {roleLabels[role] || 'USUARIO'}
              </span>
              <span className="text-[9px] text-primary font-mono">ONLINE</span>
            </div>
          </Link>

          <button onClick={() => logout()} className="text-gray-500 hover:text-white transition-colors p-1" title={t('logout')}>
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
