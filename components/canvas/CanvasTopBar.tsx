'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Save } from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';
import { cn } from '@/lib/utils';

interface CanvasTopBarProps {
  workflowId: string;
}

export default function CanvasTopBar({ workflowId }: CanvasTopBarProps) {
  const workflowName = useWorkflowStore((s) => s.workflowName);
  const isActive = useWorkflowStore((s) => s.isActive);
  const setIsActive = useWorkflowStore((s) => s.setIsActive);
  const isDirty = useWorkflowStore((s) => s.isDirty);
  const [isRunning, setIsRunning] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const router = useRouter();

  const handleToggleActive = async () => {
    setIsToggling(true);
    try {
      const next = !isActive;
      await fetch(`/api/workflows/${workflowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: next }),
      });
      setIsActive(next);
    } catch (e) {
      console.error('Failed to toggle workflow activation:', e);
    } finally {
      setIsToggling(false);
    }
  };

  const handleManualRun = async () => {
    setIsRunning(true);
    try {
      await fetch(`/api/execute/${workflowId}`, { method: 'POST' });
      router.refresh();
    } catch (e) {
      console.error('Failed to execute workflow:', e);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="h-12 shrink-0 flex items-center justify-between px-5 border-b border-zinc-800 bg-zinc-950">
      {/* Workflow name + save state */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-white tracking-tight truncate max-w-[240px]">
          {workflowName || 'Untitled Workflow'}
        </span>
        {isDirty ? (
          <span className="flex items-center gap-1 text-[11px] text-zinc-500">
            <Save className="h-3 w-3" />
            Saving…
          </span>
        ) : (
          <span className="text-[11px] text-zinc-600">Saved</span>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Activate toggle */}
        <button
          onClick={handleToggleActive}
          disabled={isToggling}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150',
            isActive
              ? 'bg-emerald-950 border-emerald-800 text-emerald-400 hover:bg-emerald-900'
              : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800'
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', isActive ? 'bg-emerald-500' : 'bg-zinc-600')} />
          {isActive ? 'Active' : 'Inactive'}
        </button>

        {/* Manual run */}
        <button
          onClick={handleManualRun}
          disabled={isRunning}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-white text-black hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Play className="h-3.5 w-3.5" />
          {isRunning ? 'Running…' : 'Run'}
        </button>
      </div>
    </div>
  );
}
