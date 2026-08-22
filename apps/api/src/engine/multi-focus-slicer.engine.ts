import { RULE_PERIODIZATION_SEQUENCING } from './master-data.js';

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

export function getCompatibility(phaseSlugA: string, phaseSlugB: string) {
  if (phaseSlugA === phaseSlugB) return 'SYNERGISTIC';
  
  const match = PROGRAM_COMPATIBILITY.find(
    pair => (pair.program_a === phaseSlugA && pair.program_b === phaseSlugB) || 
            (pair.program_a === phaseSlugB && pair.program_b === phaseSlugA)
  );
  
  return match ? match.status : 'NEUTRAL';
}

/**
 * Builds a periodization plan (sequential or concurrent).
 * @param {string[]} selectedGoals - Array of phase slugs (e.g. ['hypertrophy', 'strength_max'])
 * @param {number} durationWeeks - Total duration of the program in weeks
 * @param {string} trainingAgeLevel - 'BEGINNER', 'INTERMEDIATE', or 'ADVANCED'
 * @returns {object} The periodization plan
 */
export function buildPeriodizationPlan(selectedGoals: any[], durationWeeks: number, trainingAgeLevel: string) {
  let daysPerWeek = 3;
  if (trainingAgeLevel === 'INTERMEDIATE') daysPerWeek = 4;
  else if (trainingAgeLevel === 'ADVANCED') daysPerWeek = 5;

  let compatibilityResults: any[] = [];
  let warnings: string[] = [];
  
  if (selectedGoals.length === 1) {
    return {
      strategy: 'SEQUENTIAL',
      blocks: [{ phase_slug: selectedGoals[0], start_week: 1, end_week: durationWeeks }],
      weekly_schedule: [],
      compatibility_results: [],
      warnings: []
    };
  }

  let hasConflicting = false;
  
  for (let i = 0; i < selectedGoals.length; i++) {
    for (let j = i + 1; j < selectedGoals.length; j++) {
      const status = getCompatibility(selectedGoals[i], selectedGoals[j]);
      compatibilityResults.push({ pair: [selectedGoals[i], selectedGoals[j]], status });
      if (status === 'CONFLICTING') {
        hasConflicting = true;
      }
    }
  }

  if (durationWeeks >= 8 && hasConflicting) {
    // SEQUENTIAL BLOCK
    const sortedGoals = [...selectedGoals].sort((a, b) => {
      const rankA = (RULE_PERIODIZATION_SEQUENCING as any[]).find(r => r.phase_slug === a)?.sequence_order_rank || 99;
      const rankB = (RULE_PERIODIZATION_SEQUENCING as any[]).find(r => r.phase_slug === b)?.sequence_order_rank || 99;
      return rankA - rankB;
    });

    const weeksPerBlock = Math.round(durationWeeks / sortedGoals.length);
    let blocks = [];
    let currentWeek = 1;
    
    for (let i = 0; i < sortedGoals.length; i++) {
      let endWeek = currentWeek + weeksPerBlock - 1;
      if (i === sortedGoals.length - 1) endWeek = durationWeeks;
      blocks.push({ phase_slug: sortedGoals[i], start_week: currentWeek, end_week: endWeek });
      currentWeek = endWeek + 1;
    }
    
    return {
      strategy: 'SEQUENTIAL',
      blocks,
      weekly_schedule: [],
      compatibility_results: compatibilityResults,
      warnings
    };
  } else {
    // CONCURRENT SPLIT (DUP)
    let weeklySchedule = [];
    
    for (let w = 1; w <= durationWeeks; w++) {
      let days = [];
      for (let d = 1; d <= daysPerWeek; d++) {
        const goalIndex = (d - 1) % selectedGoals.length;
        days.push({ day_number: d, phase_slug: selectedGoals[goalIndex] });
      }
      weeklySchedule.push({ week: w, days });
    }

    const hasNeutral = compatibilityResults.some(r => r.status === 'NEUTRAL');
    if (hasNeutral) {
      warnings.push("A NEUTRAL pair was detected. If doing both on the same day, ensure a 3-hour gap between sessions.");
    }

    return {
      strategy: 'CONCURRENT',
      blocks: [],
      weekly_schedule: weeklySchedule,
      compatibility_results: compatibilityResults,
      warnings
    };
  }
}
