import { create } from 'zustand'

type AuthView = 'login' | 'register'

interface UIStore {
  isAuthModalOpen: boolean
  authView: AuthView
  isMobileMenuOpen: boolean
  isSidebarCollapsed: boolean
  openAuthModal: (view?: AuthView) => void
  closeAuthModal: () => void
  toggleAuthView: () => void
  setMobileMenuOpen: (isOpen: boolean) => void
  toggleMobileMenu: () => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  isAuthModalOpen: false,
  authView: 'login',
  isMobileMenuOpen: false,
  isSidebarCollapsed: false,
  openAuthModal: (view = 'login') => set({ isAuthModalOpen: true, authView: view }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  toggleAuthView: () => set((state) => ({ authView: state.authView === 'login' ? 'register' : 'login' })),
  setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
}))
