# API Contracts: Unified Login

**Feature**: Unified Login
**Date**: 2025-11-30

## Internal API Routes

These routes are protected by NextAuth session.

### SMTP Configurations

- **GET** `/api/smtp-configs`
  - **Auth**: Required (Session)
  - **Response**: `SmtpConfig[]`

- **POST** `/api/smtp-configs`
  - **Auth**: Required (Session)
  - **Body**: `SmtpConfig` (minus ID)
  - **Response**: `SmtpConfig`

### PDF Configurations

- **GET** `/api/pdf-configs`
  - **Auth**: Required (Session)
  - **Response**: `PdfConfig[]`

- **POST** `/api/pdf-configs`
  - **Auth**: Required (Session)
  - **Body**: `PdfConfig` (minus ID)
  - **Response**: `PdfConfig`

## Authentication Routes (NextAuth)

- **GET/POST** `/api/auth/*`
  - Handled by NextAuth.js
  - `/api/auth/signin`: Initiates login
  - `/api/auth/signout`: Initiates logout
  - `/api/auth/session`: Returns current session
