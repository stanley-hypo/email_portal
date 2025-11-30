# Tasks: User Management

**Input**: Design documents from `/specs/004-user-management/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - only included if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `src/app/`, `src/lib/`, `src/db/` at repository root
- Paths shown below use Next.js App Router structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and database schema updates

- [x] T001 Add `isAdmin` column to users table in `src/db/schema.ts`
- [x] T002 Run database migration with `npx drizzle-kit push`
- [x] T003 Update NextAuth callbacks to include `isAdmin` in session/JWT in `src/lib/auth.config.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create user server actions file structure at `src/app/actions/user.ts`
- [x] T005 [P] Create admin authorization helper function in `src/lib/auth-helpers.ts`
- [x] T006 [P] Create user validation schemas using Zod in `src/lib/validations/user.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Admin User Management (Priority: P1) 🎯 MVP

**Goal**: Enable admins to view, create, update, and delete user accounts

**Independent Test**: Login as an admin and perform CRUD operations on user accounts from the user management page

### Implementation for User Story 1

- [x] T007 [P] [US1] Implement `getUsers` server action in `src/app/actions/user.ts`
- [x] T008 [P] [US1] Implement `createUser` server action in `src/app/actions/user.ts`
- [x] T009 [P] [US1] Implement `updateUser` server action in `src/app/actions/user.ts`
- [x] T010 [P] [US1] Implement `deleteUser` server action with self-deletion prevention in `src/app/actions/user.ts`
- [x] T011 [US1] Create user management page route at `src/app/portal/users/page.tsx`
- [x] T012 [US1] Create UserTable component using Mantine Table in `src/app/portal/users/components/UserTable.tsx`
- [x] T013 [P] [US1] Create CreateUserModal component with Mantine Form in `src/app/portal/users/components/CreateUserModal.tsx`
- [x] T014 [P] [US1] Create EditUserModal component with Mantine Form in `src/app/portal/users/components/EditUserModal.tsx`
- [x] T015 [US1] Add admin-only access check to user management page in `src/app/portal/users/page.tsx`
- [x] T016 [US1] Integrate all CRUD operations with UI components in `src/app/portal/users/page.tsx`
- [x] T017 [US1] Add error handling and success notifications using Mantine notifications

**Checkpoint**: At this point, User Story 1 should be fully functional - admins can manage all users via UI

---

## Phase 4: User Story 2 - Password Management (Priority: P1)

**Goal**: Allow users to update their own password, and allow admins to reset other users' passwords

**Independent Test**: Change passwords and verify login with the new password works correctly

### Implementation for User Story 2

- [x] T018 [P] [US2] Implement `updateSelfPassword` server action in `src/app/actions/user.ts`
- [x] T019 [P] [US2] Implement `adminResetPassword` server action in `src/app/actions/user.ts`
- [x] T020 [US2] Create password update validation schema in `src/lib/validations/user.ts`
- [x] T021 [US2] Create ChangePasswordModal component for self-update in `src/app/portal/profile/components/ChangePasswordModal.tsx`
- [x] T022 [US2] Create ResetPasswordModal component for admin use in `src/app/portal/users/components/ResetPasswordModal.tsx`
- [x] T023 [US2] Add "Change Password" button to user profile page at `src/app/portal/profile/page.tsx`
- [x] T024 [US2] Add "Reset Password" button to user management table in `src/app/portal/users/components/UserTable.tsx`
- [x] T025 [US2] Integrate password hashing with bcryptjs in both server actions
- [x] T026 [US2] Add validation for current password verification in `updateSelfPassword`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - password management is complete

---

## Phase 5: User Story 3 - Access Control (Priority: P1)

**Goal**: Ensure only admins can access user management features to prevent unauthorized changes

**Independent Test**: Attempt to access admin pages as a regular user and verify access is denied

### Implementation for User Story 3

- [ ] T027 [US3] Add isAdmin check middleware to user management routes in `src/middleware.ts` or route handler
- [ ] T028 [P] [US3] Add server-side authorization checks to all admin-only server actions
- [ ] T029 [US3] Add UI-level conditional rendering based on isAdmin status in navigation
- [ ] T030 [US3] Add redirect logic for non-admin users attempting to access `/portal/users`
- [ ] T031 [US3] Add 403 error page at `src/app/portal/users/error.tsx` for unauthorized access
- [ ] T032 [US3] Test that regular users cannot call admin server actions directly

**Checkpoint**: All user stories should now be independently functional - access control is enforced

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and edge case handling

- [ ] T033 [P] Add duplicate email validation in `createUser` and `updateUser` actions
- [ ] T034 [P] Add last admin protection in `updateUser` to prevent removing last admin status (edge case: system must always have at least one admin)
- [ ] T035 Add confirmation dialog for user deletion with warning message
- [ ] T036 Add loading states to all forms and modals
- [ ] T037 [P] Add user activity logging for audit trail
- [ ] T038 [P] Add comprehensive error messages for all edge cases
- [ ] T039 Run quickstart.md validation to verify all features work end-to-end
- [ ] T040 [P] Update documentation with screenshots and usage examples

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3)
  - Note: All three stories are P1, but ordered by functional dependency
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Integrates with US1 (adds to user table) but independently testable
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Wraps US1 and US2 with access controls

### Within Each User Story

- Server actions before UI components
- Base components (Table, Modals) before integration
- Core implementation before error handling
- Story complete before moving to next

### Parallel Opportunities

- All Setup tasks can run in sequence (small number, schema update is quick)
- All Foundational tasks marked [P] can run in parallel (Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Server actions within a story marked [P] can run in parallel
- UI components within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all server actions for User Story 1 together:
Task: "Implement getUsers server action in src/app/actions/user.ts"
Task: "Implement createUser server action in src/app/actions/user.ts"
Task: "Implement updateUser server action in src/app/actions/user.ts"
Task: "Implement deleteUser server action in src/app/actions/user.ts"

# Launch all modal components for User Story 1 together:
Task: "Create CreateUserModal component in src/app/portal/users/components/CreateUserModal.tsx"
Task: "Create EditUserModal component in src/app/portal/users/components/EditUserModal.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently (admin can manage users)
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (Password management added)
4. Add User Story 3 → Test independently → Deploy/Demo (Full security enforcement)
5. Add Polish → Final production-ready state
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Admin CRUD)
   - Developer B: User Story 2 (Password Management)
   - Developer C: User Story 3 (Access Control)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Security is paramount - always verify isAdmin on both client and server
- All passwords must be hashed with bcryptjs before storage
- Follow constitution guidelines for TypeScript strict mode and error handling
