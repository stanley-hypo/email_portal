# Research: Usage Logging for PDFs and Emails

**Feature**: Usage Logging for PDFs and Emails  
**Date**: 2025-12-08

## Decisions

### 1) Event taxonomy and fields
**Decision**: Use a single `usage_logs` table with `record_type` (pdf|email), `record_id`, `event_type`, `actor_id/actor_email`, `recipient_email` (email events), `status`, `source` (portal/api/worker), `metadata` (JSON for user agent/ip/message-id), and `created_at`.  
**Rationale**: Unifies audit querying across PDFs and emails while preserving channel-specific data; keeps schema simple for filtering and export.  
**Alternatives Considered**: Separate tables per channel (adds JOIN complexity for mixed queries); fully denormalized text log (harder to filter and index).

### 2) Event sources and ingestion path
**Decision**: Emit events from existing flows: PDF view/download/print hooks in portal pages, email send/delivery/open/bounce from worker (BullMQ + Nodemailer callbacks), and API routes wrapping these actions. Persist via Drizzle helpers to the shared table.  
**Rationale**: Leverages current pipelines without adding new services; keeps latency low and minimizes changes to user flows.  
**Alternatives Considered**: Dedicated logging microservice (overkill for scope); client-only logging (unreliable, no trust for compliance).

### 3) Freshness and buffering
**Decision**: Write events synchronously in server actions/route handlers for portal-driven PDF access; write asynchronously from worker for email lifecycle events, with portal display targeting <5 minutes freshness.  
**Rationale**: Access events must appear immediately for audits; email webhooks/worker callbacks are naturally async and acceptable within spec freshness SLA.  
**Alternatives Considered**: Full async buffering for all events (could delay critical access logs); synchronous email webhook writes (possible but depends on provider timing, little benefit).

### 4) Queryability and indexing
**Decision**: Paginate by `created_at DESC`; index on (`record_type`, `record_id`), (`created_at`), and (`event_type`, `record_type`) to support filters.  
**Rationale**: Matches primary filters (record, time, event type) and keeps queries within 3s target for ~5k events/30 days.  
**Alternatives Considered**: Full-text search (unneeded for structured filters); separate rollup tables (premature for current volumes).

### 5) Access control
**Decision**: Reuse NextAuth session/role checks; restrict viewing/export to admin/compliance/support roles.  
**Rationale**: Aligns with existing auth; minimizes new RBAC surface.  
**Alternatives Considered**: Custom ACL per record (not required in spec); IP-allowlist (could be added later if needed).

## Unknowns & Clarifications

- None pending; all needed defaults are established above. Freshness target set to <5 minutes; retention follows governance as noted in spec assumptions.

