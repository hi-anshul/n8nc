import CredentialManager from '@/components/CredentialManager';

export default function CredentialsPage() {
  return (
    <div className="flex-1 bg-black p-8 text-white">
      <header className="mb-8 flex items-center justify-between border-b border-zinc-800 pb-4">
        <h1 className="text-xl font-medium tracking-tight">Credentials</h1>
      </header>
      <CredentialManager />
    </div>
  );
}
