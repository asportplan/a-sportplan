import React, { useState } from 'react';
import { saveUserProfile, getUserProfile, getScreeningResults, saveScreeningResults } from '../../core/db/user-store.js';
import { useLanguage } from '../../hooks/useLanguage.js';

const ProfileStep = ({ onNext }) => {
  const { lang } = useLanguage();
  const existingProfile = getUserProfile() || {};
  const savedScreening = getScreeningResults();

  const [profile, setProfile] = useState({
    athlete_name: '',
    sport_branch: '',
    age: existingProfile.age !== undefined && existingProfile.age !== null ? existingProfile.age : 25,
    body_weight_kg: existingProfile.body_weight_kg !== undefined && existingProfile.body_weight_kg !== null ? existingProfile.body_weight_kg : 70,
    height_cm: existingProfile.height_cm !== undefined && existingProfile.height_cm !== null ? existingProfile.height_cm : 170,
    ...existingProfile
  });

  // Screening questions start as null (unanswered) unless user already selected booleans
  const [screening, setScreening] = useState({
    has_heart_condition: savedScreening && typeof savedScreening.has_heart_condition === 'boolean' ? savedScreening.has_heart_condition : null,
    has_chest_pain: savedScreening && typeof savedScreening.has_chest_pain === 'boolean' ? savedScreening.has_chest_pain : null,
    has_asthma: savedScreening && typeof savedScreening.has_asthma === 'boolean' ? savedScreening.has_asthma : null,
    has_injury: savedScreening && typeof savedScreening.has_injury === 'boolean' ? savedScreening.has_injury : null,
    injury_area: savedScreening ? savedScreening.injury_area || 'Upper' : 'Upper',
    takes_medication: savedScreening && typeof savedScreening.takes_medication === 'boolean' ? savedScreening.takes_medication : null,
  });

  const [validationError, setValidationError] = useState(null);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // Auto-sync profile changes immediately
  React.useEffect(() => {
    saveUserProfile(profile);
  }, [profile]);

  const handleScreeningChange = (name, checked) => {
    const updated = { ...screening, [name]: checked };
    setScreening(updated);
    saveScreeningResults(updated);

    // If validation error was displayed, clear or update missing keys
    if (validationError && validationError.unansweredKeys) {
      const remaining = validationError.unansweredKeys.filter(k => k !== name);
      if (remaining.length === 0) {
        setValidationError(null);
      } else {
        setValidationError(prev => ({
          ...prev,
          unansweredKeys: remaining,
          message: lang === 'en'
            ? `Please answer all health screening questions (${remaining.length} remaining)!`
            : `Perhatian: Masih ada ${remaining.length} pertanyaan skrining kesehatan yang belum dipilih!`
        }));
      }
    }
  };

  const setAllHealthy = () => {
    const healthy = {
      has_heart_condition: false,
      has_asthma: false,
      has_chest_pain: false,
      has_injury: false,
      injury_area: null,
      takes_medication: false,
    };
    setScreening(healthy);
    saveScreeningResults(healthy);
    setValidationError(null);
  };

  const answeredCount = [
    screening.has_heart_condition,
    screening.has_chest_pain,
    screening.has_asthma,
    screening.has_injury,
    screening.takes_medication
  ].filter(v => typeof v === 'boolean').length;

  const isAllAnswered = answeredCount === 5;

  const isAllHealthy = isAllAnswered &&
                       !screening.has_heart_condition && 
                       !screening.has_asthma && 
                       !screening.has_chest_pain && 
                       !screening.has_injury && 
                       !screening.takes_medication;

  const handleNext = () => {
    const unanswered = questions.filter(q => typeof screening[q.name] !== 'boolean');
    if (unanswered.length > 0) {
      const count = unanswered.length;
      setValidationError({
        message: lang === 'en'
          ? `Please answer all health screening questions (${count} question${count > 1 ? 's' : ''} unselected) before proceeding to ensure workout safety!`
          : `Perhatian: Mohon jawab semua pertanyaan skrining kesehatan terlebih dahulu! Masih ada ${count} pertanyaan yang belum Anda pilih.`,
        unansweredKeys: unanswered.map(q => q.name)
      });

      const section = document.getElementById('medical-screening-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    saveUserProfile(profile);
    saveScreeningResults(screening);
    setValidationError(null);
    onNext();
  };

  // Listen to top navigation "next" attempt from WizardContainer
  React.useEffect(() => {
    const handleExternalValidate = () => {
      handleNext();
    };
    window.addEventListener('aps-validate-screening', handleExternalValidate);
    return () => window.removeEventListener('aps-validate-screening', handleExternalValidate);
  });

  const questionsID = [
    { 
      name: 'has_heart_condition', 
      title: 'Kondisi Jantung / Hipertensi Berat',
      desc: 'Pernah didiagnosis dokter memiliki penyakit jantung atau riwayat hipertensi?'
    },
    { 
      name: 'has_chest_pain', 
      title: 'Nyeri Dada Saat Olahraga',
      desc: 'Pernah merasakan nyeri atau sesak di dada saat mengangkat beban berat?'
    },
    { 
      name: 'has_asthma', 
      title: 'Asma / Gangguan Pernapasan',
      desc: 'Memiliki asma aktif? (Algoritma akan otomatis menambah jeda istirahat antar-set +50%)'
    },
    { 
      name: 'has_injury', 
      title: 'Cedera Otot / Sendi Aktif',
      desc: 'Sedang mengalami cedera yang belum pulih total pada bahu, lutut, atau punggung?'
    },
    { 
      name: 'takes_medication', 
      title: 'Konsumsi Obat Rutin',
      desc: 'Sedang mengonsumsi obat resep yang memicu penurunan/kenaikan denyut jantung?'
    },
  ];

  const questionsEN = [
    { 
      name: 'has_heart_condition', 
      title: 'Heart Condition / High Blood Pressure',
      desc: 'Have you ever been diagnosed with a heart condition or severe hypertension?'
    },
    { 
      name: 'has_chest_pain', 
      title: 'Chest Pain During Exercise',
      desc: 'Do you experience chest pain or tightness when performing resistance training?'
    },
    { 
      name: 'has_asthma', 
      title: 'Active Asthma / Breathing Issue',
      desc: 'Do you have active asthma? (Algorithm automatically adds +50% rest interval between sets)'
    },
    { 
      name: 'has_injury', 
      title: 'Active Muscle / Joint Injury',
      desc: 'Are you currently recovering from an active joint or muscle injury (shoulder, knee, spine)?'
    },
    { 
      name: 'takes_medication', 
      title: 'Routine Prescription Medication',
      desc: 'Are you currently taking prescription medications that alter heart rate response?'
    },
  ];

  const questions = lang === 'en' ? questionsEN : questionsID;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 font-sans" style={{ width: '100%' }}>
      
      {/* Step Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-[#EBE5E2] dark:border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 text-[#E63946] dark:text-red-400 font-bold flex items-center justify-center text-xl shrink-0">
            <span className="material-symbols-outlined">person</span>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#2B2B2B] dark:text-white tracking-tight">
              {lang === 'en' ? 'Step 1: Athlete Profile & Medical Safety Screening' : 'Langkah 1: Profil Atlet & Skrining Keamanan Medis'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium mt-0.5">
              {lang === 'en' ? 'Provide physical data and verify medical clearance before initiating program prescription.' : 'Isi data fisik dasar dan verifikasi keamanan medis sebelum memulai penyusunan program.'}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: DATA FISIK & BMI */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-[#EBE5E2] dark:border-slate-800 space-y-6">
        <h3 className="text-base font-black text-[#2B2B2B] dark:text-white flex items-center gap-2 border-b border-[#EBE5E2] dark:border-slate-800 pb-3">
          <span className="material-symbols-outlined text-[#E63946]">accessibility_new</span>
          {lang === 'en' ? '1. Athlete Identity & Physiological Biometrics' : '1. Identitas Atlet & Data Fisiologis Utama'}
        </h3>

        {/* Identity Inputs Grid (Optional for PDF Header) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pb-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#E63946]">badge</span>
              {lang === 'en' ? 'Athlete / User Name' : 'Nama Atlet / Pengguna'}
            </label>
            <input 
              type="text" 
              name="athlete_name" 
              value={profile.athlete_name || ''} 
              onChange={handleProfileChange}
              placeholder={lang === 'en' ? 'e.g., John Doe' : 'Misal: Budi Santoso'}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946] transition-all" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#E63946]">sports</span>
              {lang === 'en' ? 'Sport / Training Focus' : 'Fokus Fitness / Cabang Olahraga'}
            </label>
            <input 
              type="text" 
              name="sport_branch" 
              value={profile.sport_branch || ''} 
              onChange={handleProfileChange}
              placeholder={lang === 'en' ? 'e.g., General Fitness / Bodybuilding / Soccer' : 'Misal: Fitness Umum / Binaraga / Powerlifting / Sepak Bola'}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946] transition-all" 
            />
          </div>
        </div>

        {/* Biometrics Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {lang === 'en' ? 'Age (Years)' : 'Usia (Tahun)'}
            </label>
            <div className="relative">
              <input 
                type="number" 
                name="age" 
                value={profile.age !== undefined && profile.age !== null ? profile.age : ''} 
                onChange={handleProfileChange}
                placeholder="25"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-black text-base focus:outline-none focus:ring-2 focus:ring-[#E63946] transition-all pr-12" 
                min="0" max="100" 
              />
              <span className="absolute right-3.5 top-3.5 text-xs font-bold text-slate-400 pointer-events-none">{lang === 'en' ? 'yrs' : 'thn'}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {lang === 'en' ? 'Body Weight (kg)' : 'Berat Badan (kg)'}
            </label>
            <div className="relative">
              <input 
                type="number" 
                name="body_weight_kg" 
                value={profile.body_weight_kg !== undefined && profile.body_weight_kg !== null ? profile.body_weight_kg : ''} 
                onChange={handleProfileChange}
                placeholder="70"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-black text-base focus:outline-none focus:ring-2 focus:ring-[#E63946] transition-all pr-12" 
                min="0" max="250" 
              />
              <span className="absolute right-3.5 top-3.5 text-xs font-bold text-slate-400 pointer-events-none">kg</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {lang === 'en' ? 'Height (cm)' : 'Tinggi Badan (cm)'}
            </label>
            <div className="relative">
              <input 
                type="number" 
                name="height_cm" 
                value={profile.height_cm !== undefined && profile.height_cm !== null ? profile.height_cm : ''} 
                onChange={handleProfileChange}
                placeholder="170"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-black text-base focus:outline-none focus:ring-2 focus:ring-[#E63946] transition-all pr-12" 
                min="0" max="230" 
              />
              <span className="absolute right-3.5 top-3.5 text-xs font-bold text-slate-400 pointer-events-none">cm</span>
            </div>
          </div>
        </div>

        {/* Real-time BMI Card */}
        {(() => {
          const w = parseFloat(profile.body_weight_kg || 70);
          const hM = parseFloat(profile.height_cm || 170) / 100;
          const bmi = (hM > 0) ? (w / (hM * hM)).toFixed(1) : '—';
          let category = lang === 'en' ? 'Normal / Fit' : 'Ideal / Normal';
          let colorClass = 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
          if (bmi < 18.5) {
            category = lang === 'en' ? 'Underweight' : 'Underweight (Kekurangan Berat)';
            colorClass = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
          } else if (bmi >= 25 && bmi < 30) {
            category = lang === 'en' ? 'Overweight' : 'Overweight (Kelebihan Berat)';
            colorClass = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
          } else if (bmi >= 30) {
            category = lang === 'en' ? 'Obese' : 'Obese (Obesitas)';
            colorClass = 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
          }
          return (
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-medium transition-all ${colorClass}`}>
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-lg">monitor_weight</span>
                <span>{lang === 'en' ? 'Body Mass Index (BMI):' : 'Indeks Massa Tubuh (BMI):'} <strong className="font-mono text-sm">{bmi} kg/m²</strong></span>
              </div>
              <span className="font-extrabold px-3 py-1 rounded-lg bg-white/90 dark:bg-slate-900/80 border border-current shadow-2xs">
                {category}
              </span>
            </div>
          );
        })()}
      </div>

      {/* SECTION 2: SKRINING KEAMANAN MEDIS */}
      <div id="medical-screening-section" className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-[#EBE5E2] dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#EBE5E2] dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-black text-[#2B2B2B] dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600">verified_user</span>
              {lang === 'en' ? '2. PAR-Q+ Medical Clearance Triage' : '2. Skrining Keamanan Medis (PAR-Q+)'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {lang === 'en' 
                ? 'All 5 questions must be verified to ensure safe exercise loads.' 
                : 'Wajib menjawab 5 pertanyaan di bawah untuk memastikan kondisi fisik aman berlatih.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
              isAllAnswered 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
            }`}>
              {answeredCount}/5 {lang === 'en' ? 'Answered' : 'Terjawab'}
            </span>

            <button
              type="button"
              onClick={setAllHealthy}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border active:scale-95 ${
                isAllHealthy 
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
            >
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>{lang === 'en' ? 'Set All Fit / Clear' : 'Saya Sehat & Fit Total'}</span>
            </button>
          </div>
        </div>

        {/* Validation Error Alert Banner */}
        {validationError && (
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-500 text-rose-900 dark:text-rose-200 flex items-start sm:items-center justify-between gap-3 shadow-lg shadow-rose-500/15 animate-pulse">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-xl">error</span>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black tracking-tight text-rose-900 dark:text-rose-100">
                  {lang === 'en' ? '⚠️ Health Screening Incomplete!' : '⚠️ Skrining Kesehatan Belum Lengkap!'}
                </h4>
                <p className="text-xs font-semibold text-rose-700 dark:text-rose-300 mt-0.5 leading-relaxed">
                  {validationError.message}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setValidationError(null)}
              className="text-rose-500 hover:text-rose-800 dark:hover:text-white p-1 rounded-lg cursor-pointer shrink-0"
              title="Tutup notifikasi"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        )}

        {/* Questions with Explicit [YA] / [TIDAK] Buttons */}
        <div className="space-y-3">
          {questions.map((q) => {
            const val = screening[q.name];
            const isAnswered = typeof val === 'boolean';
            const isChecked = val === true;
            const isMissing = validationError && validationError.unansweredKeys?.includes(q.name);

            // Distinct card styling for 3 states: Unanswered (or missing), Answered NO, Answered YES
            let cardClasses = 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700';
            if (isMissing) {
              cardClasses = 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-400 dark:border-rose-600 ring-2 ring-rose-400/60 shadow-sm';
            } else if (isAnswered) {
              cardClasses = isChecked
                ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 shadow-xs'
                : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800';
            }

            return (
              <div 
                key={q.name}
                id={`screening-card-${q.name}`}
                className={`p-4 rounded-xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full min-w-0 ${cardClasses}`}
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {q.title}
                    </h4>

                    {/* Status Badge */}
                    {isMissing ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-500 text-white animate-pulse shrink-0">
                        {lang === 'en' ? '⚠️ Must Select' : '⚠️ Wajib Dipilih'}
                      </span>
                    ) : !isAnswered ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 shrink-0">
                        {lang === 'en' ? 'Not Selected' : 'Belum Dipilih'}
                      </span>
                    ) : isChecked ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200 shrink-0">
                        {lang === 'en' ? 'Yes (Adjustment Active)' : 'Ya (Ada Penyesuaian)'}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200 shrink-0">
                        {lang === 'en' ? 'No (Healthy)' : 'Tidak (Sehat)'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed break-words">
                    {q.desc}
                  </p>

                  {/* Injury area selector if injury is checked as YA */}
                  {q.name === 'has_injury' && isChecked && (
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-amber-800 dark:text-amber-300 shrink-0">
                        {lang === 'en' ? 'Select Injury Area:' : 'Pilih Area Cedera:'}
                      </span>
                      <select
                        value={screening.injury_area || 'Upper'}
                        onChange={(e) => setScreening(prev => ({ ...prev, injury_area: e.target.value }))}
                        className="px-3 py-1 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 max-w-full"
                      >
                        <option value="Upper">{lang === 'en' ? 'Upper Body (Shoulder / Chest / Arm)' : 'Tubuh Atas (Bahu / Dada / Tangan)'}</option>
                        <option value="Lower">{lang === 'en' ? 'Lower Body (Knee / Hip / Leg)' : 'Tubuh Bawah (Lutut / Panggul / Kaki)'}</option>
                        <option value="Core">{lang === 'en' ? 'Core & Spine (Lower Back)' : 'Inti & Tulang Belakang (Pinggang)'}</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Explicit YA / TIDAK Toggle Buttons */}
                <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto justify-start lg:justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200/60 dark:border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => handleScreeningChange(q.name, false)}
                    className={`flex-1 lg:flex-initial px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                      val === false
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-105'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:border-emerald-400'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    <span>{lang === 'en' ? 'NO (Healthy)' : 'TIDAK (Sehat)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleScreeningChange(q.name, true)}
                    className={`flex-1 lg:flex-initial px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                      val === true
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm scale-105'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:border-amber-400'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">warning</span>
                    <span>{lang === 'en' ? 'YES (Active)' : 'YA (Ada)'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-end pt-2">
        <button 
          type="button"
          onClick={handleNext}
          className="px-8 py-3 bg-[#E63946] hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-all cursor-pointer shadow-md flex items-center gap-2 active:scale-95"
        >
          <span>{lang === 'en' ? 'Proceed to Equipment Selection' : 'Lanjut ke Pilih Alat Gym'}</span>
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </button>
      </div>

    </div>
  );
};

export default ProfileStep;
