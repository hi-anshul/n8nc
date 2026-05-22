'use client';

import { type Node } from '@xyflow/react';
import { useWorkflowStore } from '@/store/workflowStore';
import { SharedNodeHeader } from './SharedNodeHeader';

interface DelayConfigFormProps {
  node: Node;
}

export function DelayConfigForm({ node }: DelayConfigFormProps) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const config = (node.data.config as Record<string, unknown>) || {};
  
  const amount = (config.amount as number) || 0;
  const unit = (config.unit as string) || 'seconds';

  const updateConfig = (updates: Record<string, unknown>) => {
    updateNodeData(node.id, { config: { ...config, ...updates } });
  };

  return (
    <div className="flex flex-col h-full">
      <SharedNodeHeader node={node} />
      <div className="space-y-4 pt-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-400">Delay Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => updateConfig({ amount: Number(e.target.value) })}
            className="w-full h-8 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors"
            min="0"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-400">Time Unit</label>
          <select
            value={unit}
            onChange={(e) => updateConfig({ unit: e.target.value })}
            className="w-full h-8 bg-zinc-900 border border-zinc-800 rounded-lg px-2 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors"
          >
            <option value="seconds">Seconds</option>
            <option value="minutes">Minutes</option>
          </select>
        </div>
      </div>
    </div>
  );
}
