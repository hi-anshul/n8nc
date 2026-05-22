'use client';

import { useEffect } from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import { Workflow } from '@/types/workflow';

interface CanvasInitializerProps {
  workflow: Workflow;
}

/**
 * Invisible client component that hydrates the Zustand store
 * from the server-fetched workflow data, then resets on unmount.
 */
export default function CanvasInitializer({ workflow }: CanvasInitializerProps) {
  const loadWorkflow = useWorkflowStore((s) => s.loadWorkflow);
  const reset = useWorkflowStore((s) => s.reset);

  useEffect(() => {
    loadWorkflow(workflow.id, workflow.name, workflow.is_active, workflow.trigger_slug, workflow.graph);
    return () => reset();
  }, [workflow, loadWorkflow, reset]);

  return null;
}
