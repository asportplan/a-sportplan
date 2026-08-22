import { pgTable, text, integer, doublePrecision, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { user } from "./auth.js";

export const userProfiles = pgTable("user_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique().references(() => user.id, { onDelete: "cascade" }),
  age: integer("age").notNull(),
  weightKg: doublePrecision("weight_kg").notNull(),
  heightCm: doublePrecision("height_cm").notNull(),
  trainingAgeLevel: text("training_age_level", { enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"] }).notNull(),
  activeProgramDurationWeeks: integer("active_program_duration_weeks").notNull().default(8),
  preferredLanguage: text("preferred_language", { enum: ["id", "en"] }).notNull().default("id"),
  selectedGoals: jsonb("selected_goals").$type<string[]>().notNull().default([]),
  target1rmIncreasePct: doublePrecision("target_1rm_increase_pct").notNull().default(10.0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const medicalScreenings = pgTable("medical_screenings", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  hasHeartCondition: boolean("has_heart_condition").notNull().default(false),
  hasAsthma: boolean("has_asthma").notNull().default(false),
  hasChestPain: boolean("has_chest_pain").notNull().default(false),
  hasInjury: boolean("has_injury").notNull().default(false),
  injuryArea: text("injury_area", { enum: ["upper", "lower", "core"] }),
  takesMedication: boolean("takes_medication").notNull().default(false),
  clearanceStatus: text("clearance_status").notNull(),
  modifiers: jsonb("modifiers").$type<{
    restMultiplier: number;
    forceRpe: boolean;
    maxIntensityOverrideAreas: { upper: number | null; lower: number | null; core: number | null };
    blockedSafetyCategoriesPerArea: { upper: number[] | null; lower: number[] | null; core: number[] | null };
  }>().notNull(),
  messages: jsonb("messages").$type<string[]>().notNull().default([]),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});
