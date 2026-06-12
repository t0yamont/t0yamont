import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { PostRaceLogEntry } from '../types';

export async function getPostRaceLog(planId: string): Promise<PostRaceLogEntry | null> {
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabase
    .from('post_race_log')
    .select('*')
    .eq('plan_id', planId)
    .maybeSingle();
  return (data as PostRaceLogEntry) ?? null;
}

export async function savePostRaceLog(
  entry: Omit<PostRaceLogEntry, 'id' | 'created_at'>,
): Promise<PostRaceLogEntry | null> {
  if (!isSupabaseConfigured()) return null;
  // Delete any existing entry first (plan_id is unique), then insert fresh
  await supabase.from('post_race_log').delete().eq('plan_id', entry.plan_id);
  const { data, error } = await supabase
    .from('post_race_log')
    .insert(entry)
    .select()
    .single();
  if (error) throw error;
  return data as PostRaceLogEntry;
}
