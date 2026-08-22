import { MST_MOVEMENT_PATTERNS } from './master-data.js';

/**
 * Gets the body area for a specific movement pattern.
 * @param {string} patternSlug - The slug of the movement pattern
 * @returns {string|null} 'upper', 'lower', 'core', or null
 */
export function getBodyAreaForPattern(patternSlug: any) {
  const upperPatterns = [
    'horizontal_push', 'incline_push', 'vertical_pull', 
    'horizontal_pull', 'vertical_push', 'elbow_flexion', 
    'elbow_extension', 'shoulder_abduction'
  ];
  
  const lowerPatterns = [
    'knee_dominant_bilateral', 'knee_dominant_isolation', 
    'hip_dominant', 'knee_flexion_isolation', 
    'ankle_plantarflexion', 'hip_abduction_adduction'
  ];
  
  const corePatterns = [
    'core_trunk_flexion', 'core_trunk_extension', 'core_trunk_rotation'
  ];
  
  if (upperPatterns.includes(patternSlug)) return 'upper';
  if (lowerPatterns.includes(patternSlug)) return 'lower';
  if (corePatterns.includes(patternSlug)) return 'core';
  
  return null;
}

/**
 * Processes a 5-question health screening array/object.
 * @param {object} screeningAnswers - The answers from triage
 * @returns {object} Status, modifiers, and generated messages
 */
export function processScreeningResults(screeningAnswers: any) {
  let result = {
    clearance_status: 'CLEAR',
    is_blocked: false,
    modifiers: {
      rest_multiplier: 1.0,
      force_rpe: false,
      blocked_patterns: [] as any[],
      max_intensity_override_areas: { upper: null as number | null, lower: null as number | null, core: null as number | null },
      blocked_safety_categories_per_area: { upper: null as number[] | null, lower: null as number[] | null, core: null as number[] | null }
    },
    messages: [] as string[]
  };

  const { q1_heart, q2_asthma, q3_chest_pain, q4_injury, q4_injury_area, q5_medication } = screeningAnswers;

  if (q1_heart === true || q3_chest_pain === true) {
    result.clearance_status = 'HARD_STOP';
    result.is_blocked = true;
    result.messages.push('msg_hard_stop_medical');
    return result;
  }

  if (q2_asthma === true) {
    result.modifiers.rest_multiplier = 1.5;
    result.clearance_status = 'MODIFIED_ASTHMA';
    result.messages.push('msg_modified_asthma');
  }

  if (q4_injury === true) {
    result.clearance_status = result.clearance_status === 'CLEAR' ? 'MODIFIED_INJURY' : result.clearance_status + '_INJURY';
    if (q4_injury_area === 'upper') {
      result.modifiers.max_intensity_override_areas.upper = 0.65;
      result.modifiers.blocked_safety_categories_per_area.upper = [1];
      result.messages.push('msg_modified_injury_upper');
    } else if (q4_injury_area === 'lower') {
      result.modifiers.max_intensity_override_areas.lower = 0.65;
      result.modifiers.blocked_safety_categories_per_area.lower = [1];
      result.messages.push('msg_modified_injury_lower');
    } else if (q4_injury_area === 'core') {
      result.modifiers.max_intensity_override_areas.core = 0.65;
      result.modifiers.blocked_safety_categories_per_area.core = [1, 2];
      result.messages.push('msg_modified_injury_core');
    }
  }

  if (q5_medication === true) {
    result.modifiers.force_rpe = true;
    result.clearance_status = result.clearance_status === 'CLEAR' ? 'WARNING_MEDICATION' : result.clearance_status + '_MEDICATION';
    result.messages.push('msg_warning_medication');
  }

  return result;
}
