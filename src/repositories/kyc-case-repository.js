import { getSupabaseClient } from '../lib/supabase-client.js';
import { NotFoundError, ValidationError } from '../errors/api-errors.js';
import { assertPositiveInteger } from '../validators/assert-positive-integer.js';
import { ENTITY_TYPES } from '../constants.js';

// Repository pattern: the only module that issues Postgres queries against
// the KYC table. Everything upstream (KycReviewService) depends on this
// class's method contract, never on the Supabase client directly —
// swapping the backing store means changing this file alone.
export class KycCaseRepository {
  constructor(client = getSupabaseClient()) {
    this.client = client;
  }

  async findAll({ entityType } = {}) {
    if (entityType && !ENTITY_TYPES.includes(entityType)) {
      throw new ValidationError('invalid entity_type');
    }
    let query = this.client.from('KYC').select('*');
    if (entityType) query = query.eq('entity_type', entityType);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async findById(id) {
    assertPositiveInteger(id, 'id');
    const { data, error } = await this.client.from('KYC').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    if (!data) throw new NotFoundError('case not found');
    return data;
  }

  async updateStatus(id, fields) {
    const { data, error } = await this.client
      .from('KYC')
      .update(fields)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
