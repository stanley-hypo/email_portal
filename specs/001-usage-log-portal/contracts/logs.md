# API Contracts: Usage Logs

**Feature**: Usage Logging for PDFs and Emails  
**Date**: 2025-12-08

## Authentication

- All routes require authenticated session via NextAuth.  
- Access limited to roles: admin/compliance/support (enforced server-side).

## Endpoints

### GET `/api/logs`
- **Description**: Fetch paginated usage logs with filters.  
- **Query Params**:  
  - `recordType` (pdf|email, optional)  
  - `recordId` (string, optional)  
  - `eventType` (string or comma list, optional)  
  - `actor` (string: user id or email, optional)  
  - `recipient` (string email, optional; email events only)  
  - `status` (string, optional; email events only)  
  - `from` / `to` (ISO datetime, optional)  
  - `page` (number, default 1)  
  - `pageSize` (number, default 20, max 100)  
  - `sort` (e.g., `createdAt:desc` default)
- **Response**:  
  ```json
  {
    "items": [
      {
        "id": "uuid",
        "recordId": "string",
        "recordType": "pdf|email",
        "eventType": "pdf_view|pdf_download|pdf_print|email_sent|email_delivered|email_opened|email_bounced|email_failed",
        "actorId": "uuid|null",
        "actorEmail": "string|null",
        "recipientEmail": "string|null",
        "status": "string|null",
        "source": "portal|worker|api",
        "metadata": { "messageId": "string", "ip": "string", "userAgent": "string" },
        "createdAt": "ISO8601"
      }
    ],
    "page": 1,
    "pageSize": 20,
    "total": 120
  }
  ```
- **Errors**: `401 Unauthorized` (no session), `403 Forbidden` (insufficient role), `400` (invalid filters).

### GET `/api/logs/export`
- **Description**: Export filtered logs as CSV based on same filters as `/api/logs`.  
- **Query Params**: Same as `/api/logs`.  
- **Response**: `text/csv` stream; columns match visible grid (id, recordId, recordType, eventType, actor, recipientEmail, status, source, createdAt).  
- **Errors**: `401`, `403`, `400`.  
- **Notes**: Server enforces export size limits (e.g., max 10k rows) to protect performance; requests exceeding limit return `413` with guidance to narrow filters.

## Event Emission (internal helpers)

- **Function**: `logUsageEvent(event)` (server-only)  
  - **Input**: `{ recordId, recordType, eventType, actorId?, actorEmail?, recipientEmail?, status?, source, metadata? }`  
  - **Behavior**: Validates against allowed event/record types, enriches with timestamp, persists via Drizzle.  
  - **Errors**: Throws on missing required fields or unauthorized source usage; caller must handle.

