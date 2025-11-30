# Data Model: Unified Login

**Feature**: Unified Login
**Date**: 2025-11-30

## Entities

### User (Database)

Stored in PostgreSQL, managed via Drizzle ORM.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary Key |
| `name` | Text | No | Display name |
| `email` | Text | Yes | Unique identifier for login |
| `password` | Text | No | Hashed password (bcrypt) |
| `emailVerified` | Timestamp | No | Verification status |
| `image` | Text | No | Avatar URL |

### Session (Database)

Managed by NextAuth.js.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sessionToken` | Text | Yes | Primary Key |
| `userId` | UUID | Yes | Foreign Key to User |
| `expires` | Timestamp | Yes | Expiration time |

### SMTP Configuration (File-based)

Stored in JSON file (via `utils/fileUtils`).

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier |
| `name` | String | Configuration name |
| `host` | String | SMTP Host |
| `port` | Number | SMTP Port |
| `username` | String | SMTP Username |
| `password` | String | SMTP Password |
| `fromEmail` | String | Sender Email |
| `secure` | Boolean | SSL/TLS status |

### PDF Configuration (File-based)

Stored in JSON file.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier |
| `name` | String | Configuration name |
| `ipWhitelist` | Array<String> | Allowed IPs |
| `authTokens` | Array<Object> | API Tokens |

## Relationships

- **User** has many **Sessions** (1:N)
- **User** manages **SMTP Configurations** (Access Control)
- **User** manages **PDF Configurations** (Access Control)
