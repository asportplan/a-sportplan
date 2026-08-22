import React, { useState } from 'react';
import { generatePDF } from '../../core/utils/pdf-generator.js';
import { generateExcel } from '../../core/utils/excel-generator.js';
import { toggleEquipment, saveProgramToLibrary, getUserProfile, getUserEquipment } from '../../core/db/user-store.js';
import { MST_EXERCISES } from '../../core/db/master-data.js';
import { useLanguage } from '../../hooks/useLanguage.js';
import { tMessage } from '../../core/utils/i18n.js';

// Format weight to clean numbers (round to nearest 0.5 kg, no ugly decimals)
const formatWeight = (val) => {
  if (val === null || val === undefined || isNaN(val) || val === 0) return '—';
  const num = parseFloat(val);
  const rounded = Math.round(num * 2) / 2;
  return Number.isInteger(rounded) ? `${rounded} kg` : `${rounded.toFixed(1)} kg`;
};

// Format volume to integer with thousand separators
const formatVolume = (val, locale) => {
  if (!val || isNaN(val)) return '0 kg';
  const rounded = Math.round(parseFloat(val));
  return `${rounded.toLocaleString(locale === 'en' ? 'en-US' : 'id-ID')} kg`;
};

// Format system warnings to ensure full dual language translation
const formatSystemWarning = (warn, lang) => {
  if (!warn) return '';
  const isEn = lang === 'en';

  // Check if warn is a key in system_messages (e.g. 'target_unrealistic', 'target_ambitious')
  const translated = tMessage(warn);
  if (translated && translated !== warn) {
    return translated;
  }

  // Dual-language regex formatting for MVW & transition warnings
  if (isEn) {
    let str = warn;
    str = str.replace(/^Perhatian: Gym Anda belum memiliki alat untuk /, 'Notice: Your gym lacks equipment for ');
    str = str.replace(/Latihan Paha\/Kaki \(Knee Dominant\)/g, 'Quadriceps/Leg Training (Knee Dominant)');
    str = str.replace(/Latihan Pinggul\/Paha Belakang \(Hip Dominant\)/g, 'Hamstring/Glute Training (Hip Dominant)');
    str = str.replace(/Latihan Stabilitas Inti Tubuh \(Core\)/g, 'Core Stability Training (Core)');
    str = str.replace(/Keseimbangan Latihan Dada & Punggung \(Push\/Pull\)/g, 'Chest & Back Balance (Push/Pull)');
    str = str.replace(/Latihan Tarikan\/Dorongan Vertikal \(Pull Down \/ Shoulder Press\)/g, 'Vertical Pull/Push Training (Pull Down / Shoulder Press)');
    str = str.replace(/^Transisi Minggu (\d+) \((.*?)\) ➔ Minggu (\d+) \((.*?)\): Terdeteksi konflik interferensi molekuler AMPK-mTOR\./g, 'Transition Week $1 ($2) ➔ Week $3 ($4): Detected AMPK-mTOR molecular interference conflict.');
    str = str.replace(/^Transisi Blok (\d+) \((.*?)\) ➔ Blok (\d+) \((.*?)\): Terdeteksi potensi interferensi molekuler AMPK-mTOR\./g, 'Transition Block $1 ($2) ➔ Block $3 ($4): Detected potential AMPK-mTOR molecular interference.');
    return str;
  } else {
    let str = warn;
    str = str.replace(/^Notice: Your gym lacks equipment for /, 'Perhatian: Gym Anda belum memiliki alat untuk ');
    str = str.replace(/Quadriceps\/Leg Training \(Knee Dominant\)/g, 'Latihan Paha/Kaki (Knee Dominant)');
    str = str.replace(/Hamstring\/Glute Training \(Hip Dominant\)/g, 'Latihan Pinggul/Paha Belakang (Hip Dominant)');
    str = str.replace(/Core Stability Training \(Core\)/g, 'Latihan Stabilitas Inti Tubuh (Core)');
    str = str.replace(/Chest & Back Balance \(Push\/Pull\)/g, 'Keseimbangan Latihan Dada & Punggung (Push/Pull)');
    str = str.replace(/Vertical Pull\/Push Training \(Pull Down \/ Shoulder Press\)/g, 'Latihan Tarikan/Dorongan Vertikal (Pull Down / Shoulder Press)');
    return str;
  }
};

