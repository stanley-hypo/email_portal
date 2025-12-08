# Quickstart: Usage Logging for PDFs and Emails

## Prerequisites

- PostgreSQL available and configured (.env values present).  
- Run migrations to add `usage_logs` table.

## Setup

1) **Apply migration**  
```bash
npx drizzle-kit push
```  
Confirms `usage_logs` table and indexes are created.

2) **Configure roles**  
Ensure admin/compliance/support roles exist in the auth system so authorized users can view/export logs.

3) **Wire event emitters**  
- PDF flows: add event calls on view/download/print points in portal PDF pages.  
- Email flows: emit send/deliver/open/bounce/failed events from `emailWorker.ts` or webhook handlers.

## Usage

1) Log in as an authorized user.  
2) Navigate to `/portal/logs`.  
3) Filter by date range, event type, record type, actor, or recipient.  
4) Export the filtered results via the export action (CSV).

## Verification

- View a PDF and confirm a `pdf_view` entry appears immediately.  
- Send a test email and confirm `email_sent` then `email_delivered` (or `email_bounced`) entries appear within 5 minutes.  
- Apply filters for a date range and event type; ensure results and total counts update.  
- Export after filtering; verify CSV rows and columns match the on-screen results.  
- Attempt access with an unauthorized user; expect 403 or redirect with no data leakage.
- After investigations, capture support/compliance feedback (e.g., note success/blocked in your support log or survey) to measure self-serve resolution rate.

