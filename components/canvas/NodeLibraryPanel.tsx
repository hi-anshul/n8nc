'use client';

import { Layers } from 'lucide-react';
import type { NodeType } from '@/types/workflow';

export default function NodeLibraryPanel() {
  const nodeTypes: { label: string; type: NodeType; color: string }[] = [
    { label: 'Form Trigger', type: 'form_trigger', color: 'bg-emerald-500' },
    { label: 'Create Page', type: 'notion_create_page', color: 'bg-blue-500' },
    { label: 'Update Page', type: 'notion_update_page', color: 'bg-blue-400' },
    { label: 'Condition', type: 'condition', color: 'bg-amber-500' },
    { label: 'Delay', type: 'delay', color: 'bg-zinc-500' },
  ];

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

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
            draggable
            onDragStart={(event) => onDragStart(event, n.type)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-xs font-medium text-zinc-400 cursor-grab select-none hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all duration-100"
          >
            <span className={`h-2 w-2 rounded-full shrink-0 ${n.color}`} />
            {n.label}
          </div>
        ))}
      </nav>
      <p className="px-4 py-3 text-[10px] text-zinc-700 border-t border-zinc-800">
        Drag nodes onto the canvas
      </p>
    </aside>
  );
}
