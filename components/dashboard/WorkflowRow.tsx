'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GitBranch, Clock, Trash2 } from 'lucide-react';
import { Workflow } from '@/types/workflow';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';

function formatDate(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return '—';
  }
}

function triggerUrlPath(slug: string | null): string | null {
  if (!slug) return null;
  return `/api/trigger/${slug}`;
}

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

export default function WorkflowRow({ workflow }: { workflow: Workflow }) {
  const router = useRouter();
  const path = triggerUrlPath(workflow.trigger_slug);
  const [baseUrl, setBaseUrl] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Set the base URL after hydration to prevent hydration mismatch errors
  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const url = path && baseUrl ? `${baseUrl}${path}` : path;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this workflow? This cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/workflows/${workflow.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert('Failed to delete workflow.');
        setIsDeleting(false);
      }
    } catch (err) {
      console.error('Delete error', err);
      alert('Failed to delete workflow.');
      setIsDeleting(false);
    }
  };

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

      {/* Actions */}
      <div className="shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
        <Link
          href={`/workflows/${workflow.id}`}
          className="text-xs text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] px-3 py-1.5 rounded-lg border border-[color:var(--border-default)] hover:bg-[color:var(--bg-elevated)] transition-colors"
        >
          Open
        </Link>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-[color:var(--text-secondary)] hover:text-red-400 p-1.5 rounded-lg border border-transparent hover:border-red-900/50 hover:bg-red-900/10 transition-colors disabled:opacity-50"
          title="Delete Workflow"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
