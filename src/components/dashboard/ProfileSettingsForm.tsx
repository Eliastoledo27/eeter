'use client';

import { useFormState } from 'react-dom';
import { updateProfile } from '@/app/actions/settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';

const initialState = {
  message: '',
  error: '',
  success: '',
};

interface Profile {
  full_name: string | null;
  email: string;
  whatsapp_number: string | null;
}

export function ProfileSettingsForm({ profile }: { profile: Profile }) {
  const [state, formAction] = useFormState(updateProfile, initialState);
  const { checkSession } = useAuthStore();

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      checkSession(); // Refresh global state to update TopBar
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state, checkSession]);

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm text-white">
        <CardHeader>
          <CardTitle>Configuración de Perfil</CardTitle>
          <CardDescription>Actualiza tu información personal.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input 
                id="fullName" 
                name="fullName" 
                defaultValue={profile?.full_name || ''} 
                className="bg-black/20 border-white/10" 
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                defaultValue={profile?.email || ''} 
                className="bg-black/20 border-white/10 opacity-50" 
                disabled 
              />
              <p className="text-xs text-slate-400">El email no se puede cambiar directamente.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsappNumber">Número de WhatsApp</Label>
              <Input 
                id="whatsappNumber" 
                name="whatsappNumber" 
                defaultValue={profile?.whatsapp_number || ''} 
                className="bg-black/20 border-white/10" 
                placeholder="+54 9 ..."
              />
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full md:w-auto bg-accent-gold hover:bg-accent-gold/90 text-white">
                Guardar Cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
