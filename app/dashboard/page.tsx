import Link from 'next/link';
import { Plus, GitBranch, Zap, Clock, Copy } from 'lucide-react';
import { createClerkSupabaseServerClient } from '@/lib/supabase/server';
import { Workflow } from '@/types/workflow';
import { formatDistanceToNow } from 'date-fns';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return '—';
  }
}

function triggerUrl(slug: string | null): string | null {
  if (!slug) return null;
  const base = process.env.NEXT_PUBLIC_APP_URL ?? '';
  return `${base}/api/trigger/${slug}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium select-none',
        active
          ? 'bg-[color:var(--state-success)]/10 text-[color:var(--state-success)]'
          : 'bg-[color:var(--bg-elevated)] text-[color:var(--text-muted)]',
      ].join(' ')}
    >
      <span
        className={[
          'h-1.5 w-1.5 rounded-full',
          active ? 'bg-[color:var(--state-success)]' : 'bg-[color:var(--text-muted)]',
        ].join(' ')}
      />
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

function WorkflowRow({ workflow }: { workflow: Workflow }) {
  const url = triggerUrl(workflow.trigger_slug);

  return (
    <div className="group flex items-center gap-4 px-5 py-4 border-b border-[color:var(--border-soft)] hover:bg-[color:var(--bg-hover)] transition-colors duration-100 last:border-b-0">
      {/* Icon */}
      <div className="shrink-0 h-9 w-9 rounded-xl bg-[color:var(--bg-elevated)] border border-[color:var(--border-default)] flex items-center justify-center">
        <GitBranch className="h-4 w-4 text-[color:var(--text-secondary)]" />
      </div>

      {/* Name + trigger URL */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/workflows/${workflow.id}`}
          className="block text-sm font-medium text-[color:var(--text-primary)] hover:underline underline-offset-2 truncate"
        >
          {workflow.name}
        </Link>
        {url ? (
          <p className="mt-0.5 text-xs font-mono text-[color:var(--text-muted)] truncate">
            {url}
          </p>
        ) : (
          <p className="mt-0.5 text-xs text-[color:var(--text-muted)]">No trigger slug yet</p>
        )}
      </div>

      {/* Status */}
      <div className="shrink-0">
        <StatusBadge active={workflow.is_active} />
      </div>

      {/* Last updated */}
      <div className="shrink-0 hidden sm:flex items-center gap-1.5 text-xs text-[color:var(--text-muted)]">
        <Clock className="h-3.5 w-3.5" />
        {formatDate(workflow.updated_at)}
      </div>

      {/* Open link */}
      <Link
        href={`/workflows/${workflow.id}`}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-100 text-xs text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] px-3 py-1.5 rounded-lg border border-[color:var(--border-default)] hover:bg-[color:var(--bg-elevated)]"
      >
        Open
      </Link>
    </div>
  );
}

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
