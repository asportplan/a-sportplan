import { drizzle } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import dotenv from "dotenv";
import * as schema from "./schema/index.js";

dotenv.config({ path: '../../.env' });

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true' || Boolean(process.env.VERCEL_ENV);
const dataDir = process.env.DB_DATA_DIR || "./precisetrain-db-data";

export const pglite = isVercel ? new PGlite() : new PGlite(dataDir);
export const db = drizzle(pglite, { schema });

/**
 * Auto-initialize database tables and seed data if missing
 */
export async function initDb() {
  try {
    // Create Better Auth tables if not existing
    await pglite.exec(`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL UNIQUE,
        "email_verified" BOOLEAN NOT NULL DEFAULT FALSE,
        "image" TEXT,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "session" (
        "id" TEXT PRIMARY KEY,
        "expires_at" TIMESTAMP NOT NULL,
        "token" TEXT NOT NULL UNIQUE,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "ip_address" TEXT,
        "user_agent" TEXT,
        "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "account" (
        "id" TEXT PRIMARY KEY,
        "account_id" TEXT NOT NULL,
        "provider_id" TEXT NOT NULL,
        "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "access_token" TEXT,
        "refresh_token" TEXT,
        "id_token" TEXT,
        "access_token_expires_at" TIMESTAMP,
        "refresh_token_expires_at" TIMESTAMP,
        "scope" TEXT,
        "password" TEXT,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "verification" (
        "id" TEXT PRIMARY KEY,
        "identifier" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "user_profiles" (
        "id" TEXT PRIMARY KEY,
        "user_id" TEXT NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE,
        "age" INTEGER,
        "gender" TEXT,
        "weight_kg" NUMERIC(5,2),
        "height_cm" NUMERIC(5,2),
        "training_age_level" TEXT NOT NULL,
        "active_program_duration_weeks" INTEGER DEFAULT 8,
        "preferred_language" TEXT DEFAULT 'id',
        "selected_goals" JSONB NOT NULL DEFAULT '[]',
        "target_1rm_increase_pct" NUMERIC(5,2) DEFAULT 10.00,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "medical_screenings" (
        "id" TEXT PRIMARY KEY,
        "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "has_heart_condition" BOOLEAN NOT NULL DEFAULT FALSE,
        "has_asthma" BOOLEAN NOT NULL DEFAULT FALSE,
        "has_chest_pain" BOOLEAN NOT NULL DEFAULT FALSE,
        "has_injury" BOOLEAN NOT NULL DEFAULT FALSE,
        "injury_area" TEXT,
        "takes_medication" BOOLEAN NOT NULL DEFAULT FALSE,
        "clearance_status" TEXT NOT NULL,
        "modifiers" JSONB NOT NULL,
        "messages" JSONB NOT NULL,
        "completed_at" TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "user_equipments" (
        "id" TEXT PRIMARY KEY,
        "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "exercise_slug" TEXT NOT NULL,
        "user_1rm_kg" NUMERIC(6,2),
        "updated_at" TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "workout_programs" (
        "id" TEXT PRIMARY KEY,
        "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "duration_weeks" INTEGER NOT NULL,
        "training_age_level" TEXT NOT NULL,
        "selected_goals" JSONB NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "periodization_blocks" JSONB NOT NULL,
        "system_warnings" JSONB NOT NULL,
        "generated_at" TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "program_days" (
        "id" TEXT PRIMARY KEY,
        "program_id" TEXT NOT NULL REFERENCES "workout_programs"("id") ON DELETE CASCADE,
        "week_number" INTEGER NOT NULL,
        "day_number" INTEGER NOT NULL,
        "focus_phase_slug" TEXT NOT NULL,
        "is_rest_day" BOOLEAN NOT NULL DEFAULT FALSE,
        "intra_workout_rest_delay_minutes" INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS "program_exercises" (
        "id" TEXT PRIMARY KEY,
        "program_day_id" TEXT NOT NULL REFERENCES "program_days"("id") ON DELETE CASCADE,
        "exercise_slug" TEXT NOT NULL,
        "substituted_from_slug" TEXT,
        "pattern_id" INTEGER NOT NULL,
        "prescribed_sets" INTEGER NOT NULL,
        "prescribed_reps" INTEGER NOT NULL,
        "prescribed_tempo" TEXT NOT NULL,
        "prescribed_rest_sec" INTEGER NOT NULL,
        "target_intensity_pct" DOUBLE PRECISION,
        "target_load_kg" DOUBLE PRECISION,
        "target_rpe" DOUBLE PRECISION,
        "order_rank" INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "workout_logs" (
        "id" TEXT PRIMARY KEY,
        "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "program_id" TEXT NOT NULL REFERENCES "workout_programs"("id") ON DELETE CASCADE,
        "program_exercise_id" TEXT NOT NULL REFERENCES "program_exercises"("id") ON DELETE CASCADE,
        "week_number" INTEGER NOT NULL,
        "set_number" INTEGER NOT NULL,
        "prescribed_load_kg" DOUBLE PRECISION,
        "prescribed_reps" INTEGER NOT NULL,
        "actual_load_kg" DOUBLE PRECISION NOT NULL,
        "actual_reps" INTEGER NOT NULL,
        "perceived_rpe" DOUBLE PRECISION NOT NULL,
        "calculated_daily_1rm_kg" DOUBLE PRECISION NOT NULL,
        "auto_regulated_next_week_load_kg" DOUBLE PRECISION NOT NULL,
        "logged_at" TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "master_movement_patterns" (
        "id" SERIAL PRIMARY KEY,
        "pattern_slug" TEXT UNIQUE NOT NULL,
        "body_area" TEXT NOT NULL,
        "cross_pattern_fallback_slug" TEXT
      );

      CREATE TABLE IF NOT EXISTS "master_exercises" (
        "id" SERIAL PRIMARY KEY,
        "exercise_slug" TEXT UNIQUE NOT NULL,
        "pattern_slug" TEXT NOT NULL,
        "equipment_brand" TEXT DEFAULT 'technogym',
        "primary_muscle_group_slug" TEXT NOT NULL,
        "safety_category" INTEGER NOT NULL DEFAULT 1,
        "max_allowed_intensity_pct" DOUBLE PRECISION DEFAULT 1.0,
        "substitution_priority_rank" INTEGER DEFAULT 1,
        "load_step_kg" DOUBLE PRECISION DEFAULT 2.5
      );

      CREATE TABLE IF NOT EXISTS "master_training_phases" (
        "id" SERIAL PRIMARY KEY,
        "phase_slug" TEXT UNIQUE NOT NULL,
        "phase_name" TEXT NOT NULL,
        "min_intensity_pct" DOUBLE PRECISION NOT NULL,
        "max_intensity_pct" DOUBLE PRECISION NOT NULL,
        "target_reps_min" INTEGER NOT NULL,
        "target_reps_max" INTEGER NOT NULL,
        "target_sets_min" INTEGER NOT NULL,
        "target_sets_max" INTEGER NOT NULL,
        "rest_interval_sec_min" INTEGER NOT NULL,
        "rest_interval_sec_max" INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "rule_training_age_modifiers" (
        "id" SERIAL PRIMARY KEY,
        "level" TEXT UNIQUE NOT NULL,
        "volume_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
        "rest_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
        "mesocycle_length_weeks" INTEGER NOT NULL DEFAULT 4
      );
    `);
    console.log("[DB] Local database tables auto-initialized successfully.");
  } catch (err) {
    console.error("[DB] Failed to auto-initialize local database tables:", err);
  }
}
