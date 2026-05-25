'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Undo2, Redo2 } from 'lucide-react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  ReactFlowProvider,
  useReactFlow,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useWorkflowStore } from '@/store/workflowStore';
import TriggerNode from './nodes/TriggerNode';
import ActionNode from './nodes/ActionNode';
import ConditionNode from './nodes/ConditionNode';
import DelayNode from './nodes/DelayNode';
import type { NodeType, WorkflowNode } from '@/types/workflow';

import GoogleSheetsActionNode from './nodes/GoogleSheetsActionNode';
import GoogleSheetsTriggerNode from './nodes/GoogleSheetsTriggerNode';
import GeminiNode from './nodes/GeminiNode';
import JsonTriggerNode from './nodes/JsonTriggerNode';

// ─── Node type registry ───────────────────────────────────────────────────────
// Defined outside the component to avoid re-creation on every render.

const nodeTypes = {
  form_trigger: TriggerNode,
  google_sheets_trigger: GoogleSheetsTriggerNode,
  json_trigger: JsonTriggerNode,
  notion_create_page: ActionNode,
  notion_update_page: ActionNode,
  google_sheets_append_row: GoogleSheetsActionNode,
  gemini_text: GeminiNode,
  condition: ConditionNode,
  delay: DelayNode,
};

// ─── Auto-save helper ─────────────────────────────────────────────────────────

function useDebouncedAutoSave(workflowId: string) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    (nodes: unknown[], edges: unknown[]) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        try {
          await fetch(`/api/workflows/${workflowId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ graph: { nodes, edges } }),
          });
          useWorkflowStore.getState().markClean();
        } catch (err) {
          console.error('[AutoSave] Failed to persist graph:', err);
        }
      }, 1000);
    },
    [workflowId]
  );

  // Cleanup on unmount
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return save;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface WorkflowCanvasProps {
  workflowId: string;
}

function CanvasContent({ workflowId }: WorkflowCanvasProps) {
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const isDirty = useWorkflowStore((s) => s.isDirty);
  const onNodesChange = useWorkflowStore((s) => s.onNodesChange);
  const onEdgesChange = useWorkflowStore((s) => s.onEdgesChange);
  const onConnect = useWorkflowStore((s) => s.onConnect);
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const setSelectedNodeId = useWorkflowStore((s) => s.setSelectedNodeId);
  const addNode = useWorkflowStore((s) => s.addNode);

  const undo = useWorkflowStore((s) => s.undo);
  const redo = useWorkflowStore((s) => s.redo);
  const past = useWorkflowStore((s) => s.past);
  const future = useWorkflowStore((s) => s.future);
  const saveHistory = useWorkflowStore((s) => s.saveHistory);

  const { screenToFlowPosition } = useReactFlow();
  const autoSave = useDebouncedAutoSave(workflowId);

  // Trigger auto-save whenever the graph changes
  useEffect(() => {
    if (isDirty) {
      autoSave(nodes, edges);
    }
  }, [nodes, edges, isDirty, autoSave]);

  // Global keydown listeners for delete, undo, and redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if the user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      if ((e.key === 'Backspace' || e.key === 'Delete') && selectedNodeId) {
        useWorkflowStore.getState().deleteNode(selectedNodeId);
      }

      // Undo: Ctrl+Z or Cmd+Z
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        useWorkflowStore.getState().undo();
      }

      // Redo: Ctrl+Y or Cmd+Shift+Z
      if (
        (e.key === 'y' && (e.ctrlKey || e.metaKey)) ||
        (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey)
      ) {
        e.preventDefault();
        useWorkflowStore.getState().redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId]);

  const onNodeDragStart = useCallback(() => {
    useWorkflowStore.getState().saveHistory();
  }, []);

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => setSelectedNodeId(node.id),
    [setSelectedNodeId]
  );

  const onPaneClick = useCallback(
    () => setSelectedNodeId(null),
    [setSelectedNodeId]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as NodeType;

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: WorkflowNode = {
        id: `node_${crypto.randomUUID()}`,
        type,
        position,
        data: {
          label: type === 'form_trigger' ? 'Form Trigger' :
            type === 'google_sheets_trigger' ? 'Sheets Trigger' :
              type === 'json_trigger' ? 'JSON Trigger' :
                type === 'google_sheets_append_row' ? 'Append Row' :
                  type === 'notion_create_page' ? 'Create Page' :
                    type === 'notion_update_page' ? 'Update Page' :
                      type === 'gemini_text' ? 'Gemini AI' :
                        type === 'condition' ? 'Condition' : 'Delay',
          description: '',
          config: {},
        },
      };

      addNode(newNode);
    },
    [screenToFlowPosition, addNode]
  );

  return (
    <div className="relative h-full w-full">
      {/* Top action bar */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <div className="flex items-center gap-1 bg-[color:var(--bg-surface)] border border-[color:var(--border-default)] p-1 rounded-xl shadow-lg shadow-black/20 mr-2">
          <button
            onClick={() => undo()}
            disabled={past.length === 0}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-400"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => redo()}
            disabled={future.length === 0}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-400"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={async () => {
            const store = useWorkflowStore.getState();
            store.setExecuting(true);
            store.clearExecutions();

            try {
              const res = await fetch(`/api/execute/${workflowId}`, { method: 'POST' });
              const data = await res.json();

              if (data.success && data.execution) {
                store.setNodeExecutions(data.execution.node_results || {});
              } else {
                alert(`Execution failed: ${data.error}`);
              }
            } catch (err: any) {
              alert(`Execution request failed: ${err.message}`);
            } finally {
              store.setExecuting(false);
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[color:var(--button-primary)] text-[color:var(--button-text)] text-sm font-medium rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-black/20"
        >
          Execute Workflow
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDragStart={onNodeDragStart}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        className="bg-black"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#27272a"
        />
        <Controls
          className="!bg-zinc-900 !border-zinc-800 !shadow-none [&>button]:!bg-zinc-900 [&>button]:!border-zinc-700 [&>button]:!text-zinc-400 [&>button:hover]:!bg-zinc-800 [&>button:hover]:!text-white"
        />
      </ReactFlow>
    </div>
  );
}

export default function WorkflowCanvas({ workflowId }: WorkflowCanvasProps) {
  return (
    <div className="flex-1 h-full w-full">
      <ReactFlowProvider>
        <CanvasContent workflowId={workflowId} />
      </ReactFlowProvider>
    </div>
  );
}
