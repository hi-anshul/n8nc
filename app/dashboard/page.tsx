export default function DashboardPage() {
  return (
    <div className="flex-1 bg-black p-8 text-white">
      <header className="mb-8 flex items-center justify-between border-b border-zinc-800 pb-4">
        <h1 className="text-xl font-medium tracking-tight">Workflows</h1>
      </header>
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">List of user's workflows will be loaded here.</p>
      </div>
    </div>
  );
}
