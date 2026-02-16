import { describe, it, expect } from 'vitest'
import {
  hasPermission,
  getModulesForRole,
  canAccessRoute,
  getDefaultRedirect,
  ROLE_PERMISSIONS,
  DASHBOARD_MODULES,
  type UserRole,
} from '../config/roles'

// ─── Permission Tests ──────────────────────────────────────────────
describe('RBAC Permissions', () => {
  const allRoles: UserRole[] = ['admin', 'support', 'reseller', 'user']

  it('admin should have all permissions', () => {
    const adminPerms = ROLE_PERMISSIONS.admin
    expect(adminPerms).toContain('view_dashboard')
    expect(adminPerms).toContain('manage_users')
    expect(adminPerms).toContain('manage_products')
    expect(adminPerms).toContain('manage_settings')
    expect(adminPerms).toContain('view_analytics')
    expect(adminPerms).toContain('manage_orders')
    expect(adminPerms).toContain('view_inventory')
    expect(adminPerms).toContain('manage_inventory')
    expect(adminPerms).toContain('view_notifications')
  })

  it('user should have minimal permissions', () => {
    const userPerms = ROLE_PERMISSIONS.user
    expect(userPerms).toContain('view_dashboard')
    expect(userPerms).toContain('view_catalog')
    expect(userPerms).toContain('view_notifications')
    expect(userPerms).not.toContain('manage_users')
    expect(userPerms).not.toContain('manage_products')
    expect(userPerms).not.toContain('manage_settings')
    expect(userPerms).not.toContain('view_inventory')
    expect(userPerms).not.toContain('view_ranking')
  })

  it('all roles should have view_dashboard', () => {
    allRoles.forEach(role => {
      expect(hasPermission(role, 'view_dashboard')).toBe(true)
    })
  })

  it('only admin should have manage_settings', () => {
    expect(hasPermission('admin', 'manage_settings')).toBe(true)
    expect(hasPermission('support', 'manage_settings')).toBe(false)
    expect(hasPermission('reseller', 'manage_settings')).toBe(false)
    expect(hasPermission('user', 'manage_settings')).toBe(false)
  })

  it('support should be able to manage orders', () => {
    expect(hasPermission('support', 'manage_orders')).toBe(true)
  })

  it('reseller should not manage users', () => {
    expect(hasPermission('reseller', 'manage_users')).toBe(false)
  })

  it('only admin and support should have view_inventory', () => {
    expect(hasPermission('admin', 'view_inventory')).toBe(true)
    expect(hasPermission('support', 'view_inventory')).toBe(true)
    expect(hasPermission('reseller', 'view_inventory')).toBe(false)
    expect(hasPermission('user', 'view_inventory')).toBe(false)
  })

  it('only admin and reseller should have view_ranking', () => {
    expect(hasPermission('admin', 'view_ranking')).toBe(true)
    expect(hasPermission('reseller', 'view_ranking')).toBe(true)
    expect(hasPermission('support', 'view_ranking')).toBe(false)
    expect(hasPermission('user', 'view_ranking')).toBe(false)
  })

  it('all roles should have view_notifications', () => {
    allRoles.forEach(role => {
      expect(hasPermission(role, 'view_notifications')).toBe(true)
    })
  })
})

