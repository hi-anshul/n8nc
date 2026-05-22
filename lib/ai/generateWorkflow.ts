import { WorkflowGraph } from '@/types/workflow';

export async function generateWorkflow(prompt: string): Promise<WorkflowGraph> {
  // Placeholder for AI generation using Anthropic Claude API.
  // In the future, this will construct the system prompt and parse response JSON.
  return {
    nodes: [
      {
        id: "node_1",
        type: "form_trigger",
        position: { x: 100, y: 200 },
        data: {
          label: "Form Trigger",
          description: "Triggered on form submission",
          config: {}
        }
      }
    ],
    edges: []
  };
}
