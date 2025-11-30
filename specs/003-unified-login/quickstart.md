# Quickstart: Unified Login

**Feature**: Unified Login
**Date**: 2025-11-30

## Prerequisites

- Node.js 20+
- PostgreSQL database (running)
- `.env` file configured with `DATABASE_URL` and `AUTH_SECRET`

## Installation

```bash
npm install
```

## Database Setup

```bash
npm run db:seed
```
*Note: Ensure the seed script creates a default user for testing.*

## Running the Application

```bash
npm run dev
```
Access the application at `http://localhost:23000`.

## Testing the Feature

### 1. Login Flow
1. Navigate to `http://localhost:23000/login`.
2. Enter valid credentials (e.g., from seed data).
3. Verify redirection to `/portal`.

### 2. Portal Access
1. On `/portal`, verify links to "SMTP Manager" and "PDF Manager".
2. Click "SMTP Manager" -> should go to `/smtp`.
3. Click "PDF Manager" -> should go to `/pdf`.

### 3. Route Protection
1. Logout.
2. Try to access `/portal` directly -> should redirect to `/login`.
3. Try to access `/smtp` directly -> should redirect to `/login`.
4. Try to access `/pdf` directly -> should redirect to `/login`.

## Troubleshooting

- **Redirect Loop**: Check `auth.config.ts` logic.
- **Database Connection Error**: Verify `DATABASE_URL` in `.env`.
- **"Unauthorized" API Error**: Ensure session cookie is being sent with requests.