// ─── Module Access Tests ───────────────────────────────────────────
describe('Module Access by Role', () => {
  it('admin should see all modules', () => {
    const modules = getModulesForRole('admin')
    expect(modules.length).toBe(DASHBOARD_MODULES.length)
  })

  it('user should see limited modules', () => {
    const modules = getModulesForRole('user')
    const moduleIds = modules.map(m => m.id)
    expect(moduleIds).toContain('dashboard')
    expect(moduleIds).toContain('catalog')
    expect(moduleIds).toContain('academy')
    expect(moduleIds).toContain('messages')
    expect(moduleIds).toContain('orders')
    expect(moduleIds).not.toContain('users')
    expect(moduleIds).not.toContain('settings')
    expect(moduleIds).not.toContain('analytics')
    expect(moduleIds).not.toContain('inventory')
    expect(moduleIds).not.toContain('ranking')
  })

  it('support should see user management but not settings', () => {
    const modules = getModulesForRole('support')
    const moduleIds = modules.map(m => m.id)
    expect(moduleIds).toContain('users')
    expect(moduleIds).toContain('inventory')
    expect(moduleIds).not.toContain('settings')
    expect(moduleIds).not.toContain('analytics')
    expect(moduleIds).not.toContain('ranking')
  })

  it('reseller should see ranking but not users or inventory', () => {
    const modules = getModulesForRole('reseller')
    const moduleIds = modules.map(m => m.id)
    expect(moduleIds).toContain('ranking')
    expect(moduleIds).toContain('orders')
    expect(moduleIds).not.toContain('users')
    expect(moduleIds).not.toContain('settings')
    expect(moduleIds).not.toContain('inventory')
  })
})

// ─── Route Access Tests ────────────────────────────────────────────
describe('Route Access by Role', () => {
  it('admin can access all routes', () => {
    expect(canAccessRoute('admin', '/dashboard')).toBe(true)
    expect(canAccessRoute('admin', '/dashboard/analytics')).toBe(true)
    expect(canAccessRoute('admin', '/dashboard/settings')).toBe(true)
    expect(canAccessRoute('admin', '/dashboard/profiles')).toBe(true)
    expect(canAccessRoute('admin', '/dashboard/orders')).toBe(true)
    expect(canAccessRoute('admin', '/dashboard/inventory')).toBe(true)
    expect(canAccessRoute('admin', '/dashboard/ranking')).toBe(true)
  })

  it('user cannot access admin-only routes', () => {
    expect(canAccessRoute('user', '/dashboard')).toBe(true)
    expect(canAccessRoute('user', '/dashboard/analytics')).toBe(false)
    expect(canAccessRoute('user', '/dashboard/settings')).toBe(false)
    expect(canAccessRoute('user', '/dashboard/profiles')).toBe(false)
    expect(canAccessRoute('user', '/dashboard/inventory')).toBe(false)
    expect(canAccessRoute('user', '/dashboard/ranking')).toBe(false)
  })

  it('support can access profiles and inventory but not settings or ranking', () => {
    expect(canAccessRoute('support', '/dashboard/profiles')).toBe(true)
    expect(canAccessRoute('support', '/dashboard/inventory')).toBe(true)
    expect(canAccessRoute('support', '/dashboard/settings')).toBe(false)
    expect(canAccessRoute('support', '/dashboard/ranking')).toBe(false)
  })

  it('reseller can access ranking and orders but not inventory', () => {
    expect(canAccessRoute('reseller', '/dashboard/ranking')).toBe(true)
    expect(canAccessRoute('reseller', '/dashboard/orders')).toBe(true)
    expect(canAccessRoute('reseller', '/dashboard/inventory')).toBe(false)
  })

  it('all roles can access dashboard base', () => {
    ['admin', 'support', 'reseller', 'user'].forEach(role => {
      expect(canAccessRoute(role as UserRole, '/dashboard')).toBe(true)
    })
  })

  it('unmatched routes are allowed by default', () => {
    expect(canAccessRoute('user', '/catalog')).toBe(true)
    expect(canAccessRoute('user', '/some-unknown-route')).toBe(true)
  })
})

// ─── Default Redirect Tests ────────────────────────────────────────
describe('Default Redirects', () => {
  it('all roles redirect to /dashboard by default', () => {
    expect(getDefaultRedirect('admin')).toBe('/dashboard')
    expect(getDefaultRedirect('support')).toBe('/dashboard')
    expect(getDefaultRedirect('reseller')).toBe('/dashboard')
    expect(getDefaultRedirect('user')).toBe('/dashboard')
  })
})