const ProgramResult = ({ programData, isLoading, onEditParameters, onCreateNew, onNavigate }) => {
  const { lang } = useLanguage();
  const [actualLogs, setActualLogs] = useState({});
  const [customNotes, setCustomNotes] = useState({});
  const [toastMsg, setToastMsg] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  const userProfile = getUserProfile() || {};
  const metadata = programData?.metadata || {};
  const athleteName = metadata.athlete_name || userProfile.athlete_name || '';
  const sportBranch = metadata.sport_branch || userProfile.sport_branch || '';

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-[#EBE5E2] dark:border-slate-800 max-w-xl mx-auto space-y-4 shadow-sm flex flex-col items-center justify-center w-full">
        <div className="w-12 h-12 border-4 border-red-200 border-t-[#E63946] rounded-full animate-spin"></div>
        <h3 className="text-lg font-bold text-[#2B2B2B] dark:text-white">
          {lang === 'en' ? 'Generating Scientific Training Program...' : 'Menyusun Program Latihan Saintifik...'}
        </h3>
        <p 
          style={{ width: '100%', maxWidth: '560px', margin: '0 auto' }} 
          className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium leading-relaxed text-center block"
        >
          {lang === 'en'
            ? 'Running sports science rule engine, calculating 1RM loads, and validating load safety caps.'
            : 'Menjalankan algoritma fisiologi latihan, mengkalkulasi beban 1RM, dan menerapkan batas keamanan beban.'
          }
        </p>
      </div>
    );
  }

  if (!programData || !programData.weeks || !Array.isArray(programData.weeks) || programData.weeks.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-[#EBE5E2] dark:border-slate-800 max-w-xl mx-auto space-y-4 shadow-sm flex flex-col items-center justify-center w-full">
        <span className="material-symbols-outlined text-5xl text-[#E63946]">warning</span>
        <h3 className="text-xl font-bold text-[#2B2B2B] dark:text-white">
          {lang === 'en' ? 'No Program Data Found' : 'Data Program Tidak Ditemukan'}
        </h3>
        <p 
          style={{ width: '100%', maxWidth: '560px', margin: '0 auto' }} 
          className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed text-center block"
        >
          {lang === 'en'
            ? 'Please run the Generator Wizard to build a new training program.'
            : 'Silakan jalankan Generator Wizard untuk membuat program latihan baru.'
          }
        </p>
      </div>
    );
  }

  const weeks = Array.isArray(programData?.weeks) ? programData.weeks : [];
  const system_warnings = Array.isArray(programData?.system_warnings) ? programData.system_warnings : [];
  const equipment_recommendations = Array.isArray(programData?.equipment_recommendations) ? programData.equipment_recommendations : [];

  const handleAddRecommendedTool = (slug) => {
    if (!slug) return;
    toggleEquipment(slug, true);
    setToastMsg(
      lang === 'en'
        ? `Equipment "${slug.replace(/_/g, ' ')}" added to your profile!`
        : `Alat "${slug.replace(/_/g, ' ')}" berhasil ditambahkan ke profil alat gym Anda!`
    );
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleActualLogChange = (exKey, field, val) => {
    setActualLogs(prev => ({
      ...prev,
      [exKey]: {
        ...(prev[exKey] || {}),
        [field]: val
      }
    }));
  };

  const handleNoteChange = (exKey, val) => {
    setCustomNotes(prev => ({
      ...prev,
      [exKey]: val
    }));
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-[#EBE5E2] dark:border-slate-800 w-full space-y-8 font-sans">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg('')} className="text-emerald-700 dark:text-emerald-300 font-bold hover:underline">✕</button>
        </div>
      )}

      {/* Header Stack Container */}
      <div className="space-y-4 border-b pb-5 border-[#EBE5E2] dark:border-slate-800 w-full min-w-0">
        
        {/* TIER 1: Full-Width Title & Metadata Badges */}
        <div className="space-y-2.5 w-full min-w-0">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#E63946] dark:text-red-400 tracking-tight leading-snug w-full block">
            {lang === 'en' ? 'Weight Training Program Results' : 'Hasil Program Latihan Beban'}
          </h2>

          {/* All Metadata Badges in 1 Clean Flowing Row */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold w-full">
            {athleteName && (
              <span className="px-3 py-1 rounded-xl bg-red-50 dark:bg-red-950/60 text-[#E63946] dark:text-red-400 font-extrabold border border-red-200/80 dark:border-red-800/80 flex items-center gap-1.5 shadow-2xs">
                <span className="material-symbols-outlined text-sm shrink-0">badge</span>
                <span>{lang === 'en' ? 'Athlete' : 'Nama'}: {athleteName}</span>
              </span>
            )}

            {sportBranch && (
              <span className="px-3 py-1 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-[#F3722C] dark:text-orange-400 font-extrabold border border-orange-200/80 dark:border-orange-800/80 flex items-center gap-1.5 shadow-2xs">
                <span className="material-symbols-outlined text-sm shrink-0">sports</span>
                <span>{lang === 'en' ? 'Sport' : 'Cabor'}: {sportBranch}</span>
              </span>
            )}

            <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-2xs">
              <span className="material-symbols-outlined text-sm shrink-0 text-slate-500">calendar_month</span>
              <span>{metadata?.duration_weeks || weeks.length} {lang === 'en' ? 'Weeks' : 'Minggu'}</span>
            </span>

            <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shadow-2xs">
              <span className="material-symbols-outlined text-sm shrink-0 text-emerald-600">fitness_center</span>
              <span>Level: {metadata?.training_age_level === 'BEGINNER' ? (lang === 'en' ? 'Beginner' : 'Pemula') : metadata?.training_age_level === 'INTERMEDIATE' ? (lang === 'en' ? 'Intermediate' : 'Menengah') : metadata?.training_age_level === 'ADVANCED' ? (lang === 'en' ? 'Advanced' : 'Lanjutan') : metadata?.training_age_level || 'Pemula'}</span>
            </span>

            <span className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-extrabold border border-amber-200 dark:border-amber-800 flex items-center gap-1.5 shadow-2xs">
              <span className="material-symbols-outlined text-sm shrink-0 text-amber-600">trending_up</span>
              <span>Target 1RM: +{metadata?.target_1rm_increase_pct || 10}%</span>
            </span>
          </div>
        </div>

        {/* TIER 2: 5 Action Buttons Bar (Full Width Below Title) */}
        <div className="pt-2 flex flex-wrap items-center gap-2 w-full">
          {onEditParameters && (
            <button 
              type="button"
              onClick={onEditParameters}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl font-extrabold text-xs transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
              title={lang === 'en' ? 'Edit Input Parameters' : 'Edit & Koreksi Parameter Latihan'}
            >
              <span className="material-symbols-outlined text-base shrink-0">edit_note</span>
              <span>{lang === 'en' ? 'Edit' : 'Edit Parameter'}</span>
            </button>
          )}

          <button 
            type="button"
            onClick={() => {
              const name = programData.metadata?.athlete_name || profile?.athlete_name || '';
              const sport = programData.metadata?.sport_branch || profile?.sport_branch || '';
              const duration = weeks.length || 8;
              const isEn = lang === 'en';
              
              let autoTitle = '';
              if (name && sport) {
                autoTitle = isEn 
                  ? `Program ${name} - ${sport} (${duration} Weeks)` 
                  : `Program ${name} - ${sport} (${duration} Minggu)`;
              } else if (name) {
                autoTitle = isEn 
                  ? `Program ${name} (${duration} Weeks)` 
                  : `Program ${name} (${duration} Minggu)`;
              } else if (sport) {
                autoTitle = isEn 
                  ? `Program ${sport} (${duration} Weeks)` 
                  : `Program ${sport} (${duration} Minggu)`;
              } else {
                autoTitle = isEn 
                  ? `Program ${duration} Weeks` 
                  : `Program ${duration} Minggu`;
              }
              
              setSaveTitle(autoTitle);
              setShowSaveModal(true);
            }}
            className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-base shrink-0">bookmark_add</span>
            <span>{lang === 'en' ? 'Save' : 'Simpan'}</span>
          </button>

          <button 
            type="button"
            onClick={() => generatePDF(programData)}
            className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-[#E63946] hover:bg-[#D62839] text-white rounded-xl font-extrabold text-xs transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-base shrink-0">picture_as_pdf</span>
            <span>PDF</span>
          </button>

          <button 
            type="button"
            onClick={() => generateExcel(programData)}
            className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-[#F9A826] hover:bg-[#E59716] text-slate-900 rounded-xl font-extrabold text-xs transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-base shrink-0">table_view</span>
            <span>Excel</span>
          </button>

          <button 
            type="button"
            onClick={() => {
              if (onCreateNew) onCreateNew();
              else if (onNavigate) onNavigate('wizard');
            }}
            className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-extrabold text-xs transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
            title={lang === 'en' ? 'Create another new training program' : 'Buat program latihan baru dari awal'}
          >
            <span className="material-symbols-outlined text-base shrink-0">add_circle</span>
            <span>{lang === 'en' ? 'New Program +' : 'Program Baru +'}</span>
          </button>
        </div>
      </div>

      {/* Save Program Modal */}
      {showSaveModal && (
        <div 
          onClick={() => {
            setShowSaveModal(false);
            setIsSavedSuccess(false);
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-6 overflow-y-auto animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '500px', minWidth: '320px' }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-[#EBE5E2] dark:border-slate-800 shadow-2xl space-y-4 shrink-0 relative z-10 my-8"
          >
            {!isSavedSuccess ? (
              <>
                <div className="flex justify-between items-center border-b border-[#EBE5E2] dark:border-slate-800 pb-3">
                  <h3 className="text-lg font-black text-[#2B2B2B] dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#E63946]">bookmark_add</span>
                    {lang === 'en' ? 'Save Program to Collection' : 'Simpan Program ke Koleksi'}
                  </h3>
                  <button onClick={() => { setShowSaveModal(false); setIsSavedSuccess(false); }} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer border-0 bg-transparent">✕</button>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === 'en'
                    ? <>Name this program so you can easily find and reactivate it from the <strong>My Programs</strong> menu.</>
                    : <>Beri nama program ini agar mudah ditemukan dan diaktifkan kembali kapan saja dari menu <strong>Koleksi Saya</strong>.</>
                  }
                </p>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  saveProgramToLibrary(programData, saveTitle);
                  setIsSavedSuccess(true);
                }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      {lang === 'en' ? 'Program Name' : 'Nama Program Latihan'}
                    </label>
                    <input 
                      type="text"
                      value={saveTitle}
                      onChange={(e) => setSaveTitle(e.target.value)}
                      placeholder={lang === 'en' ? 'e.g. Hypertrophy Program 12 Weeks' : 'Contoh: Program Hipertrofi 12 Minggu'}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => { setShowSaveModal(false); setIsSavedSuccess(false); }}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer border-0"
                    >
                      {lang === 'en' ? 'Cancel' : 'Batal'}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 cursor-pointer border-0"
                    >
                      {lang === 'en' ? 'Save Program' : 'Simpan Ke Koleksi'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center space-y-4 py-2">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-3xl shadow-md border border-emerald-200 dark:border-emerald-800">
                  <span className="material-symbols-outlined text-4xl">task_alt</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {lang === 'en' ? 'Program Saved Successfully!' : '✓ Program Berhasil Disimpan!'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium mt-2 leading-relaxed w-full px-2">
                    {lang === 'en'
                      ? `"${saveTitle}" is safely stored in your collection. What would you like to do next?`
                      : `"${saveTitle}" telah tersimpan aman di Koleksi Saya. Apa yang ingin Anda lakukan selanjutnya?`}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSaveModal(false);
                      setIsSavedSuccess(false);
                      if (onCreateNew) onCreateNew();
                      else if (onNavigate) onNavigate('wizard');
                    }}
                    className="w-full py-3 px-4 bg-[#E63946] hover:bg-[#D62839] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-red-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] border-0"
                  >
                    <span className="material-symbols-outlined text-lg">add_circle</span>
                    <span>{lang === 'en' ? 'Create New Program +' : 'Lanjut Buat Program Baru +'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowSaveModal(false);
                      setIsSavedSuccess(false);
                      if (onNavigate) onNavigate('saved_programs');
                    }}
                    className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all border-0"
                  >
                    <span className="material-symbols-outlined text-lg">collections_bookmark</span>
                    <span>{lang === 'en' ? 'Open My Library' : 'Buka Koleksi Saya'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowSaveModal(false);
                      setIsSavedSuccess(false);
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium pt-1 cursor-pointer bg-transparent border-0"
                  >
                    {lang === 'en' ? 'Stay on this page' : 'Tetap di halaman ini'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 w-full min-w-0">
        <div className="bg-[#FAF8F7] dark:bg-slate-800/60 border border-[#EBE5E2] dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs min-w-0 flex flex-col justify-between">
          <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            {lang === 'en' ? 'Total Program Duration' : 'Total Durasi Program'}
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#E63946] dark:text-red-400 block leading-tight">
            {metadata?.duration_weeks || weeks.length} <span className="text-sm sm:text-base font-bold text-slate-600 dark:text-slate-400">{lang === 'en' ? 'Weeks' : 'Minggu'}</span>
          </span>
        </div>

        <div className="bg-[#FAF8F7] dark:bg-slate-800/60 border border-[#EBE5E2] dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs min-w-0 flex flex-col justify-between">
          <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            {lang === 'en' ? 'Target 1RM Increase' : 'Target Kenaikan 1RM'}
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#F3722C] block leading-tight">
            +{metadata?.target_1rm_increase_pct || 10}%
          </span>
        </div>

        <div className="bg-[#FAF8F7] dark:bg-slate-800/60 border border-[#EBE5E2] dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs min-w-0 flex flex-col justify-between">
          <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            {lang === 'en' ? 'Periodization Strategy' : 'Strategi Periodisasi'}
          </span>
          <div className="block leading-tight">
            <span className="text-lg sm:text-xl font-black text-[#F9A826] block">
              {programData?.periodization?.strategy === 'SEQUENTIAL' ? 'Blok' : 'DUP'}
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-amber-700 dark:text-amber-400 block mt-0.5">
              {programData?.periodization?.strategy === 'SEQUENTIAL' ? '(Sequential)' : '(Concurrent)'}
            </span>
          </div>
        </div>
      </div>

      {/* Scientific Program Evaluation & Analytics Dashboard Card */}
      <div className="bg-[#FAF8F7] dark:bg-slate-800/60 border border-[#EBE5E2] dark:border-slate-700/80 rounded-2xl p-6 space-y-6 shadow-2xs w-full min-w-0">
        <div className="flex items-center gap-3 border-b border-[#EBE5E2] dark:border-slate-700 pb-4 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#E63946] text-white flex items-center justify-center shadow-xs shrink-0">
            <span className="material-symbols-outlined text-xl">analytics</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-extrabold text-[#2B2B2B] dark:text-white leading-snug">
              {lang === 'en' ? 'Scientific Evaluation & Physiological Diagnostics' : 'Hasil Evaluasi & Analisis Fisiologis Program'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              {lang === 'en'
                ? 'Comprehensive scientific rule engine assessment across 4 key physiological domains.'
                : 'Hasil penilaian komprehensif 4 domain fisiologis utama berbasis metodologi periodisasi saintifik.'
              }
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full min-w-0">
          {/* 1. Medical Safety Evaluation */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 min-w-0">
                <span className="material-symbols-outlined text-base text-emerald-600 shrink-0">health_and_safety</span>
                <span>{lang === 'en' ? 'Medical Safety Clearance' : 'Status Evaluasi Keamanan Medis'}</span>
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border shrink-0 ${
                programData?.medical_screening?.clearance_status === 'CLEAR'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
              }`}>
                {programData?.medical_screening?.clearance_status || 'CLEAR'}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              {programData?.medical_screening?.clearance_status === 'CLEAR'
                ? (lang === 'en' ? 'No cardiac or joint restrictions detected. Full 1RM & volume unlocked.' : 'Bebas dari hambatan medis. Akses penuh ke intensitas & volume 100%.')
                : (lang === 'en' ? 'Medical safety adjustments applied to load intensity or rest intervals.' : 'Penyesuaian keamanan medis aktif pada intensitas atau jeda istirahat.')
              }
            </p>
          </div>

          {/* 2. Target 1RM Feasibility */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 min-w-0">
                <span className="material-symbols-outlined text-base text-amber-600 shrink-0">trending_up</span>
                <span>{lang === 'en' ? '1RM Target Feasibility' : 'Kelayakan Target Kenaikan 1RM'}</span>
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border shrink-0 ${
                programData?.target_validation?.status === 'REALISTIC'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  : programData?.target_validation?.status === 'AMBITIOUS'
                  ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                  : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
              }`}>
                {programData?.target_validation?.status || 'REALISTIC'}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              {lang === 'en' ? 'Weekly progression rate:' : 'Laju kenaikan mingguan:'}{' '}
              <strong className="text-[#E63946] dark:text-red-400">+{programData?.target_validation?.weeklyIncrement ? Number(programData.target_validation.weeklyIncrement).toFixed(1) : '1.2'}%/mgg</strong>.{' '}
              {programData?.target_validation?.status === 'REALISTIC'
                ? (lang === 'en' ? 'Within physiological adaptation capacity.' : 'Berada dalam kapasitas adaptasi fisiologis normal.')
                : (lang === 'en' ? 'Requires disciplined nutrition and recovery.' : 'Membutuhkan pemulihan dan nutrisi yang disiplin.')
              }
            </p>
          </div>

          {/* 3. Periodization & Compatibility */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 min-w-0">
                <span className="material-symbols-outlined text-base text-sky-600 shrink-0">tune</span>
                <span>{lang === 'en' ? 'Periodization Structure' : 'Struktur Periodisasi Blok'}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-sky-50 text-sky-800 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800 shrink-0">
                {programData?.periodization?.strategy === 'SEQUENTIAL' ? 'Block (Sequential)' : 'DUP (Concurrent)'}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              {lang === 'en' ? 'Total Blocks:' : 'Total Blok Periodisasi:'}{' '}
              <strong className="text-slate-900 dark:text-white">{programData?.periodization?.blocks?.length || 1} Blok</strong>.{' '}
              {programData?.periodization?.strategy === 'SEQUENTIAL'
                ? (lang === 'en' ? 'Sequenced adaptation for maximum focus.' : 'Urutan fase terstruktur untuk fokus adaptasi maksimal.')
                : (lang === 'en' ? 'Undulating daily stimulus.' : 'Stimulus bergelombang harian.')
              }
            </p>
          </div>

          {/* 4. Energy & EPOC Calorie Estimation */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 min-w-0">
                <span className="material-symbols-outlined text-base text-orange-600 shrink-0">local_fire_department</span>
                <span>{lang === 'en' ? 'Total Volume Load & Energy' : 'Total Load Volume & Estimasi Energi'}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-orange-50 text-orange-800 border border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800 shrink-0">
                {formatVolume(weeks.reduce((sum, w) => sum + (w?.total_week_volume_kg || 0), 0), lang)}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              {lang === 'en' ? 'Estimated METs Intensity:' : 'Estimasi Intensitas METs:'}{' '}
              <strong className="text-orange-600 dark:text-orange-400">5.0 METs (Explosive Compound)</strong>.{' '}
              {lang === 'en' ? 'High EPOC post-exercise oxygen consumption effect.' : 'Efek konsumsi oksigen pasca-latihan (EPOC) tinggi.'}
            </p>
          </div>
        </div>
      </div>

      {/* Available Gym Equipment & Baseline 1RM Database Card */}
      {(() => {
        const rawEqList = programData?.equipment_data || getUserEquipment() || [];
        if (!rawEqList || rawEqList.length === 0) return null;

        return (
          <div className="bg-[#FAF8F7] dark:bg-slate-800/60 border border-[#EBE5E2] dark:border-slate-700/80 rounded-2xl p-6 space-y-4 shadow-2xs w-full min-w-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#EBE5E2] dark:border-slate-700 pb-3 min-w-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#F3722C] dark:bg-orange-950/60 dark:text-orange-400 flex items-center justify-center font-bold shrink-0">
                  <span className="material-symbols-outlined text-xl">fitness_center</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-extrabold text-[#2B2B2B] dark:text-white leading-snug">
                    {lang === 'en' ? 'Available Gym Equipment & Baseline 1RM Database' : 'Daftar Alat Gym & Database 1RM Baseline Atlet'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {lang === 'en'
                      ? 'Baseline 1RM loads used by the prescription engine for exact weight calculations.'
                      : 'Data beban 1RM dasar yang digunakan engine untuk mengkalkulasi beban latihan presisi.'
                    }
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-[#F3722C] dark:text-orange-400 text-xs font-black border border-orange-200 dark:border-orange-800 shrink-0">
                {rawEqList.length} {lang === 'en' ? 'Registered Equipment' : 'Alat Terdaftar'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full min-w-0">
              {rawEqList.map((item) => {
                const exMeta = MST_EXERCISES.find(e => e.exercise_slug === item.exercise_slug);
                const name = lang === 'en' ? (exMeta?.name_en || item.exercise_slug) : (exMeta?.name_id || item.exercise_slug);
                const category = exMeta?.category || (lang === 'en' ? 'General' : 'Umum');
                const has1RM = item.user_1rm_kg && Number(item.user_1rm_kg) > 0;

                return (
                  <div 
                    key={item.exercise_slug}
                    className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs min-w-0"
                  >
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white break-words leading-tight">
                        {name}
                      </h4>
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block break-words">
                        {category}
                      </span>
                    </div>

                    <div className="shrink-0 text-right">
                      {has1RM ? (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-black">
                          {item.user_1rm_kg} kg
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
                          {lang === 'en' ? 'RPE Mode' : 'Mode RPE'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Weekly Volume Projection Bar Chart & Distinct Contrast Table Card */}
      <div className="bg-[#FAF8F7] dark:bg-slate-800/60 border border-[#EBE5E2] dark:border-slate-700/80 rounded-2xl p-6 space-y-6 shadow-2xs w-full min-w-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 min-w-0">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-[#2B2B2B] dark:text-white leading-snug">
              {lang === 'en' 
                ? 'Estimated Weekly Training Volume (kg) & Periodization Breakdown' 
                : 'Estimasi Volume Latihan Mingguan (kg) & Perbedaan Siklus'
              }
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              {lang === 'en'
                ? 'Visual contrast between Overload Phase (Red) and Deload Recovery Phase (Amber/Golden).'
                : 'Perbandingan kontras antara fase Overload (Merah) dan fase Deload Recovery (Emas/Amber).'
              }
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold shrink-0">
            <span className="flex items-center gap-1.5 text-[#E63946] dark:text-red-400">
              <span className="w-3.5 h-3.5 rounded-full bg-[#E63946] shrink-0"></span>
              <span>{lang === 'en' ? 'Overload Phase (Progressive)' : 'Fase Overload (Progresif)'}</span>
            </span>
            <span className="flex items-center gap-1.5 text-[#B45309] dark:text-amber-400">
              <span className="w-3.5 h-3.5 rounded-full bg-[#F9A826] shrink-0"></span>
              <span>{lang === 'en' ? 'Deload Phase (Recovery)' : 'Fase Deload (Pemulihan)'}</span>
            </span>
          </div>
        </div>

        {/* Visual Bar Chart wrapped inside Overflow Container for 100% Horizontal Responsiveness */}
        {(() => {
          const vols = weeks.map(w => Math.round(w?.total_week_volume_kg || 0));
          const maxVol = Math.max(...vols, 1);
          const minVol = Math.min(...vols, 0);
          
          // Amplified floor calculation so small increments (e.g. +120kg) produce a clear step-up
          const floorVol = minVol > 0 ? Math.floor(minVol * 0.85) : 0;
          const range = maxVol - floorVol;
          const numWeeks = weeks.length;

          // Compute SVG point coordinates
          const points = weeks.map((w, idx) => {
            const vol = Math.round(w?.total_week_volume_kg || 0);
            let pct = 95;
            if (range > 0) {
              pct = Math.round(15 + ((vol - floorVol) / range) * 80);
            }
            const x = ((idx + 0.5) / numWeeks) * 100;
            // 240px container height. Top badge area takes 36px, bar height is 165px.
            const topOffsetPx = 42 + (1 - (pct / 100)) * 165;
            return { x, y: topOffsetPx, pct, vol, isDeload: w?.is_deload, week: w?.week_number };
          });

          return (
            <div className="w-full overflow-x-auto pb-3">
              <div className="min-w-[540px] pt-6 pb-2 border-b border-[#EBE5E2] dark:border-slate-700 relative font-sans">
                
                {/* SVG Connected Line & Trend Overlay (Connects ALL points) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
                  <defs>
                    <linearGradient id="volLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#E63946" />
                      <stop offset="50%" stopColor="#F9A826" />
                      <stop offset="100%" stopColor="#E63946" />
                    </linearGradient>
                    <filter id="shadowGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.15" />
                    </filter>
                  </defs>

                  {/* Continuous Connecting Line Across ALL Weeks */}
                  {points.map((p, idx) => {
                    if (idx === 0) return null;
                    const prev = points[idx - 1];
                    return (
                      <line
                        key={`line-${idx}`}
                        x1={`${prev.x}%`}
                        y1={prev.y}
                        x2={`${p.x}%`}
                        y2={p.y}
                        stroke="url(#volLineGradient)"
                        strokeWidth="3.5"
                        strokeDasharray="6,4"
                        filter="url(#shadowGlow)"
                      />
                    );
                  })}

                  {/* Nodes on top of bars */}
                  {points.map((p, idx) => (
                    <g key={`node-${idx}`}>
                      <circle
                        cx={`${p.x}%`}
                        cy={p.y}
                        r="6"
                        fill={p.isDeload ? '#F9A826' : '#E63946'}
                        stroke="#FFFFFF"
                        strokeWidth="2.5"
                        filter="url(#shadowGlow)"
                      />
                    </g>
                  ))}
                </svg>

                {/* Bar Chart Container */}
                <div className="flex items-end justify-between gap-2 h-64 px-2 relative z-10">
                  {weeks.map((w, idx) => {
                    if (!w) return null;
                    const vol = Math.round(w.total_week_volume_kg || 0);
                    let pct = 95;
                    if (range > 0) {
                      pct = Math.round(15 + ((vol - floorVol) / range) * 80);
                    }
                    const isDeload = w.is_deload;

                    return (
                      <div key={w.week_number || Math.random()} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group min-w-0">
                        
                        {/* Dynamic Volume Badge - Positioned cleanly ABOVE trendline nodes */}
                        <div className="mb-2 text-center">
                          <span className={`inline-block text-[10px] font-mono font-black px-2 py-0.5 rounded-md shadow-xs border transition-all ${
                            isDeload 
                              ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/90 dark:text-amber-300 dark:border-amber-700' 
                              : 'bg-red-100 text-red-900 border-red-300 dark:bg-red-950/90 dark:text-red-300 dark:border-red-700'
                          }`}>
                            {vol.toLocaleString('id-ID')}kg
                          </span>
                        </div>

                        {/* Bar Container */}
                        <div className="w-full max-w-[54px] flex flex-col justify-end h-full items-center">
                          <div 
                            style={{ height: `${pct}%` }} 
                            className={`w-full rounded-t-xl transition-all duration-500 shadow-md transform group-hover:scale-105 ${
                              isDeload 
                                ? 'bg-[#F9A826] hover:bg-[#E59716] border-t-4 border-[#D97706]' 
                                : 'bg-[#E63946] hover:bg-[#D62839] border-t-4 border-[#B7102A]'
                            }`}
                          ></div>
                        </div>

                        {/* Week Label */}
                        <span className={`text-xs font-black mt-1 ${isDeload ? 'text-[#B45309] dark:text-amber-400' : 'text-[#E63946] dark:text-red-400'}`}>
                          {lang === 'en' ? 'W' : 'M'}{w.week_number}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Perbandingan Karakter Siklus Latihan (Overload vs Deload Recovery) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="bg-[#FFF5F5] dark:bg-red-950/30 border border-[#FECDD3] dark:border-red-900/50 rounded-xl p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-[#E63946] dark:text-red-400 font-extrabold text-xs">
              <span className="material-symbols-outlined text-base">local_fire_department</span>
              <span>{lang === 'en' ? 'OVERLOAD PHASE (Progressive Stimulus)' : 'FASE OVERLOAD (Stimulasi Progresif)'}</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              {lang === 'en'
                ? 'Target volume at 100% capacity. Stimulates muscle hypertrophy, motor unit recruitment, and progressive strength adaptation.'
                : 'Volume latihan pada kapasitas 100%. Memicu hipertrofi sel otot, rekrutmen unit motorik saraf, dan adaptasi beban progresif.'
              }
            </p>
          </div>
          <div className="bg-[#FFFDF5] dark:bg-amber-950/30 border border-[#FDE68A] dark:border-amber-900/50 rounded-xl p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-[#B45309] dark:text-amber-400 font-extrabold text-xs">
              <span className="material-symbols-outlined text-base">self_improvement</span>
              <span>{lang === 'en' ? 'DELOAD RECOVERY (Restorative Phase)' : 'FASE DELOAD RECOVERY (Pemulihan Seluler)'}</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              {lang === 'en'
                ? 'Volume reduced by ~35-40% (fewer sets). Promotes tendon repair, central nervous system recovery, and prevents overtraining.'
                : 'Volume dipangkas ~35-40% (pengurangan set). Memulihkan jaringan tendon/sendi, penyembuhan SSP, & mencegah overtraining.'
              }
            </p>
          </div>
        </div>

        {/* Detailed Weekly Summary Table */}
        <div className="overflow-x-auto rounded-xl border border-[#EBE5E2] dark:border-slate-700">
          <table className="w-full text-left border-collapse min-w-[750px] text-xs">
            <thead>
              <tr className="bg-[#2B2B2B] text-white font-bold">
                <th className="p-3.5 w-20 text-center">{lang === 'en' ? 'Week' : 'Minggu'}</th>
                <th className="p-3.5">{lang === 'en' ? 'Training Focus' : 'Fokus Latihan'}</th>
                <th className="p-3.5 text-center w-44">{lang === 'en' ? 'Cycle Status' : 'Status Siklus'}</th>
                <th className="p-3.5 text-center w-64">{lang === 'en' ? 'Volume & Load Character' : 'Modulasi Volume & Target Beban'}</th>
                <th className="p-3.5 text-right w-36">{lang === 'en' ? 'Est. Volume (kg)' : 'Est. Volume (kg)'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE5E2] dark:divide-slate-800">
              {weeks.map(w => {
                if (!w) return null;
                const isDeload = w.is_deload;
                return (
                  <tr 
                    key={w.week_number || Math.random()} 
                    className={`transition-colors ${
                      isDeload 
                        ? 'bg-[#FFFBEB] dark:bg-amber-950/20 hover:bg-[#FEF3C7]' 
                        : 'bg-[#FFF5F5] dark:bg-red-950/20 hover:bg-[#FFE4E6]'
                    }`}
                  >
                    <td className="p-3.5 text-center font-black text-[#2B2B2B] dark:text-white">
                      {lang === 'en' ? 'Week' : 'Minggu'} {w.week_number}
                    </td>
                    <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200 capitalize">
                      {w.phase_slugs ? w.phase_slugs.join(', ').replace(/_/g, ' ') : (lang === 'en' ? 'General' : 'Umum')}
                    </td>
                    <td className="p-3.5 text-center">
                      {isDeload ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-[#F9A826] text-[#2B2B2B] shadow-xs">
                          <span>🧘 DELOAD RECOVERY</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#E63946] text-white shadow-xs">
                          <span>🔥 OVERLOAD PHASE</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-center font-medium text-slate-700 dark:text-slate-300">
                      {isDeload ? (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-extrabold text-[11px] border border-amber-300">
                          ⚡ -40% Volume Reduction (Deload)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-900 dark:text-red-300 font-extrabold text-[11px] border border-red-300">
                          📈 100% Target Load (Progressive)
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right font-mono font-black text-[#2B2B2B] dark:text-white">
                      {formatVolume(w.total_week_volume_kg, lang)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Equipment Recommendations */}
      {equipment_recommendations && equipment_recommendations.length > 0 && (
        <div className="bg-[#FAF8F7] dark:bg-slate-800/60 border border-[#EBE5E2] dark:border-slate-700/80 rounded-2xl p-6 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#F9A826]">lightbulb</span>
            <h3 className="text-sm font-bold text-[#2B2B2B] dark:text-white">
              {lang === 'en' ? 'Recommended Gym Equipment to Add' : 'Rekomendasi Alat Gym Tambahan'}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {equipment_recommendations.map((item, idx) => {
              if (!item) return null;
              const slug = typeof item === 'string' ? item : item.exercise_slug;
              if (!slug || typeof slug !== 'string') return null;
              return (
                <div key={slug || idx} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-[#EBE5E2] dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">{slug.replace(/_/g, ' ')}</span>
                  <button
                    onClick={() => handleAddRecommendedTool(slug)}
                    className="px-2.5 py-1 bg-[#E63946] text-white rounded-lg font-bold text-[11px] hover:bg-[#D62839] transition-colors cursor-pointer"
                  >
                    + {lang === 'en' ? 'Add Tool' : 'Tambah Alat'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* System Warnings */}
      {system_warnings && system_warnings.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl p-5 space-y-2 text-xs font-semibold text-amber-900 dark:text-amber-300 shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
            <span className="material-symbols-outlined text-base">warning</span>
            <span>{lang === 'en' ? 'System Diagnostic Warnings' : 'Peringatan Diagnostik Sistem'}</span>
          </div>
          <ul className="list-disc list-inside space-y-1 pl-1 font-medium">
            {system_warnings.map((warn, i) => (
              <li key={i}>{formatSystemWarning(warn, lang)}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Weeks Breakdown */}
      <div className="space-y-8">
        {(weeks || []).map((week) => {
          if (!week) return null;
          const isDeloadWeek = week.is_deload;
          const sessions = week.sessions || [];
          return (
            <div 
              key={week.week_number || Math.random()} 
              className={`rounded-2xl border p-6 space-y-6 shadow-xs ${
                isDeloadWeek 
                  ? 'bg-[#FFFDF5] dark:bg-slate-900 border-[#FDE68A] dark:border-amber-900' 
                  : 'bg-white dark:bg-slate-900 border-[#EBE5E2] dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#EBE5E2] dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-[#2B2B2B] dark:text-white flex items-center gap-2">
                    <span>{lang === 'en' ? 'Week' : 'Minggu'} {week.week_number}</span>
                    {isDeloadWeek ? (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F9A826] text-[#2B2B2B] font-extrabold">
                        DELOAD RECOVERY
                      </span>
                    ) : (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E63946] text-white font-extrabold">
                        OVERLOAD PHASE
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {lang === 'en' ? 'Total Estimated Volume:' : 'Total Estimasi Volume:'} <strong className="text-[#2B2B2B] dark:text-white">{formatVolume(week.total_week_volume_kg, lang)}</strong>
                  </p>
                </div>
              </div>

              {/* Sessions */}
              <div className="space-y-6">
                {sessions.map((session, sIdx) => {
                  if (!session) return null;
                  const exercises = session.exercises || session.prescribed_exercises || [];
                  const sessionVol = session.session_volume_kg || session.total_estimated_volume_kg || 0;
                  return (
                    <div key={sIdx} className="bg-[#FAF8F7] dark:bg-slate-800/40 rounded-xl p-4 border border-[#EBE5E2] dark:border-slate-800 space-y-4">
                      <div className="flex justify-between items-center text-xs font-bold text-[#2B2B2B] dark:text-white border-b border-[#EBE5E2] dark:border-slate-700 pb-2">
                        <span className="text-sm font-black text-[#E63946] dark:text-red-400">
                          {lang === 'en' ? 'Day' : 'Hari'} {session.day_number}: {session.focus_title || (lang === 'en' ? 'Workout Session' : 'Sesi Latihan')}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {exercises.length} {lang === 'en' ? 'Exercises' : 'Latihan'} | Est. Vol: {formatVolume(sessionVol, lang)}
                        </span>
                      </div>

                      {/* Exercises Table */}
                      <div className="overflow-x-auto rounded-lg border border-[#EBE5E2] dark:border-slate-700">
                        <table className="w-full text-left border-collapse min-w-[700px] text-xs">
                          <thead>
                            <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-[#EBE5E2] dark:border-slate-700">
                              <th className="p-3">{lang === 'en' ? 'Exercise' : 'Nama Latihan'}</th>
                              <th className="p-3 text-center w-16">{lang === 'en' ? 'Sets' : 'Set'}</th>
                              <th className="p-3 text-center w-16">{lang === 'en' ? 'Reps' : 'Repetisi'}</th>
                              <th className="p-3 text-center w-36 bg-[#FFF1F2] dark:bg-red-950/40 text-[#E63946] dark:text-red-400">{lang === 'en' ? 'Target Load' : 'Beban Target'}</th>
                              <th className="p-3 text-center w-24">{lang === 'en' ? 'Tempo' : 'Tempo'}</th>
                              <th className="p-3 text-center w-24">{lang === 'en' ? 'Rest' : 'Istirahat'}</th>
                              <th className="p-3 w-56">{lang === 'en' ? 'Notes' : 'Catatan Preskripsi'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#EBE5E2] dark:divide-slate-800">
                            {exercises.map((ex, eIdx) => {
                              if (!ex) return null;
                              const exKey = `w${week.week_number}_d${session.day_number}_e${eIdx}`;
                              const loadDisplay = formatWeight(ex.load_kg);
                              const defaultNotes = ex.notes || '';
                              const noteVal = customNotes[exKey] !== undefined ? customNotes[exKey] : defaultNotes;

                              return (
                                <tr key={eIdx} className="hover:bg-[#FAF8F7] dark:hover:bg-slate-800/60 transition-colors bg-white dark:bg-slate-900">
                                  
                                  {/* Nama Latihan */}
                                  <td className="p-3 font-bold text-[#2B2B2B] dark:text-white capitalize">
                                    {ex.exercise_slug ? ex.exercise_slug.replace(/_/g, ' ') : '—'}
                                  </td>

                                  {/* Target Set & Reps */}
                                  <td className="p-3 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">{ex.sets || 0}</td>
                                  <td className="p-3 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">{ex.reps || 0}</td>
                                  
                                  {/* Beban Target (High Contrast Red Cell with % 1RM / RPE badge) */}
                                  <td className="p-3 text-center font-mono text-[#E63946] dark:text-red-400 bg-[#FFF5F5]/60 dark:bg-red-950/30 border-x border-[#FECDD3] dark:border-red-900/50">
                                    <div className="font-black text-sm">{loadDisplay}</div>
                                    <div className="text-[10px] font-extrabold text-[#F3722C] dark:text-orange-400 mt-0.5">
                                      {ex.uses_rpe_flag 
                                        ? `(RPE ${ex.target_rpe || '8'})` 
                                        : ex.intensity_pct ? `(${Math.round(ex.intensity_pct * 100)}% 1RM)` : ''}
                                    </div>
                                  </td>

                                  {/* Tempo & Rest */}
                                  <td className="p-3 text-center font-mono text-slate-600 dark:text-slate-400">{ex.tempo_code || '—'}</td>
                                  <td className="p-3 text-center font-mono text-slate-600 dark:text-slate-400">{ex.rest_interval_seconds || 0}s</td>

                                  {/* Catatan Latihan (Typable Input) */}
                                  <td className="p-2">
                                    <div className="space-y-1">
                                      {ex.capped_by_safety_module && (
                                        <span className="text-[#E63946] dark:text-red-400 font-bold block text-[10px]">
                                          ✓ Load Capped
                                        </span>
                                      )}
                                      {ex.substitution_diagnostics && (
                                        <span className="text-[#F3722C] font-bold block text-[10px]">
                                          ✓ {lang === 'en' ? 'Substituted' : 'Substitusi Alat'}
                                        </span>
                                      )}
                                      <input 
                                        type="text" 
                                        placeholder={lang === 'en' ? 'Type note here...' : 'Ketik catatan di sini...'}
                                        value={noteVal}
                                        onChange={(e) => handleNoteChange(exKey, e.target.value)}
                                        className="w-full text-xs px-3 py-1.5 border border-[#EBE5E2] dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E63946] text-[#2B2B2B] dark:text-white placeholder-slate-400 font-medium shadow-2xs"
                                      />
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Action Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#FAF8F7] dark:bg-slate-800/60 p-6 rounded-2xl border border-[#EBE5E2] dark:border-slate-700/80 shadow-2xs mt-8">
        <div>
          <h3 className="text-base font-bold text-[#2B2B2B] dark:text-white">
            {lang === 'en' ? 'Export Entire Training Program' : 'Unduh Seluruh Dokumen Program Latihan'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {lang === 'en' ? 'Includes all evaluation tables, volume breakdowns, and daily exercise prescriptions.' : 'Mencakup seluruh tabel evaluasi diagnostik, ringkasan volume, dan preskripsi harian terstruktur.'}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => generatePDF(programData)}
            className="flex items-center gap-2 px-5 py-3 bg-[#E63946] hover:bg-[#D62839] text-white rounded-xl font-bold text-xs transition-colors shadow-md shadow-red-500/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">picture_as_pdf</span>
            {lang === 'en' ? 'Export PDF Document' : 'Unduh Dokumen PDF'}
          </button>
          <button 
            onClick={() => generateExcel(programData)}
            className="flex items-center gap-2 px-5 py-3 bg-[#F9A826] hover:bg-[#E59716] text-[#2B2B2B] rounded-xl font-extrabold text-xs transition-colors shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">table_view</span>
            {lang === 'en' ? 'Export Excel Spreadsheet' : 'Unduh Format Excel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgramResult;
