'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Clock } from 'lucide-react';
import { type BaseNodeData } from './TriggerNode';

function DelayNode({ data, selected }: NodeProps) {
  const d = data as BaseNodeData;
  const config = (d.config ?? {}) as { amount?: number; unit?: string };

  return (
    <div
      className={[
        'min-w-[200px] rounded-2xl border bg-zinc-950 px-4 py-3 transition-all duration-150',
        selected
          ? 'border-zinc-500 shadow-[0_0_0_1px_#71717a]'
          : 'border-zinc-800 hover:border-zinc-700',
      ].join(' ')}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-zinc-600 !border-2 !border-zinc-400 hover:!bg-white transition-colors"
      />

      <div className="flex items-center gap-2.5 mb-2">
        <div className="h-7 w-7 rounded-lg bg-zinc-900 border border-zinc-700/60 flex items-center justify-center shrink-0">
          <Clock className="h-3.5 w-3.5 text-zinc-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider leading-none mb-0.5">
            Delay
          </p>
          <p className="text-sm font-semibold text-white truncate leading-tight">
            {String(d.label ?? 'Wait')}
          </p>
        </div>
        <span className="h-2 w-2 rounded-full bg-zinc-500 shrink-0" />
      </div>

      {config.amount != null && config.unit ? (
        <p className="text-xs text-zinc-500">Wait {config.amount} {config.unit}</p>
      ) : d.description ? (
        <p className="text-xs text-zinc-500 leading-relaxed">{String(d.description)}</p>
      ) : null}

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-zinc-600 !border-2 !border-zinc-400 hover:!bg-white transition-colors"
      />
    </div>
  );
}

export default memo(DelayNode);
