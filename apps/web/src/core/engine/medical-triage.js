import { MST_MOVEMENT_PATTERNS, MST_MEDICAL_CONTRAINDICATIONS } from '../db/master-data.js';

/**
 * Gets the body area for a specific movement pattern.
 * @param {string} patternSlug - The slug of the movement pattern
 * @returns {string|null} 'upper', 'lower', 'core', or null
 */
export function getBodyAreaForPattern(patternSlug) {
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
export function processScreeningResults(screeningAnswers) {
  let result = {
    clearance_status: 'CLEAR',
    clearance_flags: [],    // E2: Array-based status tracking instead of string concatenation
    is_blocked: false,
    modifiers: {
      rest_multiplier: 1.0,
      force_rpe: false,
      blocked_patterns: [],
      blocked_exercise_slugs: [],
      max_intensity_override_areas: { upper: null, lower: null, core: null },
      blocked_safety_categories_per_area: { upper: null, lower: null, core: null }
    },
    messages: []
  };

  const { q1_heart, q2_asthma, q3_chest_pain, q4_injury, q4_injury_area, q4_injury_condition, q5_medication } = screeningAnswers;
  // The screening UI stores 'Upper' / 'Lower' / 'Core'; compare case-insensitively.
  const injuryArea = typeof q4_injury_area === 'string' ? q4_injury_area.toLowerCase() : null;

  if (q1_heart === true || q3_chest_pain === true) {
    result.clearance_status = 'HARD_STOP';
    result.clearance_flags = ['HARD_STOP'];
    result.is_blocked = true;
    result.messages.push('msg_hard_stop_medical');
    return result;
  }

  if (q2_asthma === true) {
    result.modifiers.rest_multiplier = 1.5;
    result.clearance_flags.push('MODIFIED_ASTHMA');
    result.messages.push('msg_modified_asthma');
  }

  if (q4_injury === true) {
    result.clearance_flags.push('MODIFIED_INJURY');
    if (injuryArea === 'upper') {
      result.modifiers.max_intensity_override_areas.upper = 0.65;
      result.modifiers.blocked_safety_categories_per_area.upper = [1];
      result.messages.push('msg_modified_injury_upper');
    } else if (injuryArea === 'lower') {
      result.modifiers.max_intensity_override_areas.lower = 0.65;
      result.modifiers.blocked_safety_categories_per_area.lower = [1];
      result.messages.push('msg_modified_injury_lower');
    } else if (injuryArea === 'core') {
      result.modifiers.max_intensity_override_areas.core = 0.65;
      result.modifiers.blocked_safety_categories_per_area.core = [1, 2];
      // Loaded spinal flexion aggravates most low-back / trunk injuries
      result.modifiers.blocked_exercise_slugs.push('sit_up', 'abdominal_crunch_machine');
      result.messages.push('msg_modified_injury_core');
    }
  }

  // Condition-specific contraindications (optional screening detail)
  const condition = q4_injury === true ? MST_MEDICAL_CONTRAINDICATIONS[q4_injury_condition] : null;
  if (condition) {
    result.modifiers.blocked_exercise_slugs.push(...condition.blocked_exercise_slugs);
    result.messages.push(`msg_contraindication_${q4_injury_condition}`);
  }

  if (q5_medication === true) {
    result.modifiers.force_rpe = true;
    result.clearance_flags.push('WARNING_MEDICATION');
    result.messages.push('msg_warning_medication');
  }

  // Build clearance_status from flags for backward compatibility
  result.clearance_status = result.clearance_flags.length > 0 
    ? result.clearance_flags.join('_') 
    : 'CLEAR';

  return result;
}
