import { create } from 'zustand';
import { WorkflowNode, WorkflowEdge } from '@/types/workflow';

interface WorkflowStoreState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: WorkflowEdge[]) => void;
  addNode: (node: WorkflowNode) => void;
  addEdge: (edge: WorkflowEdge) => void;
}

export const useWorkflowStore = create<WorkflowStoreState>((set) => ({
  nodes: [],
  edges: [],
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
}));
