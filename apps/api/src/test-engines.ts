/**
 * PreciseTrain Backend Engine Test Runner
 * Tests all engine modules for correctness and consistency.
 * Run with: npm test (or npx tsx src/test-engines.ts)
 */

import { processScreeningResults, getBodyAreaForPattern } from './engine/medical-triage.engine.js';
import { validateMVW } from './engine/mvw-detector.engine.js';
import { getTrainingAgeModifiers, getAgeGroupModifiers, validateTarget1RM } from './engine/training-age-modifier.js';
import { getWeekModifiers, getProgressionSummary } from './engine/overload-deload.js';
import { buildPeriodizationPlan } from './engine/multi-focus-slicer.engine.js';
import { buildSession } from './engine/session-builder.js';
import { calculateExerciseIntensity } from './engine/intensity-calculator.js';
import { applyLoadSafetyCap } from './engine/load-safety.js';
import { computeAutoRegulatedLoad } from './engine/autoregulation.engine.js';
import { MST_EXERCISES, MST_TRAINING_PHASES, estimate1RM } from './engine/master-data.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

// ===== TEST 1: Master Data Integrity =====
console.log('\n📦 Test 1: Master Data Integrity');
assert(MST_EXERCISES.length === 43, `MST_EXERCISES has 43 items (got ${MST_EXERCISES.length})`);
assert(MST_TRAINING_PHASES.length === 10, `MST_TRAINING_PHASES has 10 phases (got ${MST_TRAINING_PHASES.length})`);
const uniqueSlugs = new Set(MST_EXERCISES.map(e => e.exercise_slug));
assert(uniqueSlugs.size === 43, 'All exercise slugs are unique');

// ===== TEST 2: 1RM Estimation =====
console.log('\n🧮 Test 2: 1RM Estimation (Epley & Brzycki)');
const rm1 = estimate1RM(100, 5);
assert(rm1.valid === true, '100kg x 5reps is valid');
assert(rm1.epley > 100 && rm1.epley < 130, `Epley 1RM is reasonable: ${rm1.epley}`);
assert(rm1.brzycki > 100 && rm1.brzycki < 130, `Brzycki 1RM is reasonable: ${rm1.brzycki}`);
const rmInvalid = estimate1RM(0, 0);
assert(rmInvalid.valid === false, '0kg x 0reps is invalid');
const rmHigh = estimate1RM(80, 15);
assert(rmHigh.valid === false, '80kg x 15reps marked as inaccurate (>10 reps)');

// ===== TEST 3: Medical Triage =====
console.log('\n🏥 Test 3: Medical Triage Engine');
const clearResult = processScreeningResults({ q1_heart: false, q2_asthma: false, q3_chest_pain: false, q4_injury: false, q4_injury_area: null, q5_medication: false });
assert(clearResult.clearance_status === 'CLEAR', 'Clean screening = CLEAR');
assert(clearResult.is_blocked === false, 'Not blocked');
const hardStop = processScreeningResults({ q1_heart: true, q2_asthma: false, q3_chest_pain: false, q4_injury: false, q4_injury_area: null, q5_medication: false });
assert(hardStop.clearance_status === 'HARD_STOP', 'Heart condition = HARD_STOP');
assert(hardStop.is_blocked === true, 'Is blocked');
const modified = processScreeningResults({ q1_heart: false, q2_asthma: true, q3_chest_pain: false, q4_injury: true, q4_injury_area: 'upper', q5_medication: true });
assert(modified.modifiers.rest_multiplier === 1.5, 'Asthma rest multiplier = 1.5');
assert(modified.modifiers.force_rpe === true, 'Medication forces RPE');
assert(modified.modifiers.max_intensity_override_areas.upper === 0.65, 'Upper injury caps at 65%');

// ===== TEST 4: Body Area Mapping =====
console.log('\n🗺️ Test 4: Body Area Pattern Mapping');
assert(getBodyAreaForPattern('horizontal_push') === 'upper', 'horizontal_push = upper');
assert(getBodyAreaForPattern('knee_dominant_bilateral') === 'lower', 'knee_dominant = lower');
assert(getBodyAreaForPattern('core_trunk_flexion') === 'core', 'core_trunk_flexion = core');
assert(getBodyAreaForPattern('nonexistent') === null, 'unknown = null');

// ===== TEST 5: Training Age Modifiers =====
console.log('\n🎓 Test 5: Training Age Modifiers');
const beginnerMods = getTrainingAgeModifiers('BEGINNER');
assert(beginnerMods !== null, 'Beginner modifiers found');
assert(beginnerMods!.volume_multiplier < 1.0, `Beginner volume reduced: ${beginnerMods!.volume_multiplier}`);
const advMods = getTrainingAgeModifiers('ADVANCED');
assert(advMods!.volume_multiplier > 1.0, `Advanced volume increased: ${advMods!.volume_multiplier}`);

// ===== TEST 6: Age Group Modifiers =====
console.log('\n👤 Test 6: Age Group Modifiers');
const teen = getAgeGroupModifiers(14);
assert(teen.max_intensity_override === 0.70, 'Pediatric (<15) max intensity = 70%');
const adult = getAgeGroupModifiers(30);
assert(adult.max_intensity_override === null, 'Standard adult (16-44) no override');
const senior = getAgeGroupModifiers(70);
assert(senior.blocked_phases.includes('power'), 'Geriatric (>65) blocks power');

