'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { FileJson } from 'lucide-react';
import { type BaseNodeData } from './TriggerNode';
import { useWorkflowStore } from '@/store/workflowStore';

function JsonTriggerNode({ id, data, selected }: NodeProps) {
  const d = data as BaseNodeData;
  const execution = useWorkflowStore((s) => s.nodeExecutions[id]);

  let borderClass = selected ? 'border-zinc-500 shadow-[0_0_0_1px_#71717a]' : 'border-zinc-800 hover:border-zinc-700';
  if (execution?.status === 'success') borderClass = 'border-green-500 shadow-[0_0_0_1px_#22c55e]';
  else if (execution?.status === 'error') borderClass = 'border-red-500 shadow-[0_0_0_1px_#ef4444]';

  const testData = (d.config?.testData as string) || '';
  let jsonPreview = '';
  let isInvalid = false;
  if (testData) {
    try {
      const obj = JSON.parse(testData);
      if (obj && typeof obj === 'object') {
        const keys = Object.keys(obj);
        if (keys.length > 0) {
          jsonPreview = keys.map(k => `"${k}"`).slice(0, 3).join(', ');
          if (keys.length > 3) jsonPreview += ', ...';
          jsonPreview = `{ ${jsonPreview} }`;
        } else {
          jsonPreview = '{}';
        }
      } else {
        jsonPreview = String(obj);
      }
    } catch {
      jsonPreview = 'Invalid JSON';
      isInvalid = true;
    }
  }

  return (
    <div
      className={[
        'min-w-[200px] max-w-[260px] rounded-2xl border bg-zinc-950 px-4 py-3 transition-all duration-150',
        borderClass,
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-2">
        <div className="h-7 w-7 rounded-lg bg-emerald-950 border border-emerald-900/60 flex items-center justify-center shrink-0">
          <FileJson className="h-3.5 w-3.5 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider leading-none mb-0.5">
            Trigger
          </p>
          <p className="text-sm font-semibold text-white truncate leading-tight">
            {String(d.label ?? 'JSON Trigger')}
          </p>
        </div>
        <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
      </div>

      {d.description && (
        <p className="text-xs text-zinc-500 leading-relaxed mb-2">{String(d.description)}</p>
      )}

      {jsonPreview ? (
        <div className="mt-2 pt-2 border-t border-zinc-900">
          <p className={`font-mono text-[10px] truncate ${isInvalid ? 'text-red-400' : 'text-zinc-400 bg-zinc-900/50 px-1.5 py-0.5 rounded'}`}>
            {jsonPreview}
          </p>
        </div>
      ) : (
        <p className="text-[10px] text-zinc-600 italic">No payload configured</p>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-zinc-600 !border-2 !border-zinc-400 hover:!bg-white transition-colors"
      />
    </div>
  );
}

export default memo(JsonTriggerNode);
