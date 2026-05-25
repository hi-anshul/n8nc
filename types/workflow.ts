export type NodeType =
  | 'form_trigger'
  | 'notion_create_page'
  | 'notion_update_page'
  | 'google_sheets_append_row'
  | 'gemini_text'
  | 'condition'
  | 'delay'
  | 'google_sheets_trigger'
  | 'json_trigger';

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: {
    label: string;
    description: string;
    config: Record<string, unknown>;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  label?: string;
}

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

// ─── Database row shape ───────────────────────────────────────────────────────

export interface Workflow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  graph: WorkflowGraph;
  is_active: boolean;
  trigger_slug: string | null;
  created_at: string;
  updated_at: string;
}

// ─── API input types ──────────────────────────────────────────────────────────

export interface CreateWorkflowInput {
  name: string;
  description?: string;
  graph?: WorkflowGraph;
}

export interface UpdateWorkflowInput {
  name?: string;
  description?: string;
  graph?: WorkflowGraph;
  is_active?: boolean;
}
