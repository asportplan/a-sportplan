/**
 * Single source of truth for the rule engine master data.
 * All master data exported as constants using slugs/IDs.
 */

// === TABLE 1: MST_MOVEMENT_PATTERNS ===
export const MST_MOVEMENT_PATTERNS = [
  { pattern_id: 1, pattern_slug: 'horizontal_push', plane_of_motion: 'Sagittal', is_core_required: false, cross_pattern_fallback_slug: null },
  { pattern_id: 2, pattern_slug: 'incline_push', plane_of_motion: 'Sagittal', is_core_required: false, cross_pattern_fallback_slug: 'horizontal_push' },
  { pattern_id: 3, pattern_slug: 'vertical_pull', plane_of_motion: 'Frontal', is_core_required: false, cross_pattern_fallback_slug: 'horizontal_pull' },
  { pattern_id: 4, pattern_slug: 'horizontal_pull', plane_of_motion: 'Sagittal/Transverse', is_core_required: false, cross_pattern_fallback_slug: 'vertical_pull' },
  { pattern_id: 5, pattern_slug: 'vertical_push', plane_of_motion: 'Frontal', is_core_required: false, cross_pattern_fallback_slug: 'horizontal_push' },
  { pattern_id: 6, pattern_slug: 'knee_dominant_bilateral', plane_of_motion: 'Sagittal', is_core_required: false, cross_pattern_fallback_slug: null },
  { pattern_id: 7, pattern_slug: 'knee_dominant_isolation', plane_of_motion: 'Sagittal', is_core_required: false, cross_pattern_fallback_slug: 'knee_dominant_bilateral' },
  { pattern_id: 8, pattern_slug: 'hip_dominant', plane_of_motion: 'Sagittal', is_core_required: false, cross_pattern_fallback_slug: 'knee_dominant_bilateral' },
  { pattern_id: 9, pattern_slug: 'knee_flexion_isolation', plane_of_motion: 'Sagittal', is_core_required: false, cross_pattern_fallback_slug: 'hip_dominant' },
  { pattern_id: 10, pattern_slug: 'ankle_plantarflexion', plane_of_motion: 'Sagittal', is_core_required: false, cross_pattern_fallback_slug: 'knee_dominant_bilateral' },
  { pattern_id: 11, pattern_slug: 'elbow_flexion', plane_of_motion: 'Sagittal', is_core_required: false, cross_pattern_fallback_slug: 'vertical_pull' },
  { pattern_id: 12, pattern_slug: 'elbow_extension', plane_of_motion: 'Sagittal', is_core_required: false, cross_pattern_fallback_slug: 'horizontal_push' },
  { pattern_id: 13, pattern_slug: 'shoulder_abduction', plane_of_motion: 'Frontal', is_core_required: false, cross_pattern_fallback_slug: 'vertical_push' },
  { pattern_id: 14, pattern_slug: 'core_trunk_flexion', plane_of_motion: 'Sagittal', is_core_required: true, cross_pattern_fallback_slug: 'core_trunk_extension' },
  { pattern_id: 15, pattern_slug: 'core_trunk_extension', plane_of_motion: 'Sagittal', is_core_required: true, cross_pattern_fallback_slug: 'core_trunk_flexion' },
  { pattern_id: 16, pattern_slug: 'core_trunk_rotation', plane_of_motion: 'Transverse', is_core_required: true, cross_pattern_fallback_slug: 'core_trunk_flexion' },
  { pattern_id: 17, pattern_slug: 'functional_multi_planar', plane_of_motion: 'Multi-Planar', is_core_required: false, cross_pattern_fallback_slug: 'horizontal_pull' },
  { pattern_id: 18, pattern_slug: 'hip_abduction_adduction', plane_of_motion: 'Frontal', is_core_required: false, cross_pattern_fallback_slug: 'hip_dominant' }
];

export const CROSS_PATTERN_COMPENSATION = {
  'incline_push': { compensate_pattern: 'vertical_push', extra_sets: 1 },
  'knee_flexion_isolation': { compensate_pattern: 'hip_dominant', extra_sets: 1 },
  'knee_dominant_isolation': { compensate_pattern: 'knee_dominant_bilateral', extra_sets: 0, load_intensity_modifier: 0.90 },
  'shoulder_abduction': { compensate_pattern: 'vertical_push', extra_sets: 0, load_intensity_modifier: 0.90 },
  'elbow_flexion': { compensate_pattern: 'vertical_pull', extra_sets: 1 },
  'elbow_extension': { compensate_pattern: 'horizontal_push', extra_sets: 1 }
};

