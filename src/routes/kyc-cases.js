// Responsibility (all reads/writes go through src/lib/supabase.js, never
// direct):
//   GET  /api/kyc-cases          list cases for the queue table
//   GET  /api/kyc-cases/:id      case detail — logs a VIEW audit row
//   POST /api/kyc-cases/:id/approve   validate transition, maker-checker
//        check (reject if req.actor === last actor on this case), update
//        account_status, logs APPROVE with previous/new status
//   POST /api/kyc-cases/:id/reject    same shape, requires `reason` in body
//   POST /api/kyc-cases/:id/escalate  sets under_review, logs ESCALATE with
//        an assigned senior reviewer
