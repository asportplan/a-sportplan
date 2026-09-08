import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage.js';

const SideNavBar = ({ activeTab, onNavigate, user, onLogout }) => {
  const { lang, toggle } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer when navigating
  useEffect(() => {
    setMobileOpen(false);
  }, [activeTab]);

  // Close mobile drawer on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { id: 'home', label: lang === 'en' ? 'Home' : 'Beranda', icon: 'home' },
    { id: 'program', label: lang === 'en' ? 'Workout Program' : 'Program Latihan', icon: 'fitness_center' },
    { id: 'calculator', label: lang === 'en' ? '1RM Calculator' : 'Kalkulator 1RM', icon: 'calculate' },
    { id: 'saved_programs', label: lang === 'en' ? 'My Library' : 'Koleksi Tersimpan', icon: 'collections_bookmark' },
    { id: 'guide', label: lang === 'en' ? 'Training Guide' : 'Panduan Latihan', icon: 'menu_book' },
    { id: 'settings', label: lang === 'en' ? 'Settings' : 'Pengaturan', icon: 'settings' },
  ];

  const handleNav = (id) => {
    onNavigate(id);
  };

  // isCompact: true = icon-only mode (desktop collapsed), false = full labels
  const renderNavItem = (item, isCompact) => {
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => handleNav(item.id)}
        title={item.label}
        className={`w-full flex items-center gap-3 rounded-xl transition-all text-left cursor-pointer border-0 ${
          isCompact ? 'justify-center px-2 py-2.5' : 'px-3.5 py-2.5'
        } text-xs ${
          isActive 
            ? 'bg-[#E63946] text-white font-bold shadow-sm shadow-red-500/20' 
            : 'font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#E63946]'
        }`}
      >
        <span className={`material-symbols-outlined text-lg shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}>
          {item.icon}
        </span>
        {!isCompact && <span className="tracking-wide truncate">{item.label}</span>}
      </button>
    );
  };

  // isCompact: controls icon-only vs full-label rendering
  const renderContent = (isCompact) => (
    <>
      {/* Profile & Brand Header */}
      <div className={`${isCompact ? 'px-2' : 'px-5'} mb-4 space-y-3`}>
        {/* Profile Card */}
        {isCompact ? (
          <div 
            onClick={() => handleNav('wizard')}
            title={user?.name || 'Athlete Profile'}
            className="flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all py-1"
          >
            <img 
              src="/logo.png" 
              alt="APW" 
              className="w-10 h-10 rounded-2xl object-contain shadow-md shadow-red-500/25 shrink-0 hover:ring-2 hover:ring-[#E63946]/30 transition-all ring-1 ring-white/20" 
            />
          </div>
        ) : (
          <div 
            onClick={() => handleNav('wizard')}
            className="flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <img 
                src="/logo.png" 
                alt="APW" 
                className="w-10 h-10 rounded-2xl object-contain shadow-md shadow-red-500/20 shrink-0 ring-1 ring-white/20" 
              />
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
              onClick={(e) => { e.stopPropagation(); toggle(); }}
              title="Switch Language"
              className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-extrabold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs shrink-0"
            >
              {lang === 'en' ? '🇬🇧' : '🇮🇩'}
            </button>
          </div>
        )}
        
        {/* Primary Action Button */}
        <button 
          onClick={() => handleNav('wizard')}
          title={lang === 'en' ? 'Create New Program' : 'Buat Program Baru'}
          className={`w-full bg-[#E63946] hover:bg-[#D62839] text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-red-500/20 active:scale-95 ${
            isCompact ? 'py-2.5 px-0' : 'py-2.5 px-4'
          }`}
        >
          <span className="material-symbols-outlined text-base">auto_awesome</span>
          {!isCompact && <span>{lang === 'en' ? 'Create Program' : 'Buat Program'}</span>}
        </button>
      </div>

      {/* Navigation Links */}
      <div className={`flex-1 ${isCompact ? 'px-1.5' : 'px-3'} space-y-1 overflow-y-auto`}>
        {navItems.map(item => renderNavItem(item, isCompact))}
      </div>

      {/* Footer */}
      <div className={`${isCompact ? 'px-2 flex-col items-center' : 'px-5'} pt-3 border-t border-[#EBE5E2] dark:border-slate-800 text-[11px] text-slate-400 flex ${isCompact ? 'justify-center' : 'items-center justify-between'} font-medium gap-1`}>
        {isCompact ? (
          <span className="text-[9px]">APW</span>
        ) : (
          <>
            <span>aplanworkout v1.0</span>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Online</span>
            </div>
          </>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[70] md:hidden backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer — ALWAYS shows full labels (isCompact = false) */}
      <aside 
        className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-slate-900 shadow-2xl z-[80] md:hidden flex flex-col py-5 border-r border-[#EBE5E2] dark:border-slate-800 transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close Button */}
        <div className="flex justify-end px-4 mb-2">
          <button 
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer bg-transparent border-0"
          >
            <span className="material-symbols-outlined text-lg text-slate-500">close</span>
          </button>
        </div>
        {renderContent(false)}
      </aside>

      {/* Desktop Sidebar (collapsible) */}
      <aside 
        className={`hidden md:flex flex-col bg-white dark:bg-slate-900 text-[#2B2B2B] dark:text-white font-sans h-full shadow-xs border-r border-[#EBE5E2] dark:border-slate-800 shrink-0 z-40 transition-all duration-300 ease-in-out py-5 relative ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {/* Collapse/Expand Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center cursor-pointer z-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <span className={`material-symbols-outlined text-sm text-slate-500 transition-transform duration-300 ${collapsed ? 'rotate-0' : 'rotate-180'}`}>
            chevron_right
          </span>
        </button>
        
        {renderContent(collapsed)}
      </aside>
    </>
  );
};

export default SideNavBar;
