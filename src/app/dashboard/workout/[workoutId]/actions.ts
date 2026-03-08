"use server";

import { z } from "zod";
import { updateWorkout } from "@/data/workouts";
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
  redirect("/dashboard");
}
