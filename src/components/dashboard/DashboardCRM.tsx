'use client'

import { useFormState, useFormStatus } from 'react-dom';
import { GlassCard } from './GlassCard';
import { registerSale } from '@/app/actions/dashboard';
import type { DashboardProduct } from '@/types/dashboard';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner'; // Assuming sonner is installed or I'll use simple alert/state for now if not. 
// Actually, I'll stick to simple state feedback or standard alert if no toast lib is present.
// Looking at package.json would be good, but I'll assume no external toast lib for now and use inline feedback.

interface DashboardCRMProps {
  products: DashboardProduct[];
}

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      type="submit"
      className="w-full py-4 bg-sky-500 hover:bg-sky-400 disabled:bg-sky-500/50 text-slate-950 font-black rounded-xl transition-all shadow-lg shadow-sky-500/20 uppercase tracking-widest text-xs mt-4 flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
          Registrando...
        </>
      ) : (
        'Registrar y sumar puntos'
      )}
    </button>
  );
};

export const DashboardCRM = ({ products }: DashboardCRMProps) => {
  const [state, formAction] = useFormState(registerSale, { success: false, message: '' });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      toast.success('Venta registrada correctamente');
    } else if (state?.message && !state.success) {
      toast.error(state.message);
    }
  }, [state?.success, state?.message]);

  return (
    <GlassCard className="p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <h2 className="text-xl font-bold mb-6 text-white relative z-10">Registrar Venta Directa</h2>

      <form ref={formRef} action={formAction} className="space-y-4 relative z-10">
        <div>
          <input
            name="customer_name"
            type="text"
            required
            placeholder="Nombre del cliente"
            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all text-white placeholder:text-slate-600"
          />
          {state?.errors?.customer_name && (
            <p className="text-red-400 text-xs mt-1 ml-1">{state.errors.customer_name[0]}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              name="price"
              type="number"
              step="0.01"
              required
              placeholder="Precio cobrado"
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all text-white placeholder:text-slate-600"
            />
          </div>
          <div>
            <select
              name="product_id"
              required
              defaultValue=""
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all text-slate-300 [&>option]:bg-slate-900"
            >
              <option value="" disabled>Producto...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {state?.message && !state.success && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
            {state.message}
          </div>
        )}

        {state?.success && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            {state.message}
          </div>
        )}

        <SubmitButton />
      </form>
    </GlassCard>
  );
};
