import React from 'react';
import { useLanguage } from '../../hooks/useLanguage.js';

const TopNavBar = ({ activeTab, onNavigate, user, onOpenLogin, onLogout }) => {
  const { lang, toggle } = useLanguage();

  const navLinks = [
    { id: 'home', label: lang === 'en' ? 'Home' : 'Beranda' },
    { id: 'calculator', label: lang === 'en' ? '1RM Calculator' : 'Kalkulator 1RM' },
    { id: 'guide', label: lang === 'en' ? 'Guide' : 'Panduan' },
    { id: 'program', label: lang === 'en' ? 'Program' : 'Program' },
    { id: 'saved_programs', label: lang === 'en' ? 'My Library' : 'Koleksi Saya' },
    { id: 'wizard', label: lang === 'en' ? 'Generator' : 'Generator Wizard' },
  ];

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-900 dark:text-white font-sans sticky top-0 border-b border-[#EBE5E2] dark:border-slate-800 shadow-2xs flex justify-between items-center w-full px-4 sm:px-6 h-16 z-50">
      
      {/* Brand Logo & Title */}
      <button 
        onClick={() => onNavigate('home')} 
        className="flex items-center gap-2.5 cursor-pointer bg-transparent border-0 group"
      >
        <div className="w-9 h-9 rounded-xl bg-[#E63946] text-white font-black flex items-center justify-center text-xs shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform tracking-wider">
          APS
        </div>
        <div className="flex flex-col text-left">
          <span className="text-base font-black text-[#E63946] dark:text-red-400 tracking-tight leading-none">A-PlanSport</span>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 leading-none mt-0.5">
            {lang === 'en' ? 'Scientific Training Plan' : 'Preskripsi Latihan Sains'}
          </span>
        </div>
      </button>
      
      {/* Desktop Main Navigation Links */}
      <nav className="hidden lg:flex items-center gap-1 text-xs">
        {navLinks.map(nav => {
          const isActive = activeTab === nav.id;
          return (
            <button 
              key={nav.id}
              onClick={() => onNavigate(nav.id)} 
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer border-0 font-bold flex items-center gap-1.5 ${
                isActive 
                  ? 'bg-red-50 dark:bg-red-950/50 text-[#E63946] dark:text-red-400 shadow-2xs' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#E63946] hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{nav.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Tools & CTA */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Wizard CTA Button */}
        <button
          onClick={() => onNavigate('wizard')}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-[#E63946] hover:bg-[#D62839] text-white rounded-xl font-extrabold text-xs shadow-md shadow-red-500/20 transition-all cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-base">auto_awesome</span>
          <span>{lang === 'en' ? 'Create Program' : 'Buat Program'}</span>
        </button>

        {/* Language Switcher Pill Button */}
        <button
          onClick={toggle}
          title={lang === 'en' ? 'Switch to Bahasa Indonesia' : 'Switch to English'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
        >
          <span className="text-sm">{lang === 'en' ? '🇬🇧' : '🇮🇩'}</span>
          <span>{lang === 'en' ? 'EN' : 'ID'}</span>
        </button>

        {/* Settings Icon */}
        <button 
          onClick={() => onNavigate('settings')} 
          title="Pengaturan & Frekuensi" 
          className="p-2 text-slate-500 hover:text-[#E63946] dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer bg-transparent border-0 flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-xl">settings</span>
        </button>

        {/* User Auth Section */}
        {user ? (
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="w-6 h-6 rounded-lg bg-[#E63946] text-white font-bold flex items-center justify-center text-xs">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden sm:inline max-w-[100px] truncate">
              {user.name || user.email}
            </span>
            <button 
              onClick={onLogout}
              title="Keluar / Logout"
              className="text-slate-400 hover:text-[#E63946] transition-colors p-1 rounded-full cursor-pointer bg-transparent border-0 flex items-center"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            className="px-3.5 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl transition-all flex items-center gap-1.5 text-xs cursor-pointer hover:bg-slate-800"
          >
            <span className="material-symbols-outlined text-sm">login</span>
            <span>{lang === 'en' ? 'Login' : 'Masuk'}</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default TopNavBar;
