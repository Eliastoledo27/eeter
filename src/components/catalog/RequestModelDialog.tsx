'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Send } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EterButton } from '@/components/eter/EterButton';

const requestModelSchema = z.object({
  name: z.string().min(2, 'Ingresa tu nombre'),
  phone: z.string().min(8, 'Ingresa un telefono valido'),
  model: z.string().min(2, 'Ingresa el modelo que buscas'),
  size: z.string().min(1, 'Ingresa talle o curva'),
  message: z.string().max(240, 'Maximo 240 caracteres').optional(),
});

type RequestModelValues = z.infer<typeof requestModelSchema>;

export function RequestModelDialog() {
  const [open, setOpen] = useState(false);
  const form = useForm<RequestModelValues>({
    resolver: zodResolver(requestModelSchema),
    defaultValues: {
      name: '',
      phone: '',
      model: '',
      size: '',
      message: '',
    },
  });

  const onSubmit = (values: RequestModelValues) => {
    const text = [
      'Hola ETER, quiero solicitar un modelo:',
      `Nombre: ${values.name}`,
      `Telefono: ${values.phone}`,
      `Modelo: ${values.model}`,
      `Talle/curva: ${values.size}`,
      values.message ? `Detalle: ${values.message}` : '',
    ].filter(Boolean).join('\n');

    const whatsappUrl = `https://wa.me/5492236204002?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    toast.success('Solicitud preparada', {
      description: 'Te abrimos WhatsApp con el pedido listo para enviar.',
      style: { background: '#020202', color: '#fff', border: '1px solid rgba(57,255,20,0.25)' },
    });
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="relative z-10 flex h-12 w-full items-center justify-center gap-3 rounded-md bg-white px-5 text-[10px] font-black uppercase tracking-[0.2em] text-black transition-all hover:bg-[#00E0FF] hover:shadow-[0_10px_20px_rgba(0,224,255,0.2)]">
          Solicitar pedido <ArrowRight size={16} />
        </button>
      </DialogTrigger>
      <DialogContent className="border-white/10 bg-[#050505] text-white sm:rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-normal text-white">Pedir modelo</DialogTitle>
          <DialogDescription className="text-white/50">
            Validamos el pedido y lo enviamos por WhatsApp sin tocar checkout ni base de datos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">Nombre</span>
            <Input className="border-white/10 bg-black/50 text-white" {...form.register('name')} />
            {form.formState.errors.name && <span className="text-xs text-red-300">{form.formState.errors.name.message}</span>}
          </label>

          <label className="grid gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">Telefono</span>
            <Input className="border-white/10 bg-black/50 text-white" {...form.register('phone')} />
            {form.formState.errors.phone && <span className="text-xs text-red-300">{form.formState.errors.phone.message}</span>}
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">Modelo</span>
              <Input className="border-white/10 bg-black/50 text-white" {...form.register('model')} />
              {form.formState.errors.model && <span className="text-xs text-red-300">{form.formState.errors.model.message}</span>}
            </label>

            <label className="grid gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">Talle/curva</span>
              <Input className="border-white/10 bg-black/50 text-white" {...form.register('size')} />
              {form.formState.errors.size && <span className="text-xs text-red-300">{form.formState.errors.size.message}</span>}
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">Detalle opcional</span>
            <Textarea className="min-h-24 border-white/10 bg-black/50 text-white" {...form.register('message')} />
            {form.formState.errors.message && <span className="text-xs text-red-300">{form.formState.errors.message.message}</span>}
          </label>

          <EterButton type="submit" tone="green" className="w-full">
            Enviar por WhatsApp
            <Send size={16} />
          </EterButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
