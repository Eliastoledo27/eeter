'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { useAuthStore } from '@/store/auth-store'
import { toast } from 'sonner'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isInitialized, isAuthenticated, isLoading } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Show unauthorized toast if redirected
  useEffect(() => {
    if (searchParams.get('unauthorized') === 'true') {
      toast.error('No tienes permisos para acceder a esa sección')
      // Clean the URL param
      const url = new URL(window.location.href)
      url.searchParams.delete('unauthorized')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  // Redirect to login if not authenticated after initialization
  useEffect(() => {
    if (isInitialized && !isAuthenticated && !isLoading) {
      router.push('/login')
    }
  }, [isInitialized, isAuthenticated, isLoading, router])

  // Loading state: Only show full-screen loader if not initialized 
  // or if we are loading but not yet authenticated.
  // This prevents background token refreshes from interrupting the user.
  if (!isInitialized || (isLoading && !isAuthenticated)) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-transparent border border-[#C88A04] flex items-center justify-center rounded-lg">
            <span className="text-3xl font-bold text-[#C88A04] animate-pulse">É</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#C88A04] rounded-full animate-bounce [animation-delay:0ms]" />
            <div className="w-2 h-2 bg-[#C88A04] rounded-full animate-bounce [animation-delay:150ms]" />
            <div className="w-2 h-2 bg-[#C88A04] rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">
            Verificando sesión...
          </p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Initialize from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved === 'true') {
      setIsSidebarCollapsed(true)
    }
    setIsMounted(true)
  }, [])

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed
    setIsSidebarCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', String(newState))
  }

  // Prevent layout jump by not rendering until mounted if we depend on localStorage
  // Or handle it with a default class

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0A0A0A] font-sans text-white selection:bg-[#c88a04]/20 overflow-x-hidden">

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-[45] md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — fixed on desktop, sliding drawer on mobile */}
        <div className={cn(
          "fixed left-0 top-0 h-full z-50 transition-all duration-300 ease-in-out",
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          isSidebarCollapsed ? 'w-[70px]' : 'w-[180px]'
        )}>
          <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
        </div>

        {/* Main Content Wrapper */}
        <div className={cn(
          "min-h-screen flex flex-col relative bg-[linear-gradient(rgba(200,138,4,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(200,138,4,0.03)_1px,transparent_1px)] bg-[size:40px_40px] transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "md:ml-[70px]" : "md:ml-[180px]"
        )}>

          {/* Fixed Header */}
          <TopBar
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={toggleSidebar}
            mobileMenuOpen={sidebarOpen}
            onToggleMobileMenu={() => setSidebarOpen(!sidebarOpen)}
          />

          {/* Page Content */}
          <main className="flex-1 p-4 md:p-8 pt-20 md:pt-24 relative z-0">
            <div className="max-w-[1600px] mx-auto space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}

