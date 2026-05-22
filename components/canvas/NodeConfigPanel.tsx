'use client';

import { useWorkflowStore } from '@/store/workflowStore';
import { NotionConfigForm } from './forms/NotionConfigForm';
import { ConditionConfigForm } from './forms/ConditionConfigForm';
import { DelayConfigForm } from './forms/DelayConfigForm';
import { TriggerConfigForm } from './forms/TriggerConfigForm';

export default function NodeConfigPanel() {
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const nodes = useWorkflowStore((s) => s.nodes);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <div className="w-85 border-l border-zinc-800 bg-zinc-950 p-6 flex items-center justify-center text-center h-full shrink-0">
        <p className="text-sm text-zinc-500">Select a node to configure it.</p>
      </div>
    );
  }

  return (
    <div className="w-85 border-l border-zinc-800 bg-zinc-950 p-6 h-full shrink-0 overflow-y-auto">
      {selectedNode.type === 'notion_create_page' || selectedNode.type === 'notion_update_page' ? (
        <NotionConfigForm node={selectedNode} />
      ) : selectedNode.type === 'condition' ? (
        <ConditionConfigForm node={selectedNode} />
      ) : selectedNode.type === 'delay' ? (
        <DelayConfigForm node={selectedNode} />
      ) : selectedNode.type === 'form_trigger' ? (
        <TriggerConfigForm node={selectedNode} />
      ) : (
        <div className="text-sm text-zinc-500">Unknown node type.</div>
      )}
    </div>
  );
}
