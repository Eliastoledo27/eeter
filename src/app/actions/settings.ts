'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getSettings(category?: string) {
  const supabase = createClient();
  let query = supabase.from('app_settings').select('*');

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) return { error: error.message };

  // Transform array to object for easier consumption { key: value }
  const settingsMap = data.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, unknown>);

  return { data: settingsMap, metadata: data };
}

export async function updateSetting(key: string, value: unknown, reason: string = 'Update via dashboard') {
  const supabase = createClient();
  const user = await supabase.auth.getUser();
  if (!user.data.user) return { error: 'Unauthorized' };

  // 1. Get old value for history
  const { data: current } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .single();

  const oldValue = current?.value;

  // 2. Update setting
  const { error: updateError } = await supabase
    .from('app_settings')
    .upsert({
      key,
      value,
      updated_at: new Date().toISOString(),
      updated_by: user.data.user.id
    });

  if (updateError) return { error: updateError.message };

  // 3. Create history record
  const { error: historyError } = await supabase
    .from('settings_history')
    .insert({
      key,
      old_value: oldValue,
      new_value: value,
      changed_by: user.data.user.id,
      changed_reason: reason
    });

  if (historyError) console.error('Failed to create history record:', historyError);

  revalidatePath('/dashboard/settings');
  return { success: true };
}

export async function rollbackSetting(historyId: string) {
  const supabase = createClient();
  const user = await supabase.auth.getUser();
  if (!user.data.user) return { error: 'Unauthorized' };

  // 1. Get history record
  const { data: history } = await supabase
    .from('settings_history')
    .select('*')
    .eq('id', historyId)
    .single();

  if (!history) return { error: 'History record not found' };

  // 2. Revert to old_value
  const { error: revertError } = await supabase
    .from('app_settings')
    .update({
      value: history.old_value,
      updated_at: new Date().toISOString(),
      updated_by: user.data.user.id
    })
    .eq('key', history.key);

  if (revertError) return { error: revertError.message };

  // 3. Log the rollback
  await supabase
    .from('settings_history')
    .insert({
      key: history.key,
      old_value: history.new_value,
      new_value: history.old_value,
      changed_by: user.data.user.id,
      changed_reason: `Rollback to version from ${new Date(history.created_at).toLocaleDateString()}`
    });

  revalidatePath('/dashboard/settings');
  return { success: true };
}
