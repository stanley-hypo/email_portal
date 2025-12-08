# Tasks: Usage Logging for PDFs and Emails

**Input**: Design documents from `/specs/001-usage-log-portal/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ensure environment and tooling are ready.

- [X] T001 Verify DB/Redis env vars for logging/worker pipeline in `.env` (POSTGRES_*, REDIS_HOST/PORT).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core schema and logging utilities required by all stories. ⚠️ Complete before user stories.

- [X] T002 Create Drizzle migration for `usage_logs` table with indexes in `drizzle/0001_usage_logs.sql`.
- [X] T003 Update Drizzle schema with `usage_logs` table and enums in `src/db/schema.ts`.
- [X] T004 [P] Add usage log types/enums and DTO validation helpers in `src/types/usageLogs.ts`.
- [X] T005 [P] Implement server-side `logUsageEvent` helper to persist validated events in `src/utils/userActivityLogger.ts` (or new `src/utils/usageLogger.ts`), including record type/event validation.
- [X] T005a Add ingestion latency tracking (event timestamp vs DB persisted timestamp) and surface helpers to compute freshness in `src/utils/usageLogger.ts`.

**Checkpoint**: Logging schema and helper ready; user stories can emit and query events.

---

## Phase 3: User Story 1 - Audit PDF/email activity (Priority: P1) 🎯 MVP

**Goal**: Record PDF/email events and show chronological log entries in portal for a record.
**Independent Test**: On a PDF or email record, open logs and see ordered events with actor/status/time.

- [ ] T006 [US1] Emit PDF view/download/print usage events from portal flows in `src/app/pdf/page.tsx` and `src/utils/html2pdf.ts` using `logUsageEvent`.
- [X] T007 [US1] Emit email send/deliver/open/bounce/failed events in `src/workers/emailWorker.ts` (and `src/app/api/send-email/route.ts` if needed) using `logUsageEvent`.
- [X] T008 [US1] Implement base GET `/api/logs` endpoint returning chronological events (recordId/recordType filters, pagination) in `src/app/api/logs/route.ts`.
- [X] T009 [US1] Enforce role-based access (admin/compliance/support) for logs API and portal route in `src/app/api/logs/route.ts` and `src/app/portal/logs/page.tsx`.
- [X] T010 [US1] Build portal logs page with chronological table (event, actor, status, timestamp, source) in `src/app/portal/logs/page.tsx`, scoped to selected record when provided.
- [X] T010a [US1] Show “last updated” timestamp and freshness hint; auto-refresh or manual refresh if data older than 5 minutes in `src/app/portal/logs/page.tsx`.
- [X] T010b [US1] Surface retention window returned by API in the portal logs header/notice in `src/app/portal/logs/page.tsx`.

**Checkpoint**: Users can view chronological logs for a given PDF/email record with access control applied.

---

## Phase 4: User Story 2 - Filter and export usage history (Priority: P2)

**Goal**: Filter logs by date/event/actor/recipient and export visible results to CSV.
**Independent Test**: Apply filters and export; CSV matches on-screen filtered rows/columns.

- [X] T011 [US2] Extend `/api/logs` to support filters (date range, eventType list, actor, recipient, status, recordType/id) and sorting with validation in `src/app/api/logs/route.ts`.
- [X] T012 [US2] Add UI filters, pagination, and totals to logs page (date range picker, event type multiselect, actor/recipient inputs) in `src/app/portal/logs/page.tsx`.
- [X] T013 [US2] Implement CSV export endpoint `/api/logs/export` with row limits and same filters in `src/app/api/logs/export/route.ts`.
- [X] T014 [US2] Wire export action/button to download filtered CSV and show success/error states in `src/app/portal/logs/page.tsx`.
- [X] T014a [US2] Enforce export row cap (e.g., 10k) with 413 guidance and retention window messaging in `src/app/api/logs/export/route.ts`.
- [X] T014b [US2] Add UI sorting controls (timestamp/event type) tied to API sort params in `src/app/portal/logs/page.tsx`.

**Checkpoint**: Filtered views and CSV export work and reflect the same dataset.

---

## Phase 5: User Story 3 - Investigate delivery or access issues (Priority: P3)

**Goal**: Quickly search by recipient or record id and inspect latest statuses to resolve inquiries.
**Independent Test**: Search by recipient/record; see latest email status or confirm no access events.

- [X] T015 [US3] Add quick search input (recipient email or record id) with recent-results view in `src/app/portal/logs/page.tsx`.
- [X] T016 [US3] Ensure email status mapping (sent/delivered/opened/bounced/failed) is recorded and surfaced in API response in `src/workers/emailWorker.ts` and `src/app/api/logs/route.ts`.
- [X] T017 [US3] Enhance UI empty/error/loading states for investigations (no events, unauthorized) in `src/app/portal/logs/page.tsx`.
- [X] T017a [US3] Apply Mantine/Tailwind design-system components with responsive layout, focus order, aria labels, and feedback (loading/success/error) for search/results in `src/app/portal/logs/page.tsx`.
- [X] T017b [US3] Capture support/compliance feedback or success rate after investigations (e.g., lightweight survey/log entry) and document the flow in `specs/001-usage-log-portal/quickstart.md`.

**Checkpoint**: Support can answer delivery/access questions via search and status visibility.

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: Hardening, docs, and quality.

- [X] T018 [P] Add integration test coverage for `/api/logs` filters and export limits in `src/tests/integration/logs.test.ts`.
- [X] T019 [P] Update quickstart with final endpoints/paths and run validation steps in `specs/001-usage-log-portal/quickstart.md`.
- [ ] T020 Final lint/typecheck pass and sanity run of quickstart flows (`npx drizzle-kit push` dry-run, portal navigation) logged in `README.md` or feature notes.
- [X] T021 [P] Add perf test with ~5k seeded log rows to verify `/api/logs` responses under 3 seconds for 30-day range in `src/tests/integration/logs.performance.test.ts`.
- [X] T022 [P] Accessibility/design-system compliance check for logs UI and export controls (WCAG basics, Mantine/Tailwind usage) and adjust components as needed in `src/app/portal/logs/page.tsx`.

---

## Dependencies & Execution Order

- Setup → Foundational → User stories in priority order (US1 → US2 → US3) → Polish.
- User stories can proceed in parallel after Foundational if team capacity allows; respect task dependencies within each story.
- API/filter/export tasks (T011–T014) depend on base API and schema (T002–T010).
- UI tasks depend on API availability for their story.

## Parallel Opportunities

- [P] tasks: T004, T005, T018, T019 can run in parallel with other non-dependent work.
- After Foundational, different owners can tackle US1, US2, and US3 concurrently once their required API pieces are ready.

## Implementation Strategy

- MVP = US1 complete (logging emitted + viewable with access control). Validate before proceeding.
- Incrementally add filters/export (US2), then investigation search/status UX (US3).
- Keep exports capped and paginated to meet performance/freshness targets.

