# ORA eBook Publishing Workflow (Implemented)

This repo now supports the **full ORA eBook Publishing workflow**:

## Status flow (ebooks.status)

- `DRAFT` → `SUBMITTED` → `SCREENING` → `UNDER_REVIEW` → `ACCEPTED` → `FINANCE_PENDING|FINANCE_CLEARED` → `IN_PRODUCTION` → `PUBLISHED`

> Notes
> - `ACCEPTED` is set by editor decision.
> - Finance module moves `ACCEPTED` → `FINANCE_CLEARED` (or `FINANCE_PENDING`).
> - Digital Content Manager uploads final outputs, sets `IN_PRODUCTION`.
> - Publish sets `PUBLISHED` and writes publication metadata.

## Assignment flow (review_assignments.status)

- `PENDING` → `ACCEPTED` → `COMPLETED` (or `PENDING` → `DECLINED`)

## New DB tables
Run this SQL on PostgreSQL:

- `backend/src/ebooks/sql/ora_ebook_publishing_extension.sql`

## New API endpoints
All are under `/api/ebooks`.

### Finance
- `GET  /api/ebooks/finance/pending`
- `POST /api/ebooks/:id/finance/decision`
  - body: `{ "action": "clear" | "waive" | "decline", "amount"?, "currency"?, "reference"?, "note"? }`

### Production + Publication
- `GET  /api/ebooks/production/queue`
- `POST /api/ebooks/:id/production/upload-final` (multipart)
  - fields: `pdf` (optional), `epub` (optional), `cover` (optional)
- `POST /api/ebooks/:id/production/publish`
  - body: `{ "isbn"?, "doi"?, "access_type": "OPEN"|"RESTRICTED"|"EMBARGO", "embargo_until"? }`

### Public library
- `GET /api/ebooks/public?q=...`
- `GET /api/ebooks/public/:id`
- `GET /api/ebooks/public/:id/download?type=pdf|epub`

## Frontend pages
- Finance queue: `/ebook/finance/pending`
- Production queue: `/ebook/production/queue`
- Public library: `/ebook/library`
- Public ebook detail: `/ebook/library/:id`
