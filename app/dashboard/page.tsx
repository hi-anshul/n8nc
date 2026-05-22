import Link from 'next/link';
import { Plus, GitBranch, Zap, Clock, Copy } from 'lucide-react';
import { createClerkSupabaseServerClient } from '@/lib/supabase/server';
import { Workflow } from '@/types/workflow';
import WorkflowRow from '@/components/dashboard/WorkflowRow';

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="h-14 w-14 rounded-2xl bg-[color:var(--bg-elevated)] border border-[color:var(--border-default)] flex items-center justify-center mb-5">
        <Zap className="h-6 w-6 text-[color:var(--text-muted)]" />
      </div>
      <h2 className="text-base font-semibold text-[color:var(--text-primary)] mb-2">
        No workflows yet
      </h2>
      <p className="text-sm text-[color:var(--text-muted)] max-w-xs mb-6">
        Create your first automation by describing it in plain English. AI will build the workflow for you.
      </p>
      <Link
        href="/workflows/new"
        className="inline-flex items-center gap-2 px-4 py-2 bg-[color:var(--button-primary)] text-[color:var(--button-text)] text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
      >
        <Plus className="h-4 w-4" />
        New Workflow
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClerkSupabaseServerClient();

  const { data, error } = await supabase
    .from('workflows')
    .select('id, user_id, name, description, is_active, trigger_slug, graph, created_at, updated_at')
    .order('updated_at', { ascending: false });

  const workflows: Workflow[] = error ? [] : (data ?? []);

  return (
    <div className="flex-1 flex flex-col h-full bg-[color:var(--bg-base)] overflow-auto">
      {/* Page header */}
      <header className="shrink-0 flex items-center justify-between px-8 py-5 border-b border-[color:var(--border-default)]">
        <div>
          <h1 className="text-base font-semibold text-[color:var(--text-primary)] tracking-tight">
            Workflows
          </h1>
          <p className="mt-0.5 text-xs text-[color:var(--text-muted)]">
            {workflows.length === 0
              ? 'No workflows yet'
              : `${workflows.length} workflow${workflows.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <Link
          href="/workflows/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[color:var(--button-primary)] text-[color:var(--button-text)] text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          New Workflow
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {error && (
          <div className="mx-8 mt-6 px-4 py-3 rounded-xl border border-[color:var(--state-error)]/20 bg-[color:var(--state-error)]/5 text-xs text-[color:var(--state-error)]">
            Failed to load workflows. Please refresh the page.
          </div>
        )}

        {workflows.length === 0 && !error ? (
          <EmptyState />
        ) : (
          <div className="mx-8 mt-6 rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--bg-surface)] overflow-hidden">
            {workflows.map((wf) => (
              <WorkflowRow key={wf.id} workflow={wf} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
