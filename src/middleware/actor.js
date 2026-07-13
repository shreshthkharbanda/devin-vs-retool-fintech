// Responsibility: read X-Reviewer-Email off the request (stand-in for what
// SSO would give you for real), reject if missing, attach as req.actor for
// every downstream handler and the audit-log middleware to use.
