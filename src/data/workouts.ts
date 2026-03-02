import { db } from "@/db";
import { workouts, workoutExercises, exercises, sets } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and, gte, lt } from "drizzle-orm";

export async function getWorkoutsByDate(date: Date) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Get start and end of the day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Fetch workouts with their exercises and sets
  const result = await db.query.workouts.findMany({
    where: and(
      eq(workouts.userId, userId),
      gte(workouts.startedAt, startOfDay),
      lt(workouts.startedAt, endOfDay)
    ),
    with: {
      workoutExercises: {
        orderBy: (workoutExercises, { asc }) => [asc(workoutExercises.order)],
        with: {
          exercise: true,
          sets: {
            orderBy: (sets, { asc }) => [asc(sets.setNumber)],
          },
        },
      },
    },
  });

  return result;
}

export type WorkoutWithExercises = Awaited<
  ReturnType<typeof getWorkoutsByDate>
>[number];
