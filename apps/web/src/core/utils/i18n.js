/**
 * i18n.js — Internasionalisasi & Resolusi Bahasa
 * 
 * Resolusi bahasa sesuai prioritas:
 * 1. Parameter eksplisit (jika ada)
 * 2. user_profiles.preferred_language (dari localStorage)
 * 3. Default: "id" (Bahasa Indonesia)
 * 
 * Mendukung template interpolation {placeholder} di dalam pesan sistem.
 */

import { TRANSLATIONS } from '../db/translations.js';

/** @type {string} Default language code */
const DEFAULT_LANGUAGE = 'id';

/** @type {string[]} Supported language codes */
const SUPPORTED_LANGUAGES = ['id', 'en'];

/** @type {string|null} Current active language (cached) */
let currentLanguage = null;

/**
 * Initialize the i18n module
 * Loads preferred language from localStorage or falls back to default
 */
export function initI18n() {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('preferred_language') : null;
  if (stored && SUPPORTED_LANGUAGES.includes(stored)) {
    currentLanguage = stored;
  } else {
    currentLanguage = DEFAULT_LANGUAGE;
  }
}

/**
 * Get the current active language
 * @returns {string} Language code ('id' or 'en')
 */
export function getCurrentLanguage() {
  if (!currentLanguage) {
    initI18n();
  }
  return currentLanguage;
}

/**
 * Set the active language
 * @param {string} langCode - Language code ('id' or 'en')
 */
export function setLanguage(langCode) {
  if (SUPPORTED_LANGUAGES.includes(langCode)) {
    currentLanguage = langCode;
    localStorage.setItem('preferred_language', langCode);
    try {
      const existing = JSON.parse(localStorage.getItem('wtp_user_profile') || '{}');
      existing.preferred_language = langCode;
      localStorage.setItem('wtp_user_profile', JSON.stringify(existing));
    } catch (e) {}
    // Dispatch custom event so UI components can react
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: langCode } }));
  } else {
    console.warn(`[i18n] Unsupported language code: "${langCode}". Falling back to "${DEFAULT_LANGUAGE}".`);
  }
}

/**
 * Toggle between available languages
 * @returns {string} The new active language code
 */
export function toggleLanguage() {
  const newLang = currentLanguage === 'id' ? 'en' : 'id';
  setLanguage(newLang);
  return newLang;
}

/**
 * Translate a key from a specific translation category
 * 
 * @param {string} category - Translation category: 'exercises', 'movement_patterns', 'training_phases', 'muscle_groups', 'system_messages', 'ui'
 * @param {string} key - Translation key (slug)
 * @param {string} [lang] - Optional language override. If not provided, uses current language.
 * @param {Object} [params] - Optional parameters for template interpolation (e.g., { pattern_name: 'Horizontal Pull' })
 * @returns {string} Translated text, or fallback to default language, or key itself if not found
 * 
 * @example
 * // Simple lookup
 * t('exercises', 'bench_press') // → "Bench Press"
 * 
 * // With language override
 * t('movement_patterns', 'horizontal_push', 'id') // → "Dorong Horizontal"
 * 
 * // With template interpolation
 * t('system_messages', 'warn_pattern_missing', 'id', { pattern_name: 'Tarik Horizontal' })
 * // → "Perhatian: ketersediaan alat sangat minimal untuk pola Tarik Horizontal."
 */
export function t(category, key, lang, params) {
  const activeLang = lang || getCurrentLanguage();
  
  // Get the category object
  const categoryData = TRANSLATIONS[category];
  if (!categoryData) {
    console.warn(`[i18n] Translation category not found: "${category}"`);
    return key;
  }

  // Get the entry for this key
  const entry = categoryData[key];
  if (!entry) {
    console.warn(`[i18n] Translation key not found: "${category}.${key}"`);
    return key;
  }

  // Try requested language first
  let text = entry[activeLang];
  
  // Fallback to default language if translation not found
  if (text === undefined || text === null) {
    console.warn(`[i18n] Missing translation for "${category}.${key}" in language "${activeLang}". Falling back to "${DEFAULT_LANGUAGE}".`);
    text = entry[DEFAULT_LANGUAGE];
  }

  // If still not found, return the key itself
  if (text === undefined || text === null) {
    console.warn(`[i18n] No translation found for "${category}.${key}" in any language.`);
    return key;
  }

  // Apply template interpolation if params provided
  if (params && typeof params === 'object') {
    text = interpolate(text, params);
  }

  return text;
}

/**
 * Shorthand for translating UI labels
 * @param {string} key - UI label key
 * @param {Object} [params] - Optional parameters for interpolation
 * @returns {string}
 */
export function tUI(key, params) {
  return t('ui', key, null, params);
}

/**
 * Shorthand for translating exercise names
 * @param {string} slug - Exercise slug
 * @returns {string}
 */
export function tExercise(slug) {
  return t('exercises', slug);
}

/**
 * Shorthand for translating movement pattern names
 * @param {string} slug - Pattern slug
 * @returns {string}
 */
export function tPattern(slug) {
  return t('movement_patterns', slug);
}

/**
 * Shorthand for translating training phase names
 * @param {string} slug - Phase slug
 * @returns {string}
 */
export function tPhase(slug) {
  return t('training_phases', slug);
}

/**
 * Shorthand for translating muscle group names
 * @param {string} slug - Muscle group slug
 * @returns {string}
 */
export function tMuscle(slug) {
  return t('muscle_groups', slug);
}

/**
 * Shorthand for translating system messages with params
 * @param {string} key - Message key
 * @param {Object} [params] - Template parameters
 * @returns {string}
 */
export function tMessage(key, params) {
  return t('system_messages', key, null, params);
}

/**
 * Replace {placeholder} tokens in a string with values from params object
 * @param {string} template - Template string with {placeholder} tokens
 * @param {Object} params - Key-value pairs for replacement
 * @returns {string}
 * 
 * @example
 * interpolate("Hello {name}, you have {count} items.", { name: "Ali", count: 5 })
 * // → "Hello Ali, you have 5 items."
 */
function interpolate(template, params) {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    if (params.hasOwnProperty(key)) {
      return String(params[key]);
    }
    console.warn(`[i18n] Template placeholder "{${key}}" not found in params.`);
    return match; // Leave placeholder as-is if not found
  });
}

/**
 * Get all translations for a category (useful for rendering lists)
 * @param {string} category - Translation category
 * @param {string} [lang] - Optional language override
 * @returns {Object} Map of key → translated text
 */
export function getAllTranslations(category, lang) {
  const activeLang = lang || getCurrentLanguage();
  const categoryData = TRANSLATIONS[category];
  if (!categoryData) return {};

  const result = {};
  for (const [key, entry] of Object.entries(categoryData)) {
    result[key] = entry[activeLang] || entry[DEFAULT_LANGUAGE] || key;
  }
  return result;
}

/**
 * Check if a translation exists for a given category and key
 * @param {string} category - Translation category
 * @param {string} key - Translation key
 * @param {string} [lang] - Optional language code
 * @returns {boolean}
 */
export function hasTranslation(category, key, lang) {
  const activeLang = lang || getCurrentLanguage();
  const categoryData = TRANSLATIONS[category];
  if (!categoryData) return false;
  const entry = categoryData[key];
  if (!entry) return false;
  return entry[activeLang] !== undefined && entry[activeLang] !== null;
}
