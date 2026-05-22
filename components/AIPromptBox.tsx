'use client';

export default function AIPromptBox() {
  return (
    <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl max-w-xl w-full mx-auto space-y-4">
      <h3 className="text-sm font-semibold text-white">Describe your automation</h3>
      <textarea 
        className="w-full h-24 bg-black border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 resize-none"
        placeholder="When someone submits my contact form, create a Notion page..."
      />
      <button className="px-4 py-2 bg-white text-black hover:bg-zinc-200 text-xs font-semibold rounded-xl w-full transition-all">
        Generate Workflow
      </button>
    </div>
  );
}
