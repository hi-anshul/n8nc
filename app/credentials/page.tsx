import CredentialManager from '@/components/CredentialManager';
import { createClerkSupabaseServerClient } from '@/lib/supabase/server';
import { Credential } from '@/types/credential';

export default async function CredentialsPage() {
  const supabase = await createClerkSupabaseServerClient();

  const { data, error } = await supabase
    .from('credentials')
    .select('id, user_id, service, label, created_at')
    .order('created_at', { ascending: false });

  const credentials: Credential[] = error ? [] : (data ?? []);

  return (
    <div className="flex-1 bg-[color:var(--bg-base)] p-8 text-[color:var(--text-primary)]">
      <header className="mb-8 flex items-center justify-between border-b border-[color:var(--border-default)] pb-4">
        <h1 className="text-xl font-medium tracking-tight">Credentials</h1>
      </header>
      
      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl border border-[color:var(--state-error)]/20 bg-[color:var(--state-error)]/5 text-sm text-[color:var(--state-error)]">
          Failed to load credentials. Please refresh the page.
        </div>
      )}

      <CredentialManager initialCredentials={credentials} />
    </div>
  );
}
