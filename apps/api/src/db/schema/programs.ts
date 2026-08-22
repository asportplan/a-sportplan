import { pgTable, text, integer, doublePrecision, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { user } from "./auth.js";

export const workoutPrograms = pgTable("workout_programs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  durationWeeks: integer("duration_weeks").notNull(),
  trainingAgeLevel: text("training_age_level").notNull(),
  selectedGoals: jsonb("selected_goals").$type<string[]>().notNull(),
  status: text("status", { enum: ["ACTIVE", "COMPLETED", "ARCHIVED"] }).notNull().default("ACTIVE"),
  periodizationBlocks: jsonb("periodization_blocks").$type<Array<{
    blockNumber: number;
    phaseSlug: string;
    startWeek: number;
    endWeek: number;
    durationWeeks: number;
  }>>().notNull(),
  systemWarnings: jsonb("system_warnings").$type<string[]>().notNull().default([]),
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
});

export const programDays = pgTable("program_days", {
  id: text("id").primaryKey(),
  programId: text("program_id").notNull().references(() => workoutPrograms.id, { onDelete: "cascade" }),
  weekNumber: integer("week_number").notNull(),
  dayNumber: integer("day_number").notNull(),
  focusPhaseSlug: text("focus_phase_slug").notNull(),
  isRestDay: boolean("is_rest_day").notNull().default(false),
  intraWorkoutRestDelayMinutes: integer("intra_workout_rest_delay_minutes").default(0),
});

export const programExercises = pgTable("program_exercises", {
  id: text("id").primaryKey(),
  programDayId: text("program_day_id").notNull().references(() => programDays.id, { onDelete: "cascade" }),
  exerciseSlug: text("exercise_slug").notNull(),
  substitutedFromSlug: text("substituted_from_slug"),
  patternId: integer("pattern_id").notNull(),
  prescribedSets: integer("prescribed_sets").notNull(),
  prescribedReps: integer("prescribed_reps").notNull(),
  prescribedTempo: text("prescribed_tempo").notNull(),
  prescribedRestSec: integer("prescribed_rest_sec").notNull(),
  targetIntensityPct: doublePrecision("target_intensity_pct"),
  targetLoadKg: doublePrecision("target_load_kg"),
  targetRpe: doublePrecision("target_rpe"),
  orderRank: integer("order_rank").notNull(),
});

export const workoutLogs = pgTable("workout_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  programId: text("program_id").notNull().references(() => workoutPrograms.id, { onDelete: "cascade" }),
  programExerciseId: text("program_exercise_id").notNull().references(() => programExercises.id, { onDelete: "cascade" }),
  weekNumber: integer("week_number").notNull(),
  setNumber: integer("set_number").notNull(),
  prescribedLoadKg: doublePrecision("prescribed_load_kg"),
  prescribedReps: integer("prescribed_reps").notNull(),
  actualLoadKg: doublePrecision("actual_load_kg").notNull(),
  actualReps: integer("actual_reps").notNull(),
  perceivedRpe: doublePrecision("perceived_rpe").notNull(),
  calculatedDaily1rmKg: doublePrecision("calculated_daily_1rm_kg").notNull(),
  autoRegulatedNextWeekLoadKg: doublePrecision("auto_regulated_next_week_load_kg").notNull(),
  loggedAt: timestamp("logged_at").notNull().defaultNow(),
});
