import { db } from "../db/index.js";
import { workoutLogs } from "../db/schema/programs.js";
import { computeAutoRegulatedLoad, AutoRegulationInput } from "../engine/autoregulation.engine.js";
import { ProfileService } from "./profile.service.js";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface LogWorkoutSetDTO {
  programId: string;
  programExerciseId: string;
  weekNumber: number;
  setNumber: number;
  prescribedLoadKg: number | null;
  prescribedReps: number;
  actualLoadKg: number;
  actualReps: number;
  perceivedRpe: number;
  targetRpe?: number;
}

const memoryLogsMap = new Map<string, any[]>();

export class WorkoutLogService {
  static async logSet(userId: string, dto: LogWorkoutSetDTO) {
    const profile = await ProfileService.getProfileByUserId(userId);
    const trainingAgeLevel = profile?.trainingAgeLevel || 'BEGINNER';

    const input: AutoRegulationInput = {
      actualLoadKg: dto.actualLoadKg,
      actualReps: dto.actualReps,
      perceivedRpe: dto.perceivedRpe,
      prescribedLoadKg: dto.prescribedLoadKg,
      prescribedReps: dto.prescribedReps,
      targetRpe: dto.targetRpe || 8.0,
      trainingAgeLevel,
    };

    const autoReg = computeAutoRegulatedLoad(input);

    const logRecord = {
      id: randomUUID(),
      userId,
      programId: dto.programId,
      programExerciseId: dto.programExerciseId,
      weekNumber: dto.weekNumber,
      setNumber: dto.setNumber,
      prescribedLoadKg: dto.prescribedLoadKg,
      prescribedReps: dto.prescribedReps,
      actualLoadKg: dto.actualLoadKg,
      actualReps: dto.actualReps,
      perceivedRpe: dto.perceivedRpe,
      calculatedDaily1rmKg: autoReg.estimatedDaily1rmKg,
      autoRegulatedNextWeekLoadKg: autoReg.recommendedNextWeekLoadKg,
      loggedAt: new Date(),
    };

    const currentLogs = memoryLogsMap.get(dto.programId) || [];
    currentLogs.push(logRecord);
    memoryLogsMap.set(dto.programId, currentLogs);

    try {
      const [inserted] = await db.insert(workoutLogs).values(logRecord).returning();
      return { log: inserted, autoRegulation: autoReg };
    } catch (err) {
      console.warn("[DB Fallback] Failed PostgreSQL workout log insert, returning memory record.");
      return { log: logRecord, autoRegulation: autoReg };
    }
  }

  static async getLogsForProgram(programId: string) {
    try {
      const logs = await db.select().from(workoutLogs).where(eq(workoutLogs.programId, programId));
      if (logs.length > 0) return logs;
    } catch (err) {
      console.warn("[DB Fallback] PostgreSQL offline, using memory workout logs.");
    }
    return memoryLogsMap.get(programId) || [];
  }
}
