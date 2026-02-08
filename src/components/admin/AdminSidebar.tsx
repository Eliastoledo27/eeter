'use client';

import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut, 
  Store,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

interface AdminSidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

export function AdminSidebar({ activeSection, onNavigate }: AdminSidebarProps) {
  const { logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'messages', label: 'Mensajes', icon: MessageSquare },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-full fixed left-0 top-0 z-50 transition-all duration-300 shadow-xl">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2 tracking-tight">
          <Store className="text-primary" /> Éter Admin
        </h2>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-bold",
              activeSection === item.id 
                ? "bg-primary text-white shadow-lg shadow-primary/25" 
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-2">
        <Link href="/">
          <Button variant="ghost" className="w-full justify-start text-gray-500 hover:text-gray-900 hover:bg-gray-50 gap-3 font-medium">
             <Store size={20} /> Ver Tienda
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 gap-3 font-medium"
          onClick={logout}
        >
          <LogOut size={20} /> Cerrar Sesión
        </Button>
      </div>
    </aside>
  );
}
