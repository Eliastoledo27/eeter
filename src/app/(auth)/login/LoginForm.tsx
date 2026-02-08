'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Loader2, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { createClient } from '@/utils/supabase/client';
import { User as AppUser, Role } from '@/types';

export default function LoginForm({
  isModal = false,
  onRegisterClick
}: {
  isModal?: boolean;
  onRegisterClick?: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setRealUser } = useAuth();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Supabase auth error:', error);
        toast.error(error.message || 'Credenciales inválidas');
        setIsLoading(false);
        return;
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name, avatar_url')
          .eq('id', data.user.id)
          .single();

        const role = (profile?.role?.toLowerCase() || 'user') as Role;

        const appUser: AppUser = {
          id: data.user.id,
          email: data.user.email || '',
          name: profile?.full_name || 'Usuario',
          role: role,
          avatar_url: profile?.avatar_url
        };

        setRealUser(appUser);
        toast.success('Bienvenido de nuevo');
      }
    } catch (err) {
      console.error('Unexpected error during login:', err);
      toast.error('Ocurrió un error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={isModal
        ? "w-full"
        : "glass p-8 rounded-3xl border border-stone-200/70 bg-white/70 backdrop-blur-xl w-full max-w-md mx-auto shadow-[0_30px_80px_rgba(12,10,9,0.12)]"
      }
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-[#0C0A09]">
          Éter Store
        </h1>
        <p className="text-stone-500 text-sm">Ingresa a tu panel de control</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs text-stone-500 uppercase ml-1">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/80 border-stone-200 text-[#0C0A09] placeholder:text-stone-400 focus-visible:ring-[#CA8A04]/40"
            placeholder="usuario@tuemail.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs text-stone-500 uppercase ml-1">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white/80 border-stone-200 text-[#0C0A09] placeholder:text-stone-400 focus-visible:ring-[#CA8A04]/40"
            placeholder="••••••••"
            required
          />
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1C1917] text-white hover:bg-[#0C0A09] transition-colors font-bold"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Ingresar <LogIn className="ml-2 w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-stone-500">
        ¿No tienes cuenta?{' '}
        {onRegisterClick ? (
          <button
            type="button"
            onClick={onRegisterClick}
            className="text-[#0C0A09] hover:text-[#CA8A04] transition-colors font-bold"
          >
            Regístrate
          </button>
        ) : (
          <Link href="/register" className="text-[#0C0A09] hover:text-[#CA8A04] transition-colors">
            Regístrate
          </Link>
        )}
      </div>
    </motion.div>
  );
}
