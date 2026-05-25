'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';

export default function NewWorkflowPage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Generate workflow graph from prompt
      const aiRes = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const aiJson = await aiRes.json();

      if (!aiRes.ok) {
        throw new Error(aiJson.error || 'Failed to generate workflow');
      }

      // 2. Save the new workflow to the database
      const saveRes = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: aiJson.name || 'AI Generated Workflow',
          description: aiJson.description || '',
          graph: aiJson.graph
        }),
      });

      const saveJson = await saveRes.json();

      if (!saveRes.ok) {
        throw new Error(saveJson.error || 'Failed to save workflow');
      }

      // 3. Redirect to the newly created workflow canvas
      router.push(`/workflows/${saveJson.workflow.id}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-[color:var(--bg-background)] p-8">
      <div className="w-full max-w-2xl space-y-8">
        {/* Icon + heading */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--bg-surface)] border border-[color:var(--border-default)] shadow-lg shadow-black/20">
            <Sparkles className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[color:var(--text-primary)] tracking-tight">
              Create an Automation
            </h1>
            <p className="text-sm text-[color:var(--text-secondary)] mt-2 max-w-lg mx-auto">
              Describe what you want to automate in plain English. Our AI will build the workflow graph for you automatically.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5 relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. When someone submits my contact form, create a Notion page in my CRM database with their name, email and set status to New."
              autoFocus
              disabled={loading}
              className="w-full h-32 bg-[color:var(--bg-surface)] border border-[color:var(--border-default)] rounded-xl p-4 text-sm text-[color:var(--text-primary)] placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all disabled:opacity-50 resize-none shadow-xl shadow-black/10"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          )}

          <div className="flex flex-col items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="h-11 px-8 flex items-center justify-center gap-2 bg-[color:var(--button-primary)] text-[color:var(--button-text)] text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 shadow-lg shadow-black/20"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Building your workflow...
                </>
              ) : (
                <>
                  Generate Workflow
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            
            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                setError(null);
                try {
                  const saveRes = await fetch('/api/workflows', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: 'Untitled Workflow',
                      description: ''
                    }),
                  });
                  const saveJson = await saveRes.json();
                  if (!saveRes.ok) throw new Error(saveJson.error || 'Failed to save workflow');
                  router.push(`/workflows/${saveJson.workflow.id}`);
                } catch (err: any) {
                  setError(err.message || 'Something went wrong.');
                  setLoading(false);
                }
              }}
              className="text-sm text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] underline underline-offset-4 decoration-zinc-700 hover:decoration-zinc-400 transition-colors disabled:opacity-50"
            >
              Or start from scratch on a blank canvas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