// === TABLE 2: MST_EXERCISES (Optimized with equipment_type, load_step_kg, operational_layer, & paired_asymmetric_slug) ===
export const MST_EXERCISES = [
  // Upper Body & Core
  { exercise_id: 1, exercise_slug: 'bench_press', pattern_id: 1, primary_muscle_group_slug: 'pectoralis_major', substitution_priority_rank: 1, safety_category_level: 1, max_allowed_intensity_pct: 1.00, equipment_type: 'barbell', load_step_kg: 2.5, operational_layer: 'main_compound' },
  { exercise_id: 2, exercise_slug: 'incline_press', pattern_id: 2, primary_muscle_group_slug: 'upper_pectoralis', substitution_priority_rank: 1, safety_category_level: 1, max_allowed_intensity_pct: 1.00, equipment_type: 'barbell', load_step_kg: 2.5, operational_layer: 'main_compound' },
  { exercise_id: 3, exercise_slug: 'chest_press', pattern_id: 1, primary_muscle_group_slug: 'pectoralis_major', substitution_priority_rank: 3, safety_category_level: 2, max_allowed_intensity_pct: 0.80, equipment_type: 'machine', load_step_kg: 5.0, operational_layer: 'secondary_compound' },
  { exercise_id: 4, exercise_slug: 'pec_deck', pattern_id: 1, primary_muscle_group_slug: 'pectoralis_major', substitution_priority_rank: 5, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'machine', load_step_kg: 5.0, operational_layer: 'isolation' },
  { exercise_id: 5, exercise_slug: 'pull_down', pattern_id: 3, primary_muscle_group_slug: 'latissimus_dorsi', substitution_priority_rank: 1, safety_category_level: 2, max_allowed_intensity_pct: 0.80, equipment_type: 'cable', load_step_kg: 5.0, operational_layer: 'secondary_compound' },
  { exercise_id: 6, exercise_slug: 'seated_row', pattern_id: 4, primary_muscle_group_slug: 'rhomboids', substitution_priority_rank: 1, safety_category_level: 2, max_allowed_intensity_pct: 0.80, equipment_type: 'cable', load_step_kg: 5.0, operational_layer: 'secondary_compound' },
  { exercise_id: 7, exercise_slug: 'pull_over', pattern_id: 3, primary_muscle_group_slug: 'latissimus_dorsi', substitution_priority_rank: 3, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'machine', load_step_kg: 5.0, operational_layer: 'isolation' },
  { exercise_id: 8, exercise_slug: 'assisted_pull_up', pattern_id: 3, primary_muscle_group_slug: 'latissimus_dorsi', substitution_priority_rank: 2, safety_category_level: 2, max_allowed_intensity_pct: 0.80, equipment_type: 'machine', load_step_kg: 5.0, operational_layer: 'secondary_compound' },
  { exercise_id: 9, exercise_slug: 'tricep_extension', pattern_id: 12, primary_muscle_group_slug: 'triceps', substitution_priority_rank: 2, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'cable', load_step_kg: 2.5, operational_layer: 'isolation' },
  { exercise_id: 10, exercise_slug: 'tricep_dip', pattern_id: 12, primary_muscle_group_slug: 'triceps', substitution_priority_rank: 1, safety_category_level: 2, max_allowed_intensity_pct: 0.80, equipment_type: 'machine', load_step_kg: 5.0, operational_layer: 'isolation' },
  { exercise_id: 11, exercise_slug: 'arm_curl', pattern_id: 11, primary_muscle_group_slug: 'biceps', substitution_priority_rank: 1, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'machine', load_step_kg: 5.0, operational_layer: 'isolation' },
  { exercise_id: 12, exercise_slug: 'preacher_curl', pattern_id: 11, primary_muscle_group_slug: 'biceps', substitution_priority_rank: 2, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'machine', load_step_kg: 5.0, operational_layer: 'isolation' },
  { exercise_id: 13, exercise_slug: 'shoulder_press', pattern_id: 5, primary_muscle_group_slug: 'deltoids', substitution_priority_rank: 1, safety_category_level: 2, max_allowed_intensity_pct: 0.80, equipment_type: 'machine', load_step_kg: 5.0, operational_layer: 'main_compound' },
  { exercise_id: 14, exercise_slug: 'lateral_raise', pattern_id: 13, primary_muscle_group_slug: 'lateral_deltoid', substitution_priority_rank: 1, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'machine', load_step_kg: 5.0, operational_layer: 'isolation' },
  { exercise_id: 15, exercise_slug: 'kinesis_fore_right', pattern_id: 17, primary_muscle_group_slug: 'kinetic_chain', substitution_priority_rank: 1, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'cable', load_step_kg: 2.5, operational_layer: 'secondary_compound', paired_asymmetric_slug: 'kinesis_fore_left' },
  { exercise_id: 16, exercise_slug: 'kinesis_fore_left', pattern_id: 17, primary_muscle_group_slug: 'kinetic_chain', substitution_priority_rank: 2, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'cable', load_step_kg: 2.5, operational_layer: 'secondary_compound', paired_asymmetric_slug: 'kinesis_fore_right' },
  { exercise_id: 17, exercise_slug: 'kinesis_back_right', pattern_id: 4, primary_muscle_group_slug: 'latissimus_dorsi', substitution_priority_rank: 2, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'cable', load_step_kg: 2.5, operational_layer: 'secondary_compound', paired_asymmetric_slug: 'kinesis_back_left' },
  { exercise_id: 18, exercise_slug: 'kinesis_back_left', pattern_id: 4, primary_muscle_group_slug: 'latissimus_dorsi', substitution_priority_rank: 3, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'cable', load_step_kg: 2.5, operational_layer: 'secondary_compound', paired_asymmetric_slug: 'kinesis_back_right' },
  { exercise_id: 19, exercise_slug: 'cable_crossover', pattern_id: 1, primary_muscle_group_slug: 'pectoralis_major', substitution_priority_rank: 4, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'cable', load_step_kg: 2.5, operational_layer: 'isolation' },
  { exercise_id: 20, exercise_slug: 'smith_machine', pattern_id: 1, primary_muscle_group_slug: 'pectoralis_major', substitution_priority_rank: 2, safety_category_level: 1, max_allowed_intensity_pct: 1.00, equipment_type: 'machine', load_step_kg: 2.5, operational_layer: 'secondary_compound' },
  { exercise_id: 21, exercise_slug: 'rotary_torso_right', pattern_id: 16, primary_muscle_group_slug: 'obliques', substitution_priority_rank: 1, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'machine', load_step_kg: 5.0, operational_layer: 'core', paired_asymmetric_slug: 'rotary_torso_left' },
  { exercise_id: 22, exercise_slug: 'rotary_torso_left', pattern_id: 16, primary_muscle_group_slug: 'obliques', substitution_priority_rank: 2, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'machine', load_step_kg: 5.0, operational_layer: 'core', paired_asymmetric_slug: 'rotary_torso_right' },
  { exercise_id: 23, exercise_slug: 'sit_up', pattern_id: 14, primary_muscle_group_slug: 'rectus_abdominis', substitution_priority_rank: 1, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'bodyweight', load_step_kg: null, operational_layer: 'core' },
  { exercise_id: 24, exercise_slug: 'lower_back', pattern_id: 15, primary_muscle_group_slug: 'erector_spinae', substitution_priority_rank: 2, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'machine', load_step_kg: 5.0, operational_layer: 'core' },
  { exercise_id: 25, exercise_slug: 'back_extension', pattern_id: 15, primary_muscle_group_slug: 'erector_spinae', substitution_priority_rank: 1, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'bodyweight', load_step_kg: null, operational_layer: 'core' },
  { exercise_id: 26, exercise_slug: 'abdominal_crunch_machine', pattern_id: 14, primary_muscle_group_slug: 'rectus_abdominis', substitution_priority_rank: 2, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'machine', load_step_kg: 5.0, operational_layer: 'core' },
  
  // Lower Body
  { exercise_id: 27, exercise_slug: 'leg_press_right', pattern_id: 6, primary_muscle_group_slug: 'quadriceps', substitution_priority_rank: 3, safety_category_level: 1, max_allowed_intensity_pct: 1.00, equipment_type: 'machine', load_step_kg: 5.0, operational_layer: 'secondary_compound', paired_asymmetric_slug: 'leg_press_left' },
  { exercise_id: 28, exercise_slug: 'leg_press_left', pattern_id: 6, primary_muscle_group_slug: 'quadriceps', substitution_priority_rank: 4, safety_category_level: 1, max_allowed_intensity_pct: 1.00, equipment_type: 'machine', load_step_kg: 5.0, operational_layer: 'secondary_compound', paired_asymmetric_slug: 'leg_press_right' },
  { exercise_id: 29, exercise_slug: 'leg_extension', pattern_id: 7, primary_muscle_group_slug: 'quadriceps', substitution_priority_rank: 1, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'machine', load_step_kg: 5.0, operational_layer: 'isolation' },
  { exercise_id: 30, exercise_slug: 'leg_curl', pattern_id: 9, primary_muscle_group_slug: 'hamstrings', substitution_priority_rank: 1, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'machine', load_step_kg: 5.0, operational_layer: 'isolation' },
  { exercise_id: 31, exercise_slug: 'squat_rack', pattern_id: 6, primary_muscle_group_slug: 'quadriceps', substitution_priority_rank: 1, safety_category_level: 1, max_allowed_intensity_pct: 1.00, equipment_type: 'barbell', load_step_kg: 2.5, operational_layer: 'main_compound' },
  { exercise_id: 32, exercise_slug: 'hack_squat', pattern_id: 6, primary_muscle_group_slug: 'quadriceps', substitution_priority_rank: 2, safety_category_level: 2, max_allowed_intensity_pct: 0.80, equipment_type: 'machine', load_step_kg: 5.0, operational_layer: 'secondary_compound' },
  { exercise_id: 33, exercise_slug: 'calf_raise_left', pattern_id: 10, primary_muscle_group_slug: 'gastrocnemius', substitution_priority_rank: 3, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'machine', load_step_kg: 5.0, operational_layer: 'isolation', paired_asymmetric_slug: 'calf_raise_right' },
  { exercise_id: 34, exercise_slug: 'calf_raise_right', pattern_id: 10, primary_muscle_group_slug: 'gastrocnemius', substitution_priority_rank: 4, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'machine', load_step_kg: 5.0, operational_layer: 'isolation', paired_asymmetric_slug: 'calf_raise_left' },
  { exercise_id: 35, exercise_slug: 'standing_calf_raise', pattern_id: 10, primary_muscle_group_slug: 'gastrocnemius', substitution_priority_rank: 1, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'machine', load_step_kg: 5.0, operational_layer: 'isolation' },
  { exercise_id: 36, exercise_slug: 'seated_calf_raise', pattern_id: 10, primary_muscle_group_slug: 'soleus', substitution_priority_rank: 5, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'machine', load_step_kg: 5.0, operational_layer: 'isolation' },
  { exercise_id: 37, exercise_slug: 'hip_right', pattern_id: 8, primary_muscle_group_slug: 'gluteus_maximus', substitution_priority_rank: 4, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'machine', load_step_kg: 5.0, operational_layer: 'isolation', paired_asymmetric_slug: 'hip_left' },
  { exercise_id: 38, exercise_slug: 'hip_left', pattern_id: 8, primary_muscle_group_slug: 'gluteus_maximus', substitution_priority_rank: 5, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'machine', load_step_kg: 5.0, operational_layer: 'isolation', paired_asymmetric_slug: 'hip_right' },
  { exercise_id: 39, exercise_slug: 'multi_hip_machine', pattern_id: 8, primary_muscle_group_slug: 'gluteus_maximus', substitution_priority_rank: 2, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'machine', load_step_kg: 5.0, operational_layer: 'isolation' },
  { exercise_id: 40, exercise_slug: 'glute_machine', pattern_id: 8, primary_muscle_group_slug: 'gluteus_maximus', substitution_priority_rank: 1, safety_category_level: 2, max_allowed_intensity_pct: 0.80, equipment_type: 'machine', load_step_kg: 5.0, operational_layer: 'isolation' },
  { exercise_id: 41, exercise_slug: 'glute_kickback', pattern_id: 8, primary_muscle_group_slug: 'gluteus_maximus', substitution_priority_rank: 3, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'cable', load_step_kg: 2.5, operational_layer: 'isolation' },
  { exercise_id: 42, exercise_slug: 'abductor', pattern_id: 18, primary_muscle_group_slug: 'gluteus_medius', substitution_priority_rank: 1, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'machine', load_step_kg: 5.0, operational_layer: 'isolation' },
  { exercise_id: 43, exercise_slug: 'adductor', pattern_id: 18, primary_muscle_group_slug: 'adductors', substitution_priority_rank: 2, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'machine', load_step_kg: 5.0, operational_layer: 'isolation' },

  // === DUMBBELL EXERCISES (Alat Beban Bebas - Tanpa Singkatan) ===
  { exercise_id: 44, exercise_slug: 'dumbbell_bench_press', pattern_id: 1, primary_muscle_group_slug: 'pectoralis_major', substitution_priority_rank: 2, safety_category_level: 2, max_allowed_intensity_pct: 0.90, equipment_type: 'dumbbell', load_step_kg: 2.0, operational_layer: 'main_compound' },
  { exercise_id: 45, exercise_slug: 'dumbbell_floor_press', pattern_id: 1, primary_muscle_group_slug: 'pectoralis_major', substitution_priority_rank: 3, safety_category_level: 2, max_allowed_intensity_pct: 0.85, equipment_type: 'dumbbell', load_step_kg: 2.0, operational_layer: 'secondary_compound' },
  { exercise_id: 46, exercise_slug: 'dumbbell_fly', pattern_id: 1, primary_muscle_group_slug: 'pectoralis_major', substitution_priority_rank: 4, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'dumbbell', load_step_kg: 2.0, operational_layer: 'isolation' },
  { exercise_id: 47, exercise_slug: 'dumbbell_overhead_press', pattern_id: 5, primary_muscle_group_slug: 'deltoids', substitution_priority_rank: 2, safety_category_level: 2, max_allowed_intensity_pct: 0.85, equipment_type: 'dumbbell', load_step_kg: 2.0, operational_layer: 'main_compound' },
  { exercise_id: 48, exercise_slug: 'dumbbell_lateral_raise', pattern_id: 13, primary_muscle_group_slug: 'lateral_deltoid', substitution_priority_rank: 2, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'dumbbell', load_step_kg: 1.0, operational_layer: 'isolation' },
  { exercise_id: 49, exercise_slug: 'dumbbell_bicep_curl', pattern_id: 11, primary_muscle_group_slug: 'biceps', substitution_priority_rank: 2, safety_category_level: 3, max_allowed_intensity_pct: 0.75, equipment_type: 'dumbbell', load_step_kg: 1.0, operational_layer: 'isolation' },
  { exercise_id: 50, exercise_slug: 'dumbbell_bent_over_row', pattern_id: 4, primary_muscle_group_slug: 'latissimus_dorsi', substitution_priority_rank: 2, safety_category_level: 2, max_allowed_intensity_pct: 0.85, equipment_type: 'dumbbell', load_step_kg: 2.0, operational_layer: 'main_compound' },
  { exercise_id: 51, exercise_slug: 'dumbbell_chest_supported_row', pattern_id: 4, primary_muscle_group_slug: 'latissimus_dorsi', substitution_priority_rank: 2, safety_category_level: 2, max_allowed_intensity_pct: 0.80, equipment_type: 'dumbbell', load_step_kg: 2.0, operational_layer: 'secondary_compound' },
  { exercise_id: 52, exercise_slug: 'dumbbell_rear_delt_fly', pattern_id: 4, primary_muscle_group_slug: 'lateral_deltoid', substitution_priority_rank: 3, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'dumbbell', load_step_kg: 1.0, operational_layer: 'isolation' },
  { exercise_id: 53, exercise_slug: 'dumbbell_goblet_squat', pattern_id: 6, primary_muscle_group_slug: 'quadriceps', substitution_priority_rank: 2, safety_category_level: 2, max_allowed_intensity_pct: 0.85, equipment_type: 'dumbbell', load_step_kg: 2.0, operational_layer: 'main_compound' },
  { exercise_id: 54, exercise_slug: 'dumbbell_walking_lunge', pattern_id: 6, primary_muscle_group_slug: 'quadriceps', substitution_priority_rank: 3, safety_category_level: 2, max_allowed_intensity_pct: 0.80, equipment_type: 'dumbbell', load_step_kg: 2.0, operational_layer: 'secondary_compound' },
  { exercise_id: 55, exercise_slug: 'dumbbell_bulgarian_split', pattern_id: 6, primary_muscle_group_slug: 'quadriceps', substitution_priority_rank: 2, safety_category_level: 2, max_allowed_intensity_pct: 0.85, equipment_type: 'dumbbell', load_step_kg: 2.0, operational_layer: 'main_compound' },
  { exercise_id: 56, exercise_slug: 'dumbbell_romanian_deadlift', pattern_id: 8, primary_muscle_group_slug: 'hamstrings', substitution_priority_rank: 2, safety_category_level: 2, max_allowed_intensity_pct: 0.85, equipment_type: 'dumbbell', load_step_kg: 2.0, operational_layer: 'main_compound' },
  { exercise_id: 57, exercise_slug: 'dumbbell_single_leg_rdl', pattern_id: 8, primary_muscle_group_slug: 'hamstrings', substitution_priority_rank: 3, safety_category_level: 2, max_allowed_intensity_pct: 0.80, equipment_type: 'dumbbell', load_step_kg: 2.0, operational_layer: 'secondary_compound' },
  { exercise_id: 58, exercise_slug: 'dumbbell_swing', pattern_id: 8, primary_muscle_group_slug: 'gluteus_maximus', substitution_priority_rank: 3, safety_category_level: 1, max_allowed_intensity_pct: 0.75, equipment_type: 'dumbbell', load_step_kg: 2.0, operational_layer: 'secondary_compound', min_training_level: 'INTERMEDIATE' },
  { exercise_id: 59, exercise_slug: 'dumbbell_farmers_walk', pattern_id: 16, primary_muscle_group_slug: 'obliques', substitution_priority_rank: 3, safety_category_level: 2, max_allowed_intensity_pct: 0.80, equipment_type: 'dumbbell', load_step_kg: 2.0, operational_layer: 'secondary_compound', is_timed: true },

  // === BODYWEIGHT & CALISTHENICS EXERCISES (Tanpa Alat / Beban Tubuh) ===
  { exercise_id: 60, exercise_slug: 'push_up_standard', pattern_id: 1, primary_muscle_group_slug: 'pectoralis_major', substitution_priority_rank: 2, safety_category_level: 2, max_allowed_intensity_pct: 1.00, equipment_type: 'bodyweight', load_step_kg: null, relative_load_pct: 0.64, operational_layer: 'main_compound' },
  { exercise_id: 61, exercise_slug: 'push_up_knee', pattern_id: 1, primary_muscle_group_slug: 'pectoralis_major', substitution_priority_rank: 4, safety_category_level: 3, max_allowed_intensity_pct: 1.00, equipment_type: 'bodyweight', load_step_kg: null, relative_load_pct: 0.49, operational_layer: 'secondary_compound' },
  { exercise_id: 62, exercise_slug: 'push_up_parallette', pattern_id: 1, primary_muscle_group_slug: 'pectoralis_major', substitution_priority_rank: 3, safety_category_level: 2, max_allowed_intensity_pct: 1.00, equipment_type: 'bodyweight', load_step_kg: null, relative_load_pct: 0.65, operational_layer: 'secondary_compound', min_training_level: 'INTERMEDIATE' },
  { exercise_id: 63, exercise_slug: 'diamond_push_up', pattern_id: 12, primary_muscle_group_slug: 'triceps', substitution_priority_rank: 2, safety_category_level: 2, max_allowed_intensity_pct: 0.85, equipment_type: 'bodyweight', load_step_kg: null, relative_load_pct: 0.65, operational_layer: 'secondary_compound', min_training_level: 'INTERMEDIATE' },
  { exercise_id: 64, exercise_slug: 'pike_push_up', pattern_id: 5, primary_muscle_group_slug: 'deltoids', substitution_priority_rank: 3, safety_category_level: 2, max_allowed_intensity_pct: 0.85, equipment_type: 'bodyweight', load_step_kg: null, relative_load_pct: 0.70, operational_layer: 'secondary_compound', min_training_level: 'INTERMEDIATE' },
  { exercise_id: 65, exercise_slug: 'handstand_push_up', pattern_id: 5, primary_muscle_group_slug: 'deltoids', substitution_priority_rank: 1, safety_category_level: 1, max_allowed_intensity_pct: 1.00, equipment_type: 'bodyweight', load_step_kg: null, relative_load_pct: 0.95, operational_layer: 'main_compound', min_training_level: 'ADVANCED' },
  { exercise_id: 66, exercise_slug: 'inverted_row_horizontal', pattern_id: 4, primary_muscle_group_slug: 'rhomboids', substitution_priority_rank: 2, safety_category_level: 2, max_allowed_intensity_pct: 1.00, equipment_type: 'bodyweight', load_step_kg: null, relative_load_pct: 0.72, operational_layer: 'main_compound' },
  { exercise_id: 67, exercise_slug: 'inverted_row_incline', pattern_id: 4, primary_muscle_group_slug: 'rhomboids', substitution_priority_rank: 3, safety_category_level: 3, max_allowed_intensity_pct: 1.00, equipment_type: 'bodyweight', load_step_kg: null, relative_load_pct: 0.50, operational_layer: 'secondary_compound' },
  { exercise_id: 68, exercise_slug: 'pull_up_standard', pattern_id: 3, primary_muscle_group_slug: 'latissimus_dorsi', substitution_priority_rank: 1, safety_category_level: 2, max_allowed_intensity_pct: 1.00, equipment_type: 'bodyweight', load_step_kg: null, relative_load_pct: 0.95, operational_layer: 'main_compound', min_training_level: 'INTERMEDIATE' },
  { exercise_id: 69, exercise_slug: 'chin_up_standard', pattern_id: 3, primary_muscle_group_slug: 'latissimus_dorsi', substitution_priority_rank: 2, safety_category_level: 2, max_allowed_intensity_pct: 1.00, equipment_type: 'bodyweight', load_step_kg: null, relative_load_pct: 0.95, operational_layer: 'main_compound', min_training_level: 'INTERMEDIATE' },
  { exercise_id: 70, exercise_slug: 'negative_pull_up', pattern_id: 3, primary_muscle_group_slug: 'latissimus_dorsi', substitution_priority_rank: 3, safety_category_level: 2, max_allowed_intensity_pct: 0.80, equipment_type: 'bodyweight', load_step_kg: null, relative_load_pct: 0.90, operational_layer: 'secondary_compound' },
  { exercise_id: 71, exercise_slug: 'bodyweight_squat', pattern_id: 6, primary_muscle_group_slug: 'quadriceps', substitution_priority_rank: 2, safety_category_level: 3, max_allowed_intensity_pct: 1.00, equipment_type: 'bodyweight', load_step_kg: null, relative_load_pct: 0.88, operational_layer: 'main_compound' },
  { exercise_id: 72, exercise_slug: 'bodyweight_bulgarian_split', pattern_id: 6, primary_muscle_group_slug: 'quadriceps', substitution_priority_rank: 2, safety_category_level: 2, max_allowed_intensity_pct: 0.90, equipment_type: 'bodyweight', load_step_kg: null, relative_load_pct: 0.85, operational_layer: 'main_compound' },
  { exercise_id: 73, exercise_slug: 'bodyweight_reverse_lunge', pattern_id: 6, primary_muscle_group_slug: 'quadriceps', substitution_priority_rank: 3, safety_category_level: 3, max_allowed_intensity_pct: 0.85, equipment_type: 'bodyweight', load_step_kg: null, relative_load_pct: 0.70, operational_layer: 'secondary_compound' },
  { exercise_id: 74, exercise_slug: 'bodyweight_single_leg_rdl', pattern_id: 8, primary_muscle_group_slug: 'hamstrings', substitution_priority_rank: 3, safety_category_level: 3, max_allowed_intensity_pct: 0.80, equipment_type: 'bodyweight', load_step_kg: null, relative_load_pct: 0.75, operational_layer: 'secondary_compound' },
  { exercise_id: 75, exercise_slug: 'bodyweight_glute_bridge', pattern_id: 8, primary_muscle_group_slug: 'gluteus_maximus', substitution_priority_rank: 3, safety_category_level: 3, max_allowed_intensity_pct: 0.80, equipment_type: 'bodyweight', load_step_kg: null, relative_load_pct: 0.50, operational_layer: 'isolation' },
  { exercise_id: 76, exercise_slug: 'plank_standard', pattern_id: 14, primary_muscle_group_slug: 'rectus_abdominis', substitution_priority_rank: 2, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'bodyweight', load_step_kg: null, relative_load_pct: 0.40, operational_layer: 'core', is_timed: true },
  { exercise_id: 77, exercise_slug: 'side_plank', pattern_id: 16, primary_muscle_group_slug: 'obliques', substitution_priority_rank: 3, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'bodyweight', load_step_kg: null, relative_load_pct: 0.35, operational_layer: 'core', is_timed: true },
  { exercise_id: 78, exercise_slug: 'bird_dog', pattern_id: 15, primary_muscle_group_slug: 'erector_spinae', substitution_priority_rank: 2, safety_category_level: 3, max_allowed_intensity_pct: 0.70, equipment_type: 'bodyweight', load_step_kg: null, relative_load_pct: 0.30, operational_layer: 'core' }
];

