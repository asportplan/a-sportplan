/**
 * user-store.js — CRUD Operasi ke localStorage
 * 
 * Mengelola data pengguna yang persisten:
 * - user_profiles: metadata fisiologis dan preferensi
 * - user_available_equipments: inventaris alat gym + 1RM
 * - generated_programs: cache program yang sudah di-generate
 */

import { generateUUID } from '../utils/helpers.js';
import { supabase, isSupabaseConfigured } from './supabase-client.js';

/** @type {string} localStorage key constants */
const STORAGE_KEYS = {
  PROFILE: 'wtp_user_profile',
  EQUIPMENT: 'wtp_user_equipment',
  PROGRAMS: 'wtp_generated_programs',
  SCREENING: 'wtp_screening_results',
};

// ============================================================
// USER PROFILE
// ============================================================

/**
 * @typedef {Object} UserProfile
 * @property {string} user_id - UUID
 * @property {number} age - User's age in years
 * @property {'BEGINNER'|'INTERMEDIATE'|'ADVANCED'} training_age_level
 * @property {number} active_program_duration_weeks - Program cycle length (4/6/8/10/12)
 * @property {string} preferred_language - 'id' or 'en'
 * @property {string[]} selected_goals - Array of phase slugs (max 3)
 * @property {number} target_1rm_increase_pct - Target 1RM increase percentage (e.g., 10 = +10%)
 * @property {string} created_at - ISO date string
 * @property {string} updated_at - ISO date string
 */

/**
 * Get user profile from localStorage
 * @returns {UserProfile|null}
 */
export function getUserProfile() {
  if (typeof localStorage === 'undefined') return null;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!data) return null;
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed.selected_goals)) {
      parsed.selected_goals = parsed.selected_goals.map(g => g === 'hypertrophy_general' ? 'hypertrophy' : g);
    }
    if (Array.isArray(parsed.custom_block_configs)) {
      parsed.custom_block_configs = parsed.custom_block_configs.map(b => ({
        ...b,
        phase_slug: b.phase_slug === 'hypertrophy_general' ? 'hypertrophy' : b.phase_slug
      }));
    }
    return parsed;
  } catch (e) {
    console.error('[UserStore] Failed to parse user profile:', e);
    return null;
  }
}

/**
 * Save user profile to localStorage
 * @param {Partial<UserProfile>} profileData - Profile data to save (merged with existing)
 * @returns {UserProfile} The saved profile
 */
export function saveUserProfile(profileData) {
  const existing = getUserProfile();
  const now = new Date().toISOString();

  // Normalize selected_goals & custom_block_configs
  if (Array.isArray(profileData?.selected_goals)) {
    profileData.selected_goals = profileData.selected_goals.map(g => g === 'hypertrophy_general' ? 'hypertrophy' : g);
  }
  if (Array.isArray(profileData?.custom_block_configs)) {
    profileData.custom_block_configs = profileData.custom_block_configs.map(b => ({
      ...b,
      phase_slug: b.phase_slug === 'hypertrophy_general' ? 'hypertrophy' : b.phase_slug
    }));
  }

  const profile = {
    user_id: existing?.user_id || generateUUID(),
    age: 25,
    training_age_level: 'BEGINNER',
    active_program_duration_weeks: 8,
    preferred_language: 'id',
    selected_goals: [],
    target_1rm_increase_pct: 10,
    created_at: existing?.created_at || now,
    updated_at: now,
    ...existing,
    ...profileData,
  };

  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  syncUserProfileToCloud(profile);
  return profile;
}

/**
 * Clear user profile
 */
export function clearUserProfile() {
  localStorage.removeItem(STORAGE_KEYS.PROFILE);
}

/**
 * Check if user profile exists and is complete enough to generate a program
 * @returns {{ valid: boolean, missing: string[] }}
 */
export function validateUserProfile() {
  const profile = getUserProfile();
  const missing = [];

  if (!profile) {
    return { valid: false, missing: ['profile'] };
  }

  if (!profile.age || profile.age < 10 || profile.age > 100) missing.push('age');
  if (!profile.training_age_level) missing.push('training_age_level');
  if (!profile.active_program_duration_weeks) missing.push('duration');
  if (!profile.selected_goals || profile.selected_goals.length === 0) missing.push('goals');
  if (!profile.target_1rm_increase_pct || profile.target_1rm_increase_pct <= 0) missing.push('target_1rm');

  return { valid: missing.length === 0, missing };
}

// ============================================================
// USER AVAILABLE EQUIPMENT
// ============================================================

