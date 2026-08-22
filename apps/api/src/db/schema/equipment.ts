import { pgTable, text, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth.js";

export const userEquipments = pgTable("user_equipments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  exerciseSlug: text("exercise_slug").notNull(),
  user1rmKg: doublePrecision("user_1rm_kg"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
