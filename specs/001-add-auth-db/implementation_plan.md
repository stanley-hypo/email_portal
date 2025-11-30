# Implementation Plan - Refine Auth Schema

Refine the database schema to align with Auth.js (NextAuth.js) standards using the Drizzle Adapter for PostgreSQL. This ensures compatibility with future auth providers (OAuth) and standard session management.

## User Review Required

> [!IMPORTANT]
> This change modifies the `users` table and adds new tables (`accounts`, `sessions`, `verificationTokens`). Existing data in `users` (if any, besides seed) might need migration, but currently we only have seed data.

## Proposed Changes

### Database Schema

#### [MODIFY] [schema.ts](file:///Users/stanley/PhpstormProjects/email_portal/src/db/schema.ts)
- Update `users` table to match Auth.js spec (add `emailVerified` mode, ensure optional fields).
- Add `accounts` table (for OAuth providers).
- Add `sessions` table (for database sessions).
- Add `verificationTokens` table (for magic links).
- **Keep** `password` field in `users` table for Credentials provider.

### Auth Configuration

#### [MODIFY] [auth.ts](file:///Users/stanley/PhpstormProjects/email_portal/src/lib/auth.ts)
- Import and configure `DrizzleAdapter`.
- Pass the adapter to `NextAuth` config.

### Dependencies

- Install `@auth/drizzle-adapter`.

## Verification Plan

### Automated Tests
- Run `yarn db:seed` to verify the new schema works with the seed script.
- Run `npx drizzle-kit generate` and `npx drizzle-kit migrate` to verify migrations.

### Manual Verification
- Verify database tables are created in PostgreSQL using a DB client (or just relying on migration success).
