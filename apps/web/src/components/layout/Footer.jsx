import React from 'react';
import { useLanguage } from '../../hooks/useLanguage.js';

const Footer = () => {
  const { lang } = useLanguage();

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-[#EBE5E2] dark:border-slate-800 py-8 px-6 text-slate-500 dark:text-slate-400 text-xs font-sans mt-auto">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#E63946] text-white font-black flex items-center justify-center text-xs shadow-xs tracking-wider">
            APW
          </div>
          <div>
            <span className="font-extrabold text-[#E63946] dark:text-red-400 tracking-tight">aplanworkout</span>
            <span className="ml-2 text-slate-400 text-[11px]">v1.0 • {lang === 'en' ? 'Evidence-Based Weight Training System' : 'Sistem Preskripsi Latihan Beban Berbasis Sains'}</span>
          </div>
        </div>

        <div className="text-center md:text-right text-[11px] font-medium text-slate-400">
          <span>aplanworkout • {lang === 'en' ? 'Evidence-Based Weight Training System' : 'Sistem Preskripsi Latihan Beban Berbasis Sains'}</span>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
