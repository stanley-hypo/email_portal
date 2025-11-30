# Implementation Tasks: Add Auth & DB

**Feature**: Add Auth & DB (001-add-auth-db)
**Spec**: [spec.md](spec.md)
**Plan**: [plan.md](plan.md)

## Implementation Strategy

- **Phase 1: Setup**: Install dependencies and configure base infrastructure for Database and Auth.
- **Phase 2: Foundational**: Establish database connection and basic schema structure.
- **Phase 3: User Story 2 (System Data Storage)**: Implement the User entity and migration workflow.
- **Phase 4: User Story 1 (User Login)**: Implement authentication logic, login UI, and route protection.
- **Phase 5: User Story 3 (Session Persistence)**: Handle session management and logout.
- **Phase 6: Polish**: Error handling and final verification.

## Dependencies

- **US2 (Data Storage)** must be completed before **US1 (Login)** because login requires querying the database for users.
- **US1 (Login)** must be completed before **US3 (Session)** because session persistence is relevant only after login.

---

## Phase 1: Setup & Configuration

**Goal**: Initialize the project with necessary libraries and configurations.

- [ ] T001 Install dependencies: `drizzle-orm`, `postgres`, `next-auth@beta`, `bcryptjs` in `package.json`
- [ ] T002 Install dev dependencies: `drizzle-kit`, `@types/pg`, `@types/bcryptjs` in `package.json`
- [ ] T003 [P] Create `drizzle.config.ts` at project root with PostgreSQL configuration
- [ ] T004 [P] Add `DATABASE_URL` and `AUTH_SECRET` to `.env` (and `.env.example` if exists)

## Phase 2: Foundational

**Goal**: Establish core connections and directory structure.

- [ ] T005 Create database connection client in `src/db/index.ts`
- [ ] T006 Create auth configuration file in `src/lib/auth.ts` (basic NextAuth config structure)
- [ ] T007 Create `src/lib/auth.config.ts` for edge-compatible auth configuration (if needed for middleware)

## Phase 3: User Story 2 - System Data Storage (P1)

**Goal**: Enable persistent data storage with PostgreSQL and Drizzle.
**Story**: As a developer, I want the application to connect to a persistent data store...

- [ ] T008 [US2] Define `users` table schema in `src/db/schema.ts` matching data-model.md
- [ ] T009 [US2] Generate initial migration using `drizzle-kit generate`
- [ ] T010 [US2] Run migration to create tables in local database using `drizzle-kit migrate`
- [ ] T011 [US2] Create a seed script `src/db/seed.ts` to insert a test user with a hashed password
- [ ] T012 [US2] Add `seed` script to `package.json` and run it to verify DB connection and write access

## Phase 4: User Story 1 - User Login (P1)

**Goal**: Enable users to log in with email and password.
**Story**: As a user, I want to log in to the application using my email and password...

- [ ] T013 [US1] Implement `authorize` logic in `src/lib/auth.ts` using `bcryptjs` to verify credentials against DB
- [ ] T014 [US1] Create NextAuth route handler in `src/app/api/auth/[...nextauth]/route.ts`
- [ ] T015 [US1] Update `src/app/login/page.tsx` to use a client-side form calling `signIn('credentials', ...)`
- [ ] T016 [US1] Create `middleware.ts` to protect routes (matcher for `/dashboard`, `/settings`, and other protected paths)
- [ ] T017 [US1] Verify login flow: Success redirects to home, failure shows error on login page
- [ ] T018 [US1] Create integration test for login flow (success/failure) in `src/tests/integration/auth.test.ts`

## Phase 5: User Story 3 - Session Persistence (P2)

**Goal**: Maintain user session across refreshes and allow logout.
**Story**: As a user, I want my login session to persist...

- [ ] T019 [US3] Verify session persists on page refresh (manual verification step)
- [ ] T020 [US3] Add a Logout button component in `src/components/LogoutButton.tsx` (or similar) calling `signOut()`
- [ ] T021 [US3] Integrate Logout button into the main layout or navigation bar
- [ ] T022 [US3] Verify logout clears session and redirects to login

## Phase 6: Polish & Cleanup

**Goal**: Finalize feature for release.

- [ ] T023 Add error handling for database connection failures in `src/db/index.ts`
- [ ] T024 Ensure all environment variables are documented in `README.md` or `.env.example`
- [ ] T025 Run full manual test of Login -> Session -> Logout flow
