"use server";

import { z } from "zod";
import { createWorkout } from "@/data/workouts";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const CreateWorkoutSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
});

type CreateWorkoutInput = z.infer<typeof CreateWorkoutSchema>;

export async function createWorkoutAction(input: CreateWorkoutInput) {
  const validated = CreateWorkoutSchema.safeParse(input);

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

  // Construct the date on the server to avoid timezone serialization issues
  const [year, month, day] = validated.data.date.split("-").map(Number);
  const [hours, minutes] = validated.data.time.split(":").map(Number);
  const startedAt = new Date(year, month - 1, day, hours, minutes, 0, 0);

  await createWorkout({
    userId,
    name: validated.data.name,
    startedAt,
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
