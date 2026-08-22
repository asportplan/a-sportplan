import { db } from "../db/index.js";
import { userProfiles } from "../db/schema/profiles.js";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface UpsertProfileDTO {
  age: number;
  weightKg: number;
  heightCm: number;
  trainingAgeLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  activeProgramDurationWeeks?: number;
  preferredLanguage?: 'id' | 'en';
  selectedGoals?: string[];
  target1rmIncreasePct?: number;
}

const memoryProfilesMap = new Map<string, any>();

export class ProfileService {
  static async getProfileByUserId(userId: string) {
    try {
      const profiles = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
      if (profiles[0]) return profiles[0];
    } catch (err) {
      console.warn("[DB Fallback] PostgreSQL offline, using memory storage for Profile.");
    }
    return memoryProfilesMap.get(userId) || null;
  }

  static async upsertProfile(userId: string, dto: UpsertProfileDTO) {
    const now = new Date();
    const profileData = {
      id: randomUUID(),
      userId,
      age: dto.age,
      weightKg: dto.weightKg,
      heightCm: dto.heightCm,
      trainingAgeLevel: dto.trainingAgeLevel,
      activeProgramDurationWeeks: dto.activeProgramDurationWeeks ?? 8,
      preferredLanguage: dto.preferredLanguage ?? 'id',
      selectedGoals: dto.selectedGoals ?? [],
      target1rmIncreasePct: dto.target1rmIncreasePct ?? 10.0,
      createdAt: now,
      updatedAt: now,
    };

    memoryProfilesMap.set(userId, profileData);

    try {
      const existing = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
      if (existing[0]) {
        const [updated] = await db.update(userProfiles)
          .set({
            age: dto.age,
            weightKg: dto.weightKg,
            heightCm: dto.heightCm,
            trainingAgeLevel: dto.trainingAgeLevel,
            activeProgramDurationWeeks: dto.activeProgramDurationWeeks ?? existing[0].activeProgramDurationWeeks,
            preferredLanguage: dto.preferredLanguage ?? existing[0].preferredLanguage,
            selectedGoals: dto.selectedGoals ?? existing[0].selectedGoals,
            target1rmIncreasePct: dto.target1rmIncreasePct ?? existing[0].target1rmIncreasePct,
            updatedAt: now,
          })
          .where(eq(userProfiles.userId, userId))
          .returning();
        return updated;
      } else {
        const [inserted] = await db.insert(userProfiles).values(profileData).returning();
        return inserted;
      }
    } catch (err) {
      console.warn("[DB Fallback] Failed PostgreSQL save, returning memory profile.");
      return profileData;
    }
  }
}
