/**
 * aplanworkout Scientific Exercise Prescription Engine
 * Central TypeScript Type Definitions
 */

export type OperationalLayer = 'main_compound' | 'secondary_compound' | 'isolation' | 'core';

export type TrainingAgeLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type MedicalClearanceStatus = 'CLEAR' | 'ADJUSTED' | 'HARD_STOP';

export type PeriodizationStrategy = 'SEQUENTIAL' | 'CONCURRENT';

export interface UserProfile {
  user_id?: string;
  athlete_name?: string;
  sport_branch?: string;
  age: number;
  body_weight_kg: number;
  height_cm: number;
  training_age_level: TrainingAgeLevel;
  active_program_duration_weeks: number;
  target_1rm_increase_pct: number;
  selected_goals: string[];
  preferred_language?: 'id' | 'en';
}

export interface MedicalScreening {
  has_heart_condition: boolean;
  has_asthma: boolean;
  has_chest_pain: boolean;
  has_injury: boolean;
  injury_area?: 'Upper' | 'Lower' | 'Core' | null;
  takes_medication: boolean;
}

export interface UserEquipment {
  exercise_slug: string;
  user_1rm_kg: number | null;
}

export interface ExerciseMetadata {
  exercise_id: number;
  exercise_slug: string;
  name_id: string;
  name_en: string;
  category: string;
  primary_muscle_group_slug: string;
  operational_layer: OperationalLayer;
  paired_asymmetric_slug?: string | null;
  safety_category_level: number;
  substitution_priority_rank: number;
}

export interface SubstitutionDiagnostics {
  fallback_status: 'NONE' | 'SAME_PATTERN' | 'CATEGORY_DOWNGRADE';
  original_requested_pattern?: string;
  substituted_exercise_slug?: string;
  reason?: string;
}

export interface PrescribedExercise {
  execution_order: number;
  movement_pattern_slug: string;
  exercise_slug: string;
  substitution_diagnostics?: SubstitutionDiagnostics | null;
  safety_category: number;
  max_intensity_cap?: number | null;
  uses_rpe_flag: boolean;
  intensity_pct: number;
  load_kg: number | null;
  missing_1rm: boolean;
  target_rpe?: number | null;
  time_under_tension_sec: number;
  sets: number;
  reps: number;
  rest_interval_seconds: number;
  tempo_code: string;
  capped_by_safety_module: boolean;
  operational_layer: OperationalLayer;
  paired_asymmetric_slug?: string | null;
  notes: string[];
}

export interface SessionData {
  session_id: string;
  day_number: number;
  week_number: number;
  phase_slug: string;
  focus_title: string;
  is_deload_week: boolean;
  medical_clearance_status: MedicalClearanceStatus;
  exercises: PrescribedExercise[];
  prescribed_exercises: PrescribedExercise[];
  session_volume_kg: number;
  total_estimated_volume_kg: number;
  system_warnings: string[];
}

export interface WeekData {
  week_number: number;
  is_deload: boolean;
  intensity_mod: number;
  volume_mod: number;
  phase_slugs: string[];
  sessions: SessionData[];
  total_week_volume_kg: number;
}

export interface ProgramMetadata {
  athlete_name?: string;
  sport_branch?: string;
  user_age: number;
  body_weight_kg: number;
  height_cm: number;
  training_age_level: TrainingAgeLevel;
  duration_weeks: number;
  target_1rm_increase_pct: number;
  selected_goals: string[];
  equipment_count: number;
  days_per_week: number;
  language: 'id' | 'en';
}

export interface ProgramData {
  program_id: string;
  metadata: ProgramMetadata;
  equipment_data: UserEquipment[];
  medical_screening: {
    clearance_status: MedicalClearanceStatus;
    modifiers: Record<string, any>;
  };
  periodization: {
    strategy: PeriodizationStrategy;
    blocks: any[];
    weekly_schedule: any[];
    compatibility_results: any[];
  };
  target_validation: {
    status: 'REALISTIC' | 'AMBITIOUS' | 'UNREALISTIC';
    weeklyIncrement?: number;
    warnings?: string[];
  };
  weeks: WeekData[];
  system_warnings: string[];
  generated_at: string;
}