// === TABLE 3: MST_TRAINING_PHASES ===
export const MST_TRAINING_PHASES = [
  { phase_id: 1, phase_slug: 'strength_endurance_aa', min_intensity_pct: 0.50, max_intensity_pct: 0.70, target_reps_min: 12, target_reps_max: 20, target_sets_min: 2, target_sets_max: 4, rest_interval_sec_min: 30, rest_interval_sec_max: 90, tempo_code: '4-2-1-1', eccentric_sec: 4, isometric_bottom_sec: 2, concentric_sec: 1.0, isometric_top_sec: 1, uses_rpe_flag: false, rpe_min: null, rpe_max: null },
  { phase_id: 2, phase_slug: 'strength_max', min_intensity_pct: 0.85, max_intensity_pct: 1.00, target_reps_min: 1, target_reps_max: 5, target_sets_min: 4, target_sets_max: 6, rest_interval_sec_min: 180, rest_interval_sec_max: 300, tempo_code: '1-0-X-0', eccentric_sec: 1, isometric_bottom_sec: 0, concentric_sec: 0.5, isometric_top_sec: 0, uses_rpe_flag: false, rpe_min: null, rpe_max: null },
  { phase_id: 3, phase_slug: 'power', min_intensity_pct: 0.30, max_intensity_pct: 0.45, target_reps_min: 1, target_reps_max: 10, target_sets_min: 3, target_sets_max: 6, rest_interval_sec_min: 180, rest_interval_sec_max: 300, tempo_code: 'X-X-X-X', eccentric_sec: 0.5, isometric_bottom_sec: 0.5, concentric_sec: 0.5, isometric_top_sec: 0.5, uses_rpe_flag: false, rpe_min: null, rpe_max: null },
  { phase_id: 4, phase_slug: 'speed_power', min_intensity_pct: 0.30, max_intensity_pct: 0.50, target_reps_min: 4, target_reps_max: 8, target_sets_min: 3, target_sets_max: 5, rest_interval_sec_min: 120, rest_interval_sec_max: 180, tempo_code: 'X-0-X-0', eccentric_sec: 0.5, isometric_bottom_sec: 0, concentric_sec: 0.5, isometric_top_sec: 0, uses_rpe_flag: false, rpe_min: null, rpe_max: null },
  { phase_id: 5, phase_slug: 'balance_agility', min_intensity_pct: null, max_intensity_pct: null, target_reps_min: 10, target_reps_max: 15, target_sets_min: 2, target_sets_max: 3, rest_interval_sec_min: 60, rest_interval_sec_max: 60, tempo_code: '4-1-1-1', eccentric_sec: 4, isometric_bottom_sec: 1, concentric_sec: 1.0, isometric_top_sec: 1, uses_rpe_flag: true, rpe_min: 5, rpe_max: 7 },
  { phase_id: 6, phase_slug: 'core_stability', min_intensity_pct: null, max_intensity_pct: null, target_reps_min: 12, target_reps_max: 20, target_sets_min: 2, target_sets_max: 3, rest_interval_sec_min: 0, rest_interval_sec_max: 60, tempo_code: '4-2-1-1', eccentric_sec: 4, isometric_bottom_sec: 2, concentric_sec: 1.0, isometric_top_sec: 1, uses_rpe_flag: true, rpe_min: 6, rpe_max: 8 },
  { phase_id: 7, phase_slug: 'functional_training', min_intensity_pct: 0.60, max_intensity_pct: 0.80, target_reps_min: 8, target_reps_max: 15, target_sets_min: 3, target_sets_max: 5, rest_interval_sec_min: 60, rest_interval_sec_max: 90, tempo_code: '2-0-2-0', eccentric_sec: 2, isometric_bottom_sec: 0, concentric_sec: 2.0, isometric_top_sec: 0, uses_rpe_flag: false, rpe_min: null, rpe_max: null },
  { phase_id: 8, phase_slug: 'stabilization_endurance', min_intensity_pct: 0.50, max_intensity_pct: 0.70, target_reps_min: 12, target_reps_max: 20, target_sets_min: 1, target_sets_max: 3, rest_interval_sec_min: 0, rest_interval_sec_max: 90, tempo_code: '4-2-1-1', eccentric_sec: 4, isometric_bottom_sec: 2, concentric_sec: 1.0, isometric_top_sec: 1, uses_rpe_flag: false, rpe_min: null, rpe_max: null },
  { phase_id: 9, phase_slug: 'muscular_endurance', min_intensity_pct: 0.50, max_intensity_pct: 0.70, target_reps_min: 15, target_reps_max: 25, target_sets_min: 2, target_sets_max: 4, rest_interval_sec_min: 30, rest_interval_sec_max: 60, tempo_code: '2-0-2-0', eccentric_sec: 2, isometric_bottom_sec: 0, concentric_sec: 2.0, isometric_top_sec: 0, uses_rpe_flag: false, rpe_min: null, rpe_max: null },
  { phase_id: 10, phase_slug: 'hypertrophy', min_intensity_pct: 0.75, max_intensity_pct: 0.85, target_reps_min: 6, target_reps_max: 12, target_sets_min: 3, target_sets_max: 6, rest_interval_sec_min: 60, rest_interval_sec_max: 90, tempo_code: '2-0-2-0', eccentric_sec: 2, isometric_bottom_sec: 0, concentric_sec: 2.0, isometric_top_sec: 0, uses_rpe_flag: false, rpe_min: null, rpe_max: null }
];

