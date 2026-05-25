'use client';

import { useState, useEffect } from 'react';
import { type Node } from '@xyflow/react';
import { useWorkflowStore } from '@/store/workflowStore';
import { SharedNodeHeader } from './SharedNodeHeader';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface JsonTriggerConfigFormProps {
  node: Node;
}

export function JsonTriggerConfigForm({ node }: JsonTriggerConfigFormProps) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const config = (node.data.config as Record<string, unknown>) || {};
  const testData = (config.testData as string) || '';

  const [localVal, setLocalVal] = useState(testData);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Parse check for validation message
  useEffect(() => {
    if (!localVal.trim()) {
      setJsonError(null);
      return;
    }
    try {
      JSON.parse(localVal);
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message);
    }
  }, [localVal]);

  const handleChange = (val: string) => {
    setLocalVal(val);
    updateNodeData(node.id, { config: { ...config, testData: val } });
  };

  const handlePrettify = () => {
    if (!localVal.trim()) return;
    try {
      const parsed = JSON.parse(localVal);
      const pretty = JSON.stringify(parsed, null, 2);
      handleChange(pretty);
    } catch (err: any) {
      setJsonError(`Cannot format: ${err.message}`);
    }
  };

  const loadPlaceholder = () => {
    const placeholderObj = {
      name: "John Doe",
      email: "john@example.com",
      status: "active",
      attributes: {
        role: "admin",
        team: "engineering"
      }
    };
    handleChange(JSON.stringify(placeholderObj, null, 2));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <SharedNodeHeader node={node} />
      <div className="flex-1 overflow-auto pt-4 space-y-4 pb-8">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-400">JSON Payload</label>
            <div className="flex gap-2">
              {!localVal.trim() && (
                <button
                  onClick={loadPlaceholder}
                  className="text-[10px] text-zinc-500 hover:text-white px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded transition-colors"
                >
                  Insert Sample
                </button>
              )}
              {localVal.trim() && !jsonError && (
                <button
                  onClick={handlePrettify}
                  className="text-[10px] text-zinc-500 hover:text-white px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded transition-colors"
                >
                  Prettify
                </button>
              )}
            </div>
          </div>
          
          <textarea
            value={localVal}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full h-80 bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-green-400 focus:outline-none focus:border-zinc-600 transition-colors resize-none font-mono leading-relaxed"
            placeholder={'{\n  "name": "Jane Doe",\n  "email": "jane@example.com"\n}'}
          />

          {/* Validation Banner */}
          {localVal.trim() ? (
            jsonError ? (
              <div className="flex items-start gap-2 text-[10px] text-red-400 bg-red-950/20 border border-red-900/40 p-2.5 rounded-lg">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span className="leading-tight font-mono">{jsonError}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[10px] text-green-400 bg-green-950/20 border border-green-900/40 p-2.5 rounded-lg">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>Valid JSON configuration</span>
              </div>
            )
          ) : (
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              Define the key-value pairs that downstream nodes can read as variables.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
