import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../lib/api-client.js';
import { supabase, isSupabaseConfigured, onAuthStateChange, signOutUser } from '../core/db/supabase-client.js';
import { pullUserDataFromCloud } from '../core/db/user-store.js';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check Supabase & local API session on mount
  useEffect(() => {
    let unsubscribe = () => {};

    const initAuth = async () => {
      if (isSupabaseConfigured()) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const supabaseUser = session.user;
            const userObj = {
              id: supabaseUser.id,
              email: supabaseUser.email,
              name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0],
              avatar_url: supabaseUser.user_metadata?.avatar_url || null,
              provider: 'supabase'
            };
            setUser(userObj);
            pullUserDataFromCloud();
          } else {
            checkLocalApiSession();
          }
        } catch (e) {
          checkLocalApiSession();
        }

        unsubscribe = onAuthStateChange(async (event, supabaseUser) => {
          if (supabaseUser) {
            const userObj = {
              id: supabaseUser.id,
              email: supabaseUser.email,
              name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0],
              avatar_url: supabaseUser.user_metadata?.avatar_url || null,
              provider: 'supabase'
            };
            setUser(userObj);
            await pullUserDataFromCloud();
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          }
          setLoading(false);
        });
      } else {
        checkLocalApiSession();
      }
      setLoading(false);
    };

    initAuth();

    return () => unsubscribe();
  }, []);

  const checkLocalApiSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSession();
      if (data && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.signIn(email, password);
      if (data && data.user) {
        setUser(data.user);
      }
      return { success: true };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Login gagal.';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.signUp(name, email, password);
      if (data && data.user) {
        setUser(data.user);
      }
      return { success: true };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Registrasi gagal.';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      if (isSupabaseConfigured()) {
        await signOutUser();
      }
      await api.signOut();
    } catch (err) {
      // Ignore sign-out errors
    }
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    clearError,
    checkSession: checkLocalApiSession,
  };
}
