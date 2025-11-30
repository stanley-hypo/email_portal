# Feature Specification: User Management

**Feature Branch**: `004-user-management`
**Created**: 2025-11-30
**Status**: Draft
**Input**: User description: "做一個 user management 去 manage user including delete, create, update and update self password and other user password user 有一個叫 isAdmin, admin 先可以 management user"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin User Management (Priority: P1)

As an Admin, I want to manage user accounts so that I can control who has access to the system.

**Why this priority**: This is the core functionality requested to enable system administration.

**Independent Test**: Can be fully tested by logging in as an admin and performing CRUD operations on user accounts.

**Acceptance Scenarios**:

1. **Given** I am logged in as an Admin, **When** I view the user management page, **Then** I see a list of all users.
2. **Given** I am logged in as an Admin, **When** I create a new user with email, password, and admin status, **Then** the user is created and appears in the list.
3. **Given** I am logged in as an Admin, **When** I update an existing user's details (email, admin status), **Then** the changes are saved.
4. **Given** I am logged in as an Admin, **When** I delete a user, **Then** the user is removed from the system and can no longer log in.

---

### User Story 2 - Password Management (Priority: P1)

As a User (Admin or Regular), I want to update my password to maintain security. As an Admin, I want to reset other users' passwords if they forget them.

**Why this priority**: Essential security feature for account maintenance.

**Independent Test**: Can be tested by changing passwords and verifying login with the new password.

**Acceptance Scenarios**:

1. **Given** I am logged in as any user, **When** I update my own password, **Then** I can log in with the new password.
2. **Given** I am logged in as an Admin, **When** I update another user's password, **Then** that user can log in with the new password.

---

### User Story 3 - Access Control (Priority: P1)

As a System, I want to ensure only Admins can access user management features to prevent unauthorized changes.

**Why this priority**: Critical security constraint to protect the system.

**Independent Test**: Can be tested by attempting to access admin pages as a regular user.

**Acceptance Scenarios**:

1. **Given** I am logged in as a Regular User (non-admin), **When** I attempt to access the user management page or API, **Then** I am denied access (redirected or error message).
2. **Given** I am logged in as a Regular User, **When** I attempt to update another user's password, **Then** the action is rejected.

### Edge Cases

- **Self-Deletion**: What happens if an Admin tries to delete their own account?
    - System should prevent an Admin from deleting their own account to avoid accidental lockout, or require a specific confirmation.
- **Duplicate Email**: What happens if an Admin tries to create/update a user with an email that already exists?
    - System should reject the action and display a clear error message indicating the email is already in use.
- **Last Admin**: What happens if the last Admin tries to remove their admin status?
    - System should prevent the last Admin from revoking their own admin privileges to ensure the system remains manageable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow Admins to view a list of all registered users.
- **FR-002**: System MUST allow Admins to create new users by providing a name, email, password, and `isAdmin` status.
- **FR-003**: System MUST allow Admins to update existing users' name, email, and `isAdmin` status.
- **FR-004**: System MUST allow Admins to delete existing users.
- **FR-005**: System MUST allow Admins to set a new password for any user.
- **FR-006**: System MUST allow any authenticated user to update their own password.
- **FR-007**: System MUST restrict all user management operations (create, read list, update others, delete) to users with `isAdmin` set to true.
- **FR-008**: System MUST store an `isAdmin` boolean flag for each user to distinguish between Admins and Regular Users.
- **FR-009**: System MUST ensure the `isAdmin` flag defaults to `false` for new users unless explicitly set to `true` by an Admin.
- **FR-010**: System MUST prevent an Admin from deleting their own account.
- **FR-011**: System MUST prevent the creation or update of a user with a duplicate email address.

### Key Entities *(include if feature involves data)*

- **User**:
    - `id`: Unique identifier (UUID).
    - `name`: User's full name.
    - `email`: User's email address (unique).
    - `password`: Hashed password.
    - `isAdmin`: Boolean flag indicating administrative privileges.
    - `image`: Optional profile image URL.
    - `emailVerified`: Timestamp of email verification.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin can successfully create a new user account that can immediately log in.
- **SC-002**: Admin can successfully delete a user account, preventing subsequent logins for that user.
- **SC-003**: Admin can successfully toggle the `isAdmin` status of a user, granting or revoking management privileges.
- **SC-004**: A user's password change results in the immediate invalidation of the old password for login.
- **SC-005**: Non-admin users are denied access when attempting to use user management features.
