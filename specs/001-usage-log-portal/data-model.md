# Data Model: Usage Logging for PDFs and Emails

## Entities and Schema

### `usage_logs` (new)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | auto | Primary key |
| `record_id` | uuid/text | No | — | Identifier of PDF or email record |
| `record_type` | enum(`pdf`,`email`) | No | — | Distinguishes channel |
| `event_type` | text/enum | No | — | `pdf_view`, `pdf_download`, `pdf_print`, `email_sent`, `email_delivered`, `email_opened`, `email_bounced`, `email_failed` |
| `actor_id` | uuid | Yes | — | Portal user id when known |
| `actor_email` | text | Yes | — | Actor email when id not available |
| `recipient_email` | text | Yes | — | For email events |
| `status` | text/enum | Yes | — | Delivery status (e.g., delivered, bounced, failed) |
| `source` | text | Yes | — | Origin of event (portal, worker, api) |
| `metadata` | jsonb | Yes | `{}` | Extra structured context (e.g., messageId, userAgent, ip) |
| `created_at` | timestamptz | No | now() | Event timestamp |

### Relationships

- `record_id` references PDF records or email records (existing tables/identifiers).  
- `actor_id` references `user` table (optional for anonymous/unauthenticated opens).  
- No cascades on delete; logs remain immutable for audit.

### Indexing

- Composite index (`record_type`, `record_id`, `created_at DESC`) for record-level timelines.  
- Index on `created_at DESC` for recent activity and pagination.  
- Index on (`event_type`, `record_type`) for filtered queries.  
- Optional index on `recipient_email` to speed recipient investigations.

## Validation Rules

- `record_type` must be one of `pdf` or `email`.  
- `event_type` must match the allowed set for the given `record_type`.  
- `created_at` is required; defaults to current timestamp when not provided.  
- `actor_id` and `actor_email` are mutually optional but at least one identifier (actor or recipient) should exist per event.  
- `recipient_email` required for email events; omitted for PDF events.  
- `status` required for email delivery/bounce/failed; optional for PDF events.  
- `metadata` must be JSON-serializable; avoid PII beyond what is required for audit (e.g., do not store full IP if governance forbids—truncate if needed).  
- All writes must occur server-side (no client trust for event integrity).  
- Logs are immutable: no updates after insert; deletes only via retention policies.

## State Transitions (email events)

- `email_sent` → `email_delivered` or `email_bounced` or `email_failed`  
- `email_delivered` may lead to `email_opened` (multiple opens allowed; each logged)  
- `email_bounced`/`email_failed` are terminal for delivery.

## Data Retention

- Retain logs per organization governance; portal should indicate when queried ranges exceed stored data.

