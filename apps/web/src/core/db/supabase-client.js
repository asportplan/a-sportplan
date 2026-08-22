import { createClient } from '@supabase/supabase-js';

// Official Supabase Verified Production Credentials
const SUPABASE_URL = 'https://faijkobwgsgjiovtkgjp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaWprb2J3Z3NnamlvdnRrZ2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczOTU4NTUsImV4cCI6MjEwMjk3MTg1NX0.VeeWLg_0VgMtXoIJRl8jN_oRIm3rF2qwqtoL1EMMplc';

export const isSupabaseConfigured = () => true;

/**
 * Initialize Supabase Client
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  }
});

/**
 * Sign in using Google 1-Click OAuth
 */
export async function signInWithGoogle() {
  if (!isSupabaseConfigured()) {
    throw new Error('Konfigurasi Supabase belum disiapkan. Tambahkan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY pada file .env.local.');
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });

  if (error) throw error;
  return data;
}

/**
 * Sign out current user session
 */
export async function signOutUser() {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  if (!isSupabaseConfigured()) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Subscribe to Auth State Changes
 */
export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured()) {
    callback('SIGNED_OUT', null);
    return () => {};
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session?.user || null);
  });

  return () => subscription.unsubscribe();
}
