import { tUI, tExercise, tPhase, tPattern, tMessage, getCurrentLanguage } from './i18n.js';
import { formatRestInterval, formatLoad } from './helpers.js';
import { getUserProfile, getUserEquipment } from '../db/user-store.js';
import { MST_EXERCISES } from '../db/master-data.js';

/**
 * Generate a comprehensive PDF document from the training program
 * @param {Object} program - The generated program from rule engine
 */
export function generatePDF(program) {
  const lang = getCurrentLanguage();
  const isEn = lang === 'en';

  if (!program) {
    alert(isEn ? 'Program data not found.' : 'Data program tidak ditemukan.');
    return;
  }

  const jsPDFClass = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
  if (!jsPDFClass) {
    alert(isEn ? 'jsPDF library is not ready. Please try again shortly.' : 'Library jsPDF belum siap. Silakan coba beberapa saat lagi.');
    return;
  }

  try {
    const doc = new jsPDFClass('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
    const margin = 12; // Crisp 12mm page margin
    const contentWidth = pageWidth - 2 * margin; // 186mm
    let currentY = margin;

    // Helper to check available vertical space before printing a section header
    const ensureSpace = (neededHeight) => {
      if (currentY + neededHeight > pageHeight - 15) {
        doc.addPage();
        drawGradientHeader(doc, pageWidth);
        drawRunningHeader(doc, pageWidth, margin, isEn);
        currentY = 22;
      }
    };

    // ─── PAGE 1 TOP HEADER ───
    drawGradientHeader(doc, pageWidth);
    currentY = 18;

    // Brand Title & Sub-header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(230, 57, 70); // Crimson Red
    doc.text('aplanworkout', margin, currentY);
    
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text(
      isEn ? 'Exercise Physiology Prescription & Periodization' : 'Preskripsi & Periodisasi Fisiologi Latihan Presisi', 
      pageWidth - margin, 
      currentY, 
      { align: 'right' }
    );
    currentY += 6;

    // Main Document Title
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text(
      isEn ? 'WEIGHT TRAINING PROGRAM REPORT' : 'HASIL LENGKAP PROGRAM LATIHAN BEBAN', 
      margin, 
      currentY
    );
    currentY += 6;

    // Metadata & Athlete Identity Section Box
    const meta = program.metadata || {};
    const profile = getUserProfile() || {};
    const weeks = Array.isArray(program.weeks) ? program.weeks : [];
    const trainingLevelRaw = meta.training_age_level || 'BEGINNER';
    const trainingLevel = isEn 
      ? (trainingLevelRaw === 'BEGINNER' ? 'Beginner' : trainingLevelRaw === 'INTERMEDIATE' ? 'Intermediate' : trainingLevelRaw === 'ADVANCED' ? 'Advanced' : trainingLevelRaw)
      : (trainingLevelRaw === 'BEGINNER' ? 'Pemula' : trainingLevelRaw === 'INTERMEDIATE' ? 'Menengah' : trainingLevelRaw === 'ADVANCED' ? 'Lanjutan' : trainingLevelRaw);

    const athleteName = meta.athlete_name || profile.athlete_name || '';
    const sportBranch = meta.sport_branch || profile.sport_branch || '';

    // Draw Subtle Background Box for Header Meta
    doc.setFillColor(248, 250, 252); // Slate-50
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.setLineWidth(0.3);
    
    const metaBoxHeight = (athleteName || sportBranch) ? 22 : 17;
    doc.roundedRect(margin, currentY, contentWidth, metaBoxHeight, 2, 2, 'FD');

    let metaY = currentY + 4.5;

    // Athlete Identity Row
    if (athleteName || sportBranch) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(230, 57, 70);
      const identityParts = [];
      if (athleteName) identityParts.push(isEn ? `Athlete: ${athleteName}` : `Nama Atlet: ${athleteName}`);
      if (sportBranch) identityParts.push(isEn ? `Sport: ${sportBranch}` : `Cabang Olahraga: ${sportBranch}`);
      doc.text(identityParts.join('   |   '), margin + 3.5, metaY);
      metaY += 5;
    }
    
    // Core Program Parameter Line
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85); // Slate-700
    const metaLine = isEn
      ? `Duration: ${meta.duration_weeks || weeks.length} Weeks   |   Level: ${trainingLevel}   |   1RM Target: +${meta.target_1rm_increase_pct || 10}%   |   Frequency: ${meta.days_per_week || 3} Days/Week`
      : `Durasi: ${meta.duration_weeks || weeks.length} Minggu   |   Level: ${trainingLevel}   |   Target 1RM: +${meta.target_1rm_increase_pct || 10}%   |   Frekuensi: ${meta.days_per_week || 3} Hari/Minggu`;
    doc.text(metaLine, margin + 3.5, metaY);
    metaY += 4.5;

    // Program Focus Line
    const goalsText = (meta.selected_goals || []).map((g) => tPhase(g) || g.replace(/_/g, ' ')).join(', ') || (isEn ? 'Hypertrophy / General Strength' : 'Hipertrofi / Kekuatan Umum');
    doc.setFont('helvetica', 'bold');
    doc.text(isEn ? `Program Focus: ${goalsText}` : `Fokus Program: ${goalsText}`, margin + 3.5, metaY);

    currentY += metaBoxHeight + 6;

    // ─── SECTION 1: EVALUASI FISIOLOGIS & DIAGNOSTIK (4 DOMAIN) ───
    ensureSpace(35);
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(
      isEn ? '1. PHYSIOLOGICAL EVALUATION & SYSTEM DIAGNOSTICS (4 DOMAINS)' : '1. EVALUASI FISIOLOGIS & DIAGNOSTIK SISTEM (4 DOMAIN)', 
      margin, 
      currentY
    );
    currentY += 4.5;

    const medStatus = program.medical_screening?.clearance_status || 'CLEAR';
    const targetStatus = program.target_validation?.status || 'REALISTIC';
    const targetInc = program.target_validation?.weeklyIncrement ? Number(program.target_validation.weeklyIncrement).toFixed(1) : '1.2';
    const strat = program.periodization?.strategy === 'SEQUENTIAL' ? 'Block (Sequential)' : 'DUP (Concurrent)';
    const totalVolSum = weeks.reduce((sum, w) => sum + (w?.total_week_volume_kg || 0), 0);
    const numFormat = isEn ? 'en-US' : 'id-ID';

    const diagHeaders = isEn 
      ? [['Evaluation Domain', 'Status / Criteria', 'Exercise Physiology Notes']]
      : [['Domain Evaluasi', 'Status / Kriteria', 'Keterangan Fisiologi Latihan']];

    const diagBody = [
      [
        isEn ? 'Medical Safety Clearance' : 'Evaluasi Keamanan Medis', 
        medStatus, 
        medStatus === 'CLEAR' 
          ? (isEn ? 'Clear of medical restrictions. Full 100% intensity & volume access.' : 'Bebas dari hambatan medis. Akses penuh 100% intensitas & volume.')
          : (isEn ? 'Active medical modifications on load or rest intervals.' : 'Penyesuaian medis aktif pada beban atau jeda istirahat.')
      ],
      [
        isEn ? '1RM Target Feasibility' : 'Kelayakan Target 1RM', 
        targetStatus, 
        isEn
          ? `Target weekly increment +${targetInc}%/wk. ${targetStatus === 'REALISTIC' ? 'Within normal adaptation capacity.' : 'Requires strict nutrition & recovery discipline.'}`
          : `Laju kenaikan target +${targetInc}%/minggu. ${targetStatus === 'REALISTIC' ? 'Berada dalam kapasitas adaptasi normal.' : 'Membutuhkan disiplin nutrisi & pemulihan.'}`
      ],
      [
        isEn ? 'Block Periodization Structure' : 'Struktur Periodisasi Blok', 
        strat, 
        isEn
          ? `Total ${program.periodization?.blocks?.length || 1} Block(s). ${program.periodization?.strategy === 'SEQUENTIAL' ? 'Structured phase sequence for maximum adaptation focus.' : 'Daily undulating stimulus.'}`
          : `Total ${program.periodization?.blocks?.length || 1} Blok. ${program.periodization?.strategy === 'SEQUENTIAL' ? 'Urutan fase terstruktur untuk fokus adaptasi maksimal.' : 'Stimulus bergelombang harian.'}`
      ],
      [
        isEn ? 'Total Volume Load & Energy' : 'Total Load Volume & Energi', 
        `${Math.round(totalVolSum).toLocaleString(numFormat)} kg`, 
        isEn
          ? 'Estimated 5.0 METs (Explosive Compound). High excess post-exercise oxygen consumption (EPOC).'
          : 'Estimasi 5.0 METs (Explosive Compound). Efek konsumsi oksigen pasca-latihan (EPOC) tinggi.'
      ]
    ];

    if (typeof doc.autoTable === 'function') {
      doc.autoTable({
        startY: currentY,
        head: diagHeaders,
        body: diagBody,
        margin: { left: margin, right: margin },
        styles: { fontSize: 8, cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 }, overflow: 'linebreak' },
        headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 46, fontStyle: 'bold' },
          1: { cellWidth: 38, fontStyle: 'bold' },
          2: { cellWidth: 'auto' }
        },
        didParseCell: function(data) {
          if (data.section === 'body' && data.column.index === 1) {
            const val = data.cell.raw;
            if (val === 'CLEAR' || val === 'REALISTIC') {
              data.cell.styles.textColor = [16, 185, 129];
            } else if (val === 'AMBITIOUS') {
              data.cell.styles.textColor = [245, 158, 11];
            }
          }
        }
      });
      currentY = doc.lastAutoTable.finalY + 7;
    }

    // ─── SECTION 2: GRAFIK VISUAL ESTIMASI VOLUME MINGGUAN (KG) ───
    ensureSpace(45);
    currentY = drawPDFVectorBarChart(doc, weeks, margin, currentY, pageWidth, isEn);

    // ─── SECTION 3: DAFTAR ALAT GYM & DATABASE 1RM BASELINE ATLET ───
    const eqList = program.equipment_data || getUserEquipment() || [];
    if (eqList && eqList.length > 0) {
      ensureSpace(45);

      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(
        isEn ? '2. REGISTERED GYM EQUIPMENT & BASELINE 1RM DATABASE' : '2. DAFTAR ALAT GYM & DATABASE 1RM BASELINE ATLET', 
        margin, 
        currentY
      );
      currentY += 4.5;

      const eqHeaders = isEn
        ? [['No', 'Equipment / Movement Name', 'Layer / Category', 'Baseline 1RM Load']]
        : [['No', 'Nama Alat / Gerakan', 'Kategori / Layer', 'Beban Baseline 1RM']];

      const eqBody = eqList.map((item, idx) => {
        const exMeta = MST_EXERCISES.find(e => e.exercise_slug === item.exercise_slug);
        const name = isEn ? (exMeta?.name_en || item.exercise_slug) : (exMeta?.name_id || item.exercise_slug);
        const category = exMeta?.category || (isEn ? 'General' : 'Umum');
        const has1RM = item.user_1rm_kg && Number(item.user_1rm_kg) > 0;
        const loadStr = has1RM ? `${item.user_1rm_kg} kg` : (isEn ? 'RPE Mode' : 'Mode RPE');

        return [
          idx + 1,
          name,
          category,
          loadStr
        ];
      });

      if (typeof doc.autoTable === 'function') {
        doc.autoTable({
          startY: currentY,
          head: eqHeaders,
          body: eqBody,
          margin: { left: margin, right: margin },
          styles: { 
            fontSize: 7.5, 
            cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 }, 
            overflow: 'linebreak',
            textColor: [51, 65, 85],
            lineColor: [241, 245, 249],
            lineWidth: 0.2
          },
          headStyles: { 
            fillColor: [30, 41, 59], 
            textColor: 255, 
            fontStyle: 'bold', 
            fontSize: 7.5 
          },
          alternateRowStyles: { 
            fillColor: [248, 250, 252] 
          },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center', textColor: [100, 116, 139] },
            1: { cellWidth: 85, fontStyle: 'bold', textColor: [30, 41, 59] },
            2: { cellWidth: 50, textColor: [100, 116, 139] },
            3: { cellWidth: 41, fontStyle: 'bold', halign: 'right', textColor: [230, 57, 70] }
          }
        });
        currentY = doc.lastAutoTable.finalY + 7;
      }
    }

    // ─── SECTION 4: RINGKASAN VOLUME & PERBEDAAAN SIKLUS (OVERLOAD VS DELOAD) ───
    ensureSpace(45);

    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(
      isEn ? '3. VOLUME PROGRESSION SUMMARY & WEEKLY CYCLE CONTRAST' : '3. RINGKASAN PROGRESI VOLUME & PERBEDAN SIKLUS MINGGUAN', 
      margin, 
      currentY
    );
    currentY += 4.5;

    const summaryHeaders = isEn
      ? [['Week', 'Phase Focus', 'Cycle Status', 'Volume Modulation Character', 'Est. Volume (kg)']]
      : [['Minggu', 'Fokus Fase', 'Status Siklus', 'Karakter Modulasi Volume', 'Est. Volume (kg)']];

    const summaryBody = weeks.map((w) => {
      const phases = (w.phase_slugs || []).map((p) => tPhase(p) || p.replace(/_/g, ' ')).join(', ');
      const isDeload = w.is_deload;
      const status = isDeload ? 'DELOAD RECOVERY' : 'OVERLOAD';
      const chara = isDeload 
        ? (isEn ? 'Restorative Recovery (-40% Volume)' : 'Restorative Recovery (-40% Volume)')
        : (isEn ? 'Progressive Load (+100% Volume)' : 'Progressive Load (+100% Volume)');
      const vol = Math.round(w.total_week_volume_kg || 0).toLocaleString(numFormat) + ' kg';
      return [isEn ? `Week ${w.week_number}` : `Minggu ${w.week_number}`, phases || (isEn ? 'General' : 'Umum'), status, chara, vol];
    });

    if (typeof doc.autoTable === 'function') {
      doc.autoTable({
        startY: currentY,
        head: summaryHeaders,
        body: summaryBody,
        margin: { left: margin, right: margin },
        styles: { fontSize: 8, cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 } },
        headStyles: { fillColor: [230, 57, 70], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 22, fontStyle: 'bold' },
          1: { cellWidth: 42 },
          2: { cellWidth: 36, fontStyle: 'bold' },
          3: { cellWidth: 50 },
          4: { cellWidth: 36, fontStyle: 'bold', halign: 'right' }
        },
        didParseCell: function(data) {
          if (data.section === 'body') {
            const isDeload = data.row.raw[2] === 'DELOAD RECOVERY';
            if (isDeload) {
              data.cell.styles.fillColor = [254, 243, 199];
              if (data.column.index === 2) data.cell.styles.textColor = [180, 83, 9];
            } else {
              data.cell.styles.fillColor = [255, 245, 245];
              if (data.column.index === 2) data.cell.styles.textColor = [230, 57, 70];
            }
          }
        }
      });
      currentY = doc.lastAutoTable.finalY + 7;
    }

    // ─── SECTION 5: REKOMENDASI ALAT & PERINGATAN SISTEM (JIKA ADA) ───
    const hasWarnings = Array.isArray(program.system_warnings) && program.system_warnings.length > 0;
    const hasEquipRecs = Array.isArray(program.equipment_recommendations) && program.equipment_recommendations.length > 0;

    if (hasWarnings || hasEquipRecs) {
      ensureSpace(40);

      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(
        isEn ? '4. SYSTEM DIAGNOSTIC NOTES & RECOMMENDATIONS' : '4. CATATAN DIAGNOSTIK & REKOMENDASI SISTEM', 
        margin, 
        currentY
      );
      currentY += 4.5;

      if (hasWarnings) {
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(180, 83, 9);
        doc.text(isEn ? 'Adaptation Signal & Safety Warning:' : 'Peringatan Sinyal Adaptasi & Keamanan:', margin, currentY);
        currentY += 4;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        program.system_warnings.forEach((warn) => {
          doc.text(`• ${warn}`, margin + 3, currentY);
          currentY += 4;
        });
        currentY += 3;
      }

      if (hasEquipRecs) {
        const equipHeaders = isEn 
          ? [['#', 'Additional Equipment Recommendation', 'Adaptation Purpose']]
          : [['#', 'Rekomendasi Alat Tambahan', 'Tujuan Adaptasi']];
        const equipBody = program.equipment_recommendations.map((item, idx) => {
          const slug = typeof item === 'string' ? item : item.exercise_slug;
          return [
            String(idx + 1),
            slug ? slug.replace(/_/g, ' ').toUpperCase() : (isEn ? 'Additional Equipment' : 'Alat Tambahan'),
            isEn 
              ? 'Enhances movement variety & optimizes hypertrophy/strength stimulus.'
              : 'Meningkatkan variasi gerakan & optimalisasi stimulus hipertrofi/kekuatan.'
          ];
        });

        if (typeof doc.autoTable === 'function') {
          doc.autoTable({
            startY: currentY,
            head: equipHeaders,
            body: equipBody,
            margin: { left: margin, right: margin },
            styles: { 
              fontSize: 7.5, 
              cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
              textColor: [51, 65, 85],
              lineColor: [241, 245, 249],
              lineWidth: 0.2
            },
            headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            columnStyles: {
              0: { cellWidth: 10, halign: 'center', textColor: [100, 116, 139] },
              1: { cellWidth: 60, fontStyle: 'bold', textColor: [30, 41, 59] },
              2: { cellWidth: 'auto', textColor: [100, 116, 139] }
            }
          });
          currentY = doc.lastAutoTable.finalY + 7;
        }
      }
    }

    // ─── SECTION 6: TABEL DETAIL SESI LATIHAN PER MINGGU & HARI ───
    weeks.forEach((week) => {
      // Force clean new page per week for perfect readability
      ensureSpace(50);

      const isDeload = week.is_deload;
      doc.setFontSize(11.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(isDeload ? 180 : 230, isDeload ? 83 : 57, isDeload ? 9 : 70);
      const weekBadge = isEn
        ? (isDeload ? ' [DELOAD RECOVERY PHASE]' : ' [PROGRESSIVE OVERLOAD PHASE]')
        : (isDeload ? ' [FASE DELOAD RECOVERY]' : ' [FASE OVERLOAD PROGRESIF]');
      
      const weekLabel = isEn ? `WEEK ${week.week_number}` : `MINGGU ${week.week_number}`;
      doc.text(`${weekLabel}${weekBadge}`, margin, currentY);
      
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      const volLabel = isEn ? 'Est. Total Week Vol' : 'Total Est. Volume Minggu';
      doc.text(`${volLabel}: ${Math.round(week.total_week_volume_kg || 0).toLocaleString(numFormat)} kg`, pageWidth - margin, currentY, { align: 'right' });
      currentY += 5;

      const sessions = Array.isArray(week.sessions) ? week.sessions : [];
      sessions.forEach((session) => {
        ensureSpace(40);

        const dayNum = session.day_number || 1;
        const focusTitle = session.focus_title || (session.phase_slug ? session.phase_slug.replace(/_/g, ' ').toUpperCase() : 'Workout Session');
        const sessionVol = Math.round(session.session_volume_kg || session.total_estimated_volume_kg || 0);

        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(243, 114, 44);
        const dayLabel = isEn ? `Day ${dayNum}` : `Hari ${dayNum}`;
        doc.text(`${dayLabel}: ${focusTitle}`, margin + 1, currentY);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        const sessVolLabel = isEn ? 'Est. Session Vol' : 'Est. Vol Sesi';
        doc.text(`${sessVolLabel}: ${sessionVol.toLocaleString(numFormat)} kg`, pageWidth - margin, currentY, { align: 'right' });
        currentY += 3.5;

        const exercises = session.exercises || session.prescribed_exercises || [];
        const tableHeaders = isEn
          ? [['#', 'Exercise Name', 'Sets', 'Reps', 'Target Load', 'Tempo', 'Rest', 'Notes / Diagnostics']]
          : [['#', 'Nama Latihan', 'Set', 'Reps', 'Beban Target', 'Tempo', 'Istirahat', 'Catatan / Diagnostik']];

        const tableBody = exercises.map((ex, idx) => {
          const name = tExercise(ex.exercise_slug) || (ex.exercise_slug ? ex.exercise_slug.replace(/_/g, ' ') : '—');
          let loadStr = '—';
          const pctText = ex.intensity_pct ? ` (${Math.round(ex.intensity_pct * 100)}% 1RM)` : '';
          if (ex.missing_1rm) {
            loadStr = isEn ? '1RM Missing' : '1RM Belum Diinput';
          } else if (ex.uses_rpe_flag) {
            loadStr = `RPE ${ex.target_rpe || '8'}`;
          } else if (ex.load_kg !== null && ex.load_kg !== undefined && ex.load_kg > 0) {
            loadStr = `${formatLoad(ex.load_kg)}${pctText}`;
          } else {
            loadStr = `Bodyweight${pctText}`;
          }

          const notes = [];
          if (ex.capped_by_safety_module) notes.push(isEn ? 'Load Capped' : 'Load Capped');
          if (ex.substitution_diagnostics) notes.push(isEn ? 'Equipment Subbed' : 'Substitusi Alat');
          if (Array.isArray(ex.notes)) {
            ex.notes.forEach((n) => {
              const msg = tMessage(n);
              notes.push(msg !== n ? msg : n);
            });
          }

          return [
            String(idx + 1),
            name,
            String(ex.sets || 0),
            String(ex.reps || 0),
            loadStr,
            ex.tempo_code || '2-0-2-0',
            formatRestInterval(ex.rest_interval_seconds || 60),
            notes.join('; ') || 'Normal'
          ];
        });

        if (tableBody.length > 0 && typeof doc.autoTable === 'function') {
          doc.autoTable({
            startY: currentY,
            head: tableHeaders,
            body: tableBody,
            margin: { left: margin, right: margin },
            styles: { fontSize: 7.5, cellPadding: { top: 2, bottom: 2, left: 2.5, right: 2.5 }, overflow: 'linebreak' },
            headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            columnStyles: {
              0: { cellWidth: 7, halign: 'center' },
              1: { cellWidth: 48, fontStyle: 'bold' },
              2: { cellWidth: 10, halign: 'center' },
              3: { cellWidth: 12, halign: 'center' },
              4: { cellWidth: 28, fontStyle: 'bold', textColor: [230, 57, 70], halign: 'center' },
              5: { cellWidth: 18, halign: 'center' },
              6: { cellWidth: 18, halign: 'center' },
              7: { cellWidth: 'auto' }
            }
          });
          currentY = doc.lastAutoTable.finalY + 5;
        }
      });

      currentY += 3;
    });

    // ─── FOOTER & PAGE NUMBERING ACROSS ALL PAGES ───
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // Slate-400
      doc.setFont('helvetica', 'normal');
      
      // Bottom Line Divider
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

      const footerText = isEn
        ? `aplanworkout Engine   |   Weight Training Program Report   |   Page ${i} of ${totalPages}`
        : `aplanworkout Engine   |   Hasil Program Latihan Beban Presisi   |   Halaman ${i} dari ${totalPages}`;
      doc.text(
        footerText,
        pageWidth / 2,
        pageHeight - 5.5,
        { align: 'center' }
      );
    }

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = isEn
      ? `aplanworkout_Training_Program_${meta.duration_weeks || weeks.length}Weeks_${dateStr}.pdf`
      : `Program_Latihan_aplanworkout_${meta.duration_weeks || weeks.length}Minggu_${dateStr}.pdf`;
    doc.save(filename);
  } catch (err) {
    console.error('[PDFGenerator] Export error:', err);
    alert((isEn ? 'Failed to download PDF: ' : 'Gagal mengunduh PDF: ') + err.message);
  }
}

