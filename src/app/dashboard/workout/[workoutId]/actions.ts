"use server";

import { z } from "zod";
import { updateWorkout, getWorkoutById } from "@/data/workouts";
import { addExerciseToWorkout, removeExerciseFromWorkout } from "@/data/exercises";
import { addSet, updateSet, deleteSet } from "@/data/sets";
import { db } from "@/db";
import { workoutExercises, sets } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const UpdateWorkoutSchema = z.object({
  workoutId: z.string().uuid("Invalid workout ID"),
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
});

type UpdateWorkoutInput = z.infer<typeof UpdateWorkoutSchema>;

export async function updateWorkoutAction(input: UpdateWorkoutInput) {
  const validated = UpdateWorkoutSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false as const,
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { userId } = await auth();

  if (!userId) {
    return {
      success: false as const,
      errors: { _form: ["Unauthorized"] },
    };
  }

  const [year, month, day] = validated.data.date.split("-").map(Number);
  const [hours, minutes] = validated.data.time.split(":").map(Number);
  const startedAt = new Date(year, month - 1, day, hours, minutes, 0, 0);

  try {
    await updateWorkout(validated.data.workoutId, userId, {
      name: validated.data.name,
      startedAt,
    });
  } catch {
    return {
      success: false as const,
      errors: { _form: ["Failed to update workout"] },
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/workout/${validated.data.workoutId}`);
  redirect(`/dashboard/workout/${validated.data.workoutId}`);
}

const AddExerciseSchema = z.object({
  workoutId: z.string().uuid("Invalid workout ID"),
  exerciseId: z.string().uuid("Invalid exercise ID"),
});

type AddExerciseInput = z.infer<typeof AddExerciseSchema>;

export async function addExerciseAction(input: AddExerciseInput) {
  const validated = AddExerciseSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false as const,
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const workout = await getWorkoutById(validated.data.workoutId);

  if (!workout) {
    return {
      success: false as const,
      errors: { _form: ["Workout not found or unauthorized"] },
    };
  }

  try {
    const [{ value: orderCount }] = await db
      .select({ value: count() })
      .from(workoutExercises)
      .where(eq(workoutExercises.workoutId, validated.data.workoutId));

    await addExerciseToWorkout({
      workoutId: validated.data.workoutId,
      exerciseId: validated.data.exerciseId,
      order: orderCount + 1,
    });
  } catch {
    return {
      success: false as const,
      errors: { _form: ["Failed to add exercise"] },
    };
  }

  revalidatePath(`/dashboard/workout/${validated.data.workoutId}`);
  return { success: true as const, data: undefined };
}

const RemoveExerciseSchema = z.object({
  workoutExerciseId: z.string().uuid("Invalid workout exercise ID"),
  workoutId: z.string().uuid("Invalid workout ID"),
});

type RemoveExerciseInput = z.infer<typeof RemoveExerciseSchema>;

export async function removeExerciseAction(input: RemoveExerciseInput) {
  const validated = RemoveExerciseSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false as const,
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const workout = await getWorkoutById(validated.data.workoutId);

  if (!workout) {
    return {
      success: false as const,
      errors: { _form: ["Workout not found or unauthorized"] },
    };
  }

  try {
    await removeExerciseFromWorkout(validated.data.workoutExerciseId);
  } catch {
    return {
      success: false as const,
      errors: { _form: ["Failed to remove exercise"] },
    };
  }

  revalidatePath(`/dashboard/workout/${validated.data.workoutId}`);
  return { success: true as const, data: undefined };
}

const AddSetSchema = z.object({
  workoutExerciseId: z.string().uuid("Invalid workout exercise ID"),
  workoutId: z.string().uuid("Invalid workout ID"),
  weight: z.string().optional(),
  reps: z.coerce.number().int().positive().optional(),
});

type AddSetInput = z.infer<typeof AddSetSchema>;

export async function addSetAction(input: AddSetInput) {
  const validated = AddSetSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false as const,
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const workout = await getWorkoutById(validated.data.workoutId);

  if (!workout) {
    return {
      success: false as const,
      errors: { _form: ["Workout not found or unauthorized"] },
    };
  }

  try {
    const [{ value: setCount }] = await db
      .select({ value: count() })
      .from(sets)
      .where(eq(sets.workoutExerciseId, validated.data.workoutExerciseId));

    await addSet({
      workoutExerciseId: validated.data.workoutExerciseId,
      setNumber: setCount + 1,
      weight: validated.data.weight,
      reps: validated.data.reps,
    });
  } catch {
    return {
      success: false as const,
      errors: { _form: ["Failed to add set"] },
    };
  }

  revalidatePath(`/dashboard/workout/${validated.data.workoutId}`);
  return { success: true as const, data: undefined };
}

const UpdateSetSchema = z.object({
  setId: z.string().uuid("Invalid set ID"),
  workoutId: z.string().uuid("Invalid workout ID"),
  weight: z.string().optional(),
  reps: z.coerce.number().int().positive().optional(),
});

type UpdateSetInput = z.infer<typeof UpdateSetSchema>;

export async function updateSetAction(input: UpdateSetInput) {
  const validated = UpdateSetSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false as const,
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const workout = await getWorkoutById(validated.data.workoutId);

  if (!workout) {
    return {
      success: false as const,
      errors: { _form: ["Workout not found or unauthorized"] },
    };
  }

  try {
    await updateSet(validated.data.setId, {
      weight: validated.data.weight,
      reps: validated.data.reps,
    });
  } catch {
    return {
      success: false as const,
      errors: { _form: ["Failed to update set"] },
    };
  }

  revalidatePath(`/dashboard/workout/${validated.data.workoutId}`);
  return { success: true as const, data: undefined };
}

const DeleteSetSchema = z.object({
  setId: z.string().uuid("Invalid set ID"),
  workoutId: z.string().uuid("Invalid workout ID"),
});

type DeleteSetInput = z.infer<typeof DeleteSetSchema>;

export async function deleteSetAction(input: DeleteSetInput) {
  const validated = DeleteSetSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false as const,
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const workout = await getWorkoutById(validated.data.workoutId);

  if (!workout) {
    return {
      success: false as const,
      errors: { _form: ["Workout not found or unauthorized"] },
    };
  }

  try {
    await deleteSet(validated.data.setId);
  } catch {
    return {
      success: false as const,
      errors: { _form: ["Failed to delete set"] },
    };
  }

  revalidatePath(`/dashboard/workout/${validated.data.workoutId}`);
  return { success: true as const, data: undefined };
}
