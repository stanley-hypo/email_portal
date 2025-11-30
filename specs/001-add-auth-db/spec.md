# Feature Specification: Add Auth & DB

**Feature Branch**: `001-add-auth-db`
**Created**: 2025-11-30
**Status**: Draft
**Input**: User description: "加db Postresql 入project 用 drizzle-orm 加埋 next-auth 做 login 取代現在 login"

## Assumptions

- A PostgreSQL database instance is available or can be provisioned.
- The development environment supports Node.js and Next.js.
- Environment variables for database connection and auth secrets will be managed securely.


## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Login (Priority: P1)

As a user, I want to log in to the application using my email and password so that I can access protected resources.

**Why this priority**: Authentication is the gateway to the application and is required to replace the current login system.

**Independent Test**: Can be tested by navigating to the login page, entering credentials, and verifying redirection to the dashboard/home page.

**Acceptance Scenarios**:

1. **Given** a registered user with valid credentials, **When** they enter their email and password on the login page, **Then** they are authenticated and redirected to the home page.
2. **Given** a user with invalid credentials, **When** they attempt to log in, **Then** they see an error message and remain on the login page.
3. **Given** an unauthenticated user, **When** they access a protected route, **Then** they are redirected to the login page.

---

### User Story 2 - System Data Storage (Priority: P1)

As a developer, I want the application to connect to a persistent data store so that user data and application state are preserved.

**Why this priority**: A robust database is foundational for storing user data.

**Independent Test**: Can be tested by running a script that performs a basic CRUD operation and verifying the data in the database.

**Acceptance Scenarios**:

1. **Given** the application is started, **When** it attempts to connect to the database, **Then** the connection is established successfully without errors.
2. **Given** a schema definition, **When** a migration is run, **Then** the corresponding tables are created in the database.

---

### User Story 3 - Session Persistence (Priority: P2)

As a user, I want my login session to persist so that I don't have to log in every time I refresh the page.

**Why this priority**: Enhances user experience by maintaining state.

**Independent Test**: Log in, refresh the page, and verify the user is still authenticated.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they refresh the browser, **Then** they remain logged in.
2. **Given** a logged-in user, **When** they click logout, **Then** their session is terminated and they are redirected to the login page.

### Edge Cases

- **Database Down**: If the database is unreachable, the application should handle the error gracefully (e.g., show a 500 error page or maintenance mode) rather than crashing.
- **Invalid Session**: If a user's session token is invalid or expired, they should be redirected to the login page immediately upon the next request.
- **Duplicate Email**: If a user tries to register (if registration is added) with an existing email, the system should prevent it and show a clear error.
- **Migration Failure**: If a database migration fails, the deployment/startup process should halt and report the error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST use PostgreSQL as the primary relational database.
- **FR-002**: System MUST use Drizzle ORM for all database interactions (schema definition, queries, migrations).
- **FR-003**: System MUST implement authentication using NextAuth.js (v5 or latest stable).
- **FR-004**: System MUST support the Credentials provider for email and password authentication.
- **FR-005**: System MUST replace the existing login implementation at `/login` with the NextAuth-based flow.
- **FR-006**: System MUST securely hash passwords before storing them in the database (e.g., using bcrypt).
- **FR-007**: System MUST provide a mechanism (e.g., script or migration) to initialize the database schema.
- **FR-008**: System MUST protect sensitive routes (e.g., `/dashboard`, `/settings`) and only allow access to authenticated users.

### Key Entities *(include if feature involves data)*

- **User**: Represents a system user.
    - `id`: Unique identifier (UUID or Auto-increment).
    - `name`: User's full name (optional).
    - `email`: User's email address (unique, required).
    - `password`: Hashed password (required for credentials auth).
    - `image`: URL to user's avatar (optional).
    - `emailVerified`: Timestamp of email verification (optional).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully log in using the new implementation with a valid email and password.
- **SC-002**: The application successfully connects to the PostgreSQL instance.
- **SC-003**: Database migrations can be generated and executed.
- **SC-004**: The existing manual login logic is fully deprecated and replaced by the new auth flow.
- **SC-005**: 100% of protected routes redirect unauthenticated users to the login page.
- **SC-006**: Login process completes in under 2 seconds (excluding network latency).
