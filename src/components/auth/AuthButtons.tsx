'use client'

import { useUIStore } from '@/store/ui-store'
import { ReactNode } from 'react'

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export function RegisterButton({ children, onClick, ...props }: AuthButtonProps) {
  const openAuthModal = useUIStore((state) => state.openAuthModal)
  
  return (
    <button 
      onClick={(e) => {
        openAuthModal('register')
        onClick?.(e)
      }} 
      {...props}
    >
      {children}
    </button>
  )
}

export function LoginButton({ children, onClick, ...props }: AuthButtonProps) {
  const openAuthModal = useUIStore((state) => state.openAuthModal)
  
  return (
    <button 
      onClick={(e) => {
        openAuthModal('login')
        onClick?.(e)
      }} 
      {...props}
    >
      {children}
    </button>
  )
}