/**
 * @typedef {Object} UserEquipment
 * @property {string} exercise_slug - Equipment/exercise slug
 * @property {number|null} user_1rm_kg - User's 1RM for this equipment (null if not set)
 */

/**
 * Get all user's available equipment
 * @returns {UserEquipment[]}
 */
export function getUserEquipment() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EQUIPMENT);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('[UserStore] Failed to parse user equipment:', e);
    return [];
  }
}

/**
 * Save the entire equipment list
 * @param {UserEquipment[]} equipmentList
 */
export function saveUserEquipment(equipmentList) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(equipmentList));
  syncUserEquipmentToCloud(equipmentList);
}

/**
 * Toggle an equipment item's availability
 * @param {string} exerciseSlug - Exercise slug to toggle
 * @param {boolean} isAvailable - Whether available
 * @param {number|null} [user1rmKg] - Optional 1RM value
 */
export function toggleEquipment(exerciseSlug, isAvailable, user1rmKg = null) {
  const equipment = getUserEquipment();

  if (isAvailable) {
    // Add or update
    const existing = equipment.find((e) => e.exercise_slug === exerciseSlug);
    if (existing) {
      existing.user_1rm_kg = user1rmKg !== null ? user1rmKg : existing.user_1rm_kg;
    } else {
      equipment.push({ exercise_slug: exerciseSlug, user_1rm_kg: user1rmKg });
    }
  } else {
    // Remove
    const index = equipment.findIndex((e) => e.exercise_slug === exerciseSlug);
    if (index !== -1) {
      equipment.splice(index, 1);
    }
  }

  saveUserEquipment(equipment);
}

/**
 * Update 1RM for a specific equipment
 * @param {string} exerciseSlug
 * @param {number} user1rmKg
 */
export function updateEquipment1RM(exerciseSlug, user1rmKg) {
  const equipment = getUserEquipment();
  const existing = equipment.find((e) => e.exercise_slug === exerciseSlug);
  if (existing) {
    existing.user_1rm_kg = user1rmKg;
    saveUserEquipment(equipment);
  }
}

/**
 * Check if a specific equipment is available for the user
 * @param {string} exerciseSlug
 * @returns {boolean}
 */
export function isEquipmentAvailable(exerciseSlug) {
  const equipment = getUserEquipment();
  return equipment.some((e) => e.exercise_slug === exerciseSlug);
}

/**
 * Get user's 1RM for a specific exercise
 * @param {string} exerciseSlug
 * @returns {number|null}
 */
export function getUser1RM(exerciseSlug) {
  const equipment = getUserEquipment();
  const item = equipment.find((e) => e.exercise_slug === exerciseSlug);
  return item ? item.user_1rm_kg : null;
}

/**
 * Get set of available exercise slugs (for fast lookup)
 * @returns {Set<string>}
 */
export function getAvailableEquipmentSlugs() {
  const equipment = getUserEquipment();
  return new Set(equipment.map((e) => e.exercise_slug));
}

/**
 * Get count of available equipment
 * @returns {number}
 */
export function getEquipmentCount() {
  return getUserEquipment().length;
}

/**
 * Clear all equipment data
 */
export function clearUserEquipment() {
  localStorage.removeItem(STORAGE_KEYS.EQUIPMENT);
}

// ============================================================
// MEDICAL SCREENING RESULTS
// ============================================================

/**
 * @typedef {Object} ScreeningResults
 * @property {boolean} has_heart_condition - Q1: Heart/blood pressure
 * @property {boolean} has_asthma - Q2: Asthma/breathing
 * @property {boolean} has_chest_pain - Q3: Chest pain/dizziness
 * @property {boolean} has_injury - Q4: Joint/bone/post-surgery
 * @property {string|null} injury_area - 'upper', 'lower', 'core', or null
 * @property {boolean} takes_medication - Q5: Regular medication
 * @property {string} clearance_status - 'CLEAR', 'HARD_STOP', 'MODIFIED_ASTHMA', 'MODIFIED_INJURY', 'WARNING_MEDICATION', or compound
 * @property {string} completed_at - ISO date string
 */

/**
 * Get screening results
 * @returns {ScreeningResults|null}
 */
export function getScreeningResults() {
  if (typeof localStorage === 'undefined') return null;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SCREENING);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('[UserStore] Failed to parse screening results:', e);
    return null;
  }
}

/**
 * Save screening results
 * @param {ScreeningResults} results
 */
export function saveScreeningResults(results) {
  results.completed_at = new Date().toISOString();
  localStorage.setItem(STORAGE_KEYS.SCREENING, JSON.stringify(results));
  syncScreeningToCloud(results);
}

