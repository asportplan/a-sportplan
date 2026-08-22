import React, { useState, useEffect } from 'react';
import { MST_EXERCISES } from '../../core/db/master-data.js';
import { getUserEquipment, toggleEquipment, saveUserEquipment } from '../../core/db/user-store.js';
import { useLanguage } from '../../hooks/useLanguage.js';

export function getExerciseCategory(ex) {
  const pId = ex.pattern_id;
  const m = (ex.primary_muscle_group_slug || '').toLowerCase();

  // Core & Trunk
  if ([14, 15, 16].includes(pId) || m.includes('abdominis') || m.includes('obliques') || m.includes('erector')) {
    return 'CORE';
  }
  // Lower Body
  if ([6, 7, 8, 9, 10, 18].includes(pId) || m.includes('quadriceps') || m.includes('hamstrings') || m.includes('gluteus') || m.includes('gastrocnemius') || m.includes('soleus') || m.includes('adductors')) {
    return 'LOWER';
  }
  // Upper Pull
  if ([3, 4, 11].includes(pId) || m.includes('latissimus') || m.includes('rhomboids') || m.includes('biceps')) {
    return 'UPPER_PULL';
  }
  // Upper Push
  if ([1, 2, 5, 12, 13].includes(pId) || m.includes('pectoralis') || m.includes('deltoid') || m.includes('triceps')) {
    return 'UPPER_PUSH';
  }
  return 'UPPER_PULL';
}

const CATEGORY_META = {
  UPPER_PUSH: { 
    id: 'UPPER_PUSH',
    title: 'Upper Body Push (Dada, Bahu & Triceps)', 
    titleEn: 'Upper Body Push (Chest, Shoulders & Triceps)',
    icon: 'fitness_center', 
    color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800' 
  },
  UPPER_PULL: { 
    id: 'UPPER_PULL',
    title: 'Upper Body Pull (Punggung, Lats & Biceps)', 
    titleEn: 'Upper Body Pull (Back, Lats & Biceps)',
    icon: 'sports_gymnastics', 
    color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' 
  },
  LOWER: { 
    id: 'LOWER',
    title: 'Lower Body (Kaki, Quadriceps, Hamstrings & Betis)', 
    titleEn: 'Lower Body (Legs, Quads, Hamstrings & Calves)',
    icon: 'directions_walk', 
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' 
  },
  CORE: { 
    id: 'CORE',
    title: 'Core & Inti (Abs, Obliques & Lower Back)', 
    titleEn: 'Core & Trunk (Abs, Obliques & Lower Back)',
    icon: 'accessibility_new', 
    color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800' 
  },
};

