/**
 * Program Phase Compatibility Matrix based on AMPK vs mTOR interference effects.
 * SYNERGISTIC: No molecular competition, activities amplify each other
 * NEUTRAL: Different axes, only minor local fatigue overlap
 * CONFLICTING: Opposing biochemical responses (AMPK-mTOR master-switch conflict)
 */

export const PROGRAM_COMPATIBILITY = [
  { program_a: 'strength_endurance_aa', program_b: 'strength_max', status: 'CONFLICTING' },
  { program_a: 'strength_endurance_aa', program_b: 'power', status: 'CONFLICTING' },
  { program_a: 'strength_endurance_aa', program_b: 'speed_power', status: 'CONFLICTING' },
  { program_a: 'strength_endurance_aa', program_b: 'balance_agility', status: 'NEUTRAL' },
  { program_a: 'strength_endurance_aa', program_b: 'core_stability', status: 'SYNERGISTIC' },
  { program_a: 'strength_endurance_aa', program_b: 'functional_training', status: 'NEUTRAL' },
  { program_a: 'strength_endurance_aa', program_b: 'stabilization_endurance', status: 'SYNERGISTIC' },
  { program_a: 'strength_endurance_aa', program_b: 'muscular_endurance', status: 'SYNERGISTIC' },
  { program_a: 'strength_endurance_aa', program_b: 'hypertrophy', status: 'NEUTRAL' },
  
  { program_a: 'strength_max', program_b: 'power', status: 'SYNERGISTIC' },
  { program_a: 'strength_max', program_b: 'speed_power', status: 'SYNERGISTIC' },
  { program_a: 'strength_max', program_b: 'balance_agility', status: 'NEUTRAL' },
  { program_a: 'strength_max', program_b: 'core_stability', status: 'NEUTRAL' },
  { program_a: 'strength_max', program_b: 'functional_training', status: 'NEUTRAL' },
  { program_a: 'strength_max', program_b: 'stabilization_endurance', status: 'CONFLICTING' },
  { program_a: 'strength_max', program_b: 'muscular_endurance', status: 'CONFLICTING' },
  { program_a: 'strength_max', program_b: 'hypertrophy', status: 'SYNERGISTIC' },
  
  { program_a: 'power', program_b: 'speed_power', status: 'SYNERGISTIC' },
  { program_a: 'power', program_b: 'balance_agility', status: 'NEUTRAL' },
  { program_a: 'power', program_b: 'core_stability', status: 'NEUTRAL' },
  { program_a: 'power', program_b: 'functional_training', status: 'NEUTRAL' },
  { program_a: 'power', program_b: 'stabilization_endurance', status: 'CONFLICTING' },
  { program_a: 'power', program_b: 'muscular_endurance', status: 'CONFLICTING' },
  { program_a: 'power', program_b: 'hypertrophy', status: 'NEUTRAL' },
  
  { program_a: 'speed_power', program_b: 'balance_agility', status: 'NEUTRAL' },
  { program_a: 'speed_power', program_b: 'core_stability', status: 'NEUTRAL' },
  { program_a: 'speed_power', program_b: 'functional_training', status: 'NEUTRAL' },
  { program_a: 'speed_power', program_b: 'stabilization_endurance', status: 'CONFLICTING' },
  { program_a: 'speed_power', program_b: 'muscular_endurance', status: 'CONFLICTING' },
  { program_a: 'speed_power', program_b: 'hypertrophy', status: 'NEUTRAL' },
  
  { program_a: 'balance_agility', program_b: 'core_stability', status: 'SYNERGISTIC' },
  { program_a: 'balance_agility', program_b: 'functional_training', status: 'SYNERGISTIC' },
  { program_a: 'balance_agility', program_b: 'stabilization_endurance', status: 'SYNERGISTIC' },
  { program_a: 'balance_agility', program_b: 'muscular_endurance', status: 'NEUTRAL' },
  { program_a: 'balance_agility', program_b: 'hypertrophy', status: 'NEUTRAL' },
  
  { program_a: 'core_stability', program_b: 'functional_training', status: 'SYNERGISTIC' },
  { program_a: 'core_stability', program_b: 'stabilization_endurance', status: 'SYNERGISTIC' },
  { program_a: 'core_stability', program_b: 'muscular_endurance', status: 'NEUTRAL' },
  { program_a: 'core_stability', program_b: 'hypertrophy', status: 'NEUTRAL' },
  
  { program_a: 'functional_training', program_b: 'stabilization_endurance', status: 'SYNERGISTIC' },
  { program_a: 'functional_training', program_b: 'muscular_endurance', status: 'NEUTRAL' },
  { program_a: 'functional_training', program_b: 'hypertrophy', status: 'NEUTRAL' },
  
  { program_a: 'stabilization_endurance', program_b: 'muscular_endurance', status: 'SYNERGISTIC' },
  { program_a: 'stabilization_endurance', program_b: 'hypertrophy', status: 'CONFLICTING' },
  
  { program_a: 'muscular_endurance', program_b: 'hypertrophy', status: 'CONFLICTING' }
];

/**
 * Gets the compatibility status between two training phases.
 * @param {string} phaseSlugA - Slug of the first training phase
 * @param {string} phaseSlugB - Slug of the second training phase
 * @returns {string} 'SYNERGISTIC', 'NEUTRAL', or 'CONFLICTING'
 */
export function getCompatibility(phaseSlugA, phaseSlugB) {
  if (phaseSlugA === phaseSlugB) return 'SYNERGISTIC';
  
  const match = PROGRAM_COMPATIBILITY.find(
    pair => (pair.program_a === phaseSlugA && pair.program_b === phaseSlugB) || 
            (pair.program_a === phaseSlugB && pair.program_b === phaseSlugA)
  );
  
  return match ? match.status : 'NEUTRAL';
}
