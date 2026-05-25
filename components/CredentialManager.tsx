'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Credential } from '@/types/credential';
import { Key, Plus, Trash2, ShieldCheck, Loader2 } from 'lucide-react';

interface CredentialManagerProps {
  initialCredentials: Credential[];
}

export default function CredentialManager({ initialCredentials }: CredentialManagerProps) {
  const router = useRouter();
  const [credentials, setCredentials] = useState<Credential[]>(initialCredentials);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Test connection state
  const [testingId, setTestingId] = useState<string | null>(null);
  
  // Form state
  const [service, setService] = useState('notion');
  const [label, setLabel] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const res = await fetch('/api/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service,
          label,
          token,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save credential');
      }

      const newCred = await res.json();
      setCredentials([newCred, ...credentials]);
      setIsAdding(false);
      setLabel('');
      setToken('');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this credential? Workflows using it will fail.')) {
      return;
    }

    try {
      const res = await fetch(`/api/credentials/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      
      setCredentials(credentials.filter(c => c.id !== id));
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Failed to delete credential');
    }
  };

  const handleTestConnection = async (id: string) => {
    const dbId = prompt('To test, enter a Notion Database ID that this token has access to:');
    if (!dbId) return;

    setTestingId(id);
    try {
      const res = await fetch('/api/test-notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentialId: id, databaseId: dbId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Success! A test page was created in your Notion database.');
      } else {
        alert(`Failed to connect: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      
      {/* Header and Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[color:var(--text-primary)]">Integration Credentials</h2>
          <p className="text-xs text-[color:var(--text-muted)] mt-1">
            Securely store your API keys and tokens. They are encrypted at rest using AES-256-GCM.
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[color:var(--button-primary)] text-[color:var(--button-text)] text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Add Credential
          </button>
        )}
      </div>

      {/* Add Credential Form */}
      {isAdding && (
        <form onSubmit={handleSave} className="p-6 bg-[color:var(--bg-elevated)] border border-[color:var(--border-default)] rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-[color:var(--text-primary)] mb-2">
            <ShieldCheck className="h-4 w-4 text-[color:var(--state-success)]" />
            New Integration Credential
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[color:var(--text-secondary)] mb-1.5">
                Service
              </label>
              <select
                required
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full h-10 bg-[color:var(--bg-surface)] border border-[color:var(--border-default)] rounded-xl px-3 text-sm text-[color:var(--text-primary)] focus:outline-none focus:border-[color:var(--border-active)]"
              >
                <option value="notion">Notion</option>
                <option value="google_sheets">Google Sheets (Service Account)</option>
                <option value="gemini">Gemini API</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[color:var(--text-secondary)] mb-1.5">
                Label (e.g. "My Workspace")
              </label>
              <input
                type="text"
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full h-10 bg-[color:var(--bg-surface)] border border-[color:var(--border-default)] rounded-xl px-3 text-sm text-[color:var(--text-primary)] focus:outline-none focus:border-[color:var(--border-active)]"
                placeholder={service === 'notion' ? "My Notion Workspace" : service === 'gemini' ? "Personal API Key" : "My Google Cloud Account"}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[color:var(--text-secondary)] mb-1.5">
                {service === 'notion' ? 'Internal Integration Token' : service === 'gemini' ? 'Gemini API Key' : 'Service Account JSON'}
              </label>
              {service === 'google_sheets' ? (
                <textarea
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full h-32 bg-[color:var(--bg-surface)] border border-[color:var(--border-default)] rounded-xl p-3 text-xs text-[color:var(--text-primary)] focus:outline-none focus:border-[color:var(--border-active)] font-mono resize-none"
                  placeholder='{"type": "service_account", ...}'
                />
              ) : (
                <input
                  type="password"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full h-10 bg-[color:var(--bg-surface)] border border-[color:var(--border-default)] rounded-xl px-3 text-sm text-[color:var(--text-primary)] focus:outline-none focus:border-[color:var(--border-active)] font-mono"
                  placeholder={service === 'gemini' ? "AIzaSy..." : "secret_..."}
                />
              )}
              <p className="text-[10px] text-[color:var(--text-muted)] mt-1.5">
                Your credential is encrypted immediately and never exposed to the browser again.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-[color:var(--state-error)]/10 text-[color:var(--state-error)] text-xs rounded-lg border border-[color:var(--state-error)]/20">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[color:var(--border-soft)]">
            <button
              type="button"
              onClick={() => { setIsAdding(false); setError(null); }}
              className="px-4 py-2 text-sm font-medium text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[color:var(--button-primary)] text-[color:var(--button-text)] text-sm font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Credential'}
            </button>
          </div>
        </form>
      )}

      {/* List of Credentials */}
      <div className="bg-[color:var(--bg-surface)] border border-[color:var(--border-default)] rounded-2xl overflow-hidden">
        {credentials.length === 0 ? (
          <div className="p-8 text-center text-sm text-[color:var(--text-muted)]">
            No credentials saved yet.
          </div>
        ) : (
          <div className="divide-y divide-[color:var(--border-soft)]">
            {credentials.map((cred) => (
              <div key={cred.id} className="flex items-center justify-between p-4 hover:bg-[color:var(--bg-hover)] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-[color:var(--bg-elevated)] border border-[color:var(--border-default)] flex items-center justify-center shrink-0">
                    <Key className="h-4 w-4 text-[color:var(--text-secondary)]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-[color:var(--text-primary)]">{cred.label}</h4>
                    <p className="text-xs text-[color:var(--text-muted)] mt-0.5 capitalize">{cred.service} Integration</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTestConnection(cred.id)}
                    disabled={testingId === cred.id}
                    className="text-xs font-medium text-[color:var(--button-primary)] hover:text-[color:var(--button-primary)]/80 px-3 py-1.5 bg-[color:var(--button-primary)]/10 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    {testingId === cred.id ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                    {testingId === cred.id ? 'Testing...' : 'Test Connection'}
                  </button>
                  <button
                    onClick={() => handleDelete(cred.id)}
                    className="p-2 text-[color:var(--text-muted)] hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-colors"
                    title="Delete Credential"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
