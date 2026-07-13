# kyc-api

The owned API layer between Retool and Supabase. Retool never gets a database
credential and never gets a Resource pointed at Postgres directly — it only
calls the routes in this service. That's what lets us log things Retool's
native audit log structurally can't (e.g. "who viewed this specific case"),
and what lets maker-checker / status-transition rules live in reviewable code
instead of a Retool query block.

Backing store: Supabase Postgres, two tables already created and seeded —
`KYC` (case data) and `kyc_audit_log` (append-only audit trail, enforced by
DB triggers that reject UPDATE/DELETE even for the service-role key).

## Layout

- `src/server.js` — entry point, mounts middleware + routes, starts listener
- `src/routes/kyc-cases.js` — case list/detail/approve/reject/escalate
- `src/routes/audit-log.js` — read-only paginated view over kyc_audit_log
- `src/middleware/auth.js` — shared-secret header gate
- `src/middleware/actor.js` — extracts reviewer identity from request
- `src/middleware/audit-log.js` — auto-writes an audit row after each handled request
- `src/validators/status-transitions.js` — legal KYC status state machine
- `src/lib/supabase.js` — Supabase client, service-role key, never exposed past this file
- `public/log-viewer.html` — optional CloudWatch-style live viewer, separate from Retool

## Not written yet

Every file above is a stub with a responsibility comment only. Nothing here
runs yet.