const EquipmentStep = ({ onNext, onPrev }) => {
  const { lang } = useLanguage();
  const [equipmentList, setEquipmentList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    setEquipmentList(getUserEquipment());
  }, []);

  const isSelected = (slug) => {
    return equipmentList.some(e => e.exercise_slug === slug);
  };

  const handleToggle = (slug, checked) => {
    toggleEquipment(slug, checked);
    setEquipmentList(getUserEquipment());
  };

  const selectAll = () => {
    const all = MST_EXERCISES.map(e => {
      const existing = equipmentList.find(x => x.exercise_slug === e.exercise_slug);
      return { exercise_slug: e.exercise_slug, user_1rm_kg: existing ? existing.user_1rm_kg : null };
    });
    saveUserEquipment(all);
    setEquipmentList(all);
  };

  const clearAll = () => {
    saveUserEquipment([]);
    setEquipmentList([]);
  };

  const selectCategoryAll = (catKey) => {
    const catExercises = MST_EXERCISES.filter(e => getExerciseCategory(e) === catKey);
    const updated = [...equipmentList];
    catExercises.forEach(e => {
      if (!updated.some(x => x.exercise_slug === e.exercise_slug)) {
        updated.push({ exercise_slug: e.exercise_slug, user_1rm_kg: null });
      }
    });
    saveUserEquipment(updated);
    setEquipmentList(updated);
  };

  const clearCategoryAll = (catKey) => {
    const catExercises = MST_EXERCISES.filter(e => getExerciseCategory(e) === catKey);
    const catSlugs = new Set(catExercises.map(e => e.exercise_slug));
    const updated = equipmentList.filter(e => !catSlugs.has(e.exercise_slug));
    saveUserEquipment(updated);
    setEquipmentList(updated);
  };

  const selectedCount = equipmentList.length;

  // Filter exercises by Search Term & Active Category Tab
  const filteredExercises = MST_EXERCISES.filter(ex => {
    const nameFormatted = ex.exercise_slug.replace(/_/g, ' ');
    const muscleFormatted = (ex.primary_muscle_group_slug || '').replace(/_/g, ' ');
    const matchesSearch = 
      nameFormatted.toLowerCase().includes(searchTerm.toLowerCase()) ||
      muscleFormatted.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'SELECTED') {
      return isSelected(ex.exercise_slug);
    }
    if (activeTab !== 'ALL') {
      return getExerciseCategory(ex) === activeTab;
    }
    return true;
  });

  // Group filtered exercises by Category
  const categoriesOrder = ['UPPER_PUSH', 'UPPER_PULL', 'LOWER', 'CORE'];
  const grouped = categoriesOrder.reduce((acc, catKey) => {
    acc[catKey] = filteredExercises.filter(ex => getExerciseCategory(ex) === catKey);
    return acc;
  }, {});

  return (
    <div className="bg-surface dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-outline-variant dark:border-slate-800 max-w-4xl mx-auto space-y-6 font-sans">
      
      {/* Step Header */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
          <h2 className="font-headline-md text-2xl font-bold text-[#2B2B2B] dark:text-white tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-[#E63946]">fitness_center</span>
            <span>{lang === 'en' ? 'Step 2: Available Gym Equipment' : 'Langkah 2: Ketersediaan Alat Gym'}</span>
          </h2>
          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={selectAll} 
              className="text-xs font-bold text-[#E63946] border border-[#E63946] px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
            >
              {lang === 'en' ? 'Select All (43)' : 'Pilih Semua (43)'}
            </button>
            <button 
              type="button" 
              onClick={clearAll} 
              className="text-xs font-bold text-slate-500 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {lang === 'en' ? 'Clear All' : 'Hapus Semua'}
            </button>
          </div>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
          {lang === 'en'
            ? 'Select equipment by body category (Upper Push, Upper Pull, Lower Body, Core). The rule engine will select exercises based on your active inventory.'
            : 'Tandai alat gym per kategori tubuh (Upper Push, Upper Pull, Lower Body, Core) agar mudah ditemukan. Algoritma akan mensubstitusi latihan berdasarkan ketersediaan ini.'
          }
        </p>
      </div>

      {/* Summary Banner */}
      <div className="bg-slate-100 dark:bg-slate-800/80 p-4 rounded-xl flex items-center justify-between flex-wrap gap-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#E63946] text-xl">verified</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            <strong className="text-[#E63946]">{selectedCount}</strong> {lang === 'en' ? `of ${MST_EXERCISES.length} equipment selected` : `dari ${MST_EXERCISES.length} alat gym terpilih`}
          </span>
        </div>
        {selectedCount === 0 && (
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-base">warning</span>
            <span>{lang === 'en' ? 'Select at least 1 equipment item to proceed' : 'Pilih setidaknya 1 alat untuk melanjutkan'}</span>
          </span>
        )}
      </div>

      {/* Category Tab Pills & Search */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">search</span>
          <input
            type="text"
            placeholder={lang === 'en' ? 'Search equipment or target muscle...' : 'Cari nama alat (misal: bench press, squat, lat pull)...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E63946]"
          />
        </div>

        {/* Category Pills Navigation - Flex Wrap Full Display (No Slide) */}
        <div className="flex flex-wrap items-center gap-2" style={{ width: '100%' }}>
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              activeTab === 'ALL'
                ? 'bg-[#E63946] text-white border-[#E63946] shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
          >
            {lang === 'en' ? 'All Categories (43)' : 'Semua Kategori (43)'}
          </button>
          
          {categoriesOrder.map(catKey => {
            const meta = CATEGORY_META[catKey];
            const catTotal = MST_EXERCISES.filter(e => getExerciseCategory(e) === catKey).length;
            const catSelected = equipmentList.filter(e => {
              const exObj = MST_EXERCISES.find(m => m.exercise_slug === e.exercise_slug);
              return exObj && getExerciseCategory(exObj) === catKey;
            }).length;

            const isActive = activeTab === catKey;

            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setActiveTab(catKey)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#E63946] text-white border-[#E63946] shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{meta.icon}</span>
                <span>{catKey === 'UPPER_PUSH' ? 'Upper Push' : catKey === 'UPPER_PULL' ? 'Upper Pull' : catKey === 'LOWER' ? 'Lower Body' : (lang === 'en' ? 'Core & Trunk' : 'Core & Inti')}</span>
                <span className={`px-1.5 py-0.2 text-[10px] font-mono rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                  {catSelected}/{catTotal}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setActiveTab('SELECTED')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              activeTab === 'SELECTED'
                ? 'bg-[#E63946] text-white border-[#E63946] shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
          >
            {lang === 'en' ? `Selected Only (${selectedCount})` : `Terpilih Saja (${selectedCount})`}
          </button>
        </div>
      </div>

      {/* Grouped Category Sections Display */}
      <div className="space-y-6 max-h-[55vh] overflow-y-auto pr-1">
        {categoriesOrder.map(catKey => {
          const exercises = grouped[catKey] || [];
          if (exercises.length === 0) return null;

          const meta = CATEGORY_META[catKey];
          const catSelectedCount = exercises.filter(ex => isSelected(ex.exercise_slug)).length;
          const isCatAllSelected = catSelectedCount === exercises.length;

          return (
            <div key={catKey} className="bg-slate-50/70 dark:bg-slate-800/30 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
              {/* Category Section Header */}
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center border font-bold text-base ${meta.color}`}>
                    <span className="material-symbols-outlined">{meta.icon}</span>
                  </span>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#2B2B2B] dark:text-white">
                      {lang === 'en' ? meta.titleEn : meta.title}
                    </h3>
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {lang === 'en'
                        ? <><strong className="text-[#E63946]">{catSelectedCount}</strong> of {exercises.length} selected in this category</>
                        : <><strong className="text-[#E63946]">{catSelectedCount}</strong> dari {exercises.length} alat terpilih di kategori ini</>
                      }
                    </div>
                  </div>
                </div>

                {/* Quick Category Action Button */}
                <div className="flex items-center gap-2">
                  {isCatAllSelected ? (
                    <button
                      type="button"
                      onClick={() => clearCategoryAll(catKey)}
                      className="px-2.5 py-1 text-[11px] font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                    >
                      {lang === 'en' ? 'Deselect Category' : 'Hapus Kategori Ini'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => selectCategoryAll(catKey)}
                      className="px-2.5 py-1 text-[11px] font-bold text-[#E63946] hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg transition-colors cursor-pointer"
                    >
                      {lang === 'en' ? `+ Select All in Category (${exercises.length})` : `+ Pilih Semua Kategori Ini (${exercises.length})`}
                    </button>
                  )}
                </div>
              </div>

              {/* Exercises Grid in Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {exercises.map((ex) => {
                  const checked = isSelected(ex.exercise_slug);
                  return (
                    <label
                      key={ex.exercise_slug}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 select-none ${
                        checked 
                          ? 'bg-red-50/70 dark:bg-red-950/30 border-[#E63946] text-slate-900 dark:text-white shadow-xs' 
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <input 
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => handleToggle(ex.exercise_slug, e.target.checked)}
                        className="mt-0.5 w-4 h-4 text-[#E63946] rounded border-slate-300 focus:ring-[#E63946] cursor-pointer shrink-0 accent-[#E63946]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-[#2B2B2B] dark:text-white capitalize break-words leading-tight" title={ex.exercise_slug.replace(/_/g, ' ')}>
                          {ex.exercise_slug.replace(/_/g, ' ')}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 capitalize break-words mt-0.5">
                          {lang === 'en' ? 'Muscle' : 'Otot'}: {(ex.primary_muscle_group_slug || '').replace(/_/g, ' ')}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredExercises.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-sm font-medium">
            {lang === 'en' ? `No gym equipment matches your search "${searchTerm}".` : `Tidak ada alat gym yang cocok dengan pencarian "${searchTerm}".`}
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <button 
          type="button"
          onClick={onPrev}
          className="px-6 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs"
        >
          {lang === 'en' ? 'Back' : 'Sebelumnya'}
        </button>
        <button 
          type="button"
          onClick={onNext}
          disabled={selectedCount === 0}
          className="px-6 py-2.5 bg-[#E63946] text-white rounded-xl font-bold hover:bg-[#D62839] transition-colors disabled:opacity-50 cursor-pointer text-xs shadow-md flex items-center gap-2"
        >
          <span>{lang === 'en' ? 'Proceed to 1RM Input' : 'Lanjut ke Input 1RM'}</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>

    </div>
  );
};

export default EquipmentStep;
