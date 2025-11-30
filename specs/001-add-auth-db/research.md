# Research: Add Auth & DB

**Feature**: Add Auth & DB (001-add-auth-db)
**Date**: 2025-11-30

## Topic 1: NextAuth.js v5 Integration

**Decision**: Use NextAuth.js v5 (Auth.js) with `next-auth` package. Use `credentials` provider for email/password login.

**Rationale**:
- v5 is the latest and supports Next.js App Router natively.
- `credentials` provider is required for email/password login as per requirements.
- We will use JWT session strategy for performance and simplicity, but we will still connect to the DB to verify credentials.

**Alternatives Considered**:
- **NextAuth v4**: Older, less support for App Router.
- **Clerk/Auth0**: External services, but requirements specify "NextAuth" and "PostgreSQL".

## Topic 2: Database & ORM Setup

**Decision**: Use `drizzle-orm` with `pg` (node-postgres) driver.

**Rationale**:
- Drizzle is lightweight, type-safe, and has great performance.
- `pg` is the standard PostgreSQL driver for Node.js.
- `drizzle-kit` will be used for migrations.

**Alternatives Considered**:
- **Prisma**: Heavier, generated client can be large. Drizzle is requested in spec.
- **TypeORM**: Less type-safe, older.

## Topic 3: Password Hashing

**Decision**: Use `bcryptjs`.

**Rationale**:
- Industry standard for password hashing in Node.js.
- Easy to integrate.

**Alternatives Considered**:
- **Argon2**: Better security but requires native bindings which can be tricky in some environments (though usually fine). `bcryptjs` is pure JS (slower but portable) or `bcrypt` (native). `bcryptjs` is sufficient for this scope.

## Topic 4: Project Structure for DB

**Decision**:
- `src/db/index.ts`: Database connection export.
- `src/db/schema.ts`: Drizzle schema definitions.
- `drizzle.config.ts`: Drizzle Kit configuration in root.

**Rationale**:
- Keeps database logic centralized.
- Separating schema allows for easy importing in other files without circular dependencies.
