import { create } from 'zustand';
import { type Node, type Edge, type OnNodesChange, type OnEdgesChange, applyNodeChanges, applyEdgeChanges, addEdge, type Connection } from '@xyflow/react';
import { WorkflowGraph } from '@/types/workflow';

// ─── State shape ─────────────────────────────────────────────────────────────

interface WorkflowStoreState {
  // Graph state (ReactFlow-compatible)
  nodes: Node[];
  edges: Edge[];

  // ReactFlow change handlers
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;

  // Selection
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;

  // Workflow metadata
  workflowId: string | null;
  workflowName: string;
  isActive: boolean;
  setWorkflowName: (name: string) => void;
  setIsActive: (active: boolean) => void;

  // Dirty tracking (unsaved changes)
  isDirty: boolean;
  markClean: () => void;

  // Lifecycle
  loadWorkflow: (id: string, name: string, isActive: boolean, graph: WorkflowGraph) => void;
  reset: () => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useWorkflowStore = create<WorkflowStoreState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  workflowId: null,
  workflowName: '',
  isActive: false,
  isDirty: false,

  // ReactFlow change handlers — apply RFC patch operations and mark dirty
  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
      isDirty: true,
    }));
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
      isDirty: true,
    }));
  },

  onConnect: (connection) => {
    set((state) => ({
      edges: addEdge(connection, state.edges),
      isDirty: true,
    }));
  },

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  setWorkflowName: (name) => set({ workflowName: name, isDirty: true }),

  setIsActive: (active) => set({ isActive: active, isDirty: true }),

  markClean: () => set({ isDirty: false }),

  // Hydrate store from a persisted workflow record
  loadWorkflow: (id, name, isActive, graph) => {
    set({
      workflowId: id,
      workflowName: name,
      isActive,
      nodes: graph.nodes as unknown as Node[],
      edges: graph.edges as unknown as Edge[],
      isDirty: false,
      selectedNodeId: null,
    });
  },

  // Clear everything on unmount / page leave
  reset: () => {
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      workflowId: null,
      workflowName: '',
      isActive: false,
      isDirty: false,
    });
  },
}));
