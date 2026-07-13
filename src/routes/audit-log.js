// Responsibility:
//   GET /api/audit-log?entity_id=&action=&limit=&before=
//   Read-only, paginated, over kyc_audit_log ordered by occurred_at desc.
//   This route itself is not audited (reading the audit log isn't a KYC
//   action) but should still require auth + actor middleware like everything
//   else.
