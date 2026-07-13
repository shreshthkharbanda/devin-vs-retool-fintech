import { ConflictError, ValidationError } from '../errors/api-errors.js';
import { isValidTransition } from '../validators/status-transitions.js';

// Strategy pattern: APPROVE, REJECT, and ESCALATE share one algorithm shape
// (validate the transition, check maker-checker, update, log) and differ
// only in target status, payload validation, and the recorded details. The
// shared orchestration lives once, in KycReviewService; each strategy below
// supplies only what's actually different between the three.
class KycDecisionStrategy {
  constructor({ action, targetStatus, verb }) {
    this.action = action;
    this.targetStatus = targetStatus;
    this.verb = verb;
  }

  // Override in strategies that require a request body (reject, escalate).
  validatePayload(_body) {
    return {};
  }

  assertTransitionAllowed(currentStatus) {
    if (!isValidTransition(currentStatus, this.targetStatus)) {
      throw new ConflictError(`cannot transition from ${currentStatus} to ${this.targetStatus}`);
    }
  }

  buildDetails(previousStatus, extra) {
    return { previous_status: previousStatus, new_status: this.targetStatus, ...extra };
  }
}

class ApproveStrategy extends KycDecisionStrategy {
  constructor() {
    super({ action: 'APPROVE', targetStatus: 'verified', verb: 'approve' });
  }

  statusFields() {
    return { account_status: 'verified', is_verified: true };
  }
}

class RejectStrategy extends KycDecisionStrategy {
  constructor() {
    super({ action: 'REJECT', targetStatus: 'rejected', verb: 'reject' });
  }

  validatePayload(body) {
    const reason = body?.reason;
    if (!reason || typeof reason !== 'string' || reason.trim() === '') {
      throw new ValidationError('reason is required');
    }
    return { reason };
  }

  statusFields() {
    return { account_status: 'rejected' };
  }
}

class EscalateStrategy extends KycDecisionStrategy {
  constructor() {
    super({ action: 'ESCALATE', targetStatus: 'under_review', verb: 'escalate' });
  }

  validatePayload(body) {
    const escalatedTo = body?.escalated_to;
    if (!escalatedTo || typeof escalatedTo !== 'string' || escalatedTo.trim() === '') {
      throw new ValidationError('escalated_to is required');
    }
    return { escalated_to: escalatedTo };
  }

  statusFields() {
    return { account_status: 'under_review' };
  }
}

const STRATEGIES = {
  approve: new ApproveStrategy(),
  reject: new RejectStrategy(),
  escalate: new EscalateStrategy(),
};

// Factory Method: callers ask for a strategy by name and never construct
// one directly — adding a fourth decision type means adding one class and
// one registry entry, not touching the service.
export function getDecisionStrategy(name) {
  const strategy = STRATEGIES[name];
  if (!strategy) throw new Error(`no decision strategy registered for "${name}"`);
  return strategy;
}
