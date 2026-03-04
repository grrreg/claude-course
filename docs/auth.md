# Authentication

## Overview

This application uses **Clerk** for all authentication and user management.

## Critical Rules

1. **ONLY use Clerk** - Do NOT implement custom authentication
2. **Use server-side auth** - Always use `auth()` from `@clerk/nextjs/server` for server-side authentication
3. **Protect all routes** - Use Clerk middleware to protect authenticated routes
4. **Never trust client-side auth alone** - Always verify authentication server-side before data access

## Installation

Clerk is already configured in this project. The package `@clerk/nextjs` is installed.

## Environment Variables

Required environment variables (stored in `.env.local`):

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

## Middleware Configuration

All authenticated routes must be protected via Clerk middleware at `src/middleware.ts`:

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

## Server-Side Authentication

### Getting the Current User

Always use the `auth()` function from `@clerk/nextjs/server`:

```typescript
import { auth } from "@clerk/nextjs/server";

export async function myServerFunction() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // User is authenticated, proceed with operation
}
```

### In Server Components

```typescript
import { auth } from "@clerk/nextjs/server";

export default async function ProtectedPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div>Please sign in</div>;
  }

  return <div>Welcome, authenticated user!</div>;
}
```

### In Server Actions

```typescript
"use server";

import { auth } from "@clerk/nextjs/server";

export async function myServerAction() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Perform authenticated action
}
```

## Client-Side Components

### ClerkProvider

The root layout must wrap the application with `ClerkProvider`:

```typescript
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### User Button

Use Clerk's `UserButton` component for user profile/sign-out UI:

```typescript
import { UserButton } from "@clerk/nextjs";

export function Header() {
  return (
    <header>
      <UserButton />
    </header>
  );
}
```

### Sign In/Sign Up

Use Clerk's pre-built components or redirect to Clerk-hosted pages:

```typescript
import { SignInButton, SignUpButton } from "@clerk/nextjs";

export function AuthButtons() {
  return (
    <div>
      <SignInButton />
      <SignUpButton />
    </div>
  );
}
```

## Security Requirements

1. **Always verify userId server-side** - Never trust client-provided user IDs
2. **Filter all data by userId** - See `/docs/data-fetching.md` for data isolation rules
3. **Use middleware protection** - Ensure routes are protected at the middleware level
4. **Handle unauthorized states** - Always check for `userId` before database operations

## Summary

| Rule | Requirement |
|------|-------------|
| Auth Provider | Clerk ONLY |
| Server-side auth | `auth()` from `@clerk/nextjs/server` |
| Route protection | Clerk middleware |
| Client components | Use Clerk's pre-built components |
| User data access | Always verify `userId` before data operations |

## Reference

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Next.js Quickstart](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Middleware](https://clerk.com/docs/references/nextjs/clerk-middleware)
