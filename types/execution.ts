export interface ExecutionRow {
  id: string;
  workflow_id: string;
  status: 'running' | 'success' | 'error';
  trigger_data: Record<string, unknown>;
  node_results: Record<string, unknown>;
  started_at: string;
  finished_at: string | null;
}
