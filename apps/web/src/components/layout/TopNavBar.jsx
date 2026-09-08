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
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-900 dark:text-white font-sans sticky top-0 border-b border-[#EBE5E2] dark:border-slate-800 shadow-2xs flex justify-between items-center w-full px-3 sm:px-6 h-16 z-50">
      
      {/* Brand Logo & Title */}
      <button 
        onClick={() => onNavigate('home')} 
        className="flex items-center gap-2 cursor-pointer bg-transparent border-0 group min-w-0"
      >
        <img 
          src="/logo.png" 
          alt="aplanworkout logo" 
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-contain shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform shrink-0 ring-1 ring-white/20" 
        />
        <div className="flex flex-col text-left min-w-0">
          <span className="text-sm sm:text-base font-black text-[#E63946] dark:text-red-400 tracking-tight leading-none truncate">aplanworkout</span>
          <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 dark:text-slate-500 leading-none mt-0.5 hidden xs:block truncate">
            {lang === 'en' ? 'Scientific Training' : 'Preskripsi Latihan'}
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
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
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
          className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
        >
          <span className="text-sm">{lang === 'en' ? '🇬🇧' : '🇮🇩'}</span>
          <span className="text-[11px] font-extrabold">{lang === 'en' ? 'EN' : 'ID'}</span>
        </button>

        {/* Settings Icon */}
        <button 
          onClick={() => onNavigate('settings')} 
          title="Pengaturan & Frekuensi" 
          className="p-1.5 text-slate-500 hover:text-[#E63946] dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer bg-transparent border-0 flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-xl">settings</span>
        </button>

        {/* User Auth Section */}
        {user ? (
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 sm:px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gradient-to-br from-[#E63946] to-red-600 text-white font-bold flex items-center justify-center text-[10px] sm:text-xs shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[60px] sm:max-w-[120px] truncate hidden sm:inline">
              {user.name || user.email?.split('@')[0]}
            </span>
            <button 
              onClick={onLogout}
              title="Keluar / Logout"
              className="text-slate-400 hover:text-[#E63946] transition-colors p-0.5 rounded-full cursor-pointer bg-transparent border-0 flex items-center shrink-0"
            >
              <span className="material-symbols-outlined text-base">logout</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            className="px-2.5 sm:px-3.5 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl transition-all flex items-center gap-1 text-xs cursor-pointer hover:bg-slate-800"
          >
            <span className="material-symbols-outlined text-sm">login</span>
            <span className="hidden xs:inline">{lang === 'en' ? 'Login' : 'Masuk'}</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default TopNavBar;
