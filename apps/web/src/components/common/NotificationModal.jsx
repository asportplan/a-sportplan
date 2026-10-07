import React from 'react';
import { useLanguage } from '../../hooks/useLanguage.js';

const NotificationModal = ({ isOpen, onClose, title, message, type = 'error' }) => {
  const { lang } = useLanguage();
  if (!isOpen) return null;

  const typeConfig = {
    error: {
      icon: 'health_and_safety',
      badgeBg: 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300',
      buttonBg: 'bg-[#E63946] hover:bg-[#D62839] text-white shadow-md shadow-red-500/20',
      borderColor: 'border-rose-200 dark:border-rose-800'
    },
    warning: {
      icon: 'warning',
      badgeBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
      buttonBg: 'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-500/20',
      borderColor: 'border-amber-200 dark:border-amber-800'
    },
    success: {
      icon: 'check_circle',
      badgeBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800'
    },
    info: {
      icon: 'info',
      badgeBg: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
      buttonBg: 'bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-500/20',
      borderColor: 'border-sky-200 dark:border-sky-800'
    }
  };

  const config = typeConfig[type] || typeConfig.error;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className={`bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg p-6 shadow-2xl border ${config.borderColor} relative space-y-5 transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl ${config.badgeBg} flex items-center justify-center shrink-0 shadow-xs`}>
            <span className="material-symbols-outlined text-2xl">{config.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1 tracking-tight leading-snug">
              {title || (lang === 'en' ? 'System Notification' : 'Pemberitahuan Sistem')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${config.buttonBg}`}
          >
            {lang === 'en' ? 'I Understand' : 'Saya Mengerti'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
