'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('clerk_user_id');
      if (rpcError) {
        setError(rpcError.message);
      } else {
        setUserId(data);
      }
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-black p-8 text-white">
      <header className="mb-8 flex items-center justify-between border-b border-zinc-800 pb-4">
        <h1 className="text-xl font-medium tracking-tight">Workflows</h1>
      </header>
      <div className="space-y-6">
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl max-w-md space-y-4">
          <h2 className="font-semibold text-lg">Test Supabase + Clerk Connection</h2>
          <p className="text-xs text-zinc-400">
            Click the button below to verify if your Clerk JWT is successfully sent and parsed by Supabase.
          </p>
          <button
            onClick={testConnection}
            disabled={loading}
            className="px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors text-sm disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Verify Clerk Session'}
          </button>
          
          {userId && (
            <div className="p-3 bg-zinc-950 border border-green-800/30 rounded-lg">
              <p className="text-xs text-green-400 font-medium">✓ Connection Successful!</p>
              <p className="text-xs text-zinc-300 mt-1 break-all">
                Clerk User ID in Supabase: <span className="font-mono text-white">{userId}</span>
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-zinc-950 border border-red-800/30 rounded-lg">
              <p className="text-xs text-red-400 font-medium">✗ Connection Failed</p>
              <p className="text-xs text-zinc-300 mt-1 break-all">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
