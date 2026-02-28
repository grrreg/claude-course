# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT: Documentation First

**ALWAYS refer to the relevant documentation files in the `/docs` directory before generating any code.** The docs contain project-specific patterns, conventions, and implementation details that must be followed.

## Commands

- `npm run dev` - Start development server at http://localhost:3000
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Architecture

This is a Next.js 16 application using the App Router with React 19.

### Tech Stack
- **Framework**: Next.js 16 with App Router
- **React**: v19 with React Compiler enabled (`reactCompiler: true` in next.config.ts)
- **Styling**: Tailwind CSS v4 (using `@tailwindcss/postcss` plugin, CSS-first config via `@import "tailwindcss"`)
- **Authentication**: Clerk (`@clerk/nextjs`)
- **TypeScript**: Strict mode enabled

### Project Structure
- `src/app/` - App Router pages and layouts
- `src/app/layout.tsx` - Root layout with Clerk auth and Geist fonts
- `src/app/globals.css` - Global styles and Tailwind CSS theme customization
- `src/proxy.ts` - Clerk middleware using `clerkMiddleware()` from `@clerk/nextjs/server`

### Authentication (Clerk)
- `<ClerkProvider>` wraps the app in `layout.tsx`
- Use `<SignedIn>` and `<SignedOut>` components for conditional rendering
- Server-side auth: import `auth()` from `@clerk/nextjs/server` (async/await required)
- Environment variables in `.env.local`: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`

### Path Aliases
- `@/*` maps to `./src/*`