// === TABLE 4: RULE_TRAINING_AGE_MODIFIERS ===
export const RULE_TRAINING_AGE_MODIFIERS = [
  { training_age_level: 'BEGINNER', volume_multiplier: 0.75, rest_multiplier: 1.25, weekly_frequency_min: 2, weekly_frequency_max: 3, progression_model: 'linear', weekly_load_increase_pct_min: 0.025, weekly_load_increase_pct_max: 0.05, mesocycle_pattern: '4:1', mesocycle_length_weeks: 5 },
  { training_age_level: 'INTERMEDIATE', volume_multiplier: 1.0, rest_multiplier: 1.0, weekly_frequency_min: 3, weekly_frequency_max: 5, progression_model: 'undulating', weekly_load_increase_pct_min: 0.0025, weekly_load_increase_pct_max: 0.00625, mesocycle_pattern: '3:1', mesocycle_length_weeks: 4 },
  { training_age_level: 'ADVANCED', volume_multiplier: 1.25, rest_multiplier: 0.85, weekly_frequency_min: 4, weekly_frequency_max: 6, progression_model: 'block', weekly_load_increase_pct_min: 0.00042, weekly_load_increase_pct_max: 0.00083, mesocycle_pattern: '3:1 or 2:1', mesocycle_length_weeks: 3 }
];

