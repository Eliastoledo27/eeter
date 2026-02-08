import { Home, ShoppingBag, BookOpen, Trophy, Users, Package, MessageSquare, BarChart2, ClipboardList, type LucideIcon } from 'lucide-react'

export type UserRole = 'admin' | 'support' | 'reseller' | 'user'

export interface NavItem {
  id: string
  label: string
  icon: LucideIcon
  href: string
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['view_dashboard', 'view_analytics', 'view_catalog', 'view_academy', 'view_ranking', 'manage_users', 'manage_products', 'view_crm', 'manage_messages', 'manage_purchases', 'manage_orders'],
  support: ['view_dashboard', 'view_catalog', 'view_academy', 'manage_users', 'view_crm', 'manage_orders'],
  reseller: ['view_dashboard', 'view_catalog', 'view_academy', 'view_ranking', 'view_crm', 'view_messages', 'view_orders'],
  user: ['view_dashboard', 'view_catalog', 'view_academy', 'view_messages', 'view_orders'] // Basic access
}

export const DASHBOARD_MODULES: NavItem[] = [
  { id: 'dashboard', label: 'Panel Principal', icon: Home, href: '/dashboard' },
  { id: 'analytics', label: 'Análisis', icon: BarChart2, href: '/dashboard?view=analytics' },
  { id: 'catalog', label: 'Mi Catálogo', icon: ShoppingBag, href: '/dashboard?view=catalog' },
  { id: 'orders', label: 'Pedidos', icon: ClipboardList, href: '/dashboard?view=orders' },
  { id: 'academy', label: 'Academia VIP', icon: BookOpen, href: '/dashboard?view=academy' },
  { id: 'ranking', label: 'Ranking Global', icon: Trophy, href: '/dashboard?view=ranking' },
  { id: 'users', label: 'Usuarios', icon: Users, href: '/dashboard?view=users' },
  { id: 'products', label: 'Inventario', icon: Package, href: '/dashboard/catalogue' }, // Corrected href from previous dashboard route
  { id: 'purchases', label: 'Compras', icon: ShoppingBag, href: '/dashboard/purchases' },
  { id: 'messages', label: 'Mensajes', icon: MessageSquare, href: '/dashboard?view=messages' },
]

export const getModulesForRole = (role: UserRole): NavItem[] => {
  const permissions = ROLE_PERMISSIONS[role] || []

  return DASHBOARD_MODULES.filter(module => {
    switch (module.id) {
      case 'dashboard': return permissions.includes('view_dashboard')
      case 'analytics': return permissions.includes('view_analytics')
      case 'orders': return permissions.includes('manage_orders') || permissions.includes('view_orders')
      case 'catalog': return permissions.includes('view_catalog')
      case 'academy': return permissions.includes('view_academy')
      case 'ranking': return permissions.includes('view_ranking')
      case 'users': return permissions.includes('manage_users')
      case 'products': return permissions.includes('manage_products')
      case 'purchases': return permissions.includes('manage_purchases')
      case 'messages': return permissions.includes('manage_messages') || permissions.includes('view_messages')
      default: return false
    }
  })
}
