import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage.js';
import { 
  getGeneratedProgram, 
  getWorkoutResults, 
  getWorkoutResultsForSession, 
  saveSessionResults,
  getWeeklyBodyWeights,
  saveWeeklyBodyWeight,
  clearWorkoutResults
} from '../../core/db/user-store.js';
import { calculate1RM } from '../../core/engine/analysis-engine.js';

const LogResultsPage = ({ onNavigate, programOverride }) => {
  const { lang } = useLanguage();
  const [program, setProgram] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [bodyWeight, setBodyWeight] = useState('');
  const [weekData, setWeekData] = useState({}); // map of sessionKey => exercises
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    const prog = programOverride || getGeneratedProgram();
    setProgram(prog);
  }, [programOverride]);

  // Load data for the selected week
  useEffect(() => {
    if (!program || !program.weeks) return;

    const progId = program.id || program.program_id || 'default_program';
    const weekObj = program.weeks.find(w => (w.week_number || w.week) === selectedWeek);
    if (!weekObj) return;

    // Load body weight for this week
    const bwList = getWeeklyBodyWeights(progId);
    const existingBW = bwList.find(b => b.week === selectedWeek);
    if (existingBW) {
      setBodyWeight(existingBW.weightKg || '');
    } else {
      setBodyWeight('');
    }

    // Load sessions data for this week
    const sessions = weekObj.sessions || weekObj.days || [];
    const newWeekData = {};

    sessions.forEach(session => {
      const dayNum = session.day_number || session.day || 1;
      const sessionKey = `w${selectedWeek}_d${dayNum}`;
      const saved = getWorkoutResultsForSession(progId, selectedWeek, dayNum);

      if (saved && saved.exercises && saved.exercises.length > 0) {
        newWeekData[sessionKey] = saved.exercises;
      } else {
        // Prefill from prescribed exercises
        const prescribedList = session.exercises || session.prescribed_exercises || [];
        newWeekData[sessionKey] = prescribedList.map(ex => {
          const numSets = parseInt(ex.sets, 10) || 3;
          const numReps = parseInt(ex.is_timed && ex.duration_sec ? ex.duration_sec : ex.reps, 10) || 10;
          const targetLoad = parseFloat(ex.load_kg || ex.target_load_kg) || 0;
          const targetRpe = parseFloat(ex.target_rpe || ex.prescribed_intensity_rpe) || 8;

          const sets = Array.from({ length: numSets }, (_, sIdx) => ({
            set_number: sIdx + 1,
            weight: targetLoad > 0 ? targetLoad : '',
            reps: numReps > 0 ? numReps : '',
            rpe: targetRpe
          }));

          return {
            exercise_name: ex.exercise_name || (ex.exercise_slug ? ex.exercise_slug.replace(/_/g, ' ') : `Exercise`),
            exercise_slug: ex.exercise_slug || '',
            target_sets: numSets,
            target_reps: numReps,
            is_timed: !!ex.is_timed,
            target_load: targetLoad,
            target_rpe: targetRpe,
            sets
          };
        });
      }
    });

    setWeekData(newWeekData);
  }, [program, selectedWeek]);

  if (!program || !program.weeks || program.weeks.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 text-center border border-[#EBE5E2] dark:border-slate-800 max-w-xl mx-auto space-y-4 shadow-sm my-8">
        <span className="material-symbols-outlined text-5xl text-[#E63946]">fitness_center</span>
        <h3 className="text-xl font-black text-[#2B2B2B] dark:text-white">
          {lang === 'en' ? 'No Training Program Found' : 'Belum Ada Program Latihan'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {lang === 'en'
            ? 'Please generate a training program first using the Wizard to start logging your session results.'
            : 'Silakan generate program latihan terlebih dahulu melalui Generator Wizard untuk mulai menginput hasil latihan Anda.'}
        </p>
        <button
          onClick={() => onNavigate ? onNavigate('wizard') : (window.location.hash = '#/wizard')}
          className="px-6 py-3 bg-[#E63946] text-white font-extrabold text-xs rounded-xl shadow-md hover:bg-red-700 transition-all cursor-pointer"
        >
          {lang === 'en' ? 'Go to Program Generator' : 'Buka Generator Program'}
        </button>
      </div>
    );
  }

  const progId = program.id || program.program_id || 'default_program';
  const weeks = program.weeks || [];
  const currentWeekObj = weeks.find(w => (w.week_number || w.week) === selectedWeek) || weeks[0];
  const sessions = currentWeekObj ? (currentWeekObj.sessions || currentWeekObj.days || []) : [];

  // Update a specific set's field
  const handleSetChange = (sessionKey, exIdx, setIdx, field, val) => {
    setWeekData(prev => {
      const clone = { ...prev };
      const exList = [...(clone[sessionKey] || [])];
      const ex = { ...exList[exIdx] };
      const sets = [...ex.sets];
      sets[setIdx] = { ...sets[setIdx], [field]: val };
      ex.sets = sets;
      exList[exIdx] = ex;
      clone[sessionKey] = exList;
      return clone;
    });
  };

  // Quick action: Autofill current week with prescribed target
  const handleAutofillWeek = () => {
    const updated = { ...weekData };
    sessions.forEach(session => {
      const dayNum = session.day_number || session.day || 1;
      const sessionKey = `w${selectedWeek}_d${dayNum}`;
      const prescribedList = session.exercises || session.prescribed_exercises || [];

      updated[sessionKey] = prescribedList.map(ex => {
        const numSets = parseInt(ex.sets, 10) || 3;
        const numReps = parseInt(ex.is_timed && ex.duration_sec ? ex.duration_sec : ex.reps, 10) || 10;
        const targetLoad = parseFloat(ex.load_kg || ex.target_load_kg) || 0;
        const targetRpe = parseFloat(ex.target_rpe || ex.prescribed_intensity_rpe) || 8;

        return {
          exercise_name: ex.exercise_name || (ex.exercise_slug ? ex.exercise_slug.replace(/_/g, ' ') : `Exercise`),
          exercise_slug: ex.exercise_slug || '',
          target_sets: numSets,
          target_reps: numReps,
          is_timed: !!ex.is_timed,
          target_load: targetLoad,
          target_rpe: targetRpe,
          sets: Array.from({ length: numSets }, (_, i) => ({
            set_number: i + 1,
            weight: targetLoad > 0 ? targetLoad : 20,
            reps: numReps,
            rpe: targetRpe
          }))
        };
      });
    });

    setWeekData(updated);
    setSaveStatus(lang === 'en' ? 'Prefilled with target values!' : 'Nilai target terisi otomatis!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  // Quick action: Autofill ALL weeks for the entire program (1-Click Demo)
  const handleAutofillAllProgram = () => {
    weeks.forEach((w, wIdx) => {
      const wNum = w.week_number || w.week || (wIdx + 1);
      const sessList = w.sessions || w.days || [];
      
      // Save default body weight (e.g. 70 + slight variation)
      saveWeeklyBodyWeight(progId, wNum, 70 + (wIdx * 0.3));

      sessList.forEach(session => {
        const dNum = session.day_number || session.day || 1;
        const prescribedList = session.exercises || session.prescribed_exercises || [];
        const exercisesData = prescribedList.map(ex => {
          const numSets = parseInt(ex.sets, 10) || 3;
          const numReps = parseInt(ex.is_timed && ex.duration_sec ? ex.duration_sec : ex.reps, 10) || 10;
          const targetLoad = parseFloat(ex.load_kg || ex.target_load_kg) || 25;
          const targetRpe = parseFloat(ex.target_rpe || ex.prescribed_intensity_rpe) || 8;

          return {
            exercise_name: ex.exercise_name || (ex.exercise_slug ? ex.exercise_slug.replace(/_/g, ' ') : 'Exercise'),
            exercise_slug: ex.exercise_slug || '',
            sets: Array.from({ length: numSets }, (_, s) => ({
              set_number: s + 1,
              weight: targetLoad + (wIdx * 1.5), // slight progression
              reps: numReps,
              rpe: Math.min(10, targetRpe + (wIdx * 0.2))
            }))
          };
        });

        saveSessionResults({
          programId: progId,
          week: wNum,
          day: dNum,
          exercises: exercisesData
        });
      });
    });

    // Refresh UI for current week
    setSelectedWeek(selectedWeek);
    setSaveStatus(lang === 'en' ? 'Entire program completed with targets!' : 'Seluruh program berhasil diisi target!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  // Save current week results
  const handleSaveWeek = () => {
    // Save body weight if entered
    if (bodyWeight && !isNaN(parseFloat(bodyWeight))) {
      saveWeeklyBodyWeight(progId, selectedWeek, parseFloat(bodyWeight));
    }

    // Save each session in this week
    sessions.forEach(session => {
      const dayNum = session.day_number || session.day || 1;
      const sessionKey = `w${selectedWeek}_d${dayNum}`;
      const exercises = weekData[sessionKey] || [];

      saveSessionResults({
        programId: progId,
        week: selectedWeek,
        day: dayNum,
        exercises
      });
    });

    setSaveStatus(lang === 'en' ? '✓ Week data saved successfully!' : '✓ Data minggu ini berhasil disimpan!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  return (
    <div className="space-y-6 pb-20 font-sans w-full max-w-5xl mx-auto">
      
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm border border-[#EBE5E2] dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#E63946] text-white flex items-center justify-center shadow-md shadow-red-500/20 shrink-0">
            <span className="material-symbols-outlined text-2xl">edit_document</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#2B2B2B] dark:text-white tracking-tight">
              {lang === 'en' ? 'Log Training Program Results' : 'Input Hasil Program Latihan'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
              {lang === 'en' 
                ? 'Input your actual sets, reps, weight, and RPE to generate the final analysis report.'
                : 'Input set, repetisi, beban aktual, dan RPE untuk menghasilkan laporan analisa akhir program.'}
            </p>
          </div>
        </div>

        {/* Top Action Nav Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onNavigate ? onNavigate('program') : (window.location.hash = '#/program')}
            className="flex-1 sm:flex-initial px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>{lang === 'en' ? 'Back to Program' : 'Kembali ke Program'}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate ? onNavigate('final_report') : (window.location.hash = '#/final-report')}
            className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">pie_chart</span>
            <span>{lang === 'en' ? 'View Final Report' : 'Lihat Laporan Akhir'}</span>
          </button>
        </div>
      </div>

      {/* Week Selector Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-[#EBE5E2] dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {lang === 'en' ? 'Select Training Week' : 'Pilih Minggu Latihan'}
          </span>

          {/* Quick Demo Helper */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAutofillWeek}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] rounded-lg transition-all cursor-pointer flex items-center gap-1"
              title={lang === 'en' ? 'Autofill this week with target values' : 'Isi otomatis minggu ini sesuai target'}
            >
              <span className="material-symbols-outlined text-sm text-[#F3722C]">bolt</span>
              <span>{lang === 'en' ? 'Autofill Week' : 'Isi Target Minggu Ini'}</span>
            </button>
            <button
              type="button"
              onClick={handleAutofillAllProgram}
              className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 dark:text-amber-300 font-extrabold text-[11px] rounded-lg border border-amber-200 dark:border-amber-800/40 transition-all cursor-pointer flex items-center gap-1"
              title={lang === 'en' ? '1-Click demo fill for all weeks' : '1-Klik isi seluruh program untuk demo'}
            >
              <span className="material-symbols-outlined text-sm text-amber-600">auto_awesome</span>
              <span>{lang === 'en' ? 'Autofill All (1-Click Demo)' : 'Isi Semua (1-Klik Cepat)'}</span>
            </button>
          </div>
        </div>

        {/* Week Buttons Carousel */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {weeks.map((w, idx) => {
            const wNum = w.week_number || w.week || (idx + 1);
            const isSelected = selectedWeek === wNum;
            return (
              <button
                key={wNum}
                type="button"
                onClick={() => setSelectedWeek(wNum)}
                className={`px-4 py-2.5 rounded-xl font-black text-xs shrink-0 transition-all cursor-pointer flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-[#E63946] text-white border-[#E63946] shadow-md shadow-red-500/25 scale-[1.02]'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{lang === 'en' ? `Week ${wNum}` : `Minggu ${wNum}`}</span>
              </button>
            );
          })}
        </div>

        {/* Body Weight Input for Selected Week */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-600 text-lg">scale</span>
            <span className="text-xs font-bold text-[#2B2B2B] dark:text-white">
              {lang === 'en' ? `Body Weight in Week ${selectedWeek}:` : `Berat Badan di Minggu ${selectedWeek}:`}
            </span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 70.5"
              value={bodyWeight}
              onChange={(e) => setBodyWeight(e.target.value)}
              className="w-28 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-black text-xs text-center focus:ring-2 focus:ring-[#E63946] outline-none"
            />
            <span className="text-xs font-bold text-slate-400">kg</span>
          </div>
        </div>
      </div>

      {/* Save Status Notification */}
      {saveStatus && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center text-xs font-black text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Sessions Container for this week */}
      <div className="space-y-6">
        {sessions.map((session, sIdx) => {
          const dayNum = session.day_number || session.day || (sIdx + 1);
          const sessionKey = `w${selectedWeek}_d${dayNum}`;
          const exList = weekData[sessionKey] || [];
          const sessionTitle = session.session_title || session.focus_title || (lang === 'en' ? `Day ${dayNum}` : `Hari ${dayNum}`);

          return (
            <div 
              key={sessionKey} 
              className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-[#EBE5E2] dark:border-slate-800 shadow-sm space-y-4"
            >
              {/* Session Header */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-950/60 text-[#E63946] dark:text-red-400 font-black text-xs">
                    {lang === 'en' ? `Day ${dayNum}` : `Hari ${dayNum}`}
                  </span>
                  <h2 className="text-base font-black text-[#2B2B2B] dark:text-white">
                    {sessionTitle}
                  </h2>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {exList.length} {lang === 'en' ? 'Exercises Prescribed' : 'Gerakan Latihan'}
                </span>
              </div>

              {/* Exercises List in this Session */}
              <div className="space-y-4">
                {exList.map((ex, exIdx) => (
                  <div 
                    key={exIdx} 
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3"
                  >
                    {/* Exercise Title & Target Label */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1">
                      <span className="font-black text-sm text-[#2B2B2B] dark:text-white capitalize">
                        {ex.exercise_name}
                      </span>
                      {ex.target_sets && (
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                          Target: {ex.target_sets} set × {ex.target_reps}{ex.is_timed ? 's' : ' reps'} {ex.target_load > 0 ? `@ ${ex.target_load} kg` : ''} (RPE {ex.target_rpe || 8})
                        </span>
                      )}
                    </div>

                    {/* Sets Input Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700 pb-1">
                            <th className="py-1.5 w-10 text-center">Set</th>
                            <th className="py-1.5 px-1 text-center">{lang === 'en' ? 'Load (kg)' : 'Beban (kg)'}</th>
                            <th className="py-1.5 px-1 text-center">{ex.is_timed ? (lang === 'en' ? 'Seconds' : 'Detik') : (lang === 'en' ? 'Reps' : 'Repetisi')}</th>
                            <th className="py-1.5 px-1 text-center">RPE (1-10)</th>
                            <th className="py-1.5 px-1 text-center hidden sm:table-cell text-emerald-700 dark:text-emerald-400 font-black">Est. 1RM</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {ex.sets.map((set, setIdx) => {
                            const est = calculate1RM(set.weight, set.reps);
                            return (
                              <tr key={setIdx} className="hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                <td className="py-2 text-center font-bold text-slate-500">{setIdx + 1}</td>
                                
                                {/* Actual Weight */}
                                <td className="py-2 px-1 text-center">
                                  <input
                                    type="number"
                                    step="0.5"
                                    value={set.weight}
                                    placeholder="kg"
                                    onChange={(e) => handleSetChange(sessionKey, exIdx, setIdx, 'weight', e.target.value)}
                                    inputMode="decimal"
                                    className="w-full max-w-24 min-h-11 px-1 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-black text-base sm:text-sm text-center focus:ring-2 focus:ring-[#E63946] outline-none"
                                  />
                                </td>

                                {/* Actual Reps */}
                                <td className="py-2 px-1 text-center">
                                  <input
                                    type="number"
                                    value={set.reps}
                                    placeholder="reps"
                                    onChange={(e) => handleSetChange(sessionKey, exIdx, setIdx, 'reps', e.target.value)}
                                    inputMode="decimal"
                                    className="w-full max-w-24 min-h-11 px-1 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-black text-base sm:text-sm text-center focus:ring-2 focus:ring-[#E63946] outline-none"
                                  />
                                </td>

                                {/* Perceived RPE */}
                                <td className="py-2 px-1 text-center">
                                  <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    step="0.5"
                                    value={set.rpe}
                                    placeholder="8"
                                    onChange={(e) => handleSetChange(sessionKey, exIdx, setIdx, 'rpe', e.target.value)}
                                    inputMode="decimal"
                                    className="w-full max-w-24 min-h-11 px-1 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-black text-base sm:text-sm text-center focus:ring-2 focus:ring-[#E63946] outline-none"
                                  />
                                </td>

                                {/* Real-time Est. 1RM */}
                                <td className="py-2 text-center hidden sm:table-cell font-mono font-black text-emerald-700 dark:text-emerald-400">
                                  {est > 0 ? `${est.toFixed(1)} kg` : '—'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Sticky Action Bar */}
      <div className="sticky bottom-20 md:bottom-4 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-[#EBE5E2] dark:border-slate-800 shadow-xl flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="text-xs font-bold text-slate-500">
          {lang === 'en'
            ? `Editing Week ${selectedWeek} of ${weeks.length}`
            : `Menginput Minggu ${selectedWeek} dari ${weeks.length}`}
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleSaveWeek}
            className="flex-1 sm:flex-initial px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-xs hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">save</span>
            <span>{lang === 'en' ? 'Save This Week' : 'Simpan Minggu Ini'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              handleSaveWeek();
              if (onNavigate) onNavigate('final_report');
              else window.location.hash = '#/final-report';
            }}
            className="flex-1 sm:flex-initial px-6 py-2.5 bg-[#E63946] hover:bg-red-700 text-white rounded-xl font-black text-xs shadow-md shadow-red-500/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">pie_chart</span>
            <span>{lang === 'en' ? 'Save & View Final Report ➔' : 'Simpan & Lihat Laporan Akhir ➔'}</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default LogResultsPage;
