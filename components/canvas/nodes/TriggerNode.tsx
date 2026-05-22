'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Zap } from 'lucide-react';

// Explicit data shape for all nodes
export interface BaseNodeData {
  label?: string;
  description?: string;
  config?: Record<string, unknown>;
  [key: string]: unknown;
}

function TriggerNode({ data, selected }: NodeProps) {
  const d = data as BaseNodeData;
  return (
    <div
      className={[
        'min-w-[200px] rounded-2xl border bg-zinc-950 px-4 py-3 transition-all duration-150',
        selected
          ? 'border-zinc-500 shadow-[0_0_0_1px_#71717a]'
          : 'border-zinc-800 hover:border-zinc-700',
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-2">
        <div className="h-7 w-7 rounded-lg bg-emerald-950 border border-emerald-900/60 flex items-center justify-center shrink-0">
          <Zap className="h-3.5 w-3.5 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider leading-none mb-0.5">
            Trigger
          </p>
          <p className="text-sm font-semibold text-white truncate leading-tight">
            {String(d.label ?? 'Form Trigger')}
          </p>
        </div>
        <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
      </div>

      {d.description && (
        <p className="text-xs text-zinc-500 leading-relaxed">{String(d.description)}</p>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-zinc-600 !border-2 !border-zinc-400 hover:!bg-white transition-colors"
      />
    </div>
  );
}

export default memo(TriggerNode);
