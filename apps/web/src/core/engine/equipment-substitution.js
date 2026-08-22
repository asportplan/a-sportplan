import {
  MST_EXERCISES,
  CROSS_PATTERN_COMPENSATION,
  MVW_REQUIREMENTS,
  getExercisesByPattern,
  getPatternBySlug,
  getExerciseBySlug
} from '../db/master-data.js';
import { tMessage, tPattern, getCurrentLanguage } from '../utils/i18n.js';

/**
 * Identifies the required pattern from the master data.
 * @param {string} patternSlug 
 * @returns {object|null}
 */
function identifyPattern(patternSlug) {
  return getPatternBySlug(patternSlug);
}

/**
 * Scans user inventory to filter exercises matching pattern and equipment.
 * @param {string} patternSlug 
 * @param {Iterable<string>|string[]} availableEquipmentSlugs 
 * @param {number[]} [blockedCategories]
 * @returns {object[]}
 */
function scanInventory(patternSlug, availableEquipmentSlugs, blockedCategories = []) {
  const exercises = getExercisesByPattern(patternSlug);
  if (!exercises || exercises.length === 0) return [];
  
  const avail = Array.from(availableEquipmentSlugs || []);
  
  return exercises.filter(ex => {
    if (blockedCategories.includes(ex.safety_category_level)) return false;
    return avail.includes(ex.exercise_slug);
  });
}

/**
 * Ranks substitution candidates and returns the best match.
 * Deprioritizes exercises that have already been used to promote variety.
 * @param {object[]} candidates 
 * @param {Set<string>} [used_exercises]
 * @returns {object|null}
 */
function rankSubstitution(candidates, used_exercises = new Set()) {
  if (!candidates || candidates.length === 0) return null;
  return candidates.sort((a, b) => {
    const aUsed = used_exercises.has(a.exercise_slug) ? 1 : 0;
    const bUsed = used_exercises.has(b.exercise_slug) ? 1 : 0;
    if (aUsed !== bUsed) return aUsed - bUsed; // unused comes first
    return (a.substitution_priority_rank || 99) - (b.substitution_priority_rank || 99);
  })[0];
}

/**
 * Cross pattern fallback if primary pattern fails.
 * @param {string} patternSlug 
 * @param {Iterable<string>|string[]} availableEquipmentSlugs 
 * @param {number[]} [blockedCategories]
 * @returns {object|null}
 */
function crossPatternFallback(patternSlug, availableEquipmentSlugs, blockedCategories = [], used_exercises = new Set()) {
  const pattern = identifyPattern(patternSlug);
  if (!pattern || !pattern.cross_pattern_fallback_slug) return null;
  
  const fallbackSlug = pattern.cross_pattern_fallback_slug;
  const candidates = scanInventory(fallbackSlug, availableEquipmentSlugs, blockedCategories);
  const best = rankSubstitution(candidates, used_exercises);
  
  if (best) {
    return {
      exercise: best,
      compensation: CROSS_PATTERN_COMPENSATION[patternSlug] || null
    };
  }
  return null;
}

/**
 * Finds the best exercise based on pattern and available equipment.
 * @param {string} patternSlug 
 * @param {Iterable<string>|string[]} availableEquipmentSlugs 
 * @param {number[]} [blockedCategories]
 * @returns {object}
 */
export function findBestExercise(patternSlug, availableEquipmentSlugs, blockedCategories = [], used_exercises = new Set()) {
  const pattern = identifyPattern(patternSlug);
  if (!pattern) return { exercise: null, diagnostics: { original_intent_slug: patternSlug, fallback_status: 'FAILED', reason: "Pattern not found", compensation: null } };
  
  const candidates = scanInventory(patternSlug, availableEquipmentSlugs, blockedCategories);
  const best = rankSubstitution(candidates, used_exercises);
  
  if (best) {
    return {
      exercise: best,
      diagnostics: {
        original_intent_slug: patternSlug,
        fallback_status: 'NONE',
        reason: 'Primary match found',
        compensation: null
      }
    };
  }
  
  const fallback = crossPatternFallback(patternSlug, availableEquipmentSlugs, blockedCategories, used_exercises);
  if (fallback) {
    return {
      exercise: fallback.exercise,
      diagnostics: {
        original_intent_slug: patternSlug,
        fallback_status: 'CROSS_PATTERN',
        reason: 'Used fallback pattern',
        compensation: fallback.compensation
      }
    };
  }
  
  return {
    exercise: null,
    diagnostics: {
      original_intent_slug: patternSlug,
      fallback_status: 'FAILED',
      reason: 'No suitable exercise found even with fallback',
      compensation: null
    }
  };
}

export function validateMVW(availableEquipmentSlugs) {
  const missing = [];
  const warnings = [];
  const recommended_equipment = [];
  let valid = true;
  
  const avail = Array.from(availableEquipmentSlugs || []);
  const lang = getCurrentLanguage();
  const isEn = lang === 'en';

  const requirementLabels = isEn ? {
    'knee_dominant': 'Quadriceps/Leg Training (Knee Dominant)',
    'hip_dominant': 'Hamstring/Glute Training (Hip Dominant)',
    'horizontal_push_pull_balance': 'Chest & Back Balance (Push/Pull)',
    'vertical_movement': 'Vertical Pull/Push Training (Pull Down / Shoulder Press)',
    'core_stabilization': 'Core Stability Training (Core)'
  } : {
    'knee_dominant': 'Latihan Paha/Kaki (Knee Dominant)',
    'hip_dominant': 'Latihan Pinggul/Paha Belakang (Hip Dominant)',
    'horizontal_push_pull_balance': 'Keseimbangan Latihan Dada & Punggung (Push/Pull)',
    'vertical_movement': 'Latihan Tarikan/Dorongan Vertikal (Pull Down / Shoulder Press)',
    'core_stabilization': 'Latihan Stabilitas Inti Tubuh (Core)'
  };

  if (Array.isArray(MVW_REQUIREMENTS)) {
    MVW_REQUIREMENTS.forEach(req => {
      const patternsToCheck = req.patterns || [...(req.push_patterns || []), ...(req.pull_patterns || [])];
      let hasMatchingExercise = false;

      for (const patSlug of patternsToCheck) {
        const exercisesInPat = getExercisesByPattern(patSlug);
        if (exercisesInPat && exercisesInPat.some(ex => avail.includes(ex.exercise_slug))) {
          hasMatchingExercise = true;
          break;
        }
      }

      if (!hasMatchingExercise) {
        valid = false;
        missing.push(req.requirement);
        const label = requirementLabels[req.requirement] || req.requirement;
        warnings.push(isEn ? `Notice: Your gym lacks equipment for ${label}.` : `Perhatian: Gym Anda belum memiliki alat untuk ${label}.`);

        // Suggest top recommended exercise for this missing pattern
        for (const patSlug of patternsToCheck) {
          const candidates = getExercisesByPattern(patSlug);
          if (candidates && candidates.length > 0) {
            const topCand = candidates[0];
            if (!recommended_equipment.some(r => r.exercise_slug === topCand.exercise_slug)) {
              recommended_equipment.push({
                exercise_slug: topCand.exercise_slug,
                pattern_slug: patSlug,
                reason: `Melengkapi ${label}`,
                primary_muscle_group: topCand.primary_muscle_group_slug
              });
            }
            break;
          }
        }
      }
    });
  }
  
  return {
    valid,
    missing_requirements: missing,
    warnings,
    recommended_equipment
  };
}
