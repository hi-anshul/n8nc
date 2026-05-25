'use client';

import { useState, useEffect } from 'react';

import { type Node } from '@xyflow/react';
import { useWorkflowStore } from '@/store/workflowStore';
import { SharedNodeHeader } from './SharedNodeHeader';
import { Plus, Trash2 } from 'lucide-react';

interface NotionConfigFormProps {
  node: Node;
}

interface FieldMapping {
  notionProperty: string;
  notionType: string;
  valueSource: 'trigger_field' | 'static';
  triggerField?: string;
  staticValue?: string;
}

export function NotionConfigForm({ node }: NotionConfigFormProps) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const config = (node.data.config as Record<string, unknown>) || {};

  const credentialId = (config.credentialId as string) || '';
  const databaseId = (config.databaseId as string) || '';
  const fieldMappings = (config.fieldMappings as FieldMapping[]) || [];

  const [credentials, setCredentials] = useState<{ id: string; label: string }[]>([]);
  const [loadingCreds, setLoadingCreds] = useState(true);

  useEffect(() => {
    fetch('/api/credentials')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCredentials(data);
        } else if (data.credentials) {
          setCredentials(data.credentials);
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

  const addMapping = () => {
    const newMapping: FieldMapping = {
      notionProperty: '',
      notionType: 'rich_text',
      valueSource: 'static',
      staticValue: '',
    };
    updateConfig({ fieldMappings: [...fieldMappings, newMapping] });
  };

  const updateMapping = (index: number, updates: Partial<FieldMapping>) => {
    const newMappings = [...fieldMappings];
    newMappings[index] = { ...newMappings[index], ...updates };
    updateConfig({ fieldMappings: newMappings });
  };

  const removeMapping = (index: number) => {
    const newMappings = fieldMappings.filter((_, i) => i !== index);
    updateConfig({ fieldMappings: newMappings });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <SharedNodeHeader node={node} />
      <div className="flex-1 overflow-auto pt-4 space-y-5 pb-8">
        
        {/* Core Settings */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Credential</label>
            <select
              value={credentialId}
              onChange={(e) => updateConfig({ credentialId: e.target.value })}
              disabled={loadingCreds}
              className="w-full h-8 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors disabled:opacity-50"
            >
              <option value="">Select a Notion credential...</option>
              {credentials.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Database ID</label>
            <input
              type="text"
              value={databaseId}
              onChange={(e) => updateConfig({ databaseId: e.target.value })}
              className="w-full h-8 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors"
              placeholder="e.g. 1a2b3c4d5e..."
            />
          </div>
        </div>

        {/* Field Mappings */}
        <div className="space-y-3 pt-2 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-400">Field Mappings</label>
            <button
              onClick={addMapping}
              className="flex items-center justify-center h-6 w-6 rounded bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          {fieldMappings.length === 0 ? (
            <p className="text-[11px] text-zinc-500 italic">No fields mapped yet.</p>
          ) : (
            <div className="space-y-3">
              {fieldMappings.map((mapping, idx) => (
                <div key={idx} className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={mapping.notionProperty}
                      onChange={(e) => updateMapping(idx, { notionProperty: e.target.value })}
                      placeholder="Property name"
                      className="flex-1 h-7 bg-zinc-900 border border-zinc-700 rounded-md px-2 text-xs text-white focus:outline-none focus:border-zinc-500"
                    />
                    <select
                      value={mapping.notionType}
                      onChange={(e) => updateMapping(idx, { notionType: e.target.value })}
                      className="w-24 h-7 bg-zinc-900 border border-zinc-700 rounded-md px-1 text-[11px] text-zinc-300 focus:outline-none"
                    >
                      <option value="title">Title</option>
                      <option value="rich_text">Text</option>
                      <option value="select">Select</option>
                      <option value="email">Email</option>
                      <option value="number">Number</option>
                    </select>
                    <button
                      onClick={() => removeMapping(idx)}
                      className="h-7 w-7 flex items-center justify-center text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={mapping.valueSource}
                      onChange={(e) => updateMapping(idx, { valueSource: e.target.value as 'static' | 'trigger_field' })}
                      className="w-24 h-7 bg-zinc-900 border border-zinc-700 rounded-md px-1 text-[11px] text-zinc-300 focus:outline-none"
                    >
                      <option value="static">Static</option>
                      <option value="trigger_field">Variable</option>
                    </select>
                    
                    {mapping.valueSource === 'static' ? (
                      <input
                        type="text"
                        value={mapping.staticValue || ''}
                        onChange={(e) => updateMapping(idx, { staticValue: e.target.value })}
                        placeholder="Value"
                        className="flex-1 h-7 bg-zinc-900 border border-zinc-700 rounded-md px-2 text-xs text-white focus:outline-none focus:border-zinc-500"
                      />
                    ) : (
                      <input
                        type="text"
                        value={mapping.triggerField || ''}
                        onChange={(e) => updateMapping(idx, { triggerField: e.target.value })}
                        placeholder="e.g. form.email"
                        className="flex-1 h-7 bg-zinc-900 border border-zinc-700 border-dashed rounded-md px-2 text-xs text-amber-400/90 focus:outline-none focus:border-amber-500/50"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
