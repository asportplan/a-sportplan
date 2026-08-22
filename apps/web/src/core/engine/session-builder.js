import { RULE_INTRA_WORKOUT_PRIORITY, getPhaseBySlug, MST_MOVEMENT_PATTERNS, MST_EXERCISES } from '../db/master-data.js';
import { generateSessionId, calculateTUT } from '../utils/helpers.js';
import { getBodyAreaForPattern } from './medical-triage.js';

import { findBestExercise } from './equipment-substitution.js';
import { calculateExerciseIntensity } from './intensity-calculator.js';
import { applyLoadSafetyCap } from './load-safety.js';
import { applyVolumeModifier, applyRestModifier } from './training-age-modifier.js';

const LAYER_ORDER = {
  'main_compound': 1,
  'secondary_compound': 2,
  'isolation': 3,
  'core': 4
};

/**
 * Builds a single workout session by running through all NSCA/ACSM rules.
 * @param {object} config - Configuration object with phase, modifiers, etc.
 * @returns {object} The assembled session
 */
export function buildSession(config) {
  const {
    day_number, week_number, phase_slug, 
    available_equipment_slugs,
    user_equipment_data,
    training_age_level,
    week_modifiers,
    medical_modifiers,
    age_group_modifiers,
    used_exercises
  } = config;

  const availSlugs = Array.isArray(available_equipment_slugs)
    ? available_equipment_slugs
    : (available_equipment_slugs ? Array.from(available_equipment_slugs) : []);

  const sessionId = generateSessionId();
  const phase = getPhaseBySlug(phase_slug) || getPhaseBySlug('strength_endurance_aa');
  
  const normLevel = (training_age_level || 'BEGINNER').toUpperCase();
  let splitType = 'full';
  if (normLevel === 'INTERMEDIATE') splitType = 'upper_lower';
  if (normLevel === 'ADVANCED') splitType = 'ppl';

  let selectedPatterns = [];
  
  // Phase specific pattern additions
  let basePatterns = [];
  if (phase_slug.includes('core')) {
    basePatterns = ['core_trunk_flexion', 'core_trunk_extension', 'core_trunk_rotation'];
  } else if (phase_slug === 'balance_agility' || phase_slug === 'functional_training') {
    basePatterns = ['functional_multi_planar', 'core_trunk_rotation'];
  } else if (phase_slug === 'power' || phase_slug === 'speed_power') {
    basePatterns = ['horizontal_push', 'knee_dominant_bilateral', 'vertical_pull', 'hip_dominant'];
  } else {
    basePatterns = ['horizontal_push', 'horizontal_pull', 'vertical_pull', 'knee_dominant_bilateral', 'hip_dominant', 'core_trunk_flexion'];
  }

  if (splitType === 'full') {
    selectedPatterns = ['horizontal_push', 'horizontal_pull', 'knee_dominant_bilateral', 'vertical_pull', 'vertical_push', 'hip_dominant', 'shoulder_abduction', 'elbow_flexion', 'elbow_extension', 'core_trunk_flexion'];
  } else if (splitType === 'upper_lower') {
    if (day_number % 2 !== 0) { // Upper
      selectedPatterns = ['horizontal_push', 'incline_push', 'vertical_pull', 'horizontal_pull', 'vertical_push', 'shoulder_abduction', 'elbow_flexion', 'elbow_extension', 'core_trunk_rotation'];
    } else { // Lower
      selectedPatterns = ['knee_dominant_bilateral', 'hip_dominant', 'knee_dominant_isolation', 'knee_flexion_isolation', 'ankle_plantarflexion', 'hip_abduction_adduction', 'core_trunk_flexion'];
    }
  } else {
    // Push Pull Legs (PPL)
    const modDay = day_number % 3;
    if (modDay === 1) { // Push
      selectedPatterns = ['horizontal_push', 'incline_push', 'vertical_push', 'shoulder_abduction', 'elbow_extension', 'core_trunk_flexion'];
    } else if (modDay === 2) { // Pull
      selectedPatterns = ['vertical_pull', 'horizontal_pull', 'elbow_flexion', 'core_trunk_rotation'];
    } else { // Legs
      selectedPatterns = ['knee_dominant_bilateral', 'hip_dominant', 'knee_dominant_isolation', 'knee_flexion_isolation', 'ankle_plantarflexion', 'hip_abduction_adduction'];
    }
  }

  let prescribedExercises = [];
  let executionOrder = 1;
  const existingSlugs = new Set();
  const muscleGroupCounts = {};
  let isolationCount = 0;

  const helperAddExercise = (exerciseInfo, patternSlug) => {
    if (!exerciseInfo || !exerciseInfo.exercise) return false;
    const exercise = exerciseInfo.exercise;

    if (existingSlugs.has(exercise.exercise_slug)) return false;

    // Rule: Anti-Junk Volume - Max 3 exercises per muscle group per session
    const muscleGroup = exercise.primary_muscle_group_slug || 'general';
    if ((muscleGroupCounts[muscleGroup] || 0) >= 3) return false;

    // Rule: Max 4 isolation exercises per day
    const layer = exercise.operational_layer || 'isolation';
    if (layer === 'isolation' && isolationCount >= 4) return false;

    existingSlugs.add(exercise.exercise_slug);
    if (used_exercises) used_exercises.add(exercise.exercise_slug);
    muscleGroupCounts[muscleGroup] = (muscleGroupCounts[muscleGroup] || 0) + 1;
    if (layer === 'isolation') isolationCount++;

    const user1rm = user_equipment_data?.find(d => d.exercise_slug === exercise.exercise_slug)?.user_1rm_kg || null;
    const intensityResult = calculateExerciseIntensity(
      phase_slug, exercise.exercise_slug, user1rm, week_modifiers, age_group_modifiers, medical_modifiers
    );

    let baseIntensityPct = intensityResult ? (intensityResult.intensity_pct || 0.7) : 0.7;
    let baseReps = Math.round(((phase.target_reps_min || 8) + (phase.target_reps_max || 12)) / 2);

    const safetyCapResult = applyLoadSafetyCap(exercise, baseIntensityPct, user1rm, phase_slug, baseReps);

    let baseSets = Math.round(((phase.target_sets_min || 3) + (phase.target_sets_max || 4)) / 2);
    
    // Set Caps per Operational Layer & Training Age (NSCA & ACSM Matrix)
    let minSetsLimit = 3;
    let maxSetsLimit = 4;

    if (normLevel === 'BEGINNER') {
      if (layer === 'isolation' || layer === 'core') {
        minSetsLimit = 1;
        maxSetsLimit = 2;
      } else {
        minSetsLimit = 2;
        maxSetsLimit = 3;
      }
    } else if (normLevel === 'INTERMEDIATE') {
      if (layer === 'isolation' || layer === 'core') {
        minSetsLimit = 2;
        maxSetsLimit = 3;
      } else {
        minSetsLimit = 3;
        maxSetsLimit = 4;
      }
    } else { // ADVANCED
      if (layer === 'isolation' || layer === 'core') {
        minSetsLimit = 3;
        maxSetsLimit = 4;
      } else {
        minSetsLimit = 3;
        maxSetsLimit = 5;
      }
    }

    let targetSets = Math.min(maxSetsLimit, Math.max(minSetsLimit, baseSets));

    if (week_modifiers.is_deload_period) {
      targetSets = Math.max(1, targetSets - (week_modifiers.deload_set_reduction || 1));
    }
    
    let targetReps = safetyCapResult.adjusted_reps || baseReps;
    let targetRest = Math.round(((phase.rest_interval_sec_min || 60) + (phase.rest_interval_sec_max || 90)) / 2);
    targetRest = applyRestModifier(targetRest, medical_modifiers?.rest_multiplier || 1, age_group_modifiers?.rest_multiplier_override);

    const timeUnderTension = calculateTUT(phase.tempo_code || '2-0-2-0') * targetReps;
    const finalLoadKg = safetyCapResult.final_load_kg || (user1rm ? Math.round(user1rm * safetyCapResult.final_intensity_pct) : null);

    const item = {
      execution_order: executionOrder++,
      movement_pattern_slug: patternSlug,
      exercise_slug: exercise.exercise_slug,
      substitution_diagnostics: (exerciseInfo.diagnostics && exerciseInfo.diagnostics.fallback_status !== 'NONE') ? exerciseInfo.diagnostics : null,
      safety_category: exercise.safety_category_level,
      max_intensity_cap: safetyCapResult.max_intensity_cap,
      uses_rpe_flag: intensityResult ? intensityResult.uses_rpe : false,
      intensity_pct: safetyCapResult.final_intensity_pct,
      load_kg: finalLoadKg,
      missing_1rm: (!user1rm && !(intensityResult ? intensityResult.uses_rpe : false)),
      target_rpe: intensityResult ? intensityResult.target_rpe : null,
      time_under_tension_sec: timeUnderTension,
      sets: targetSets,
      reps: targetReps,
      rest_interval_seconds: targetRest,
      tempo_code: phase.tempo_code || '2-0-2-0',
      capped_by_safety_module: safetyCapResult.capped_by_safety_module,
      operational_layer: exercise.operational_layer || 'secondary_compound',
      paired_asymmetric_slug: exercise.paired_asymmetric_slug || null,
      notes: []
    };

    prescribedExercises.push(item);

    // Rule: Unilateral Left/Right Pairing - Automatically pair asymmetric partner
    if (exercise.paired_asymmetric_slug && !existingSlugs.has(exercise.paired_asymmetric_slug)) {
      const partnerMeta = MST_EXERCISES.find(e => e.exercise_slug === exercise.paired_asymmetric_slug);
      if (partnerMeta && availSlugs.includes(partnerMeta.exercise_slug)) {
        const partnerInfo = { exercise: partnerMeta, diagnostics: { fallback_status: 'NONE' } };
        helperAddExercise(partnerInfo, patternSlug);
      }
    }

    return true;
  };

  for (const patternSlug of selectedPatterns) {
    const area = getBodyAreaForPattern ? getBodyAreaForPattern(patternSlug) : 'upper';
    if (medical_modifiers.blocked_patterns && medical_modifiers.blocked_patterns.includes(patternSlug)) {
      continue;
    }

    const blockedCategories = medical_modifiers.blocked_safety_categories_per_area?.[area] || [];
    const exerciseInfo = findBestExercise(patternSlug, availSlugs, blockedCategories, used_exercises);
    
    if (exerciseInfo && exerciseInfo.exercise) {
      helperAddExercise(exerciseInfo, patternSlug);
    }
  }

  // Accessory pass: If prescribedExercises < 7 and user has unused equipment matching the day's selected patterns, add them!
  if (prescribedExercises.length < 7 && availSlugs && availSlugs.length > prescribedExercises.length) {
    for (const patternSlug of selectedPatterns) {
      if (prescribedExercises.length >= 8) break;

      const area = getBodyAreaForPattern ? getBodyAreaForPattern(patternSlug) : 'upper';
      if (medical_modifiers.blocked_patterns && medical_modifiers.blocked_patterns.includes(patternSlug)) continue;
      
      const blockedCategories = medical_modifiers.blocked_safety_categories_per_area?.[area] || [];
      const exerciseInfo = findBestExercise(patternSlug, availSlugs, blockedCategories, existingSlugs);

      if (exerciseInfo && exerciseInfo.exercise) {
        helperAddExercise(exerciseInfo, patternSlug);
      }
    }
  }

  // Fallback: If prescribedExercises is empty, fill with available equipment exercises
  if (prescribedExercises.length === 0) {
    const fallbackPatterns = ['horizontal_push', 'horizontal_pull', 'vertical_pull', 'vertical_push', 'elbow_flexion', 'elbow_extension', 'core_trunk_flexion'];
    for (const patternSlug of fallbackPatterns) {
      const exerciseInfo = findBestExercise(patternSlug, availSlugs, [], used_exercises);
      if (exerciseInfo && exerciseInfo.exercise) {
        helperAddExercise(exerciseInfo, patternSlug);
        if (prescribedExercises.length >= 4) break;
      }
    }
  }

  // === RULE: NSCA/ACSM INTRA-WORKOUT EXECUTION ORDER SORTING ===
  // Order MUST BE: [A] Main Compound (1) -> [B] Secondary Compound (2) -> [C] Isolation (3) -> [D] Core & Spinal Stabilizers (4)
  prescribedExercises.sort((a, b) => {
    const layerA = LAYER_ORDER[a.operational_layer] || 3;
    const layerB = LAYER_ORDER[b.operational_layer] || 3;
    
    if (layerA !== layerB) {
      return layerA - layerB;
    }
    
    // Maintain Left & Right paired exercises together
    if (a.paired_asymmetric_slug === b.exercise_slug) return -1;
    if (b.paired_asymmetric_slug === a.exercise_slug) return 1;
    
    return a.execution_order - b.execution_order;
  });

  // Re-assign execution order sequentially
  prescribedExercises.forEach((ex, idx) => {
    ex.execution_order = idx + 1;
  });

  // === RULE: TOTAL DAILY SESSION VOLUME CEILING (MRV PROTECTOR) ===
  // Beginner: max 14 total sets, Intermediate: max 18 total sets, Advanced: max 22 total sets
  const maxSessionSetsCeiling = normLevel === 'BEGINNER' ? 14 : normLevel === 'INTERMEDIATE' ? 18 : 22;
  
  let currentTotalSets = prescribedExercises.reduce((sum, ex) => sum + ex.sets, 0);
  if (currentTotalSets > maxSessionSetsCeiling) {
    for (let i = prescribedExercises.length - 1; i >= 0; i--) {
      if (currentTotalSets <= maxSessionSetsCeiling) break;
      const ex = prescribedExercises[i];
      const minAllowableSets = (ex.operational_layer === 'isolation' || ex.operational_layer === 'core') ? 2 : 3;
      if (ex.sets > minAllowableSets) {
        const diff = Math.min(ex.sets - minAllowableSets, currentTotalSets - maxSessionSetsCeiling);
        ex.sets -= diff;
        currentTotalSets -= diff;
      }
    }
  }

  const rawVolume = prescribedExercises.reduce((sum, ex) => sum + (ex.load_kg || 0) * ex.sets * ex.reps, 0);
  const totalVolume = Math.round(rawVolume);

  return {
    session_id: sessionId, 
    day_number, 
    week_number, 
    phase_slug, 
    focus_title: phase ? phase.phase_slug.replace(/_/g, ' ').toUpperCase() : 'Workout Session',
    is_deload_week: week_modifiers.is_deload_period, 
    medical_clearance_status: 'CLEAR',
    exercises: prescribedExercises,
    prescribed_exercises: prescribedExercises,
    session_volume_kg: totalVolume,
    total_estimated_volume_kg: totalVolume,
    system_warnings: []
  };
}
