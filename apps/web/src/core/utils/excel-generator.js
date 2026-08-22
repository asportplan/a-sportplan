import { tUI, tExercise, tPhase, tPattern, tMessage } from './i18n.js';
import { formatRestInterval, formatLoad } from './helpers.js';

/**
 * Generate an Excel workbook from the training program
 * @param {Object} program - The generated program from rule engine
 */
export function generateExcel(program) {
  if (!program) {
    alert('Data program tidak ditemukan.');
    return;
  }

  if (!window.XLSX) {
    alert('Library SheetJS (XLSX) belum siap. Silakan coba beberapa saat lagi.');
    return;
  }

  try {
    const XLSX = window.XLSX;
    const wb = XLSX.utils.book_new();
    const meta = program.metadata || {};

    // ─── Sheet 1: Program Overview / Metadata ───
    const overviewData = [
      ['GENERATOR PROGRAM LATIHAN BEBAN — RINGKASAN PROGRAM'],
      [],
      ['Metrik', 'Nilai'],
      ['Usia Atlet', meta.user_age || 25],
      ['Level Pengalaman', meta.training_age_level ? (tUI('level_' + meta.training_age_level.toLowerCase()) || meta.training_age_level) : 'Beginner'],
      ['Durasi Program (Minggu)', meta.duration_weeks || 8],
      ['Target Kenaikan 1RM (%)', `+${meta.target_1rm_increase_pct || 10}%`],
      ['Jumlah Hari / Minggu', meta.days_per_week || 3],
      ['Fokus Program', (meta.selected_goals || []).map((g) => tPhase(g) || g).join(', ')],
      ['Strategi Periodisasi', program.periodization?.strategy === 'SEQUENTIAL' ? 'Sequential Block' : 'Daily Undulating (DUP)'],
      ['Validasi Target 1RM', program.target_validation?.status || 'REALISTIC'],
      ['Status Skrining Medis', program.medical_screening?.clearance_status || 'CLEAR'],
      ['Jumlah Alat Tersedia', meta.equipment_count || 0],
      ['Tanggal Generate', new Date(program.generated_at || Date.now()).toLocaleString()],
      [],
      ['PROYEKSI VOLUME & STATUS SIKLUS MINGGUAN'],
      ['Minggu', 'Fokus Fase', 'Status Siklus', 'Est. Volume Mingguan (kg)'],
    ];

    (program.weeks || []).forEach(w => {
      const phases = (w.phase_slugs || []).map((p) => tPhase(p) || p).join(' + ');
      const status = w.is_deload ? 'DELOAD RECOVERY' : 'OVERLOAD PHASE';
      const vol = Math.round(w.total_week_volume_kg || 0);
      overviewData.push([`Minggu ${w.week_number}`, phases, status, vol]);
    });

    const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
    wsOverview['!cols'] = [{ wch: 30 }, { wch: 30 }, { wch: 25 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(wb, wsOverview, 'Ringkasan Program');

    // ─── Sheet per Week ───
    (program.weeks || []).forEach((week) => {
      const weekRows = [];

      const weekStatus = week.is_deload ? 'DELOAD RECOVERY' : 'OVERLOAD';
      weekRows.push([`MINGGU ${week.week_number} — ${weekStatus}`]);
      weekRows.push([`Fokus: ${(week.phase_slugs || []).map((p) => tPhase(p) || p).join(' + ')}`]);
      weekRows.push([]);

      // Headers
      weekRows.push([
        'Hari',
        'Nama Latihan',
        'Pola Gerakan',
        'Set',
        'Reps',
        'Beban',
        'Tempo',
        'Istirahat (detik)',
        'Beban Dibatasi',
        'Catatan',
      ]);

      // Data rows
      (week.sessions || []).forEach((session) => {
        const dayNum = session.session_metadata?.day_number || session.day_number || 1;
        (session.prescribed_exercises || []).forEach((ex) => {
          let loadStr = '—';
          if (ex.missing_1rm) {
            loadStr = '1RM Belum Diinput';
          } else if (ex.uses_rpe_flag) {
            loadStr = `RPE ${ex.target_rpe || '—'}`;
          } else if (ex.load_kg !== null && ex.load_kg !== undefined) {
            loadStr = `${ex.load_kg} kg`;
          }
          
          const notes = [];
          if (ex.substitution_diagnostics) notes.push('Substitusi Alat');
          (ex.notes || []).forEach((n) => {
            const msg = tMessage(n);
            notes.push(msg !== n ? msg : n);
          });

          weekRows.push([
            `Hari ${dayNum}`,
            tExercise(ex.exercise_slug) || ex.exercise_slug,
            tPattern(ex.movement_pattern_slug) || ex.movement_pattern_slug,
            ex.sets || 0,
            ex.reps || 0,
            loadStr,
            ex.tempo_code || '—',
            ex.rest_interval_seconds || 0,
            ex.capped_by_safety_module ? 'Ya' : 'Tidak',
            notes.join('; ') || '—',
          ]);
        });
        weekRows.push([]);
      });

      const wsWeek = XLSX.utils.aoa_to_sheet(weekRows);
      wsWeek['!cols'] = [
        { wch: 10 },
        { wch: 25 },
        { wch: 25 },
        { wch: 8 },
        { wch: 10 },
        { wch: 12 },
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
        { wch: 35 },
      ];
      XLSX.utils.book_append_sheet(wb, wsWeek, `Minggu ${week.week_number}`);
    });

    const filename = `Program_Latihan_${meta.duration_weeks || 8}minggu_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);
  } catch (err) {
    console.error('[ExcelGenerator] Export error:', err);
    alert('Gagal mengunduh Excel: ' + err.message);
  }
}