// ===== TEST 7: Target 1RM Validation =====
console.log('\n🎯 Test 7: Target 1RM Validation');
const realisticTarget = validateTarget1RM(10, 'BEGINNER');
assert(realisticTarget.status !== null, `Target validation returns status: ${realisticTarget.status}`);

// ===== TEST 8: Overload/Deload =====
console.log('\n📈 Test 8: Overload / Deload Cycle');
const weekMod1 = getWeekModifiers(1, 'BEGINNER', 10, 8);
assert(weekMod1.intensity_mod_multiplier === 0.0, 'Week 1 beginner: no intensity mod');
const weekMod5 = getWeekModifiers(5, 'BEGINNER', 10, 8);
assert(weekMod5.is_deload_period === true, 'Week 5 beginner: is deload');
const progression = getProgressionSummary('INTERMEDIATE', 10, 8);
assert(progression !== null, 'Progression summary generated');

// ===== TEST 9: Periodization Plan =====
console.log('\n🎛️ Test 9: Periodization Plan Builder');
const plan = buildPeriodizationPlan(['hypertrophy', 'strength_max'], 8, 'INTERMEDIATE');
assert(plan.blocks.length > 0, `Generated ${plan.blocks.length} periodization blocks`);
assert(plan.strategy === 'SEQUENTIAL' || plan.strategy === 'CONCURRENT', `Strategy: ${plan.strategy}`);

// ===== TEST 10: Intensity Calculator =====
console.log('\n⚡ Test 10: Intensity Calculator');
const intensity = calculateExerciseIntensity('hypertrophy', 'bench_press', 100, { intensity_mod: 0.05 }, null, null);
assert(intensity !== null, 'Intensity calculated');
assert(intensity!.uses_rpe === false, 'Hypertrophy does not use RPE');
assert(intensity!.intensity_pct! > 0.5 && intensity!.intensity_pct! < 1.0, `Intensity in range: ${intensity!.intensity_pct}`);
assert(intensity!.load_kg! > 0, `Load calculated: ${intensity!.load_kg} kg`);

// RPE-based phase
const rpeIntensity = calculateExerciseIntensity('balance_agility', 'sit_up', null, {}, null, null);
assert(rpeIntensity!.uses_rpe === true, 'Balance/agility uses RPE');

// ===== TEST 11: Load Safety Cap =====
console.log('\n🛡️ Test 11: Load Safety Cap');
const exercise = MST_EXERCISES.find(e => e.exercise_slug === 'pec_deck')!; // max 0.70
const safetyCapped = applyLoadSafetyCap(exercise, 0.95, 100, 'hypertrophy', 8);
assert(safetyCapped!.capped_by_safety_module === true, 'Load was capped');
assert(safetyCapped!.final_intensity_pct === 0.70, `Capped to 0.70 (was 0.95)`);
assert(safetyCapped!.adjusted_reps! > 8, `Reps compensated up from 8 to ${safetyCapped!.adjusted_reps}`);

// ===== TEST 12: Autoregulation =====
console.log('\n🔄 Test 12: Autoregulation Engine');
const autoReg = computeAutoRegulatedLoad({
  actualLoadKg: 100,
  actualReps: 8,
  perceivedRpe: 7.5,
  prescribedLoadKg: 100,
  prescribedReps: 8,
  targetRpe: 8.0,
  trainingAgeLevel: 'BEGINNER'
});
assert(autoReg !== null && typeof autoReg === 'object', 'Auto-regulated load computed');
assert(autoReg.recommendedNextWeekLoadKg > 0, `Next week load: ${autoReg.recommendedNextWeekLoadKg} kg`);

// ===== TEST 13: MVW Validation =====
console.log('\n✅ Test 13: Minimum Viable Workout Validation');
const fullEquipment = new Set(MST_EXERCISES.map(e => e.exercise_slug));
const mvwFull = validateMVW(fullEquipment);
assert(mvwFull.valid === true, 'Full equipment set passes MVW');
const emptyEquipment = new Set<string>();
const mvwEmpty = validateMVW(emptyEquipment);
assert(mvwEmpty.valid === false, 'Empty equipment fails MVW');

// ===== TEST 14: Session Builder =====
console.log('\n🏋️ Test 14: Session Builder (Full Integration)');
const session = buildSession({
  day_number: 1,
  week_number: 1,
  phase_slug: 'hypertrophy',
  available_equipment_slugs: Array.from(fullEquipment),
  user_equipment_data: MST_EXERCISES.map(e => ({ exerciseSlug: e.exercise_slug, user1rmKg: 80 })),
  training_age_level: 'INTERMEDIATE',
  week_modifiers: getWeekModifiers(1, 'INTERMEDIATE', 10, 8),
  medical_modifiers: clearResult.modifiers,
  age_group_modifiers: getAgeGroupModifiers(30),
  used_exercises: new Set()
});
assert(session !== null, 'Session built successfully');
assert(session.day_number === 1, 'Day number matches');
const exerciseCount = (session.prescribed_exercises || session.exercises || []).length;
assert(exerciseCount > 0, `Generated ${exerciseCount} exercises`);

// ===== RESULTS =====
console.log('\n' + '='.repeat(50));
console.log(`📊 Test Results: ${passed} passed, ${failed} failed (${passed + failed} total)`);
if (failed === 0) {
  console.log('🎉 All tests passed!\n');
} else {
  console.log('⚠️ Some tests failed. Review above.\n');
  process.exit(1);
}
