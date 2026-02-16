
'use client'


import {
    BarChart3,
    Users,
    DollarSign,
    CreditCard,
    Search,
    Bell,
    ArrowUpRight,
    ArrowDownRight,
    Package,
    MoreHorizontal,
    LayoutDashboard,
    Settings,
    LogOut,
    ShoppingBag,
    MessageSquare,
    TrendingUp,
    Filter
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// Mock Data
const stats = [
    { label: "Revenue", value: "$124,592", change: "+12.5%", trend: "up", icon: DollarSign },
    { label: "Active Users", value: "8,234", change: "+3.2%", trend: "up", icon: Users },
    { label: "Orders", value: "1,493", change: "-0.8%", trend: "down", icon: Package },
    { label: "Avg. Order Value", value: "$83.45", change: "+5.4%", trend: "up", icon: CreditCard },
]

const recentOrders = [
    { id: "#ORD-7352", customer: "Sofia Martinez", product: "Nike Air Max 90", amount: "$145.00", status: "Completed", date: "Just now" },
    { id: "#ORD-7351", customer: "Lucas Perez", product: "Adidas Ultra Boost", amount: "$180.00", status: "Processing", date: "2 min ago" },
    { id: "#ORD-7350", customer: "Ana Gomez", product: "Puma RS-X", amount: "$110.00", status: "Pending", date: "15 min ago" },
    { id: "#ORD-7349", customer: "Carlos Ruiz", product: "Jordan Retro 4", amount: "$220.00", status: "Completed", date: "1 hour ago" },
    { id: "#ORD-7348", customer: "Elena Diaz", product: "Nike Dunk Low", amount: "$130.00", status: "Cancelled", date: "3 hours ago" },
]

export default function HegemonicDashboardPreview() {
    const sidebarOpen = true; // Fixed unused setter and simplified as it's not toggled

    return (
        <div className="min-h-screen bg-[#09090B] text-zinc-100 flex font-sans selection:bg-rose-500/20">

            {/* Sidebar - Minimalist & Functional */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 bg-[#09090B] border-r border-white/5 transition-all duration-300 flex flex-col",
                sidebarOpen ? "w-64" : "w-20"
            )}>
                <div className="h-16 flex items-center px-6 border-b border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/80 font-bold">
                        É
                    </div>
                    {sidebarOpen && <span className="ml-3 font-semibold text-sm tracking-wide">ÉTER STORE</span>}
                </div>

                <nav className="flex-1 py-6 px-3 space-y-1">
                    {[
                        { icon: LayoutDashboard, label: "Overview", active: true },
                        { icon: ShoppingBag, label: "Products" },
                        { icon: Users, label: "Customers" },
                        { icon: BarChart3, label: "Analytics" },
                        { icon: MessageSquare, label: "Messages" },
                        { icon: Settings, label: "Settings" },
                    ].map((item, idx) => (
                        <button
                            key={idx}
                            className={cn(
                                "w-full flex items-center px-3 py-2.5 rounded-lg text-sm transition-all group relative overflow-hidden",
                                item.active
                                    ? "bg-white/10 text-white font-medium"
                                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                            )}
                        >
                            <item.icon size={18} strokeWidth={2} />
                            {sidebarOpen && <span className="ml-3">{item.label}</span>}
                            {item.active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-rose-500 rounded-r-full" />}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-zinc-300 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-orange-500" />
                        {sidebarOpen && (
                            <div className="text-left">
                                <p className="text-xs font-semibold text-zinc-200">Admin User</p>
                                <p className="text-[10px] text-zinc-500">View Profile</p>
                            </div>
                        )}
                        <LogOut size={16} className="ml-auto" />
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className={cn(
                "flex-1 min-h-screen transition-all duration-300 bg-[#0C0C0E]",
                sidebarOpen ? "ml-64" : "ml-20"
            )}>

                {/* Top Header - Glassmorphism */}
                <header className="sticky top-0 z-40 bg-[#0C0C0E]/80 backdrop-blur-xl border-b border-white/5 px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-sm font-medium text-zinc-400">Dashboard / <span className="text-white">Overview</span></h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" size={16} />
                            <input type="text" placeholder="Search..." className="bg-white/5 border border-white/5 rounded-full pl-10 pr-4 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 w-64 transition-all" />
                        </div>
                        <button className="relative p-2 text-zinc-500 hover:text-zinc-200 transition-colors">
                            <Bell size={18} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-[#0C0C0E]" />
                        </button>
                    </div>
                </header>

                <div className="p-8 space-y-8 max-w-[1600px] mx-auto">

                    {/* Header Section */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">Welcome back, Admin</h2>
                            <p className="text-zinc-400 text-sm mt-1">Here&apos;s what&apos;s happening with your store today.</p>
                        </div>
                        <div className="flex gap-3">
                            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-sm font-medium rounded-lg text-zinc-300 transition-colors border border-white/5 flex items-center gap-2">
                                <Filter size={14} /> Filter
                            </button>
                            <button className="px-4 py-2 bg-white text-black hover:bg-zinc-200 text-sm font-medium rounded-lg transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                Export Report
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid - Bento Style */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-[#121214] border border-white/5 p-5 rounded-2xl hover:border-white/10 transition-colors group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-white/5 rounded-lg text-zinc-400 group-hover:text-white transition-colors">
                                        <stat.icon size={18} />
                                    </div>
                                    <span className={cn(
                                        "text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1",
                                        stat.trend === 'up' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                                    )}>
                                        {stat.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                        {stat.change}
                                    </span>
                                </div>
                                <div className="text-3xl font-bold text-white tracking-tight mb-1">{stat.value}</div>
                                <div className="text-zinc-500 text-xs font-medium">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Charts & Tables Split */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Main Chart Area */}
                        <div className="lg:col-span-2 bg-[#121214] border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-semibold text-white">Revenue Overview</h3>
                                <select className="bg-transparent text-xs text-zinc-500 font-medium focus:outline-none cursor-pointer">
                                    <option>Last 7 days</option>
                                    <option>Last 30 days</option>
                                    <option>Last Year</option>
                                </select>
                            </div>

                            {/* Mock Chart Area */}
                            <div className="h-[300px] w-full relative flex items-end justify-between gap-2 px-2 pt-10">
                                {[65, 40, 75, 55, 80, 60, 95, 70, 85, 45, 90, 100].map((val, i) => (
                                    <div key={i} className="relative w-full h-full flex flex-col justify-end group">
                                        <div
                                            className="w-full bg-white/5 rounded-t-sm hover:bg-rose-500/50 transition-all duration-300 relative group-hover:shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                                            style={{ height: `${val}%` }}
                                        ></div>
                                        {/* Tooltip */}
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            ${val * 120}
                                        </div>
                                    </div>
                                ))}
                                {/* Grid Lines */}
                                <div className="absolute inset-x-0 bottom-0 h-px bg-white/5" />
                                <div className="absolute inset-x-0 top-0 h-px bg-white/5 border-dashed" />
                                <div className="absolute inset-x-0 top-1/2 h-px bg-white/5 border-dashed" />
                            </div>
                        </div>

                        {/* Recent Activity / Quick Actions */}
                        <div className="space-y-6">
                            <div className="bg-[#121214] border border-white/5 rounded-2xl p-6">
                                <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Add Product', 'Create Order', 'New Customer', 'Manage Stock'].map((action, i) => (
                                        <button key={i} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-xs font-medium text-zinc-300 border border-transparent hover:border-white/10 flex flex-col items-center justify-center gap-2 aspect-square">
                                            {i === 0 && <Package size={20} className="text-rose-500" />}
                                            {i === 1 && <CreditCard size={20} className="text-emerald-500" />}
                                            {i === 2 && <Users size={20} className="text-blue-500" />}
                                            {i === 3 && <LayoutDashboard size={20} className="text-amber-500" />}
                                            {action}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-rose-500/10 to-purple-500/10 border border-rose-500/20 rounded-2xl p-6 relative overflow-hidden">
                                <div className="relative z-10">
                                    <TrendingUp size={24} className="text-rose-400 mb-2" />
                                    <h4 className="font-bold text-white mb-1">Scale your sales</h4>
                                    <p className="text-xs text-zinc-400 mb-4">You&apos;ve reached 80% of your monthly goal. Keep pushing!</p>
                                    <button className="text-xs font-bold bg-white text-black px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors">
                                        View Insights
                                    </button>
                                </div>
                                {/* Background decoration */}
                                <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-rose-500/20 rounded-full blur-3xl animate-pulse" />
                            </div>
                        </div>

                    </div>

                    {/* Recent Orders Table */}
                    <div className="bg-[#121214] border border-white/5 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h3 className="font-semibold text-white">Recent Orders</h3>
                            <button className="text-xs text-zinc-500 hover:text-white transition-colors">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white/[0.02] text-zinc-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-3">Order ID</th>
                                        <th className="px-6 py-3">Customer</th>
                                        <th className="px-6 py-3">Product</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Amount</th>
                                        <th className="px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4 font-medium text-white">{order.id}</td>
                                            <td className="px-6 py-4 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400 font-bold border border-white/5">
                                                    {order.customer.charAt(0)}
                                                </div>
                                                <span className="text-zinc-300">{order.customer}</span>
                                            </td>
                                            <td className="px-6 py-4 text-zinc-400">{order.product}</td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-full text-[10px] font-bold border",
                                                    order.status === 'Completed' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                        order.status === 'Processing' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                            order.status === 'Pending' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                                                "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                                                )}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-white">{order.amount}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-zinc-600 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5">
                                                    <MoreHorizontal size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    )
}
