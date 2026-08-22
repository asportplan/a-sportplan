import { createClient } from '@supabase/supabase-js';

// Environment variables from Vite
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL');
};

/**
 * Initialize Supabase Client with fallback for unconfigured environments
 */
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: (callback) => {
          callback('SIGNED_OUT', null);
          return { data: { subscription: { unsubscribe: () => {} } } };
        },
        signInWithOAuth: async () => ({ error: new Error('Supabase URL & Anon Key belum diatur di .env.local') }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({ eq: () => Promise.resolve({ data: null, error: null }), single: () => Promise.resolve({ data: null, error: null }) }),
        upsert: () => Promise.resolve({ data: null, error: null }),
        delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
      })
    };

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
