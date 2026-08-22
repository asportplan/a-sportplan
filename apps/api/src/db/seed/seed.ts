import { db } from "../index.js";
import {
  masterMovementPatterns,
  masterExercises,
  masterTrainingPhases,
  ruleTrainingAgeModifiers,
} from "../schema/master.js";

async function seed() {
  console.log("[Seed] Starting master data database seed...");

  // 1. Movement Patterns
  const patterns = [
    { patternId: 1, patternSlug: 'horizontal_push', planeOfMotion: 'Sagittal', isCoreRequired: false, crossPatternFallbackSlug: null },
    { patternId: 2, patternSlug: 'incline_push', planeOfMotion: 'Sagittal', isCoreRequired: false, crossPatternFallbackSlug: 'horizontal_push' },
    { patternId: 3, patternSlug: 'vertical_pull', planeOfMotion: 'Frontal', isCoreRequired: false, crossPatternFallbackSlug: 'horizontal_pull' },
    { patternId: 4, patternSlug: 'horizontal_pull', planeOfMotion: 'Sagittal/Transverse', isCoreRequired: false, crossPatternFallbackSlug: 'vertical_pull' },
    { patternId: 5, patternSlug: 'vertical_push', planeOfMotion: 'Frontal', isCoreRequired: false, crossPatternFallbackSlug: 'horizontal_push' },
    { patternId: 6, patternSlug: 'knee_dominant_bilateral', planeOfMotion: 'Sagittal', isCoreRequired: false, crossPatternFallbackSlug: null },
    { patternId: 7, patternSlug: 'knee_dominant_isolation', planeOfMotion: 'Sagittal', isCoreRequired: false, crossPatternFallbackSlug: 'knee_dominant_bilateral' },
    { patternId: 8, patternSlug: 'hip_dominant', planeOfMotion: 'Sagittal', isCoreRequired: false, crossPatternFallbackSlug: 'knee_dominant_bilateral' },
    { patternId: 9, patternSlug: 'knee_flexion_isolation', planeOfMotion: 'Sagittal', isCoreRequired: false, crossPatternFallbackSlug: 'hip_dominant' },
    { patternId: 10, patternSlug: 'ankle_plantarflexion', planeOfMotion: 'Sagittal', isCoreRequired: false, crossPatternFallbackSlug: 'knee_dominant_bilateral' },
    { patternId: 11, patternSlug: 'elbow_flexion', planeOfMotion: 'Sagittal', isCoreRequired: false, crossPatternFallbackSlug: 'vertical_pull' },
    { patternId: 12, patternSlug: 'elbow_extension', planeOfMotion: 'Sagittal', isCoreRequired: false, crossPatternFallbackSlug: 'horizontal_push' },
    { patternId: 13, patternSlug: 'shoulder_abduction', planeOfMotion: 'Frontal', isCoreRequired: false, crossPatternFallbackSlug: 'vertical_push' },
    { patternId: 14, patternSlug: 'core_trunk_flexion', planeOfMotion: 'Sagittal', isCoreRequired: true, crossPatternFallbackSlug: 'core_trunk_extension' },
    { patternId: 15, patternSlug: 'core_trunk_extension', planeOfMotion: 'Sagittal', isCoreRequired: true, crossPatternFallbackSlug: 'core_trunk_flexion' },
    { patternId: 16, patternSlug: 'core_trunk_rotation', planeOfMotion: 'Transverse', isCoreRequired: true, crossPatternFallbackSlug: 'core_trunk_flexion' },
    { patternId: 17, patternSlug: 'functional_multi_planar', planeOfMotion: 'Multi-Planar', isCoreRequired: false, crossPatternFallbackSlug: 'horizontal_pull' },
    { patternId: 18, patternSlug: 'hip_abduction_adduction', planeOfMotion: 'Frontal', isCoreRequired: false, crossPatternFallbackSlug: 'hip_dominant' },
  ];

  await db.insert(masterMovementPatterns).values(patterns).onConflictDoNothing();

  // 2. Master Exercises (43 Gym Equipment)
  const exercises = [
    { exerciseId: 1, exerciseSlug: 'bench_press', patternId: 1, primaryMuscleGroupSlug: 'pectoralis_major', substitutionPriorityRank: 1, safetyCategoryLevel: 1, maxAllowedIntensityPct: 1.00 },
    { exerciseId: 2, exerciseSlug: 'incline_press', patternId: 2, primaryMuscleGroupSlug: 'upper_pectoralis', substitutionPriorityRank: 1, safetyCategoryLevel: 1, maxAllowedIntensityPct: 1.00 },
    { exerciseId: 3, exerciseSlug: 'chest_press', patternId: 1, primaryMuscleGroupSlug: 'pectoralis_major', substitutionPriorityRank: 3, safetyCategoryLevel: 2, maxAllowedIntensityPct: 0.80 },
    { exerciseId: 4, exerciseSlug: 'pec_deck', patternId: 1, primaryMuscleGroupSlug: 'pectoralis_major', substitutionPriorityRank: 5, safetyCategoryLevel: 3, maxAllowedIntensityPct: 0.70 },
    { exerciseId: 5, exerciseSlug: 'pull_down', patternId: 3, primaryMuscleGroupSlug: 'latissimus_dorsi', substitutionPriorityRank: 1, safetyCategoryLevel: 2, maxAllowedIntensityPct: 0.80 },
    { exerciseId: 6, exerciseSlug: 'seated_row', patternId: 4, primaryMuscleGroupSlug: 'rhomboids', substitutionPriorityRank: 1, safetyCategoryLevel: 2, maxAllowedIntensityPct: 0.80 },
    { exerciseId: 7, exerciseSlug: 'pull_over', patternId: 3, primaryMuscleGroupSlug: 'latissimus_dorsi', substitutionPriorityRank: 3, safetyCategoryLevel: 3, maxAllowedIntensityPct: 0.70 },
    { exerciseId: 8, exerciseSlug: 'assisted_pull_up', patternId: 3, primaryMuscleGroupSlug: 'latissimus_dorsi', substitutionPriorityRank: 2, safetyCategoryLevel: 2, maxAllowedIntensityPct: 0.80 },
    { exerciseId: 9, exerciseSlug: 'tricep_extension', patternId: 12, primaryMuscleGroupSlug: 'triceps', substitutionPriorityRank: 2, safetyCategoryLevel: 3, maxAllowedIntensityPct: 0.70 },
    { exerciseId: 10, exerciseSlug: 'tricep_dip', patternId: 12, primaryMuscleGroupSlug: 'triceps', substitutionPriorityRank: 1, safetyCategoryLevel: 2, maxAllowedIntensityPct: 0.80 },
    { exerciseId: 11, exerciseSlug: 'arm_curl', patternId: 11, primaryMuscleGroupSlug: 'biceps', substitutionPriorityRank: 1, safetyCategoryLevel: 3, maxAllowedIntensityPct: 0.70 },
    { exerciseId: 12, exerciseSlug: 'preacher_curl', patternId: 11, primaryMuscleGroupSlug: 'biceps', substitutionPriorityRank: 2, safetyCategoryLevel: 3, maxAllowedIntensityPct: 0.70 },
    { exerciseId: 13, exerciseSlug: 'shoulder_press', patternId: 5, primaryMuscleGroupSlug: 'deltoids', substitutionPriorityRank: 1, safetyCategoryLevel: 2, maxAllowedIntensityPct: 0.80 },
    { exerciseId: 14, exerciseSlug: 'lateral_raise', patternId: 13, primaryMuscleGroupSlug: 'lateral_deltoid', substitutionPriorityRank: 1, safetyCategoryLevel: 3, maxAllowedIntensityPct: 0.70 },
    { exerciseId: 15, exerciseSlug: 'kinesis_fore_right', patternId: 17, primaryMuscleGroupSlug: 'kinetic_chain', substitutionPriorityRank: 1, safetyCategoryLevel: 3, maxAllowedIntensityPct: 0.70 },
    { exerciseId: 16, exerciseSlug: 'kinesis_fore_left', patternId: 17, primaryMuscleGroupSlug: 'kinetic_chain', substitutionPriorityRank: 2, safetyCategoryLevel: 3, maxAllowedIntensityPct: 0.70 },
    { exerciseId: 17, exerciseSlug: 'kinesis_back_right', patternId: 4, primaryMuscleGroupSlug: 'latissimus_dorsi', substitutionPriorityRank: 2, safetyCategoryLevel: 3, maxAllowedIntensityPct: 0.70 },
    { exerciseId: 18, exerciseSlug: 'kinesis_back_left', patternId: 4, primaryMuscleGroupSlug: 'latissimus_dorsi', substitutionPriorityRank: 3, safetyCategoryLevel: 3, maxAllowedIntensityPct: 0.70 },
    { exerciseId: 19, exerciseSlug: 'cable_crossover', patternId: 1, primaryMuscleGroupSlug: 'pectoralis_major', substitutionPriorityRank: 4, safetyCategoryLevel: 3, maxAllowedIntensityPct: 0.70 },
    { exerciseId: 20, exerciseSlug: 'smith_machine', patternId: 1, primaryMuscleGroupSlug: 'pectoralis_major', substitutionPriorityRank: 2, safetyCategoryLevel: 1, maxAllowedIntensityPct: 1.00 },
    { exerciseId: 21, exerciseSlug: 'rotary_torso_right', patternId: 16, primaryMuscleGroupSlug: 'obliques', substitutionPriorityRank: 1, safetyCategoryLevel: 3, maxAllowedIntensityPct: 0.70 },
    { exerciseId: 22, exerciseSlug: 'rotary_torso_left', patternId: 16, primaryMuscleGroupSlug: 'obliques', substitutionPriorityRank: 2, safetyCategoryLevel: 3, maxAllowedIntensityPct: 0.70 },
    { exerciseId: 23, exerciseSlug: 'sit_up', patternId: 14, primaryMuscleGroupSlug: 'rectus_abdominis', substitutionPriorityRank: 1, safetyCategoryLevel: 3, maxAllowedIntensityPct: 0.70 },
    { exerciseId: 24, exerciseSlug: 'lower_back', patternId: 15, primaryMuscleGroupSlug: 'erector_spinae', substitutionPriorityRank: 2, safetyCategoryLevel: 3, maxAllowedIntensityPct: 0.70 },
    { exerciseId: 25, exerciseSlug: 'back_extension', patternId: 15, primaryMuscleGroupSlug: 'erector_spinae', substitutionPriorityRank: 1, safetyCategoryLevel: 3, maxAllowedIntensityPct: 0.70 },
    { exerciseId: 26, exerciseSlug: 'abdominal_crunch_machine', patternId: 14, primaryMuscleGroupSlug: 'rectus_abdominis', substitutionPriorityRank: 2, safetyCategoryLevel: 3, maxAllowedIntensityPct: 0.70 },
    { exerciseId: 27, exerciseSlug: 'leg_press_right', patternId: 6, primaryMuscleGroupSlug: 'quadriceps', substitutionPriorityRank: 3, safetyCategoryLevel: 1, maxAllowedIntensityPct: 1.00 },
    { exerciseId: 28, exerciseSlug: 'leg_press_left', patternId: 6, primaryMuscleGroupSlug: 'quadriceps', substitutionPriorityRank: 4, safetyCategoryLevel: 1, maxAllowedIntensityPct: 1.00 },
    { exerciseId: 29, exerciseSlug: 'leg_extension', patternId: 7, primaryMuscleGroupSlug: 'quadriceps', substitutionPriorityRank: 1, safetyCategoryLevel: 3, maxAllowedIntensityPct: 0.70 },
    { exerciseId: 30, exerciseSlug: 'leg_curl', patternId: 9, primaryMuscleGroupSlug: 'hamstrings', substitutionPriorityRank: 1, safetyCategoryLevel: 3, maxAllowedIntensityPct: 0.70 },
    { exerciseId: 31, exerciseSlug: 'squat_rack', patternId: 6, primaryMuscleGroupSlug: 'quadriceps', substitutionPriorityRank: 1, safetyCategoryLevel: 1, maxAllowedIntensityPct: 1.00 },
    { exerciseId: 32, exerciseSlug: 'hack_squat', patternId: 6, primaryMuscleGroupSlug: 'quadriceps', substitutionPriorityRank: 2, safetyCategoryLevel: 2, maxAllowedIntensityPct: 0.80 },
    { exerciseId: 33, exerciseSlug: 'calf_raise_left', patternId: 10, primaryMuscleGroupSlug: 'gastrocnemius', substitutionPriorityRank: 3, safetyCategoryLevel: 3, maxAllowedIntensityPct: 0.70 },
    { exerciseId: 34, exerciseSlug: 'calf_raise_right', patternId: 10, primaryMuscleGroupSlug: 'gastrocnemius', substitutionPriorityRank: 4, safetyCategoryLevel: 3, maxAllowedIntensityPct: 0.70 },
    { exerciseId: 35, exerciseSlug: 'standing_calf_raise', patternId: 10, primaryMuscleGroupSlug: 'gastrocnemius', substitutionPriorityRank: 1, safetyCategoryLevel: 3, maxAllowedIntensityPct: 0.70 },
    { exerciseId: 36, exerciseSlug: 'seated_calf_raise', patternId: 10, primaryMuscleGroupSlug: 'soleus', substitutionPriorityRank: 5, safetyCategoryLevel: 3, maxAllowedIntensityPct: 0.70 },
    { exerciseId: 37, exerciseSlug: 'hip_right', patternId: 8, primaryMuscleGroupSlug: 'gluteus_maximus', substitutionPriorityRank: 4, safetyCategoryLevel: 3, maxAllowedIntensityPct: 0.70 },
    { exerciseId: 38, exerciseSlug: 'hip_left', patternId: 8, primaryMuscleGroupSlug: 'gluteus_maximus', substitutionPriorityRank: 5, safetyCategoryLevel: 3, maxAllowedIntensityPct: 0.70 },
    { exerciseId: 39, exerciseSlug: 'multi_hip_machine', patternId: 8, primaryMuscleGroupSlug: 'gluteus_maximus', substitutionPriorityRank: 2, safetyCategoryLevel: 3, maxAllowedIntensityPct: 0.70 },
    { exerciseId: 40, exerciseSlug: 'glute_machine', patternId: 8, primaryMuscleGroupSlug: 'gluteus_maximus', substitutionPriorityRank: 1, safetyCategoryLevel: 2, maxAllowedIntensityPct: 0.80 },
    { exerciseId: 41, exerciseSlug: 'glute_kickback', patternId: 8, primaryMuscleGroupSlug: 'gluteus_maximus', substitutionPriorityRank: 3, safetyCategoryLevel: 3, maxAllowedIntensityPct: 0.70 },
    { exerciseId: 42, exerciseSlug: 'abductor', patternId: 18, primaryMuscleGroupSlug: 'gluteus_medius', substitutionPriorityRank: 1, safetyCategoryLevel: 3, maxAllowedIntensityPct: 0.70 },
    { exerciseId: 43, exerciseSlug: 'adductor', patternId: 18, primaryMuscleGroupSlug: 'adductors', substitutionPriorityRank: 2, safetyCategoryLevel: 3, maxAllowedIntensityPct: 0.70 },
  ];

  await db.insert(masterExercises).values(exercises).onConflictDoNothing();

  // 3. Training Phases
  const phases = [
    { phaseId: 1, phaseSlug: 'strength_endurance_aa', minIntensityPct: 0.50, maxIntensityPct: 0.70, targetRepsMin: 12, targetRepsMax: 20, targetSetsMin: 2, targetSetsMax: 4, restIntervalSecMin: 30, restIntervalSecMax: 90, tempoCode: '4-2-1-1', usesRpeFlag: false, rpeMin: null, rpeMax: null },
    { phaseId: 2, phaseSlug: 'strength_max', minIntensityPct: 0.85, maxIntensityPct: 1.00, targetRepsMin: 1, targetRepsMax: 5, targetSetsMin: 4, targetSetsMax: 6, restIntervalSecMin: 180, restIntervalSecMax: 300, tempoCode: '1-0-X-0', usesRpeFlag: false, rpeMin: null, rpeMax: null },
    { phaseId: 3, phaseSlug: 'power', minIntensityPct: 0.30, maxIntensityPct: 0.45, targetRepsMin: 1, targetRepsMax: 10, targetSetsMin: 3, targetSetsMax: 6, restIntervalSecMin: 180, restIntervalSecMax: 300, tempoCode: 'X-X-X-X', usesRpeFlag: false, rpeMin: null, rpeMax: null },
    { phaseId: 4, phaseSlug: 'speed_power', minIntensityPct: 0.30, maxIntensityPct: 0.50, targetRepsMin: 4, targetRepsMax: 8, targetSetsMin: 3, targetSetsMax: 5, restIntervalSecMin: 120, restIntervalSecMax: 180, tempoCode: 'X-0-X-0', usesRpeFlag: false, rpeMin: null, rpeMax: null },
    { phaseId: 5, phaseSlug: 'balance_agility', minIntensityPct: null, maxIntensityPct: null, targetRepsMin: 10, targetRepsMax: 15, targetSetsMin: 2, targetSetsMax: 3, restIntervalSecMin: 60, restIntervalSecMax: 60, tempoCode: '4-1-1-1', usesRpeFlag: true, rpeMin: 5.0, rpeMax: 7.0 },
    { phaseId: 6, phaseSlug: 'core_stability', minIntensityPct: null, maxIntensityPct: null, targetRepsMin: 12, targetRepsMax: 20, targetSetsMin: 2, targetSetsMax: 3, restIntervalSecMin: 0, restIntervalSecMax: 60, tempoCode: '4-2-1-1', usesRpeFlag: true, rpeMin: 6.0, rpeMax: 8.0 },
    { phaseId: 7, phaseSlug: 'functional_training', minIntensityPct: 0.60, maxIntensityPct: 0.80, targetRepsMin: 8, targetRepsMax: 15, targetSetsMin: 3, targetSetsMax: 5, restIntervalSecMin: 60, restIntervalSecMax: 90, tempoCode: '2-0-2-0', usesRpeFlag: false, rpeMin: null, rpeMax: null },
    { phaseId: 8, phaseSlug: 'stabilization_endurance', minIntensityPct: 0.50, maxIntensityPct: 0.70, targetRepsMin: 12, targetRepsMax: 20, targetSetsMin: 1, targetSetsMax: 3, restIntervalSecMin: 0, restIntervalSecMax: 90, tempoCode: '4-2-1-1', usesRpeFlag: false, rpeMin: null, rpeMax: null },
    { phaseId: 9, phaseSlug: 'muscular_endurance', minIntensityPct: 0.50, maxIntensityPct: 0.70, targetRepsMin: 15, targetRepsMax: 25, targetSetsMin: 2, targetSetsMax: 4, restIntervalSecMin: 30, restIntervalSecMax: 60, tempoCode: '2-0-2-0', usesRpeFlag: false, rpeMin: null, rpeMax: null },
    { phaseId: 10, phaseSlug: 'hypertrophy', minIntensityPct: 0.75, maxIntensityPct: 0.85, targetRepsMin: 6, targetRepsMax: 12, targetSetsMin: 3, targetSetsMax: 6, restIntervalSecMin: 60, restIntervalSecMax: 90, tempoCode: '2-0-2-0', usesRpeFlag: false, rpeMin: null, rpeMax: null },
  ];

  await db.insert(masterTrainingPhases).values(phases).onConflictDoNothing();

  // 4. Training Age Modifiers
  const ageModifiers = [
    { trainingAgeLevel: 'BEGINNER', volumeMultiplier: 0.75, restMultiplier: 1.25, weeklyFrequencyMin: 2, weeklyFrequencyMax: 3, progressionModel: 'linear', weeklyLoadIncreasePctMin: 0.025, weeklyLoadIncreasePctMax: 0.05, mesocycleLengthWeeks: 5 },
    { trainingAgeLevel: 'INTERMEDIATE', volumeMultiplier: 1.0, restMultiplier: 1.0, weeklyFrequencyMin: 3, weeklyFrequencyMax: 5, progressionModel: 'undulating', weeklyLoadIncreasePctMin: 0.0025, weeklyLoadIncreasePctMax: 0.00625, mesocycleLengthWeeks: 4 },
    { trainingAgeLevel: 'ADVANCED', volumeMultiplier: 1.25, restMultiplier: 0.85, weeklyFrequencyMin: 4, weeklyFrequencyMax: 6, progressionModel: 'block', weeklyLoadIncreasePctMin: 0.00042, weeklyLoadIncreasePctMax: 0.00083, mesocycleLengthWeeks: 3 },
  ];

  await db.insert(ruleTrainingAgeModifiers).values(ageModifiers).onConflictDoNothing();

  console.log("[Seed] Seeding completed successfully!");
}

seed().catch((err) => {
  console.error("[Seed Error]", err);
  process.exit(1);
});
