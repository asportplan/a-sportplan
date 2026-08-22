import { getUserProfile, getUserEquipment, getAvailableEquipmentSlugs, getScreeningResults, saveGeneratedProgram } from '../db/user-store.js';
import { getPhaseBySlug } from '../db/master-data.js';
import { getCompatibility } from '../db/compatibility-matrix.js';
import { processScreeningResults } from './medical-triage.js';
import { validateMVW } from './equipment-substitution.js';
import { buildPeriodizationPlan } from './periodization.js';
import { getWeekModifiers, getProgressionSummary } from './overload-deload.js';
import { getTrainingAgeModifiers, getAgeGroupModifiers, validateTarget1RM } from './training-age-modifier.js';
import { buildSession } from './session-builder.js';
import { generateUUID } from '../utils/helpers.js';

/**
 * Generate a complete training program
 * @returns {{ success: boolean, program?: Object, error?: string, errorType?: string }}
 */
export function generateProgram() {
  const profile = getUserProfile();
  const equipment = getUserEquipment();
  const screening = getScreeningResults();
  const systemWarnings = [];

  // ─── Step 1: Validate Input ───
  if (!profile) {
    return { success: false, error: 'Profil pengguna belum diisi. Silakan lengkapi profil Anda.', errorType: 'MISSING_PROFILE' };
  }
  if (!profile.age || profile.age < 10 || profile.age > 100) {
    return { success: false, error: 'Usia tidak valid (10-100 tahun).', errorType: 'INVALID_AGE' };
  }
  if (!profile.training_age_level) {
    return { success: false, error: 'Level pengalaman latihan belum dipilih.', errorType: 'MISSING_TRAINING_AGE' };
  }
  if (!profile.selected_goals || profile.selected_goals.length === 0) {
    return { success: false, error: 'Fokus program belum dipilih. Pilih setidaknya 1 fokus.', errorType: 'MISSING_GOALS' };
  }
  if (profile.selected_goals.length > 3) {
    return { success: false, error: 'Maksimal 3 fokus program diizinkan.', errorType: 'TOO_MANY_GOALS' };
  }
  if (!equipment || equipment.length === 0) {
    return { success: false, error: 'Tidak ada alat gym yang dipilih. Silakan centang alat yang tersedia.', errorType: 'NO_EQUIPMENT' };
  }

  // ─── Step 2: Medical Triage ───
  const screeningData = screening || {
    has_heart_condition: false,
    has_asthma: false,
    has_chest_pain: false,
    has_injury: false,
    injury_area: null,
    takes_medication: false,
  };

  const medicalResults = processScreeningResults({
    q1_heart: screeningData.has_heart_condition,
    q2_asthma: screeningData.has_asthma,
    q3_chest_pain: screeningData.has_chest_pain,
    q4_injury: screeningData.has_injury,
    q4_injury_area: screeningData.injury_area,
    q5_medication: screeningData.takes_medication,
  });

  if (medicalResults.is_blocked) {
    return {
      success: false,
      error: 'Program diblokir oleh skrining kesehatan. Konsultasi dokter diperlukan.',
      errorType: 'HARD_STOP',
      medicalResults,
    };
  }

  (medicalResults.messages || []).forEach((msg) => systemWarnings.push(msg));

  // ─── Step 3: Validate MVW ───
  const availableSlugs = getAvailableEquipmentSlugs();
  const mvwResult = validateMVW(availableSlugs);
  if (!mvwResult.valid) {
    (mvwResult.warnings || []).forEach((w) => systemWarnings.push(w));
  }

  // ─── Step 4: Training Age & Age Group Modifiers ───
  const ageGroupModifiers = getAgeGroupModifiers(profile.age);

  const blockedPhases = (ageGroupModifiers && ageGroupModifiers.blocked_phases) || [];
  const filteredGoals = profile.selected_goals.filter((goal) => {
    if (blockedPhases.includes(goal)) {
      systemWarnings.push(`warn_phase_blocked_by_age`);
      return false;
    }
    return true;
  });

  if (filteredGoals.length === 0) {
    return {
      success: false,
      error: 'Semua fokus program diblokir oleh pembatasan usia.',
      errorType: 'ALL_GOALS_BLOCKED',
    };
  }

  // ─── Step 5: Reconcile Total Cycle Duration ───
  let totalWeeks = parseInt(profile.active_program_duration_weeks || 8);
  if (profile.goals_mode === 'custom_blocks' && Array.isArray(profile.custom_block_configs) && profile.custom_block_configs.length > 0) {
    totalWeeks = profile.custom_block_configs.reduce((sum, b) => sum + (parseInt(b.duration_weeks) || 4), 0);
  }

  // ─── Step 6: Validate Target 1RM ───
  const targetValidation = validateTarget1RM(
    profile.target_1rm_increase_pct || 10,
    profile.training_age_level,
    totalWeeks
  );

  if (targetValidation.status === 'UNREALISTIC') {
    systemWarnings.push('target_unrealistic');
  } else if (targetValidation.status === 'AMBITIOUS') {
    systemWarnings.push('target_ambitious');
  }

  // ─── Step 7: Build Periodization Plan ───
  const periodizationPlan = buildPeriodizationPlan(
    filteredGoals,
    totalWeeks,
    profile.training_age_level
  );

  (periodizationPlan.warnings || []).forEach((w) => systemWarnings.push(w));

  // ─── Step 8: Build Progression Summary (for chart) ───
  const progressionSummary = getProgressionSummary(
    profile.training_age_level,
    profile.target_1rm_increase_pct || 10,
    totalWeeks
  );

  // ─── Step 9: Generate Sessions for Each Week & Day ───
  const weeks = [];

  const customFreqs = profile.weekly_custom_frequencies || {};
  const used_exercises = new Set(); // TRACK USED EXERCISES ACROSS THE PROGRAM

  for (let weekNum = 1; weekNum <= totalWeeks; weekNum++) {
    const weekModifiers = getWeekModifiers(
      weekNum,
      profile.training_age_level,
      profile.target_1rm_increase_pct || 10,
      totalWeeks
    );

    let weekPhases = [];
    const customWeeklyPhases = profile.weekly_custom_phases || {};
    const customBlocks = profile.custom_blocks || {};
    const customBlockConfigs = profile.custom_block_configs || [];
    const hasCustomBlockConfigs = profile.goals_mode === 'custom_blocks' && Array.isArray(customBlockConfigs) && customBlockConfigs.length > 0;
    const hasCustomBlock = profile.goals_mode === 'custom_blocks';
    const hasCustomWeeklyPhase = profile.goals_mode === 'custom_weekly' && (customWeeklyPhases[weekNum] || customWeeklyPhases[String(weekNum)]);

    if (hasCustomBlockConfigs) {
      let currentAccWeeks = 0;
      let matchedBlock = customBlockConfigs[0];
      let matchedBlockIdx = 0;

      for (let i = 0; i < customBlockConfigs.length; i++) {
        const bConf = customBlockConfigs[i];
        const dur = parseInt(bConf.duration_weeks) || 4;
        if (weekNum > currentAccWeeks && weekNum <= currentAccWeeks + dur) {
          matchedBlock = bConf;
          matchedBlockIdx = i;
          break;
        }
        currentAccWeeks += dur;
      }

      const selectedBlockPhase = matchedBlock.phase_slug || 'hypertrophy';
      weekPhases = [selectedBlockPhase];

      // Check transition compatibility if entering a new block
      if (matchedBlockIdx > 0 && weekNum === currentAccWeeks + 1) {
        const prevBlockPhase = customBlockConfigs[matchedBlockIdx - 1]?.phase_slug;
        if (prevBlockPhase && prevBlockPhase !== selectedBlockPhase) {
          const compat = getCompatibility(prevBlockPhase, selectedBlockPhase);
          if (compat === 'CONFLICTING') {
            systemWarnings.push(`Transisi Blok ${matchedBlockIdx} (${prevBlockPhase.replace(/_/g, ' ')}) ➔ Blok ${matchedBlockIdx + 1} (${selectedBlockPhase.replace(/_/g, ' ')}): Terdeteksi potensi interferensi molekuler AMPK-mTOR.`);
          }
        }
      }
    } else if (hasCustomBlock) {
      const blockIndex = Math.floor((weekNum - 1) / 4) + 1;
      const selectedBlockPhase = customBlocks[blockIndex] || customBlocks[String(blockIndex)] || (profile.selected_goals && profile.selected_goals[0]) || 'hypertrophy';
      weekPhases = [selectedBlockPhase];

      // Check transition compatibility between adjacent blocks (at the start of a new block)
      if (weekNum > 1 && (weekNum - 1) % 4 === 0) {
        const prevBlockIndex = blockIndex - 1;
        const prevBlockPhase = customBlocks[prevBlockIndex] || customBlocks[String(prevBlockIndex)];
        if (prevBlockPhase && prevBlockPhase !== selectedBlockPhase) {
          const compat = getCompatibility(prevBlockPhase, selectedBlockPhase);
          if (compat === 'CONFLICTING') {
            systemWarnings.push(`Transisi Blok ${prevBlockIndex} (${prevBlockPhase.replace(/_/g, ' ')}) ➔ Blok ${blockIndex} (${selectedBlockPhase.replace(/_/g, ' ')}): Terdeteksi potensi interferensi molekuler AMPK-mTOR.`);
          }
        }
      }
    } else if (hasCustomWeeklyPhase) {
      const selectedCustomPhase = customWeeklyPhases[weekNum] || customWeeklyPhases[String(weekNum)];
      weekPhases = [selectedCustomPhase];
      
      // Check adjacent week compatibility
      if (weekNum > 1) {
        const prevPhase = customWeeklyPhases[weekNum - 1] || customWeeklyPhases[String(weekNum - 1)];
        if (prevPhase && prevPhase !== selectedCustomPhase) {
          const compat = getCompatibility(prevPhase, selectedCustomPhase);
          if (compat === 'CONFLICTING') {
            systemWarnings.push(`Transisi Minggu ${weekNum - 1} (${prevPhase.replace(/_/g, ' ')}) ➔ Minggu ${weekNum} (${selectedCustomPhase.replace(/_/g, ' ')}): Terdeteksi konflik interferensi molekuler AMPK-mTOR.`);
          }
        }
      }
    } else if (periodizationPlan.strategy === 'SEQUENTIAL') {
      const block = (periodizationPlan.blocks || []).find(
        (b) => weekNum >= b.start_week && weekNum <= b.end_week
      );
      weekPhases = block ? [block.phase_slug] : filteredGoals;
    } else {
      const weekSchedule = (periodizationPlan.weekly_schedule || []).find((ws) => ws.week === weekNum);
      if (weekSchedule && weekSchedule.days) {
        weekPhases = [...new Set(weekSchedule.days.map((d) => d.phase_slug))];
      } else {
        weekPhases = filteredGoals;
      }
    }

    // Support customized frequency per week
    const daysPerWeek = customFreqs[weekNum] || customFreqs[String(weekNum)] || getDaysPerWeek(profile.training_age_level);
    const weekSessions = [];

    for (let dayNum = 1; dayNum <= daysPerWeek; dayNum++) {
      let dayPhase;
      if (hasCustomBlockConfigs || hasCustomBlock || hasCustomWeeklyPhase) {
        dayPhase = weekPhases[0];
      } else if (periodizationPlan.strategy === 'CONCURRENT') {
        const weekSchedule = (periodizationPlan.weekly_schedule || []).find((ws) => ws.week === weekNum);
        const daySchedule = weekSchedule?.days.find((d) => d.day_number === dayNum);
        dayPhase = daySchedule ? daySchedule.phase_slug : filteredGoals[0];
      } else {
        dayPhase = weekPhases[0] || filteredGoals[0];
      }

      const session = buildSession({
        day_number: dayNum,
        week_number: weekNum,
        phase_slug: dayPhase,
        available_equipment_slugs: availableSlugs,
        user_equipment_data: equipment,
        training_age_level: profile.training_age_level,
        week_modifiers: weekModifiers,
        medical_modifiers: medicalResults.modifiers,
        age_group_modifiers: ageGroupModifiers,
        used_exercises: used_exercises
      });

      weekSessions.push(session);
    }

    weeks.push({
      week_number: weekNum,
      is_deload: weekModifiers.is_deload_period,
      intensity_mod: weekModifiers.intensity_mod_multiplier,
      volume_mod: weekModifiers.volume_mod_multiplier,
      phase_slugs: weekPhases,
      sessions: weekSessions,
      total_week_volume_kg: weekSessions.reduce((sum, s) => sum + (s.total_estimated_volume_kg || 0), 0),
    });
  }

  // ─── Step 9: Assemble Output ───
  const program = {
    program_id: generateUUID(),
    metadata: {
      athlete_name: profile.athlete_name || '',
      sport_branch: profile.sport_branch || '',
      user_age: profile.age,
      body_weight_kg: profile.body_weight_kg,
      height_cm: profile.height_cm,
      training_age_level: profile.training_age_level,
      duration_weeks: totalWeeks,
      target_1rm_increase_pct: profile.target_1rm_increase_pct || 10,
      selected_goals: filteredGoals,
      equipment_count: equipment.length,
      days_per_week: getDaysPerWeek(profile.training_age_level),
      language: profile.preferred_language || 'id',
    },
    equipment_data: equipment,
    medical_screening: {
      clearance_status: medicalResults.clearance_status,
      modifiers: medicalResults.modifiers,
    },
    periodization: {
      strategy: periodizationPlan.strategy,
      blocks: periodizationPlan.blocks || [],
      weekly_schedule: periodizationPlan.weekly_schedule || [],
      compatibility_results: periodizationPlan.compatibility_results || [],
    },
    target_validation: targetValidation,
    equipment_recommendations: mvwResult.recommended_equipment || [],
    weeks,
    progression_summary: progressionSummary,
    system_warnings: [...new Set(systemWarnings)],
    generated_at: new Date().toISOString(),
  };

  saveGeneratedProgram(program);

  return { success: true, program };
}

function getDaysPerWeek(level) {
  const norm = (level || 'BEGINNER').toUpperCase();
  switch (norm) {
    case 'BEGINNER':
      return 3;
    case 'INTERMEDIATE':
      return 4;
    case 'ADVANCED':
      return 5;
    default:
      return 3;
  }
}

export function checkReadiness() {
  const missing = [];
  const profile = getUserProfile();
  const equipment = getUserEquipment();
  const screening = getScreeningResults();

  if (!profile) missing.push('profile');
  else {
    if (!profile.age) missing.push('age');
    if (!profile.training_age_level) missing.push('training_age_level');
    if (!profile.active_program_duration_weeks) missing.push('duration');
    if (!profile.selected_goals || profile.selected_goals.length === 0) missing.push('goals');
  }
  if (!equipment || equipment.length === 0) missing.push('equipment');

  return { ready: missing.length === 0, missing };
}
