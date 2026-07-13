# kyc-api

## Presentation

[Watch the presentation](presentation/Retool%20vs%20Devon%20Internal%20Tools.mp4)

#### Video
<video src="presentation/Retool%20vs%20Devon%20Internal%20Tools.mp4" controls width="720">
  Video won't play inline here — watch it directly:
  <a href="presentation/Retool vs Devon Internal Tools.mp4">presentation/Retool vs Devon Internal Tools.mp4</a>
</video>

## About

The backend for the KYC review queue. Retool is the screen a reviewer looks
at; this service is the only thing allowed to talk to the database. It
decides whether approving, rejecting, or escalating a case is actually legal,
writes that decision to an append-only audit log, and only then updates the
case.

Backing store: Supabase Postgres, two tables — `KYC` (case data) and
`kyc_audit_log` (append-only, enforced by a DB trigger that rejects
UPDATE/DELETE even for the service-role key).

See [architecture.md](architecture.md) for the full design writeup.

## Running it

1. Install dependencies:

   ```
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your Supabase project URL,
   service-role key, and a shared secret:

   ```
   cp .env.example .env
   ```

3. Start the server:

   ```
   npm start
   ```

It listens on `PORT` (default `3000`). Every request under `/api` needs an
`X-Demo-Key` header matching `DEMO_API_KEY`, and an `X-Reviewer-Email` header
naming who's making the request.

Node.js with native `WebSocket` is preferred but not required — the Supabase
client explicitly uses the `ws` package as its realtime transport, so this
also runs on older Node versions.

## Layout

Layered: routes (HTTP) → service (use cases) → repositories (data access),
with strategy objects for the three KYC decisions.

- `src/server.js` — composition root; wires repositories, service, routes,
  and the middleware chain together, then starts the listener
- `src/routes/kyc-cases.js`, `src/routes/audit-log.js` — thin HTTP adapters;
  each exports a factory function that takes the service and returns a
  configured router
- `src/services/kyc-review-service.js` — orchestrates each use case
  (view/approve/reject/escalate/list) against the repositories it's handed
- `src/repositories/kyc-case-repository.js`, `src/repositories/audit-log-repository.js`
  — the only modules that issue Postgres queries, one per table
- `src/strategies/kyc-decision-strategies.js` — approve/reject/escalate as
  interchangeable strategies sharing one algorithm shape
- `src/middleware/auth.js`, `src/middleware/actor.js` — shared-secret and
  reviewer-identity gates, applied to every `/api` route
- `src/middleware/error-handler.js` — terminal error handler; maps typed
  errors (`src/errors/api-errors.js`) to HTTP status codes in one place
- `src/validators/status-transitions.js` — legal KYC status state machine
- `src/validators/assert-positive-integer.js` — shared id-validation guard
- `src/lib/supabase-client.js` — Supabase client singleton, service-role
  key, never imported outside the repository layer
