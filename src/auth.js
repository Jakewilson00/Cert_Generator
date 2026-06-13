import { supabase, isConfigured } from './supabase.js';

export async function getSession() {
  if (!isConfigured) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function signOut() {
  if (!isConfigured) return;
  await supabase.auth.signOut();
}

export function onAuthChange(cb) {
  if (!isConfigured) return;
  supabase.auth.onAuthStateChange((_event, session) => cb(session));
}
