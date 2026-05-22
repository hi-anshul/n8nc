'use client';

import { useState } from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import { Copy, Check, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TriggerUrlBanner() {
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const nodes = useWorkflowStore((s) => s.nodes);
  const triggerSlug = useWorkflowStore((s) => s.triggerSlug);
  const [copied, setCopied] = useState(false);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // Only show if the selected node is a trigger node
  if (selectedNode?.type !== 'form_trigger' || !triggerSlug) return null;

  // Since we're client side, we can construct the full URL
  const webhookUrl = `${window.location.origin}/api/trigger/${triggerSlug}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const curlCommand = `curl -X POST ${webhookUrl} \\
-H "Content-Type: application/json" \\
-d '{"name": "Sarah Chen", "email": "sarah@example.com"}'`;

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-[600px] max-w-[90%]">
      <div className="bg-zinc-950/90 border border-emerald-900/50 shadow-2xl rounded-2xl p-5 w-full backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-6 w-6 rounded bg-emerald-500/10 flex items-center justify-center shrink-0">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <h3 className="text-sm font-medium text-white">Webhook Trigger URL</h3>
        </div>
        
        <div className="flex gap-2 mb-4">
          <code className="flex-1 px-3 py-2 bg-black border border-zinc-800 rounded-lg text-xs font-mono text-zinc-300 overflow-x-auto whitespace-nowrap">
            <span className="text-zinc-500 mr-2">POST</span>
            {webhookUrl}
          </code>
          <button
            onClick={copyToClipboard}
            className={cn(
              "flex items-center gap-2 px-4 rounded-lg text-xs font-medium transition-colors border",
              copied 
                ? "bg-emerald-950 border-emerald-900 text-emerald-400" 
                : "bg-white border-white text-black hover:bg-zinc-200"
            )}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy URL"}
          </button>
        </div>

        <div className="bg-black border border-zinc-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="h-3.5 w-3.5 text-zinc-500" />
            <span className="text-xs font-medium text-zinc-500">Example Request</span>
          </div>
          <pre className="text-[11px] font-mono text-zinc-400 overflow-x-auto">
            {curlCommand}
          </pre>
        </div>
      </div>
    </div>
  );
}
