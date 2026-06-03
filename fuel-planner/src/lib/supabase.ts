import { createClient } from '@supabase/supabase-js';

// Strip any trailing slash — a common copy-paste mistake that causes
// "Invalid path specified in request URL" from the Supabase auth client.
const rawUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseUrl = rawUrl.replace(/\/+$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

// Check first — createClient throws "supabaseUrl is required" when given empty strings,
// which crashes this module at import time and prevents React from mounting.
const configured = Boolean(supabaseUrl && supabaseAnonKey);

export const isSupabaseConfigured = () => configured;

// Only create the real client when credentials exist.
// All callers (AuthProvider etc.) guard with isSupabaseConfigured() before using this.
export const supabase = configured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : ({} as ReturnType<typeof createClient>);

/** Returns a human-readable diagnosis if the URL looks wrong. */
export function supabaseUrlDiagnosis(): string | null {
  if (!rawUrl) return null;
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
