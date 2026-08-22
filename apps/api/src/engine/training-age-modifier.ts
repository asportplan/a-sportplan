import { RULE_TRAINING_AGE_MODIFIERS, RULE_AGE_MODIFIERS } from './master-data.js';

/**
 * Gets training age modifiers based on user's level.
 * @param {string} trainingAgeLevel 
 * @returns {object|null}
 */
export function getTrainingAgeModifiers(trainingAgeLevel) {
    if (!Array.isArray(RULE_TRAINING_AGE_MODIFIERS)) return null;
    return RULE_TRAINING_AGE_MODIFIERS.find(r => r.training_age_level === trainingAgeLevel) || null;
}

/**
 * Applies volume multiplier to base sets.
 * @param {number} baseSets 
 * @param {number|string} volumeMultiplierOrLevel - Number multiplier (e.g. 1.0) or level string
 * @param {number} [overrideMultiplier]
 * @returns {number}
 */
export function applyVolumeModifier(baseSets, volumeMultiplierOrLevel, overrideMultiplier) {
    if (typeof overrideMultiplier === 'number') {
        return Math.round(baseSets * overrideMultiplier);
    }
    if (typeof volumeMultiplierOrLevel === 'number') {
        return Math.round(baseSets * volumeMultiplierOrLevel);
    }
    const mods = getTrainingAgeModifiers(volumeMultiplierOrLevel);
    const mult = mods ? (mods.volume_multiplier || 1.0) : 1.0;
    return Math.round(baseSets * mult);
}

/**
 * Applies rest multiplier to base rest time.
 * @param {number} baseRestSec 
 * @param {number|string} restMultiplierOrLevel 
 * @param {number} [overrideMultiplier]
 * @returns {number}
 */
export function applyRestModifier(baseRestSec, restMultiplierOrLevel, overrideMultiplier) {
    if (typeof overrideMultiplier === 'number') {
        return Math.round(baseRestSec * overrideMultiplier);
    }
    if (typeof restMultiplierOrLevel === 'number') {
        return Math.round(baseRestSec * restMultiplierOrLevel);
    }
    const mods = getTrainingAgeModifiers(restMultiplierOrLevel);
    const mult = mods ? (mods.rest_multiplier || 1.0) : 1.0;
    return Math.round(baseRestSec * mult);
}

/**
 * Gets age group modifiers (pediatric, standard, geriatric).
 * @param {number} age 
 * @returns {object|null}
 */
export function getAgeGroupModifiers(age) {
    if (!Array.isArray(RULE_AGE_MODIFIERS)) return null;
    if (age < 16) return RULE_AGE_MODIFIERS.find(r => r.age_group === 'pediatric') || null;
    if (age >= 45 && age <= 65) return RULE_AGE_MODIFIERS.find(r => r.age_group === 'masters') || null;
    if (age > 65) return RULE_AGE_MODIFIERS.find(r => r.age_group === 'geriatric') || null;
    return RULE_AGE_MODIFIERS.find(r => r.age_group === 'standard') || null;
}

/**
 * Applies age group overrides such as intensity caps and rest multipliers.
 * @param {object} params 
 * @param {object} ageModifiers 
 * @returns {object}
 */
export function applyAgeGroupOverrides(params, ageModifiers) {
    if (!ageModifiers) return params;
    
    const newParams = { ...params };
    
    if (ageModifiers.max_intensity_override && newParams.intensity_pct > ageModifiers.max_intensity_override) {
        newParams.intensity_pct = ageModifiers.max_intensity_override;
    }
    
    if (ageModifiers.rest_multiplier_override && newParams.rest_sec) {
        newParams.rest_sec = Math.round(newParams.rest_sec * ageModifiers.rest_multiplier_override);
    }
    
    if (ageModifiers.blocked_phases && ageModifiers.blocked_phases.includes(newParams.phase_slug)) {
        newParams.blocked = true;
    }
    
    return newParams;
}

/**
 * Validates if the target 1RM increment is realistic for the given duration and training age.
 * @param {number} targetPct 
 * @param {string} trainingAgeLevel 
 * @param {number} durationWeeks 
 * @returns {object}
 */
export function validateTarget1RM(targetPct, trainingAgeLevel, durationWeeks = 8) {
    const deloadWeeks = Math.floor(durationWeeks / 4);
    const effectiveWeeks = Math.max(1, durationWeeks - deloadWeeks);
    
    const weeklyIncrement = targetPct / effectiveWeeks;
    
    let status = 'REALISTIC';
    let messageKey = 'target_realistic';

    if (trainingAgeLevel === 'BEGINNER') {
        if (weeklyIncrement > 5.0) {
            status = 'UNREALISTIC';
            messageKey = 'target_unrealistic';
        } else if (weeklyIncrement > 3.5) {
            status = 'AMBITIOUS';
            messageKey = 'target_ambitious';
        }
    } else if (trainingAgeLevel === 'INTERMEDIATE') {
        if (weeklyIncrement > 2.5) {
            status = 'UNREALISTIC';
            messageKey = 'target_unrealistic';
        } else if (weeklyIncrement > 1.5) {
            status = 'AMBITIOUS';
            messageKey = 'target_ambitious';
        }
    } else { // ADVANCED
        if (weeklyIncrement > 1.0) {
            status = 'UNREALISTIC';
            messageKey = 'target_unrealistic';
        } else if (weeklyIncrement > 0.5) {
            status = 'AMBITIOUS';
            messageKey = 'target_ambitious';
        }
    }
    
    return {
        status,
        weekly_increment_pct: Math.round(weeklyIncrement * 100) / 100,
        message_key: messageKey
    };
}
