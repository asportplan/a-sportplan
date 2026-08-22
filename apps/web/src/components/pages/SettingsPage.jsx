import React, { useState, useEffect } from 'react';
import { getUserProfile, saveUserProfile, clearAllUserData } from '../../core/db/user-store.js';
import { useLanguage } from '../../hooks/useLanguage.js';

const SettingsPage = ({ onReset, user, onOpenLogin, onLogout }) => {
  const { lang, changeLanguage } = useLanguage();
  const [profile, setProfile] = useState({
    age: 25,
    training_age_level: 'BEGINNER',
    active_program_duration_weeks: 8,
    target_1rm_increase_pct: 10,
    preferred_language: 'id',
    weekly_custom_frequencies: {},
    frequency_mode: 'global',
    global_frequency: 3
  });

  useEffect(() => {
    const saved = getUserProfile();
    if (saved) setProfile(saved);
  }, []);

  const handleLangChange = (newLang) => {
    changeLanguage(newLang);
    handleGeneralChange('preferred_language', newLang);
  };

  const handleGeneralChange = (field, value) => {
    const updated = { ...profile, [field]: value };
    setProfile(updated);
    saveUserProfile(updated);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto font-sans">
      
      {/* Page Title */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-[#EBE5E2] dark:border-slate-800 space-y-2">
        <h2 className="text-xl font-bold text-[#2B2B2B] dark:text-white">
          {lang === 'en' ? 'System Settings & Account' : 'Pengaturan Aplikasi & Akun'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {lang === 'en' ? 'Manage user profile, default weekly training frequencies, language preferences, and cloud sync.' : 'Kelola data profil, frekuensi harian, opsi bahasa, dan reset sistem.'}
        </p>
      </div>

      {/* Athlete Identity Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-[#EBE5E2] dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#E63946]">badge</span>
          <span>{lang === 'en' ? 'Athlete & Program Identity' : 'Identitas Atlet & Program'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {lang === 'en' ? 'Athlete / User Name' : 'Nama Atlet / Pengguna'}
            </label>
            <input 
              type="text" 
              value={profile.athlete_name || ''} 
              onChange={(e) => handleGeneralChange('athlete_name', e.target.value)}
              placeholder={lang === 'en' ? 'e.g., John Doe' : 'Misal: Budi Santoso'}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-[#E63946]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {lang === 'en' ? 'Sport / Discipline' : 'Cabang Olahraga / Disiplin'}
            </label>
            <input 
              type="text" 
              value={profile.sport_branch || ''} 
              onChange={(e) => handleGeneralChange('sport_branch', e.target.value)}
              placeholder={lang === 'en' ? 'e.g., Soccer / Powerlifting' : 'Misal: Sepak Bola / Powerlifting'}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-[#E63946]"
            />
          </div>
        </div>
      </div>

      {/* Language Preferences Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-[#EBE5E2] dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#E63946]">language</span>
          <span>{lang === 'en' ? 'Display Language' : 'Bahasa Tampilan'}</span>
        </h3>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleLangChange('id')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
              lang === 'id'
                ? 'bg-[#E63946] text-white border-[#E63946] shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <span className="text-base">🇮🇩</span>
            <span>Bahasa Indonesia</span>
          </button>

          <button
            type="button"
            onClick={() => handleLangChange('en')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
              lang === 'en'
                ? 'bg-[#E63946] text-white border-[#E63946] shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <span className="text-base">🇬🇧</span>
            <span>English (US)</span>
          </button>
        </div>
      </div>

      {/* Reset & Storage Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-[#EBE5E2] dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-extrabold text-[#E63946] dark:text-red-400 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
          <span className="material-symbols-outlined">delete_forever</span>
          <span>{lang === 'en' ? 'Reset Local Data' : 'Hapus & Reset Data Lokal'}</span>
        </h3>

        <p className="text-xs text-slate-500 font-medium">
          {lang === 'en' 
            ? 'Clear all stored profiles, equipment inventory, and generated programs from local storage.'
            : 'Menghapus seluruh data profil, inventaris alat, dan hasil program yang tersimpan di browser.'
          }
        </p>

        <button
          type="button"
          onClick={() => {
            if (confirm(lang === 'en' ? 'Are you sure you want to reset all data?' : 'Yakin ingin menghapus seluruh data lokal?')) {
              clearAllUserData();
              onReset && onReset();
            }
          }}
          className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
        >
          {lang === 'en' ? 'Reset All App Data' : 'Hapus Seluruh Data Aplikasi'}
        </button>
      </div>

    </div>
  );
};

export default SettingsPage;
