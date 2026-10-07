import React, { useState, useEffect } from 'react';
import { calculate1RM } from '../../core/utils/one-rm-calculator.js';
import { useLanguage } from '../../hooks/useLanguage.js';

const OneRMCalculatorModal = ({ isOpen, onClose, onApply1RM, initialExerciseTitle, exercise, athleteWeight = 70 }) => {
  const { lang } = useLanguage();

  const isIsometric = exercise && ['plank_standard', 'side_plank', 'bird_dog'].includes(exercise.exercise_slug);
  const isBodyweight = exercise && exercise.equipment_type === 'bodyweight' && !isIsometric;

  // Form states
  const [weight, setWeight] = useState('60');
  const [reps, setReps] = useState('8');
  const [selectedFormula, setSelectedFormula] = useState('average');

  // Calisthenics specific states
  const [bwReps, setBwReps] = useState('12');
  const [addedWeight, setAddedWeight] = useState('0');

  // Reset or initialize values when exercise changes
  useEffect(() => {
    if (isBodyweight) {
      setBwReps('12');
      setAddedWeight('0');
    } else {
      setWeight('60');
      setReps('8');
    }
  }, [exercise, isBodyweight]);

  if (!isOpen) return null;

  // If Isometric (e.g. Plank)
  if (isIsometric) {
    return (
      <div 
        className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999 }}
      >
        <div 
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-fadeIn"
          style={{ width: '92%', maxWidth: '480px', minWidth: '290px', boxSizing: 'border-box', margin: 'auto', display: 'block' }}
        >
          <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-blue-600 dark:text-blue-400">
              <span className="material-symbols-outlined text-lg">timer</span>
              <span>{lang === 'en' ? 'Isometric Exercise (Time-Based)' : 'Latihan Isometrik (Tahan Waktu)'}</span>
            </div>
            <button 
              type="button"
              onClick={onClose} 
              aria-label="Close" className="text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg text-lg font-bold shrink-0 cursor-pointer min-w-11 min-h-11 inline-flex items-center justify-center rounded-lg"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-black text-slate-900 dark:text-white capitalize">
              {initialExerciseTitle || (lang === 'en' ? 'Isometric Plank Exercise' : 'Latihan Plank Isometrik')}
            </h3>
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 space-y-2 leading-relaxed">
              <p>
                {lang === 'en'
                  ? 'Isometric exercises (like Plank, Side Plank, Bird Dog) build core stability by holding a static position against gravity.'
                  : 'Latihan isometrik (seperti Plank, Side Plank, Bird Dog) melatih kekuatan dan stabilitas inti tubuh dengan cara menahan posisi secara statis melawan gravitasi.'
                }
              </p>
              <p className="font-bold">
                {lang === 'en'
                  ? 'In Sports Science, isometric holds are prescribed by duration in seconds (TUT) and RPE effort, NOT by 1RM load in kg.'
                  : 'Dalam Fisiologi Olahraga (NSCA), latihan isometrik dipreskripsikan berdasarkan durasi waktu (detik) dan RPE, BUKAN beban 1RM kilogram.'
                }
              </p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'en'
                ? 'The system automatically assigns the target hold duration (e.g. 30–60s) in your training plan. You do not need to input any 1RM value.'
                : 'Sistem secara otomatis telah mengatur durasi target tahanan (misal 30–60 detik) di tabel program latihan Anda. Anda tidak perlu memasukkan nilai 1RM.'
              }
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer text-center"
            >
              {lang === 'en' ? 'Understood, Close' : 'Mengerti, Tutup'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate bodyweight effective load
  const relativePct = exercise?.relative_load_pct || 0.64;
  const effectiveBwLoad = Math.round(athleteWeight * relativePct * 10) / 10;
  const extraWeight = parseFloat(addedWeight) || 0;
  const totalCalisthenicLoad = effectiveBwLoad + extraWeight;

  // Compute 1RM results
  const activeWeight = isBodyweight ? totalCalisthenicLoad : weight;
  const activeReps = isBodyweight ? bwReps : reps;
  const result = calculate1RM(activeWeight, activeReps);

  const handleApply = () => {
    const targetVal = selectedFormula === 'epley' ? result.epley :
                     selectedFormula === 'brzycki' ? result.brzycki :
                     selectedFormula === 'lander' ? result.lander :
                     selectedFormula === 'lombardi' ? result.lombardi : result.average;

    if (onApply1RM && targetVal > 0) {
      onApply1RM(targetVal);
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999 }}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 animate-fadeIn max-h-[90vh] overflow-y-auto"
        style={{ width: '92%', maxWidth: '540px', minWidth: '290px', boxSizing: 'border-box', margin: 'auto', display: 'block' }}
      >
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4" style={{ width: '100%' }}>
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase text-[#E63946] dark:text-red-400">
              <span className="material-symbols-outlined text-lg">calculate</span>
              <span>
                {isBodyweight 
                  ? (lang === 'en' ? 'Calisthenics & Bodyweight 1RM Calculator' : 'Kalkulator 1RM Kalistenik / Tanpa Alat')
                  : (lang === 'en' ? 'Scientific 1RM Estimation Calculator' : 'Kalkulator Estimasi 1RM Saintifik')}
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1 capitalize">
              {initialExerciseTitle ? `${lang === 'en' ? 'Calculate 1RM:' : 'Hitung 1RM:'} ${initialExerciseTitle}` : (lang === 'en' ? 'Calculate Training Load 1RM' : 'Hitung 1RM Beban Latihan')}
            </h3>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            aria-label="Close" className="text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg text-lg font-bold shrink-0 cursor-pointer min-w-11 min-h-11 inline-flex items-center justify-center rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* BODYWEIGHT CALISTHENICS MODE */}
        {isBodyweight ? (
          <div className="space-y-4">
            {/* Athlete Bio & Kinetic Breakdown Card */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-emerald-900 dark:text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-emerald-600">accessibility_new</span>
                  <span>{lang === 'en' ? 'Kinetic Bodyweight Parameters:' : 'Parameter Kinetik Beban Tubuh:'}</span>
                </span>
                <span className="bg-emerald-200 dark:bg-emerald-900/80 px-2 py-0.5 rounded text-[11px]">
                  {Math.round(relativePct * 100)}% BB
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                <div>• Berat Badan Anda: <strong>{athleteWeight} kg</strong></div>
                <div>• Beban Kinetik Efektif: <strong>{effectiveBwLoad} kg</strong></div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                {lang === 'en'
                  ? `During this movement, your body pushes ~${Math.round(relativePct * 100)}% of total mass (${effectiveBwLoad} kg per rep).`
                  : `Pada gerakan ini, Anda menopang dan mendorong ~${Math.round(relativePct * 100)}% bobot tubuh (${effectiveBwLoad} kg per repetisi).`}
              </p>
            </div>

            {/* Inputs: Max Reps + Extra Weight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 dark:text-slate-300 block">
                  {lang === 'en' ? 'Max Reps Completed:' : 'Repetisi Maksimal Tanpa Henti:'}
                </label>
                <input
                  type="number"
                  value={bwReps}
                  onChange={(e) => setBwReps(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-base font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                  placeholder="Misal 15"
                  min="1"
                  max="60"
                />
                <span className="text-[11px] text-slate-400 font-medium block">
                  {lang === 'en' ? '*e.g. 15 push-ups in 1 set' : '*Misal 15 push-up dalam 1 set'}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 dark:text-slate-300 block">
                  {lang === 'en' ? 'Added Weight (kg, optional):' : 'Beban Tambahan (kg, opsional):'}
                </label>
                <input
                  type="number"
                  value={addedWeight}
                  onChange={(e) => setAddedWeight(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-base font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                  placeholder="0"
                  min="0"
                  max="150"
                />
                <span className="text-[11px] text-slate-400 font-medium block">
                  {lang === 'en' ? '*0 if standard bodyweight' : '*Isi 0 jika tanpa beban luar'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* STANDARD EXTERNAL WEIGHT MODE (Barbell, Dumbbell, Machine) */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs" style={{ width: '100%' }}>
            <div className="space-y-1.5" style={{ width: '100%' }}>
              <label className="font-extrabold text-slate-700 dark:text-slate-300 block">
                {lang === 'en' ? 'Weight Lifted (kg):' : 'Beban Terangkat (kg):'}
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-base font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                placeholder={lang === 'en' ? 'e.g. 60' : 'Misal 60'}
                min="1"
                max="500"
              />
              <span className="text-[11px] text-slate-400 font-medium block">
                {lang === 'en' ? '*Range: 1 – 500 kg' : '*Batas: 1 – 500 kg'}
              </span>
            </div>

            <div className="space-y-1.5" style={{ width: '100%' }}>
              <label className="font-extrabold text-slate-700 dark:text-slate-300 block">
                {lang === 'en' ? 'Maximal Repetitions (Reps):' : 'Repetisi Maksimal (Reps):'}
              </label>
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-base font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                placeholder={lang === 'en' ? 'e.g. 8' : 'Misal 8'}
                min="1"
                max="30"
              />
              <span className="text-[11px] text-slate-400 font-medium block">
                {lang === 'en' ? '*Golden range: 3 – 10 reps (Max: 12)' : '*Rentang Emas: 3 – 10 reps (Maks: 12)'}
              </span>
            </div>
          </div>
        )}

        {/* Calculation Results Highlight Card */}
        <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl p-5 text-white text-center space-y-2 shadow-lg shadow-red-500/20">
          <span className="text-xs font-extrabold text-white/90 uppercase tracking-wider block">
            {lang === 'en' ? 'Average 1RM Estimation (One Rep Max)' : 'Estimasi Rata-Rata 1RM (One Rep Max)'}
          </span>
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight drop-shadow-xs">
            {result.average} <span className="text-lg font-bold">kg</span>
          </div>
          <p className="text-[11px] font-medium text-white/90">
            {isBodyweight
              ? `Kapasitas kekuatan 1RM setara ${result.average} kg (berdasarkan ${bwReps} repetisi dengan beban kinetik ${Math.round(totalCalisthenicLoad)} kg).`
              : (lang === 'en' ? `Heaviest load capacity for 1 full rep based on ${weight} kg × ${reps} reps test.` : `Kapasitas beban terberat untuk tepat 1 repetisi penuh berdasarkan tes ${weight} kg × ${reps} reps.`)}
          </p>
        </div>

        {/* Formula Comparison Grid */}
        <div className="space-y-2 pt-1 text-xs">
          <span className="font-extrabold text-slate-700 dark:text-slate-300 block">
            {lang === 'en' ? 'Comparison of 4 Verified Sports Physiology Formulas:' : 'Perbandingan 4 Rumus Fisiologi Olahraga Terverifikasi:'}
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            {[
              { id: 'average', name: lang === 'en' ? 'Average' : 'Rata-Rata', val: result.average, formula: '(E+B+L+L)/4', desc: lang === 'en' ? 'Balanced average of 4 validated methods' : 'Rata-Rata seimbang dari 4 metode fisiologi' },
              { id: 'epley', name: 'Epley', val: result.epley, formula: 'W × (1 + R/30)', desc: lang === 'en' ? 'Best for 6-10 reps linear progression' : 'Paling ideal untuk repetisi linier 6–10 reps' },
              { id: 'brzycki', name: 'Brzycki', val: result.brzycki, formula: 'W × 36/(37-R)', desc: lang === 'en' ? 'Gold standard for heavy 1-10 reps' : 'Standar emas beban berat 1–10 reps' },
              { id: 'lander', name: 'Lander', val: result.lander, formula: '100W/(101.3-2.67R)', desc: lang === 'en' ? 'Empirical fatigue curve for compound lifts' : 'Kurva kelelahan untuk compound lifts 2–8 reps' },
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFormula(f.id)}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedFormula === f.id
                    ? 'bg-red-50 dark:bg-red-950/60 border-[#E63946] ring-2 ring-red-500/30'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                }`}
              >
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold block">{f.name}</span>
                <strong className="text-sm font-mono font-black text-[#E63946] dark:text-red-400 block my-0.5">{f.val} kg</strong>
                <code className="text-[11px] text-slate-500 dark:text-slate-400 font-mono block bg-slate-200/60 dark:bg-slate-700/60 px-1 py-0.5 rounded text-center truncate">
                  {f.formula}
                </code>
              </button>
            ))}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2">
          {onApply1RM && (
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 py-3 bg-[#E63946] hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md shadow-red-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>{lang === 'en' ? `Apply This ${result.average} kg Value` : `Terapkan Nilai ${result.average} kg Ini`}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="py-3 px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl text-center cursor-pointer"
          >
            {onApply1RM ? (lang === 'en' ? 'Cancel' : 'Batal') : (lang === 'en' ? 'Close Calculator' : 'Tutup Kalkulator')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default OneRMCalculatorModal;
