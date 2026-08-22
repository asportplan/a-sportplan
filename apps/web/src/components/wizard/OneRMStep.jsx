import React, { useState, useEffect } from 'react';
import { MST_EXERCISES } from '../../core/db/master-data.js';
import { getUserEquipment, updateEquipment1RM } from '../../core/db/user-store.js';
import { api } from '../../lib/api-client.js';
import OneRMCalculatorModal from '../common/OneRMCalculatorModal.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';
import { getExerciseCategory } from './EquipmentStep.jsx';

const OneRMStep = ({ onNext, onPrev }) => {
  const { lang } = useLanguage();
  const [equipmentList, setEquipmentList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  
  // Modal Calculator State
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [targetSlugForCalc, setTargetSlugForCalc] = useState(null);

  useEffect(() => {
    setEquipmentList(getUserEquipment());
  }, []);

  const get1RM = (slug) => {
    const item = equipmentList.find(e => e.exercise_slug === slug);
    return item && item.user_1rm_kg !== null && item.user_1rm_kg !== undefined ? item.user_1rm_kg : '';
  };

  const handle1RMChange = (slug, val) => {
    const num = val === '' ? null : parseFloat(val);
    updateEquipment1RM(slug, num);
    setEquipmentList(getUserEquipment());
  };

  const handleOpenCalcForSlug = (slug) => {
    setTargetSlugForCalc(slug);
    setIsCalcOpen(true);
  };

  const handleApplyCalculated1RM = (calcVal) => {
    if (targetSlugForCalc) {
      handle1RMChange(targetSlugForCalc, calcVal);
    }
  };

  const handleNext = async () => {
    try {
      const payload = equipmentList.map(item => ({
        exerciseSlug: item.exercise_slug,
        user1rmKg: item.user_1rm_kg
      }));
      await api.saveEquipment(payload).catch(() => {});
    } catch (e) {
      // Ignore background sync errors
    }
    onNext();
  };

  // Get full metadata for ONLY the selected equipment items
  const selectedExerciseDetails = MST_EXERCISES.filter(ex => 
    equipmentList.some(e => e.exercise_slug === ex.exercise_slug)
  );

  const filteredSelected = selectedExerciseDetails.filter(ex => {
    const catKey = getExerciseCategory(ex);
    if (activeTab !== 'ALL' && catKey !== activeTab) return false;

    const nameFormatted = ex.exercise_slug.replace(/_/g, ' ');
    const muscleFormatted = (ex.primary_muscle_group_slug || '').replace(/_/g, ' ');
    return (
      nameFormatted.toLowerCase().includes(searchTerm.toLowerCase()) ||
      muscleFormatted.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const countWith1RM = equipmentList.filter(e => e.user_1rm_kg && e.user_1rm_kg > 0).length;
  const targetExerciseObj = MST_EXERCISES.find(e => e.exercise_slug === targetSlugForCalc);
  const targetExerciseTitle = targetExerciseObj ? targetExerciseObj.exercise_slug.replace(/_/g, ' ') : '';

  return (
    <div 
      style={{ width: '100%', minWidth: '300px', boxSizing: 'border-box' }}
      className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-[#EBE5E2] dark:border-slate-800 max-w-4xl mx-auto space-y-6 w-full block font-sans"
    >
      
      {/* 1RM Calculator Modal */}
      <OneRMCalculatorModal
        isOpen={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
        onApply1RM={handleApplyCalculated1RM}
        initialExerciseTitle={targetExerciseTitle}
      />

      {/* Step Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 border-b border-[#EBE5E2] dark:border-slate-800 pb-4 w-full min-w-0">
        <div className="space-y-1 min-w-0 flex-1">
          <h2 className="font-headline-md text-xl sm:text-2xl font-bold text-[#2B2B2B] dark:text-white tracking-tight leading-snug">
            {lang === 'en' ? 'Step 3: 1RM Maximum Weight Input (kg)' : 'Langkah 3: Masukkan Beban Maksimal (1RM)'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium leading-relaxed">
            {lang === 'en' 
              ? <>Enter estimated 1RM for <strong className="text-[#E63946] dark:text-red-400">{selectedExerciseDetails.length} selected equipment</strong>. Leave empty to use default weights.</>
              : <>Masukkan perkiraan beban maksimal (1RM) untuk <strong className="text-[#E63946] dark:text-red-400">{selectedExerciseDetails.length} alat terpilih</strong>. Kosongkan jika belum tahu.</>
            }
          </p>
        </div>

        {/* Global Calculator Trigger */}
        <button
          type="button"
          onClick={() => { setTargetSlugForCalc(selectedExerciseDetails[0]?.exercise_slug || null); setIsCalcOpen(true); }}
          className="px-4 py-2.5 bg-[#E63946] hover:bg-[#D62839] text-white font-extrabold rounded-xl text-xs shadow-md shadow-red-500/20 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95"
        >
          <span className="material-symbols-outlined text-base">calculate</span>
          <span>{lang === 'en' ? 'Open 1RM Calculator' : 'Buka Kalkulator 1RM'}</span>
        </button>
      </div>

      {/* Warning if no equipment was selected in Step 2 */}
      {selectedExerciseDetails.length === 0 ? (
        <div 
          style={{ width: '100%', maxWidth: '640px', minWidth: '300px', alignSelf: 'stretch', boxSizing: 'border-box' }}
          className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-6 sm:p-8 rounded-2xl text-center space-y-4 mx-auto w-full block shrink-0 my-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shrink-0">
            <span className="material-symbols-outlined text-2xl">warning</span>
          </div>
          <div className="space-y-2 w-full" style={{ width: '100%' }}>
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-base block w-full text-center">
              {lang === 'en' ? 'No Gym Equipment Selected Yet' : 'Belum Ada Alat Gym Yang Dipilih'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium block w-full text-center">
              {lang === 'en' 
                ? 'Please return to Step 2 to select the equipment physically available in your gym.' 
                : 'Silakan kembali ke Langkah 2 untuk memilih alat gym yang tersedia di tempat latihan Anda.'}
            </p>
          </div>
          <div className="pt-2 flex justify-center w-full" style={{ width: '100%' }}>
            <button
              type="button"
              onClick={onPrev}
              className="px-6 py-2.5 bg-[#E63946] hover:bg-[#D62839] text-white font-bold rounded-xl text-xs shadow-md shadow-red-500/20 transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95 shrink-0"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              <span>{lang === 'en' ? 'Back to Step 2 (Equipment)' : 'Kembali ke Langkah 2 (Pilih Alat)'}</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Banner & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-100 dark:bg-slate-800/80 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-sm">
              <span className="material-symbols-outlined text-primary text-xl">bar_chart</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {lang === 'en'
                  ? <><strong className="text-[#E63946] dark:text-red-400">{countWith1RM}</strong> of {selectedExerciseDetails.length} equipment 1RM entered</>
                  : <><strong className="text-[#E63946] dark:text-red-400">{countWith1RM}</strong> dari {selectedExerciseDetails.length} alat telah diisi 1RM</>
                }
              </span>
            </div>
            {selectedExerciseDetails.length > 3 && (
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-sm">search</span>
                <input
                  type="text"
                  placeholder={lang === 'en' ? 'Search equipment...' : 'Cari alat terpilih...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                />
              </div>
            )}
          </div>

          {/* Category Tabs Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-extrabold">
            {[
              { key: 'ALL', label: lang === 'en' ? 'All Equipment' : 'Semua Alat', count: selectedExerciseDetails.length },
              { key: 'UPPER_PUSH', label: lang === 'en' ? 'Upper Push' : 'Upper Push (Dada & Bahu)', count: selectedExerciseDetails.filter(e => getExerciseCategory(e) === 'UPPER_PUSH').length },
              { key: 'UPPER_PULL', label: lang === 'en' ? 'Upper Pull' : 'Upper Pull (Punggung & Bisep)', count: selectedExerciseDetails.filter(e => getExerciseCategory(e) === 'UPPER_PULL').length },
              { key: 'LOWER', label: lang === 'en' ? 'Lower Body' : 'Lower Body (Paha & Kaki)', count: selectedExerciseDetails.filter(e => getExerciseCategory(e) === 'LOWER').length },
              { key: 'CORE', label: lang === 'en' ? 'Core' : 'Core & Inti', count: selectedExerciseDetails.filter(e => getExerciseCategory(e) === 'CORE').length },
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border ${
                  activeTab === tab.key
                    ? 'bg-[#E63946] text-white border-[#E63946] shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Grid of Selected Equipment Cards (Full Page Flow - No Internal Scroll Box) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 w-full min-w-0">
            {filteredSelected.map((ex) => {
              const catKey = getExerciseCategory(ex);
              const catLabel = catKey === 'UPPER_PUSH' ? 'Upper Push' : catKey === 'UPPER_PULL' ? 'Upper Pull' : catKey === 'LOWER' ? 'Lower Body' : 'Core';
              
              const categoryBadge = 
                ex.safety_category_level === 1 ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                ex.safety_category_level === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' :
                'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';

              const categoryName = 
                ex.safety_category_level === 1 ? (lang === 'en' ? 'Cat 1 (Max 100%)' : 'Cat 1 (Max 100%)') :
                ex.safety_category_level === 2 ? (lang === 'en' ? 'Cat 2 (Max 80%)' : 'Cat 2 (Max 80%)') : (lang === 'en' ? 'Cat 3 (Max 70%)' : 'Cat 3 (Max 70%)');

              const currentVal = get1RM(ex.exercise_slug);

              return (
                <div 
                  key={ex.exercise_slug}
                  className={`p-3.5 rounded-xl border transition-all space-y-2.5 w-full min-w-0 ${
                    currentVal && currentVal > 0
                      ? 'bg-red-50/50 dark:bg-red-950/20 border-red-300 dark:border-red-800 shadow-2xs'
                      : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {/* ROW 1: Full-Width Exercise Title (100% Width) */}
                  <div className="w-full">
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white capitalize leading-tight w-full block" title={ex.exercise_slug.replace(/_/g, ' ')}>
                      {ex.exercise_slug.replace(/_/g, ' ')}
                    </h4>
                  </div>

                  {/* ROW 2: Target Muscle & Badges Row */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 w-full">
                    <span className="text-[11px] text-slate-500 capitalize font-medium truncate">
                      {lang === 'en' ? 'Target: ' : 'Target: '}{(ex.primary_muscle_group_slug || '').replace(/_/g, ' ')}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {catLabel}
                      </span>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${categoryBadge}`}>
                        {categoryName}
                      </span>
                    </div>
                  </div>

                  {/* ROW 3: Calc Trigger & 1RM Input Row */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => handleOpenCalcForSlug(ex.exercise_slug)}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                      title={lang === 'en' ? 'Calculate 1RM from weight x reps' : 'Hitung 1RM dari beban x repetisi'}
                    >
                      <span className="material-symbols-outlined text-xs">calculate</span>
                      <span>{lang === 'en' ? 'Calc' : 'Hitung'}</span>
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      <input
                        type="number"
                        placeholder="0"
                        value={currentVal}
                        onChange={(e) => handle1RMChange(ex.exercise_slug, e.target.value)}
                        className="w-16 sm:w-20 px-2 py-1 text-right text-xs font-bold border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E63946] font-mono shadow-inner"
                        min="1"
                        max="500"
                      />
                      <span className="text-xs font-bold text-slate-500 font-mono">kg</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Navigation Footer */}
      <div className="pt-4 border-t border-outline-variant dark:border-slate-800 flex justify-between items-center">
        <button 
          type="button"
          onClick={onPrev}
          className="px-6 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs"
        >
          {lang === 'en' ? 'Back' : 'Kembali'}
        </button>
        <button 
          type="button"
          onClick={handleNext}
          className="px-6 py-2.5 bg-[#E63946] text-white rounded-xl font-bold hover:bg-red-700 transition-colors cursor-pointer text-xs shadow-md flex items-center gap-2"
        >
          <span>{lang === 'en' ? 'Proceed to Target & Duration' : 'Lanjut ke Target & Durasi'}</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>

    </div>
  );
};

export default OneRMStep;
