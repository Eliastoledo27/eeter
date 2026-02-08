'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { MobileSidebar } from '@/components/layout/MobileSidebar'
import { TopBar } from '@/components/layout/TopBar'
import { Suspense } from 'react'
import { useUIStore } from '@/store/ui-store'
import { cn } from '@/lib/utils'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isSidebarCollapsed } = useUIStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 text-slate-900 selection:bg-blue-500/20">
      {/* Desktop Sidebar */}
      <Suspense fallback={null}>
        <Sidebar />
      </Suspense>

      {/* Main Content Area */}
      <div className={cn(
        "flex flex-col min-h-screen transition-all duration-300",
        isSidebarCollapsed ? "md:pl-20" : "md:pl-72"
      )}>
        <TopBar />
        
        <main className="flex-1 p-5 md:p-7">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Bar */}
      <Suspense fallback={null}>
        <MobileSidebar />
      </Suspense>
    </div>
  )
}
