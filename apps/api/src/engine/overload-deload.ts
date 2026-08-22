import { RULE_WEEKLY_OVERLOAD, RULE_TRAINING_AGE_MODIFIERS } from './master-data.js';

/**
 * Gets overload and deload modifiers for a specific week.
 * @param {number} weekNumber - Current week number (1-indexed)
 * @param {string} trainingAgeLevel - 'BEGINNER', 'INTERMEDIATE', or 'ADVANCED'
 * @param {number} target1rmIncreasePct - Target percentage increase (e.g., 5 for 5%)
 * @param {number} totalDurationWeeks - Total length of the training cycle
 * @returns {object} Week modifiers object
 */
export function getWeekModifiers(weekNumber, trainingAgeLevel, target1rmIncreasePct, totalDurationWeeks) {
  const normLevel = (trainingAgeLevel || 'BEGINNER').toUpperCase();
  const ageMods = RULE_TRAINING_AGE_MODIFIERS.find(r => r.training_age_level === normLevel) || RULE_TRAINING_AGE_MODIFIERS[0];
  const mesocyclePattern = RULE_WEEKLY_OVERLOAD[normLevel] || RULE_WEEKLY_OVERLOAD.BEGINNER;
  
  const mesocycleLength = ageMods.mesocycle_length_weeks;
  const positionInCycle = (weekNumber - 1) % mesocycleLength;
  const mesocycleNumber = Math.floor((weekNumber - 1) / mesocycleLength) + 1;
  
  const baseModifiers = mesocyclePattern.find(m => m.week === positionInCycle + 1) || mesocyclePattern[0];
  
  const deloadWeeks = calculateDeloadWeeks(totalDurationWeeks, trainingAgeLevel);
  const effectiveTrainingWeeks = totalDurationWeeks - deloadWeeks;
  let targetWeeklyIncrement = 0;
  if (effectiveTrainingWeeks > 0) {
    targetWeeklyIncrement = (target1rmIncreasePct / 100) / effectiveTrainingWeeks;
  }
  
  let adjustedIntensityMod = baseModifiers.intensity_mod;
  const previousCycleProgression = (mesocycleNumber - 1) * targetWeeklyIncrement * mesocycleLength;

  if (!baseModifiers.is_deload && targetWeeklyIncrement > 0) {
    adjustedIntensityMod = previousCycleProgression + (targetWeeklyIncrement * (positionInCycle + 1));
  } else if (baseModifiers.is_deload) {
    adjustedIntensityMod = previousCycleProgression + baseModifiers.intensity_mod;
  }
  
  return {
    week_number: weekNumber,
    position_in_mesocycle: positionInCycle + 1,
    mesocycle_number: mesocycleNumber,
    intensity_mod_multiplier: adjustedIntensityMod,
    volume_mod_multiplier: baseModifiers.volume_mod,
    is_deload_period: baseModifiers.is_deload,
    deload_set_reduction: baseModifiers.deload_set_reduction || 0
  };
}

/**
 * Calculates total number of deload weeks in a training cycle.
 * @param {number} totalDurationWeeks - Total cycle duration
 * @param {string} trainingAgeLevel - Age level
 * @returns {number} Number of deload weeks
 */
export function calculateDeloadWeeks(totalDurationWeeks, trainingAgeLevel) {
  const normLevel = (trainingAgeLevel || 'BEGINNER').toUpperCase();
  const ageMods = RULE_TRAINING_AGE_MODIFIERS.find(r => r.training_age_level === normLevel) || RULE_TRAINING_AGE_MODIFIERS[0];
  const mesocycleLength = ageMods ? ageMods.mesocycle_length_weeks : 4;
  return Math.floor(totalDurationWeeks / mesocycleLength);
}

/**
 * Returns progression summary for chart visualization.
 * @param {string} trainingAgeLevel - Age level
 * @param {number} target1rmPct - Target 1RM %
 * @param {number} durationWeeks - Total weeks
 * @returns {Array} Array of week statuses
 */
export function getProgressionSummary(trainingAgeLevel, target1rmPct, durationWeeks) {
  let summary = [];
  for (let w = 1; w <= durationWeeks; w++) {
    const mods = getWeekModifiers(w, trainingAgeLevel, target1rmPct, durationWeeks);
    let status = 'BASELINE';
    if (mods.is_deload_period) status = 'DELOAD';
    else if (mods.intensity_mod_multiplier > 0) status = 'OVERLOAD';
    
    summary.push({
      week: w,
      status: status,
      intensity_mod: mods.intensity_mod_multiplier,
      volume_mod: mods.volume_mod_multiplier
    });
  }
  return summary;
}
