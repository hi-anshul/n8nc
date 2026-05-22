import ExecutionLog from '@/components/ExecutionLog';

export default function ExecutionsPage() {
  return (
    <div className="flex-1 bg-black p-8 text-white">
      <header className="mb-8 flex items-center justify-between border-b border-zinc-800 pb-4">
        <h1 className="text-xl font-medium tracking-tight">Runs & Logs</h1>
      </header>
      <ExecutionLog />
    </div>
  );
}
