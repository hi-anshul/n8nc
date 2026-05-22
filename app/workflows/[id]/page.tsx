import { notFound } from 'next/navigation';
import { createClerkSupabaseServerClient } from '@/lib/supabase/server';
import { Workflow } from '@/types/workflow';
import WorkflowCanvas from '@/components/canvas/WorkflowCanvas';
import CanvasInitializer from '@/components/canvas/CanvasInitializer';
import CanvasTopBar from '@/components/canvas/CanvasTopBar';
import NodeConfigPanel from '@/components/canvas/NodeConfigPanel';
import { Layers } from 'lucide-react';

interface WorkflowPageProps {
  params: Promise<{ id: string }>;
}

// ─── Node Library (left panel placeholder) ───────────────────────────────────

function NodeLibraryPanel() {
  const nodeTypes = [
    { label: 'Form Trigger', type: 'form_trigger', color: 'bg-emerald-500' },
    { label: 'Create Page', type: 'notion_create_page', color: 'bg-blue-500' },
    { label: 'Update Page', type: 'notion_update_page', color: 'bg-blue-400' },
    { label: 'Condition', type: 'condition', color: 'bg-amber-500' },
    { label: 'Delay', type: 'delay', color: 'bg-zinc-500' },
  ];

  return (
    <aside className="w-52 shrink-0 border-r border-zinc-800 bg-zinc-950 flex flex-col overflow-hidden">
      <div className="h-12 flex items-center gap-2 px-4 border-b border-zinc-800">
        <Layers className="h-4 w-4 text-zinc-500" />
        <span className="text-xs font-medium text-zinc-400">Nodes</span>
      </div>
      <nav className="flex-1 overflow-auto p-3 space-y-1">
        {nodeTypes.map((n) => (
          <div
            key={n.type}
            title={`Drag to add ${n.label}`}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-xs font-medium text-zinc-400 cursor-grab select-none hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all duration-100"
          >
            <span className={`h-2 w-2 rounded-full shrink-0 ${n.color}`} />
            {n.label}
          </div>
        ))}
      </nav>
      <p className="px-4 py-3 text-[10px] text-zinc-700 border-t border-zinc-800">
        Drag-to-add in Session 7
      </p>
    </aside>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function WorkflowPage({ params }: WorkflowPageProps) {
  const { id } = await params;
  const supabase = await createClerkSupabaseServerClient();

  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    notFound();
  }

  const workflow = data as Workflow;

  return (
    // Full-screen canvas layout — no padding, fills the main flex area
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Initializes Zustand store with server-fetched workflow */}
      <CanvasInitializer workflow={workflow} />

      {/* Top bar */}
      <CanvasTopBar workflowId={workflow.id} />

      {/* 3-column body */}
      <div className="flex flex-1 overflow-hidden">
        <NodeLibraryPanel />

        {/* Canvas — must have explicit height for ReactFlow to render */}
        <div className="flex-1 relative overflow-hidden">
          <WorkflowCanvas workflowId={workflow.id} />
        </div>

        <NodeConfigPanel />
      </div>
    </div>
  );
}
