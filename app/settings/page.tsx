export default function SettingsPage() {
  return (
    <div className="flex-1 bg-black p-8 text-white">
      <header className="mb-8 flex items-center justify-between border-b border-zinc-800 pb-4">
        <h1 className="text-xl font-medium tracking-tight">Settings</h1>
      </header>
      <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4">
        <h3 className="text-sm font-semibold text-white">Application Settings</h3>
        <p className="text-xs text-zinc-500">Configure global application preferences and configurations here.</p>
      </div>
    </div>
  );
}
