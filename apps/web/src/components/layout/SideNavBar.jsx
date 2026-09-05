import React from 'react';
import { useLanguage } from '../../hooks/useLanguage.js';

const SideNavBar = ({ activeTab, onNavigate, user, onLogout }) => {
  const { lang, toggle } = useLanguage();

  const primaryGroup = [
    { id: 'home', label: lang === 'en' ? 'Home' : 'Beranda Utama', icon: 'home' },
    { id: 'calculator', label: lang === 'en' ? '1RM Calculator' : 'Kalkulator 1RM Interaktif', icon: 'calculate' },
    { id: 'guide', label: lang === 'en' ? 'Science Guide' : 'Indeks Panduan Dasar', icon: 'menu_book' },
    { id: 'program', label: lang === 'en' ? 'Program Dashboard' : 'Program Dashboard', icon: 'dashboard' },
    { id: 'saved_programs', label: lang === 'en' ? 'Saved Programs' : 'Koleksi Program Saya', icon: 'collections_bookmark' },
    { id: 'wizard', label: lang === 'en' ? 'Generator Wizard' : 'Generator Wizard', icon: 'auto_awesome' },
  ];

  const parametersGroup = [
    { id: 'equipment', label: lang === 'en' ? 'Equipment & 1RM' : 'Alat Gym & Input 1RM', icon: 'fitness_center' },
    { id: 'goals', label: lang === 'en' ? 'Program Focus' : 'Fokus & Periodisasi', icon: 'flag' },
    { id: 'analytics', label: lang === 'en' ? 'Analytics & 1RM' : 'Analitik Volume & 1RM', icon: 'monitoring' },
    { id: 'screening', label: lang === 'en' ? 'Safety Center' : 'Pusat Keamanan Medis', icon: 'security' },
    { id: 'settings', label: lang === 'en' ? 'Settings & Frequency' : 'Pengaturan & Frekuensi', icon: 'settings' },
  ];

  return (
    <aside className="bg-white dark:bg-slate-900 text-[#2B2B2B] dark:text-white font-sans docked left-0 h-full w-64 shadow-xs flex flex-col py-6 border-r border-[#EBE5E2] dark:border-slate-800 shrink-0 overflow-y-auto z-40">
      
      {/* Profile & Brand Header */}
      <div className="px-5 mb-5 space-y-3">
        <div 
          onClick={() => onNavigate('wizard')}
          className="flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E63946] to-red-600 text-white font-black flex items-center justify-center text-sm shadow-md shadow-red-500/20 shrink-0 tracking-wider">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'APW'}
            </div>
            <div className="min-w-0 pr-1">
              <h2 className="font-extrabold text-xs text-slate-900 dark:text-white tracking-tight truncate">
                {user?.name || (lang === 'en' ? 'Athlete Profile' : 'Profil Atlet')}
              </h2>
              <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{user ? (lang === 'en' ? 'Cloud Synced' : 'Cloud Aktif') : 'aplanworkout Engine'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggle();
            }}
            title="Switch Language"
            className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-extrabold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs shrink-0"
          >
            {lang === 'en' ? '🇬🇧' : '🇮🇩'}
          </button>
        </div>
        
        {/* Primary Action Button */}
        <button 
          onClick={() => onNavigate('wizard')}
          className="w-full bg-[#E63946] hover:bg-[#D62839] text-white py-2.5 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-red-500/20 active:scale-95"
        >
          <span className="material-symbols-outlined text-base">auto_awesome</span>
          <span>{lang === 'en' ? 'Create New Program' : 'Buat Program Baru'}</span>
        </button>
      </div>

      {/* Navigation Links Grouped */}
      <div className="flex-1 px-3 space-y-5">
        
        {/* GROUP 1: UTAMA & DASHBOARD */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
            {lang === 'en' ? 'Main Dashboard' : 'Utama & Dashboard'}
          </div>
          {primaryGroup.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer text-xs border-0 ${
                  isActive 
                    ? 'bg-[#E63946] text-white font-bold shadow-sm shadow-red-500/20' 
                    : 'font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#E63946]'
                }`}
              >
                <span className={`material-symbols-outlined text-lg ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                  {item.icon}
                </span>
                <span className="tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* GROUP 2: PARAMETER & SAINS LATIHAN */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
            {lang === 'en' ? 'Parameters & Science' : 'Parameter & Sains Latihan'}
          </div>
          {parametersGroup.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer text-xs border-0 ${
                  isActive 
                    ? 'bg-[#E63946] text-white font-bold shadow-sm shadow-red-500/20' 
                    : 'font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#E63946]'
                }`}
              >
                <span className={`material-symbols-outlined text-lg ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                  {item.icon}
                </span>
                <span className="tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Footer System Info */}
      <div className="px-5 pt-4 border-t border-[#EBE5E2] dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-medium">
        <span>aplanworkout v1.0</span>
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Online Engine</span>
        </div>
      </div>
    </aside>
  );
};

export default SideNavBar;
