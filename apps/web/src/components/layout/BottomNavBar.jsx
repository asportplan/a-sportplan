import React from 'react';
import { useLanguage } from '../../hooks/useLanguage.js';

const BottomNavBar = ({ activeTab, onNavigate }) => {
  const { lang } = useLanguage();

  const items = [
    { id: 'home', label: lang === 'en' ? 'Home' : 'Beranda', icon: 'home' },
    { id: 'calculator', label: lang === 'en' ? '1RM Calc' : 'Kalkulator', icon: 'calculate' },
    { id: 'wizard', label: lang === 'en' ? 'Wizard' : 'Wizard', icon: 'auto_awesome' },
    { id: 'program', label: lang === 'en' ? 'Program' : 'Program', icon: 'dashboard' },
    { id: 'guide', label: lang === 'en' ? 'Guide' : 'Panduan', icon: 'menu_book' },
  ];

  return (
    <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-[#EBE5E2] dark:border-slate-800 fixed bottom-0 left-0 right-0 z-50 md:hidden w-full flex justify-around items-center px-2 py-2 shadow-lg">
      {items.map(item => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer border-0 ${
              isActive
                ? 'text-[#E63946] dark:text-red-400 font-extrabold scale-105'
                : 'text-slate-500 dark:text-slate-400 font-medium hover:text-[#E63946]'
            }`}
          >
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNavBar;
