import { getCompatibility } from '../db/compatibility-matrix.js';
import { RULE_PERIODIZATION_SEQUENCING } from '../db/master-data.js';

/**
 * Builds a periodization plan (sequential or concurrent).
 * @param {string[]} selectedGoals - Array of phase slugs (e.g. ['hypertrophy', 'strength_max'])
 * @param {number} durationWeeks - Total duration of the program in weeks
 * @param {string} trainingAgeLevel - 'BEGINNER', 'INTERMEDIATE', or 'ADVANCED'
 * @returns {object} The periodization plan
 */
export function buildPeriodizationPlan(selectedGoals, durationWeeks, trainingAgeLevel) {
  const normLevel = (trainingAgeLevel || 'BEGINNER').toUpperCase();
  let daysPerWeek = 3;
  if (normLevel === 'INTERMEDIATE') daysPerWeek = 4;
  else if (normLevel === 'ADVANCED') daysPerWeek = 5;

  let compatibilityResults = [];
  let warnings = [];
  
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
      const rankA = RULE_PERIODIZATION_SEQUENCING.find(r => r.phase_slug === a)?.sequence_order_rank || 99;
      const rankB = RULE_PERIODIZATION_SEQUENCING.find(r => r.phase_slug === b)?.sequence_order_rank || 99;
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
