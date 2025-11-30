# Research: Unified Login with Portal Access

**Feature**: Unified Login
**Date**: 2025-11-30

## Decisions

### 1. Authentication Strategy
**Decision**: Use existing **NextAuth.js v5** setup with Credentials provider.
**Rationale**: The project already has NextAuth configured with Drizzle adapter and a `users` table. Reusing this infrastructure ensures consistency and avoids unnecessary complexity.
**Alternatives Considered**:
- **Clerk/Auth0**: Rejected to avoid external dependencies and costs, and because a custom auth solution is already partially implemented.
- **Passport.js**: Rejected as NextAuth is the standard for Next.js applications.

### 2. Route Protection
**Decision**: Implement route protection via **Middleware** (`middleware.ts` + `auth.config.ts`) AND client-side checks (`ProtectedRoute.tsx`).
**Rationale**: Middleware provides the first line of defense, redirecting unauthenticated users before the page loads. Client-side checks provide a better UX for session expiry handling within the app.
**Implementation Details**:
- Update `auth.config.ts` `authorized` callback to check for `/portal`, `/smtp`, and `/pdf` paths.
- Ensure `middleware.ts` matcher covers these routes.

### 3. Portal Dashboard
**Decision**: Create a new page at `/src/app/portal/page.tsx`.
**Rationale**: A dedicated dashboard page provides a landing point after login and a central hub for navigation, improving the user experience compared to redirecting directly to one feature or the other.
**UI Library**: Use **Mantine** components (`AppShell`, `Grid`, `Card`) to match the existing design language.

## Unknowns & Clarifications

- **Resolved**: Auth provider is Credentials (email/password).
- **Resolved**: Database is PostgreSQL via Drizzle.
- **Resolved**: UI library is Mantine.
