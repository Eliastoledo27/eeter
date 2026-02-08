'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { MessagesInbox } from './MessagesInbox';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { sendAdminMessageToAll } from '@/app/actions/messages';
import { toast } from 'sonner';

export const MessagesManager = () => {
  const { profile, checkSession, isLoading } = useAuthStore();
  const isAdmin = profile?.role === 'admin' || profile?.role === 'support';
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const handleBulkSend = async () => {
    if (!bulkText.trim()) return;
    setIsSending(true);
    const result = await sendAdminMessageToAll(bulkText.trim());
    if (result.success) {
      toast.success(`Mensaje enviado a ${result.count} usuarios`);
      setBulkText('');
      setIsBulkOpen(false);
      setRefreshToken((prev) => prev + 1);
    } else {
      toast.error(result.error || 'Error al enviar el mensaje');
    }
    setIsSending(false);
  };

  return (
    <div className="space-y-6 pb-20 relative min-h-screen animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-3">
            {isAdmin ? 'Centro de Mensajes' : 'Soporte y Ayuda'}
          </h1>
          <p className="text-slate-500 text-lg max-w-xl font-medium">
            {isAdmin
              ? 'Gestiona todas las conversaciones con tus clientes en un solo lugar.'
              : '¿Tienes dudas? Escríbenos y te responderemos a la brevedad.'}
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-semibold text-slate-600">
            {isLoading ? (
              <span>Cargando rol...</span>
            ) : (
              <span>Rol: {profile?.role || 'desconocido'}</span>
            )}
          </div>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setIsBulkOpen(true)}
            className="bg-[#1E40AF] hover:bg-[#1E3A8A] text-white rounded-xl px-6"
          >
            Enviar a todos
          </Button>
        )}
      </div>

      {/* New Inbox Component */}
      <MessagesInbox isAdmin={isAdmin} refreshToken={refreshToken} currentUserId={profile?.id} />

      {isBulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-xl">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Mensaje masivo</h3>
              <p className="text-xs text-slate-500 mt-1">Se enviara a todos los perfiles registrados (excepto admin/soporte).</p>
            </div>
            <div className="p-5 space-y-4">
              <Textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Escribe el mensaje que veran todos los usuarios..."
                className="min-h-[140px] resize-none"
              />
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsBulkOpen(false)} disabled={isSending}>
                  Cancelar
                </Button>
                <Button onClick={handleBulkSend} disabled={!bulkText.trim() || isSending}>
                  {isSending ? 'Enviando...' : 'Enviar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
