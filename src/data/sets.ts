import { db } from "@/db";
import { sets } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function addSet(data: {
  workoutExerciseId: string;
  setNumber: number;
  weight?: string;
  reps?: number;
}) {
  const [set] = await db
    .insert(sets)
    .values({
      workoutExerciseId: data.workoutExerciseId,
      setNumber: data.setNumber,
      weight: data.weight ?? null,
      reps: data.reps ?? null,
    })
    .returning();

  return set;
}

export async function updateSet(
  setId: string,
  data: { weight?: string; reps?: number }
) {
  const [set] = await db
    .update(sets)
    .set({
      weight: data.weight ?? null,
      reps: data.reps ?? null,
    })
    .where(eq(sets.id, setId))
    .returning();

  return set;
}

export async function deleteSet(setId: string) {
  await db.delete(sets).where(eq(sets.id, setId));
}
