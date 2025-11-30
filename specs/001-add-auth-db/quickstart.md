# Quickstart: Add Auth & DB

**Feature**: Add Auth & DB (001-add-auth-db)

## Prerequisites

- PostgreSQL database running.
- `.env` file configured with `DATABASE_URL` and `AUTH_SECRET`.

## Setup

1. **Install Dependencies**:
   ```bash
   npm install drizzle-orm next-auth@beta pg @neondatabase/serverless bcryptjs
   npm install -D drizzle-kit @types/pg @types/bcryptjs
   ```
   *(Note: Adjust packages based on exact driver choice, e.g., `pg` vs `@neondatabase/serverless`)*

2. **Environment Variables**:
   Add to `.env`:
   ```env
   DATABASE_URL="postgres://user:pass@localhost:5432/dbname"
   AUTH_SECRET="your-secret-key" # Generate with `openssl rand -base64 32`
   ```

## Database Migration

1. **Generate Migration**:
   ```bash
   npx drizzle-kit generate
   ```

2. **Run Migration**:
   ```bash
   npx drizzle-kit migrate
   ```

## Testing

1. **Create Test User**:
   Use the provided seed script (to be created) or manually insert a user into the `user` table with a hashed password.

2. **Login**:
   Navigate to `/login` and enter the credentials.
