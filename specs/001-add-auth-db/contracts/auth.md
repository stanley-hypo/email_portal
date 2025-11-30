# Auth Contracts

**Feature**: Add Auth & DB (001-add-auth-db)

## NextAuth Endpoints

The system uses NextAuth.js which exposes the following standard endpoints at `/api/auth/*`:

### POST /api/auth/signin/credentials

Initiates a login session using email and password.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "plain_password",
  "redirect": false,
  "callbackUrl": "/"
}
```

**Response (Success)**:
```json
{
  "ok": true,
  "url": "..."
}
```

**Response (Failure)**:
```json
{
  "ok": false,
  "error": "CredentialsSignin",
  "status": 401,
  "url": null
}
```

### POST /api/auth/signout

Terminates the current session.

### GET /api/auth/session

Retrieves the current session object.

**Response**:
```json
{
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "image": "..."
  },
  "expires": "2025-12-01T00:00:00.000Z"
}
```
