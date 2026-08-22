import { db } from "../db/index.js";
import { workoutPrograms, programDays, programExercises } from "../db/schema/programs.js";
import { processScreeningResults } from "../engine/medical-triage.engine.js";
import { validateMVW } from "../engine/mvw-detector.engine.js";
import { getAgeGroupModifiers, validateTarget1RM } from "../engine/training-age-modifier.js";
import { buildPeriodizationPlan } from "../engine/multi-focus-slicer.engine.js";
import { getProgressionSummary, getWeekModifiers } from "../engine/overload-deload.js";
import { buildSession } from "../engine/session-builder.js";
import { ProfileService } from "./profile.service.js";
import { MedicalService } from "./medical.service.js";
import { EquipmentService } from "./equipment.service.js";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

function getDaysPerWeek(level: string): number {
  const norm = (level || 'BEGINNER').toUpperCase();
  switch (norm) {
    case 'BEGINNER': return 3;
    case 'INTERMEDIATE': return 4;
    case 'ADVANCED': return 5;
    default: return 3;
  }
}

export class ProgramService {
  static async generateProgram(userId: string) {
    const systemWarnings: string[] = [];
    
    // 1. Validate profile
    const profile = await ProfileService.getProfileByUserId(userId);
    if (!profile) {
      throw { statusCode: 400, error: 'User profile not found.' };
    }
    if (!profile.age) {
      throw { statusCode: 400, error: 'Age not set.' };
    }
    if (!profile.trainingAgeLevel) {
      throw { statusCode: 400, error: 'Training age level not set.' };
    }
    const goals = profile.selectedGoals || [];
    if (goals.length === 0) {
      throw { statusCode: 400, error: 'No program focus selected.' };
    }
    
    const eqList = await EquipmentService.getUserEquipments(userId);
    if (!eqList || eqList.length === 0) {
      throw { statusCode: 400, error: 'No equipment selected.' };
    }
    const equipment = eqList.map(e => e.exerciseSlug);
    const availableSlugs = new Set(equipment);

    // 2. Medical Triage
    const latestScreening = await MedicalService.getLatestScreening(userId) || {
      hasHeartCondition: false,
      hasAsthma: false,
      hasChestPain: false,
      hasInjury: false,
      injuryArea: null,
      takesMedication: false,
    };
    
    const medicalResults = processScreeningResults({
      q1_heart: latestScreening.hasHeartCondition,
      q2_asthma: latestScreening.hasAsthma,
      q3_chest_pain: latestScreening.hasChestPain,
      q4_injury: latestScreening.hasInjury,
      q4_injury_area: latestScreening.injuryArea,
      q5_medication: latestScreening.takesMedication,
    });

    if (medicalResults.is_blocked) {
      throw {
        statusCode: 403,
        errorType: 'HARD_STOP',
        message: 'Program diblokir oleh skrining kesehatan. Konsultasi dokter diperlukan.',
        medicalResults,
      };
    }
    (medicalResults.messages || []).forEach((msg: string) => systemWarnings.push(msg));

    // 3. MVW Check
    const mvwResult = validateMVW(availableSlugs);
    if (!mvwResult.valid) {
      (mvwResult.warnings || []).forEach((w: string) => systemWarnings.push(w));
    }

    // 4. Training Age & Age Group Modifiers
    const ageGroupModifiers = getAgeGroupModifiers(profile.age);
    const blockedPhases = (ageGroupModifiers && ageGroupModifiers.blocked_phases) || [];
    const filteredGoals = goals.filter((goal: string) => {
      if (blockedPhases.includes(goal)) {
        systemWarnings.push('warn_phase_blocked_by_age');
        return false;
      }
      return true;
    });

    if (filteredGoals.length === 0) {
      throw {
        statusCode: 400,
        errorType: 'ALL_GOALS_BLOCKED',
        message: 'Semua fokus program diblokir oleh pembatasan usia.',
      };
    }

    // 5. Validate Target 1RM
    const target1rmInc = profile.target1rmIncreasePct || 10;
    const durationWeeks = profile.activeProgramDurationWeeks || 8;
    const targetValidation = validateTarget1RM(target1rmInc, profile.trainingAgeLevel, durationWeeks);
    if (targetValidation.status === 'UNREALISTIC') {
      systemWarnings.push('target_unrealistic');
    } else if (targetValidation.status === 'AMBITIOUS') {
      systemWarnings.push('target_ambitious');
    }

    // 6. Build Periodization Plan
    const periodizationPlan = buildPeriodizationPlan(filteredGoals, durationWeeks, profile.trainingAgeLevel);
    (periodizationPlan.warnings || []).forEach((w: string) => systemWarnings.push(w));

    // 7. Progression Summary
    const progressionSummary = getProgressionSummary(profile.trainingAgeLevel, target1rmInc, durationWeeks);

    // 8. Generate Sessions
    const weeks = [];
    const used_exercises = new Set<string>();
    const customFreqs: Record<string, number> = {};

    for (let weekNum = 1; weekNum <= durationWeeks; weekNum++) {
      const weekModifiers = getWeekModifiers(weekNum, profile.trainingAgeLevel, target1rmInc, durationWeeks);
      
      let weekPhases: string[] = [];
      if (periodizationPlan.strategy === 'SEQUENTIAL') {
        const block = (periodizationPlan.blocks || []).find(
          (b: any) => weekNum >= b.start_week && weekNum <= b.end_week
        );
        weekPhases = block ? [block.phase_slug] : filteredGoals;
      } else {
        const weekSchedule = (periodizationPlan.weekly_schedule || []).find((ws: any) => ws.week === weekNum);
        if (weekSchedule && weekSchedule.days) {
          weekPhases = [...new Set(weekSchedule.days.map((d: any) => d.phase_slug))] as string[];
        } else {
          weekPhases = filteredGoals;
        }
      }

      const daysPerWeek = customFreqs[weekNum] || getDaysPerWeek(profile.trainingAgeLevel);
      const weekSessions = [];

      for (let dayNum = 1; dayNum <= daysPerWeek; dayNum++) {
        let dayPhase;
        if (periodizationPlan.strategy === 'CONCURRENT') {
          const weekSchedule = (periodizationPlan.weekly_schedule || []).find((ws: any) => ws.week === weekNum);
          const daySchedule = weekSchedule?.days.find((d: any) => d.day_number === dayNum);
          dayPhase = daySchedule ? daySchedule.phase_slug : filteredGoals[0];
        } else {
          dayPhase = weekPhases[0] || filteredGoals[0];
        }

        const session = buildSession({
          day_number: dayNum,
          week_number: weekNum,
          phase_slug: dayPhase,
          available_equipment_slugs: Array.from(availableSlugs),
          user_equipment_data: eqList,
          training_age_level: profile.trainingAgeLevel,
          week_modifiers: weekModifiers,
          medical_modifiers: medicalResults.modifiers,
          age_group_modifiers: ageGroupModifiers,
          used_exercises: used_exercises
        });
        weekSessions.push(session);
      }

      weeks.push({
        week_number: weekNum,
        is_deload: weekModifiers.is_deload_period,
        intensity_mod: weekModifiers.intensity_mod_multiplier,
        volume_mod: weekModifiers.volume_mod_multiplier,
        phase_slugs: weekPhases,
        sessions: weekSessions,
        total_week_volume_kg: weekSessions.reduce((sum, s) => sum + (s.total_estimated_volume_kg || 0), 0),
      });
    }

    // 9. Assemble Output
    const programId = randomUUID();
    const programData = {
      id: programId,
      userId,
      durationWeeks,
      trainingAgeLevel: profile.trainingAgeLevel,
      selectedGoals: filteredGoals,
      status: "ACTIVE" as const,
      periodizationBlocks: periodizationPlan.blocks || [],
      systemWarnings: [...new Set(systemWarnings)],
      generatedAt: new Date(),
    };

    // Save to DB
    await db.insert(workoutPrograms).values(programData);
    
    // A4 Fix: Persist program days and exercises into DB
    for (const week of weeks) {
      for (const session of week.sessions) {
        const dayId = randomUUID();
        await db.insert(programDays).values({
          id: dayId,
          programId: programId,
          weekNumber: week.week_number,
          dayNumber: session.day_number,
          focusPhaseSlug: session.phase_slug || filteredGoals[0],
          isRestDay: false,
          intraWorkoutRestDelayMinutes: 0,
        });

        const exercises = session.exercises || session.prescribed_exercises || [];
        for (let i = 0; i < exercises.length; i++) {
          const ex = exercises[i];
          await db.insert(programExercises).values({
            id: randomUUID(),
            programDayId: dayId,
            exerciseSlug: ex.exercise_slug || ex.exerciseSlug || '',
            substitutedFromSlug: ex.substituted_from_slug || null,
            patternId: ex.pattern_id || 0,
            prescribedSets: ex.prescribed_sets || ex.sets || 3,
            prescribedReps: ex.prescribed_reps || ex.reps || 8,
            prescribedTempo: ex.prescribed_tempo || ex.tempo || '2-0-2-0',
            prescribedRestSec: ex.prescribed_rest_sec || ex.rest_sec || 90,
            targetIntensityPct: ex.intensity_pct || ex.target_intensity_pct || null,
            targetLoadKg: ex.load_kg || ex.target_load_kg || null,
            targetRpe: ex.target_rpe || null,
            orderRank: ex.execution_order || i + 1,
          });
        }
      }
    }

    return {
      success: true,
      program: {
        ...programData,
        medical_screening: {
          clearance_status: medicalResults.clearance_status,
          modifiers: medicalResults.modifiers,
        },
        periodization: periodizationPlan,
        target_validation: targetValidation,
        weeks,
        progression_summary: progressionSummary,
      }
    };
  }

  static async getActiveProgram(userId: string) {
    const programs = await db.select()
      .from(workoutPrograms)
      .where(eq(workoutPrograms.userId, userId))
      .orderBy(workoutPrograms.generatedAt);

    const active = programs[programs.length - 1];
    if (active) {
      const days = await db.select().from(programDays).where(eq(programDays.programId, active.id));
      return { program: active, days };
    }
    return null;
  }
}
