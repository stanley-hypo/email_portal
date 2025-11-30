# Quickstart: User Management

## Prerequisites

- Ensure database is running.
- Ensure you have an admin user (seed script or manual DB update).

## Setup

1.  **Migration**:
    ```bash
    npx drizzle-kit push
    ```
    This will add the `isAdmin` column to the `users` table.

2.  **Create Admin User**:
    If you don't have an admin user, you can use the seed script or manually update a user in the database:
    ```sql
    UPDATE "user" SET "isAdmin" = true WHERE email = 'your-email@example.com';
    ```

## Usage

1.  **Login**: Log in with your admin account.
2.  **Navigate**: Go to `/portal/users` (or the configured route).
3.  **Manage**: You should see the user list and buttons to Create, Edit, Delete.

## Verification

- Try to access `/portal/users` as a non-admin user -> Should be redirected or see 403.
- Create a new user -> Should appear in the list and be able to log in.
- Delete a user -> Should be removed and unable to log in.
