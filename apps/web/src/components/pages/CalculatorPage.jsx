import React, { useState } from 'react';
import { calculate1RM } from '../../core/utils/one-rm-calculator.js';
import { useLanguage } from '../../hooks/useLanguage.js';

const CalculatorPage = ({ onStartWizard }) => {
  const { lang } = useLanguage();
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('8');
  const [exerciseName, setExerciseName] = useState('');

  const result = calculate1RM(weight, reps);
  const oneRmAvg = result.average || 0;

  // Calculate percentage weight breakdown based on calculated 1RM
  const percentagesID = [
    { pct: 100, reps: '1 Rep', goal: 'Kekuatan Maksimal (1RM Peak)', rpe: '10' },
    { pct: 95, reps: '2 Reps', goal: 'Kekuatan Sangat Berat', rpe: '9.5 - 10' },
    { pct: 90, reps: '3 - 4 Reps', goal: 'Kekuatan Majemuk (Heavy Strength)', rpe: '9' },
    { pct: 85, reps: '5 - 6 Reps', goal: 'Hipertrofi Berat / Kekuatan', rpe: '8.5 - 9' },
    { pct: 80, reps: '7 - 8 Reps', goal: 'Hipertrofi Optimal (Muscle Mass)', rpe: '8' },
    { pct: 75, reps: '9 - 10 Reps', goal: 'Hipertrofi Sedang & Volume', rpe: '7.5 - 8' },
    { pct: 70, reps: '11 - 12 Reps', goal: 'Hipertrofi / Daya Tahan Otot', rpe: '7' },
    { pct: 65, reps: '13 - 15 Reps', goal: 'Daya Tahan Otot (Endurance)', rpe: '6.5 - 7' },
    { pct: 60, reps: '16 - 20 Reps', goal: 'Vaskularisasi & Kapasitas Laktat', rpe: '6' },
    { pct: 50, reps: '20+ Reps', goal: 'Adaptasi Anatomi & Pemulihan', rpe: '5' },
  ];

  const percentagesEN = [
    { pct: 100, reps: '1 Rep', goal: 'Maximum Strength (1RM Peak)', rpe: '10' },
    { pct: 95, reps: '2 Reps', goal: 'Heavy Strength Capacity', rpe: '9.5 - 10' },
    { pct: 90, reps: '3 - 4 Reps', goal: 'Compound Strength', rpe: '9' },
    { pct: 85, reps: '5 - 6 Reps', goal: 'Heavy Hypertrophy / Strength', rpe: '8.5 - 9' },
    { pct: 80, reps: '7 - 8 Reps', goal: 'Optimal Muscle Mass Hypertrophy', rpe: '8' },
    { pct: 75, reps: '9 - 10 Reps', goal: 'Moderate Hypertrophy & Volume', rpe: '7.5 - 8' },
    { pct: 70, reps: '11 - 12 Reps', goal: 'Hypertrophy / Muscular Endurance', rpe: '7' },
    { pct: 65, reps: '13 - 15 Reps', goal: 'Muscular Endurance', rpe: '6.5 - 7' },
    { pct: 60, reps: '16 - 20 Reps', goal: 'Vascularity & Lactate Threshold', rpe: '6' },
    { pct: 50, reps: '20+ Reps', goal: 'Anatomical Adaptation & Recovery', rpe: '5' },
  ];

  const percentages = lang === 'en' ? percentagesEN : percentagesID;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 font-sans" style={{ width: '100%' }}>
      
      {/* Page Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-[#EBE5E2] dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E63946] text-white font-extrabold flex items-center justify-center text-2xl shadow-md shadow-red-500/20 shrink-0">
            <span className="material-symbols-outlined text-2xl">calculate</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#2B2B2B] dark:text-white tracking-tight">
              {lang === 'en' ? '1RM Calculator & Load Breakdown' : 'Kalkulator 1RM & Matriks Beban Latihan'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium mt-1">
              {lang === 'en' 
                ? 'Calculate your 1RM (One Rep Max) precisely using 4 validated sports science formulas (Epley, Brzycki, Lander, Lombardi).'
                : 'Hitung batas kemampuan 1RM (One Rep Max) Anda secara presisi dengan 4 rumus sains fisiologi terverifikasi (Epley, Brzycki, Lander, Lombardi).'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Calculator Widget Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-[#EBE5E2] dark:border-slate-800 shadow-sm space-y-6">
        
        <div className="flex items-center justify-between border-b border-[#EBE5E2] dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-xs font-black text-[#E63946] dark:text-red-400 uppercase tracking-wider">
            <span className="material-symbols-outlined text-base">tune</span>
            <span>{lang === 'en' ? 'Load Test Input Parameters' : 'Parameter Input Tes Beban'}</span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">{lang === 'en' ? 'Sports Science Standard' : 'Standar Fisiologi Olahraga'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          
          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-800 dark:text-white block">
              {lang === 'en' ? 'Exercise / Equipment (Optional):' : 'Nama Alat / Latihan (Opsional):'}
            </label>
            <input
              type="text"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E63946]"
              placeholder={lang === 'en' ? 'e.g. Bench Press' : 'Misal Bench Press'}
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-800 dark:text-white block">
              {lang === 'en' ? 'Lifted Weight During Test (kg):' : 'Beban Terangkat Saat Tes (kg):'}
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-base font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E63946]"
              placeholder={lang === 'en' ? 'e.g. 60' : 'Misal: 60'}
              min="0"
              max="500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-800 dark:text-white block">
              {lang === 'en' ? 'Max Repetitions Performed (Reps):' : 'Jumlah Repetisi Maksimal (Reps):'}
            </label>
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-base font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E63946]"
              placeholder="8"
              min="1"
              max="30"
            />
          </div>

        </div>

        {/* Highlight Result Card */}
        <div 
          className="bg-gradient-to-r from-red-600 to-orange-500 rounded-3xl p-6 sm:p-8 text-white text-center space-y-3 shadow-xl shadow-red-500/20"
          style={{ width: '100%', boxSizing: 'border-box', alignSelf: 'stretch' }}
        >
          <span 
            className="text-xs font-black text-white/90 uppercase tracking-widest block"
            style={{ width: '100%', display: 'block' }}
          >
            {lang === 'en' ? 'ESTIMATED 1RM (ONE REP MAX)' : 'ESTIMASI 1RM (ONE REP MAX)'} {exerciseName ? `— ${exerciseName.toUpperCase()}` : ''}
          </span>
          <div 
            className="text-4xl sm:text-5xl font-black font-mono tracking-tight drop-shadow-md"
            style={{ width: '100%', display: 'block' }}
          >
            {oneRmAvg} <span className="text-2xl font-bold">kg</span>
          </div>
          <p 
            className="text-xs sm:text-sm font-medium text-white/90 leading-relaxed block"
            style={{ width: '100%', maxWidth: '560px', margin: '0 auto', display: 'block', boxSizing: 'border-box' }}
          >
            {lang === 'en' 
              ? <>Based on lifting <strong>{weight || 0} kg × {reps || 0} reps</strong>, your theoretical maximum capacity for 1 rep is <strong>{oneRmAvg} kg</strong>.</>
              : <>Berdasarkan pengujian beban <strong>{weight || 0} kg × {reps || 0} reps</strong>, kapasitas maksimal teoritis Anda untuk 1 repetisi adalah <strong>{oneRmAvg} kg</strong>.</>
            }
          </p>

          <div 
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/20 text-xs font-mono"
            style={{ width: '100%', boxSizing: 'border-box' }}
          >
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-xs text-left border border-white/15 space-y-1">
              <span className="text-[10px] text-white/70 block uppercase font-bold tracking-wider">Epley Formula</span>
              <strong className="text-base font-black text-white block">{result.epley} kg</strong>
              <code className="text-[10px] text-white/90 font-mono block bg-black/25 px-1.5 py-0.5 rounded-md w-fit">W × (1 + R/30)</code>
              <span className="text-[9.5px] text-white/75 block font-sans">
                {lang === 'en' ? 'Linear • Ideal 6–10 reps' : 'Linier • Ideal 6–10 reps'}
              </span>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-xs text-left border border-white/15 space-y-1">
              <span className="text-[10px] text-white/70 block uppercase font-bold tracking-wider">Brzycki Formula</span>
              <strong className="text-base font-black text-white block">{result.brzycki} kg</strong>
              <code className="text-[10px] text-white/90 font-mono block bg-black/25 px-1.5 py-0.5 rounded-md w-fit">W × 36 / (37 - R)</code>
              <span className="text-[9.5px] text-white/75 block font-sans">
                {lang === 'en' ? 'Conservative • Ideal 1–10 reps' : 'Konservatif • Ideal 1–10 reps'}
              </span>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-xs text-left border border-white/15 space-y-1">
              <span className="text-[10px] text-white/70 block uppercase font-bold tracking-wider">Lander Formula</span>
              <strong className="text-base font-black text-white block">{result.lander} kg</strong>
              <code className="text-[10px] text-white/90 font-mono block bg-black/25 px-1.5 py-0.5 rounded-md w-fit">100W / (101.3 - 2.67R)</code>
              <span className="text-[9.5px] text-white/75 block font-sans">
                {lang === 'en' ? 'Fatigue Curve • Ideal 2–8 reps' : 'Kurva Lelah • Ideal 2–8 reps'}
              </span>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-xs text-left border border-white/15 space-y-1">
              <span className="text-[10px] text-white/70 block uppercase font-bold tracking-wider">Lombardi Formula</span>
              <strong className="text-base font-black text-white block">{result.lombardi} kg</strong>
              <code className="text-[10px] text-white/90 font-mono block bg-black/25 px-1.5 py-0.5 rounded-md w-fit">W × R^0.10</code>
              <span className="text-[9.5px] text-white/75 block font-sans">
                {lang === 'en' ? 'Exponential • Ideal 4–12 reps' : 'Eksponensial • Ideal 4–12 reps'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* SCIENTIFIC FORMULA BREAKDOWN SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-[#EBE5E2] dark:border-slate-800 space-y-5 shadow-xs">
        <div className="flex items-center gap-3 border-b border-[#EBE5E2] dark:border-slate-800 pb-4">
          <span className="material-symbols-outlined text-2xl text-[#E63946]">functions</span>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {lang === 'en' ? 'Physiological Basis & Math Breakdown of 1RM Formulas' : 'Dasar Perhitungan & Fisiologi Olahraga Tiap Formula'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {lang === 'en'
                ? 'Understanding the mathematical assumptions and ideal application for each scientific method.'
                : 'Metodologi matematik, asumsi fisiologis, dan rentang penggunaan terbaik untuk setiap rumus.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Epley */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-[#E63946] dark:text-red-400 flex items-center gap-1.5">
                <span>Epley Formula (1985)</span>
              </h4>
              <span className="px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-mono text-[10px] font-bold">
                1RM = W × (1 + R/30)
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {lang === 'en'
                ? 'Designed by Boyd Epley. Assumes a linear strength reduction of ~3.33% per rep. Highly accurate and widely used for moderate rep ranges (6–10 reps).'
                : 'Dikembangkan oleh Boyd Epley. Mengasumsikan penurunan kekuatan linier ~3,33% per repetisi. Sangat akurat dan paling populer untuk rentang 6–10 repetisi.'}
            </p>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 font-mono">
              💡 <strong>{lang === 'en' ? 'Application:' : 'Karakteristik:'}</strong> {lang === 'en' ? 'Best for Bench Press & Barbell Lifts (6-10 reps)' : 'Paling sesuai untuk angkatan linier menengah (6-10 reps)'}
            </div>
          </div>

          {/* Brzycki */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-[#E63946] dark:text-red-400 flex items-center gap-1.5">
                <span>Brzycki Formula (1993)</span>
              </h4>
              <span className="px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 font-mono text-[10px] font-bold">
                1RM = W / ((37 - R)/36)
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {lang === 'en'
                ? 'Created by Matt Brzycki. Gold standard for low rep ranges (1–10 reps). Slightly more conservative at high reps to prevent overestimating capacity.'
                : 'Dikembangkan oleh Matt Brzycki. Standar emas fisiologi olahraga untuk repetisi rendah (1–10 reps). Cenderung lebih konservatif pada reps tinggi agar tidak overestimasi.'}
            </p>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 font-mono">
              💡 <strong>{lang === 'en' ? 'Application:' : 'Karakteristik:'}</strong> {lang === 'en' ? 'Gold standard for low reps (1-10 reps)' : 'Standar emas untuk beban berat repetisi rendah (1-10 reps)'}
            </div>
          </div>

          {/* Lander */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-[#E63946] dark:text-red-400 flex items-center gap-1.5">
                <span>Lander Formula (1985)</span>
              </h4>
              <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold">
                1RM = 100W / (101.3 - 2.67R)
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {lang === 'en'
                ? 'Formulated by J. Lander based on empirical fatigue curves. Very consistent for heavy compound movements like Squats & Deadlifts in 2–8 rep range.'
                : 'Dibuat oleh J. Lander berdasarkan kurva kelelahan empiris. Sangat konsisten untuk angkatan compound berat (Squat & Deadlift) pada rentang 2–8 repetisi.'}
            </p>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 font-mono">
              💡 <strong>{lang === 'en' ? 'Application:' : 'Karakteristik:'}</strong> {lang === 'en' ? 'Ideal for heavy compound lifts (2-8 reps)' : 'Sangat baik untuk gerakan compound berat (2-8 reps)'}
            </div>
          </div>

          {/* Lombardi */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-[#E63946] dark:text-red-400 flex items-center gap-1.5">
                <span>Lombardi Formula (1989)</span>
              </h4>
              <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono text-[10px] font-bold">
                1RM = W × R^0.10
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {lang === 'en'
                ? 'Developed by V. Lombardi using exponential power functions (R^0.10). Excellent for estimating strength endurance capacity across 4–12 reps.'
                : 'Dikembangkan oleh V. Lombardi menggunakan fungsi eksponensial (R^0.10). Sangat halus untuk mengukur ketahanan kekuatan (strength endurance) pada 4–12 reps.'}
            </p>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 font-mono">
              💡 <strong>{lang === 'en' ? 'Application:' : 'Karakteristik:'}</strong> {lang === 'en' ? 'Best for strength endurance (4-12 reps)' : 'Cocok untuk daya tahan kekuatan (4-12 reps)'}
            </div>
          </div>
        </div>
      </div>

      {/* Break Down Percentages Table Based on Calculated 1RM */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-[#EBE5E2] dark:border-slate-800 space-y-5 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#EBE5E2] dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#E63946]">table_chart</span>
              {lang === 'en' ? 'Percentage Load Prescription Matrix (% 1RM)' : 'Matriks Beban Preskripsi Persentase (% 1RM)'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {lang === 'en' 
                ? `Recommended working load targets (kg) for each percentage zone based on your 1RM of ${oneRmAvg} kg.`
                : `Target beban kerja (kg) yang disarankan untuk setiap zona persentase berdasarkan 1RM ${oneRmAvg} kg Anda.`
              }
            </p>
          </div>

          {onStartWizard && (
            <button
              onClick={onStartWizard}
              className="px-5 py-2.5 bg-[#E63946] hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-red-500/20 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shrink-0"
            >
              <span className="material-symbols-outlined text-base">auto_awesome</span>
              <span>{lang === 'en' ? 'Create Workout Plan Now' : 'Buat Program Latihan Sekarang'}</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-extrabold">
                <th className="p-3.5">{lang === 'en' ? 'Percentage (% 1RM)' : 'Persentase (% 1RM)'}</th>
                <th className="p-3.5 font-mono text-center">{lang === 'en' ? 'Working Weight (kg)' : 'Beban Kerja (kg)'}</th>
                <th className="p-3.5 text-center">{lang === 'en' ? 'Target Rep Range' : 'Rentang Repetisi Target'}</th>
                <th className="p-3.5">{lang === 'en' ? 'Primary Target Goal' : 'Target Fisiologis Utama'}</th>
                <th className="p-3.5 text-center font-mono">{lang === 'en' ? 'Est. RPE' : 'Perkiraan RPE'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              {percentages.map((row) => {
                const targetKg = Math.round((oneRmAvg * row.pct) / 100);
                const isHypertrophy = row.pct >= 75 && row.pct <= 85;
                const isStrength = row.pct > 85;

                return (
                  <tr 
                    key={row.pct}
                    className={`transition-colors ${
                      isHypertrophy 
                        ? 'bg-red-50/50 dark:bg-red-950/20 font-bold' 
                        : isStrength
                        ? 'bg-orange-50/40 dark:bg-orange-950/20'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="p-3.5 font-extrabold">
                      <span className="font-mono text-sm text-[#E63946] dark:text-red-400">{row.pct}%</span>
                      {isHypertrophy && (
                        <span className="ml-2 px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-900/60 text-[10px] text-red-800 dark:text-red-300 font-extrabold uppercase">
                          {lang === 'en' ? 'Optimal Zone' : 'Zona Optimal'}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono font-black text-center text-sm text-slate-900 dark:text-white">
                      {targetKg} kg
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold">
                      {row.reps}
                    </td>
                    <td className="p-3.5">
                      {row.goal}
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-slate-500">
                      RPE {row.rpe}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default CalculatorPage;
