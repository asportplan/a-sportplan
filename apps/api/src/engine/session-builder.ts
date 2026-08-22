import { RULE_INTRA_WORKOUT_PRIORITY, getPhaseBySlug, MST_MOVEMENT_PATTERNS } from './master-data.js';
import { generateSessionId, calculateTUT } from '../utils/helpers.js';
import { getBodyAreaForPattern } from './medical-triage.engine.js';

import { findBestExercise } from './substitution.engine.js';
import { calculateExerciseIntensity } from './intensity-calculator.js';
import { applyLoadSafetyCap } from './load-safety.js';
import { applyVolumeModifier, applyRestModifier } from './training-age-modifier.js';

/**
 * Builds a single workout session by running through all rules.
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
    selectedPatterns = [...new Set([...basePatterns])];
  } else if (splitType === 'upper_lower') {
    if (day_number % 2 !== 0) { // Upper
      selectedPatterns = [...new Set([...basePatterns.filter(p => !p.includes('knee') && !p.includes('hip') && !p.includes('ankle')), 'horizontal_push', 'vertical_pull', 'horizontal_pull', 'vertical_push', 'elbow_flexion', 'elbow_extension'])];
    } else { // Lower
      selectedPatterns = [...new Set([...basePatterns.filter(p => p.includes('knee') || p.includes('hip') || p.includes('ankle') || p.includes('core')), 'knee_dominant_bilateral', 'hip_dominant', 'knee_dominant_isolation', 'knee_flexion_isolation', 'ankle_plantarflexion', 'core_trunk_flexion'])];
    }
  } else {
    // Push Pull Legs
    const modDay = day_number % 3;
    if (modDay === 1) { // Push
      selectedPatterns = [...new Set([...basePatterns.filter(p => p.includes('push') || p.includes('extension')), 'horizontal_push', 'incline_push', 'vertical_push', 'elbow_extension', 'core_trunk_flexion'])];
    } else if (modDay === 2) { // Pull
      selectedPatterns = [...new Set([...basePatterns.filter(p => p.includes('pull') || p.includes('flexion') && !p.includes('knee')), 'vertical_pull', 'horizontal_pull', 'elbow_flexion', 'core_trunk_rotation'])];
    } else { // Legs
      selectedPatterns = [...new Set([...basePatterns.filter(p => p.includes('knee') || p.includes('hip') || p.includes('ankle')), 'knee_dominant_bilateral', 'hip_dominant', 'knee_dominant_isolation', 'knee_flexion_isolation', 'ankle_plantarflexion'])];
    }
  }

  let prescribedExercises = [];
  let executionOrder = 1;

  for (const patternSlug of selectedPatterns) {
    const area = getBodyAreaForPattern ? getBodyAreaForPattern(patternSlug) : 'upper';
    
    if (medical_modifiers.blocked_patterns && medical_modifiers.blocked_patterns.includes(patternSlug)) {
      continue;
    }

    const blockedCategories = medical_modifiers.blocked_safety_categories_per_area?.[area] || [];
    const exerciseInfo = findBestExercise(patternSlug, available_equipment_slugs, blockedCategories, used_exercises);
    
    if (!exerciseInfo || !exerciseInfo.exercise) {
      continue;
    }

    const exercise = exerciseInfo.exercise;
    const user1rm = user_equipment_data?.find(d => d.exercise_slug === exercise.exercise_slug)?.user_1rm_kg || null;

    // Intensity Calculation
    const intensityResult = calculateExerciseIntensity(
      phase_slug, exercise.exercise_slug, user1rm, week_modifiers, age_group_modifiers, medical_modifiers
    );

    let baseIntensityPct = intensityResult ? (intensityResult.intensity_pct || 0.7) : 0.7;
    let baseReps = Math.round(((phase.target_reps_min || 8) + (phase.target_reps_max || 12)) / 2);

    // Apply Load Safety Cap
    const safetyCapResult = applyLoadSafetyCap(exercise, baseIntensityPct, user1rm, phase_slug, baseReps);

    let targetSets = Math.round(((phase.target_sets_min || 3) + (phase.target_sets_max || 4)) / 2);
    targetSets = applyVolumeModifier(targetSets, week_modifiers.volume_mod_multiplier, age_group_modifiers?.volume_multiplier_override);
    
    if (week_modifiers.is_deload_period) {
      targetSets = Math.max(1, targetSets - (week_modifiers.deload_set_reduction || 1));
    }
    
    let targetReps = safetyCapResult.adjusted_reps || baseReps;
    
    let targetRest = Math.round(((phase.rest_interval_sec_min || 60) + (phase.rest_interval_sec_max || 90)) / 2);
    targetRest = applyRestModifier(targetRest, medical_modifiers?.rest_multiplier || 1, age_group_modifiers?.rest_multiplier_override);

    const timeUnderTension = calculateTUT(phase.tempo_code || '2-0-2-0') * targetReps;

    const finalLoadKg = safetyCapResult.final_load_kg || (user1rm ? Math.round(user1rm * safetyCapResult.final_intensity_pct) : null);
    
    const missing1rmFlag = (!user1rm && !(intensityResult ? intensityResult.uses_rpe : false));
    if (used_exercises) used_exercises.add(exercise.exercise_slug);

    prescribedExercises.push({
      execution_order: executionOrder++,
      movement_pattern_slug: patternSlug,
      exercise_slug: exercise.exercise_slug,
      substitution_diagnostics: (exerciseInfo.diagnostics && exerciseInfo.diagnostics.fallback_status !== 'NONE') ? exerciseInfo.diagnostics : null,
      safety_category: exercise.safety_category_level,
      max_intensity_cap: safetyCapResult.max_intensity_cap,
      uses_rpe_flag: intensityResult ? intensityResult.uses_rpe : false,
      intensity_pct: safetyCapResult.final_intensity_pct,
      load_kg: finalLoadKg,
      missing_1rm: missing1rmFlag,
      target_rpe: intensityResult ? intensityResult.target_rpe : null,
      time_under_tension_sec: timeUnderTension,
      sets: targetSets,
      reps: targetReps,
      rest_interval_seconds: targetRest,
      tempo_code: phase.tempo_code || '2-0-2-0',
      capped_by_safety_module: safetyCapResult.capped_by_safety_module,
      notes: []
    });
  }

  // Fallback: If prescribedExercises is empty (e.g. user selected split with no matching equipment for this day), fill with available equipment exercises
  if (prescribedExercises.length === 0) {
    const fallbackPatterns = ['horizontal_push', 'horizontal_pull', 'vertical_pull', 'vertical_push', 'elbow_flexion', 'elbow_extension', 'core_trunk_flexion'];
    for (const patternSlug of fallbackPatterns) {
      const exerciseInfo = findBestExercise(patternSlug, available_equipment_slugs, [], used_exercises);
      if (exerciseInfo && exerciseInfo.exercise) {
        const exercise = exerciseInfo.exercise;
        const user1rm = user_equipment_data?.find(d => d.exercise_slug === exercise.exercise_slug)?.user_1rm_kg || null;
        const intensityResult = calculateExerciseIntensity(phase_slug, exercise.exercise_slug, user1rm, week_modifiers, age_group_modifiers, medical_modifiers);
        let baseIntensityPct = intensityResult ? (intensityResult.intensity_pct || 0.7) : 0.7;
        let baseReps = Math.round(((phase.target_reps_min || 8) + (phase.target_reps_max || 12)) / 2);
        const safetyCapResult = applyLoadSafetyCap(exercise, baseIntensityPct, user1rm, phase_slug, baseReps);
        let targetSets = Math.round(((phase.target_sets_min || 3) + (phase.target_sets_max || 4)) / 2);
        const finalLoadKg = safetyCapResult.final_load_kg || (user1rm ? Math.round((user1rm * safetyCapResult.final_intensity_pct) * 2) / 2 : null);

        prescribedExercises.push({
          execution_order: executionOrder++,
          movement_pattern_slug: patternSlug,
          exercise_slug: exercise.exercise_slug,
          substitution_diagnostics: exerciseInfo.diagnostics,
          safety_category: exercise.safety_category_level,
          max_intensity_cap: safetyCapResult.max_intensity_cap,
          uses_rpe_flag: false,
          intensity_pct: safetyCapResult.final_intensity_pct,
          load_kg: finalLoadKg,
          missing_1rm: !user1rm,
          time_under_tension_sec: calculateTUT(phase.tempo_code || '2-0-2-0') * baseReps,
          sets: targetSets,
          reps: baseReps,
          rest_interval_seconds: 60,
          tempo_code: phase.tempo_code || '2-0-2-0',
          capped_by_safety_module: safetyCapResult.capped_by_safety_module,
          notes: []
        });

        if (prescribedExercises.length >= 4) break;
      }
    }
  }

  // Sort by priority (power first, core last)
  prescribedExercises.sort((a, b) => {
    const isCoreA = a.movement_pattern_slug.includes('core') ? 1 : 0;
    const isCoreB = b.movement_pattern_slug.includes('core') ? 1 : 0;
    return isCoreA - isCoreB;
  });

  prescribedExercises.forEach((ex, idx) => {
    ex.execution_order = idx + 1;
  });

  const rawVolume = prescribedExercises.reduce((sum, ex) => sum + (ex.load_kg || 0) * ex.sets * ex.reps, 0);
  const totalVolume = Math.round(rawVolume);

  return {
    session_id: sessionId, 
    day_number, 
    week_number, 
    phase_slug, 
    focus_title: (phase ? phase.phase_slug.replace(/_/g, ' ').toUpperCase() : 'Workout Session'),
    is_deload_week: week_modifiers.is_deload_period, 
    medical_clearance_status: 'CLEAR',
    exercises: prescribedExercises,
    prescribed_exercises: prescribedExercises,
    session_volume_kg: totalVolume,
    total_estimated_volume_kg: totalVolume,
    system_warnings: []
  };
}
