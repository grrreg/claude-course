# Data Fetching

## Critical Rules

**ALL data fetching in this application MUST be done via Server Components.**

This is non-negotiable. Do NOT fetch data via:
- Route handlers
- Client components
- API routes
- `useEffect` or any client-side fetching
- Any other method

**ONLY Server Components are allowed to fetch data.**

## Database Access

All database queries MUST:

1. **Use helper functions in the `/data` directory** - Never write database queries directly in components
2. **Use Drizzle ORM** - Do NOT use raw SQL queries
3. **Enforce user data isolation** - A logged-in user can ONLY access their own data

### User Data Isolation

This is critically important for security:

- Every database query MUST filter by the authenticated user's ID
- Users MUST NOT be able to access, view, or modify any other user's data
- Always verify the user is authenticated before querying
- Always include `userId` in WHERE clauses

### Example Pattern

```typescript
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";

export async function getWorkouts() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));
}

export async function getWorkoutById(id: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // ALWAYS filter by BOTH the record ID AND the userId
  return db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.id, id),
        eq(workouts.userId, userId)
      )
    );
}
```

### Using Data Functions in Server Components

```typescript
// src/app/workouts/page.tsx
import { getWorkouts } from "@/data/workouts";

export default async function WorkoutsPage() {
  const workouts = await getWorkouts();

  return (
    <div>
      {workouts.map((workout) => (
        <div key={workout.id}>{workout.name}</div>
      ))}
    </div>
  );
}
```

## Summary

| Rule | Requirement |
|------|-------------|
| Data fetching location | Server Components ONLY |
| Database queries | `/data` directory helper functions ONLY |
| ORM | Drizzle ORM ONLY (no raw SQL) |
| User isolation | Every query MUST filter by authenticated userId |