function drawGradientHeader(doc, pageWidth) {
  const barHeight = 3.5;
  const thirdWidth = pageWidth / 3;

  doc.setFillColor(230, 57, 70); // Crimson Red
  doc.rect(0, 0, thirdWidth, barHeight, 'F');

  doc.setFillColor(243, 114, 44); // Orange Accent
  doc.rect(thirdWidth, 0, thirdWidth, barHeight, 'F');

  doc.setFillColor(249, 168, 38); // Golden Amber
  doc.rect(thirdWidth * 2, 0, thirdWidth + 1, barHeight, 'F');
}

function drawRunningHeader(doc, pageWidth, margin, isEn) {
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text('aplanworkout', margin, 10);
  doc.setFont('helvetica', 'normal');
  doc.text(
    isEn ? 'Weight Training Program Report' : 'Laporan Program Latihan Beban Presisi', 
    pageWidth - margin, 
    10, 
    { align: 'right' }
  );
  doc.setDrawColor(241, 245, 249);
  doc.setLineWidth(0.3);
  doc.line(margin, 12, pageWidth - margin, 12);
}

/**
 * Renders high-contrast vector bar chart for weekly volume progression directly in PDF
 */
function drawPDFVectorBarChart(doc, weeks, margin, startY, pageWidth, isEn = false) {
  if (!Array.isArray(weeks) || weeks.length === 0) return startY;

  let currentY = startY;
  const numFormat = isEn ? 'en-US' : 'id-ID';

  // Title
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(
    isEn ? 'VISUAL WEEKLY VOLUME PROGRESSION (KG) & CYCLE CONTRAST' : 'GRAFIK VISUAL ESTIMASI VOLUME MINGGUAN (KG) & KONTRAST SIKLUS', 
    margin, 
    currentY
  );
  currentY += 4.5;

  // Legend
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  
  // Crimson Legend
  doc.setFillColor(230, 57, 70);
  doc.rect(margin, currentY - 2.5, 3, 3, 'F');
  doc.setTextColor(230, 57, 70);
  doc.text(isEn ? 'Progressive Overload Phase (100% Load Target)' : 'Fase Overload Progresif (Target Load 100%)', margin + 4.5, currentY);

  // Amber Legend
  doc.setFillColor(249, 168, 38);
  doc.rect(margin + 80, currentY - 2.5, 3, 3, 'F');
  doc.setTextColor(180, 83, 9);
  doc.text(isEn ? 'Deload Recovery Phase (-40% Vol Recovery)' : 'Fase Deload Recovery (Pemulihan -40% Vol)', margin + 84.5, currentY);
  
  currentY += 5;

  // Chart Box Boundaries
  const chartWidth = pageWidth - 2 * margin;
  const chartHeight = 26; // mm
  const chartBottomY = currentY + chartHeight;

  // Draw Subtle Chart Background Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, chartWidth, chartHeight + 6.5, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, chartWidth, chartHeight + 6.5, 2, 2, 'S');

  // Calculate Volumes & Scaling with Amplified Floor
  const vols = weeks.map(w => Math.round(w?.total_week_volume_kg || 0));
  const maxVol = Math.max(...vols, 1);
  const minVol = Math.min(...vols, 0);
  const floorVol = minVol > 0 ? Math.floor(minVol * 0.85) : 0;
  const range = maxVol - floorVol;

  const numWeeks = weeks.length;
  const slotWidth = chartWidth / numWeeks;
  const barWidth = Math.min(13, Math.max(3.5, slotWidth * 0.55));

  // Calculate Bar Top Center Points
  const points = weeks.map((w, idx) => {
    const vol = Math.round(w?.total_week_volume_kg || 0);
    const isDeload = w?.is_deload;
    let barH = 16;
    if (range > 0) {
      barH = 5 + ((vol - floorVol) / range) * 15;
    }
    const slotCenterX = margin + (idx + 0.5) * slotWidth;
    const barX = slotCenterX - barWidth / 2;
    const barY = chartBottomY - barH;
    return { slotCenterX, barX, barY, barH, vol, isDeload, week_number: w?.week_number };
  });

  // Draw Connecting Lines Between Adjacent Bars
  doc.setLineWidth(0.6);
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    if (curr.isDeload || prev.isDeload) {
      doc.setDrawColor(217, 119, 6); // Amber
    } else {
      doc.setDrawColor(230, 57, 70); // Red
    }
    doc.line(prev.slotCenterX, prev.barY, curr.slotCenterX, curr.barY);
  }

  // Draw Bars & Circle Nodes
  points.forEach((p) => {
    // Set Bar Colors
    if (p.isDeload) {
      doc.setFillColor(249, 168, 38); // Golden Amber
      doc.setDrawColor(217, 119, 6);
      doc.setTextColor(180, 83, 9);
    } else {
      doc.setFillColor(230, 57, 70); // Crimson Red
      doc.setDrawColor(183, 16, 42);
      doc.setTextColor(183, 16, 42);
    }

    // Draw Volume Badge Text Safely ABOVE Node Circle
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text(`${p.vol.toLocaleString(numFormat)}kg`, p.slotCenterX, p.barY - 3, { align: 'center' });

    // Draw Bar Vector Rect
    doc.rect(p.barX, p.barY, barWidth, p.barH, 'FD');

    // Draw Connecting Circle Node Dot at Bar Top
    doc.setFillColor(p.isDeload ? 249 : 230, p.isDeload ? 168 : 57, p.isDeload ? 38 : 70);
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.3);
    doc.circle(p.slotCenterX, p.barY, 1.2, 'FD');

    // Draw Week Label Below Bar
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    const weekPrefix = isEn ? 'W' : 'M';
    doc.text(`${weekPrefix}${p.week_number}`, p.slotCenterX, chartBottomY + 4, { align: 'center' });
  });

  return chartBottomY + 10;
}
