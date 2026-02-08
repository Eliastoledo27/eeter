'use client'

import { useAuthStore } from '@/store/auth-store'
import { useEffect } from 'react'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const checkSession = useAuthStore((state) => state.checkSession)

  useEffect(() => {
    checkSession()
  }, [checkSession])

  return <>{children}</>
}
