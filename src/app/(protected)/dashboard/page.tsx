// import { Suspense } from 'react';
import { BentoGrid } from '@/components/dashboard/bento/BentoGrid';
import { WelcomeWidget } from '@/components/dashboard/widgets/WelcomeWidget';
import { StatsWidget } from '@/components/dashboard/widgets/StatsWidget';
import { RevenueChartWidget } from '@/components/dashboard/widgets/RevenueChartWidget';
import { RecentOrdersWidget } from '@/components/dashboard/widgets/RecentOrdersWidget';
import { TopProductsWidget } from '@/components/dashboard/widgets/TopProductsWidget';
import { ActivityWidget } from '@/components/dashboard/widgets/ActivityWidget';
import { PerformanceMetricsWidget } from '@/components/dashboard/widgets/PerformanceMetricsWidget';
import { QuickActionsWidget } from '@/components/dashboard/widgets/QuickActionsWidget';
import { NotificationsWidget } from '@/components/dashboard/widgets/NotificationsWidget';
import { AdvancedAnalyticsWidget } from '@/components/dashboard/widgets/AdvancedAnalyticsWidget';
import { getNotifications } from '@/app/actions/notifications';
import {
  getDashboardStats,
  getRevenueData,
  getRecentOrders,
  getTopProducts,
  getPerformanceMetrics,
  getQuickStats,
  getAdvancedAnalytics,
  getRecentActivity,
  getUserDashboardStats,
  getUserRecentOrders
} from '@/app/actions/dashboard';
import { ResellerDashboard, SupportDashboard, UserDashboard } from '@/components/dashboard/RoleDashboards';
import { AdminDashboard as LegacyAdminDashboard } from '@/components/admin/AdminDashboard';
import { AnalyticsDashboard } from '@/components/admin/analytics/AnalyticsDashboard';

export default async function DashboardPage({ searchParams }: { searchParams: { view?: string } }) {
  const view = searchParams?.view;

  // 1. Determine which view to show based on searchParams
  // Note: 'view' param is set by our redirection logic in useAuth

  // Fetch common data (some dashboards might needs stats)
  const [
    stats,
    revenueData,
    recentOrders,
    topProducts,
    performanceMetrics,
    quickStats,
    advancedAnalytics,
    recentActivity,
    notifications
  ] = await Promise.all([
    getDashboardStats(),
    getRevenueData(),
    getRecentOrders(),
    getTopProducts(),
    getPerformanceMetrics(),
    getQuickStats(),
    getAdvancedAnalytics(),
    getRecentActivity(),
    getNotifications()
  ]);

  // Enhanced Admin Dashboard with all new widgets
  if (view === 'admin') {
    return (
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 border border-slate-700 p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/20 via-transparent to-transparent rounded-full blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 border border-blue-400/30 mb-4">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wide">Panel Administrativo</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-3">
              Dashboard <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Avanzado</span>
            </h1>
            <p className="text-slate-300 text-lg font-medium">Control total de tu imperio e-commerce con métricas en tiempo real.</p>
          </div>
        </div>

        {/* Main Grid */}
        <BentoGrid>
          <WelcomeWidget />
          <StatsWidget stats={stats} />
          <PerformanceMetricsWidget metrics={performanceMetrics} />
          <QuickActionsWidget
            customerCount={quickStats.customersCount}
            unreadNotifications={quickStats.unreadNotifications}
          />
          <NotificationsWidget initialNotifications={notifications} />
          <RevenueChartWidget data={revenueData} />
          <TopProductsWidget products={topProducts} />
          <AdvancedAnalyticsWidget
            salesByCategory={advancedAnalytics.salesByCategory}
            monthlyData={advancedAnalytics.monthlyData}
          />
          <RecentOrdersWidget orders={recentOrders} />
          <ActivityWidget activities={recentActivity} />
        </BentoGrid>
      </div>
    );
  }

  if (view === 'reseller') {
    const [userStats, userOrders] = await Promise.all([
      getUserDashboardStats(),
      getUserRecentOrders()
    ]);

    return (
      <div className="space-y-3">
        <ResellerDashboard stats={userStats} recentOrders={userOrders} />
      </div>
    );
  }

  if (view === 'user') {
    const [userStats, userOrders] = await Promise.all([
      getUserDashboardStats(),
      getUserRecentOrders()
    ]);

    return (
      <div className="space-y-3">
        <UserDashboard stats={userStats} recentOrders={userOrders} />
      </div>
    );
  }

  if (view === 'support') {
    return (
      <div className="space-y-3">
        <SupportDashboard />
      </div>
    );
  }

  if (view === 'analytics') {
    return <AnalyticsDashboard />;
  }

  // Default / User Dashboard (or if view is specific sub-module like 'messages', 'catalog' etc handled by AdminDashboard in legacy code?)
  // If 'view' is present but NOT one of the roles (e.g. ?view=messages), we need to decide who handles it.
  // Currently AdminDashboard handles sub-views. 
  // Let's assume if it's a specific module view, we might want to default to AdminDashboard OR handle it generically.

  if (view && view !== 'dashboard') {
    // If it's a specific module (like 'messages'), let the LegacyAdminDashboard handle it for now 
    // as it contains the routing logic for modules.
    // TODO: Refactor this to be role-agnostic later if needed.
    return <LegacyAdminDashboard initialView={view} />;
  }

  // Default Fallback (Enhanced Dashboard with new widgets)
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-slate-50 to-blue-50/30 border border-slate-200 p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/10 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 border border-blue-100 mb-4">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Dashboard Principal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-3">
            Bienvenido a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Éter Store</span>
          </h1>
          <p className="text-slate-600 text-lg font-medium">Gestiona tu negocio con herramientas avanzadas y visualizaciones inteligentes.</p>
        </div>
      </div>

      {/* Main Grid */}
      <BentoGrid>
        <WelcomeWidget />
        <StatsWidget stats={stats} />
        <QuickActionsWidget
          customerCount={quickStats.customersCount}
          unreadNotifications={quickStats.unreadNotifications}
        />
        <NotificationsWidget initialNotifications={notifications} />
        <RevenueChartWidget data={revenueData} />
        <TopProductsWidget products={topProducts} />
        <AdvancedAnalyticsWidget
          salesByCategory={advancedAnalytics.salesByCategory}
          monthlyData={advancedAnalytics.monthlyData}
        />
        <PerformanceMetricsWidget metrics={performanceMetrics} />
      </BentoGrid>
    </div>
  );
}
