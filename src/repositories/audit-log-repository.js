import { getSupabaseClient } from '../lib/supabase-client.js';
import { ACTIONS } from '../constants.js';
import { ValidationError } from '../errors/api-errors.js';
import { assertPositiveInteger } from '../validators/assert-positive-integer.js';

const DECISION_ACTIONS = ['APPROVE', 'REJECT', 'ESCALATE'];

// Repository pattern: the only module that issues Postgres queries against
// kyc_audit_log. That table is append-only at the database level (triggers
// reject UPDATE/DELETE) — this repository only ever inserts or selects,
// deliberately, so the guarantee holds in code as well as in the schema.
export class AuditLogRepository {
  constructor(client = getSupabaseClient()) {
    this.client = client;
  }

  async record({ actor, action, entityId, details }) {
    const { data, error } = await this.client
      .from('kyc_audit_log')
      .insert({ actor, action, entity_table: 'KYC', entity_id: entityId, details })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // VIEW is excluded on purpose — merely having looked at a case shouldn't
  // block that same person from later approving or rejecting it. Only a
  // prior decision counts for maker-checker.
  async findLastDecisionActor(entityId) {
    const { data, error } = await this.client
      .from('kyc_audit_log')
      .select('actor')
      .eq('entity_table', 'KYC')
      .eq('entity_id', entityId)
      .in('action', DECISION_ACTIONS)
      .order('occurred_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? data.actor : null;
  }

  async query({ entityId, action, limit = 50 } = {}) {
    if (action && !ACTIONS.includes(action)) {
      throw new ValidationError('invalid action');
    }
    if (entityId !== undefined) {
      assertPositiveInteger(entityId, 'entity_id');
    }
    const clampedLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);

    let query = this.client
      .from('kyc_audit_log')
      .select('*')
      .order('occurred_at', { ascending: false })
      .limit(clampedLimit);
    if (entityId !== undefined) query = query.eq('entity_id', entityId);
    if (action) query = query.eq('action', action);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
}
