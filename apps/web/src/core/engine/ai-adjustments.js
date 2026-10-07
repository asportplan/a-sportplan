/**
 * ai-adjustments.js - Rule-engine gate for AI adjustment proposals.
 *
 * The AI may only PROPOSE week-level changes. Every proposal is checked here against the
 * engine's own limits, and loads are recomputed from the prescription already produced by
 * the engine (which already carries the injury / age / exercise intensity ceilings in
 * `max_intensity_cap`). Nothing the AI returns is written into the program unvalidated.
 */

const LIMITS = {
  volume: { min: -50, max: 20 },     // % change in sets
  intensity: { min: -10, max: 5 },   // percentage-point change in %1RM
};
const MAX_SETS = 5;
const DELOAD_SET_REDUCTION = 0.4;
const DELOAD_INTENSITY_CEILING = 0.65;

function sessionsOf(week) {
  return week?.sessions || week?.days || [];
}

function exercisesOf(session) {
  return session?.exercises || session?.prescribed_exercises || [];
}

const round05 = (kg) => Math.round(kg * 2) / 2;

/**
 * @param {object} program - generated program
 * @param {Array} proposals - AI proposals [{type, week, change_pct, reason}]
 * @param {number} lastLoggedWeek - highest week that already has logged results
 * @returns {{accepted: Array, rejected: Array}}
 */
export function validateProposals(program, proposals, lastLoggedWeek = 0) {
  const accepted = [];
  const rejected = [];
  const weeks = program?.weeks || [];
  const seen = new Set();

  for (const p of Array.isArray(proposals) ? proposals : []) {
    const week = weeks.find(w => w.week_number === p.week);
    const key = `${p.type}-${p.week}`;
    let reason = null;

    if (!['volume', 'intensity', 'deload'].includes(p.type)) reason = 'unknown_type';
    else if (!week) reason = 'week_not_found';
    else if (p.week <= lastLoggedWeek) reason = 'week_already_done';
    else if (seen.has(key)) reason = 'duplicate';
    else if (p.type === 'deload' && week.is_deload) reason = 'already_deload';
    else if (p.type !== 'deload') {
      const { min, max } = LIMITS[p.type];
      if (typeof p.change_pct !== 'number' || Number.isNaN(p.change_pct)) reason = 'invalid_value';
      else if (p.change_pct < min || p.change_pct > max) reason = 'outside_safe_range';
      else if (p.change_pct === 0) reason = 'no_change';
      else if (p.type === 'intensity' && p.change_pct > 0 && week.is_deload) reason = 'deload_week_no_increase';
    }

    if (reason) rejected.push({ ...p, rejected_reason: reason });
    else { accepted.push(p); seen.add(key); }
  }
  return { accepted, rejected };
}

function adjustExercise(ex, proposal) {
  const out = { ...ex, notes: Array.isArray(ex.notes) ? [...ex.notes] : [] };
  const cap = ex.max_intensity_cap || 1.0;

  if (proposal.type === 'volume' || proposal.type === 'deload') {
    const factor = proposal.type === 'deload' ? 1 - DELOAD_SET_REDUCTION : 1 + proposal.change_pct / 100;
    out.sets = Math.min(MAX_SETS, Math.max(1, Math.round((ex.sets || 1) * factor)));
  }

  if (proposal.type === 'intensity' || proposal.type === 'deload') {
    if (ex.is_bodyweight || ex.uses_rpe_flag) {
      const delta = proposal.type === 'deload' ? -1 : Math.sign(proposal.change_pct);
      out.target_rpe = Math.min(9, Math.max(6, (ex.target_rpe || 8) + delta));
    } else if (ex.intensity_pct) {
      const target = proposal.type === 'deload'
        ? Math.min(ex.intensity_pct, DELOAD_INTENSITY_CEILING)
        : ex.intensity_pct + proposal.change_pct / 100;
      // Never above the engine's ceiling for this exercise (injury / age / exercise caps)
      const next = Math.min(cap, Math.max(0.3, target));
      if (ex.load_kg) out.load_kg = round05(ex.load_kg * (next / ex.intensity_pct));
      out.intensity_pct = Math.round(next * 1000) / 1000;
      if (next < target) out.capped_by_safety_module = true;
    }
  }

  out.notes.push(`AI: ${proposal.type} ${proposal.type === 'deload' ? '' : `${proposal.change_pct > 0 ? '+' : ''}${proposal.change_pct}%`}`.trim());
  return out;
}

/**
 * Applies validated proposals to a deep copy of the program.
 * @returns {object} new program
 */
export function applyProposals(program, acceptedProposals) {
  const next = JSON.parse(JSON.stringify(program));
  for (const p of acceptedProposals) {
    const week = next.weeks.find(w => w.week_number === p.week);
    if (!week) continue;
    if (p.type === 'deload') week.is_deload = true;
    for (const session of sessionsOf(week)) {
      const key = session.exercises ? 'exercises' : 'prescribed_exercises';
      session[key] = exercisesOf(session).map(ex => adjustExercise(ex, p));
      session.total_estimated_volume_kg = session[key].reduce(
        (sum, ex) => sum + (ex.load_kg || 0) * (ex.sets || 0) * (ex.reps || 0), 0,
      );
    }
    week.total_week_volume_kg = sessionsOf(week).reduce((s, x) => s + (x.total_estimated_volume_kg || 0), 0);
  }
  next.ai_adjustments = [
    ...(program.ai_adjustments || []),
    ...acceptedProposals.map(p => ({ ...p, applied_at: new Date().toISOString() })),
  ];
  return next;
}
