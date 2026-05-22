'use client';

export default function ActionNode() {
  return (
    <div className="p-4 border border-blue-500 rounded bg-zinc-950 text-white">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-blue-500" />
        <span className="text-xs font-semibold">Action Node</span>
      </div>
    </div>
  );
}
