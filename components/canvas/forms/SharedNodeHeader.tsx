'use client';

import { useWorkflowStore } from '@/store/workflowStore';
import { type Node } from '@xyflow/react';
import { Trash2, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface SharedNodeHeaderProps {
  node: Node;
}

export function SharedNodeHeader({ node }: SharedNodeHeaderProps) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const deleteNode = useWorkflowStore((s) => s.deleteNode);
  const nodeExecutions = useWorkflowStore((s) => s.nodeExecutions);
  const isExecuting = useWorkflowStore((s) => s.isExecuting);

  const label = (node.data.label as string) || '';
  const description = (node.data.description as string) || '';
  const execution = nodeExecutions[node.id];

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this node?')) {
      deleteNode(node.id);
    }
  };

  return (
    <div className={`p-4 border-b border-zinc-800 shrink-0 bg-zinc-950/50
      ${execution?.status === 'success' ? 'border-b-green-500/50 bg-green-500/5' : ''}
      ${execution?.status === 'error' ? 'border-b-red-500/50 bg-red-500/5' : ''}
    `}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-400">Node Name</span>
            {isExecuting && !execution && <Loader2 className="h-3 w-3 text-zinc-400 animate-spin shrink-0" />}
            {execution?.status === 'success' && <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />}
            {execution?.status === 'error' && (
              <span title={execution.error}>
                <XCircle className="h-3 w-3 text-red-500 shrink-0" />
              </span>
            )}
          </div>
          <input
            type="text"
            value={label}
            onChange={(e) => updateNodeData(node.id, { label: e.target.value })}
            className="w-full h-8 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors"
            placeholder="e.g. My Node"
          />
        </div>
        <button
          onClick={handleDelete}
          className="text-zinc-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors mt-4"
          title="Delete Node"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-1.5">
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
