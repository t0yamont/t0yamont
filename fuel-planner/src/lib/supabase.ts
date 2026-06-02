import { createClient } from '@supabase/supabase-js';

// Strip any trailing slash — a common copy-paste mistake that causes
// "Invalid path specified in request URL" from the Supabase auth client.
const rawUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseUrl = rawUrl.replace(/\/+$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => Boolean(supabaseUrl && supabaseAnonKey);

/** Returns a human-readable diagnosis if the URL looks wrong. */
export function supabaseUrlDiagnosis(): string | null {
  if (!rawUrl) return null;
  // URL should look like https://<ref>.supabase.co with no path
  try {
    const u = new URL(supabaseUrl);
    if (u.pathname !== '/') {
      return `VITE_SUPABASE_URL should be just the project URL with no path (e.g. https://xxxx.supabase.co). Got: ${supabaseUrl}`;
    }
  } catch {
    return `VITE_SUPABASE_URL is not a valid URL: ${rawUrl}`;
  }
  return null;
}