/**
 * Check if screening has been completed
 * @returns {boolean}
 */
export function isScreeningCompleted() {
  return getScreeningResults() !== null;
}

/**
 * Clear screening results
 */
export function clearScreeningResults() {
  localStorage.removeItem(STORAGE_KEYS.SCREENING);
}

// ============================================================
// GENERATED PROGRAMS (Cache)
// ============================================================

/**
 * Get the cached generated program
 * @returns {Object|null} The full program data or null
 */
export function getGeneratedProgram() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROGRAMS);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('[UserStore] Failed to parse generated program:', e);
    return null;
  }
}

/**
 * Save a generated program
 * @param {Object} programData - The complete program output from rule engine
 */
export function saveGeneratedProgram(programData) {
  programData.generated_at = new Date().toISOString();
  localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programData));
}

/**
 * Clear cached program
 */
export function clearGeneratedProgram() {
  localStorage.removeItem(STORAGE_KEYS.PROGRAMS);
}

/**
 * Check if a program has been generated
 * @returns {boolean}
 */
export function hasCachedProgram() {
  return getGeneratedProgram() !== null;
}

// ============================================================
// SAVED PROGRAMS LIBRARY (Multi-Program Collection)
// ============================================================

const LIBRARY_KEY = 'wtp_saved_programs_library';

/**
 * Get all saved programs in user library
 * @returns {Array<Object>}
 */
export function getSavedProgramsLibrary() {
  try {
    const data = localStorage.getItem(LIBRARY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('[UserStore] Failed to parse saved programs library:', e);
    return [];
  }
}

/**
 * Save current program to library with a custom title
 * @param {Object} programData - Program payload
 * @param {string} customTitle - Program title
 * @returns {Array<Object>} Updated library
 */
export function saveProgramToLibrary(programData, customTitle) {
  if (!programData) return getSavedProgramsLibrary();
  const library = getSavedProgramsLibrary();
  const now = new Date().toISOString();
  const weeks = programData.periodization?.totalWeeks || programData.weeks?.length || 8;
  const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const name = programData.metadata?.athlete_name || '';
  const sport = programData.metadata?.sport_branch || '';
  let defaultTitle = `Program ${weeks} Minggu (${dateStr})`;
  if (name && sport) {
    defaultTitle = `Program ${name} - ${sport} (${weeks} Minggu)`;
  } else if (name) {
    defaultTitle = `Program ${name} (${weeks} Minggu)`;
  } else if (sport) {
    defaultTitle = `Program ${sport} (${weeks} Minggu)`;
  }
  const title = customTitle && customTitle.trim() ? customTitle.trim() : defaultTitle;

  // Mark existing as inactive
  library.forEach(item => { item.isActive = false; });

  const newItem = {
    id: generateUUID(),
    title,
    created_at: now,
    duration_weeks: weeks,
    goals: programData.metadata?.selected_goals || programData.periodization?.blocks?.map(b => b.phase_slug) || [],
    isActive: true,
    programData: JSON.parse(JSON.stringify(programData))
  };

  library.unshift(newItem);
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
  
  // Also set as active cached program
  saveGeneratedProgram(programData);

  // Sync to Supabase Cloud
  syncProgramToCloud(newItem);

  return library;
}

/**
 * Set a saved program as active in dashboard
 * @param {string} programId - ID of program to activate
 * @returns {{ library: Array<Object>, activeProgram: Object|null }}
 */
export function setActiveProgramInLibrary(programId) {
  const library = getSavedProgramsLibrary();
  let activeData = null;

  library.forEach(item => {
    if (item.id === programId) {
      item.isActive = true;
      activeData = item.programData;
    } else {
      item.isActive = false;
    }
  });

  localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));

  if (activeData) {
    saveGeneratedProgram(activeData);
  }

  return { library, activeProgram: activeData };
}

/**
 * Delete a saved program from library
 * @param {string} programId - ID of program to delete
 * @returns {Array<Object>} Updated library
 */
export function deleteProgramFromLibrary(programId) {
  let library = getSavedProgramsLibrary();
  library = library.filter(item => item.id !== programId);
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
  return library;
}

// ============================================================
// GLOBAL RESET
// ============================================================

/**
 * Clear ALL user data from localStorage
 */
export function clearAllUserData() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}

/**
 * Export all user data as a JSON object (for backup/debug)
 * @returns {Object}
 */
export function exportAllUserData() {
  return {
    profile: getUserProfile(),
    equipment: getUserEquipment(),
    screening: getScreeningResults(),
    program: getGeneratedProgram(),
    exported_at: new Date().toISOString(),
  };
}

