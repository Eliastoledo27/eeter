'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function uploadCatalog(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;
  const file = formData.get('file') as File;

  if (!file || !title || !category) {
    return { error: 'Missing required fields' };
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('catalogs')
    .upload(fileName, file);

  if (uploadError) {
    return { error: 'Failed to upload file' };
  }

  const { data } = supabase.storage
    .from('catalogs')
    .getPublicUrl(fileName);

  const publicUrl = data.publicUrl;

  const { data: insertedData, error: dbError } = await supabase
    .from('catalogs')
    .insert({
      user_id: user.id,
      title,
      description,
      category,
      file_url: publicUrl,
    })
    .select()
    .single();

  if (dbError) {
    return { error: 'Failed to save catalog metadata' };
  }

  revalidatePath('/dashboard');
  return { success: true, catalog: insertedData };
}

export async function deleteCatalog(id: string, fileUrl: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const { error: dbError } = await supabase
    .from('catalogs')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (dbError) return { error: 'Failed to delete catalog' };

  const path = fileUrl.split('/catalogs/').pop();
  if (path) {
    await supabase.storage.from('catalogs').remove([path]);
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function getCatalogs(query?: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  let dbQuery = supabase
    .from('catalogs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (query) {
    dbQuery = dbQuery.or(`title.ilike.%${query}%,category.ilike.%${query}%`);
  }

  const { data, error } = await dbQuery;

  if (error) {
    return [];
  }

  return data;
}
