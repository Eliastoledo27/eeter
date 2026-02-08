'use client';

import { Button } from '@/components/ui/button';
import { Mail, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCustomers, Customer } from '@/app/actions/dashboard';
import { toast } from 'sonner';

export function CustomersTable() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await getCustomers();
        setCustomers(data);
      } catch (error) {
        console.error('Error loading customers:', error);
        toast.error('Error al cargar clientes');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="rounded-md border border-white/10 overflow-hidden bg-black/20 backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-white/5 text-gray-400">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Última Compra</th>
              <th className="px-4 py-3 text-right">Total Gastado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No hay clientes registrados aún.
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-gray-500">#{customer.id.substring(0, 8)}...</td>
                  <td className="px-4 py-3 font-medium text-white">{customer.name}</td>
                  <td className="px-4 py-3 text-gray-400">{customer.email}</td>
                  <td className="px-4 py-3 text-gray-400">{customer.lastPurchase}</td>
                  <td className="px-4 py-3 text-right font-mono text-green-400">
                    ${customer.totalSpent.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" className="gap-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                      <Mail className="h-3 w-3" /> Contactar
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
