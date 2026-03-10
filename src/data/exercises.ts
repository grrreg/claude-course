import { db } from "@/db";
import { exercises, workoutExercises } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function getAllExercises() {
  return db.query.exercises.findMany({
    orderBy: [asc(exercises.name)],
  });
}

export async function addExerciseToWorkout(data: {
  workoutId: string;
  exerciseId: string;
  order: number;
}) {
  const [workoutExercise] = await db
    .insert(workoutExercises)
    .values({
      workoutId: data.workoutId,
      exerciseId: data.exerciseId,
      order: data.order,
    })
    .returning();

  return workoutExercise;
}

export async function removeExerciseFromWorkout(workoutExerciseId: string) {
  await db
    .delete(workoutExercises)
    .where(eq(workoutExercises.id, workoutExerciseId));
}
