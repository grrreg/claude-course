# Routing

## Overview

This application uses Next.js App Router with all authenticated features living under the `/dashboard` route prefix.

## Route Structure

```
/                          - Public landing page
/sign-in                   - Clerk sign-in page (public)
/sign-up                   - Clerk sign-up page (public)
/dashboard                 - Protected dashboard home
/dashboard/workout/new     - Protected: create new workout
/dashboard/workout/[workoutId] - Protected: view/edit a workout
```

## Critical Rules

1. **All app features live under `/dashboard`** - Do NOT create authenticated feature routes outside of `/dashboard`
2. **Route protection via middleware** - All routes under `/dashboard` are protected using Next.js middleware; do NOT rely on page-level redirects as the sole protection mechanism
3. **Never add auth checks as a substitute for middleware** - Middleware is the gate; page-level `auth()` calls are for retrieving the user, not for route protection
4. **Public routes must be explicitly listed** - Any new public route (e.g., a marketing page) must be added to the `isPublicRoute` matcher in `src/middleware.ts`

## Middleware Configuration

Route protection is handled in `src/middleware.ts` using Clerk's `clerkMiddleware`:

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

- Any route NOT in `isPublicRoute` is automatically protected — this includes all `/dashboard/*` routes
- `auth.protect()` redirects unauthenticated users to the Clerk sign-in page

## Adding New Routes

### New protected route (under dashboard)

1. Create the file at `src/app/dashboard/<feature>/page.tsx`
2. No additional middleware changes needed — it is protected automatically

### New public route

1. Create the file at `src/app/<route>/page.tsx`
2. Add the route pattern to `isPublicRoute` in `src/middleware.ts`:

```typescript
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/your-new-public-route(.*)", // add here
]);
```

## File Conventions

Each route segment follows Next.js App Router conventions:

| File | Purpose |
|------|---------|
| `page.tsx` | The route's UI (Server Component by default) |
| `layout.tsx` | Shared layout wrapping child routes |
| `actions.ts` | Server Actions for data mutations on this route |
| `loading.tsx` | Suspense loading UI |
| `error.tsx` | Error boundary UI |

## Reference

- [Next.js App Router](https://nextjs.org/docs/app)
- [Clerk Middleware](https://clerk.com/docs/references/nextjs/clerk-middleware)
- See `/docs/auth.md` for authentication patterns used within protected routes
