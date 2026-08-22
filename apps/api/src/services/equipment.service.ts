import { db } from "../db/index.js";
import { masterExercises } from "../db/schema/master.js";
import { userEquipments } from "../db/schema/equipment.js";
import { validateMVW } from "../engine/mvw-detector.engine.js";
import { MST_EXERCISES } from "../engine/master-data.js";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const memoryEquipmentsMap = new Map<string, any[]>();

export class EquipmentService {
  static async getMasterEquipments() {
    try {
      const items = await db.select().from(masterExercises);
      if (items.length > 0) return items;
    } catch (err) {
      console.warn("[DB Fallback] PostgreSQL offline, returning static master equipment list.");
    }

    // Full 43-item Technogym master data fallback from engine/master-data.ts
    return MST_EXERCISES.map(ex => ({
      exerciseId: ex.exercise_id,
      exerciseSlug: ex.exercise_slug,
      patternId: ex.pattern_id,
      primaryMuscleGroupSlug: ex.primary_muscle_group_slug,
      substitutionPriorityRank: ex.substitution_priority_rank,
      safetyCategoryLevel: ex.safety_category_level,
      maxAllowedIntensityPct: ex.max_allowed_intensity_pct
    }));
  }

  static async getUserEquipments(userId: string) {
    try {
      const list = await db.select().from(userEquipments).where(eq(userEquipments.userId, userId));
      if (list.length > 0) return list;
    } catch (err) {
      console.warn("[DB Fallback] PostgreSQL offline, using memory user equipment.");
    }
    return memoryEquipmentsMap.get(userId) || [];
  }

  static async syncUserEquipments(userId: string, items: { exerciseSlug: string; user1rmKg?: number | null }[]) {
    const now = new Date();
    const values = items.map((item) => ({
      id: randomUUID(),
      userId,
      exerciseSlug: item.exerciseSlug,
      user1rmKg: item.user1rmKg ?? null,
      createdAt: now,
      updatedAt: now,
    }));

    memoryEquipmentsMap.set(userId, values);

    try {
      await db.delete(userEquipments).where(eq(userEquipments.userId, userId));
      if (values.length > 0) {
        return await db.insert(userEquipments).values(values).returning();
      }
    } catch (err) {
      console.warn("[DB Fallback] Failed PostgreSQL equipment save, returning memory items.");
    }
    return values;
  }

  static async checkMVW(userId: string) {
    const userEq = await this.getUserEquipments(userId);
    const availableSlugs = new Set(userEq.map((e) => e.exerciseSlug));
    return validateMVW(availableSlugs);
  }
}
