'use client';

export default function ExecutionLog() {
  return (
    <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4">
      <h3 className="text-sm font-semibold text-white">Execution Logs</h3>
      <div className="text-xs text-zinc-500">No execution history available for this workflow.</div>
    </div>
  );
}
