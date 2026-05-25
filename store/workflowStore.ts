import { create } from 'zustand';
import { type Node, type Edge, type OnNodesChange, type OnEdgesChange, applyNodeChanges, applyEdgeChanges, addEdge, type Connection } from '@xyflow/react';
import { WorkflowGraph, WorkflowNode } from '@/types/workflow';

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
  triggerSlug: string | null;
  setWorkflowName: (name: string) => void;
  setIsActive: (active: boolean) => void;

  // Dirty tracking (unsaved changes)
  isDirty: boolean;
  markClean: () => void;

  // Lifecycle
  loadWorkflow: (id: string, name: string, isActive: boolean, triggerSlug: string | null, graph: WorkflowGraph) => void;
  reset: () => void;

  // Node editing
  updateNodeData: (id: string, dataUpdate: Record<string, unknown>) => void;
  addNode: (node: WorkflowNode) => void;
  deleteNode: (id: string) => void;

  // Execution state
  isExecuting: boolean;
  nodeExecutions: Record<string, { status: string; error?: string }>;
  setExecuting: (isExecuting: boolean) => void;
  setNodeExecutions: (results: Record<string, any>) => void;
  clearExecutions: () => void;

  // Undo/Redo
  past: { nodes: Node[]; edges: Edge[] }[];
  future: { nodes: Node[]; edges: Edge[] }[];
  saveHistory: () => void;
  undo: () => void;
  redo: () => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useWorkflowStore = create<WorkflowStoreState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  workflowId: null,
  workflowName: '',
  isActive: false,
  triggerSlug: null,
  isDirty: false,

  // ReactFlow change handlers — apply RFC patch operations and mark dirty
  onNodesChange: (changes) => {
    if (changes.some((c) => c.type === 'remove')) {
      get().saveHistory();
    }
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
      isDirty: true,
    }));
  },

  onEdgesChange: (changes) => {
    if (changes.some((c) => c.type === 'remove')) {
      get().saveHistory();
    }
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
      isDirty: true,
    }));
  },

  onConnect: (connection) => {
    get().saveHistory();
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
  loadWorkflow: (id, name, isActive, triggerSlug, graph) => {
    set({
      workflowId: id,
      workflowName: name,
      isActive,
      triggerSlug,
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
      triggerSlug: null,
      isDirty: false,
    });
  },

  // Update specific node data and mark dirty
  updateNodeData: (id, dataUpdate) => {
    get().saveHistory();
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, ...dataUpdate } }
          : node
      ),
      isDirty: true,
    }));
  },

  // Add a new node to the canvas
  addNode: (node) => {
    get().saveHistory();
    set((state) => ({
      nodes: [...state.nodes, node as unknown as Node],
      isDirty: true,
    }));
  },

  // Delete a node from the canvas
  deleteNode: (id) => {
    get().saveHistory();
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
      isDirty: true,
    }));
  },

  // Execution state
  isExecuting: false,
  nodeExecutions: {},
  setExecuting: (isExecuting) => set({ isExecuting }),
  setNodeExecutions: (results) => set({ nodeExecutions: results }),
  clearExecutions: () => set({ nodeExecutions: {} }),

  // ─── Undo / Redo ─────────────────────────────────────────────────────────────
  past: [],
  future: [],
  saveHistory: () => {
    set((state) => {
      // Don't save history if we haven't changed anything since last save
      const lastPast = state.past[state.past.length - 1];
      if (
        lastPast &&
        JSON.stringify(lastPast.nodes) === JSON.stringify(state.nodes) &&
        JSON.stringify(lastPast.edges) === JSON.stringify(state.edges)
      ) {
        return state;
      }
      return {
        past: [...state.past, { nodes: state.nodes, edges: state.edges }],
        future: [],
      };
    });
  },
  undo: () => {
    set((state) => {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, state.past.length - 1);
      return {
        past: newPast,
        future: [{ nodes: state.nodes, edges: state.edges }, ...state.future],
        nodes: previous.nodes,
        edges: previous.edges,
        isDirty: true,
      };
    });
  },
  redo: () => {
    set((state) => {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return {
        past: [...state.past, { nodes: state.nodes, edges: state.edges }],
        future: newFuture,
        nodes: next.nodes,
        edges: next.edges,
        isDirty: true,
      };
    });
  },
}));
