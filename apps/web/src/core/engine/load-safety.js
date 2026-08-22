import { clamp } from '../utils/helpers.js';
import { getPhaseBySlug } from '../db/master-data.js';

/**
 * Applies load safety cap to prevent unrealistic or unsafe loads.
 * @param {object} exercise 
 * @param {number} calculatedIntensityPct 
 * @param {number|null} user1rmKg 
 * @param {string} phaseSlug 
 * @param {number} [originalReps] 
 * @returns {object}
 */
export function applyLoadSafetyCap(exercise, calculatedIntensityPct, user1rmKg, phaseSlug, originalReps) {
    if (!exercise) return null;
    
    const phase = getPhaseBySlug(phaseSlug);
    // Assumes max_allowed_intensity_pct exists, fallback to 1.00 (100%)
    const maxAllowedIntensity = exercise.max_allowed_intensity_pct || 1.0;
    
    let capped = false;
    let finalIntensityPct = calculatedIntensityPct;
    let adjustedReps = originalReps || null;
    let adjustedRepsReason = null;
    
    if (calculatedIntensityPct > maxAllowedIntensity) {
        capped = true;
        finalIntensityPct = maxAllowedIntensity;
        
        if (originalReps) {
             const rawAdjusted = originalReps * (calculatedIntensityPct / finalIntensityPct);
             const minReps = phase ? (phase.target_reps_min || 1) : 1;
             const maxReps = phase ? (phase.target_reps_max || 99) : 99;
             
             adjustedReps = Math.round(rawAdjusted);
             adjustedReps = clamp(adjustedReps, minReps, maxReps);
             
             adjustedRepsReason = `Intensity capped at ${maxAllowedIntensity}. Reps increased to compensate volume.`;
        }
    }
    
    const loadStep = exercise.load_step_kg || 2.5;
    const finalLoadKg = user1rmKg ? Math.round((user1rmKg * finalIntensityPct) / loadStep) * loadStep : null;
    
    return {
        final_intensity_pct: finalIntensityPct,
        final_load_kg: finalLoadKg,
        capped_by_safety_module: capped,
        original_intensity_pct: calculatedIntensityPct,
        max_intensity_cap: maxAllowedIntensity,
        adjusted_reps: adjustedReps,
        adjusted_reps_reason: adjustedRepsReason
    };
}
