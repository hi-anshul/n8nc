'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { GitBranch } from 'lucide-react';
import { type BaseNodeData } from './TriggerNode';

import { useWorkflowStore } from '@/store/workflowStore';

function ConditionNode({ id, data, selected }: NodeProps) {
  const d = data as BaseNodeData;
  const execution = useWorkflowStore((s) => s.nodeExecutions[id]);

  let borderClass = selected ? 'border-zinc-500 shadow-[0_0_0_1px_#71717a]' : 'border-zinc-800 hover:border-zinc-700';
  if (execution?.status === 'success') borderClass = 'border-green-500 shadow-[0_0_0_1px_#22c55e]';
  else if (execution?.status === 'error') borderClass = 'border-red-500 shadow-[0_0_0_1px_#ef4444]';

  return (
    <div
      className={[
        'min-w-[200px] rounded-2xl border bg-zinc-950 px-4 py-3 transition-all duration-150',
        borderClass,
      ].join(' ')}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-zinc-600 !border-2 !border-zinc-400 hover:!bg-white transition-colors"
      />

      <div className="flex items-center gap-2.5 mb-2">
        <div className="h-7 w-7 rounded-lg bg-amber-950 border border-amber-900/60 flex items-center justify-center shrink-0">
          <GitBranch className="h-3.5 w-3.5 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider leading-none mb-0.5">
            Condition
          </p>
          <p className="text-sm font-semibold text-white truncate leading-tight">
            {String(d.label ?? 'If / Else')}
          </p>
        </div>
        <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
      </div>

      {d.description && (
        <p className="text-xs text-zinc-500 leading-relaxed">{String(d.description)}</p>
      )}

      {/* True branch */}
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        style={{ top: '35%' }}
        className="!w-3 !h-3 !bg-emerald-700 !border-2 !border-emerald-500 hover:!bg-emerald-400 transition-colors"
      />
      {/* False branch */}
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        style={{ top: '65%' }}
        className="!w-3 !h-3 !bg-red-800 !border-2 !border-red-600 hover:!bg-red-400 transition-colors"
      />

      <div className="mt-2 flex justify-end flex-col items-end gap-1 text-[10px] text-zinc-600">
        <span>true ↗</span>
        <span>false ↘</span>
      </div>
    </div>
  );
}

export default memo(ConditionNode);
