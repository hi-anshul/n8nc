import { notFound } from 'next/navigation';
import { createClerkSupabaseServerClient } from '@/lib/supabase/server';
import { Workflow } from '@/types/workflow';
import WorkflowCanvas from '@/components/canvas/WorkflowCanvas';
import CanvasInitializer from '@/components/canvas/CanvasInitializer';
import CanvasTopBar from '@/components/canvas/CanvasTopBar';
import NodeConfigPanel from '@/components/canvas/NodeConfigPanel';
import { TriggerUrlBanner } from '@/components/canvas/TriggerUrlBanner';
import { Layers } from 'lucide-react';

interface WorkflowPageProps {
  params: Promise<{ id: string }>;
}

import NodeLibraryPanel from '@/components/canvas/NodeLibraryPanel';

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
          <TriggerUrlBanner />
        </div>

        <NodeConfigPanel />
      </div>
    </div>
  );
}
