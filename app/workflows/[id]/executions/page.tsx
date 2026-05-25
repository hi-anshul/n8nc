import { createClerkSupabaseServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Clock, Play, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

function formatDuration(start: string, end: string | null) {
  if (!end) return 'Running...';
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export default async function ExecutionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClerkSupabaseServerClient();

  // Fetch workflow
  const { data: workflow } = await supabase
    .from('workflows')
    .select('name')
    .eq('id', id)
    .single();

  if (!workflow) {
    notFound();
  }

  // Fetch executions
  const { data: executions } = await supabase
    .from('executions')
    .select('*')
    .eq('workflow_id', id)
    .order('started_at', { ascending: false });

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--text-primary)]">Execution History</h1>
          <p className="text-[color:var(--text-secondary)] mt-1">Viewing logs for <span className="text-white font-medium">{workflow.name}</span></p>
        </div>
        <Link 
          href={`/workflows/${id}`}
          className="px-4 py-2 bg-[color:var(--bg-surface)] border border-[color:var(--border-default)] rounded-lg text-sm text-[color:var(--text-primary)] hover:bg-zinc-800 transition-colors"
        >
          Back to Editor
        </Link>
      </div>

      <div className="bg-[color:var(--bg-surface)] border border-[color:var(--border-default)] rounded-2xl overflow-hidden">
        {(!executions || executions.length === 0) ? (
          <div className="p-12 text-center text-[color:var(--text-secondary)]">
            <Play className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No executions found yet.</p>
            <p className="text-sm mt-1">Click "Execute Workflow" in the editor or trigger the webhook to see logs here.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[color:var(--border-default)] bg-zinc-900/50">
                <th className="px-6 py-4 text-xs font-semibold text-[color:var(--text-secondary)] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-[color:var(--text-secondary)] uppercase tracking-wider">Trigger Data</th>
                <th className="px-6 py-4 text-xs font-semibold text-[color:var(--text-secondary)] uppercase tracking-wider">Started At</th>
                <th className="px-6 py-4 text-xs font-semibold text-[color:var(--text-secondary)] uppercase tracking-wider">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border-default)]">
              {executions.map((exec) => (
                <tr key={exec.id} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {exec.status === 'success' ? (
                      <span className="inline-flex items-center gap-1.5 text-green-400 bg-green-400/10 px-2.5 py-1 rounded-full text-xs font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Success
                      </span>
                    ) : exec.status === 'error' ? (
                      <span className="inline-flex items-center gap-1.5 text-red-400 bg-red-400/10 px-2.5 py-1 rounded-full text-xs font-medium">
                        <XCircle className="h-3.5 w-3.5" /> Failed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full text-xs font-medium">
                        <Clock className="h-3.5 w-3.5" /> Running
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 max-w-[200px] truncate text-sm text-[color:var(--text-secondary)]">
                    {JSON.stringify(exec.trigger_data)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--text-secondary)]">
                    {new Date(exec.started_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--text-secondary)]">
                    {formatDuration(exec.started_at, exec.finished_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
