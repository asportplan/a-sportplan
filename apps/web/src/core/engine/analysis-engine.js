/**
 * analysis-engine.js - Analytics and Report Generation
 */

/**
 * Calculate 1RM using Epley formula
 * @param {number} weight 
 * @param {number} reps 
 * @returns {number}
 */
export function calculate1RM(weight, reps) {
  const w = parseFloat(weight) || 0;
  const r = parseInt(reps, 10) || 0;
  if (w <= 0 || r <= 0) return 0;
  if (r === 1) return w;
  return Math.round(w * (1 + r / 30) * 10) / 10;
}

/**
 * Helper to get sessions from a week object safely
 */
function getWeekSessions(week) {
  if (!week) return [];
  return week.sessions || week.days || [];
}

/**
 * Helper to get exercises from a session safely
 */
function getSessionExercises(session) {
  if (!session) return [];
  return session.exercises || session.prescribed_exercises || [];
}

/**
 * Generate Final Analysis Report
 * @param {Object} program - Generated program data
 * @param {Array} results - Array of session results
 * @param {Array} bodyWeights - Array of weekly body weights
 * @returns {Object} Analysis report object
 */
export function generateFinalAnalysis(program, results = [], bodyWeights = []) {
  if (!program || !program.weeks) return null;
  
  const totalWeeks = program.weeks.length;
  let totalPrescribedSessions = 0;
  let totalPrescribedVolume = 0;
  
  // Track total prescribed sessions and volume
  program.weeks.forEach(w => {
    const sessions = getWeekSessions(w);
    totalPrescribedSessions += sessions.length;

    sessions.forEach(s => {
      const exercises = getSessionExercises(s);
      exercises.forEach(ex => {
        const sets = parseInt(ex.sets, 10) || 3;
        const reps = parseInt(ex.reps, 10) || 10;
        const load = parseFloat(ex.load_kg || ex.target_load_kg) || 0;
        totalPrescribedVolume += (sets * reps * load);
      });
    });
  });

  const completedSessions = (results || []).length;
  const complianceRate = totalPrescribedSessions > 0 
    ? Math.min(100, Math.round((completedSessions / totalPrescribedSessions) * 100)) 
    : 0;

  // Weekly RPE tracking
  const rpePerWeek = {};
  for (let i = 1; i <= totalWeeks; i++) {
    rpePerWeek[i] = { sum: 0, count: 0, average: 0 };
  }

  let totalActualVolume = 0;
  const strengthProgression = {};

  // Compute actual volume & strength from results
  (results || []).forEach(session => {
    const weekNum = session.week || session.week_number || 1;
    if (!rpePerWeek[weekNum]) {
      rpePerWeek[weekNum] = { sum: 0, count: 0, average: 0 };
    }

    const exercises = session.exercises || [];
    exercises.forEach(ex => {
      const exName = ex.exercise_name || (ex.exercise_slug ? ex.exercise_slug.replace(/_/g, ' ') : 'Exercise');
      let exMax1RM = 0;

      (ex.sets || []).forEach(set => {
        const load = parseFloat(set.weight || set.actual_load_kg) || 0;
        const reps = parseInt(set.reps || set.actual_reps, 10) || 0;
        const rpe = parseFloat(set.rpe || set.perceived_rpe) || 0;

        totalActualVolume += (load * reps);

        if (rpe > 0) {
          rpePerWeek[weekNum].sum += rpe;
          rpePerWeek[weekNum].count += 1;
        }

        const est1RM = calculate1RM(load, reps);
        if (est1RM > exMax1RM) exMax1RM = est1RM;
      });

      if (exMax1RM > 0) {
        if (!strengthProgression[exName]) {
          strengthProgression[exName] = {};
        }
        if (!strengthProgression[exName][weekNum] || exMax1RM > strengthProgression[exName][weekNum]) {
          strengthProgression[exName][weekNum] = exMax1RM;
        }
      }
    });
  });

  // Calculate RPE averages per week
  const rpeTrends = [];
  Object.keys(rpePerWeek).forEach(w => {
    const data = rpePerWeek[w];
    if (data.count > 0) {
      data.average = Math.round((data.sum / data.count) * 10) / 10;
    }
    rpeTrends.push({ week: parseInt(w, 10), averageRPE: data.average });
  });

  // Body weight changes
  const bwData = (bodyWeights || []).slice().sort((a, b) => (a.week || a.week_number) - (b.week || b.week_number));
  let bwChange = 0;
  if (bwData.length > 1) {
    const startBW = parseFloat(bwData[0].weightKg || bwData[0].body_weight_kg) || 0;
    const endBW = parseFloat(bwData[bwData.length - 1].weightKg || bwData[bwData.length - 1].body_weight_kg) || 0;
    if (startBW > 0 && endBW > 0) {
      bwChange = Math.round((endBW - startBW) * 10) / 10;
    }
  }

  // Actionable Insights / Recommendations
  const recommendations = [];
  if (complianceRate >= 85) {
    recommendations.push("Tingkat kepatuhan latihan Anda luar biasa (≥ 85%). Anda sangat disiplin dalam menyelesaikan preskripsi program.");
  } else if (complianceRate >= 70) {
    recommendations.push("Kepatuhan latihan baik (70% - 84%). Pertahankan konsistensi untuk hasil adaptasi neuromuskular yang optimal.");
  } else {
    recommendations.push("Kepatuhan latihan berada di bawah 70%. Pertimbangkan untuk menyederhanakan jadwal atau mengurangi frekuensi hari latihan.");
  }

  const validRpes = rpeTrends.filter(i => i.averageRPE > 0);
  const avgRPE = validRpes.length > 0 
    ? (validRpes.reduce((sum, item) => sum + item.averageRPE, 0) / validRpes.length) 
    : 0;

  if (avgRPE >= 9) {
    recommendations.push("Rata-rata RPE sangat tinggi (≥ 9.0). Terdeteksi akumulasi kelelahan saraf (CNS fatigue), disarankan mengambil siklus Deload.");
  } else if (avgRPE >= 7.5) {
    recommendations.push("Intensitas RPE rata-rata ideal (7.5 - 8.5) untuk memicu hipertrofi dan kekuatan fungsional tanpa resiko overtraining.");
  } else if (avgRPE > 0) {
    recommendations.push("RPE rata-rata tergolong ringan (< 7.5). Anda dapat meningkatkan beban progresif (Progressive Overload) di siklus berikutnya.");
  }

  if (bwChange > 0) {
    recommendations.push(`Berat badan meningkat sebesar +${bwChange.toFixed(1)} kg selama siklus program latihan.`);
  } else if (bwChange < 0) {
    recommendations.push(`Berat badan menurun sebesar ${bwChange.toFixed(1)} kg selama siklus program latihan.`);
  }

  return {
    compliance: {
      rate: complianceRate,
      completed: completedSessions,
      total: totalPrescribedSessions
    },
    volume: {
      prescribed: Math.round(totalPrescribedVolume),
      actual: Math.round(totalActualVolume)
    },
    strengthProgression,
    rpeTrends,
    bodyWeight: {
      data: bwData,
      change: bwChange
    },
    recommendations
  };
}
