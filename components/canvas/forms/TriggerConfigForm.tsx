'use client';

import { type Node } from '@xyflow/react';
import { SharedNodeHeader } from './SharedNodeHeader';

interface TriggerConfigFormProps {
  node: Node;
}

export function TriggerConfigForm({ node }: TriggerConfigFormProps) {
  return (
    <div className="flex flex-col h-full">
      <SharedNodeHeader node={node} />
      <div className="space-y-4 pt-4">
        <p className="text-xs text-zinc-500 leading-relaxed">
          This node triggers your workflow when a form is submitted to the unique webhook URL.
          <br /><br />
          The webhook URL is displayed at the bottom of the canvas when this node is selected.
        </p>
      </div>
    </div>
  );
}