// === TABLE 5: RULE_PERIODIZATION_SEQUENCING ===
export const RULE_PERIODIZATION_SEQUENCING = [
  { phase_slug: 'stabilization_endurance', sequence_order_rank: 1 },
  { phase_slug: 'strength_endurance_aa', sequence_order_rank: 2 },
  { phase_slug: 'muscular_endurance', sequence_order_rank: 3 },
  { phase_slug: 'core_stability', sequence_order_rank: 4 },
  { phase_slug: 'balance_agility', sequence_order_rank: 5 },
  { phase_slug: 'functional_training', sequence_order_rank: 6 },
  { phase_slug: 'hypertrophy', sequence_order_rank: 7 },
  { phase_slug: 'strength_max', sequence_order_rank: 8 },
  { phase_slug: 'power', sequence_order_rank: 9 },
  { phase_slug: 'speed_power', sequence_order_rank: 10 }
];

// === TABLE 6: RULE_WEEKLY_OVERLOAD ===
export const RULE_WEEKLY_OVERLOAD = {
  'BEGINNER': [
    { week: 1, intensity_mod: 0.00, volume_mod: 1.0, is_deload: false, deload_set_reduction: 0 },
    { week: 2, intensity_mod: 0.05, volume_mod: 1.0, is_deload: false, deload_set_reduction: 0 },
    { week: 3, intensity_mod: 0.10, volume_mod: 1.0, is_deload: false, deload_set_reduction: 0 },
    { week: 4, intensity_mod: 0.15, volume_mod: 1.0, is_deload: false, deload_set_reduction: 0 },
    { week: 5, intensity_mod: -0.10, volume_mod: 1.0, is_deload: true, deload_set_reduction: 1 }
  ],
  'INTERMEDIATE': [
    { week: 1, intensity_mod: 0.00, volume_mod: 1.0, is_deload: false, deload_set_reduction: 0 },
    { week: 2, intensity_mod: 0.075, volume_mod: 0.85, is_deload: false, deload_set_reduction: 0 },
    { week: 3, intensity_mod: 0.15, volume_mod: 0.70, is_deload: false, deload_set_reduction: 0 },
    { week: 4, intensity_mod: -0.10, volume_mod: 1.0, is_deload: true, deload_set_reduction: 1 }
  ],
  'ADVANCED': [
    { week: 1, intensity_mod: 0.05, volume_mod: 1.15, is_deload: false, deload_set_reduction: 0 },
    { week: 2, intensity_mod: 0.10, volume_mod: 1.15, is_deload: false, deload_set_reduction: 0 },
    { week: 3, intensity_mod: -0.15, volume_mod: 1.0, is_deload: true, deload_set_reduction: 1 }
  ]
};

