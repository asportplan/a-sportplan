import React, { useState, useEffect } from 'react';
import { MST_TRAINING_PHASES } from '../../core/db/master-data.js';
import { getCompatibility } from '../../core/db/compatibility-matrix.js';
import { getUserProfile, saveUserProfile } from '../../core/db/user-store.js';
import { getPhaseRecommendation } from '../wizard/GoalsStep.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';

const GoalsPage = () => {
  const { lang } = useLanguage();
  const profile = getUserProfile() || {};
  const initialDuration = parseInt(profile.active_program_duration_weeks || 8);

  const [goalsMode, setGoalsMode] = useState(profile.goals_mode || 'automatic');
  const [selectedGoals, setSelectedGoals] = useState(() => {
    if (Array.isArray(profile.selected_goals) && profile.selected_goals.length > 0) {
      return profile.selected_goals.map(g => g === 'hypertrophy_general' ? 'hypertrophy' : g);
    }
    return ['hypertrophy'];
  });
  
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
  const activeDuration = goalsMode === 'custom_blocks' ? dynamicTotalWeeks : initialDuration;
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

  const handleToggleGoal = (slug) => {
    let next;
    if (selectedGoals.includes(slug)) {
      if (selectedGoals.length === 1) return;
      next = selectedGoals.filter(s => s !== slug);
    } else {
      if (selectedGoals.length >= 3) {
        alert(lang === 'en' ? 'Maximum 3 program goals can be selected at once.' : 'Maksimal 3 fokus program yang dapat dipilih sekaligus.');
        return;
      }
      next = [...selectedGoals, slug];
    }
    setSelectedGoals(next);
    saveUserProfile({ 
      selected_goals: next,
      goals_mode: goalsMode,
      custom_block_configs: customBlockConfigs,
      weekly_custom_phases: weeklyCustomPhases
    });
  };

  const handleModeChange = (mode) => {
    setGoalsMode(mode);
    saveUserProfile({ 
      goals_mode: mode,
      selected_goals: selectedGoals,
      custom_block_configs: customBlockConfigs,
      weekly_custom_phases: weeklyCustomPhases
    });
  };

  const handleBlockChange = (index, field, value) => {
    const nextConfigs = [...customBlockConfigs];
    nextConfigs[index] = {
      ...nextConfigs[index],
      [field]: field === 'duration_weeks' ? parseInt(value) || 4 : value
    };
    setCustomBlockConfigs(nextConfigs);

    const nextTotalWeeks = nextConfigs.reduce((sum, b) => sum + (parseInt(b.duration_weeks) || 4), 0);
    const accumulatedGoals = [...new Set(nextConfigs.map(b => b.phase_slug))];

    saveUserProfile({ 
      active_program_duration_weeks: nextTotalWeeks,
      goals_mode: goalsMode,
      selected_goals: accumulatedGoals,
      custom_block_configs: nextConfigs,
      weekly_custom_phases: weeklyCustomPhases
    });
  };

  const handleAddBlock = () => {
    if (customBlockConfigs.length >= 8) return;
    const lastPhase = customBlockConfigs[customBlockConfigs.length - 1]?.phase_slug || 'hypertrophy';
    const nextConfigs = [
      ...customBlockConfigs,
      { id: customBlockConfigs.length + 1, duration_weeks: 4, phase_slug: lastPhase }
    ];
    setCustomBlockConfigs(nextConfigs);
    const nextTotalWeeks = nextConfigs.reduce((sum, b) => sum + (parseInt(b.duration_weeks) || 4), 0);
    saveUserProfile({
      active_program_duration_weeks: nextTotalWeeks,
      goals_mode: goalsMode,
      selected_goals: [...new Set(nextConfigs.map(b => b.phase_slug))],
      custom_block_configs: nextConfigs,
      weekly_custom_phases: weeklyCustomPhases
    });
  };

  const handleRemoveBlock = (index) => {
    if (customBlockConfigs.length <= 1) return;
    const nextConfigs = customBlockConfigs.filter((_, i) => i !== index);
    setCustomBlockConfigs(nextConfigs);
    const nextTotalWeeks = nextConfigs.reduce((sum, b) => sum + (parseInt(b.duration_weeks) || 4), 0);
    saveUserProfile({
      active_program_duration_weeks: nextTotalWeeks,
      goals_mode: goalsMode,
      selected_goals: [...new Set(nextConfigs.map(b => b.phase_slug))],
      custom_block_configs: nextConfigs,
      weekly_custom_phases: weeklyCustomPhases
    });
  };

  const handleSingleWeekPhaseChange = (weekNum, phaseSlug) => {
    const nextMap = { ...weeklyCustomPhases, [weekNum]: phaseSlug };
    setWeeklyCustomPhases(nextMap);
    const accumulatedGoals = [...new Set(Object.values(nextMap))];
    saveUserProfile({ 
      goals_mode: goalsMode,
      selected_goals: accumulatedGoals,
      custom_block_configs: customBlockConfigs,
      weekly_custom_phases: nextMap
    });
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-[#EBE5E2] dark:border-slate-800 space-y-2">
        <h2 className="text-xl font-bold text-[#2B2B2B] dark:text-white">
          {lang === 'en' ? `Program Focus & Periodization Setup (${activeDuration} Weeks)` : `Fokus Program & Struktur Periodisasi (${activeDuration} Minggu)`}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
          {lang === 'en' 
            ? 'Manage your training periodization strategy. Set phase sequence and block durations with real-time sports science recommendations.' 
            : 'Kelola strategi periodisasi program Anda. Atur urutan fase dan durasi minggu tiap blok mesosiklus dengan rekomendasi fisiologi latihan real-time.'}
        </p>
      </div>

      {/* 3-Mode Switcher Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => handleModeChange('automatic')}
          className={`py-3 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            goalsMode === 'automatic'
              ? 'bg-[#E63946] text-white shadow-md shadow-red-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-base">auto_awesome</span>
          <span>{lang === 'en' ? 'Automatic (Smart Setup)' : 'Otomatis (Saran Program Terbaik)'}</span>
        </button>

        <button
          type="button"
          onClick={() => handleModeChange('custom_blocks')}
          className={`py-3 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            goalsMode === 'custom_blocks'
              ? 'bg-[#E63946] text-white shadow-md shadow-red-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-base">view_carousel</span>
          <span>{lang === 'en' ? 'Custom Block Sequence' : 'Kustom Urutan & Durasi Blok'}</span>
        </button>

        <button
          type="button"
          onClick={() => handleModeChange('custom_weekly')}
          className={`py-3 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            goalsMode === 'custom_weekly'
              ? 'bg-[#E63946] text-white shadow-md shadow-red-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-base">tune</span>
          <span>{lang === 'en' ? 'Custom Weekly Detail' : 'Detail per Minggu'}</span>
        </button>
      </div>

      {/* MODE 1: AUTOMATIC GOALS SELECTION */}
      {goalsMode === 'automatic' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {MST_TRAINING_PHASES.map(phase => {
              const active = selectedGoals.includes(phase.phase_slug);
              return (
                <div 
                  key={phase.phase_slug}
                  onClick={() => handleToggleGoal(phase.phase_slug)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                    active 
                      ? 'bg-red-50 dark:bg-red-950/30 border-[#E63946] shadow-sm' 
                      : 'bg-white dark:bg-slate-900 border-[#EBE5E2] dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm text-[#2B2B2B] dark:text-white capitalize">
                      {phase.phase_slug.replace(/_/g, ' ')}
                    </h3>
                    {active && <span className="material-symbols-outlined text-[#E63946] text-lg">check_circle</span>}
                  </div>
                  <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <p>{lang === 'en' ? 'Reps' : 'Repetisi'}: <strong>{phase.target_reps_min}-{phase.target_reps_max} Reps</strong> | {lang === 'en' ? 'Sets' : 'Set'}: <strong>{phase.target_sets_min}-{phase.target_sets_max}</strong></p>
                    <p>Tempo: <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">{phase.tempo_code}</code> | Rest: {phase.rest_interval_sec_min}-{phase.rest_interval_sec_max}s</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 2: CUSTOM BLOCK SEQUENCING & DURATION (SMART SUGGESTIONS) */}
      {goalsMode === 'custom_blocks' && (
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-slate-900 border border-[#EBE5E2] dark:border-slate-800 rounded-2xl text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed flex items-center justify-between flex-wrap gap-2 shadow-2xs">
            <div>
              {lang === 'en' ? (
                <><strong>Custom Block Sequence & Duration:</strong> Set phases and week counts per block. Total Program Duration: <strong className="text-[#E63946] font-mono text-sm">{activeDuration} Weeks</strong>.</>
              ) : (
                <><strong>Kustomisasi Urutan & Durasi Blok:</strong> Atur fase dan jumlah minggu tiap blok. Total Durasi Program: <strong className="text-[#E63946] font-mono text-sm">{activeDuration} Minggu</strong>.</>
              )}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                const smartRec = getPhaseRecommendation(currentPhaseSlug, dur, profile.training_age_level);

                let compatBadge = null;
                if (prevPhaseSlug && prevPhaseSlug !== currentPhaseSlug) {
                  if (compatStatus === 'SYNERGISTIC') {
                    compatBadge = (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                        {lang === 'en' ? '✓ Synergistic Transition' : '✓ Transisi Serasi'}
                      </span>
                    );
                  } else if (compatStatus === 'CONFLICTING') {
                    compatBadge = (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300">
                        {lang === 'en' ? 'Conflicting Transition' : 'Transisi Konflik'}
                      </span>
                    );
                  }
                }

                return (
                  <div 
                    key={idx} 
                    className="p-4 rounded-2xl border border-[#EBE5E2] dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-[#E63946] text-white font-black flex items-center justify-center text-xs font-mono">
                          B{idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-sm text-slate-900 dark:text-white block">
                            {lang === 'en' ? `Block ${idx + 1} (Weeks ${startW}-${endW})` : `Blok ${idx + 1} (Minggu ${startW}-${endW})`}
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
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                          {lang === 'en' ? `Phase for Block ${idx + 1}` : `Fase Program Blok ${idx + 1}`}
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
                          {lang === 'en' ? `Duration for Block ${idx + 1} (Weeks)` : `Durasi Blok ${idx + 1} (Jumlah Minggu)`}
                        </label>
                        <select
                          value={dur}
                          onChange={(e) => handleBlockChange(idx, 'duration_weeks', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                        >
                          <option value="2">{lang === 'en' ? '2 Weeks (Short Phase / Trial)' : '2 Minggu (Fase Pendek / Trial)'}</option>
                          <option value="3">{lang === 'en' ? '3 Weeks (High Intensity Phase)' : '3 Minggu (Fase Intensitas Tinggi)'}</option>
                          <option value="4">{lang === 'en' ? '4 Weeks (Standard Mesocycle)' : '4 Minggu (Standar Mesosiklus Saintifik)'}</option>
                          <option value="5">{lang === 'en' ? '5 Weeks (Extended Block)' : '5 Minggu (Extended Block)'}</option>
                          <option value="6">{lang === 'en' ? '6 Weeks (Long Hypertrophy Phase)' : '6 Minggu (Fase Hipertrofi Panjang)'}</option>
                        </select>
                      </div>

                      {/* Smart Recommendation Card */}
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
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* MODE 3: CUSTOM WEEKLY PHASE SELECTION */}
      {goalsMode === 'custom_weekly' && (
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-slate-900 border border-[#EBE5E2] dark:border-slate-800 rounded-2xl text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed shadow-2xs">
            {lang === 'en' ? (
              <><strong>Custom Weekly Specifics ({activeDuration} Weeks):</strong> Define the phase focus for each week.</>
            ) : (
              <><strong>Kustomisasi Spesifik per Minggu ({activeDuration} Minggu):</strong> Tentukan fokus fase untuk setiap minggu.</>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {weeksArray.map(w => {
              const currentPhaseSlug = weeklyCustomPhases[w] || 'hypertrophy';
              const currentPhaseObj = MST_TRAINING_PHASES.find(p => p.phase_slug === currentPhaseSlug) || MST_TRAINING_PHASES[0];

              return (
                <div 
                  key={w} 
                  className="p-4 rounded-2xl border border-[#EBE5E2] dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {lang === 'en' ? `Week ${w}` : `Minggu Ke-${w}`}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <select
                      value={currentPhaseSlug}
                      onChange={(e) => handleSingleWeekPhaseChange(w, e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                    >
                      {MST_TRAINING_PHASES.map(p => (
                        <option key={p.phase_slug} value={p.phase_slug}>
                          {p.phase_slug.replace(/_/g, ' ').toUpperCase()} ({p.target_reps_min}-{p.target_reps_max} Reps)
                        </option>
                      ))}
                    </select>

                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                      {lang === 'en' ? 'Physiological Reference' : 'Acuan Fisiologis'}: <strong>{currentPhaseObj?.target_reps_min}-{currentPhaseObj?.target_reps_max} Reps</strong> | Tempo <code>{currentPhaseObj?.tempo_code || '2-0-2-0'}</code> | Rest {currentPhaseObj?.rest_interval_sec_min || 60}s
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsPage;
