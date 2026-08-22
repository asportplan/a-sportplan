import { db } from "../db/index.js";
import { workoutPrograms, programDays, programExercises } from "../db/schema/programs.js";
import { userProfiles } from "../db/schema/profiles.js";
import { eq } from "drizzle-orm";

export class ExportService {
  static async getExportData(programId: string) {
    const programs = await db.select().from(workoutPrograms).where(eq(workoutPrograms.id, programId));
    const program = programs[0];

    if (!program) {
      throw { statusCode: 404, message: "Program not found" };
    }

    const profiles = await db.select().from(userProfiles).where(eq(userProfiles.userId, program.userId));
    const profile = profiles[0] || null;

    const days = await db.select().from(programDays).where(eq(programDays.programId, programId));

    const dayIds = days.map((d) => d.id);
    let exercises: any[] = [];
    if (dayIds.length > 0) {
      for (const dayId of dayIds) {
        const exs = await db.select().from(programExercises).where(eq(programExercises.programDayId, dayId));
        exercises.push(...exs);
      }
    }

    return {
      program,
      profile,
      days,
      exercises,
      exportedAt: new Date().toISOString(),
    };
  }
}