// === TABLE 7: RULE_INTRA_WORKOUT_PRIORITY ===
export const RULE_INTRA_WORKOUT_PRIORITY = {
  'power': 1,
  'speed_power': 1,
  'strength_max': 2,
  'hypertrophy': 3,
  'functional_training': 3,
  'strength_endurance_aa': 4,
  'muscular_endurance': 4,
  'stabilization_endurance': 4,
  'core_stability': 5,
  'balance_agility': 5
};

// === TABLE 8: RULE_AGE_MODIFIERS (Optimized with Masters age 45-65 group) ===
export const RULE_AGE_MODIFIERS = [
  { age_group: 'pediatric', age_min: null, age_max: 15, max_intensity_override: 0.70, volume_multiplier_override: 0.60, forced_initial_phase: 'strength_endurance_aa', forced_initial_weeks: 4, blocked_phases: [], fallback_phase: null, rest_multiplier_override: 1.25 },
  { age_group: 'standard', age_min: 16, age_max: 44, max_intensity_override: null, volume_multiplier_override: null, forced_initial_phase: null, forced_initial_weeks: null, blocked_phases: [], fallback_phase: null, rest_multiplier_override: null },
  { age_group: 'masters', age_min: 45, age_max: 65, max_intensity_override: 0.85, volume_multiplier_override: null, forced_initial_phase: null, forced_initial_weeks: null, blocked_phases: [], fallback_phase: null, rest_multiplier_override: 1.20 },
  { age_group: 'geriatric', age_min: 66, age_max: null, max_intensity_override: 0.75, volume_multiplier_override: null, forced_initial_phase: null, forced_initial_weeks: null, blocked_phases: ['power', 'speed_power'], fallback_phase: 'functional_training', rest_multiplier_override: 1.5 }
];

