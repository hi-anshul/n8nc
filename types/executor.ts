import { SupabaseClient } from '@supabase/supabase-js';

export interface ExecutionContext {
  supabase: SupabaseClient;
  triggerData: Record<string, unknown>;
  previousOutputs: Record<string, unknown>;
}

export interface NodeResult {
  status: 'success' | 'error';
  output?: any;
  error?: string;
}
