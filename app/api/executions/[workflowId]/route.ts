import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    workflowId: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { workflowId } = await params;
  return NextResponse.json({ success: true, workflowId, executions: [] });
}