// === TABLE 9: MVW_REQUIREMENTS ===
export const MVW_REQUIREMENTS = [
  { requirement: 'knee_dominant', patterns: ['knee_dominant_bilateral', 'knee_dominant_isolation'] },
  { requirement: 'hip_dominant', patterns: ['hip_dominant'] },
  { requirement: 'horizontal_push_pull_balance', push_patterns: ['horizontal_push', 'incline_push'], pull_patterns: ['horizontal_pull'], ratio: '1:1' },
  { requirement: 'vertical_movement', patterns: ['vertical_pull', 'vertical_push'] },
  { requirement: 'core_stabilization', patterns: ['core_trunk_flexion', 'core_trunk_extension', 'core_trunk_rotation'] }
];

// === EXERCISE PHYSIOLOGY RESEARCH MASTER DATA TABLES ===

// 1. Bodyweight-to-1RM Normative Table
export const MST_RELATIVE_STRENGTH_STANDARDS = {
  male: {
    bench_press: [ { level: 'BEGINNER', min: 0.50, max: 0.75 }, { level: 'INTERMEDIATE', min: 1.00, max: 1.25 }, { level: 'ADVANCED', min: 1.50, max: 1.75 }, { level: 'ELITE', min: 2.00, max: 9.99 } ],
    squat_rack: [ { level: 'BEGINNER', min: 0.75, max: 1.00 }, { level: 'INTERMEDIATE', min: 1.25, max: 1.50 }, { level: 'ADVANCED', min: 1.75, max: 2.00 }, { level: 'ELITE', min: 2.25, max: 9.99 } ],
    deadlift: [ { level: 'BEGINNER', min: 1.00, max: 1.25 }, { level: 'INTERMEDIATE', min: 1.50, max: 1.75 }, { level: 'ADVANCED', min: 2.00, max: 2.25 }, { level: 'ELITE', min: 2.50, max: 9.99 } ],
    shoulder_press: [ { level: 'BEGINNER', min: 0.35, max: 0.50 }, { level: 'INTERMEDIATE', min: 0.70, max: 0.85 }, { level: 'ADVANCED', min: 1.00, max: 1.15 }, { level: 'ELITE', min: 1.25, max: 9.99 } ]
  },
  female: {
    bench_press: [ { level: 'BEGINNER', min: 0.30, max: 0.45 }, { level: 'INTERMEDIATE', min: 0.65, max: 0.75 }, { level: 'ADVANCED', min: 0.85, max: 1.00 }, { level: 'ELITE', min: 1.25, max: 9.99 } ],
    squat_rack: [ { level: 'BEGINNER', min: 0.45, max: 0.65 }, { level: 'INTERMEDIATE', min: 1.00, max: 1.25 }, { level: 'ADVANCED', min: 1.30, max: 1.50 }, { level: 'ELITE', min: 1.75, max: 9.99 } ],
    deadlift: [ { level: 'BEGINNER', min: 0.60, max: 0.90 }, { level: 'INTERMEDIATE', min: 1.30, max: 1.50 }, { level: 'ADVANCED', min: 1.65, max: 2.00 }, { level: 'ELITE', min: 2.25, max: 9.99 } ],
    shoulder_press: [ { level: 'BEGINNER', min: 0.20, max: 0.30 }, { level: 'INTERMEDIATE', min: 0.45, max: 0.55 }, { level: 'ADVANCED', min: 0.75, max: 0.80 }, { level: 'ELITE', min: 0.90, max: 9.99 } ]
  }
};

