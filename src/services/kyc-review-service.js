import { ConflictError } from '../errors/api-errors.js';
import { getDecisionStrategy } from '../strategies/kyc-decision-strategies.js';

// Service layer: the only place that orchestrates a full use case end to
// end. Depends on repository abstractions handed to it by the caller
// (Dependency Inversion) rather than reaching for a concrete database
// client itself — routes never touch a repository directly either.
export class KycReviewService {
  constructor({ kycCaseRepository, auditLogRepository }) {
    this.kycCaseRepository = kycCaseRepository;
    this.auditLogRepository = auditLogRepository;
  }

  async listCases({ entityType } = {}) {
    return this.kycCaseRepository.findAll({ entityType });
  }

  async viewCase(id, actor) {
    const kycCase = await this.kycCaseRepository.findById(id);
    try {
      await this.auditLogRepository.record({
        actor,
        action: 'VIEW',
        entityId: kycCase.id,
        details: { customer: kycCase.customer_name },
      });
    } catch (err) {
      // A read is allowed to succeed even if logging it fails — this is
      // the one place in the service where that's true. Every decision
      // below is held to a stricter standard.
      console.error('failed to record VIEW audit event', err);
    }
    return kycCase;
  }

  async decide(actionName, id, actor, body) {
    const strategy = getDecisionStrategy(actionName);
    const kycCase = await this.kycCaseRepository.findById(id);

    strategy.assertTransitionAllowed(kycCase.account_status);

    const lastActor = await this.auditLogRepository.findLastDecisionActor(kycCase.id);
    if (lastActor === actor) {
      throw new ConflictError(
        `maker-checker violation: same reviewer cannot both act on and ${strategy.verb} this case`
      );
    }

    const extra = strategy.validatePayload(body);

    // The audit entry is written before the case is updated, not after.
    // If this insert fails, the request fails here and the case is left
    // untouched. An unaudited state change is a worse failure mode for a
    // compliance system than a decision that didn't take effect at all.
    await this.auditLogRepository.record({
      actor,
      action: strategy.action,
      entityId: kycCase.id,
      details: strategy.buildDetails(kycCase.account_status, extra),
    });

    return this.kycCaseRepository.updateStatus(kycCase.id, strategy.statusFields());
  }

  async listAuditLog(filters) {
    return this.auditLogRepository.query(filters);
  }
}
