import { db } from "../db/index.js";
import { medicalScreenings } from "../db/schema/profiles.js";
import { processScreeningResults } from "../engine/medical-triage.engine.js";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export class MedicalService {
  static async submitScreening(userId: string, answers: any) {
    const triageResult = processScreeningResults(answers);
    const now = new Date();

    const record: any = {
      id: randomUUID(),
      userId,
      hasHeartCondition: answers.q1_heart || false,
      hasAsthma: answers.q2_asthma || false,
      hasChestPain: answers.q3_chest_pain || false,
      hasInjury: answers.q4_injury || false,
      injuryArea: answers.q4_injury_area || null,
      takesMedication: answers.q5_medication || false,
      clearanceStatus: triageResult.clearance_status,
      modifiers: triageResult.modifiers,
      messages: triageResult.messages,
      completedAt: now,
    };

    const [inserted] = await db.insert(medicalScreenings).values(record).returning();
    return { record: inserted, triageResult };
  }

  static async getLatestScreening(userId: string) {
    const results = await db.select()
      .from(medicalScreenings)
      .where(eq(medicalScreenings.userId, userId))
      .orderBy(desc(medicalScreenings.completedAt));

    return results.length > 0 ? results[0] : null;
  }
}
