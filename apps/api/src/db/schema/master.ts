import { pgTable, text, integer, doublePrecision, boolean } from "drizzle-orm/pg-core";

export const masterMovementPatterns = pgTable("master_movement_patterns", {
  patternId: integer("pattern_id").primaryKey(),
  patternSlug: text("pattern_slug").notNull().unique(),
  planeOfMotion: text("plane_of_motion").notNull(),
  isCoreRequired: boolean("is_core_required").notNull().default(false),
  crossPatternFallbackSlug: text("cross_pattern_fallback_slug"),
});

export const masterExercises = pgTable("master_exercises", {
  exerciseId: integer("exercise_id").primaryKey(),
  exerciseSlug: text("exercise_slug").notNull().unique(),
  patternId: integer("pattern_id").notNull().references(() => masterMovementPatterns.patternId),
  primaryMuscleGroupSlug: text("primary_muscle_group_slug").notNull(),
  substitutionPriorityRank: integer("substitution_priority_rank").notNull(),
  safetyCategoryLevel: integer("safety_category_level").notNull(),
  maxAllowedIntensityPct: doublePrecision("max_allowed_intensity_pct").notNull().default(1.0),
});

export const masterTrainingPhases = pgTable("master_training_phases", {
  phaseId: integer("phase_id").primaryKey(),
  phaseSlug: text("phase_slug").notNull().unique(),
  minIntensityPct: doublePrecision("min_intensity_pct"),
  maxIntensityPct: doublePrecision("max_intensity_pct"),
  targetRepsMin: integer("target_reps_min").notNull(),
  targetRepsMax: integer("target_reps_max").notNull(),
  targetSetsMin: integer("target_sets_min").notNull(),
  targetSetsMax: integer("target_sets_max").notNull(),
  restIntervalSecMin: integer("rest_interval_sec_min").notNull(),
  restIntervalSecMax: integer("rest_interval_sec_max").notNull(),
  tempoCode: text("tempo_code").notNull(),
  usesRpeFlag: boolean("uses_rpe_flag").notNull().default(false),
  rpeMin: doublePrecision("rpe_min"),
  rpeMax: doublePrecision("rpe_max"),
});

export const ruleTrainingAgeModifiers = pgTable("rule_training_age_modifiers", {
  trainingAgeLevel: text("training_age_level").primaryKey(),
  volumeMultiplier: doublePrecision("volume_multiplier").notNull(),
  restMultiplier: doublePrecision("rest_multiplier").notNull(),
  weeklyFrequencyMin: integer("weekly_frequency_min").notNull(),
  weeklyFrequencyMax: integer("weekly_frequency_max").notNull(),
  progressionModel: text("progression_model").notNull(),
  weeklyLoadIncreasePctMin: doublePrecision("weekly_load_increase_pct_min").notNull(),
  weeklyLoadIncreasePctMax: doublePrecision("weekly_load_increase_pct_max").notNull(),
  mesocycleLengthWeeks: integer("mesocycle_length_weeks").notNull(),
});
