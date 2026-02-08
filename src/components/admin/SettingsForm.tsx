'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

export function SettingsForm() {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Configuración guardada correctamente');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm text-white">
        <CardHeader>
          <CardTitle>Configuración General</CardTitle>
          <CardDescription>Información básica de la tienda.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Nombre de la Tienda</Label>
              <Input id="storeName" defaultValue="Éter Store" className="bg-black/20 border-white/10" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="storeDescription">Descripción</Label>
              <Textarea 
                id="storeDescription" 
                defaultValue="Descubre nuestra plataforma especializada en calzados premium para revendedores." 
                className="bg-black/20 border-white/10 min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storeEmail">Email de Contacto</Label>
                <Input id="storeEmail" defaultValue="equiporeveter@gmail.com" className="bg-black/20 border-white/10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storePhone">Teléfono</Label>
                <Input id="storePhone" defaultValue="223 502 5196" className="bg-black/20 border-white/10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeAddress">Dirección</Label>
              <Input id="storeAddress" defaultValue="Mar del Plata, Argentina" className="bg-black/20 border-white/10" />
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full md:w-auto">
                Guardar Cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
