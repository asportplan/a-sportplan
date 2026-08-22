import React from 'react';
import { getGeneratedProgram, getUserProfile } from '../../core/db/user-store.js';
import { useLanguage } from '../../hooks/useLanguage.js';

const AnalyticsPage = () => {
  const { lang } = useLanguage();
  const programData = getGeneratedProgram();
  const profile = getUserProfile();

  if (!programData || !programData.weeks) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800 max-w-xl mx-auto space-y-4 font-sans">
        <span className="material-symbols-outlined text-4xl text-[#E63946]">analytics</span>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {lang === 'en' ? 'No Program Analytics Available' : 'Belum Ada Grafik Analitik'}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
          {lang === 'en' 
            ? 'Generate a workout program first to view volume charts and 1RM progress projections.' 
            : 'Buat program latihan terlebih dahulu untuk melihat grafik volume dan proyeksi beban 1RM.'}
        </p>
      </div>
    );
  }

  const { weeks, metadata, progression_summary } = programData;
  const maxVolume = Math.max(...weeks.map(w => w.total_week_volume_kg || 1));

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-[#EBE5E2] dark:border-slate-800 space-y-2">
        <h2 className="text-xl font-bold text-[#2B2B2B] dark:text-white">
          {lang === 'en' ? 'Program Analytics & 1RM Projection' : 'Analitik Program & Proyeksi 1RM'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {lang === 'en' ? 'Visual graph of total weekly volume (kg) and progression overload/recovery cycles.' : 'Grafik visual estimasi total volume mingguan (kg) dan siklus pemulihan.'}
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
            {lang === 'en' ? 'Total Program Duration' : 'Total Durasi Program'}
          </span>
          <h4 className="text-2xl font-black text-[#2B2B2B] dark:text-white font-mono">
            {metadata?.duration_weeks || 8} {lang === 'en' ? 'Weeks' : 'Minggu'}
          </h4>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
            {lang === 'en' ? 'Target 1RM Increase' : 'Target Kenaikan 1RM'}
          </span>
          <h4 className="text-2xl font-black text-[#E63946] dark:text-red-400 font-mono">
            +{metadata?.target_1rm_increase_pct || 10}%
          </h4>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
            {lang === 'en' ? 'Periodization Strategy' : 'Strategi Periodisasi'}
          </span>
          <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {programData.periodization?.strategy || 'SEQUENTIAL'}
          </h4>
        </div>
      </div>

      {/* Weekly Volume Chart (CSS Bar Chart) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-[#EBE5E2] dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
          {lang === 'en' ? 'Estimated Weekly Training Volume (kg)' : 'Estimasi Volume Latihan Mingguan (kg)'}
        </h3>
        
        <div className="h-64 flex items-end gap-2 pt-6 pb-2 border-b border-slate-200 dark:border-slate-700 px-2">
          {weeks.map(w => {
            const vol = w.total_week_volume_kg || 0;
            const heightPct = Math.max(10, Math.round((vol / (maxVolume || 1)) * 100));
            const barColor = w.is_deload ? 'bg-amber-500' : 'bg-[#E63946]';

            return (
              <div key={w.week_number} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                <span className="text-[10px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  {vol} kg
                </span>
                <div 
                  className={`w-full rounded-t-lg transition-all duration-300 ${barColor} hover:brightness-110`}
                  style={{ height: `${heightPct}%` }}
                  title={`${lang === 'en' ? 'Week' : 'Minggu'} ${w.week_number}: ${vol} kg (${w.phase_name})`}
                />
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 font-mono">
                  {lang === 'en' ? 'W' : 'M'}{w.week_number}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#E63946]"></span>
              <span>{lang === 'en' ? 'Overload / Normal Week' : 'Minggu Latihan Normal'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span>{lang === 'en' ? 'Deload Recovery Week' : 'Minggu Pemulihan (Deload)'}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
