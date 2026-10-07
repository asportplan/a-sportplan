import React, { useState, useEffect } from 'react';
import { getUserProfile, getScreeningResults, getUserEquipment, toggleEquipment, updateEquipment1RM } from '../../core/db/user-store.js';
import { MST_EXERCISES, MST_TRAINING_PHASES } from '../../core/db/master-data.js';
import { useLanguage } from '../../hooks/useLanguage.js';

const ScreeningStep = ({ onNext, onPrev, onGoToStep }) => {
  const { lang } = useLanguage();
  const [data, setData] = useState({
    profile: {},
    screening: {},
    equipments: []
  });

  // Modal State for adding recommended equipment with 1RM
  const [activeModalRec, setActiveModalRec] = useState(null);
  const [modal1RM, setModal1RM] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Always load fresh data from localStorage on mount
  useEffect(() => {
    loadFreshData();
  }, []);

  const loadFreshData = () => {
    setData({
      profile: getUserProfile() || {},
      screening: getScreeningResults() || {},
      equipments: getUserEquipment() || []
    });
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const { profile, screening, equipments } = data;

  const isAllHealthy = !screening.has_heart_condition && 
                       !screening.has_asthma && 
                       !screening.has_chest_pain && 
                       !screening.has_injury && 
                       !screening.takes_medication;

  // Level label mapping
  const levelMap = {
    BEGINNER: lang === 'en' ? 'Beginner (< 1 Year)' : 'Pemula (< 1 Tahun)',
    INTERMEDIATE: lang === 'en' ? 'Intermediate (1 - 3 Years)' : 'Menengah (1 - 3 Tahun)',
    ADVANCED: lang === 'en' ? 'Advanced (> 3 Years)' : 'Lanjutan (> 3 Tahun)'
  };
  const levelLabel = levelMap[profile.training_age_level] || (lang === 'en' ? 'Beginner (< 1 Year)' : 'Pemula (< 1 Tahun)');

  // Duration & Goals
  const durationWeeks = parseInt(profile.active_program_duration_weeks || 8);
  const targetPct = parseFloat(profile.target_1rm_increase_pct || 10);
  const selectedGoals = Array.isArray(profile.selected_goals) ? profile.selected_goals.map(g => g === 'hypertrophy_general' ? 'hypertrophy' : g) : ['hypertrophy'];
  
  // Format goal names
  const goalNames = selectedGoals.map(slug => {
    const found = MST_TRAINING_PHASES.find(p => p.phase_slug === slug);
    return found ? slug.replace(/_/g, ' ').toUpperCase() : slug.toUpperCase();
  }).join(' • ');

  // Periodization mode label
  const modeMap = {
    automatic: lang === 'en' ? 'Automatic (Smart Setup)' : 'Otomatis (Saran Program Terbaik)',
    custom_blocks: lang === 'en' ? 'Custom Block Sequence' : 'Kustom Urutan Fase Latihan',
    custom_weekly: lang === 'en' ? 'Custom Weekly Detail' : 'Kustom Detail per Minggu'
  };
  const modeLabel = modeMap[profile.goals_mode] || (lang === 'en' ? 'Automatic (Smart Setup)' : 'Otomatis (Saran Program Terbaik)');

  // Frequency text
  const freqText = profile.frequency_mode === 'custom' 
    ? (lang === 'en' ? 'Custom Weekly Schedule' : 'Kustom per Minggu')
    : `${profile.global_frequency || 4} ${lang === 'en' ? 'Sessions / Week' : 'Sesi / Minggu'}`;

  // BMI Calculation
  const weight = parseFloat(profile.body_weight_kg || 70);
  const heightM = parseFloat(profile.height_cm || 170) / 100;
  const bmi = (weight / (heightM * heightM)).toFixed(1);

  // Equipment Gap & Recommendation Helper
  const getExerciseCategory = (ex) => {
    if (ex.pattern_id === 14 || ex.pattern_id === 15 || ex.pattern_id === 16) return 'CORE';
    if (ex.pattern_id === 6 || ex.pattern_id === 7 || ex.pattern_id === 8 || ex.pattern_id === 9 || ex.pattern_id === 10 || ex.pattern_id === 18) return 'LOWER';
    if (ex.pattern_id === 3 || ex.pattern_id === 4 || ex.pattern_id === 11) return 'UPPER_PULL';
    return 'UPPER_PUSH';
  };

  const getEquipmentRecommendations = (userEquipList) => {
    const presentCategories = new Set();
    const presentSlugs = new Set(userEquipList.map(e => e.exercise_slug));

    MST_EXERCISES.forEach(ex => {
      if (presentSlugs.has(ex.exercise_slug)) {
        presentCategories.add(getExerciseCategory(ex));
      }
    });

    const recommendations = [];

    if (!presentCategories.has('UPPER_PUSH')) {
      recommendations.push({
        category: lang === 'en' ? 'Upper Body Push (Chest & Shoulders)' : 'Tubuh Atas Dorong (Dada & Bahu)',
        title: 'Flat Barbell Bench Press',
        slug: 'bench_press',
        reason: lang === 'en' ? 'Essential for building pushing strength in chest, front shoulders, and triceps.' : 'Sangat berguna untuk melatih otot dada, bahu depan, dan triceps.'
      });
    }

    if (!presentCategories.has('UPPER_PULL')) {
      recommendations.push({
        category: lang === 'en' ? 'Upper Body Pull (Back & Biceps)' : 'Tubuh Atas Tarik (Punggung & Biceps)',
        title: 'Lat Pulldown Machine / Pull-Up Bar',
        slug: 'lat_pulldown',
        reason: lang === 'en' ? 'Essential for back width and posture balance.' : 'Penting untuk melatih lebar otot punggung dan menjaga postur tubuh seimbang.'
      });
    }

    if (!presentCategories.has('LOWER')) {
      recommendations.push({
        category: lang === 'en' ? 'Lower Body (Legs & Glutes)' : 'Tubuh Bawah (Kaki & Glutes)',
        title: 'Barbell Back Squat',
        slug: 'barbell_back_squat',
        reason: lang === 'en' ? 'Primary exercise for leg strength and muscle foundation.' : 'Latihan utama untuk membangun kekuatan dan bentuk otot kaki.'
      });
    }

    if (!presentCategories.has('CORE')) {
      recommendations.push({
        category: lang === 'en' ? 'Core & Abs' : 'Otot Inti & Perut',
        title: 'Plank Bodyweight / Cable Crunch',
        slug: 'plank_bodyweight',
        reason: lang === 'en' ? 'Important for abdominal strength and spine stability.' : 'Penting untuk memperkuat otot perut dan kestabilan pinggang.'
      });
    }

    if (userEquipList.length < 5) {
      if (!presentSlugs.has('bench_press')) {
        recommendations.push({
          category: lang === 'en' ? 'Main Chest Exercise' : 'Latihan Dada Utama',
          title: 'Flat Barbell Bench Press',
          slug: 'bench_press',
          reason: lang === 'en' ? 'Standard compound movement for chest strength.' : 'Latihan utama paling efektif untuk mengukur peningkatan beban dada.'
        });
      }
      if (!presentSlugs.has('barbell_back_squat')) {
        recommendations.push({
          category: lang === 'en' ? 'Main Leg Exercise' : 'Latihan Kaki Utama',
          title: 'Barbell Back Squat',
          slug: 'barbell_back_squat',
          reason: lang === 'en' ? 'Standard compound movement for total leg development.' : 'Latihan utama paling efektif untuk mengukur kekuatan otot kaki.'
        });
      }
      if (!presentSlugs.has('romanian_deadlift')) {
        recommendations.push({
          category: lang === 'en' ? 'Hamstrings & Glutes' : 'Paha Belakang & Pinggul',
          title: 'Romanian Deadlift (Barbell/Dumbbell)',
          slug: 'romanian_deadlift',
          reason: lang === 'en' ? 'Best exercise for hamstrings and lower back posture.' : 'Latihan terbaik untuk melatih paha bagian belakang dan pinggul.'
        });
      }
    }

    // Filter out duplicates
    const uniqueRecs = [];
    const seenSlugs = new Set();
    for (const r of recommendations) {
      if (!seenSlugs.has(r.slug) && !presentSlugs.has(r.slug)) {
        seenSlugs.add(r.slug);
        uniqueRecs.push(r);
      }
    }

    return uniqueRecs;
  };

  const recommendations = getEquipmentRecommendations(equipments);

  const handleOpenRecModal = (rec) => {
    setActiveModalRec(rec);
    setModal1RM('');
  };

  const handleSaveModalRec = (e) => {
    e.preventDefault();
    if (!activeModalRec) return;

    toggleEquipment(activeModalRec.slug, true);

    const val = modal1RM.trim() === '' ? null : parseFloat(modal1RM);
    if (val && !isNaN(val)) {
      updateEquipment1RM(activeModalRec.slug, val);
      showToast(`✓ ${activeModalRec.title} (1RM: ${val} kg) ${lang === 'en' ? 'added successfully!' : 'berhasil ditambahkan!'}`);
    } else {
      showToast(`✓ ${activeModalRec.title} ${lang === 'en' ? 'added successfully!' : 'berhasil ditambahkan!'}`);
    }

    setActiveModalRec(null);
    setModal1RM('');
    loadFreshData();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 font-sans" style={{ width: '100%' }}>
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 left-4 right-4 sm:left-auto sm:right-6 z-50 bg-[#2B2B2B] text-white px-5 py-3 rounded-xl shadow-2xl font-bold text-xs flex items-center gap-3 border border-slate-700 animate-bounce">
          <span className="material-symbols-outlined text-emerald-400">check_circle</span>
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg('')} aria-label="Close" className="text-slate-400 hover:text-white min-w-11 min-h-11 inline-flex items-center justify-center rounded-lg">✕</button>
        </div>
      )}

      {/* Step Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-[#EBE5E2] dark:border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 text-[#E63946] dark:text-red-400 font-bold flex items-center justify-center text-xl shrink-0">
            <span className="material-symbols-outlined">auto_awesome</span>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#2B2B2B] dark:text-white tracking-tight">
              {lang === 'en' ? 'Step 5: Review Summary & Create Program' : 'Langkah 5: Cek Ringkasan & Buat Program'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium mt-0.5">
              {lang === 'en' ? 'Review your profile, selected equipment, and target goals before generating your plan.' : 'Periksa kembali data diri, alat gym, dan target Anda sebelum program dibuat.'}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Executive Cards Grid: 3 Symmetrical Top Cards + 1 Full Width Bottom Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        
        {/* Card 1: Data Diri & Atlet */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-[#EBE5E2] dark:border-slate-800 space-y-3 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#E63946] dark:text-red-400">
                <span className="material-symbols-outlined text-lg">person</span>
                <span>{lang === 'en' ? '1. User & Athlete Profile' : '1. Data Diri & Profil Latihan'}</span>
              </div>
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                BMI: {bmi}
              </span>
            </div>
            
            <div className="text-base font-black text-[#2B2B2B] dark:text-white capitalize break-words leading-tight">
              {profile.athlete_name || (lang === 'en' ? 'User Profile' : 'Profil Pengguna')}
            </div>
          </div>
          
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5 mt-auto">
            {profile.athlete_name && (
              <div>
                <span className="text-slate-500 font-medium">{lang === 'en' ? 'Name: ' : 'Nama: '}</span>
                <strong className="text-slate-900 dark:text-white font-bold capitalize">{profile.athlete_name}</strong>
              </div>
            )}
            <div>
              <span className="text-slate-500 font-medium">{lang === 'en' ? 'Training Focus / Sport: ' : 'Fokus / Cabang Olahraga: '}</span>
              <strong className="text-[#E63946] dark:text-red-400 font-extrabold capitalize">{profile.sport_branch || (lang === 'en' ? 'General Fitness' : 'Kebugaran Umum')}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium">{lang === 'en' ? 'Biometrics: ' : 'Biometrik Fisik: '}</span>
              <strong className="text-slate-900 dark:text-white">{profile.age || 25} {lang === 'en' ? 'yrs' : 'thn'} | {profile.body_weight_kg || 70} kg | {profile.height_cm || 170} cm</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium">{lang === 'en' ? 'Training Experience: ' : 'Tingkat Pengalaman: '}</span>
              <strong className="text-slate-900 dark:text-white">{levelLabel}</strong>
            </div>
          </div>
        </div>

        {/* Card 2: Keamanan Medis & Status Kesehatan */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-[#EBE5E2] dark:border-slate-800 space-y-3 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <span className="material-symbols-outlined text-lg">verified_user</span>
              <span>{lang === 'en' ? '2. Health Status' : '2. Status Kesehatan'}</span>
            </div>

            <div className="flex items-center gap-2">
              {isAllHealthy ? (
                <span className="px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 font-black text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>{lang === 'en' ? 'Healthy & Fit (Clearance)' : 'Tubuh Sehat & Fit (Siap Latihan)'}</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:amber-300 border border-amber-300 font-black text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">warning</span>
                  <span>{lang === 'en' ? 'Health Adjustments Active' : 'Penyesuaian Kesehatan Aktif'}</span>
                </span>
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed mt-auto">
            {isAllHealthy ? (
              (lang === 'en' ? 'No history of heart condition, active asthma, or injury. Weight load can be increased normally.' : 'Tidak ada riwayat penyakit jantung, asma aktif, atau cedera. Beban latihan dapat ditingkatkan secara optimal.')
            ) : (
              <ul className="list-disc pl-4 space-y-1">
                {screening.has_asthma && <li>{lang === 'en' ? 'Rest periods between sets increased by +50% for oxygen recovery.' : 'Jeda istirahat antar-set ditambah +50% untuk pemulihan napas.'}</li>}
                {screening.has_injury && <li>{lang === 'en' ? `Weights for active injury area (${screening.injury_area || 'active'}) will be limited.` : `Beban untuk area cedera (${screening.injury_area || 'aktif'}) akan dibatasi otomatis.`}</li>}
                {screening.has_heart_condition && <li>{lang === 'en' ? 'Intensity set below 85% 1RM for heart safety.' : 'Intensitas diatur di bawah 85% 1RM demi keamanan jantung.'}</li>}
              </ul>
            )}
          </div>
        </div>

        {/* Card 3: Target & Durasi Program */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-[#EBE5E2] dark:border-slate-800 space-y-3 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#E63946] dark:text-red-400">
              <span className="material-symbols-outlined text-lg">tune</span>
              <span>{lang === 'en' ? '3. Target & Duration' : '3. Target & Durasi Program'}</span>
            </div>

            <div className="text-base font-black text-[#2B2B2B] dark:text-white">
              {durationWeeks} {lang === 'en' ? 'Weeks' : 'Minggu'} <span className="text-[#E63946] font-bold text-xs ml-1">(Target +{targetPct}% 1RM)</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5 mt-auto">
            <div>
              <span className="text-slate-500 font-medium">{lang === 'en' ? 'Weekly Schedule: ' : 'Frekuensi Latihan: '}</span>
              <strong className="text-slate-900 dark:text-white">{freqText}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium">{lang === 'en' ? 'Program Method: ' : 'Metode Program: '}</span>
              <strong className="text-slate-900 dark:text-white">{modeLabel}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium">{lang === 'en' ? 'Main Focus: ' : 'Fokus Utama: '}</span>
              <strong className="text-[#E63946] dark:text-red-400 font-bold">{goalNames}</strong>
            </div>
          </div>
        </div>

        {/* Card 4: Alat Gym & Nilai 1RM (Full Width across 3 columns) */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-[#EBE5E2] dark:border-slate-800 space-y-3 shadow-xs md:col-span-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#E63946] dark:text-red-400">
              <span className="material-symbols-outlined text-lg">fitness_center</span>
              <span>{lang === 'en' ? '4. Gym Equipment & 1RM' : '4. Alat Gym & Data 1RM'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-[#E63946] dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2.5 py-0.5 rounded-lg border border-red-200 dark:border-red-800">
                {equipments.length} {lang === 'en' ? 'Selected' : 'Alat Terpilih'}
              </span>
              {onGoToStep && (
                <button
                  type="button"
                  onClick={() => onGoToStep(3)}
                  className="text-[11px] font-bold text-slate-500 hover:text-[#E63946] underline cursor-pointer"
                  title={lang === 'en' ? 'Edit 1RM in Step 3' : 'Ubah 1RM di Langkah 3'}
                >
                  {lang === 'en' ? 'Edit 1RM' : 'Edit 1RM'}
                </button>
              )}
            </div>
          </div>

          <div className="text-sm font-bold text-[#2B2B2B] dark:text-white">
            {lang === 'en' ? 'Selected Equipment List' : 'Daftar Alat Gym Terpilih'}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            {equipments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1.5">
                {equipments.map(eq => (
                  <div key={eq.exercise_slug} className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">{eq.exercise_slug.replace(/_/g, ' ')}</span>
                    <span className="font-mono font-bold text-[#E63946] dark:text-red-400 shrink-0 ml-2">{eq.user_1rm_kg ? `${eq.user_1rm_kg} kg` : 'Default'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-slate-400 italic">{lang === 'en' ? 'All standard gym equipment active' : 'Semua alat standar gym aktif'}</span>
            )}
          </div>
        </div>

      </div>

      {/* RECOMMENDATION OF MISSING / ESSENTIAL GYM EQUIPMENT */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-[#EBE5E2] dark:border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#EBE5E2] dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-sm font-black text-[#2B2B2B] dark:text-white">
            <span className="material-symbols-outlined text-xl text-[#E63946]">lightbulb</span>
            <span>{lang === 'en' ? 'Equipment Recommendations for a Complete Program' : 'Saran Alat Tambahan Agar Latihan Lebih Lengkap'}</span>
          </div>

          <div className="flex items-center gap-2">
            {onGoToStep && (
              <button
                type="button"
                onClick={() => onGoToStep(2)}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 border border-slate-200 dark:border-slate-700"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                <span>{lang === 'en' ? 'Back to Equipment (Step 2)' : 'Kembali ke Pilih Alat (Langkah 2)'}</span>
              </button>
            )}

            {recommendations.length === 0 ? (
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold flex items-center gap-1 border border-emerald-300">
                <span className="material-symbols-outlined text-sm">verified</span>
                <span>{lang === 'en' ? 'Equipment Complete' : 'Alat Sangat Lengkap'}</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-extrabold flex items-center gap-1 border border-amber-300">
                <span className="material-symbols-outlined text-sm">add_circle</span>
                <span>{recommendations.length} {lang === 'en' ? 'Recommendations' : 'Rekomendasi'}</span>
              </span>
            )}
          </div>
        </div>

        {recommendations.length === 0 ? (
          <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-300 font-medium leading-relaxed flex items-start gap-2.5">
            <span className="material-symbols-outlined text-emerald-600 text-lg shrink-0 mt-0.5">check_circle</span>
            <div>
              <strong>{lang === 'en' ? 'Your Gym Equipment Covers All Major Muscle Groups' : 'Peralatan Gym Anda Sudah Sangat Lengkap'}</strong>
              <p className="mt-0.5 text-emerald-800 dark:text-emerald-400">
                {lang === 'en' ? 'Your selected equipment covers all main movement patterns (Push, Pull, Legs, and Core). Varied workouts can be created optimally.' : 'Inventaris alat gym Anda mencakup seluruh 4 kelompok otot utama (Dada/Bahu, Punggung, Kaki, dan Perut). Variasi latihan dapat disusun secara maksimal.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            <p className="text-slate-600 dark:text-slate-300 font-medium">
              {lang === 'en' ? 'Adding any of the equipment below will make your muscle workout variations even more balanced:' : 'Menambahkan beberapa alat di bawah ini akan membuat variasi latihan otot Anda lebih seimbang:'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recommendations.map((rec) => (
                <div 
                  key={rec.slug}
                  className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/60 space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-[11px] text-amber-800 dark:text-amber-400">{rec.category}</span>
                      <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-md">
                        {lang === 'en' ? 'Recommended' : 'Disarankan'}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white capitalize">
                      {rec.title}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 font-medium text-[11px] leading-relaxed">
                      {rec.reason}
                    </p>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenRecModal(rec)}
                      className="flex-1 py-2 px-3 bg-[#E63946] hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-sm">add_circle</span>
                      <span>+ {lang === 'en' ? 'Add & Set 1RM' : 'Tambah & Isi 1RM'}</span>
                    </button>

                    {onGoToStep && (
                      <button
                        type="button"
                        onClick={() => onGoToStep(2)}
                        title={lang === 'en' ? 'View in Step 2' : 'Lihat di Langkah 2'}
                        className="p-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold cursor-pointer shrink-0"
                      >
                        <span className="material-symbols-outlined text-sm">menu</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* QUICK MODAL DIALOG: INPUT 1RM FOR RECOMMENDED EQUIPMENT */}
      {activeModalRec && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999 }}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5"
            style={{ width: '90%', maxWidth: '440px', minWidth: '280px', boxSizing: 'border-box', margin: 'auto', display: 'block' }}
          >
            
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3" style={{ width: '100%' }}>
              <div style={{ width: '100%' }}>
                <span className="text-[11px] font-extrabold uppercase text-[#E63946] dark:text-red-400 block" style={{ width: '100%' }}>
                  {lang === 'en' ? 'Recommended Equipment' : 'Rekomendasi Alat Tambahan'}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white capitalize" style={{ width: '100%' }}>
                  {activeModalRec.title}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setActiveModalRec(null)} 
                aria-label="Close" className="text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg shrink-0 cursor-pointer min-w-11 min-h-11 inline-flex items-center justify-center rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModalRec} className="space-y-4" style={{ width: '100%' }}>
              <div className="space-y-1.5" style={{ width: '100%' }}>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block" style={{ width: '100%' }}>
                  {lang === 'en' ? 'Enter 1RM Maximum Weight (in kg):' : 'Masukkan Nilai Beban 1RM (1-Rep Max dalam kg):'}
                </label>
                <div className="flex items-center gap-2" style={{ width: '100%' }}>
                  <input
                    type="number"
                    placeholder="0 (atau kosongkan)"
                    value={modal1RM}
                    onChange={(e) => setModal1RM(e.target.value)}
                    className="flex-1 w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                    min="1"
                    max="500"
                    autoFocus
                  />
                  <span className="text-xs font-bold text-slate-500 font-mono shrink-0">kg</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed pt-1 block" style={{ width: '100%' }}>
                  *{lang === 'en' ? 'Leave empty if you have not tested 1RM for this exercise. Default standard load will be used.' : 'Kosongkan nilai jika Anda belum pernah menguji 1RM untuk alat ini. Sistem akan menggunakan estimasi beban standar.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2" style={{ width: '100%' }}>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#E63946] hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-red-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>{lang === 'en' ? 'Save Equipment & 1RM' : 'Simpan Alat & Nilai 1RM'}</span>
                </button>

                <div className="flex flex-col sm:flex-row gap-2" style={{ width: '100%' }}>
                  {onGoToStep && (
                    <button
                      type="button"
                      onClick={() => { setActiveModalRec(null); onGoToStep(2); }}
                      className="flex-1 py-2 px-3 text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-center cursor-pointer"
                    >
                      ← {lang === 'en' ? 'Step 2 (Equipment)' : 'Menu Alat (Langkah 2)'}
                    </button>
                  )}
                  {onGoToStep && (
                    <button
                      type="button"
                      onClick={() => { setActiveModalRec(null); onGoToStep(3); }}
                      className="flex-1 py-2 px-3 text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-center cursor-pointer"
                    >
                      {lang === 'en' ? 'Step 3 (1RM)' : 'Input 1RM (Langkah 3)'}
                    </button>
                  )}
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Prominent Action Banner */}
      <div 
        className="bg-gradient-to-r from-red-600 to-orange-500 rounded-3xl p-6 sm:p-8 text-center text-white space-y-4 shadow-xl shadow-red-500/20"
        style={{ width: '100%', alignSelf: 'stretch', boxSizing: 'border-box' }}
      >
        <h3 className="text-xl sm:text-2xl font-black tracking-tight" style={{ width: '100%' }}>
          {lang === 'en' ? 'Ready to Create Your Workout Plan?' : 'Siap Buat Program Latihan Anda?'}
        </h3>
        <p 
          className="text-xs sm:text-sm font-medium text-white/90 leading-relaxed"
          style={{ width: '100%', maxWidth: '560px', margin: '0 auto', display: 'block' }}
        >
          {lang === 'en' 
            ? 'The system will automatically calculate weekly target weights, load progression schedules, and proper recovery rest periods.'
            : 'Sistem akan otomatis menghitung target beban tiap minggu, jadwal kenaikan beban, dan waktu istirahat pemulihan yang tepat.'
          }
        </p>

        <div className="pt-2 flex justify-center" style={{ width: '100%' }}>
          <button
            type="button"
            onClick={onNext}
            className="px-8 py-3.5 sm:px-10 sm:py-4 bg-white text-[#E63946] hover:bg-slate-50 font-black text-sm sm:text-base rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-xl">rocket_launch</span>
            <span>{lang === 'en' ? 'Generate Workout Plan Now' : 'Buat Program Latihan Sekarang'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-start pt-2">
        <button 
          type="button"
          onClick={onPrev}
          className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
        >
          {lang === 'en' ? 'Previous Step' : 'Sebelumnya'}
        </button>
      </div>
    </div>
  );
};

export default ScreeningStep;
