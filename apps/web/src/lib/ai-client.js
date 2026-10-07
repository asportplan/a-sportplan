/**
 * Client for the /api/ai serverless function, plus compact context builders so the
 * prompt carries what the model needs without shipping the whole program JSON.
 */
import { supabase } from '../core/db/supabase-client.js';

export class AiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'AiError';
    this.status = status;
  }
}

async function callAi(payload) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) throw new AiError('Silakan masuk (login) untuk memakai fitur AI.', 401);

  let res;
  try {
    res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new AiError('Tidak ada koneksi internet. Fitur AI butuh koneksi.', 0);
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new AiError(body.error || `Fitur AI gagal (${res.status}).`, res.status);
  return body;
}

const exercisesOf = (s) => s?.exercises || s?.prescribed_exercises || [];

/** Week-level summary + the first week in full detail. */
export function buildProgramContext(program) {
  if (!program) return {};
  const weeks = program.weeks || [];
  return {
    athlete: {
      level: program.metadata?.training_age_level,
      age: program.metadata?.user_age,
      body_weight_kg: program.metadata?.body_weight_kg,
      goals: program.metadata?.selected_goals,
      duration_weeks: program.metadata?.duration_weeks,
      target_1rm_increase_pct: program.metadata?.target_1rm_increase_pct,
    },
    medical: {
      clearance: program.medical_screening?.clearance_status,
      injury_intensity_caps: program.medical_screening?.modifiers?.max_intensity_override_areas,
      blocked_exercises: program.medical_screening?.modifiers?.blocked_exercise_slugs,
      rpe_only: program.medical_screening?.modifiers?.force_rpe,
    },
    periodization: program.periodization?.strategy,
    weeks: weeks.map(w => {
      const ex = (w.sessions || []).flatMap(exercisesOf);
      const pct = ex.filter(e => e.intensity_pct).map(e => e.intensity_pct);
      return {
        week: w.week_number,
        phases: w.phase_slugs,
        deload: !!w.is_deload,
        sessions: (w.sessions || []).length,
        total_sets: ex.reduce((s, e) => s + (e.sets || 0), 0),
        avg_intensity_pct: pct.length ? Math.round((pct.reduce((a, b) => a + b, 0) / pct.length) * 100) : null,
      };
    }),
    week_1_detail: (weeks[0]?.sessions || []).map(s => ({
      day: s.day_number,
      exercises: exercisesOf(s).map(e => ({
        exercise: e.exercise_slug,
        sets: e.sets,
        reps: e.is_timed ? `${e.duration_sec}s` : e.reps,
        load: e.is_bodyweight ? 'bodyweight' : e.load_kg ? `${e.load_kg} kg` : null,
        intensity_pct: e.intensity_pct ? Math.round(e.intensity_pct * 100) : null,
        rpe: e.target_rpe,
        rest_s: e.rest_interval_seconds,
        capped: !!e.capped_by_safety_module,
      })),
    })),
  };
}

export function buildReportContext(program, report) {
  return {
    program: buildProgramContext(program),
    results: {
      compliance: report?.compliance,
      volume: report?.volume,
      rpe_per_week: report?.rpeTrends,
      estimated_1rm_by_week: report?.strengthProgression,
      body_weight: report?.bodyWeight,
    },
  };
}

export const generateAiReport = (program, report) =>
  callAi({ mode: 'report', context: buildReportContext(program, report) }).then(r => r.text);

export const askCoach = (program, messages) =>
  callAi({ mode: 'coach', context: buildProgramContext(program), messages }).then(r => r.text);

export const proposeAdjustments = (program, report) =>
  callAi({ mode: 'adjust', context: buildReportContext(program, report) }).then(r => r.result);
