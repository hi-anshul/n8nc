'use client';

import { type Node } from '@xyflow/react';
import { useWorkflowStore } from '@/store/workflowStore';
import { SharedNodeHeader } from './SharedNodeHeader';

interface ConditionConfigFormProps {
  node: Node;
}

export function ConditionConfigForm({ node }: ConditionConfigFormProps) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const config = (node.data.config as Record<string, unknown>) || {};

  const field = (config.field as string) || '';
  const operator = (config.operator as string) || 'equals';
  const value = (config.value as string) || '';

  const updateConfig = (updates: Record<string, unknown>) => {
    updateNodeData(node.id, { config: { ...config, ...updates } });
  };

  return (
    <div className="flex flex-col h-full">
      <SharedNodeHeader node={node} />
      <div className="space-y-4 pt-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-400">Field to Check</label>
          <input
            type="text"
            value={field}
            onChange={(e) => updateConfig({ field: e.target.value })}
            className="w-full h-8 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors"
            placeholder="e.g. trigger.email"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-400">Operator</label>
          <select
            value={operator}
            onChange={(e) => updateConfig({ operator: e.target.value })}
            className="w-full h-8 bg-zinc-900 border border-zinc-800 rounded-lg px-2 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors"
          >
            <option value="equals">Equals</option>
            <option value="not_equals">Not Equals</option>
            <option value="contains">Contains</option>
            <option value="greater_than">Greater Than</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-400">Comparison Value</label>
          <input
            type="text"
            value={value}
            onChange={(e) => updateConfig({ value: e.target.value })}
            className="w-full h-8 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors"
            placeholder="Value to compare against"
          />
        </div>
      </div>
    </div>
  );
}
