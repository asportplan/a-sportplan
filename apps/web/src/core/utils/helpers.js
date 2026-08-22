/**
 * helpers.js — Fungsi Utilitas Inti
 * Digunakan di seluruh aplikasi untuk operasi matematis, formatting, dan utilitas umum.
 */

/**
 * Clamp a value between min and max bounds
 * @param {number} val - Value to clamp
 * @param {number} min - Minimum bound
 * @param {number} max - Maximum bound
 * @returns {number}
 */
export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/**
 * Round a value to the nearest step
 * @param {number} val - Value to round
 * @param {number} step - Step size (e.g., 2.5 for weight plates)
 * @returns {number}
 */
export function roundToNearest(val, step) {
  return Math.round(val / step) * step;
}

/**
 * Round a value to specified decimal places
 * @param {number} val - Value to round
 * @param {number} decimals - Number of decimal places
 * @returns {number}
 */
export function roundTo(val, decimals = 1) {
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}

/**
 * Generate a UUID v4
 * @returns {string}
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate a workout session ID
 * @returns {string}
 */
export function generateSessionId() {
  const num = Math.floor(Math.random() * 9000) + 1000;
  const suffix = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `WKO-${num}-${suffix}`;
}

/**
 * Format tempo code for display
 * @param {string} code - Tempo code (e.g., "2-0-2-0" or "X-X-X-X")
 * @returns {{ eccentric: string, isometricBottom: string, concentric: string, isometricTop: string, display: string }}
 */
export function parseTempo(code) {
  const parts = code.split('-');
  return {
    eccentric: parts[0] || '0',
    isometricBottom: parts[1] || '0',
    concentric: parts[2] || '0',
    isometricTop: parts[3] || '0',
    display: code,
  };
}

/**
 * Calculate total time under tension for one rep based on tempo
 * @param {string} tempoCode - Tempo code (e.g., "4-2-1-1")
 * @returns {number} Total seconds per rep (X phases counted as 1 second)
 */
export function calculateTUT(tempoCode) {
  const parts = tempoCode.split('-');
  return parts.reduce((sum, p) => {
    if (p === 'X' || p === 'x') return sum + 1;
    return sum + parseInt(p, 10);
  }, 0);
}

/**
 * Format rest interval for display
 * @param {number} seconds - Rest interval in seconds
 * @returns {string}
 */
export function formatRestInterval(seconds) {
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (secs === 0) return `${minutes} min`;
    return `${minutes} min ${secs}s`;
  }
  return `${seconds}s`;
}

/**
 * Format percentage for display
 * @param {number} pct - Percentage as decimal (e.g., 0.85)
 * @returns {string}
 */
export function formatPercentage(pct) {
  return `${Math.round(pct * 100)}%`;
}

export function formatLoad(kg) {
  if (!kg || kg === 0) return '—';
  const rounded = Math.round(kg * 2) / 2;
  return Number.isInteger(rounded) ? `${rounded} kg` : `${rounded.toFixed(1)} kg`;
}

/**
 * Get a random number within a range (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number}
 */
export function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Get a random integer within a range (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number}
 */
export function randomIntInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Interpolate within a range based on a factor (0-1)
 * @param {number} min - Range minimum
 * @param {number} max - Range maximum
 * @param {number} factor - Interpolation factor (0 = min, 1 = max)
 * @returns {number}
 */
export function lerp(min, max, factor) {
  return min + (max - min) * clamp(factor, 0, 1);
}

/**
 * Calculate estimated 1RM from weight and reps (Epley formula)
 * @param {number} weight - Weight lifted
 * @param {number} reps - Number of repetitions
 * @returns {number} Estimated 1RM
 */
export function estimate1RM(weight, reps) {
  if (reps <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

/**
 * Calculate weight from 1RM and target percentage
 * @param {number} oneRM - One-rep maximum
 * @param {number} percentage - Target percentage (0-1)
 * @param {number} plateStep - Round to nearest plate weight (default 2.5kg)
 * @returns {number}
 */
export function calculateLoadFromRM(oneRM, percentage, plateStep = 2.5) {
  const rawLoad = oneRM * percentage;
  return roundToNearest(rawLoad, plateStep);
}

/**
 * Deep clone an object (simple JSON-based)
 * @param {*} obj - Object to clone
 * @returns {*}
 */
export function deepClone(obj) {
  return structuredClone(obj);
}

/**
 * Check if a value is a valid positive number
 * @param {*} val - Value to check
 * @returns {boolean}
 */
export function isValidPositiveNumber(val) {
  return typeof val === 'number' && !isNaN(val) && val > 0;
}

/**
 * Create a debounced version of a function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Format a date for display
 * @param {Date} date - Date object
 * @returns {string}
 */
export function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Get safety category color class name
 * @param {number} category - Safety category (1, 2, or 3)
 * @returns {string} CSS class name
 */
export function getSafetyCategoryClass(category) {
  switch (category) {
    case 1:
      return 'cat1';
    case 2:
      return 'cat2';
    case 3:
      return 'cat3';
    default:
      return 'cat3';
  }
}

/**
 * Get safety category label key for translation
 * @param {number} category - Safety category (1, 2, or 3)
 * @returns {string} Translation key
 */
export function getSafetyCategoryLabelKey(category) {
  switch (category) {
    case 1:
      return 'cat1_label';
    case 2:
      return 'cat2_label';
    case 3:
      return 'cat3_label';
    default:
      return 'cat3_label';
  }
}

/**
 * Get compatibility status color class
 * @param {string} status - 'SYNERGISTIC', 'NEUTRAL', or 'CONFLICTING'
 * @returns {string} CSS class name
 */
export function getCompatibilityClass(status) {
  switch (status) {
    case 'SYNERGISTIC':
      return 'badge-synergistic';
    case 'NEUTRAL':
      return 'badge-neutral';
    case 'CONFLICTING':
      return 'badge-conflicting';
    default:
      return 'badge-neutral';
  }
}

/**
 * Shuffle an array (Fisher-Yates)
 * @param {Array} arr - Array to shuffle
 * @returns {Array} Shuffled copy
 */
export function shuffle(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
