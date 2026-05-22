'use client';

import { useWorkflowStore } from '@/store/workflowStore';
import { type Node } from '@xyflow/react';
import { Trash2 } from 'lucide-react';

interface SharedNodeHeaderProps {
  node: Node;
}

export function SharedNodeHeader({ node }: SharedNodeHeaderProps) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const deleteNode = useWorkflowStore((s) => s.deleteNode);

  const label = (node.data.label as string) || '';
  const description = (node.data.description as string) || '';

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this node?')) {
      deleteNode(node.id);
    }
  };

  return (
    <div className="space-y-4 pb-4 border-b border-zinc-800">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-zinc-400">Node Name</label>
        <button
          onClick={handleDelete}
          className="text-zinc-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors"
          title="Delete Node"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <input
        type="text"
        value={label}
        onChange={(e) => updateNodeData(node.id, { label: e.target.value })}
        className="w-full h-8 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors"
        placeholder="e.g. My Node"
      />
      <div className="space-y-1.5 mt-4">
        <label className="text-xs font-medium text-zinc-400">Description</label>
        <textarea
          value={description}
          onChange={(e) => updateNodeData(node.id, { description: e.target.value })}
          className="w-full h-16 bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors resize-none"
          placeholder="Optional description"
        />
      </div>
    </div>
  );
}
