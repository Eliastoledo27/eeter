import {
  Home, ShoppingBag, BookOpen, Trophy, Users, Package,
  MessageSquare, BarChart2, ClipboardList, Settings, LayoutDashboard,
  type LucideIcon,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'support' | 'reseller' | 'user'

export interface NavItem {
  id: string
  label: string
  icon: LucideIcon
  href: string
  requiredPermission: string
}

// ─── Permissions Matrix ──────────────────────────────────────────────
// Each role maps to a set of string-based permissions.
// Permissions follow VERB_RESOURCE format for granularity.
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    'view_dashboard', 'view_analytics', 'view_catalog', 'view_academy',
    'view_ranking', 'manage_users', 'manage_products', 'view_crm',
    'manage_messages', 'manage_purchases', 'manage_orders', 'manage_settings',
    'view_messages', 'view_orders', 'view_profiles', 'manage_reseller_shop',
    'view_inventory', 'manage_inventory', 'view_notifications',
  ],
  support: [
    'view_dashboard', 'view_catalog', 'view_academy', 'manage_users',
    'view_crm', 'manage_orders', 'view_messages', 'view_orders',
    'view_profiles', 'view_inventory', 'view_notifications',
  ],
  reseller: [
    'view_dashboard', 'view_catalog', 'view_academy', 'view_ranking',
    'view_crm', 'view_messages', 'view_orders', 'view_notifications',
    'manage_reseller_shop',
  ],
  user: [
    'view_dashboard', 'view_catalog', 'view_academy', 'view_messages',
    'view_orders', 'view_notifications', 'manage_reseller_shop',
  ],
}

// ─── Route-to-Permission Mapping ─────────────────────────────────────
// Maps route prefixes to the permission needed to access them.
// More specific routes should appear first.
export const ROUTE_PERMISSIONS: Record<string, string> = {
  '/dashboard/analytics': 'view_analytics',
  '/dashboard/catalogue': 'view_catalog',
  '/dashboard/profiles': 'view_profiles',
  '/dashboard/purchases': 'manage_purchases',
  '/dashboard/settings': 'manage_settings',
  '/dashboard/messages': 'view_messages',
  '/dashboard/orders': 'view_orders',
  '/dashboard/inventory': 'view_inventory',
  '/dashboard/ranking': 'view_ranking',
  '/dashboard/myshop': 'manage_reseller_shop',
  '/dashboard/panel': 'view_dashboard',
  '/dashboard': 'view_dashboard',
  '/academy': 'view_academy',
}

// ─── Route-to-Allowed-Roles Mapping ──────────────────────────────────
// Direct role-to-routes for middleware enforcement.
export const ROUTE_ROLES: Record<string, UserRole[]> = {
  '/dashboard/analytics': ['admin'],
  '/dashboard/catalogue': ['admin', 'support', 'reseller', 'user'],
  '/dashboard/profiles': ['admin', 'support'],
  '/dashboard/purchases': ['admin', 'support', 'reseller', 'user'],
  '/dashboard/settings': ['admin'],
  '/dashboard/messages': ['admin', 'support', 'reseller', 'user'],
  '/dashboard/orders': ['admin', 'support', 'reseller', 'user'],
  '/dashboard/inventory': ['admin', 'support'],
  '/dashboard/ranking': ['admin', 'reseller'],
  '/dashboard/myshop': ['admin', 'reseller'],
  '/dashboard/panel': ['admin', 'support', 'reseller', 'user'],
  '/dashboard': ['admin', 'support', 'reseller', 'user'],
  '/academy': ['admin', 'support', 'reseller', 'user'],
}

// ─── Navigation Modules ──────────────────────────────────────────────
export const DASHBOARD_MODULES: NavItem[] = [
  { id: 'dashboard', label: 'Inicio', icon: Home, href: '/dashboard', requiredPermission: 'view_dashboard' },
  { id: 'panel', label: 'Panel Control', icon: LayoutDashboard, href: '/dashboard/panel', requiredPermission: 'view_dashboard' },
  { id: 'analytics', label: 'Análisis', icon: BarChart2, href: '/dashboard/analytics', requiredPermission: 'view_analytics' },
  { id: 'catalog', label: 'Catálogo', icon: ShoppingBag, href: '/dashboard/catalogue', requiredPermission: 'view_catalog' },
  { id: 'myshop', label: 'Mi Tienda', icon: BarChart2, href: '/dashboard/myshop', requiredPermission: 'manage_reseller_shop' },
  { id: 'orders', label: 'Pedidos', icon: ClipboardList, href: '/dashboard/orders', requiredPermission: 'view_orders' },
  { id: 'academy', label: 'Academia VIP', icon: BookOpen, href: '/academy', requiredPermission: 'view_academy' },
  { id: 'ranking', label: 'Ranking', icon: Trophy, href: '/dashboard/ranking', requiredPermission: 'view_ranking' },
  { id: 'users', label: 'Usuarios', icon: Users, href: '/dashboard/profiles', requiredPermission: 'manage_users' },
  { id: 'inventory', label: 'Inventario', icon: Package, href: '/dashboard/inventory', requiredPermission: 'view_inventory' },
  { id: 'messages', label: 'Mensajes', icon: MessageSquare, href: '/dashboard/messages', requiredPermission: 'view_messages' },
  { id: 'settings', label: 'Configuración', icon: Settings, href: '/dashboard/settings', requiredPermission: 'manage_settings' },
]

// ─── Utility Functions ───────────────────────────────────────────────

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  return permissions ? permissions.includes(permission) : false
}

/**
 * Get all nav modules accessible by a given role.
 */
export function getModulesForRole(role: UserRole): NavItem[] {
  return DASHBOARD_MODULES.filter(module =>
    hasPermission(role, module.requiredPermission)
  )
}

/**
 * Check if a role can access a given route pathname.
 * Returns true if no specific restriction is configured.
 */
export function canAccessRoute(role: UserRole, pathname: string): boolean {
  // Check from most specific to least specific
  const sortedRoutes = Object.keys(ROUTE_ROLES).sort((a, b) => b.length - a.length)

  for (const route of sortedRoutes) {
    if (pathname.startsWith(route)) {
      return ROUTE_ROLES[route].includes(role)
    }
  }

  // No restriction found → allow
  return true
}

/**
 * Get the default redirect path for a given role after login.
 */
export function getDefaultRedirect(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/dashboard'
    case 'support':
      return '/dashboard'
    case 'reseller':
      return '/dashboard'
    case 'user':
      return '/dashboard'
    default:
      return '/dashboard'
  }
}
