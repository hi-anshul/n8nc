'use client';

import { useState, useEffect } from 'react';

import { type Node } from '@xyflow/react';
import { useWorkflowStore } from '@/store/workflowStore';
import { SharedNodeHeader } from './SharedNodeHeader';

interface GeminiConfigFormProps {
  node: Node;
}

export function GeminiConfigForm({ node }: GeminiConfigFormProps) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const config = (node.data.config as Record<string, unknown>) || {};

  const credentialId = (config.credentialId as string) || '';
  const model = (config.model as string) || 'gemini-2.5-flash';
  const prompt = (config.prompt as string) || '';

  const [credentials, setCredentials] = useState<{ id: string; label: string }[]>([]);
  const [loadingCreds, setLoadingCreds] = useState(true);

  useEffect(() => {
    fetch('/api/credentials?service=gemini')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCredentials(data.filter((c) => c.service === 'gemini'));
        } else if (data.credentials) {
          setCredentials(data.credentials.filter((c: any) => c.service === 'gemini'));
        }
        setLoadingCreds(false);
      })
      .catch((err) => {
        console.error('Failed to fetch credentials', err);
        setLoadingCreds(false);
      });
  }, []);

  const updateConfig = (updates: Record<string, unknown>) => {
    updateNodeData(node.id, { config: { ...config, ...updates } });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <SharedNodeHeader node={node} />
      <div className="flex-1 overflow-auto pt-4 space-y-5 pb-8">
        
        {/* Core Settings */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Gemini Credential</label>
            <select
              value={credentialId}
              onChange={(e) => updateConfig({ credentialId: e.target.value })}
              disabled={loadingCreds}
              className="w-full h-8 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors disabled:opacity-50"
            >
              <option value="">Select a Gemini API Key...</option>
              {credentials.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Model</label>
            <select
              value={model}
              onChange={(e) => updateConfig({ model: e.target.value })}
              className="w-full h-8 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Prompt Template</label>
            <textarea
              value={prompt}
              onChange={(e) => updateConfig({ prompt: e.target.value })}
              className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors resize-none font-mono"
              placeholder="Write your prompt here... Use {{variable}} to inject data from triggers."
            />
            <p className="text-[10px] text-zinc-500">
              Example: "Summarize this email from {'{{Email}}'}: {'{{Message}}'}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
