# Data Mutations

This document outlines the coding standards for all data mutations in this application.

## Overview

All data mutations follow a layered architecture:

1. **Server Actions** - Entry point for mutations from the client
2. **Data Helper Functions** - Business logic and database operations
3. **Drizzle ORM** - Database queries

## Data Helper Functions

All database mutations MUST be performed via helper functions located in the `src/data/` directory. These functions wrap Drizzle ORM calls.

### Location

```
src/data/
├── workouts.ts      # Workout-related mutations
├── exercises.ts     # Exercise-related mutations
├── sets.ts          # Set-related mutations
└── users.ts         # User-related mutations
```

### Example Helper Function

```typescript
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createWorkout(data: {
  userId: string;
  name: string;
  date: Date;
}) {
  const [workout] = await db
    .insert(workouts)
    .values({
      userId: data.userId,
      name: data.name,
      date: data.date,
    })
    .returning();

  return workout;
}

export async function deleteWorkout(workoutId: string) {
  await db.delete(workouts).where(eq(workouts.id, workoutId));
}
```

## Server Actions

All server actions MUST be defined in colocated `actions.ts` files within the relevant route directory.

### Location

```
src/app/
├── dashboard/
│   ├── page.tsx
│   └── actions.ts    # Actions for dashboard
├── workouts/
│   ├── [id]/
│   │   ├── page.tsx
│   │   └── actions.ts
│   └── new/
│       ├── page.tsx
│       └── actions.ts
```

### Server Action Requirements

1. **Must use `"use server"` directive** at the top of the file
2. **Must have typed parameters** - Never use `FormData` as a parameter type
3. **Must validate all arguments with Zod** before processing

### Example Server Action

```typescript
// src/app/workouts/new/actions.ts
"use server";

import { z } from "zod";
import { createWorkout } from "@/data/workouts";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const CreateWorkoutSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  date: z.coerce.date(),
});

type CreateWorkoutInput = z.infer<typeof CreateWorkoutSchema>;

export async function createWorkoutAction(input: CreateWorkoutInput) {
  // Validate input with Zod
  const validated = CreateWorkoutSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
    };
  }

  // Get authenticated user (example)
  const userId = await getCurrentUserId();

  if (!userId) {
    return {
      success: false,
      errors: { _form: ["Unauthorized"] },
    };
  }

  // Call data helper function
  const workout = await createWorkout({
    userId,
    name: validated.data.name,
    date: validated.data.date,
  });

  // Revalidate and redirect
  revalidatePath("/dashboard");
  redirect(`/workouts/${workout.id}`);
}
```

### Return Types

Server actions should return a consistent response shape:

```typescript
type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string[]> };
```

### Error Handling

```typescript
"use server";

import { z } from "zod";
import { deleteWorkout } from "@/data/workouts";
import { revalidatePath } from "next/cache";

const DeleteWorkoutSchema = z.object({
  workoutId: z.string().uuid("Invalid workout ID"),
});

type DeleteWorkoutInput = z.infer<typeof DeleteWorkoutSchema>;

export async function deleteWorkoutAction(input: DeleteWorkoutInput) {
  const validated = DeleteWorkoutSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    await deleteWorkout(validated.data.workoutId);
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      errors: { _form: ["Failed to delete workout"] },
    };
  }
}
```

## Calling Server Actions from Components

### From Client Components

```typescript
"use client";

import { createWorkoutAction } from "./actions";
import { useState } from "react";

export function CreateWorkoutForm() {
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Extract and type the data - do NOT pass FormData to action
    const input = {
      name: formData.get("name") as string,
      date: new Date(formData.get("date") as string),
    };

    const result = await createWorkoutAction(input);

    if (!result.success) {
      setErrors(result.errors);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

### With React Hook Form

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createWorkoutAction } from "./actions";

const formSchema = z.object({
  name: z.string().min(1),
  date: z.coerce.date(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateWorkoutForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: FormValues) {
    const result = await createWorkoutAction(values);

    if (!result.success) {
      // Handle errors
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* form fields */}
    </form>
  );
}
```

## Summary

| Requirement | Implementation |
|-------------|----------------|
| Database mutations | Via helper functions in `src/data/` |
| ORM | Drizzle ORM |
| Server actions location | Colocated `actions.ts` files |
| Parameter types | Typed objects (never `FormData`) |
| Validation | Zod schemas for all inputs |
| Error handling | Consistent `ActionResponse` type |
