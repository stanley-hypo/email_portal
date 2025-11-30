# Implementation Plan: Add Auth & DB

**Branch**: `001-add-auth-db` | **Date**: 2025-11-30 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-add-auth-db/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement user authentication using NextAuth.js (v5) with a Credentials provider, backed by a PostgreSQL database accessed via Drizzle ORM. This includes setting up the database schema for users, configuring NextAuth, replacing the existing login page, and ensuring sensitive routes are protected.

## Technical Context

**Language/Version**: TypeScript 5+ (Node.js)
**Primary Dependencies**: 
- Next.js 15.2.2 (App Router)
- Drizzle ORM
- NextAuth.js (v5)
- PostgreSQL (pg)
- bcryptjs (for password hashing)
**Storage**: PostgreSQL
**Testing**: Jest
**Target Platform**: Web (Next.js)
**Project Type**: Web Application
**Performance Goals**: Login < 2s
**Constraints**: 
- Secure password storage (hashing)
- Protect sensitive routes
- Environment variables for secrets
**Scale/Scope**: Initial auth setup, single User entity.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Principles Checked:**
- **I. Code Quality First**: TypeScript strict mode, ESLint compliance.
- **II. Testing Standards**: Integration tests for Auth flow (Critical Path).
- **III. UX Consistency**: Use Mantine/Tailwind, Responsive design, Feedback (loading/error states).
- **IV. Performance**: Login < 2s, Optimized DB queries.

**Status**: PASS

## Project Structure

### Documentation (this feature)

```text
specs/001-add-auth-db/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (auth)/          # Protected routes (to be organized)
│   ├── api/
│   │   └── auth/        # NextAuth endpoints
│   ├── login/           # Login page (to be updated)
│   └── layout.tsx       # Root layout
├── db/                  # Database configuration
│   ├── schema.ts        # Drizzle schema
│   └── index.ts         # DB connection
├── lib/
│   └── auth.ts          # NextAuth configuration
└── ...
```

**Structure Decision**: Adopting standard Next.js App Router structure with a dedicated `db` directory for database concerns and `lib` for auth configuration.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A       |            |                                     |
