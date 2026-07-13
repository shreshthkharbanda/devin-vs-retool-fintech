import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

let instance = null;

// Singleton: one shared client for the whole process, created on first use
// rather than at import time. `ws` is passed explicitly as the realtime
// transport — this service never subscribes to a realtime channel, but
// supabase-js constructs its RealtimeClient unconditionally and requires a
// WebSocket implementation to exist the moment the client is created, which
// otherwise fails on Node versions without a native global WebSocket.
export function getSupabaseClient() {
  if (!instance) {
    instance = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
      realtime: { transport: WebSocket },
    });
  }
  return instance;
}
