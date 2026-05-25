'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { FileSpreadsheet } from 'lucide-react';
import { type BaseNodeData } from './TriggerNode';
import { useWorkflowStore } from '@/store/workflowStore';

function GoogleSheetsTriggerNode({ id, data, selected }: NodeProps) {
  const d = data as BaseNodeData;
  const execution = useWorkflowStore((s) => s.nodeExecutions[id]);

  let borderClass = selected ? 'border-zinc-500 shadow-[0_0_0_1px_#71717a]' : 'border-zinc-800 hover:border-zinc-700';
  if (execution?.status === 'success') borderClass = 'border-green-500 shadow-[0_0_0_1px_#22c55e]';
  else if (execution?.status === 'error') borderClass = 'border-red-500 shadow-[0_0_0_1px_#ef4444]';

  return (
    <div
      className={[
        'min-w-[200px] rounded-2xl border bg-zinc-950 px-4 py-3 transition-all duration-150 relative',
        borderClass,
      ].join(' ')}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <div className="h-7 w-7 rounded-lg bg-[#0F9D58]/20 border border-[#0F9D58]/30 flex items-center justify-center shrink-0">
          <FileSpreadsheet className="h-3.5 w-3.5 text-[#0F9D58]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider leading-none mb-0.5">
            Trigger
          </p>
          <p className="text-sm font-semibold text-white truncate leading-tight">
            {String(d.label ?? 'Sheets Trigger')}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span className="text-[9px] font-medium text-emerald-500 uppercase tracking-wider">Listening</span>
        </div>
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

export default memo(GoogleSheetsTriggerNode);