/**
 * Import user data from a JSON object (restore backup)
 * @param {Object} data - Data from exportAllUserData()
 */
export function importUserData(data) {
  if (data.profile) saveUserProfile(data.profile);
  if (data.equipment) saveUserEquipment(data.equipment);
  if (data.screening) saveScreeningResults(data.screening);
  if (data.program) saveGeneratedProgram(data.program);
}

// ============================================================
// SUPABASE CLOUD SYNC ENGINE
// ============================================================

/**
 * Sync user profile to Supabase database if logged in
 */
export async function syncUserProfileToCloud(profile) {
  if (!isSupabaseConfigured() || !profile) return;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('profiles').upsert({
      user_id: user.id,
      athlete_name: profile.athlete_name || '',
      sport_branch: profile.sport_branch || 'Kebugaran Umum',
      age: profile.age || 25,
      body_weight_kg: profile.body_weight_kg || 70,
      height_cm: profile.height_cm || 170,
      training_age_level: profile.training_age_level || 'BEGINNER',
      active_program_duration_weeks: profile.active_program_duration_weeks || 8,
      selected_goals: profile.selected_goals || [],
      target_1rm_increase_pct: profile.target_1rm_increase_pct || 10,
      preferred_language: profile.preferred_language || 'id',
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('[CloudSync] Failed to sync profile:', err);
  }
}

/**
 * Sync user equipment to Supabase database if logged in
 */
export async function syncUserEquipmentToCloud(equipmentList) {
  if (!isSupabaseConfigured() || !Array.isArray(equipmentList)) return;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = equipmentList.map(item => ({
      user_id: user.id,
      exercise_slug: item.exercise_slug,
      user_1rm_kg: item.user_1rm_kg,
      updated_at: new Date().toISOString()
    }));

    if (payload.length > 0) {
      await supabase.from('user_equipment').upsert(payload, { onConflict: 'user_id,exercise_slug' });
    }
  } catch (err) {
    console.warn('[CloudSync] Failed to sync equipment:', err);
  }
}

/**
 * Sync screening results to Supabase database if logged in
 */
export async function syncScreeningToCloud(screening) {
  if (!isSupabaseConfigured() || !screening) return;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('screening_results').upsert({
      user_id: user.id,
      has_heart_condition: screening.has_heart_condition || false,
      has_asthma: screening.has_asthma || false,
      has_chest_pain: screening.has_chest_pain || false,
      has_injury: screening.has_injury || false,
      injury_area: screening.injury_area || null,
      takes_medication: screening.takes_medication || false,
      clearance_status: screening.clearance_status || 'CLEAR',
      completed_at: screening.completed_at || new Date().toISOString()
    });
  } catch (err) {
    console.warn('[CloudSync] Failed to sync screening:', err);
  }
}

/**
 * Pull all user data from Supabase Cloud on sign in
 */
export async function pullUserDataFromCloud() {
  if (!isSupabaseConfigured()) return false;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // 1. Pull Profile
    const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
    if (profile) {
      saveUserProfile(profile);
    }

    // 2. Pull Equipment
    const { data: equipment } = await supabase.from('user_equipment').select('*').eq('user_id', user.id);
    if (Array.isArray(equipment) && equipment.length > 0) {
      saveUserEquipment(equipment.map(e => ({ exercise_slug: e.exercise_slug, user_1rm_kg: e.user_1rm_kg })));
    }

    // 3. Pull Screening
    const { data: screening } = await supabase.from('screening_results').select('*').eq('user_id', user.id).single();
    if (screening) {
      saveScreeningResults(screening);
    }

    // 4. Pull Saved Programs
    const { data: programs } = await supabase.from('saved_programs').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (Array.isArray(programs) && programs.length > 0) {
      const activeProg = programs.find(p => p.is_active) || programs[0];
      if (activeProg && activeProg.program_data) {
        saveGeneratedProgram(activeProg.program_data);
      }
    }

    return true;
  } catch (err) {
    console.warn('[CloudSync] Failed to pull user data from cloud:', err);
    return false;
  }
}

/**
 * Sync saved program to Supabase database if logged in
 */
export async function syncProgramToCloud(programItem) {
  if (!isSupabaseConfigured() || !programItem) return;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('saved_programs').upsert({
      user_id: user.id,
      title: programItem.title || 'Program Latihan Beban',
      duration_weeks: programItem.duration_weeks || 8,
      goals: programItem.goals || [],
      program_data: programItem.programData || programItem,
      is_active: programItem.isActive !== false,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('[CloudSync] Failed to sync program:', err);
  }
}

