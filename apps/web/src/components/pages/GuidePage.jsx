import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage.js';

const GuidePage = ({ onStartWizard, onNavigate }) => {
  const { lang } = useLanguage();
  const [activeSection, setActiveSection] = useState('programs_catalog');
  const [expandedProgramSlug, setExpandedProgramSlug] = useState('hypertrophy');
  const [catalogFilter, setCatalogFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Embedded Quick 1RM Calculator state
  const [calcWeight, setCalcWeight] = useState('');
  const [calcReps, setCalcReps] = useState(8);

  const trainingProgramsCatalogID = [
    {
      slug: 'hypertrophy',
      type: 'SINGLE',
      title: '1. Program Hipertrofi General (Muscle Hypertrophy)',
      category: 'Pertumbuhan Massa Otot',
      badgeColor: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
      intensityPct: '75% - 85% 1RM',
      reps: '6 - 12 Reps',
      sets: '3 - 6 Set',
      rest: '60 - 90 Detik',
      tempo: '2-0-2-0 (Terkontrol)',
      recommendedDuration: '4 - 6 Minggu per Mesosiklus',
      targetAudience: 'Atlet Pemula, Menengah & Lanjutan yang ingin memaksimalkan volume dan ukuran fisik massa otot.',
      biochemicalSignal: 'Jalur Molekuler mTOR (Sintesis Protein Seluler)',
      desc: 'Fokus paling populer untuk meningkatkan ketebalan dan ukuran serat otot. Mengkombinasikan ketegangan mekanis (Mechanical Tension) yang tinggi dengan akumulasi stres metabolik optimal tanpa kelelahan berlebih.'
    },
    {
      slug: 'strength_max',
      type: 'SINGLE',
      title: '2. Program Kekuatan Maksimal (Maximum Strength)',
      category: 'Peningkatan Beban 1RM',
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
      intensityPct: '85% - 100% 1RM',
      reps: '1 - 5 Reps',
      sets: '4 - 6 Set',
      rest: '180 - 300 Detik (3 - 5 Menit)',
      tempo: '1-0-X-0 (Konsentrik Eksplosif)',
      recommendedDuration: '3 - 4 Minggu',
      targetAudience: 'Atlet Menengah & Lanjutan yang ingin menaikkan batas beban 1RM maksimal atau persiapan kompetisi powerlifting.',
      biochemicalSignal: 'Rekrutmen Unit Motorik Saraf Pusat (CNS Adaptation)',
      desc: 'Menggunakan beban terberat mendekati batas 1RM untuk melatih Sistem Saraf Pusat memobilisasi serat otot cepat (Tipe IIx). Membutuhkan jeda istirahat ekstra (3-5 menit) agar ATP-PCr pulih 100% sebelum set berikutnya.'
    },
    {
      slug: 'muscular_endurance',
      type: 'SINGLE',
      title: '3. Program Daya Tahan Otot (Muscular Endurance)',
      category: 'Daya Tahan & Oksidasi Lemak',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
      intensityPct: '50% - 70% 1RM',
      reps: '15 - 25 Reps',
      sets: '2 - 4 Set',
      rest: '30 - 60 Detik',
      tempo: '2-0-2-0',
      recommendedDuration: '3 - 4 Minggu',
      targetAudience: 'Individu yang ingin meningkatkan ketahanan kelelahan laktat, kesehatan vaskular, dan pembakaran kalori tinggi.',
      biochemicalSignal: 'Jalur Molekuler AMPK & Kepadatan Mitokondria',
      desc: 'Menggunakan repetisi tinggi dengan jeda istirahat singkat. Meningkatkan kapasitas vaskularisasi pembuluh darah lokal serta toleransi sel otot terhadap penumpukan ion hidrogen dan asam laktat.'
    },
    {
      slug: 'power',
      type: 'SINGLE',
      title: '4. Program Daya Ledak Eksplosif (Explosive Power)',
      category: 'Kecepatan & Rekrutmen RFD',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800',
      intensityPct: '30% - 45% 1RM',
      reps: '1 - 10 Reps (Kecepatan Maksimal)',
      sets: '3 - 6 Set',
      rest: '180 - 300 Detik',
      tempo: 'X-X-X-X (Maksimal Kecepatan Eksplosif)',
      recommendedDuration: '2 - 3 Minggu (Peaking)',
      targetAudience: 'Atlet cabang olahraga (Sepak Bola, Basket, Beladiri, Sprint) yang membutuhkan akselerasi dan daya ledak impulsif.',
      biochemicalSignal: 'Rate of Force Development (RFD) & Impuls Saraf',
      desc: 'Berfokus memindahkan beban sedang dengan kecepatan kontraksi secepat mungkin. Melatih kecepatan hantaran impuls saraf tanpa memicu kelelahan berlebih.'
    },
    {
      slug: 'speed_power',
      type: 'SINGLE',
      title: '5. Program Kecepatan & Akselerasi (Speed Power)',
      category: 'Kecepatan Atletik',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800',
      intensityPct: '30% - 50% 1RM',
      reps: '4 - 8 Reps',
      sets: '3 - 5 Set',
      rest: '120 - 180 Detik',
      tempo: 'X-0-X-0 (Fast Eccentric/Concentric)',
      recommendedDuration: '2 - 3 Minggu',
      targetAudience: 'Sprinter dan atlet cabang lari/lompat yang berfokus pada siklus regang-pendek (Stretch-Shortening Cycle).',
      biochemicalSignal: 'Elastisitas Tendon & Siklus SSC',
      desc: 'Meningkatkan refleks regang serat otot dan elastisitas susunan matriks tendon untuk mentransfer energi kinetik dengan efisiensi maksimal.'
    },
    {
      slug: 'strength_endurance_aa',
      type: 'SINGLE',
      title: '6. Program Adaptasi Anatomi & Struktur (Anatomical Adaptation)',
      category: 'Fondasi Penguatan Struktur',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
      intensityPct: '50% - 70% 1RM',
      reps: '12 - 20 Reps',
      sets: '2 - 4 Set',
      rest: '30 - 90 Detik',
      tempo: '4-2-1-1 (Tempo Lambat Terkontrol)',
      recommendedDuration: '3 - 6 Minggu',
      targetAudience: 'Pemula yang baru memulai latihan beban, atau atlet pasca-istirahat panjang / pasca-cedera.',
      biochemicalSignal: 'Penguatan Ligamen, Tendon & Kepadatan Tulang',
      desc: 'Fase fondasi vital sebelum masuk ke beban berat. Berfokus melatih kestabilan struktur ligamen, tendon, dan kepadatan matriks tulang dengan tempo lambat terkontrol untuk mencegah risiko cedera.'
    },
    {
      slug: 'core_stability',
      type: 'SINGLE',
      title: '7. Program Kestabilan Inti Abdominalis (Core Stability)',
      category: 'Kestabilan Postur & Inti',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
      intensityPct: 'Bodyweight / Moderat',
      reps: '12 - 20 Reps',
      sets: '2 - 3 Set',
      rest: '0 - 60 Detik',
      tempo: '3-3-1-0 (Isometric Hold)',
      recommendedDuration: '3 - 4 Minggu',
      targetAudience: 'Individu dengan keluhan nyeri punggung bawah ringan atau ingin memperbaiki kestabilan panggul dan tulang belakang.',
      biochemicalSignal: 'Aktivasi Otot Transversus Abdominis & Multifidus',
      desc: 'Melatih otot inti terdalam (Deep Core) untuk membentuk sabuk perlindungan alami bagi tulang belakang saat mengangkat beban berat di kemudian hari.'
    },
    {
      slug: 'functional_training',
      type: 'SINGLE',
      title: '8. Program Kebugaran Fungsional (Functional Fitness)',
      category: 'Kebugaran & Gerakan Harian',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800',
      intensityPct: '60% - 80% 1RM',
      reps: '8 - 15 Reps',
      sets: '3 - 5 Set',
      rest: '60 - 90 Detik',
      tempo: '2-0-2-0',
      recommendedDuration: '4 - 8 Minggu',
      targetAudience: 'Umum & Usia Lanjut yang ingin meningkatkan mobilitas, koordinasi motorik, dan kemudahan beraktivitas sehari-hari.',
      biochemicalSignal: 'Propriosepsi Saraf & Koordinasi Inter-otot',
      desc: 'Menggabungkan pola gerak multi-sendi dalam 3 bidang gerak (Sagital, Frontal, Transversal) untuk meningkatkan efisiensi mobilitas fisik sehari-hari.'
    },
    {
      slug: 'stabilization_endurance',
      type: 'SINGLE',
      title: '9. Program Kestabilan & Keseimbangan Sendi (Stabilization Endurance)',
      category: 'Keseimbangan Sendi',
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800',
      intensityPct: '50% - 70% 1RM',
      reps: '12 - 20 Reps',
      sets: '1 - 3 Set',
      rest: '0 - 90 Detik',
      tempo: '4-2-1-1 (Tempo Lambat Stabil)',
      recommendedDuration: '4 Minggu',
      targetAudience: 'Atlet yang ingin memperbaiki kelemahan sendi bahu, lutut, atau pergelangan kaki.',
      biochemicalSignal: 'Sinyal Proprioseptor Sendi & Otot Stabilisator',
      desc: 'Fokus melatih otot-otot penstabil kecil (*Stabilizers*) dengan permukaan tidak stabil atau beban sedang untuk mengunci sendi secara kokoh.'
    },
    {
      slug: 'balance_agility',
      type: 'SINGLE',
      title: '10. Program Keseimbangan & Kelincahan (Balance & Agility)',
      category: 'Kelincahan & Keseimbangan',
      badgeColor: 'bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-950 dark:text-lime-300 dark:border-lime-800',
      intensityPct: 'Bodyweight / Ringan',
      reps: '8 - 12 Reps',
      sets: '2 - 3 Set',
      rest: '60 - 90 Detik',
      tempo: 'Terkontrol',
      recommendedDuration: '2 - 4 Minggu',
      targetAudience: 'Atlet lapangan dan individu yang ingin melatih kecepatan reaksi dan keseimbangan dinamis.',
      biochemicalSignal: 'Refleks Vestibular & Kontrol Saraf Motorik',
      desc: 'Melatih kemampuan tubuh mengubah arah dengan cepat tanpa kehilangan keseimbangan pusat gravitasi.'
    },
    {
      slug: 'combo_hyper_strength',
      type: 'COMBO',
      title: '11. Kombinasi: Hipertrofi ➔ Kekuatan Maksimal (8 Minggu)',
      category: 'Program Kombinasi 2 Fase',
      badgeColor: 'bg-[#E63946] text-white font-bold',
      intensityPct: '75% ➔ 95% 1RM',
      reps: '12 Reps ➔ 2 Reps',
      sets: '4 Set',
      rest: '90 - 300 Detik',
      tempo: 'Progresif',
      recommendedDuration: '8 Minggu (4 Minggu Hipertrofi + 4 Minggu Kekuatan)',
      targetAudience: 'Atlet yang ingin membesarkan massa otot sekaligus menguji kenaikan beban 1RM di akhir siklus.',
      biochemicalSignal: 'Sinergi mTOR (Ukuran Otot) & CNS (Kekuatan Saraf)',
      desc: 'Struktur kombinasi paling populer di dunia fitness. Blok 1 membangun massa dan diameter otot, lalu Blok 2 mengubah massa otot baru tersebut menjadi kekuatan maksimal.'
    },
    {
      slug: 'combo_aa_hyper_strength',
      type: 'COMBO',
      title: '12. Kombinasi: Adaptasi ➔ Hipertrofi ➔ Kekuatan (12 Minggu)',
      category: 'Program Kombinasi 3 Fase',
      badgeColor: 'bg-purple-600 text-white font-bold',
      intensityPct: '60% ➔ 85% ➔ 95% 1RM',
      reps: '15 ➔ 8 ➔ 3 Reps',
      sets: '3 - 5 Set',
      rest: '60 - 240 Detik',
      tempo: 'Progresif Terstruktur',
      recommendedDuration: '12 Minggu Lengkap',
      targetAudience: 'Individu yang ingin menjalani transformasi fisik total secara aman dari nol hingga mencapai batas kekuatan puncak.',
      biochemicalSignal: 'Tri-Fase Fisiologi: Struktur ➔ Sintesis ➔ Rekrutmen Saraf',
      desc: 'Program 12 minggu komprehensif. Dimulai dari penguatan sendi (Bulan 1), pembentukan massa otot (Bulan 2), dan puncaknya peningkatkan beban maksimal (Bulan 3).'
    },
    {
      slug: 'combo_endurance_hyper',
      type: 'COMBO',
      title: '13. Kombinasi: Daya Tahan Otot ➔ Hipertrofi (8 Minggu)',
      category: 'Program Kombinasi 2 Fase',
      badgeColor: 'bg-emerald-600 text-white font-bold',
      intensityPct: '55% ➔ 80% 1RM',
      reps: '20 Reps ➔ 8 Reps',
      sets: '3 - 4 Set',
      rest: '45 - 90 Detik',
      tempo: 'Terkontrol',
      recommendedDuration: '8 Minggu',
      targetAudience: 'Individu yang ingin membakar lemak tubuh sekaligus membentuk definisi dan ukuran otot.',
      biochemicalSignal: 'Sinergi AMPK (Oksidasi Lemak) & mTOR (Hipertrofi)',
      desc: 'Memulakan program dengan meningkatkan pembalutan kapiler darah dan pembakaran kalori, disusul pembentukan definisi massa otot yang padat.'
    },
    {
      slug: 'custom_user_block',
      type: 'COMBO',
      title: '14. Program Kustom Kategori Bebas (Custom Multi-Block)',
      category: 'Desain Bebas Pengguna',
      badgeColor: 'bg-slate-800 text-white font-bold',
      intensityPct: 'Fleksibel 50% - 100%',
      reps: '1 - 25 Reps',
      sets: 'Kustom',
      rest: 'Disesuaikan',
      tempo: 'Bebas',
      recommendedDuration: '1 - 24 Minggu (Bisa Diatur)',
      targetAudience: 'Pelatih gym atau atlet berpengalaman yang memiliki kebutuhan urutan latihan spesifik.',
      biochemicalSignal: 'Disesuaikan dengan Urutan Blok yang Dipilih',
      desc: 'Kebebasan penuh mengatur urutan dan durasi tiap minggu sesuai kebutuhan pribadi melalui menu Generator Kustom.'
    }
  ];

  const trainingProgramsCatalogEN = [
    {
      slug: 'hypertrophy',
      type: 'SINGLE',
      title: '1. General Muscle Hypertrophy Program',
      category: 'Muscle Mass Growth',
      badgeColor: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
      intensityPct: '75% - 85% 1RM',
      reps: '6 - 12 Reps',
      sets: '3 - 6 Sets',
      rest: '60 - 90 Seconds',
      tempo: '2-0-2-0 (Controlled)',
      recommendedDuration: '4 - 6 Weeks per Mesocycle',
      targetAudience: 'Beginner, Intermediate & Advanced athletes aiming to maximize muscle size and physical volume.',
      biochemicalSignal: 'mTOR Molecular Pathway (Cellular Protein Synthesis)',
      desc: 'The most popular focus for increasing muscle fiber thickness and size. Combines high mechanical tension with optimal metabolic stress accumulation without excessive fatigue.'
    },
    {
      slug: 'strength_max',
      type: 'SINGLE',
      title: '2. Maximum Strength Program',
      category: '1RM Load Increase',
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
      intensityPct: '85% - 100% 1RM',
      reps: '1 - 5 Reps',
      sets: '4 - 6 Sets',
      rest: '180 - 300 Seconds (3 - 5 Mins)',
      tempo: '1-0-X-0 (Explosive Concentric)',
      recommendedDuration: '3 - 4 Weeks',
      targetAudience: 'Intermediate & Advanced athletes aiming to increase 1RM max strength or powerlifting prep.',
      biochemicalSignal: 'Central Nervous System Motor Unit Recruitment (CNS Adaptation)',
      desc: 'Uses heavy loads near 1RM to train the Central Nervous System to mobilize fast-twitch muscle fibers (Type IIx). Requires 3-5 mins rest for 100% ATP-PCr recovery.'
    },
    {
      slug: 'muscular_endurance',
      type: 'SINGLE',
      title: '3. Muscular Endurance Program',
      category: 'Endurance & Fat Oxidation',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
      intensityPct: '50% - 70% 1RM',
      reps: '15 - 25 Reps',
      sets: '2 - 4 Sets',
      rest: '30 - 60 Seconds',
      tempo: '2-0-2-0',
      recommendedDuration: '3 - 4 Weeks',
      targetAudience: 'Individuals seeking lactate fatigue tolerance, vascular health, and high calorie burn.',
      biochemicalSignal: 'AMPK Molecular Pathway & Mitochondrial Density',
      desc: 'Uses high reps with short rest intervals. Increases local vascularization and muscle cell tolerance to hydrogen ion accumulation.'
    },
    {
      slug: 'power',
      type: 'SINGLE',
      title: '4. Explosive Power Program',
      category: 'Speed & RFD Recruitment',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800',
      intensityPct: '30% - 45% 1RM',
      reps: '1 - 10 Reps (Max Speed)',
      sets: '3 - 6 Sets',
      rest: '180 - 300 Seconds',
      tempo: 'X-X-X-X (Max Explosive Velocity)',
      recommendedDuration: '2 - 3 Weeks (Peaking)',
      targetAudience: 'Sports athletes (Soccer, Basketball, Martial Arts, Sprinting) requiring rapid acceleration.',
      biochemicalSignal: 'Rate of Force Development (RFD) & Neural Impulse',
      desc: 'Focuses on moving moderate loads at maximum contraction velocity. Trains neural conduction speed without inducing fatigue.'
    },
    {
      slug: 'speed_power',
      type: 'SINGLE',
      title: '5. Speed & Acceleration Program',
      category: 'Athletic Speed',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800',
      intensityPct: '30% - 50% 1RM',
      reps: '4 - 8 Reps',
      sets: '3 - 5 Sets',
      rest: '120 - 180 Seconds',
      tempo: 'X-0-X-0 (Fast Eccentric/Concentric)',
      recommendedDuration: '2 - 3 Weeks',
      targetAudience: 'Sprinters and jumping athletes focusing on the Stretch-Shortening Cycle (SSC).',
      biochemicalSignal: 'Tendon Elasticity & SSC Cycle',
      desc: 'Enhances stretch reflex and tendon matrix elasticity for maximum kinetic energy transfer efficiency.'
    },
    {
      slug: 'strength_endurance_aa',
      type: 'SINGLE',
      title: '6. Anatomical Adaptation Program',
      category: 'Structural Foundation',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
      intensityPct: '50% - 70% 1RM',
      reps: '12 - 20 Reps',
      sets: '2 - 4 Sets',
      rest: '30 - 90 Seconds',
      tempo: '4-2-1-1 (Slow Controlled Tempo)',
      recommendedDuration: '3 - 6 Weeks',
      targetAudience: 'Beginners starting resistance training, or athletes returning after a long break or injury.',
      biochemicalSignal: 'Ligament, Tendon & Bone Mineral Density',
      desc: 'Vital foundation phase before heavy lifting. Focuses on strengthening ligament stability, tendons, and bone matrix with controlled tempos to prevent injury.'
    },
    {
      slug: 'core_stability',
      type: 'SINGLE',
      title: '7. Core Stability Program',
      category: 'Posture & Core Stability',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
      intensityPct: 'Bodyweight / Moderate',
      reps: '12 - 20 Reps',
      sets: '2 - 3 Sets',
      rest: '0 - 60 Seconds',
      tempo: '3-3-1-0 (Isometric Hold)',
      recommendedDuration: '3 - 4 Weeks',
      targetAudience: 'Individuals with mild lower back discomfort or looking to improve pelvic and spinal stability.',
      biochemicalSignal: 'Transversus Abdominis & Multifidus Activation',
      desc: 'Trains deep core muscles to form a natural protective belt for the spine during heavy compound lifting.'
    },
    {
      slug: 'functional_training',
      type: 'SINGLE',
      title: '8. Functional Fitness Program',
      category: 'Daily Fitness & Movement',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800',
      intensityPct: '60% - 80% 1RM',
      reps: '8 - 15 Reps',
      sets: '3 - 5 Sets',
      rest: '60 - 90 Seconds',
      tempo: '2-0-2-0',
      recommendedDuration: '4 - 8 Weeks',
      targetAudience: 'General fitness enthusiasts and masters seeking mobility, motor coordination, and daily ease of movement.',
      biochemicalSignal: 'Neural Proprioception & Inter-Muscle Coordination',
      desc: 'Combines multi-joint movements in 3 planes of motion (Sagittal, Frontal, Transverse) for daily physical mobility efficiency.'
    },
    {
      slug: 'stabilization_endurance',
      type: 'SINGLE',
      title: '9. Stabilization & Joint Balance Program',
      category: 'Joint Balance',
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800',
      intensityPct: '50% - 70% 1RM',
      reps: '12 - 20 Reps',
      sets: '1 - 3 Sets',
      rest: '0 - 90 Seconds',
      tempo: '4-2-1-1 (Slow Stable Tempo)',
      recommendedDuration: '4 Weeks',
      targetAudience: 'Athletes seeking to correct shoulder, knee, or ankle joint instability.',
      biochemicalSignal: 'Joint Proprioceptors & Stabilizer Muscle Signaling',
      desc: 'Focuses on small stabilizer muscles using controlled tempo or moderate instability to lock joints securely.'
    },
    {
      slug: 'balance_agility',
      type: 'SINGLE',
      title: '10. Balance & Agility Program',
      category: 'Agility & Balance',
      badgeColor: 'bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-950 dark:text-lime-300 dark:border-lime-800',
      intensityPct: 'Bodyweight / Light',
      reps: '8 - 12 Reps',
      sets: '2 - 3 Sets',
      rest: '60 - 90 Seconds',
      tempo: 'Controlled',
      recommendedDuration: '2 - 4 Weeks',
      targetAudience: 'Field athletes and individuals training reaction speed and dynamic balance.',
      biochemicalSignal: 'Vestibular Reflex & Motor Control',
      desc: 'Trains the body to change direction rapidly without losing center of gravity balance.'
    },
    {
      slug: 'combo_hyper_strength',
      type: 'COMBO',
      title: '11. Combo: Hypertrophy ➔ Max Strength (8 Weeks)',
      category: '2-Phase Combo Program',
      badgeColor: 'bg-[#E63946] text-white font-bold',
      intensityPct: '75% ➔ 95% 1RM',
      reps: '12 Reps ➔ 2 Reps',
      sets: '4 Sets',
      rest: '90 - 300 Seconds',
      tempo: 'Progressive',
      recommendedDuration: '8 Weeks (4 Wks Hypertrophy + 4 Wks Strength)',
      targetAudience: 'Athletes looking to build muscle mass then convert it into peak 1RM strength.',
      biochemicalSignal: 'mTOR (Muscle Size) & CNS (Neural Strength) Synergy',
      desc: 'The most popular combination structure. Block 1 builds muscle cross-sectional area, then Block 2 converts new muscle mass into maximum strength.'
    },
    {
      slug: 'combo_aa_hyper_strength',
      type: 'COMBO',
      title: '12. Combo: Adaptation ➔ Hypertrophy ➔ Strength (12 Weeks)',
      category: '3-Phase Combo Program',
      badgeColor: 'bg-purple-600 text-white font-bold',
      intensityPct: '60% ➔ 85% ➔ 95% 1RM',
      reps: '15 ➔ 8 ➔ 3 Reps',
      sets: '3 - 5 Sets',
      rest: '60 - 240 Seconds',
      tempo: 'Structured Progressive',
      recommendedDuration: '12 Weeks Complete',
      targetAudience: 'Individuals seeking a total physical transformation safely from scratch to peak strength.',
      biochemicalSignal: 'Tri-Phase Physiology: Structure ➔ Synthesis ➔ Neural Recruitment',
      desc: 'Comprehensive 12-week program. Begins with joint adaptation (Month 1), muscle building (Month 2), culminating in max strength gains (Month 3).'
    },
    {
      slug: 'combo_endurance_hyper',
      type: 'COMBO',
      title: '13. Combo: Muscular Endurance ➔ Hypertrophy (8 Weeks)',
      category: '2-Phase Combo Program',
      badgeColor: 'bg-emerald-600 text-white font-bold',
      intensityPct: '55% ➔ 80% 1RM',
      reps: '20 Reps ➔ 8 Reps',
      sets: '3 - 4 Sets',
      rest: '45 - 90 Seconds',
      tempo: 'Controlled',
      recommendedDuration: '8 Weeks',
      targetAudience: 'Individuals wanting to burn fat while building muscle size and definition.',
      biochemicalSignal: 'AMPK (Fat Oxidation) & mTOR (Hypertrophy) Synergy',
      desc: 'Starts by increasing vascularization and calorie burn, followed by building dense muscle definition.'
    },
    {
      slug: 'custom_user_block',
      type: 'COMBO',
      title: '14. Custom Multi-Block Program',
      category: 'User Custom Design',
      badgeColor: 'bg-slate-800 text-white font-bold',
      intensityPct: 'Flexible 50% - 100%',
      reps: '1 - 25 Reps',
      sets: 'Custom',
      rest: 'Adjusted',
      tempo: 'Free',
      recommendedDuration: '1 - 24 Weeks (Configurable)',
      targetAudience: 'Coaches or experienced lifters requiring specific workout sequences.',
      biochemicalSignal: 'Adapted to Selected Block Sequence',
      desc: 'Full freedom to customize block sequence and weekly duration using the Custom Generator.'
    }
  ];

  const trainingProgramsCatalog = lang === 'en' ? trainingProgramsCatalogEN : trainingProgramsCatalogID;

  const toggleExpand = (slug) => {
    setExpandedProgramSlug(prev => prev === slug ? null : slug);
  };

  const filteredCatalog = trainingProgramsCatalog.filter(item => {
    if (catalogFilter === 'SINGLE') return item.type === 'SINGLE';
    if (catalogFilter === 'COMBO') return item.type === 'COMBO';
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 font-sans">
      
      {/* PAGE HEADER BANNER */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-[#EBE5E2] dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E63946] text-white font-extrabold flex items-center justify-center text-2xl shadow-md shadow-red-500/20 shrink-0">
            <span className="material-symbols-outlined text-2xl">menu_book</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#2B2B2B] dark:text-white tracking-tight">
              {lang === 'en' ? 'Exercise Science Guide & Program Catalog' : 'Panduan Dasar & Indeks Sains Latihan'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium mt-1">
              {lang === 'en'
                ? 'Select a guide tab below to view physiological specifications and detailed explanations.'
                : 'Klik pada salah satu menu program di bawah ini untuk membuka lembar spesifikasi fisiologis dan penjelasannya secara langsung.'
              }
            </p>
          </div>
        </div>

        {/* TOP INTERACTIVE TAB PILLS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-2.5 pt-3 border-t border-[#EBE5E2] dark:border-slate-800 w-full">
          {[
            { id: 'programs_catalog', label: lang === 'en' ? '14 Program Catalog' : 'Menu Katalog 14 Program', icon: 'widgets' },
            { id: '1rm_calculator', label: lang === 'en' ? '1RM Calculator & Testing' : 'Kalkulator 1RM & Cara Tes', icon: 'calculate' },
            { id: '1rm', label: lang === 'en' ? '1RM & Intensity Basics' : 'Dasar 1RM & Intensitas', icon: 'trending_up' },
            { id: 'periodization', label: lang === 'en' ? 'Periodization & Deload' : 'Periodisasi & Deload', icon: 'auto_awesome' },
            { id: 'ampk_mtor', label: lang === 'en' ? 'AMPK-mTOR Molecular' : 'Molekuler AMPK-mTOR', icon: 'bolt' },
            { id: 'safety', label: lang === 'en' ? 'Medical Safety Screening' : 'Skrining Keamanan Medis', icon: 'verified_user' },
            { id: 'glossary', label: lang === 'en' ? 'A-Z Sports Glossary' : 'Glosarium Istilah A-Z', icon: 'search' },
          ].map(tab => {
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center min-h-[56px] ${
                  isActive
                    ? 'bg-[#E63946] text-white border-[#E63946] shadow-md shadow-red-500/20 scale-[1.02]'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80'
                }`}
              >
                <span className="material-symbols-outlined text-lg shrink-0">{tab.icon}</span>
                <span className="text-[11px] sm:text-xs font-bold leading-tight whitespace-normal text-center">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 0: INTERACTIVE EXPANDABLE ACCORDION MENU CATALOG */}
      {activeSection === 'programs_catalog' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-[#EBE5E2] dark:border-slate-800 space-y-6 shadow-xs">
            
            {/* Header & Filter Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE5E2] dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#2B2B2B] dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#E63946]">widgets</span>
                  <span>{lang === 'en' ? 'Training Program Catalog (Click to Expand Details)' : 'Katalog Program Latihan (Klik Menu Untuk Buka Penjelasan)'}</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {lang === 'en' ? 'Click on any program title to expand/collapse full scientific specifications in-place.' : 'Klik pada judul program untuk membuka/menutup rincian lengkapnya secara langsung di tempat.'}
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 text-xs font-bold">
                {[
                  { id: 'ALL', label: lang === 'en' ? 'All (14)' : 'Semua (14)' },
                  { id: 'SINGLE', label: lang === 'en' ? 'Single Phase (10)' : 'Fase Tunggal (10)' },
                  { id: 'COMBO', label: lang === 'en' ? 'Combo & Custom (4)' : 'Kombinasi & Kustom (4)' },
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setCatalogFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      catalogFilter === f.id
                        ? 'bg-[#E63946] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* EXPANDABLE ACCORDION LIST OF PROGRAM CARDS */}
            <div className="space-y-4">
              {filteredCatalog.map((prog) => {
                const isExpanded = expandedProgramSlug === prog.slug;
                return (
                  <div
                    key={prog.slug}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isExpanded
                        ? 'bg-white dark:bg-slate-900 border-[#E63946] ring-2 ring-red-500/20 shadow-md'
                        : 'bg-slate-50/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {/* Clickable Card Header Bar */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(prog.slug)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                          isExpanded ? 'bg-[#E63946] text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                        }`}>
                          <span className="material-symbols-outlined text-xl">
                            {isExpanded ? 'keyboard_arrow_down' : 'chevron_right'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                              {prog.title}
                            </h3>
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${prog.badgeColor}`}>
                              {prog.category}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 font-mono font-medium">
                            {lang === 'en' ? 'Intensity: ' : 'Intensitas: '}<strong className="text-[#E63946]">{prog.intensityPct}</strong> • Reps: <strong>{prog.reps}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isExpanded
                            ? 'bg-[#E63946] text-white shadow-xs'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300'
                        }`}>
                          {isExpanded ? (lang === 'en' ? 'Close Details ▲' : 'Tutup Rincian ▲') : (lang === 'en' ? 'View Details ▼' : 'Buka Penjelasan ▼')}
                        </span>
                      </div>
                    </button>

                    {/* EXPANDED IN-PLACE DETAILS PANEL */}
                    {isExpanded && (
                      <div className="p-5 sm:p-6 bg-slate-50/90 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 space-y-5 animate-fadeIn">
                        
                        {/* Description Paragraph */}
                        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                          <h4 className="font-extrabold text-xs text-[#E63946] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base">info</span>
                            {lang === 'en' ? 'Description & Scientific Principles:' : 'Deskripsi & Prinsip Fisiologis:'}
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                            {prog.desc}
                          </p>
                        </div>

                        {/* 4-Grid Scientific Specifications */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                          <div>
                            <span className="text-slate-400 font-bold block text-[10px] uppercase">{lang === 'en' ? 'Target Intensity' : 'Target Intensitas'}</span>
                            <strong className="text-[#E63946] dark:text-red-400 font-mono font-black text-sm block mt-0.5">{prog.intensityPct}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold block text-[10px] uppercase">{lang === 'en' ? 'Repetition Range' : 'Rentang Repetisi'}</span>
                            <strong className="text-slate-900 dark:text-white font-mono font-black text-sm block mt-0.5">{prog.reps}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold block text-[10px] uppercase">{lang === 'en' ? 'Total Sets' : 'Jumlah Set'}</span>
                            <strong className="text-slate-900 dark:text-white font-mono font-black text-sm block mt-0.5">{prog.sets}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold block text-[10px] uppercase">{lang === 'en' ? 'Rest Interval' : 'Jeda Istirahat'}</span>
                            <strong className="text-[#F3722C] font-mono font-black text-sm block mt-0.5">{prog.rest}</strong>
                          </div>
                        </div>

                        {/* Target Audience & Biochemical Signal Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                            <span className="text-slate-400 font-bold text-[10px] uppercase block">{lang === 'en' ? 'Target Audience' : 'Target Atlet / Pengguna'}</span>
                            <p className="text-slate-800 dark:text-slate-200 font-semibold leading-relaxed">{prog.targetAudience}</p>
                          </div>
                          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                            <span className="text-slate-400 font-bold text-[10px] uppercase block">{lang === 'en' ? 'Cellular Signal & Tempo' : 'Sinyal Biokimia Seluler & Tempo'}</span>
                            <p className="text-emerald-700 dark:text-emerald-400 font-semibold leading-relaxed">
                              {prog.biochemicalSignal} • Tempo: <strong className="font-mono text-[#E63946]">{prog.tempo}</strong>
                            </p>
                          </div>
                        </div>

                        {/* Footer Action inside expanded item */}
                        <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-t border-slate-200/80 dark:border-slate-700/80">
                          <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                            {lang === 'en' ? 'Recommended Duration: ' : 'Rekomendasi Durasi Latihan: '}<strong className="text-slate-900 dark:text-white font-bold">{prog.recommendedDuration}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={onStartWizard}
                            className="px-6 py-2.5 bg-[#E63946] hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-500/20 transition-all cursor-pointer flex items-center gap-2 active:scale-95 shrink-0"
                          >
                            <span className="material-symbols-outlined text-base">auto_awesome</span>
                            <span>{lang === 'en' ? 'Create This Program in Wizard' : 'Buat Program Ini di Generator Wizard'}</span>
                          </button>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* SECTION 1: 1RM CALCULATOR & DETAILED METHODOLOGY GUIDE */}
      {activeSection === '1rm_calculator' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-[#EBE5E2] dark:border-slate-800 space-y-8 shadow-xs">
            
            {/* Header & Quick Action Buttons */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE5E2] dark:border-slate-800 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 text-[#E63946] dark:text-red-400 font-bold flex items-center justify-center text-xl shrink-0">
                  <span className="material-symbols-outlined">calculate</span>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#2B2B2B] dark:text-white tracking-tight">
                    {lang === 'en' ? '1RM Calculator & Science Methodology Guide' : 'Kalkulator 1RM Interaktif & Panduan Metodologi Sains'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {lang === 'en' 
                      ? 'Detailed explanation of 1RM physiology, 3 testing methods, warm-up protocols, and quick calculator.' 
                      : 'Penjelasan mendalam fisiologi 1RM, 3 metode tes beban, protokol keamanan pemanasan, dan simulasi kalkulator.'}
                  </p>
                </div>
              </div>

              {/* Navigation Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('calculator')}
                  className="px-4 py-2.5 bg-[#E63946] hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-red-500/20 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <span className="material-symbols-outlined text-base">calculate</span>
                  <span>{lang === 'en' ? 'Open Standalone 1RM Calculator Menu' : 'Buka Halaman Kalkulator 1RM Standalone'}</span>
                </button>
                <button
                  type="button"
                  onClick={onStartWizard}
                  className="px-4 py-2.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <span className="material-symbols-outlined text-base">bolt</span>
                  <span>{lang === 'en' ? 'Create Program' : 'Buat Program'}</span>
                </button>
              </div>
            </div>

            {/* Quick Interactive Calculator Box inside Guide */}
            <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#E63946]">tune</span>
                  <span>{lang === 'en' ? 'Quick 1RM Interactive Estimator' : 'Simulasi Kalkulator 1RM Cepat'}</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-[#E63946] dark:bg-red-950 dark:text-red-300">
                  {lang === 'en' ? 'Epley & Brzycki Model' : 'Model Epley & Brzycki'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    {lang === 'en' ? 'Lifted Weight (kg):' : 'Beban Terangkat (kg):'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(e.target.value)}
                    placeholder={lang === 'en' ? 'e.g. 60' : 'Misal: 60'}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 font-extrabold text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#E63946] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    {lang === 'en' ? 'Repetitions Completed:' : 'Jumlah Repetisi Terangkat:'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={calcReps}
                    onChange={(e) => setCalcReps(e.target.value ? Math.min(30, Math.max(1, parseInt(e.target.value) || 1)) : '')}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 font-extrabold text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#E63946] outline-none"
                  />
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-[10px] font-extrabold text-slate-400 block uppercase">{lang === 'en' ? 'Est. 1RM Capacity' : 'Estimasi Kapasitas 1RM'}</span>
                  {(() => {
                    const wVal = parseFloat(calcWeight) || 0;
                    const rVal = parseInt(calcReps) || 0;
                    if (wVal <= 0 || rVal <= 0) {
                      return (
                        <>
                          <span className="text-2xl font-black text-slate-400 dark:text-slate-600 tracking-tight block">0 kg</span>
                          <span className="text-[10px] text-slate-400 font-medium">Epley: 0 kg | Brzycki: 0 kg</span>
                        </>
                      );
                    }
                    const ep = Math.round(wVal * (1 + rVal / 30));
                    const brz = Math.round(wVal / (1.0278 - 0.0278 * rVal));
                    const avg = Math.round((ep + brz) / 2);
                    return (
                      <>
                        <span className="text-2xl font-black text-[#E63946] tracking-tight block">{avg} kg</span>
                        <span className="text-[10px] text-slate-500 font-medium">Epley: {ep} kg | Brzycki: {brz} kg</span>
                      </>
                    );
                  })()}
                </div>

                <div className="text-center sm:text-right">
                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate('calculator')}
                    className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-base">table_chart</span>
                    <span>{lang === 'en' ? 'Full % 1RM Table' : 'Lihat Tabel % 1RM Lengkap'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* DETAILED SCIENTIFIC METHODOLOGY GUIDELINES */}
            <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              
              {/* 1. APA ITU 1RM */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-2">
                <h3 className="font-extrabold text-base text-[#E63946] flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">info</span>
                  <span>{lang === 'en' ? '1. Concept & Physiology of 1RM (One Repetition Maximum)' : '1. Konsep & Fisiologi 1RM (One Repetition Maximum)'}</span>
                </h3>
                <p>
                  {lang === 'en'
                    ? '1RM (One Repetition Maximum) represents the absolute maximum weight a muscle group can lift for exactly ONE full repetition with proper execution mechanics and full range of motion. In exercise physiology, 1RM is the international gold standard for prescribing training intensity (% 1RM).'
                    : '1RM (One Repetition Maximum) adalah beban maksimum teoritis maupun aktual yang dapat diangkat oleh grup otot untuk tepat 1 repetisi penuh dengan teknik yang benar dan rentang gerak penuh (Full Range of Motion). Dalam sains fisiologi olahraga, 1RM merupakan tolok ukur standar emas internasional untuk menentukan tingkat pembebanan preskripsi (%1RM).'
                  }
                </p>
              </div>

              {/* 2. 3 METODE TES 1RM */}
              <div className="space-y-3">
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="material-symbols-outlined text-[#E63946]">science</span>
                  <span>{lang === 'en' ? '2. The 3 Standard Methods for Determining 1RM' : '2. Tiga Metode Standar Penentuan 1RM'}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Method 1 */}
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center gap-2 text-[#E63946] font-bold text-xs">
                      <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center text-[11px]">A</span>
                      <span>{lang === 'en' ? 'Submaximal Formula (Recommended)' : 'Formula Sub-Maksimal (Paling Direkomendasikan)'}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {lang === 'en'
                        ? 'Lifting a submaximal weight (3 - 10 reps) to momentary failure, then using the Epley or Brzycki mathematical formulas. 99% safe and avoids heavy joint strain.'
                        : 'Mengangkat beban sub-maksimal (3 - 10 repetisi) hingga batas kemampuan, kemudian dihitung dengan rumus Epley atau Brzycki. Sangat aman dan bebas risiko cedera sendi.'
                      }
                    </p>
                    <div className="p-2 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-700 dark:text-slate-300">
                      Epley: W × (1 + R/30)<br/>
                      Brzycki: W / (1.0278 - 0.0278×R)
                    </div>
                  </div>

                  {/* Method 2 */}
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center gap-2 text-amber-600 font-bold text-xs">
                      <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-[11px]">B</span>
                      <span>{lang === 'en' ? 'Direct Maximal Testing' : 'Tes Maksimal Langsung (Direct 1RM Test)'}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {lang === 'en'
                        ? 'Progressively increasing weight until finding the 1-rep limit. Requires mandatory experienced spotter supervision and thorough warm-up protocols.'
                        : 'Mengangkat beban puncak secara bertahap hingga menemukan batas 1 repetisi penuh. Wajib didampingi spotter profesional dan pemanasan ketat.'
                      }
                    </p>
                    <div className="p-2 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-700 dark:text-slate-300">
                      Ramp Protocol Required<br/>
                      Rest 3-5 mins per attempt
                    </div>
                  </div>

                  {/* Method 3 */}
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-[11px]">C</span>
                      <span>{lang === 'en' ? 'RPE / RIR Subjective Scale' : 'Estimasi Subyektif Skala RPE / RIR'}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {lang === 'en'
                        ? 'Estimating 1RM based on Rate of Perceived Exertion (RPE 1-10) or Reps in Reserve (RIR). Ideal for athletes with active medical clearance limits.'
                        : 'Menilai sisa repetisi cadangan (RPE 1-10) untuk mengestimasi 1RM tanpa harus mengangkat beban hingga batas gagal fisik.'
                      }
                    </p>
                    <div className="p-2 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-700 dark:text-slate-300">
                      RPE 10 = 0 RIR (100% Max)<br/>
                      RPE 9 = 1 RIR (~95% Max)
                    </div>
                  </div>

                </div>
              </div>

              {/* 3. PROTOKOL PEMANASAN */}
              <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h3 className="font-extrabold text-sm text-[#E63946] flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">fitness_center</span>
                  <span>{lang === 'en' ? '3. Standard 1RM Warm-Up Ramp Protocol' : '3. Protokol Pemanasan Berperingkat Sebelum Tes 1RM'}</span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-200">
                      <tr>
                        <th className="px-3 py-2 rounded-l-lg">Set</th>
                        <th className="px-3 py-2">{lang === 'en' ? 'Load Intensity (% 1RM)' : 'Intensitas Beban (% 1RM)'}</th>
                        <th className="px-3 py-2">{lang === 'en' ? 'Target Reps' : 'Target Repetisi'}</th>
                        <th className="px-3 py-2">{lang === 'en' ? 'Rest Interval' : 'Jeda Istirahat'}</th>
                        <th className="px-3 py-2 rounded-r-lg">{lang === 'en' ? 'Physiological Purpose' : 'Tujuan Fisiologis'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      <tr>
                        <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">Set 1</td>
                        <td className="px-3 py-2 font-bold text-[#E63946]">50% 1RM</td>
                        <td className="px-3 py-2">10 Reps</td>
                        <td className="px-3 py-2">60s</td>
                        <td className="px-3 py-2 text-slate-500">{lang === 'en' ? 'General blood flow & synovial fluid activation' : 'Aliran darah umum & pelumasan cairan sendi'}</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">Set 2</td>
                        <td className="px-3 py-2 font-bold text-[#E63946]">70% 1RM</td>
                        <td className="px-3 py-2">5 Reps</td>
                        <td className="px-3 py-2">90s</td>
                        <td className="px-3 py-2 text-slate-500">{lang === 'en' ? 'Specific neural drive activation' : 'Aktivasi unit motorik spesifik'}</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">Set 3</td>
                        <td className="px-3 py-2 font-bold text-[#E63946]">85% 1RM</td>
                        <td className="px-3 py-2">3 Reps</td>
                        <td className="px-3 py-2">120s</td>
                        <td className="px-3 py-2 text-slate-500">{lang === 'en' ? 'Post-Activation Potentiation (PAP)' : 'Potensiasi Saraf Beban Berat (PAP)'}</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">Set 4</td>
                        <td className="px-3 py-2 font-bold text-[#E63946]">95% 1RM</td>
                        <td className="px-3 py-2">1 Rep</td>
                        <td className="px-3 py-2">180s</td>
                        <td className="px-3 py-2 text-slate-500">{lang === 'en' ? 'Acclimatization before max attempt' : 'Aklimatisasi mental & ketegangan otot'}</td>
                      </tr>
                      <tr className="bg-red-50/50 dark:bg-red-950/20">
                        <td className="px-3 py-2 font-black text-red-600">Percobaan 1RM</td>
                        <td className="px-3 py-2 font-black text-red-600">100% 1RM</td>
                        <td className="px-3 py-2 font-bold">1 Rep</td>
                        <td className="px-3 py-2 font-bold">3 - 5 Menit</td>
                        <td className="px-3 py-2 text-red-700 dark:text-red-400 font-bold">{lang === 'en' ? 'Peak 1RM Attempt' : 'Pengujian 1 Repetisi Maksimal Puncak'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. TABEL PERSENTASE & ADAPTASI */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3">
                <h3 className="font-extrabold text-sm text-[#E63946] flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">trending_up</span>
                  <span>{lang === 'en' ? '4. % 1RM Intensity Continuum & Physiological Adaptations' : '4. Tabel Persentase %1RM & Zona Adaptasi Fisiologis'}</span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-200 dark:bg-slate-700 font-bold text-slate-800 dark:text-slate-100">
                      <tr>
                        <th className="px-3 py-2 rounded-l-lg">% 1RM</th>
                        <th className="px-3 py-2">{lang === 'en' ? 'Max Reps' : 'Repetisi Maksimal'}</th>
                        <th className="px-3 py-2">{lang === 'en' ? 'Adaptation Zone' : 'Zona Adaptasi'}</th>
                        <th className="px-3 py-2 rounded-r-lg">{lang === 'en' ? 'Cellular Effect' : 'Efek Biologis Seluler'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700 font-medium">
                      <tr>
                        <td className="px-3 py-2 font-bold text-red-600">90% - 100%</td>
                        <td className="px-3 py-2 font-bold">1 - 3 Reps</td>
                        <td className="px-3 py-2 text-red-600 font-bold">Max Strength & Power</td>
                        <td className="px-3 py-2 text-slate-600 dark:text-slate-300">Rekrutmen serat otot Tipe IIx & sinyal saraf pusat (CNS)</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-bold text-orange-600">75% - 85%</td>
                        <td className="px-3 py-2 font-bold">6 - 10 Reps</td>
                        <td className="px-3 py-2 text-orange-600 font-bold">Hypertrophy (Ukuran Otot)</td>
                        <td className="px-3 py-2 text-slate-600 dark:text-slate-300">Aktivasi jalur molekuler mTOR & sintesis protein selular</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-bold text-emerald-600">60% - 70%</td>
                        <td className="px-3 py-2 font-bold">12 - 15 Reps</td>
                        <td className="px-3 py-2 text-emerald-600 font-bold">Strength Endurance</td>
                        <td className="px-3 py-2 text-slate-600 dark:text-slate-300">Peningkatan kapiler vaskular & toleransi laktat</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-bold text-blue-600">50% - 60%</td>
                        <td className="px-3 py-2 font-bold">15 - 20+ Reps</td>
                        <td className="px-3 py-2 text-blue-600 font-bold">Anatomical Adaptation</td>
                        <td className="px-3 py-2 text-slate-600 dark:text-slate-300">Penguatan ligamen, tendon, matriks tulang & pencegahan cedera</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {activeSection === '1rm' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-[#EBE5E2] dark:border-slate-800 space-y-6 shadow-xs">
            <div className="flex items-center gap-3 border-b border-[#EBE5E2] dark:border-slate-800 pb-4">
              <span className="material-symbols-outlined text-2xl text-[#E63946]">trending_up</span>
              <div>
                <h2 className="text-xl font-extrabold text-[#2B2B2B] dark:text-white">
                  {lang === 'en' ? '1RM & Intensity' : '1RM & Intensitas'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {lang === 'en' ? 'Understanding the relationship between load, reps, and training adaptation.' : 'Memahami hubungan antara beban, repetisi, dan adaptasi latihan.'}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="font-extrabold text-sm text-[#E63946] mb-2">
                  {lang === 'en' ? 'What is 1RM?' : 'Apa itu 1RM?'}
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {lang === 'en' 
                    ? '1RM (One Repetition Maximum) is the maximum amount of weight you can lift for a single repetition of a given exercise through a full range of motion. It serves as the baseline for determining the intensity (percentage of 1RM) required to elicit specific physiological adaptations, such as strength, hypertrophy, or endurance.'
                    : '1RM (One Repetition Maximum) adalah beban maksimal yang dapat Anda angkat untuk satu repetisi penuh pada suatu gerakan. Angka ini menjadi tolok ukur utama untuk menentukan intensitas (persentase dari 1RM) yang dibutuhkan agar tercapai adaptasi fisiologis spesifik seperti kekuatan, hipertrofi, atau daya tahan.'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
                <h4 className="font-extrabold text-sm text-[#E63946] mb-3">
                  {lang === 'en' ? 'Intensity Zones & Adaptations' : 'Zona Intensitas & Adaptasi'}
                </h4>
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-200 dark:bg-slate-700">
                    <tr>
                      <th className="px-4 py-2 rounded-tl-lg">{lang === 'en' ? 'Intensity (% 1RM)' : 'Intensitas (% 1RM)'}</th>
                      <th className="px-4 py-2">{lang === 'en' ? 'Rep Range' : 'Rentang Repetisi'}</th>
                      <th className="px-4 py-2 rounded-tr-lg">{lang === 'en' ? 'Primary Training Effect' : 'Efek Latihan Utama'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    <tr className="bg-white dark:bg-slate-900">
                      <td className="px-4 py-3 font-bold text-orange-600">85% - 100%</td>
                      <td className="px-4 py-3 text-slate-800 dark:text-slate-200">1 - 5</td>
                      <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{lang === 'en' ? 'Maximum Strength / Power' : 'Kekuatan Maksimal / Daya Ledak'}</td>
                    </tr>
                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                      <td className="px-4 py-3 font-bold text-red-600">75% - 85%</td>
                      <td className="px-4 py-3 text-slate-800 dark:text-slate-200">6 - 12</td>
                      <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{lang === 'en' ? 'Hypertrophy (Muscle Size)' : 'Hipertrofi (Ukuran Otot)'}</td>
                    </tr>
                    <tr className="bg-white dark:bg-slate-900">
                      <td className="px-4 py-3 font-bold text-emerald-600">50% - 75%</td>
                      <td className="px-4 py-3 text-slate-800 dark:text-slate-200">12 - 25+</td>
                      <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{lang === 'en' ? 'Muscular Endurance' : 'Daya Tahan Otot'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'periodization' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-[#EBE5E2] dark:border-slate-800 space-y-6 shadow-xs">
            <div className="flex items-center gap-3 border-b border-[#EBE5E2] dark:border-slate-800 pb-4">
              <span className="material-symbols-outlined text-2xl text-[#E63946]">auto_awesome</span>
              <div>
                <h2 className="text-xl font-extrabold text-[#2B2B2B] dark:text-white">
                  {lang === 'en' ? 'Periodization & Deload' : 'Periodisasi & Deload'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {lang === 'en' ? 'Structuring training over time to maximize adaptations and avoid overtraining.' : 'Penataan struktur latihan seiring waktu untuk memaksimalkan adaptasi dan menghindari overtraining.'}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="font-extrabold text-sm text-[#E63946] mb-2">
                  {lang === 'en' ? 'What is Periodization?' : 'Apa itu Periodisasi?'}
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {lang === 'en' 
                    ? 'Periodization is the systematic planning of athletic or physical training. The aim is to reach the best possible performance in the most important competition of the year. It involves progressive cycling of various aspects of a training program during a specific period. Common models include Linear (gradual increase in intensity/decrease in volume), Undulating/DUP (frequent variation of volume/intensity), and Block (focusing on one specific adaptation for a block of time).'
                    : 'Periodisasi adalah perencanaan sistematis dalam latihan fisik. Tujuannya adalah untuk mencapai performa terbaik pada waktu yang tepat. Ini melibatkan variasi progresif dari berbagai aspek program latihan. Model umum meliputi Linear (peningkatan intensitas bertahap dengan penurunan volume), Undulating/DUP (variasi volume/intensitas yang lebih sering), dan Block (fokus pada satu adaptasi spesifik selama satu blok waktu tertentu).'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="font-extrabold text-sm text-[#E63946] mb-2">
                  {lang === 'en' ? 'Mesocycle Structure & Deloads' : 'Struktur Mesosiklus & Deload'}
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                  {lang === 'en'
                    ? 'A typical training block (mesocycle) lasts 4-6 weeks and progresses through distinct phases: Accumulation (building volume), Intensification (increasing weight), and Realization (peaking). Following this, a Deload is essential.'
                    : 'Sebuah blok latihan (mesosiklus) tipikal berlangsung selama 4-6 minggu dengan fase: Akumulasi (peningkatan volume), Intensifikasi (peningkatan beban), dan Realisasi (puncak performa). Setelah itu, minggu Deload sangatlah krusial.'}
                </p>
                <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white mb-1">
                    {lang === 'en' ? 'Why Deload?' : 'Mengapa Harus Deload?'}
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {lang === 'en'
                      ? 'A deload is a planned reduction in training volume/intensity. It is crucial for Central Nervous System (CNS) recovery, tissue repair, and facilitating supercompensation—which is when your body grows back stronger after fatigue has dissipated.'
                      : 'Deload adalah pengurangan volume/intensitas latihan yang direncanakan. Sangat penting untuk pemulihan Sistem Saraf Pusat (CNS), perbaikan jaringan, dan memfasilitasi superkompensasi—yaitu fase di mana tubuh Anda berkembang menjadi lebih kuat setelah kelelahan menghilang.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'ampk_mtor' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-[#EBE5E2] dark:border-slate-800 space-y-6 shadow-xs">
            <div className="flex items-center gap-3 border-b border-[#EBE5E2] dark:border-slate-800 pb-4">
              <span className="material-symbols-outlined text-2xl text-[#E63946]">bolt</span>
              <div>
                <h2 className="text-xl font-extrabold text-[#2B2B2B] dark:text-white">
                  {lang === 'en' ? 'AMPK-mTOR Molecular Signals' : 'Sinyal Molekuler AMPK-mTOR'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {lang === 'en' ? 'The interference effect and cellular signaling pathways in concurrent training.' : 'Efek interferensi dan jalur sinyal seluler pada latihan konkuren.'}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <h4 className="font-extrabold text-sm text-emerald-700 dark:text-emerald-400 mb-2">
                    {lang === 'en' ? 'AMPK Pathway' : 'Jalur AMPK'}
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    {lang === 'en'
                      ? 'Activated by endurance training, high repetition work, or energy depletion. It stimulates mitochondrial biogenesis and fat oxidation but acts as a catabolic signal that can inhibit muscle growth processes.'
                      : 'Diaktifkan oleh latihan kardio/daya tahan, repetisi tinggi, atau kelelahan energi. Memicu biogenesis mitokondria dan oksidasi lemak, tetapi bersifat katabolik sehingga dapat menghambat proses pertumbuhan otot.'}
                  </p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800">
                  <h4 className="font-extrabold text-sm text-red-700 dark:text-red-400 mb-2">
                    {lang === 'en' ? 'mTOR Pathway' : 'Jalur mTOR'}
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    {lang === 'en'
                      ? 'Activated by heavy resistance training, mechanical tension, and protein consumption. It is the primary anabolic signal responsible for muscle protein synthesis and hypertrophy (muscle growth).'
                      : 'Diaktifkan oleh latihan beban berat, tegangan mekanis, dan konsumsi protein. Merupakan sinyal anabolik utama yang bertanggung jawab atas sintesis protein otot dan hipertrofi (pembesaran otot).'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="font-extrabold text-sm text-[#E63946] mb-2">
                  {lang === 'en' ? 'The Interference Effect' : 'Efek Interferensi'}
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {lang === 'en'
                    ? 'When performing concurrent training (e.g., intensive cardio right before or after heavy lifting), AMPK activation can biochemically "block" or reduce mTOR activation. This means intense endurance work can blunt muscle growth. Practical implication: Separate endurance and hypertrophy sessions by at least 6-8 hours, or perform them on different days if maximum muscle growth is the goal.'
                    : 'Saat melakukan latihan konkuren (kardio intens bersamaan dengan angkat beban), aktivasi AMPK dapat "memblokir" atau mengurangi aktivasi mTOR. Artinya, kardio yang intens dapat menghambat pertumbuhan otot. Implikasi praktis: Pisahkan sesi kardio dan angkat beban minimal 6-8 jam, atau lakukan pada hari berbeda jika tujuan utamanya adalah pertumbuhan otot maksimal.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'safety' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-[#EBE5E2] dark:border-slate-800 space-y-6 shadow-xs">
            <div className="flex items-center gap-3 border-b border-[#EBE5E2] dark:border-slate-800 pb-4">
              <span className="material-symbols-outlined text-2xl text-[#E63946]">verified_user</span>
              <div>
                <h2 className="text-xl font-extrabold text-[#2B2B2B] dark:text-white">
                  {lang === 'en' ? 'Medical Safety Screening' : 'Skrining Keamanan Medis'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {lang === 'en' ? 'Physical Activity Readiness Protocol to ensure athlete safety.' : 'Protokol kesiapan aktivitas fisik untuk mengutamakan keamanan atlet.'}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="font-extrabold text-sm text-[#E63946] mb-2">
                  {lang === 'en' ? 'What is Medical Safety Screening?' : 'Apa itu Skrining Keamanan Medis?'}
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                  {lang === 'en'
                    ? 'Medical safety screening is used to determine if an individual is physically ready to begin a new exercise program. It helps identify underlying health conditions that might require medical clearance or program modifications before training.'
                    : 'Skrining keamanan medis digunakan untuk menentukan apakah seseorang secara fisik siap memulai program latihan baru. Ini membantu mengidentifikasi kondisi kesehatan yang mungkin memerlukan persetujuan dokter atau penyesuaian program sebelum berlatih.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                  <span className="font-bold text-emerald-600 block mb-1">🟢 {lang === 'en' ? 'CLEAR' : 'AMAN'}</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {lang === 'en' 
                      ? 'No health issues reported. Fully cleared for all intensities and programs, including high-intensity 1RM testing.'
                      : 'Tidak ada masalah kesehatan. Aman untuk semua program dan intensitas, termasuk tes 1RM beban maksimal.'}
                  </p>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <span className="font-bold text-amber-600 block mb-1">🟡 {lang === 'en' ? 'MODIFIED' : 'MODIFIKASI'}</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {lang === 'en' 
                      ? 'Minor joint or metabolic issues. Program caps intensity, avoids extreme axial loading, and extends rest periods.'
                      : 'Ada masalah sendi atau metabolik ringan. Program akan membatasi intensitas, menghindari beban tulang belakang berlebih, dan memperpanjang istirahat.'}
                  </p>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 rounded-xl">
                  <span className="font-bold text-red-600 block mb-1">🔴 {lang === 'en' ? 'HARD STOP' : 'TUNDA LATIHAN'}</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {lang === 'en' 
                      ? 'Serious cardiovascular or acute issues. Medical clearance from a physician is strictly required before proceeding.'
                      : 'Masalah kardiovaskular atau akut yang serius. Wajib mendapatkan izin dari dokter sebelum memulai program apa pun.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'glossary' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-[#EBE5E2] dark:border-slate-800 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE5E2] dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-[#E63946]">search</span>
                <div>
                  <h2 className="text-xl font-extrabold text-[#2B2B2B] dark:text-white">
                    {lang === 'en' ? 'A-Z Sports Science Glossary' : 'Glosarium Sains Olahraga A-Z'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {lang === 'en' ? 'Search definitions for common exercise terminology.' : 'Cari definisi istilah-istilah umum dalam latihan fisik.'}
                  </p>
                </div>
              </div>
              <input
                type="text"
                placeholder={lang === 'en' ? 'Search terms...' : 'Cari istilah...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946] text-slate-900 dark:text-white"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 max-h-[500px] overflow-y-auto pr-2">
              {[
                { term: '1RM (One Rep Max)', en: 'The absolute maximum weight you can lift for a single repetition with proper form.', id: 'Beban maksimal mutlak yang bisa Anda angkat untuk satu repetisi dengan postur tubuh yang benar.' },
                { term: 'AMPK', en: 'An enzyme that senses cellular energy depletion. Signals endurance adaptations but can blunt muscle growth.', id: 'Enzim yang mendeteksi penurunan energi sel. Memberi sinyal adaptasi daya tahan tetapi bisa menghambat otot membesar.' },
                { term: 'Concentric', en: 'The lifting phase of an exercise where the muscle shortens (e.g., pushing the bar up in a bench press).', id: 'Fase mengangkat pada latihan di mana otot memendek (misal: mendorong barbel ke atas saat bench press).' },
                { term: 'Deload', en: 'A scheduled period of lighter training volume or intensity to allow the body to recover fully.', id: 'Periode latihan dengan volume atau intensitas lebih ringan untuk memberikan waktu tubuh memulihkan diri.' },
                { term: 'Eccentric', en: 'The lowering phase of an exercise where the muscle lengthens under tension.', id: 'Fase menurunkan beban di mana otot memanjang sambil tetap menahan beban.' },
                { term: 'Hypertrophy', en: 'The increase in the size of muscle cells, leading to larger overall muscle mass.', id: 'Peningkatan ukuran sel-sel otot yang menghasilkan massa otot yang lebih besar secara keseluruhan.' },
                { term: 'Mesocycle', en: 'A specific training block, usually lasting 4-6 weeks, designed to achieve a particular physical adaptation.', id: 'Blok latihan spesifik, biasanya berlangsung 4-6 minggu, dirancang untuk mencapai satu target fisik.' },
                { term: 'mTOR', en: 'A protein pathway that serves as the central regulator of cell metabolism, growth, and muscle protein synthesis.', id: 'Jalur protein yang bertindak sebagai pengatur utama metabolisme sel dan sintesis protein otot.' },
                { term: 'Periodization', en: 'The systematic planning of athletic training to achieve the best performance at a given time.', id: 'Perencanaan latihan secara sistematis dan terstruktur untuk mencapai performa terbaik pada waktu tertentu.' },
                { term: 'Progressive Overload', en: 'Gradually increasing the weight, frequency, or number of repetitions in your strength training routine.', id: 'Secara bertahap menambah beban, frekuensi, atau jumlah repetisi dalam rutinitas latihan Anda.' },
                { term: 'RPE (Rate of Perceived Exertion)', en: 'A subjective scale from 1-10 measuring how hard an exercise feels.', id: 'Skala subjektif dari 1-10 untuk mengukur seberapa berat atau melelahkan suatu latihan terasa.' },
                { term: 'Supercompensation', en: 'The post-training period during which the trained function has a higher performance capacity than it did prior to the training period.', id: 'Fase pasca-latihan di mana kapasitas performa tubuh meningkat melampaui kemampuan aslinya sebelum latihan.' },
                { term: 'Tempo', en: 'The speed at which an exercise is performed, usually written as a 4-digit number (e.g., 2-0-2-0).', id: 'Kecepatan atau irama pelaksanaan satu gerakan latihan, biasa ditulis 4 angka (contoh: 2-0-2-0).' },
                { term: 'Time Under Tension (TUT)', en: 'The total amount of time a muscle is actively working and under stress during a set.', id: 'Total durasi waktu saat otot secara aktif bekerja dan berada dalam tekanan selama satu set.' },
                { term: 'Volume', en: 'The total amount of work performed, calculated as Sets × Reps × Weight.', id: 'Total beban kerja yang dilakukan dalam latihan, dihitung dari Set × Repetisi × Beban.' }
              ]
                .filter(item => item.term.toLowerCase().includes(searchTerm.toLowerCase()) || item.en.toLowerCase().includes(searchTerm.toLowerCase()) || item.id.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h5 className="font-extrabold text-sm text-[#E63946] mb-1">{item.term}</h5>
                    <p className="text-xs text-slate-700 dark:text-slate-300">{lang === 'en' ? item.en : item.id}</p>
                  </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GuidePage;
