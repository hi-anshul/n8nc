interface WorkflowPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function WorkflowPage({ params }: WorkflowPageProps) {
  const { id } = await params;
  return (
    <div className="flex-1 bg-black p-8 text-white">
      <h1 className="text-xl font-medium tracking-tight">Workflow Canvas</h1>
      <p className="text-sm text-zinc-400 mt-2">Editing workflow: {id}</p>
    </div>
  );
}
