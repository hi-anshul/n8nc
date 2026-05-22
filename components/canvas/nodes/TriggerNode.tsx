'use client';

export default function TriggerNode() {
  return (
    <div className="p-4 border border-emerald-500 rounded bg-zinc-950 text-white">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        <span className="text-xs font-semibold">Trigger Node</span>
      </div>
    </div>
  );
}
