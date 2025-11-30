# Research: User Management

## Unknowns & Clarifications

None identified. The stack is well-defined and the requirements are standard.

## Technology Decisions

### Authentication & Authorization
- **Decision**: Use existing NextAuth.js v5 setup.
- **Implementation**:
    - Extend `users` table schema with `isAdmin` (boolean, default false).
    - Update NextAuth `jwt` and `session` callbacks to expose `isAdmin` in the session object.
    - Use `auth()` helper in Server Components and Server Actions to verify admin status.

### Database
- **Decision**: Use Drizzle ORM with PostgreSQL.
- **Implementation**:
    - Modify `src/db/schema.ts` to add `isAdmin` column.
    - Run `drizzle-kit push` or generate migration (depending on project workflow, likely push for dev).

### User Interface
- **Decision**: Use Mantine components.
- **Implementation**:
    - Create `/portal/users` (or similar) route for the user list.
    - Use `Table` for listing users.
    - Use `Modal` + `Form` for Create/Edit user.
    - Use `PasswordInput` for password fields.

### Password Management
- **Decision**: Use `bcryptjs` for hashing (consistent with existing auth).
- **Implementation**:
    - Hash passwords before saving to DB.
    - Allow self-update via profile page (or separate settings modal).
    - Allow admin-reset via user management list.

## Alternatives Considered

- **RBAC Library**: Considered using a full RBAC library (e.g., CASL), but for a simple boolean `isAdmin` check, it's overkill.
- **Separate Admin Portal**: Considered a completely separate app for admin, but integrated `/portal` with role checks is simpler and sufficient.