// 2. 1RM Repetition Maximum Conversion Table
export const MST_1RM_ESTIMATION_CONVERSIONS = [
  { reps: 1, epley_pct: 0.968, brzycki_pct: 1.000, nsca_pct: 1.000 },
  { reps: 2, epley_pct: 0.938, brzycki_pct: 0.972, nsca_pct: 0.950 },
  { reps: 3, epley_pct: 0.909, brzycki_pct: 0.944, nsca_pct: 0.930 },
  { reps: 4, epley_pct: 0.882, brzycki_pct: 0.917, nsca_pct: 0.900 },
  { reps: 5, epley_pct: 0.857, brzycki_pct: 0.889, nsca_pct: 0.870 },
  { reps: 6, epley_pct: 0.833, brzycki_pct: 0.861, nsca_pct: 0.850 },
  { reps: 7, epley_pct: 0.811, brzycki_pct: 0.833, nsca_pct: 0.830 },
  { reps: 8, epley_pct: 0.789, brzycki_pct: 0.806, nsca_pct: 0.800 },
  { reps: 9, epley_pct: 0.769, brzycki_pct: 0.778, nsca_pct: 0.770 },
  { reps: 10, epley_pct: 0.750, brzycki_pct: 0.750, nsca_pct: 0.750 },
  { reps: 12, epley_pct: 0.714, brzycki_pct: 0.694, nsca_pct: 0.700 },
  { reps: 15, epley_pct: 0.667, brzycki_pct: 0.611, nsca_pct: 0.650 }
];

// 3. ATP-PCr Recovery Curve Table
export const MST_ATP_PCR_RECOVERY_CURVE = [
  { rest_sec: 30, atp_recovery_pct: 0.50, phase_focus: 'Hypertrophy / Muscular Endurance' },
  { rest_sec: 60, atp_recovery_pct: 0.75, phase_focus: 'Hypertrophy Primary (8-12 reps)' },
  { rest_sec: 90, atp_recovery_pct: 0.86, phase_focus: 'General Strength & Hypertrophy' },
  { rest_sec: 120, atp_recovery_pct: 0.92, phase_focus: 'Medium Pure Strength (4-6 reps)' },
  { rest_sec: 180, atp_recovery_pct: 0.98, phase_focus: 'Full Neural Strength (>90% 1RM)' },
  { rest_sec: 300, atp_recovery_pct: 1.00, phase_focus: 'Max 1RM Test / Central CNS Activation' }
];

// 4. METs Compendium Data Table
export const MST_METS_COMPENDIUM = [
  { code: '02050', category: 'Vigorous Resistance Training (<6 reps heavy powerlifting)', mets_value: 6.0 },
  { code: '02052', category: 'Explosive Compound Lifts (Squat, Deadlift heavy)', mets_value: 5.0 },
  { code: '02055', category: 'Circuit / Super-Set High Lactic Accumulation', mets_value: 5.0 },
  { code: '02054', category: 'Moderate Isolation / Machine Routine (8-15 reps)', mets_value: 3.5 }
];

// 5. Medical Contraindications & Pathology Blacklist (Enhanced with Dumbbell & Calisthenics options)
export const MST_MEDICAL_CONTRAINDICATIONS = {
  low_back_pain: {
    blocked_exercise_slugs: ['squat_rack', 'deadlift', 'back_extension', 'lower_back', 'dumbbell_bent_over_row', 'sit_up'],
    substitute_exercise_slugs: [
      'dumbbell_goblet_squat', 'bodyweight_bulgarian_split', 'dumbbell_chest_supported_row', 
      'inverted_row_horizontal', 'inverted_row_incline', 'leg_press_right', 
      'seated_row', 'abdominal_crunch_machine'
    ],
    reason: 'Eliminate heavy axial spinal compression and high moment arm shear'
  },
  shoulder_impingement: {
    blocked_exercise_slugs: ['shoulder_press', 'lateral_raise', 'bench_press', 'incline_press', 'dumbbell_overhead_press', 'dumbbell_lateral_raise'],
    substitute_exercise_slugs: [
      'dumbbell_floor_press', 'push_up_knee', 'chest_press', 
      'seated_row', 'inverted_row_horizontal'
    ],
    reason: 'Prevent subacromial space hyper-extension and impingement with neutral grip & restricted depth'
  },
  patellofemoral_knee_pain: {
    blocked_exercise_slugs: ['leg_extension', 'hack_squat', 'bodyweight_squat'],
    substitute_exercise_slugs: [
      'bodyweight_reverse_lunge', 'dumbbell_romanian_deadlift', 'bodyweight_glute_bridge', 
      'glute_machine', 'seated_calf_raise'
    ],
    reason: 'Eliminate terminal knee extension patellar compression, favor vertical tibia & hip hinge'
  }
};

// === HELPER FUNCTIONS ===

export const getPatternBySlug = (slug) => {
  return MST_MOVEMENT_PATTERNS.find(pattern => pattern.pattern_slug === slug);
};

export const getExerciseBySlug = (slug) => {
  return MST_EXERCISES.find(exercise => exercise.exercise_slug === slug);
};

export const getPhaseBySlug = (slug) => {
  return MST_TRAINING_PHASES.find(phase => phase.phase_slug === slug);
};

export const getExercisesByPattern = (patternSlug) => {
  const pattern = getPatternBySlug(patternSlug);
  if (!pattern) return [];
  return MST_EXERCISES.filter(exercise => exercise.pattern_id === pattern.pattern_id);
};

/**
 * Calculates estimated 1RM using Epley & Brzycki formulas.
 * Rejects estimation if reps > 10 to avoid false positives from anaerobic glycolysis variance.
 * @param {number} loadKg 
 * @param {number} reps 
 * @returns {object}
 */
export function estimate1RM(loadKg, reps) {
  if (!loadKg || loadKg <= 0 || !reps || reps <= 0) {
    return { epley: 0, brzycki: 0, average: 0, valid: false, reason: 'Invalid load or reps' };
  }

  if (reps > 10) {
    return {
      epley: Math.round(loadKg * (1 + reps / 30)),
      brzycki: Math.round(loadKg * (36 / (37 - reps))),
      average: Math.round(loadKg * (1 + reps / 30)),
      valid: false,
      reason: 'Reps > 10: High risk of false positive due to anaerobic glycolysis variance.'
    };
  }

  const epley = loadKg * (1 + reps / 30);
  const brzycki = loadKg * (36 / (37 - Math.min(reps, 36)));
  const average = (epley + brzycki) / 2;

  return {
    epley: Math.round(epley * 2) / 2,
    brzycki: Math.round(brzycki * 2) / 2,
    average: Math.round(average * 2) / 2,
    valid: true,
    reason: 'Valid Submaximal Test (1-10 reps)'
  };
}

/**
 * Estimates energy expenditure (calories burned) in kcal using Compendium METs value.
 * @param {number} mets 
 * @param {number} bodyWeightKg 
 * @param {number} durationMinutes 
 * @returns {number} Calories burned in kcal
 */
export function calculateCaloriesBurned(mets, bodyWeightKg, durationMinutes) {
  if (!mets || !bodyWeightKg || !durationMinutes) return 0;
  const kcal = (mets * 3.5 * bodyWeightKg / 200) * durationMinutes;
  return Math.round(kcal);
}
