'use client'

import { useUIStore } from '@/store/ui-store'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import LoginForm from '@/app/(auth)/login/LoginForm'
import RegisterForm from '@/app/(auth)/register/RegisterForm'

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authView, toggleAuthView } = useUIStore()

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={closeAuthModal}>
      <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-white/10 text-white p-0 overflow-hidden max-w-md sm:rounded-2xl">
        <div className="p-1">
          {authView === 'login' ? (
            <LoginForm isModal onRegisterClick={toggleAuthView} />
          ) : (
            <RegisterForm isModal onLoginClick={toggleAuthView} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
