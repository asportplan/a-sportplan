import React, { useState } from 'react';
import { calculate1RM } from '../../core/utils/one-rm-calculator.js';
import { useLanguage } from '../../hooks/useLanguage.js';

const OneRMCalculatorModal = ({ isOpen, onClose, onApply1RM, initialExerciseTitle }) => {
  const { lang } = useLanguage();
  const [weight, setWeight] = useState('60');
  const [reps, setReps] = useState('8');
  const [selectedFormula, setSelectedFormula] = useState('average');

  if (!isOpen) return null;

  const result = calculate1RM(weight, reps);

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
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', zIndex: 99999 }}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 animate-fadeIn"
        style={{ width: '92%', maxWidth: '520px', minWidth: '290px', boxSizing: 'border-box', margin: 'auto', display: 'block' }}
      >
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4" style={{ width: '100%' }}>
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase text-[#E63946] dark:text-red-400">
              <span className="material-symbols-outlined text-lg">calculate</span>
              <span>{lang === 'en' ? 'Scientific 1RM Estimation Calculator' : 'Kalkulator Estimasi 1RM Saintifik'}</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1 capitalize">
              {initialExerciseTitle ? `${lang === 'en' ? 'Calculate 1RM:' : 'Hitung 1RM:'} ${initialExerciseTitle}` : (lang === 'en' ? 'Calculate Training Load 1RM' : 'Hitung 1RM Beban Latihan')}
            </h3>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg text-lg font-bold shrink-0 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Interactive Inputs */}
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
          </div>
        </div>

        {/* Calculation Results Highlight Card */}
        <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl p-5 text-white text-center space-y-2 shadow-lg shadow-red-500/20">
          <span className="text-xs font-extrabold text-white/90 uppercase tracking-wider block">
            {lang === 'en' ? 'Average 1RM Estimation (One Rep Max)' : 'Estimasi Rata-Rata 1RM (One Rep Max)'}
          </span>
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight drop-shadow-xs">
            {result.average} <span className="text-lg font-bold">kg</span>
          </div>
          <p className="text-[11px] font-medium text-white/90">
            {lang === 'en' ? `Heaviest load capacity for exactly 1 full repetition based on ${weight} kg × ${reps} reps test.` : `Kapasitas beban terberat untuk tepat 1 repetisi penuh berdasarkan tes ${weight} kg × ${reps} reps.`}
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
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">{f.name}</span>
                <strong className="text-sm font-mono font-black text-[#E63946] dark:text-red-400 block my-0.5">{f.val} kg</strong>
                <code className="text-[9px] text-slate-500 dark:text-slate-400 font-mono block bg-slate-200/60 dark:bg-slate-700/60 px-1 py-0.5 rounded text-center truncate">
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
