# Implementation Plan: Usage Logging for PDFs and Emails

**Branch**: `001-usage-log-portal` | **Date**: 2025-12-08 | **Spec**: [spec.md](file:///Users/stanley/PhpstormProjects/email_portal/specs/001-usage-log-portal/spec.md)  
**Input**: Feature specification from `/specs/001-usage-log-portal/spec.md`

**Note**: This plan follows the `/speckit.plan` workflow.

## Summary

Add end-to-end usage logging for PDF and email records, exposing searchable, filterable, and exportable logs in the portal with role-based access. Capture PDF access events (view/download/print) and email delivery/engagement events, store them with record linkage, and present them with pagination, filters, and freshness targets aligned to the spec.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20+  
**Primary Dependencies**: Next.js 15.2.6 (App Router), Mantine 7.x + Tailwind 4 for UI, NextAuth.js v5 (beta), Drizzle ORM, BullMQ/Nodemailer for email processing, Puppeteer for PDF generation  
**Storage**: PostgreSQL (via Drizzle) for log persistence  
**Testing**: Jest / Vitest, Next.js lint/typecheck  
**Target Platform**: Web (Next.js, App Router)  
**Project Type**: Single Next.js web application with background worker for email queueing  
**Performance Goals**: Portal log queries return within ~3s for 30-day ranges up to ~5k events; new events visible within 5 minutes  
**Constraints**: Enforce role-based access; maintain design-system consistency (Mantine/Tailwind); adhere to log retention policy; keep authentication via NextAuth middleware and server actions  
**Scale/Scope**: New logging table(s), API routes for querying/exporting logs, portal UI for viewing/filtering/exporting, worker emitters for events

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Tech Standards**: Next.js App Router, TypeScript strict, Mantine/Tailwind, NextAuth, Drizzle/PostgreSQL are used.  
- [x] **Code Quality**: Plan keeps separation of concerns (API routes, lib logging utilities, UI components).  
- [x] **Testing Standards**: Critical paths (log query, permissions, export) will require integration tests.  
- [x] **UX Consistency**: Uses existing design system components and responsive layouts; includes loading/error states.  
- [x] **Performance**: Targets meet freshness and query responsiveness; pagination to avoid heavy payloads.  
- [x] **Governance**: Feature branch and Conventional Commits respected; no known violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-usage-log-portal/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md             # created by /speckit.tasks
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── api/
│   │   ├── logs/route.ts           # NEW: log query endpoint (filter/paginate)
│   │   └── logs/export/route.ts    # NEW: export endpoint (CSV)
│   ├── portal/
│   │   └── logs/                   # NEW: portal UI for viewing logs
│   ├── pdf/                        # existing PDF UI (emits events)
│   └── smtp/                       # existing email UI (emits events)
├── lib/
│   ├── logger.ts                   # existing; may extend for usage events
│   └── userActivityLogger.ts       # existing helper; extend for structured events
├── db/
│   └── schema.ts                   # add usage log table
├── utils/
│   └── html2pdf.ts                 # existing PDF generation (hook event emit)
├── workers/
│   └── emailWorker.ts              # emit email send/delivery/open/bounce events
tests/
├── integration/                    # add integration tests for log APIs
└── unit/                           # add unit tests for log formatting/helpers
```

**Structure Decision**: Continue with the single Next.js App Router project. Add API routes for logs, extend Drizzle schema for usage logs, and add a portal UI under `/portal/logs` using Mantine/Tailwind. Reuse existing logging utilities and worker pipeline to emit structured events.

## Complexity Tracking

No constitution violations identified; no additional complexity to justify.

