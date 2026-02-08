'use client';

import { useState, useEffect, Suspense } from 'react';
import { useCatalog } from '@/hooks/useCatalog';
import { Product } from '@/types';

import { ProductForm } from './ProductForm';
import { ProductManager } from '@/components/dashboard/products/ProductManager'; // Import the new ProductManager
import { InventoryStats } from './InventoryStats';
import { OrdersManager } from './orders/OrdersManager';
import { OrdersTable } from './OrdersTable';
import { CustomersTable } from './CustomersTable';
import { MessagesManager } from './messages/MessagesManager';
import { SettingsForm } from './SettingsForm';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Download, Loader2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useSearchParams } from 'next/navigation';
import { getDashboardStats, getRecentOrders, getRanking, DashboardStats, Order } from '@/app/actions/dashboard';
import { DashboardAcademy } from '@/components/dashboard/DashboardAcademy'; // Import Academy Component
import { DashboardRanking } from '@/components/dashboard/DashboardRanking'; // Import Ranking Component
import { ProfilesManager } from '@/components/dashboard/admin/ProfilesManager'; // Import Profiles Manager

interface AdminDashboardProps {
  initialView?: string;
}

function AdminDashboardContent({ initialView = 'dashboard' }: AdminDashboardProps) {
  const searchParams = useSearchParams();
  const activeSection = searchParams.get('view') || initialView;
  const isProfilesView = activeSection === 'profiles' || activeSection === 'users';

  const { products, updateProduct, addProduct: createProduct } = useCatalog();
  /* const [searchTerm] = useState(''); */
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct] = useState<Product | undefined>(undefined);

  // Real Data State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ranking, setRanking] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch Dashboard Data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        // Parallel fetch
        const [statsData, recentOrdersData, rankingData] = await Promise.all([
          getDashboardStats(),
          getRecentOrders(5),
          getRanking()
        ]);

        setStats(statsData);
        setRecentOrders(recentOrdersData);
        setRanking(rankingData);
      } catch {
        // console.error("Failed to load dashboard data", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (activeSection === 'dashboard' || activeSection === 'orders' || activeSection === 'ranking') {
      fetchData();
    }
  }, [activeSection]);

  /* const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const _handleCreate = () => {
    setEditingProduct(undefined);
    setIsDialogOpen(true);
  }; */

  const handleSaveProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingProduct) {
      await updateProduct({
        ...editingProduct,
        ...productData,
        id: editingProduct.id,
        createdAt: editingProduct.createdAt,
      });
    } else {
      const payload: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
        name: productData.name,
        description: productData.description,
        category: productData.category,
        basePrice: productData.basePrice,
        images: productData.images,
        stockBySize: productData.stockBySize,
        totalStock: productData.totalStock,
        status: productData.status,
        margin: productData.margin
      };
      await createProduct(payload);
    }
    setIsDialogOpen(false);
  };

  if (isLoadingData && (activeSection === 'dashboard' || activeSection === 'orders')) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-4" />
        <p className="text-slate-500">Cargando métricas en tiempo real...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">

      {activeSection === 'dashboard' && stats && (
        <div className="space-y-8 animate-in fade-in duration-700">
          {/* Modern Header with Gradient */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-white to-blue-50/30 border border-slate-200/60 p-8 shadow-xl shadow-slate-900/5">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/10 via-transparent to-transparent rounded-full blur-3xl" />
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 border border-blue-100">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">En Tiempo Real</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                  Panel <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">Principal</span>
                </h1>
                <p className="text-slate-600 text-lg font-medium max-w-2xl">
                  Resumen completo de tu negocio con métricas actualizadas al instante.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="rounded-xl border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm hover:shadow-md transition-all">
                  <Download className="mr-2 h-4 w-4" /> Exportar
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <InventoryStats stats={stats} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders - Takes 2/3 */}
            <div className="lg:col-span-2 space-y-6">
              <OrdersTable orders={recentOrders} />
            </div>

            {/* Quick Inventory Sidebar - Takes 1/3 */}
            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/60 p-6 shadow-lg shadow-slate-900/5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full blur-2xl" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Stock Rápido</h3>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-600/30">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {products.slice(0, 4).map(p => (
                      <div key={p.id} className="group flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 hover:bg-white border-2 border-transparent hover:border-slate-200/80 hover:shadow-md transition-all duration-300 cursor-pointer">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden shadow-sm">
                          {p.images?.[0] && <Image src={p.images[0]} alt={p.name} width={48} height={48} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-slate-900 truncate">{p.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="text-xs text-slate-500 font-medium">{p.totalStock || 0} unidades</div>
                            <div className="w-1 h-1 bg-slate-300 rounded-full" />
                            <div className="text-xs text-slate-400 capitalize">{p.category}</div>
                          </div>
                        </div>
                        <div suppressHydrationWarning className="text-sm font-black text-amber-600">${p.basePrice.toLocaleString('es-AR')}</div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full mt-4 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-bold"
                    onClick={() => window.location.href = '/dashboard?view=products'}
                  >
                    Ver todo el inventario →
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'products' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <ProductManager />
        </div>
      )}

      {activeSection === 'catalog' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <ProductManager />
        </div>
      )}

      {activeSection === 'orders' && (
        <div className="animate-in fade-in duration-500">
          <OrdersManager />
        </div>
      )}

      {activeSection === 'customers' && (
        <CustomersTable />
      )}

      {isProfilesView && (
        <div className="animate-in fade-in duration-500">
          <ProfilesManager />
        </div>
      )}

      {activeSection === 'ranking' && (
        <div className="animate-in fade-in duration-500">
          <DashboardRanking ranking={ranking} currentUserId="" />
        </div>
      )}

      {activeSection === 'messages' && (
        <MessagesManager />
      )}

      {activeSection === 'settings' && (
        <SettingsForm />
      )}

      {activeSection === 'academy' && (
        <div className="animate-in fade-in duration-500">
          <DashboardAcademy isPremium={false} items={[]} />
        </div>
      )}

      {/* Hidden Dialog for Product Form (Legacy support if needed) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl bg-[#020617] border-slate-800 text-white p-0 overflow-hidden">
          <ProductForm
            initialData={editingProduct}
            onSubmit={handleSaveProduct}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function AdminDashboard(props: AdminDashboardProps) {
  return (
    <Suspense fallback={<div className="h-96 w-full bg-white/5 animate-pulse rounded-xl" />}>
      <AdminDashboardContent {...props} />
    </Suspense>
  );
}
