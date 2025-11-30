# Implementation Plan: Unified Login with Portal Access

**Branch**: `003-unified-login` | **Date**: 2025-11-30 | **Spec**: [spec.md](file:///Users/stanley/PhpstormProjects/email_portal/specs/003-unified-login/spec.md)
**Input**: Feature specification from `/specs/003-unified-login/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a unified login system that grants access to a central portal dashboard, from which users can navigate to SMTP and PDF configuration features. This replaces the current direct access model and enforces authentication across all portal routes using NextAuth.js v5.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20+
**Primary Dependencies**: Next.js 15.2.2 (App Router), NextAuth.js v5 (Beta), Mantine v7 (UI), Drizzle ORM
**Storage**: PostgreSQL (via Drizzle)
**Testing**: Jest / Vitest (implied by package.json)
**Target Platform**: Web (Next.js)
**Project Type**: Single Next.js Web Application
**Performance Goals**: Login < 2s, Page transitions < 500ms
**Constraints**: Must use existing `users` table and NextAuth configuration.
**Scale/Scope**: ~3 new/modified pages, updated middleware protection.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **No Breaking Changes**: Uses existing auth infrastructure.
- [x] **Security**: Enforces authentication on sensitive routes.
- [x] **Performance**: Uses server-side auth checks where possible.

## Project Structure

### Documentation (this feature)

```text
specs/003-unified-login/
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
│   ├── login/           # Modified login page
│   ├── portal/          # [NEW] Portal dashboard
│   ├── smtp/            # Existing SMTP page (protected)
│   └── pdf/             # Existing PDF page (protected)
├── lib/
│   ├── auth.ts          # Auth configuration
│   └── auth.config.ts   # Middleware matcher configuration
├── db/
│   └── schema.ts        # Database schema
└── middleware.ts        # Auth middleware
```

**Structure Decision**: Continue using the existing Next.js App Router structure. Add a new `/portal` route to serve as the dashboard.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | | |
