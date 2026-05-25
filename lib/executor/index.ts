import { Workflow } from '@/types/workflow';
import { ExecutionContext, NodeResult } from '@/types/executor';
import { execute as executeNotionCreatePage } from './nodes/notionCreatePage';
import { execute as executeGoogleSheetsAppendRow } from './nodes/googleSheetsAppendRow';
import { execute as executeGeminiText } from './nodes/geminiText';
import { SupabaseClient } from '@supabase/supabase-js';

const NODE_HANDLERS: Record<string, Function> = {
  'notion_create_page': executeNotionCreatePage,
  'google_sheets_append_row': executeGoogleSheetsAppendRow,
  'gemini_text': executeGeminiText,
  // Add other node handlers here as they are implemented
};

export async function runWorkflow(
  supabase: SupabaseClient,
  workflow: Workflow,
  triggerData: Record<string, unknown>
): Promise<void> {
  // 1. Create a running execution record
  const { data: execution, error: createError } = await supabase
    .from('executions')
    .insert({
      workflow_id: workflow.id,
      status: 'running',
      trigger_data: triggerData,
      node_results: {},
    })
    .select('*')
    .single();

  if (createError || !execution) {
    console.error('[Executor] Failed to create execution record:', createError);
    return;
  }

  const executionId = execution.id;
  const nodeResults: Record<string, unknown> = {};
  let executionStatus: 'success' | 'error' = 'success';
  let activeTriggerData: Record<string, any> = triggerData || {};

  try {
    const { nodes, edges } = workflow.graph;

    // Build adjacency list for traversal: sourceId -> targetNode[]
    const adjacencyList: Record<string, any[]> = {};
    const inDegree: Record<string, number> = {};

    nodes.forEach(node => {
      adjacencyList[node.id] = [];
      inDegree[node.id] = 0;
    });

    edges.forEach(edge => {
      if (adjacencyList[edge.source]) {
        adjacencyList[edge.source].push(nodes.find(n => n.id === edge.target));
      }
      if (inDegree[edge.target] !== undefined) {
        inDegree[edge.target]++;
      }
    });

    // Start traversal from trigger nodes (in-degree 0)
    // Actually, form_trigger usually has in-degree 0
    let queue = nodes.filter(node => inDegree[node.id] === 0);
    
    // We process sequentially for simplicity, simulating topological sort
    const processed = new Set<string>();

    while (queue.length > 0) {
      const currentNode = queue.shift()!;
      if (processed.has(currentNode.id)) continue;

      // Special case: triggers just pass the triggerData through
      if (currentNode.type === 'form_trigger' || currentNode.type === 'google_sheets_trigger') {
        nodeResults[currentNode.id] = { status: 'success', output: activeTriggerData };
        processed.add(currentNode.id);
        
        // Enqueue neighbors
        const neighbors = adjacencyList[currentNode.id] || [];
        queue.push(...neighbors.filter(n => n !== undefined));
        continue;
      }

      if (currentNode.type === 'json_trigger') {
        try {
          const jsonStr = (currentNode.data.config?.testData as string) || '{}';
          const parsed = JSON.parse(jsonStr);
          activeTriggerData = parsed;
          nodeResults[currentNode.id] = { status: 'success', output: parsed };
        } catch (err: any) {
          nodeResults[currentNode.id] = { status: 'error', error: `Invalid JSON in trigger configuration: ${err.message}` };
          executionStatus = 'error';
          break;
        }
        processed.add(currentNode.id);

        // Enqueue neighbors
        const neighbors = adjacencyList[currentNode.id] || [];
        queue.push(...neighbors.filter(n => n !== undefined));
        continue;
      }

      // Look up handler
      const handler = NODE_HANDLERS[currentNode.type];
      if (!handler) {
        // Unknown node type
        nodeResults[currentNode.id] = { status: 'error', error: `No handler for node type: ${currentNode.type}` };
        executionStatus = 'error';
        break; // stop workflow on first error
      }

      // Build context
      const context: ExecutionContext = {
        supabase,
        triggerData: activeTriggerData,
        previousOutputs: { ...nodeResults },
      };

      // Execute node
      const result: NodeResult = await handler(currentNode.data.config || {}, context);
      nodeResults[currentNode.id] = result;
      processed.add(currentNode.id);

      if (result.status === 'error') {
        executionStatus = 'error';
        break; // stop workflow
      }

      // Enqueue neighbors
      const neighbors = adjacencyList[currentNode.id] || [];
      // Only push neighbors if all their dependencies have been processed (basic topological queue)
      for (const neighbor of neighbors) {
        if (!neighbor) continue;
        const deps = edges.filter(e => e.target === neighbor.id).map(e => e.source);
        const allDepsProcessed = deps.every(dep => processed.has(dep));
        if (allDepsProcessed && !queue.find(n => n.id === neighbor.id)) {
          queue.push(neighbor);
        }
      }
    }

  } catch (error: any) {
    console.error('[Executor] Fatal execution error:', error);
    executionStatus = 'error';
    nodeResults['fatal'] = { status: 'error', error: error.message };
  }

  // 2. Finalize execution record
  await supabase
    .from('executions')
    .update({
      status: executionStatus,
      trigger_data: activeTriggerData,
      node_results: nodeResults,
      finished_at: new Date().toISOString(),
    })
    .eq('id', executionId);
}
