import { clamp, calculateLoadFromRM } from '../utils/helpers.js';
import { getPhaseBySlug } from '../db/master-data.js';

/**
 * Calculates the exercise intensity based on phase, modifiers, and safety rules.
 * @param {string} phaseSlug 
 * @param {string} exerciseSlug 
 * @param {number|null} user1rmKg 
 * @param {object} weekModifier 
 * @param {object} ageModifier 
 * @param {object} medicalModifiers 
 * @returns {object}
 */
export function calculateExerciseIntensity(phaseSlug, exerciseSlug, user1rmKg, weekModifier, ageModifier, medicalModifiers) {
    const phase = getPhaseBySlug(phaseSlug);
    if (!phase) {
        return null;
    }
    
    const forceRpe = medicalModifiers && medicalModifiers.force_rpe === true;
    
    if (phase.uses_rpe_flag === true || forceRpe) {
        return {
            uses_rpe: true,
            intensity_pct: null,
            load_kg: null,
            target_rpe: phase.target_rpe || 8,
            time_under_tension_sec: phase.time_under_tension_sec || null
        };
    }
    
    const minPct = phase.min_intensity_pct || 0.5;
    const maxPct = phase.max_intensity_pct || 0.8;
    
    // Deterministic: use midpoint of phase intensity range for consistent, reproducible results
    const baseIntensity = (minPct + maxPct) / 2;
    
    const weekMod = (weekModifier && weekModifier.intensity_mod) ? weekModifier.intensity_mod : 0;
    const modifiedIntensity = baseIntensity + weekMod;
    
    const finalIntensity = clamp(modifiedIntensity, 0.30, 1.00);
    
    const loadKg = user1rmKg !== null ? calculateLoadFromRM(user1rmKg, finalIntensity) : null;
    
    return {
        uses_rpe: false,
        intensity_pct: finalIntensity,
        load_kg: loadKg,
        target_rpe: null,
        time_under_tension_sec: null
    };
}
