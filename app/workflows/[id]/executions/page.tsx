interface ExecutionsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ExecutionsPage({ params }: ExecutionsPageProps) {
  const { id } = await params;
  return (
    <div className="flex-1 bg-black p-8 text-white">
      <h1 className="text-xl font-medium tracking-tight">Execution History</h1>
      <p className="text-sm text-zinc-400 mt-2">Logs for workflow: {id}</p>
    </div>
  );
}
