import React, { useState, useEffect } from 'react';
import { 
  getSavedProgramsLibrary, 
  setActiveProgramInLibrary, 
  deleteProgramFromLibrary,
  saveProgramToLibrary
} from '../../core/db/user-store.js';
import { generatePDF } from '../../core/utils/pdf-generator.js';
import { useLanguage } from '../../hooks/useLanguage.js';

export default function SavedProgramsPage({ onSelectProgram, onCreateNew, currentProgram }) {
  const { lang } = useLanguage();
  const [library, setLibrary] = useState([]);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = () => {
    let items = getSavedProgramsLibrary();
    // If library is empty but a current program exists, auto-save it
    if (items.length === 0 && currentProgram) {
      items = saveProgramToLibrary(currentProgram, 'Program Latihan Utama');
    }
    setLibrary(items);
  };

  const handleActivate = (id) => {
    const { library: updatedLib, activeProgram } = setActiveProgramInLibrary(id);
    setLibrary(updatedLib);
    if (activeProgram && onSelectProgram) {
      onSelectProgram(activeProgram);
    }
    showToast(lang === 'en' ? '✓ Program successfully activated in Dashboard!' : '✓ Program berhasil diaktifkan di Dashboard!');
  };

  const handleDelete = (id, title) => {
    if (window.confirm(lang === 'en' ? `Are you sure you want to delete the program "${title}"?` : `Apakah Anda yakin ingin menghapus program "${title}"?`)) {
      const updated = deleteProgramFromLibrary(id);
      setLibrary(updated);
      showToast(lang === 'en' ? 'Program successfully deleted from collection.' : 'Program berhasil dihapus dari koleksi.');
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 left-4 right-4 sm:left-auto sm:right-6 z-50 bg-[#2B2B2B] text-white px-5 py-3 rounded-xl shadow-2xl font-bold text-xs flex items-center gap-3 border border-slate-700 animate-bounce">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg('')} aria-label="Close" className="text-slate-400 hover:text-white min-w-11 min-h-11 inline-flex items-center justify-center rounded-lg">✕</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-[#EBE5E2] dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#E63946] dark:text-red-400 tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl">collections_bookmark</span>
            {lang === 'en' ? 'My Training Programs Collection' : 'Koleksi Program Latihan Saya'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs font-medium mt-1">
            {lang === 'en' ? 'Save, manage, and switch between your created training programs without losing data.' : 'Simpan, kelola, dan ganti antar program latihan yang telah Anda buat tanpa kehilangan data.'}
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-5 py-3 bg-[#E63946] hover:bg-[#D62839] text-white rounded-xl font-extrabold text-xs transition-all shadow-md shadow-red-500/20 cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-base">add_circle</span>
          {lang === 'en' ? 'Create New Program' : 'Buat Program Baru'}
        </button>
      </div>

      {/* Empty State */}
      {library.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 sm:p-12 text-center border border-[#EBE5E2] dark:border-slate-800 shadow-sm space-y-4 flex flex-col items-center justify-center w-full">
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 text-[#E63946] font-bold flex items-center justify-center text-3xl">
            <span className="material-symbols-outlined text-4xl">folder_off</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[#2B2B2B] dark:text-white">{lang === 'en' ? 'No Saved Programs Yet' : 'Belum Ada Program Tersimpan'}</h3>
          <p 
            style={{ width: '100%', maxWidth: '560px', margin: '0 auto' }} 
            className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium text-center block"
          >
            {lang === 'en' ? 'You have not saved any training program collections. Use the Wizard Generator to create your first structured training program.' : 'Anda belum menyimpan koleksi program latihan. Gunakan Generator Wizard untuk membuat program latihan terstruktur pertama Anda.'}
          </p>
          <button
            onClick={onCreateNew}
            className="px-6 py-3 bg-[#E63946] hover:bg-[#D62839] text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-red-500/20 cursor-pointer inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">auto_awesome</span>
            {lang === 'en' ? 'Start Wizard Generator' : 'Mulai Generator Wizard'}
          </button>
        </div>
      ) : (
        /* Saved Programs Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {library.map((item) => {
            const isAct = item.isActive;
            const weeks = item.duration_weeks || item.programData?.periodization?.totalWeeks || 8;
            const dateStr = new Date(item.created_at || Date.now()).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            return (
              <div 
                key={item.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-6 border transition-all flex flex-col justify-between space-y-4 shadow-sm ${
                  isAct 
                    ? 'border-[#E63946] ring-2 ring-red-500/20 dark:border-red-500' 
                    : 'border-[#EBE5E2] dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Status Badge & Meta */}
                  <div className="flex justify-between items-center gap-2 mb-3">
                    {isAct ? (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-[11px] font-black rounded-full border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {lang === 'en' ? 'Active on Dashboard' : 'Aktif di Dashboard'}
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-[11px] font-bold rounded-full border border-slate-200 dark:border-slate-700">
                        {lang === 'en' ? 'Saved' : 'Tersimpan'}
                      </span>
                    )}

                    <span className="text-[11px] font-mono text-slate-400">
                      {dateStr}
                    </span>
                  </div>

                  {/* Program Title */}
                  <h3 className="text-lg font-black text-[#2B2B2B] dark:text-white leading-tight">
                    {item.title}
                  </h3>

                  {/* Details */}
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span className="px-2.5 py-1 bg-[#FAF8F7] dark:bg-slate-800 rounded-lg border border-[#EBE5E2] dark:border-slate-700">
                      ⏱️ {weeks} {lang === 'en' ? 'Weeks' : 'Minggu'}
                    </span>
                    <span className="px-2.5 py-1 bg-[#FAF8F7] dark:bg-slate-800 rounded-lg border border-[#EBE5E2] dark:border-slate-700">
                      {lang === 'en' ? 'Target 1RM:' : 'Target 1RM:'} +{item.programData?.metadata?.target_1rm_increase_pct || 10}%
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-4 border-t border-[#EBE5E2] dark:border-slate-800 flex flex-wrap gap-2 justify-between items-center">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleActivate(item.id)}
                      disabled={isAct}
                      className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                        isAct
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-default'
                          : 'bg-[#E63946] hover:bg-[#D62839] text-white shadow-md shadow-red-500/20'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">
                        {isAct ? 'check_circle' : 'visibility'}
                      </span>
                      {isAct ? (lang === 'en' ? 'Active' : 'Aktif') : (lang === 'en' ? 'View & Activate' : 'Lihat & Aktifkan')}
                    </button>

                    <button
                      onClick={() => generatePDF(item.programData)}
                      title="Export PDF Program Ini"
                      className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    title="Hapus Program Ini"
                    className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
