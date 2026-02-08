'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function LogoutPage() {
  const { logout } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      // Small delay to show feedback if needed, but mostly to ensure hydration
      await new Promise(resolve => setTimeout(resolve, 500));
      await logout();
    };

    performLogout();
  }, [logout]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617] text-white">
      <Loader2 className="w-10 h-10 animate-spin text-accent-gold mb-4" />
      <p className="text-slate-400 text-lg">Cerrando sesión de forma segura...</p>
    </div>
  );
}
