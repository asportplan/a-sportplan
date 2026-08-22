import React, { useState } from 'react';
import { signInWithGoogle, isSupabaseConfigured } from '../../core/db/supabase-client.js';

export function AuthModal({ isOpen, onClose, lang = 'id', onAuthSuccess, authHook }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const isEn = lang === 'en';
  const configured = isSupabaseConfigured();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      if (configured) {
        await signInWithGoogle();
      } else {
        // Demo fallback for local development before Supabase keys are added
        if (authHook?.signIn) {
          await authHook.signIn('demo@afitform.com', 'demo123');
        }
      }
      if (onAuthSuccess) onAuthSuccess();
      onClose();
    } catch (err) {
      console.error('Google Auth Error:', err);
      setErrorMsg(err.message || (isEn ? 'Failed to sign in' : 'Gagal masuk. Tambahkan kredensial Supabase pada file .env.local untuk Google Auth.'));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (mode === 'login') {
        if (authHook?.signIn) {
          const res = await authHook.signIn(email || 'demo@afitform.com', password || 'demo123');
          if (res.success) {
            if (onAuthSuccess) onAuthSuccess();
            onClose();
          } else {
            setErrorMsg(res.error || (isEn ? 'Login failed' : 'Gagal masuk. Periksa email & kata sandi Anda.'));
          }
        }
      } else {
        if (authHook?.signUp) {
          const res = await authHook.signUp(name || 'User AFITFORM', email || 'demo@afitform.com', password || 'demo123');
          if (res.success) {
            if (onAuthSuccess) onAuthSuccess();
            onClose();
          } else {
            setErrorMsg(res.error || (isEn ? 'Registration failed' : 'Gagal pendaftaran.'));
          }
        }
      }
    } catch (err) {
      setErrorMsg(err.message || (isEn ? 'Authentication error' : 'Terjadi kesalahan autentikasi'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '480px',
          minWidth: '320px',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          margin: 'auto',
          boxSizing: 'border-box'
        }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div 
          style={{ padding: '36px 24px 24px 24px' }}
          className="relative bg-gradient-to-r from-red-600 via-red-500 to-rose-600 text-white text-center"
        >
          <button 
            type="button"
            onClick={onClose}
            style={{ position: 'absolute', top: '16px', right: '16px' }}
            className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/15 transition-colors cursor-pointer border-0 bg-transparent flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
          
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 mb-3 shadow-lg mx-auto">
            <span className="material-symbols-outlined text-2xl text-white">cloud_done</span>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-normal my-1">
            {mode === 'login' 
              ? (isEn ? 'Sign In to A-PlanSport' : 'Masuk ke A-PlanSport') 
              : (isEn ? 'Daftar Akun Baru' : 'Daftar Akun Baru')}
          </h2>
          <p className="text-xs text-red-100 font-medium mt-1 leading-relaxed w-full px-2">
            {isEn 
              ? 'Sync 1RM data & training plans across all devices' 
              : 'Sinkronisasi data 1RM & program latihan antar perangkat'}
          </p>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px' }} className="space-y-4">

          {/* Google 1-Click Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-white font-extrabold text-xs sm:text-sm rounded-2xl border border-slate-300 dark:border-slate-700 shadow-sm hover:shadow flex items-center justify-center gap-3 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>
              {loading 
                ? (isEn ? 'Connecting...' : 'Menghubungkan...') 
                : (isEn ? 'Continue with Google' : 'Lanjutkan dengan Google')}
            </span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-slate-200 dark:border-slate-700 w-full"></div>
            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              {isEn ? 'Or with Email' : 'Atau dengan Email'}
            </span>
            <div className="border-t border-slate-200 dark:border-slate-700 w-full"></div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500 text-base shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  {isEn ? 'Full Name' : 'Nama Lengkap'}
                </label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isEn ? 'John Doe' : 'Nama Anda'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Email
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E63946]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                {isEn ? 'Password' : 'Kata Sandi'}
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E63946]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#E63946] hover:bg-[#D62839] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-red-500/20 transition-all cursor-pointer disabled:opacity-50 mt-1"
            >
              {loading 
                ? (isEn ? 'Processing...' : 'Memproses...') 
                : mode === 'login' 
                  ? (isEn ? 'Sign In' : 'Masuk') 
                  : (isEn ? 'Register' : 'Daftar')}
            </button>
          </form>

          {/* Toggle Login vs Register */}
          <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
            {mode === 'login' ? (
              <span>
                {isEn ? "Don't have an account? " : "Belum punya akun? "}
                <button 
                  type="button" 
                  onClick={() => { setMode('register'); setErrorMsg(null); }}
                  className="font-bold text-[#E63946] hover:underline cursor-pointer bg-transparent border-0"
                >
                  {isEn ? 'Register now' : 'Daftar sekarang'}
                </button>
              </span>
            ) : (
              <span>
                {isEn ? 'Already have an account? ' : 'Sudah punya akun? '}
                <button 
                  type="button" 
                  onClick={() => { setMode('login'); setErrorMsg(null); }}
                  className="font-bold text-[#E63946] hover:underline cursor-pointer bg-transparent border-0"
                >
                  {isEn ? 'Sign in' : 'Masuk ke akun'}
                </button>
              </span>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default AuthModal;
