'use client';

import { type Node } from '@xyflow/react';
import { SharedNodeHeader } from './SharedNodeHeader';
import { useWorkflowStore } from '@/store/workflowStore';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface GoogleSheetsTriggerConfigFormProps {
  node: Node;
}

export function GoogleSheetsTriggerConfigForm({ node }: GoogleSheetsTriggerConfigFormProps) {
  const triggerSlug = useWorkflowStore((s) => s.triggerSlug);
  const [copied, setCopied] = useState(false);
  const webhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/trigger/${triggerSlug}` : '';

  const appsScript = `function onEdit(e) {
  const url = "${webhookUrl}";
  
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
  const row = e.range.getRow();
  
  // Get headers (assuming row 1)
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const payload = {};
  headers.forEach((h, i) => {
    if (h) payload[h] = rowData[i];
  });
  
  UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  });
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(appsScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <SharedNodeHeader node={node} />
      <div className="flex-1 overflow-auto pt-4 space-y-5 pb-8">
        
        <div className="space-y-4">
          <p className="text-xs text-zinc-400 leading-relaxed">
            To trigger this workflow instantly when a row is edited in Google Sheets, add this Apps Script to your spreadsheet.
          </p>
          
          <ol className="text-xs text-zinc-400 space-y-2 list-decimal list-inside pl-1">
            <li>In Google Sheets, go to <strong>Extensions &gt; Apps Script</strong></li>
            <li>Paste the code below and save</li>
            <li>Go to <strong>Triggers</strong> (alarm clock icon) on the left</li>
            <li>Add trigger: choose <strong>onEdit</strong> for event type</li>
          </ol>

          <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden mt-4">
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900/50">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Code.gs</span>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-400 hover:text-white transition-colors"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy Code"}
              </button>
            </div>
            <pre className="p-3 text-[10px] font-mono text-zinc-300 overflow-x-auto leading-relaxed">
              {appsScript}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
