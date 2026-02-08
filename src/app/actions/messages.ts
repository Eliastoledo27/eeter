'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

import type { Message } from '@/types';

// Exporting types for other consumers if needed (though they should use @/types now)
export type { Message };

export async function getMessages() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  // Check if user is admin via metadata or profile
  // For simplicity, we'll fetch profile role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';

  let query = supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false });

  // If NOT admin, only show messages where user is receiver OR sender
  // Since RLS policies are hard to debug without CLI, we enforce logic here too.
  if (!isAdmin) {
    query = query.or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
  }

  const { data, error } = await query;

  if (error) {
    // console.error('Error fetching messages:', error);
    return [];
  }

  return data as Message[];
}

// New action to fetch full conversation history with a user
export async function getConversation(userId: string) {
  const supabase = createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Check if admin
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const isAdmin = profile?.role === 'admin';

  // If not admin, can only fetch own conversation
  if (!isAdmin && userId !== user.id) return [];

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: true });

  if (error) {
    // console.error('Error fetching conversation:', error);
    return [];
  }

  return data as Message[];
}

export async function sendMessage(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;
  const receiverId = formData.get('receiver_id') as string; // Optional

  if (!name || !email || !message) {
    return { error: 'Faltan campos obligatorios' };
  }

  let senderId = user?.id || null;

  // If not logged in, try to link to existing user by email
  // This improves the link between Supabase profiles and messages
  if (!senderId && email) {
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      senderId = existingUser.id;
    }
  }

  const payload: Record<string, string | number | null | undefined> = {
    name,
    email,
    subject,
    message,
    status: 'unread',
    sender_id: senderId,
  };

  if (receiverId) {
    payload.receiver_id = receiverId;
  }

  const { error } = await supabase
    .from('messages')
    .insert(payload);

  if (error) {
    // console.error('Error sending message:', error);
    return { error: 'Error al enviar el mensaje' };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function replyMessage(originalMessageId: string, replyText: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'No autorizado' };

  // Fetch original message to get receiver details
  const { data: original } = await supabase
    .from('messages')
    .select('*')
    .eq('id', originalMessageId)
    .single();

  if (!original) return { error: 'Mensaje original no encontrado' };

  // If admin replying to user
  const receiverId = original.sender_id;

  const { error } = await supabase.from('messages').insert({
    sender_id: user.id,
    receiver_id: receiverId,
    name: 'Soporte Éter', // Or Admin Name
    email: user.email || 'soporte@eter.com',
    subject: `Re: ${original.subject}`,
    message: replyText,
    status: 'unread',
    is_admin_reply: true
  });

  if (error) {
    // console.error('Error sending reply:', error);
    return { error: 'Error al enviar respuesta' };
  }

  // Mark original as read/archived?
  await markMessageAsRead(originalMessageId);

  revalidatePath('/dashboard');
  return { success: true };
}

export async function sendAdminMessage(receiverId: string, messageText: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'No autorizado' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'support'].includes(profile.role)) {
    return { error: 'Permisos insuficientes' };
  }

  const { error } = await supabase.from('messages').insert({
    sender_id: user.id,
    receiver_id: receiverId,
    name: profile.full_name || 'Soporte Éter',
    email: user.email || 'soporte@eter.com',
    subject: 'Nuevo mensaje',
    message: messageText,
    status: 'unread',
    is_admin_reply: true
  });

  if (error) {
    return { error: 'Error al enviar el mensaje' };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function sendAdminMessageToAll(messageText: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'No autorizado' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'support'].includes(profile.role)) {
    return { error: 'Permisos insuficientes' };
  }

  const { data: recipients, error: recipientsError } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .not('role', 'in', '(admin,support)');

  if (recipientsError) {
    return { error: `Error al obtener perfiles: ${recipientsError.message}` };
  }

  const rows = (recipients || [])
    .filter((recipient) => recipient.id)
    .map((recipient) => ({
      sender_id: user.id,
      receiver_id: recipient.id,
      name: profile.full_name || 'Soporte Éter',
      email: user.email || 'soporte@eter.com',
      subject: 'Mensaje masivo',
      message: messageText,
      status: 'unread',
      is_admin_reply: true
    }));

  if (rows.length === 0) {
    return { error: 'No hay usuarios para contactar' };
  }

  const { error } = await supabase
    .from('messages')
    .insert(rows);

  if (error) {
    return { error: 'Error al enviar el mensaje' };
  }

  revalidatePath('/dashboard');
  return { success: true, count: rows.length };
}

export async function markMessageAsRead(id: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('messages')
    .update({ status: 'read' })
    .eq('id', id);

  if (error) {
    // console.error('Error marking message as read:', error);
    return { error: 'Error al actualizar el mensaje' };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteMessage(id: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', id);

  if (error) {
    // console.error('Error deleting message:', error);
    return { error: 'Error al eliminar el mensaje' };
  }

  revalidatePath('/dashboard');
  return { success: true };
}
