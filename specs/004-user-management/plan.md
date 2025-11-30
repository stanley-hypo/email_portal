# Implementation Plan: User Management

**Branch**: `004-user-management` | **Date**: 2025-11-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-user-management/spec.md`

**Note**: This plan implements admin-only user management with CRUD operations, password management, and role-based access control.

## Summary

Implement a comprehensive user management system that allows administrators to create, read, update, and delete user accounts. The system includes password management capabilities (self-update and admin-reset), role-based access control using an `isAdmin` flag, and protection against edge cases like self-deletion and duplicate emails. Built using NextAuth.js v5 for authentication, Drizzle ORM for database operations, and Mantine components for a consistent UI.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: Next.js 15 (App Router), NextAuth.js v5, Drizzle ORM, Tailwind CSS, Mantine
**Storage**: PostgreSQL (via Drizzle)
**Testing**: Jest / Vitest (implied by constitution)
**Target Platform**: Web (Vercel/Node.js)
**Project Type**: Web Application
**Performance Goals**: Standard web app goals (LCP < 2.5s, Interaction < 200ms)
**Constraints**: Admin-only access for management features.
**Scale/Scope**: Low scale (internal user management).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Strict Typing**: Will use Zod for validation and proper TS types for DB/API.
- [x] **Testing Standards**: Will include integration tests for user management actions.
- [x] **User Experience**: Will use Mantine components for consistent UI.
- [x] **Performance**: Will use server actions and optimized DB queries.
- [x] **Security**: Will enforce `isAdmin` checks on both UI and API/Action level.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── actions/
│   │   └── user.ts              # User management server actions
│   └── portal/
│       ├── users/
│       │   ├── page.tsx         # User management page
│       │   └── components/
│       │       ├── UserTable.tsx
│       │       ├── CreateUserModal.tsx
│       │       ├── EditUserModal.tsx
│       │       └── ResetPasswordModal.tsx
│       └── profile/
│           ├── page.tsx          # User profile page
│           └── components/
│               └── ChangePasswordModal.tsx
├── db/
│   └── schema.ts                # Database schema (add isAdmin column)
└── lib/
    ├── auth.config.ts           # NextAuth config (update callbacks)
    ├── auth-helpers.ts          # Admin authorization helpers
    └── validations/
        └── user.ts              # Zod validation schemas

tests/
└── integration/
    └── user-management.test.ts  # Integration tests (optional)
```

**Structure Decision**: Using Next.js App Router structure with server actions pattern. All user management logic is centralized in `src/app/actions/user.ts` with UI components organized under `src/app/portal/`. Authentication helpers and validation schemas are in `src/lib/` for reusability across the application.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
