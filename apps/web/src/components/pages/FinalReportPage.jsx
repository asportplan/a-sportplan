import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useLanguage } from '../../hooks/useLanguage.js';
import { 
  getGeneratedProgram, 
  getWorkoutResults, 
  getWeeklyBodyWeights
} from '../../core/db/user-store.js';
import { generateFinalAnalysis } from '../../core/engine/analysis-engine.js';
import AiReportPanel from '../ai/AiReportPanel.jsx';

// Charts pull in recharts; load them only when the report is opened
const ProgressCharts = lazy(() => import('./ProgressCharts.jsx'));

const FinalReportPage = ({ onNavigate, programOverride, onProgramUpdated }) => {
  const { lang } = useLanguage();
  const [report, setReport] = useState(null);
  const [program, setProgram] = useState(null);

  useEffect(() => {
    const prog = programOverride || getGeneratedProgram();
    setProgram(prog);

    if (prog) {
      const progId = prog.id || prog.program_id || 'default_program';
      const results = getWorkoutResults(progId);
      const bodyWeights = getWeeklyBodyWeights(progId);

      const analysis = generateFinalAnalysis(prog, results, bodyWeights);
      setReport(analysis);
    }
  }, [programOverride]);

  if (!program) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 text-center border border-[#EBE5E2] dark:border-slate-800 max-w-xl mx-auto space-y-4 shadow-sm my-8">
        <span className="material-symbols-outlined text-5xl text-[#E63946]">error_outline</span>
        <h3 className="text-xl font-black text-[#2B2B2B] dark:text-white">
          {lang === 'en' ? 'No Program Found' : 'Program Tidak Ditemukan'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {lang === 'en'
            ? 'Generate a program and input your workout results to view the final report.'
            : 'Silakan generate program dan input hasil latihan untuk melihat laporan akhir.'}
        </p>
        <button
          onClick={() => onNavigate ? onNavigate('wizard') : (window.location.hash = '#/wizard')}
          className="px-6 py-3 bg-[#E63946] text-white font-extrabold text-xs rounded-xl shadow-md hover:bg-red-700 transition-all cursor-pointer"
        >
          {lang === 'en' ? 'Go to Generator' : 'Buka Generator'}
        </button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-8 text-center text-slate-400 font-bold">
        {lang === 'en' ? 'Loading analysis report...' : 'Memuat laporan analisis...'}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 font-sans w-full max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm border border-[#EBE5E2] dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
            <span className="material-symbols-outlined text-2xl">pie_chart</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#2B2B2B] dark:text-white tracking-tight">
              {lang === 'en' ? 'Final Training Program Report' : 'Laporan Akhir Program Latihan'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
              {lang === 'en' 
                ? 'Evaluation of actual training compliance, total volume lifted, RPE trends, and strength progression.'
                : 'Evaluasi kepatuhan aktual, total volume angkatan, tren RPE, dan progres kekuatan.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate ? onNavigate('program') : (window.location.hash = '#/program')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>{lang === 'en' ? 'Back to Program' : 'Kembali ke Program'}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate ? onNavigate('log_results') : (window.location.hash = '#/log-results')}
            className="px-3.5 py-2 bg-[#E63946] hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-base">edit_document</span>
            <span>{lang === 'en' ? 'Edit Results' : 'Edit Input Hasil'}</span>
          </button>

        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Compliance Rate Card */}
        <div className="bg-[#FAF8F7] dark:bg-slate-800/60 border border-[#EBE5E2] dark:border-slate-800 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
              {lang === 'en' ? 'Compliance Rate' : 'Kepatuhan Program'}
            </span>
            <span className="material-symbols-outlined text-emerald-600 text-xl">fact_check</span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#2B2B2B] dark:text-white">
              {report.compliance.rate}%
            </div>
            <div className="text-[11px] font-bold text-slate-400 mt-0.5">
              {report.compliance.completed} / {report.compliance.total} {lang === 'en' ? 'Sessions Completed' : 'Sesi Selesai'}
            </div>
          </div>
        </div>

        {/* Actual Volume Card */}
        <div className="bg-[#FAF8F7] dark:bg-slate-800/60 border border-[#EBE5E2] dark:border-slate-800 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
              {lang === 'en' ? 'Actual Volume' : 'Volume Aktual'}
            </span>
            <span className="material-symbols-outlined text-blue-600 text-xl">fitness_center</span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
              {report.volume.actual.toLocaleString()} <span className="text-sm font-bold text-slate-400">kg</span>
            </div>
            <div className="text-[11px] font-bold text-slate-400 mt-0.5">
              Target: {report.volume.prescribed.toLocaleString()} kg
            </div>
          </div>
        </div>

        {/* Average RPE Card */}
        <div className="bg-[#FAF8F7] dark:bg-slate-800/60 border border-[#EBE5E2] dark:border-slate-800 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
              {lang === 'en' ? 'Average RPE' : 'Rata-Rata RPE'}
            </span>
            <span className="material-symbols-outlined text-amber-500 text-xl">monitor_heart</span>
          </div>
          <div>
            {(() => {
              const valid = report.rpeTrends.filter(t => t.averageRPE > 0);
              const avg = valid.length > 0 
                ? (valid.reduce((acc, c) => acc + c.averageRPE, 0) / valid.length).toFixed(1) 
                : '—';
              return (
                <>
                  <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                    {avg} <span className="text-sm font-bold text-slate-400">/ 10</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-400 mt-0.5">
                    {lang === 'en' ? 'Target: RPE 7.5 - 8.5' : 'Target: RPE 7.5 - 8.5'}
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Body Weight Change Card */}
        <div className="bg-[#FAF8F7] dark:bg-slate-800/60 border border-[#EBE5E2] dark:border-slate-800 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
              {lang === 'en' ? 'Body Weight Delta' : 'Perubahan BB'}
            </span>
            <span className="material-symbols-outlined text-purple-600 text-xl">scale</span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
              {report.bodyWeight.change > 0 ? `+${report.bodyWeight.change}` : report.bodyWeight.change} <span className="text-sm font-bold text-slate-400">kg</span>
            </div>
            <div className="text-[11px] font-bold text-slate-400 mt-0.5">
              {report.bodyWeight.data.length} {lang === 'en' ? 'Weeks Tracked' : 'Minggu Tercatat'}
            </div>
          </div>
        </div>

      </div>

      {/* Actionable Recommendations & Coach Insights */}
      {report.recommendations && report.recommendations.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 p-5 sm:p-7 rounded-2xl border border-amber-200 dark:border-amber-800/40 space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-600 text-xl">psychology</span>
            <h2 className="text-sm sm:text-base font-black text-amber-900 dark:text-amber-200 uppercase tracking-tight">
              {lang === 'en' ? 'Coach Recommendations & Analysis' : 'Rekomendasi & Kesimpulan Pelatih'}
            </h2>
          </div>
          <div className="space-y-2">
            {report.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-amber-900/90 dark:text-amber-100 font-semibold">
                <span className="text-amber-600 font-black">•</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <AiReportPanel program={program} report={report} lang={lang} onProgramUpdated={onProgramUpdated} />

      {/* Progress charts (tables below remain the accessible data view) */}
      <Suspense fallback={<p className="text-sm text-slate-500 p-4">{lang === 'en' ? 'Loading charts...' : 'Memuat grafik...'}</p>}>
        <ProgressCharts report={report} lang={lang} />
      </Suspense>

      {/* Strength Progression (1RM) Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-7 border border-[#EBE5E2] dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-[#2B2B2B] dark:text-white uppercase tracking-tight">
            {lang === 'en' ? 'Estimated 1RM Strength Progression' : 'Progresi Estimasi Kekuatan (1RM)'}
          </h2>
          <span className="text-xs font-bold text-emerald-600">Formula Epley</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
          <table className="w-full text-left border-collapse min-w-[600px] text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <th className="p-3">{lang === 'en' ? 'Exercise' : 'Nama Gerakan'}</th>
                {report.rpeTrends.map(t => (
                  <th key={t.week} className="p-3 text-center w-20">W{t.week}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {Object.keys(report.strengthProgression).length === 0 ? (
                <tr>
                  <td colSpan={report.rpeTrends.length + 1} className="py-6 text-center text-slate-400 font-medium">
                    {lang === 'en' ? 'No strength results logged yet.' : 'Belum ada data latihan yang diinput.'}
                  </td>
                </tr>
              ) : (
                Object.entries(report.strengthProgression).map(([exName, weekMap], idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-[#2B2B2B] dark:text-white capitalize">{exName}</td>
                    {report.rpeTrends.map(t => {
                      const val = weekMap[t.week];
                      return (
                        <td key={t.week} className="p-3 text-center font-mono font-black text-emerald-600 dark:text-emerald-400">
                          {val ? `${val.toFixed(1)} kg` : '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RPE Trends Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-7 border border-[#EBE5E2] dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-black text-[#2B2B2B] dark:text-white uppercase tracking-tight">
          {lang === 'en' ? 'Weekly Average RPE Distribution' : 'Distribusi Rata-Rata RPE Mingguan'}
        </h2>

        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
          <table className="w-full text-left border-collapse min-w-[500px] text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <th className="p-3 text-center w-24">{lang === 'en' ? 'Week' : 'Minggu'}</th>
                <th className="p-3 text-center w-36">{lang === 'en' ? 'Average RPE' : 'Rata-Rata RPE'}</th>
                <th className="p-3">{lang === 'en' ? 'Intensity Interpretation' : 'Status Intensitas'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {report.rpeTrends.map((t, idx) => {
                let statusLabel = '—';
                let statusColor = 'text-slate-400';
                if (t.averageRPE >= 9) {
                  statusLabel = lang === 'en' ? 'Very High (Near Failure)' : 'Sangat Tinggi (Mendekati Failure)';
                  statusColor = 'text-red-600 font-black';
                } else if (t.averageRPE >= 7.5) {
                  statusLabel = lang === 'en' ? 'Optimal (Hypertrophy / Strength)' : 'Optimal (Hipertrofi / Kekuatan)';
                  statusColor = 'text-emerald-600 font-bold';
                } else if (t.averageRPE > 0) {
                  statusLabel = lang === 'en' ? 'Light / Recovery' : 'Ringan / Fase Adaptasi';
                  statusColor = 'text-blue-600 font-bold';
                }

                return (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 text-center font-bold text-slate-600 dark:text-slate-300">Minggu {t.week}</td>
                    <td className="p-3 text-center font-mono font-black text-amber-600 text-sm">
                      {t.averageRPE > 0 ? t.averageRPE.toFixed(1) : '—'}
                    </td>
                    <td className={`p-3 text-xs ${statusColor}`}>
                      {statusLabel}
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

export default FinalReportPage;
