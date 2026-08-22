import React, { useState } from 'react';
import { MST_TRAINING_PHASES } from '../../core/db/master-data.js';
import { getCompatibility } from '../../core/db/compatibility-matrix.js';
import { getUserProfile, saveUserProfile } from '../../core/db/user-store.js';
import { validateTarget1RM } from '../../core/engine/training-age-modifier.js';
import { useLanguage } from '../../hooks/useLanguage.js';

export function getPhaseRecommendation(phaseSlug, durationWeeks, trainingAgeLevel = 'BEGINNER', lang = 'id') {
  const dur = parseInt(durationWeeks || 4);
  const slug = phaseSlug || '';

  if (slug.includes('hypertrophy')) {
    if (dur >= 4 && dur <= 6) {
      return {
        badge: lang === 'en' ? '🟢 Optimal Duration' : '🟢 Rekomendasi Optimal',
        text: lang === 'en' ? 'Duration of 4-6 weeks is ideal for muscle cell hypertrophy and protein synthesis.' : 'Durasi 4-6 minggu ideal untuk merangsang pertumbuhan massa otot tanpa kelelahan berlebih.',
        color: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
      };
    } else if (dur < 4) {
      return {
        badge: lang === 'en' ? '🟡 Short Duration' : '🟡 Durasi Singkat',
        text: lang === 'en' ? 'Duration <4 weeks provides initial hypertrophy response. 4 weeks is recommended.' : 'Durasi <4 minggu memberikan hasil awal. Disarankan 4 minggu untuk hasil otot lebih terlihat.',
        color: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
      };
    } else {
      return {
        badge: lang === 'en' ? '🟡 Plateau Risk' : '🟡 Disarankan Istirahat',
        text: lang === 'en' ? 'Duration >6 weeks in hypertrophy phase may reach a growth plateau.' : 'Durasi >6 minggu tanpa jeda berisiko membuat pertumbuhan otot melambat.',
        color: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
      };
    }
  }

  return {
    badge: lang === 'en' ? 'ℹ️ Flexible Duration' : 'ℹ️ Durasi Fleksibel',
    text: lang === 'en' ? `Duration of ${dur} weeks can be adapted to your body recovery.` : `Durasi ${dur} minggu dapat disesuaikan dengan waktu pemulihan tubuh Anda.`,
    color: 'bg-slate-50 text-slate-800 border-slate-200 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700'
  };
}

