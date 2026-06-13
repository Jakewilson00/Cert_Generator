import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// `isConfigured` lets the app run (form + print) even before Supabase is set
// up. Saving/history simply stay disabled until the .env values are filled in.
export const isConfigured = Boolean(url && anonKey);

export const supabase = isConfigured
  ? createClient(url, anonKey)
  : null;

if (!isConfigured) {
  console.warn(
    'Supabase is not configured. Copy .env.example to .env and fill in ' +
    'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable saving + history.'
  );
}
