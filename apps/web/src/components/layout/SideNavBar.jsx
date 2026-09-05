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

  const primaryGroup = [
    { id: 'home', label: lang === 'en' ? 'Home' : 'Beranda', icon: 'home' },
    { id: 'calculator', label: lang === 'en' ? '1RM Calc' : 'Kalkulator 1RM', icon: 'calculate' },
    { id: 'guide', label: lang === 'en' ? 'Guide' : 'Panduan', icon: 'menu_book' },
    { id: 'program', label: lang === 'en' ? 'Dashboard' : 'Dashboard', icon: 'dashboard' },
    { id: 'saved_programs', label: lang === 'en' ? 'My Library' : 'Koleksi Saya', icon: 'collections_bookmark' },
    { id: 'wizard', label: lang === 'en' ? 'Generator' : 'Generator', icon: 'auto_awesome' },
  ];

  const parametersGroup = [
    { id: 'equipment', label: lang === 'en' ? 'Equipment' : 'Alat Gym', icon: 'fitness_center' },
    { id: 'goals', label: lang === 'en' ? 'Focus' : 'Fokus', icon: 'flag' },
    { id: 'analytics', label: lang === 'en' ? 'Analytics' : 'Analitik', icon: 'monitoring' },
    { id: 'screening', label: lang === 'en' ? 'Safety' : 'Keamanan', icon: 'security' },
    { id: 'settings', label: lang === 'en' ? 'Settings' : 'Pengaturan', icon: 'settings' },
  ];

  const handleNav = (id) => {
    onNavigate(id);
  };

  const renderNavItem = (item) => {
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => handleNav(item.id)}
        title={item.label}
        className={`w-full flex items-center gap-3 rounded-xl transition-all text-left cursor-pointer border-0 ${
          collapsed ? 'justify-center px-2 py-2.5' : 'px-3.5 py-2.5'
        } text-xs ${
          isActive 
            ? 'bg-[#E63946] text-white font-bold shadow-sm shadow-red-500/20' 
            : 'font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#E63946]'
        }`}
      >
        <span className={`material-symbols-outlined text-lg shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}>
          {item.icon}
        </span>
        {!collapsed && <span className="tracking-wide truncate">{item.label}</span>}
      </button>
    );
  };

  // Sidebar content (shared between desktop and mobile drawer)
  const sidebarContent = (
    <>
      {/* Profile & Brand Header */}
      <div className={`${collapsed ? 'px-2' : 'px-5'} mb-4 space-y-3`}>
        {/* Profile Card */}
        <div 
          onClick={() => handleNav('wizard')}
          className={`flex items-center cursor-pointer hover:opacity-90 transition-opacity p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <div className={`flex items-center ${collapsed ? '' : 'gap-2.5'} min-w-0`}>
            <div className={`${collapsed ? 'w-9 h-9 text-xs' : 'w-10 h-10 text-sm'} rounded-xl bg-gradient-to-br from-[#E63946] to-red-600 text-white font-black flex items-center justify-center shadow-md shadow-red-500/20 shrink-0 tracking-wider`}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'APW'}
            </div>
            {!collapsed && (
              <div className="min-w-0 pr-1">
                <h2 className="font-extrabold text-xs text-slate-900 dark:text-white tracking-tight truncate">
                  {user?.name || (lang === 'en' ? 'Athlete Profile' : 'Profil Atlet')}
                </h2>
                <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{user ? (lang === 'en' ? 'Cloud Synced' : 'Cloud Aktif') : 'aplanworkout Engine'}</span>
                </p>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={(e) => { e.stopPropagation(); toggle(); }}
              title="Switch Language"
              className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-extrabold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs shrink-0"
            >
              {lang === 'en' ? '🇬🇧' : '🇮🇩'}
            </button>
          )}
        </div>
        
        {/* Primary Action Button */}
        <button 
          onClick={() => handleNav('wizard')}
          title={lang === 'en' ? 'Create New Program' : 'Buat Program Baru'}
          className={`w-full bg-[#E63946] hover:bg-[#D62839] text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-red-500/20 active:scale-95 ${
            collapsed ? 'py-2.5 px-2' : 'py-2.5 px-4'
          }`}
        >
          <span className="material-symbols-outlined text-base">auto_awesome</span>
          {!collapsed && <span>{lang === 'en' ? 'Create Program' : 'Buat Program'}</span>}
        </button>
      </div>

      {/* Navigation Links */}
      <div className={`flex-1 ${collapsed ? 'px-1.5' : 'px-3'} space-y-4 overflow-y-auto`}>
        {/* Group 1 */}
        <div className="space-y-0.5">
          {!collapsed && (
            <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              {lang === 'en' ? 'Main' : 'Utama'}
            </div>
          )}
          {collapsed && <div className="border-b border-slate-200 dark:border-slate-700 mx-1 mb-1"></div>}
          {primaryGroup.map(renderNavItem)}
        </div>

        {/* Group 2 */}
        <div className="space-y-0.5">
          {!collapsed && (
            <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              {lang === 'en' ? 'Parameters' : 'Parameter'}
            </div>
          )}
          {collapsed && <div className="border-b border-slate-200 dark:border-slate-700 mx-1 mb-1"></div>}
          {parametersGroup.map(renderNavItem)}
        </div>
      </div>

      {/* Footer */}
      <div className={`${collapsed ? 'px-2 flex-col items-center' : 'px-5'} pt-3 border-t border-[#EBE5E2] dark:border-slate-800 text-[11px] text-slate-400 flex ${collapsed ? 'justify-center' : 'items-center justify-between'} font-medium gap-1`}>
        {collapsed ? (
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
      {/* Mobile Hamburger Toggle (shown in TopNavBar area on small screens) */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-[18px] left-4 z-[60] md:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer"
        title="Open Menu"
      >
        <span className="material-symbols-outlined text-lg text-slate-600 dark:text-slate-300">menu</span>
      </button>

      {/* Mobile Overlay Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[70] md:hidden backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
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
        {sidebarContent}
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
        
        {sidebarContent}
      </aside>
    </>
  );
};

export default SideNavBar;
