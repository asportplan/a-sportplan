import React, { useState, useEffect } from 'react';
import { getScreeningResults, saveScreeningResults } from '../../core/db/user-store.js';
import { processScreeningResults } from '../../core/engine/medical-triage.js';
import { useLanguage } from '../../hooks/useLanguage.js';

const ScreeningPage = () => {
  const { lang } = useLanguage();
  const [screening, setScreening] = useState({
    has_heart_condition: false,
    has_asthma: false,
    has_chest_pain: false,
    has_injury: false,
    injury_area: null,
    takes_medication: false,
  });

  useEffect(() => {
    const saved = getScreeningResults();
    if (saved) setScreening(saved);
  }, []);

  const handleChange = (e) => {
    const { name, checked } = e.target;
    const updated = { ...screening, [name]: checked };
    setScreening(updated);
    saveScreeningResults(updated);
  };

  const handleInjuryArea = (area) => {
    const updated = { ...screening, injury_area: area };
    setScreening(updated);
    saveScreeningResults(updated);
  };

  const handleInjuryCondition = (condition) => {
    const updated = { ...screening, injury_condition: condition || null };
    setScreening(updated);
    saveScreeningResults(updated);
  };

  const triage = processScreeningResults({
    q1_heart: screening.has_heart_condition,
    q2_asthma: screening.has_asthma,
    q3_chest_pain: screening.has_chest_pain,
    q4_injury: screening.has_injury,
    q4_injury_area: screening.injury_area,
    q4_injury_condition: screening.injury_condition,
    q5_medication: screening.takes_medication,
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto font-sans">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-[#EBE5E2] dark:border-slate-800 space-y-2">
        <h2 className="text-xl font-bold text-[#2B2B2B] dark:text-white">
          {lang === 'en' ? 'Medical Safety & Health Clearance Center' : 'Pusat Keamanan & Skrining Kesehatan'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {lang === 'en' ? 'Automatic load cap system to protect your heart, lungs, and joints.' : 'Sistem pembatasan beban otomatis untuk mencegah kelelahan dan cedera.'}
        </p>
      </div>

      {/* Safety Triage Banner */}
      <div className={`p-6 rounded-2xl border space-y-3 ${
        triage.status === 'CLEAR' 
          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-300' 
          : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-900 dark:text-amber-300'
      }`}>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-2xl">
            {triage.status === 'CLEAR' ? 'check_circle' : 'shield_with_heart'}
          </span>
          <div className="font-extrabold text-base">
            {triage.status === 'CLEAR' 
              ? (lang === 'en' ? 'Clearance: 100% Full Intensity & Load' : 'Status: Tubuh Sehat & Fit (Akses 100% Beban)') 
              : (lang === 'en' ? 'Safety Adjustments Active' : 'Status: Penyesuaian Kesehatan Aktif')
            }
          </div>
        </div>

        {triage.modifications && triage.modifications.length > 0 && (
          <div className="pt-2 border-t border-current/20 space-y-1 text-xs font-medium">
            {triage.modifications.map((m, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span>•</span>
                <span>{m}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Questionnaire List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-[#EBE5E2] dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          {lang === 'en' ? 'Medical Safety Questionnaire Checklist' : 'Kuesioner Keamanan Medis'}
        </h3>

        {[
          { key: 'has_heart_condition', label: lang === 'en' ? 'Heart Condition / High Blood Pressure' : 'Pernah didiagnosis penyakit jantung atau hipertensi berat' },
          { key: 'has_chest_pain', label: lang === 'en' ? 'Chest Pain During Heavy Lifting' : 'Merasakan nyeri dada saat latihan beban berat' },
          { key: 'has_asthma', label: lang === 'en' ? 'Active Asthma (Adds +50% Rest Between Sets)' : 'Memiliki asma aktif (Istirahat antar-set ditambah +50%)' },
          { key: 'has_injury', label: lang === 'en' ? 'Active Muscle or Joint Injury' : 'Sedang mengalami cedera otot atau sendi aktif' },
          { key: 'takes_medication', label: lang === 'en' ? 'Taking Prescription Heart Rate Medication' : 'Mengonsumsi obat resep pembatas denyut jantung' },
        ].map((item) => (
          <label key={item.key} className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              name={item.key}
              checked={screening[item.key] || false}
              onChange={handleChange}
              className="mt-0.5 w-4 h-4 text-[#E63946] rounded focus:ring-[#E63946] cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.label}</span>
          </label>
        ))}

        {screening.has_injury && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              {lang === 'en' ? 'Select Active Injury Area:' : 'Pilih Area Cedera Aktif:'}
            </label>
            <div className="flex flex-wrap gap-2">
              {['Upper', 'Lower', 'Core'].map(area => (
                <button
                  key={area}
                  type="button"
                  onClick={() => handleInjuryArea(area)}
                  className={`min-h-11 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    screening.injury_area === area
                      ? 'bg-[#E63946] text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {area === 'Upper' ? (lang === 'en' ? 'Upper Body' : 'Tubuh Atas') : area === 'Lower' ? (lang === 'en' ? 'Lower Body' : 'Tubuh Bawah') : (lang === 'en' ? 'Core & Spine' : 'Inti & Pinggang')}
                </button>
              ))}
            </div>
            <label htmlFor="injury-condition" className="text-xs font-bold text-slate-700 dark:text-slate-300 block pt-2">
              {lang === 'en' ? 'Specific condition (optional):' : 'Kondisi spesifik (opsional):'}
            </label>
            <select
              id="injury-condition"
              value={screening.injury_condition || ''}
              onChange={(e) => handleInjuryCondition(e.target.value)}
              className="w-full sm:w-auto min-h-11 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#E63946]"
            >
              <option value="">{lang === 'en' ? 'Other / not sure' : 'Lainnya / tidak tahu'}</option>
              <option value="low_back_pain">{lang === 'en' ? 'Low-back pain' : 'Nyeri pinggang'}</option>
              <option value="shoulder_impingement">{lang === 'en' ? 'Shoulder impingement (pain lifting arm overhead)' : 'Impingement bahu (nyeri saat angkat tangan ke atas)'}</option>
              <option value="patellofemoral_knee_pain">{lang === 'en' ? 'Front-of-knee pain' : 'Nyeri lutut bagian depan'}</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreeningPage;
