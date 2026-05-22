import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    workflowId: string;
  }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { workflowId } = await params;
  return NextResponse.json({ success: true, workflowId, status: "executed" });
}
