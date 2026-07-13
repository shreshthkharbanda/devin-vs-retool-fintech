const ALLOWED = {
  pending: ['verified', 'rejected', 'under_review'],
  under_review: ['verified', 'rejected'],
  verified: [],
  rejected: [],
};

// Returns true/false. Does not throw, does not touch the database.
export function isValidTransition(fromStatus, toStatus) {
  return Boolean(ALLOWED[fromStatus]?.includes(toStatus));
}