const GoalsStep = ({ onNext, onPrev }) => {
  const { lang } = useLanguage();
  const profile = getUserProfile() || {};
  const initialDuration = parseInt(profile.active_program_duration_weeks || 8);

  const [trainingLevel, setTrainingLevel] = useState(profile.training_age_level || 'BEGINNER');
  const [durationWeeks, setDurationWeeks] = useState(initialDuration);
  const [target1rmPct, setTarget1rmPct] = useState(parseFloat(profile.target_1rm_increase_pct || 10));
  
  const [frequencyMode, setFrequencyMode] = useState(profile.frequency_mode || 'global');
  const [globalFreq, setGlobalFreq] = useState(profile.global_frequency || 4);
  const [customFreqs, setCustomFreqs] = useState(profile.weekly_custom_frequencies || {});

  const [goalsMode, setGoalsMode] = useState(profile.goals_mode || 'automatic');
  const [selectedGoals, setSelectedGoals] = useState(() => {
    if (Array.isArray(profile.selected_goals) && profile.selected_goals.length > 0) {
      return profile.selected_goals.map(g => g === 'hypertrophy_general' ? 'hypertrophy' : g);
    }
    return ['hypertrophy'];
  });
  
  // Custom block configs: array of { id, duration_weeks, phase_slug }
  const [customBlockConfigs, setCustomBlockConfigs] = useState(() => {
    if (Array.isArray(profile.custom_block_configs) && profile.custom_block_configs.length > 0) {
      return profile.custom_block_configs.map(b => ({
        ...b,
        phase_slug: b.phase_slug === 'hypertrophy_general' ? 'hypertrophy' : b.phase_slug
      }));
    }
    const defaultPhase = (profile.selected_goals && profile.selected_goals[0]) || 'hypertrophy';
    const totalB = Math.max(1, Math.ceil(initialDuration / 4));
    const list = [];
    for (let b = 1; b <= totalB; b++) {
      list.push({
        id: b,
        duration_weeks: 4,
        phase_slug: defaultPhase === 'hypertrophy_general' ? 'hypertrophy' : defaultPhase
      });
    }
    return list;
  });

  const dynamicTotalWeeks = customBlockConfigs.reduce((sum, b) => sum + (parseInt(b.duration_weeks) || 4), 0);
  const activeDuration = goalsMode === 'custom_blocks' ? dynamicTotalWeeks : durationWeeks;
  const weeksArray = Array.from({ length: activeDuration }, (_, i) => i + 1);

  const [weeklyCustomPhases, setWeeklyCustomPhases] = useState(() => {
    const initial = profile.weekly_custom_phases || {};
    const defaultPhase = (profile.selected_goals && profile.selected_goals[0]) || 'hypertrophy';
    const normDefault = defaultPhase === 'hypertrophy_general' ? 'hypertrophy' : defaultPhase;
    const map = {};
    for (let w = 1; w <= activeDuration; w++) {
      const val = initial[w] || initial[String(w)] || normDefault;
      map[w] = val === 'hypertrophy_general' ? 'hypertrophy' : val;
    }
    return map;
  });

  const [warningMsg, setWarningMsg] = useState('');

  // Auto-sync user selections immediately to store so top navigation buttons & step jumps always have fresh data
  React.useEffect(() => {
    let finalCustomFreqs = { ...customFreqs };
    if (frequencyMode === 'global') {
      for (let w = 1; w <= activeDuration; w++) {
        finalCustomFreqs[w] = globalFreq;
      }
    }

    let finalSelectedGoals = [...selectedGoals];
    if (goalsMode === 'custom_blocks') {
      finalSelectedGoals = [...new Set(customBlockConfigs.map(b => b.phase_slug))];
    } else if (goalsMode === 'custom_weekly') {
      finalSelectedGoals = [...new Set(Object.values(weeklyCustomPhases))];
    }

    saveUserProfile({
      training_age_level: trainingLevel,
      active_program_duration_weeks: activeDuration,
      target_1rm_increase_pct: target1rmPct,
      frequency_mode: frequencyMode,
      global_frequency: globalFreq,
      weekly_custom_frequencies: finalCustomFreqs,
      goals_mode: goalsMode,
      selected_goals: finalSelectedGoals,
      custom_block_configs: customBlockConfigs,
      weekly_custom_phases: weeklyCustomPhases
    });
  }, [trainingLevel, activeDuration, target1rmPct, frequencyMode, globalFreq, customFreqs, goalsMode, selectedGoals, customBlockConfigs, weeklyCustomPhases]);

  const handleToggleGoal = (slug) => {
    setWarningMsg('');
    setSelectedGoals(prev => {
      if (prev.includes(slug)) {
        if (prev.length === 1) {
          setWarningMsg(lang === 'en' ? 'At least 1 program focus must be selected.' : 'Minimal 1 fokus program harus dipilih.');
          return prev;
        }
        return prev.filter(g => g !== slug);
      }
      if (prev.length >= 3) {
        setWarningMsg(lang === 'en' ? 'Maximum 3 program focuses can be selected at once.' : 'Maksimal 3 fokus program yang dapat dipilih sekaligus.');
        return prev;
      }
      return [...prev, slug];
    });
  };

  const handleBlockChange = (index, field, value) => {
    setCustomBlockConfigs(prev => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: field === 'duration_weeks' ? parseInt(value) || 4 : value
      };
      return next;
    });
  };

  const handleAddBlock = () => {
    if (customBlockConfigs.length >= 8) {
      setWarningMsg(lang === 'en' ? 'Maximum 8 mesocycle blocks.' : 'Maksimal 8 blok mesosiklus.');
      return;
    }
    const lastPhase = customBlockConfigs[customBlockConfigs.length - 1]?.phase_slug || 'hypertrophy';
    setCustomBlockConfigs(prev => [
      ...prev,
      { id: prev.length + 1, duration_weeks: 4, phase_slug: lastPhase }
    ]);
  };

  const handleRemoveBlock = (index) => {
    if (customBlockConfigs.length <= 1) {
      setWarningMsg(lang === 'en' ? 'There must be at least 1 mesocycle block.' : 'Minimal harus ada 1 blok mesosiklus.');
      return;
    }
    setCustomBlockConfigs(prev => prev.filter((_, i) => i !== index));
  };

  const handleSingleWeekPhaseChange = (weekNum, phaseSlug) => {
    setWeeklyCustomPhases(prev => ({
      ...prev,
      [weekNum]: phaseSlug
    }));
  };

  const handleNext = () => {
    let finalCustomFreqs = { ...customFreqs };
    if (frequencyMode === 'global') {
      for (let w = 1; w <= activeDuration; w++) {
        finalCustomFreqs[w] = globalFreq;
      }
    }

    let finalSelectedGoals = [...selectedGoals];
    if (goalsMode === 'custom_blocks') {
      finalSelectedGoals = [...new Set(customBlockConfigs.map(b => b.phase_slug))];
    } else if (goalsMode === 'custom_weekly') {
      finalSelectedGoals = [...new Set(Object.values(weeklyCustomPhases))];
    }

    saveUserProfile({
      training_age_level: trainingLevel,
      active_program_duration_weeks: activeDuration,
      target_1rm_increase_pct: target1rmPct,
      frequency_mode: frequencyMode,
      global_frequency: globalFreq,
      weekly_custom_frequencies: finalCustomFreqs,
      goals_mode: goalsMode,
      selected_goals: finalSelectedGoals,
      custom_block_configs: customBlockConfigs,
      weekly_custom_phases: weeklyCustomPhases
    });

    if (onNext) onNext();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 font-sans" style={{ width: '100%' }}>
      
      {/* Step Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-[#EBE5E2] dark:border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 text-[#E63946] dark:text-red-400 font-bold flex items-center justify-center text-xl shrink-0">
            <span className="material-symbols-outlined">tune</span>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#2B2B2B] dark:text-white tracking-tight">
              {lang === 'en' ? 'Step 4: Target & Program Duration' : 'Langkah 4: Target & Durasi Program'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium mt-0.5">
              {lang === 'en' ? 'Set experience level, program duration, weekly frequency, and 1RM target.' : 'Tentukan pengalaman, durasi program, frekuensi mingguan, fokus program, dan target peningkatan kekuatan (1RM).'}
            </p>
          </div>
        </div>
      </div>

      {warningMsg && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-base">warning</span>
          <span>{warningMsg}</span>
        </div>
      )}

      {/* 1. TINGKAT PENGALAMAN LATIHAN */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-[#EBE5E2] dark:border-slate-800 space-y-4">
        <h3 className="text-base font-black text-[#2B2B2B] dark:text-white flex items-center gap-2 border-b border-[#EBE5E2] dark:border-slate-800 pb-3">
          <span className="material-symbols-outlined text-[#E63946]">fitness_center</span>
          {lang === 'en' ? '1. Training Experience Level' : '1. Tingkat Pengalaman Latihan'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'BEGINNER', title: lang === 'en' ? 'Beginner' : 'Pemula', desc: lang === 'en' ? '< 1 Year Experience' : '< 1 Tahun Pengalaman', icon: 'school' },
            { id: 'INTERMEDIATE', title: lang === 'en' ? 'Intermediate' : 'Menengah', desc: lang === 'en' ? '1 - 3 Years Routine' : '1 - 3 Tahun Rutin', icon: 'fitness_center' },
            { id: 'ADVANCED', title: lang === 'en' ? 'Advanced' : 'Lanjutan', desc: lang === 'en' ? '> 3 Years Routine' : '> 3 Tahun Rutin', icon: 'military_tech' }
          ].map(item => {
            const isSelected = trainingLevel === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTrainingLevel(item.id)}
                className={`p-4 rounded-2xl text-left transition-all border cursor-pointer flex flex-col justify-between space-y-2 ${
                  isSelected 
                    ? 'bg-[#E63946] text-white border-[#E63946] shadow-md shadow-red-500/20' 
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                  {isSelected && <span className="material-symbols-outlined text-lg">check_circle</span>}
                </div>
                <div>
                  <h4 className="font-black text-sm">{item.title}</h4>
                  <p className={`text-[11px] font-medium mt-0.5 ${isSelected ? 'text-white/90' : 'text-slate-500'}`}>{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. DURASI & FREKUENSI LATIHAN (DURASI DULU SEBELUM MEMILIH PROGRAM) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-[#EBE5E2] dark:border-slate-800 space-y-6">
        <h3 className="text-base font-black text-[#2B2B2B] dark:text-white flex items-center gap-2 border-b border-[#EBE5E2] dark:border-slate-800 pb-3">
          <span className="material-symbols-outlined text-[#E63946]">calendar_month</span>
          {lang === 'en' ? '2. Duration & Frequency (1 - 24 Weeks)' : '2. Durasi & Frekuensi Latihan (1 - 24 Minggu)'}
        </h3>

        {/* Duration */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {lang === 'en' ? 'Program Duration' : 'Durasi Program Latihan'}
            </label>
            <span className="text-xs font-mono font-black text-[#E63946] dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-3 py-1 rounded-lg border border-red-200 dark:border-red-800">
              {activeDuration} {lang === 'en' ? 'Weeks' : 'Minggu'} ({Math.ceil(activeDuration / 4)} {lang === 'en' ? 'Mesocycle Blocks' : 'Blok Mesosiklus'})
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[1, 2, 4, 8, 12, 16, 20, 24].map(w => (
              <button
                key={w}
                type="button"
                onClick={() => setDurationWeeks(w)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  durationWeeks === w 
                    ? 'bg-[#E63946] text-white border-[#E63946] shadow-sm shadow-red-500/20' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                {w} {lang === 'en' ? 'Weeks' : 'Minggu'} {w === 24 && (lang === 'en' ? '(Full Cycle)' : '(Full Siklus)')}
              </button>
            ))}
          </div>

          <input 
            type="range" 
            value={durationWeeks} 
            onChange={(e) => setDurationWeeks(parseInt(e.target.value))}
            className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#E63946]" 
            min="1" max="24" step="1" 
          />
        </div>

        {/* Frequency */}
        <div className="space-y-4 pt-2 border-t border-[#EBE5E2] dark:border-slate-800">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {lang === 'en' ? 'Weekly Training Frequency' : 'Frekuensi Latihan Mingguan'}
          </label>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFrequencyMode('global')}
              className={`flex-1 py-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                frequencyMode === 'global' 
                  ? 'bg-[#2B2B2B] text-white border-[#2B2B2B] dark:bg-slate-700 dark:border-slate-600 shadow-sm' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              {lang === 'en' ? 'Same Every Week' : 'Sama Setiap Minggu'}
            </button>
            <button
              type="button"
              onClick={() => setFrequencyMode('custom')}
              className={`flex-1 py-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                frequencyMode === 'custom' 
                  ? 'bg-[#2B2B2B] text-white border-[#2B2B2B] dark:bg-slate-700 dark:border-slate-600 shadow-sm' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              {lang === 'en' ? 'Custom Sessions per Week' : 'Kustom Sesi per Minggu'}
            </button>
          </div>

          {frequencyMode === 'global' ? (
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-500">
                {lang === 'en' ? 'Sessions per Week:' : 'Jumlah Sesi per Minggu:'}
              </label>
              <select
                value={globalFreq}
                onChange={(e) => setGlobalFreq(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-[#2B2B2B] dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]"
              >
                <option value="1">{lang === 'en' ? '1 Session / Week' : '1 Sesi / Minggu'}</option>
                <option value="2">{lang === 'en' ? '2 Sessions / Week' : '2 Sesi / Minggu'}</option>
                <option value="3">{lang === 'en' ? '3 Sessions / Week' : '3 Sesi / Minggu'}</option>
                <option value="4">{lang === 'en' ? '4 Sessions / Week (Recommended)' : '4 Sesi / Minggu (Disarankan)'}</option>
                <option value="5">{lang === 'en' ? '5 Sessions / Week' : '5 Sesi / Minggu'}</option>
                <option value="6">{lang === 'en' ? '6 Sessions / Week' : '6 Sesi / Minggu'}</option>
                <option value="7">{lang === 'en' ? '7 Sessions / Week (Every Day)' : '7 Sesi / Minggu (Setiap Hari)'}</option>
              </select>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-500">
                {lang === 'en' ? 'Set Specific Weekly Frequency:' : 'Atur Frekuensi per Minggu Spesifik:'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1">
                {weeksArray.map(w => {
                  const val = customFreqs[w] || globalFreq || 4;
                  return (
                    <div key={w} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex flex-col items-center">
                      <span className="text-xs font-black text-[#E63946] dark:text-red-400">{lang === 'en' ? 'Week' : 'Minggu'} {w}</span>
                      <select
                        value={val}
                        onChange={(e) => setCustomFreqs(prev => ({ ...prev, [w]: parseInt(e.target.value) }))}
                        className="p-1.5 mt-1 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold w-full text-center"
                      >
                        <option value="1">{lang === 'en' ? '1x / wk' : '1x / mgg'}</option>
                        <option value="2">{lang === 'en' ? '2x / wk' : '2x / mgg'}</option>
                        <option value="3">{lang === 'en' ? '3x / wk' : '3x / mgg'}</option>
                        <option value="4">{lang === 'en' ? '4x / wk' : '4x / mgg'}</option>
                        <option value="5">{lang === 'en' ? '5x / wk' : '5x / mgg'}</option>
                        <option value="6">{lang === 'en' ? '6x / wk' : '6x / mgg'}</option>
                        <option value="7">{lang === 'en' ? '7x / wk' : '7x / mgg'}</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. FOKUS PROGRAM & KUSTOMISASI PERIODISASI (SETELAH DURASI) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-[#EBE5E2] dark:border-slate-800 space-y-6">
        <h3 className="text-base font-black text-[#2B2B2B] dark:text-white flex items-center gap-2 border-b border-[#EBE5E2] dark:border-slate-800 pb-3">
          <span className="material-symbols-outlined text-[#E63946]">auto_awesome</span>
          {lang === 'en' ? '3. Program Focus & Periodization Customization' : '3. Fokus Program & Kustomisasi Periodisasi'}
        </h3>

        {/* Periodization Mode Switcher Buttons */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {lang === 'en' ? 'Periodization & Block Sequencing Method' : 'Metode Penyusunan Periodisasi & Blok'}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setGoalsMode('automatic')}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                goalsMode === 'automatic'
                  ? 'bg-[#E63946] text-white shadow-md shadow-red-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-base">auto_awesome</span>
              <span>{lang === 'en' ? 'Automatic (Sports Science)' : 'Otomatis (Sains Latihan)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setGoalsMode('custom_blocks')}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                goalsMode === 'custom_blocks'
                  ? 'bg-[#E63946] text-white shadow-md shadow-red-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-base">view_carousel</span>
              <span>{lang === 'en' ? 'Custom Block Sequence' : 'Kustom Urutan Blok'}</span>
            </button>

            <button
              type="button"
              onClick={() => setGoalsMode('custom_weekly')}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                goalsMode === 'custom_weekly'
                  ? 'bg-[#E63946] text-white shadow-md shadow-red-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-base">tune</span>
              <span>{lang === 'en' ? 'Weekly Details' : 'Detail per Minggu'}</span>
            </button>
          </div>
        </div>

        {/* MODE 1: AUTOMATIC GOALS SELECTION */}
        {goalsMode === 'automatic' && (
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {lang === 'en' ? 'Main Training Focus (Select 1 to 3)' : 'Fokus Utama Program Latihan (Pilih 1 s/d 3 Fokus)'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MST_TRAINING_PHASES.map(phase => {
                const isSelected = selectedGoals.includes(phase.phase_slug);
                return (
                  <div
                    key={phase.phase_slug}
                    onClick={() => handleToggleGoal(phase.phase_slug)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected 
                        ? 'bg-red-50 dark:bg-red-950/30 border-[#E63946] text-[#E63946] shadow-sm' 
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm mb-0.5">{phase.phase_slug.replace(/_/g, ' ').toUpperCase()}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Reps: {phase.target_reps_min}-{phase.target_reps_max} | Set: {phase.target_sets_min}-{phase.target_sets_max} | Tempo: {phase.tempo_code || '2-0-2-0'}
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center border font-bold text-xs ${
                      isSelected ? 'bg-[#E63946] text-white border-[#E63946]' : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {isSelected ? '✓' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODE 2: CUSTOM BLOCK SEQUENCING & DURATION */}
        {goalsMode === 'custom_blocks' && (
          <div className="space-y-4 pt-2">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed flex items-center justify-between flex-wrap gap-2">
              <div>
                📦 <strong>{lang === 'en' ? 'Custom Mesocycle Sequence & Duration:' : 'Kustomisasi Urutan & Durasi Blok Mesosiklus:'}</strong> {lang === 'en' ? 'Define phases and week counts for each block.' : 'Tentukan fase dan jumlah minggu untuk tiap blok.'} {lang === 'en' ? 'Total Duration:' : 'Total Durasi:'} <strong className="text-[#E63946] font-mono text-sm">{activeDuration} {lang === 'en' ? 'Weeks' : 'Minggu'}</strong>.
              </div>
              <button
                type="button"
                onClick={handleAddBlock}
                className="px-3 py-1.5 bg-[#E63946] text-white rounded-lg font-bold text-xs hover:bg-[#D62839] transition-all shadow-xs cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">add_circle</span>
                <span>{lang === 'en' ? '+ Add New Block' : '+ Tambah Blok Baru'}</span>
              </button>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {(() => {
                let accWeeks = 0;
                return customBlockConfigs.map((block, idx) => {
                  const startW = accWeeks + 1;
                  const dur = parseInt(block.duration_weeks) || 4;
                  accWeeks += dur;
                  const endW = accWeeks;

                  const currentPhaseSlug = block.phase_slug || 'hypertrophy';
                  const prevPhaseSlug = idx > 0 ? customBlockConfigs[idx - 1]?.phase_slug : null;

                  const currentPhaseObj = MST_TRAINING_PHASES.find(p => p.phase_slug === currentPhaseSlug) || MST_TRAINING_PHASES[0];
                  const compatStatus = prevPhaseSlug ? getCompatibility(prevPhaseSlug, currentPhaseSlug) : 'NEUTRAL';
                  const smartRec = getPhaseRecommendation(currentPhaseSlug, dur, trainingLevel, lang);

                  let compatBadge = null;
                  if (prevPhaseSlug && prevPhaseSlug !== currentPhaseSlug) {
                    if (compatStatus === 'SYNERGISTIC') {
                      compatBadge = (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                          {lang === 'en' ? '✓ Synergistic Transition' : '✓ Transisi Blok Serasi'}
                        </span>
                      );
                    } else if (compatStatus === 'CONFLICTING') {
                      compatBadge = (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300">
                          {lang === 'en' ? '⚠ Conflicting Transition (AMPK-mTOR)' : '⚠ Transisi Konflik (AMPK-mTOR)'}
                        </span>
                      );
                    }
                  }

                  return (
                    <div 
                      key={idx} 
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-3 shadow-2xs relative"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-[#E63946] text-white font-black flex items-center justify-center text-xs font-mono">
                            B{idx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-sm text-slate-900 dark:text-white block">
                              {lang === 'en' ? 'Mesocycle Block' : 'Blok Mesosiklus'} {idx + 1} ({lang === 'en' ? 'Week' : 'Minggu'} {startW} {lang === 'en' ? 'to' : 's/d'} {endW} — Total {dur} {lang === 'en' ? 'Weeks' : 'Minggu'})
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                              {lang === 'en' ? `Week ${endW} is conditioned as Deload Recovery Phase (-40% Volume)` : `Minggu ke-${endW} dikondisikan sebagai Fase Deload Recovery (-40% Volume)`}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {compatBadge}
                          {customBlockConfigs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveBlock(idx)}
                              className="text-slate-400 hover:text-[#E63946] transition-colors p-1 rounded bg-transparent border-0 cursor-pointer"
                              title={lang === 'en' ? 'Remove This Block' : 'Hapus Blok Ini'}
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                              {lang === 'en' ? `Block ${idx + 1} Program Phase` : `Fase Program Blok ${idx + 1}`}
                            </label>
                            <select
                              value={currentPhaseSlug}
                              onChange={(e) => handleBlockChange(idx, 'phase_slug', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                            >
                              {MST_TRAINING_PHASES.map(p => (
                                <option key={p.phase_slug} value={p.phase_slug}>
                                  {p.phase_slug.replace(/_/g, ' ').toUpperCase()} ({p.target_reps_min}-{p.target_reps_max} Reps)
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                              {lang === 'en' ? `Block ${idx + 1} Duration (Weeks)` : `Durasi Blok ${idx + 1} (Jumlah Minggu)`}
                            </label>
                            <select
                              value={dur}
                              onChange={(e) => handleBlockChange(idx, 'duration_weeks', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                            >
                              <option value="2">{lang === 'en' ? '2 Weeks (Short/Trial Phase)' : '2 Minggu (Fase Pendek / Trial)'}</option>
                              <option value="3">{lang === 'en' ? '3 Weeks (High Intensity Phase)' : '3 Minggu (Fase Intensitas Tinggi)'}</option>
                              <option value="4">{lang === 'en' ? '4 Weeks (Scientific Mesocycle Standard)' : '4 Minggu (Standar Mesosiklus Saintifik)'}</option>
                              <option value="5">{lang === 'en' ? '5 Weeks (Extended Block)' : '5 Minggu (Extended Block)'}</option>
                              <option value="6">{lang === 'en' ? '6 Weeks (Long Hypertrophy Phase)' : '6 Minggu (Fase Hipertrofi Panjang)'}</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className={`p-3 rounded-xl border text-xs font-semibold space-y-1 ${smartRec.color}`}>
                            <div className="font-bold flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-base">lightbulb</span>
                              <span>{smartRec.badge}</span>
                            </div>
                            <div className="font-normal opacity-90 leading-relaxed">
                              {smartRec.text}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* MODE 3: CUSTOM WEEKLY PHASE SELECTION */}
        {goalsMode === 'custom_weekly' && (
          <div className="space-y-4 pt-2">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              🎯 <strong>{lang === 'en' ? `Custom Weekly Details (${activeDuration} Weeks):` : `Kustomisasi Detail per Minggu (${activeDuration} Minggu):`}</strong> {lang === 'en' ? 'Set specific phase focus for each week individually.' : 'Atur fokus fase spesifik untuk setiap minggu satu per satu.'}
            </div>

            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {weeksArray.map(w => {
                const currentPhaseSlug = weeklyCustomPhases[w] || 'hypertrophy';
                const prevPhaseSlug = w > 1 ? (weeklyCustomPhases[w - 1] || 'hypertrophy') : null;
                const currentPhaseObj = MST_TRAINING_PHASES.find(p => p.phase_slug === currentPhaseSlug) || MST_TRAINING_PHASES[0];
                const compatStatus = prevPhaseSlug ? getCompatibility(prevPhaseSlug, currentPhaseSlug) : 'NEUTRAL';

                return (
                  <div 
                    key={w} 
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#FFFFFF] dark:bg-slate-900 space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className="font-bold text-sm text-[#2B2B2B] dark:text-white">
                        {lang === 'en' ? `Week ${w}` : `Minggu Ke-${w}`}
                      </span>
                      {prevPhaseSlug && prevPhaseSlug !== currentPhaseSlug && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          {compatStatus}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <select
                        value={currentPhaseSlug}
                        onChange={(e) => handleSingleWeekPhaseChange(w, e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800 text-[#2B2B2B] dark:text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                      >
                        {MST_TRAINING_PHASES.map(p => (
                          <option key={p.phase_slug} value={p.phase_slug}>
                            {p.phase_slug.replace(/_/g, ' ').toUpperCase()}
                          </option>
                        ))}
                      </select>
                      <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {lang === 'en' ? 'Physiological Target:' : 'Acuan Fisiologis:'} {currentPhaseObj?.target_reps_min}-{currentPhaseObj?.target_reps_max} Reps | {currentPhaseObj?.target_sets_min}-{currentPhaseObj?.target_sets_max} Set
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. TARGET 1RM INCREASE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-[#EBE5E2] dark:border-slate-800 space-y-6">
        <h3 className="text-base font-black text-[#2B2B2B] dark:text-white flex items-center gap-2 border-b border-[#EBE5E2] dark:border-slate-800 pb-3">
          <span className="material-symbols-outlined text-[#E63946]">trending_up</span>
          {lang === 'en' ? '4. 1RM Strength Increase Target (%)' : '4. Target Peningkatan Kekuatan 1RM (%)'}
        </h3>

        {(() => {
          const valResult = validateTarget1RM(target1rmPct, trainingLevel, activeDuration);
          const weeklyIncrement = valResult.weekly_increment_pct;
          const status = valResult.status;

          const levelName = lang === 'en' 
            ? (trainingLevel === 'BEGINNER' ? 'Beginner' : trainingLevel === 'INTERMEDIATE' ? 'Intermediate' : 'Advanced')
            : (trainingLevel === 'BEGINNER' ? 'Pemula' : trainingLevel === 'INTERMEDIATE' ? 'Menengah' : 'Lanjutan');

          let label = lang === 'en' ? `Realistic & Achievable (${levelName} Athlete)` : `Realistis & Memungkinkan (Atlet ${levelName})`;
          let badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
          let desc = lang === 'en' 
            ? `Safe progression (+${weeklyIncrement.toFixed(1)}%/week). Aligns with the physiological adaptation curve of a ${levelName.toLowerCase()} athlete.` 
            : `Progresi aman (+${weeklyIncrement.toFixed(1)}%/minggu). Sesuai dengan kurva adaptasi fisiologis seluler atlet ${levelName}.`;
          let icon = 'task_alt';

          if (status === 'UNREALISTIC') {
            label = lang === 'en' ? `🔴 Unrealistic / Overtraining Risk (${levelName} Athlete)` : `🔴 Tidak Realistis / Berisiko Overtraining & Cedera (Atlet ${levelName})`;
            badgeColor = 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
            desc = lang === 'en'
              ? `Increase of (+${weeklyIncrement.toFixed(1)}%/week) exceeds physiological adaptation limits for a ${levelName.toLowerCase()} athlete. High risk of overtraining & injury. Consider lowering the % target or extending duration.`
              : `Kenaikan (+${weeklyIncrement.toFixed(1)}%/minggu) melampaui batas fisiologis adaptasi seluler untuk atlet ${levelName}. Berisiko tinggi overtraining & cedera. Disarankan menurunkan target % atau memperpanjang durasi minggu.`;
            icon = 'warning';
          } else if (status === 'AMBITIOUS') {
            label = lang === 'en' ? `🟡 Ambitious (Requires Strict Nutrition & Recovery)` : `🟡 Ambisius (Membutuhkan Disiplin Nutrisi & Pemulihan Ekstra)`;
            badgeColor = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
            desc = lang === 'en'
              ? `High progression (+${weeklyIncrement.toFixed(1)}%/week) for a ${levelName.toLowerCase()} athlete. Requires very strict discipline in nutrition, sleep, and recovery.`
              : `Progresi tinggi (+${weeklyIncrement.toFixed(1)}%/minggu) untuk atlet ${levelName}. Membutuhkan disiplin nutrisi, tidur, dan pemulihan yang sangat ketat.`;
            icon = 'bolt';
          }

          return (
            <div className="space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {lang === 'en' ? '1RM Load Increase Target (%)' : 'Target Peningkatan Beban 1RM (%)'}
                </label>
                <span className="text-base font-black text-[#E63946] dark:text-red-400 font-mono bg-red-50 dark:bg-red-950/60 px-3 py-1 rounded-lg border border-red-200 dark:border-red-800">
                  +{target1rmPct}%
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {[5, 10, 15, 20, 25].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setTarget1rmPct(pct)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                      target1rmPct === pct
                        ? 'bg-[#E63946] text-white border-[#E63946] shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    +{pct}%
                  </button>
                ))}
              </div>

              <input 
                type="range" 
                value={target1rmPct} 
                onChange={(e) => setTarget1rmPct(parseFloat(e.target.value))}
                className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#E63946]" 
                min="1" max="35" step="1" 
              />

              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${badgeColor}`} style={{ width: '100%', boxSizing: 'border-box' }}>
                <div className="flex items-start sm:items-center gap-2.5 flex-1 min-w-0" style={{ width: '100%' }}>
                  <span className="material-symbols-outlined text-lg shrink-0 mt-0.5 sm:mt-0">{icon}</span>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <span className="font-extrabold block text-xs leading-snug">{label}</span>
                    <span className="font-medium opacity-90 block text-xs leading-relaxed">{desc}</span>
                  </div>
                </div>
                <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-900/60 border border-current shrink-0">
                  +{weeklyIncrement.toFixed(1)}%/{lang === 'en' ? 'wk' : 'mgg'}
                </span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onPrev}
          className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
        >
          {lang === 'en' ? 'Previous' : 'Sebelumnya'}
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="px-8 py-3.5 bg-[#E63946] hover:bg-[#D62839] text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-red-500/20 cursor-pointer flex items-center gap-2"
        >
          <span>{lang === 'en' ? 'Continue to Summary & Generate' : 'Lanjut ke Ringkasan & Generate'}</span>
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default GoalsStep;
