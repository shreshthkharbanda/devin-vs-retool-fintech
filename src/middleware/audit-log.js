// Responsibility: after a route handler succeeds, write one row into
// kyc_audit_log — req.actor, an action name the route sets (e.g. "VIEW",
// "APPROVE"), entity_table "KYC", entity_id, and a details JSON blob the
// route provides (old/new status, reason, etc). Fires on GET /:id too —
// that's the point: reads get audited, not just writes.
