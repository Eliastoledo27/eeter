'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      toast.error('Acceso denegado. Debes iniciar sesión.');
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-accent-gold" />
        <p className="text-sm text-gray-400">Verificando sesión...</p>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
